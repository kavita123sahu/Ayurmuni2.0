import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import { navigationRef } from '../navigation/navigationRef';
import {
  apiEndCall,
  apiGetCallStatus,
  apiGetCallToken,
  apiPostCallEvent,
  apiStartCall,
  buildTokenInfo,
  requestCallPermissions,
  TokenInfo,
} from '../services/videoCallApi';

export type VideoCallParams = {
  appointmentId: string;
  role?: 'doctor' | 'patient';
  otherPartyName?: string;
  otherPartyImage?: string;
};

type ViewMode = 'idle' | 'fullscreen' | 'minimized';

type VideoCallContextValue = {
  callParams: VideoCallParams | null;
  viewMode: ViewMode;
  isCallActive: boolean;
  loadingLabel: string;
  isJoined: boolean;
  remoteUid: number | null;
  errorMsg: string | null;
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeakerOn: boolean;
  isLocalViewBig: boolean;
  callSeconds: number;
  displayName: string;
  initials: string;
  otherPartyImage?: string;
  startCall: (params: VideoCallParams) => Promise<void>;
  minimizeCall: () => void;
  expandCall: () => void;
  endCall: () => Promise<void>;
  retryCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  flipCamera: () => void;
  swapViews: () => void;
  formatDuration: (seconds: number) => string;
};

const VideoCallContext = createContext<VideoCallContextValue | null>(null);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [callParams, setCallParams] = useState<VideoCallParams | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('idle');
  const [loadingLabel, setLoadingLabel] = useState('Connecting to the consultation...');
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isLocalViewBig, setIsLocalViewBig] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  const agoraEngineRef = useRef<IRtcEngine | null>(null);
  const tokenInfoRef = useRef<TokenInfo | null>(null);
  const endedByUserRef = useRef(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const isSettingUpRef = useRef(false);
  const appointmentIdRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isJoinedRef = useRef(false);

  const displayName =
    callParams?.otherPartyName ||
    (callParams?.role === 'patient' ? 'Doctor' : 'Patient');

  const initials = useMemo(
    () =>
      displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w.charAt(0).toUpperCase())
        .join(''),
    [displayName],
  );

  const formatDuration = useCallback((totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const releaseAgoraEngine = useCallback(() => {
    try {
      agoraEngineRef.current?.leaveChannel();
      agoraEngineRef.current?.unregisterEventHandler({} as IRtcEngineEventHandler);
      agoraEngineRef.current?.release();
    } catch (e) {
      console.log('[Agora] Cleanup error:', e);
    }
    agoraEngineRef.current = null;
  }, []);

  const resetCallState = useCallback(() => {
    setViewMode('idle');
    setCallParams(null);
    setIsJoined(false);
    isJoinedRef.current = false;
    setRemoteUid(null);
    setErrorMsg(null);
    setCallSeconds(0);
    setIsMuted(false);
    setIsCameraOn(true);
    setIsSpeakerOn(true);
    setIsLocalViewBig(false);
    tokenInfoRef.current = null;
    appointmentIdRef.current = null;
    sessionIdRef.current = undefined;
    isSettingUpRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const joinAgoraChannel = useCallback(
    async (tokenInfo: TokenInfo, appointmentId: string) => {
      setLoadingLabel('Joining call...');

      if (!agoraEngineRef.current) {
        const agoraEngine = createAgoraRtcEngine();
        agoraEngineRef.current = agoraEngine;

        const eventHandler: IRtcEngineEventHandler = {
          onJoinChannelSuccess: connection => {
            setIsJoined(true);
            isJoinedRef.current = true;
            setErrorMsg(null);
            const sessionId = connection?.channelId
              ? `${connection.channelId}-${connection.localUid}`
              : undefined;
            sessionIdRef.current = sessionId;
            apiPostCallEvent(appointmentId, 'joined', sessionId);
          },
          onUserJoined: (_connection, uid) => {
            setRemoteUid(uid);
          },
          onUserOffline: (_connection, uid) => {
            setRemoteUid(prev => (prev === uid ? null : prev));
          },
          onLeaveChannel: () => {
            setIsJoined(false);
            isJoinedRef.current = false;
            if (!endedByUserRef.current && appointmentIdRef.current) {
              apiPostCallEvent(
                appointmentIdRef.current,
                'left',
                sessionIdRef.current,
              );
            }
          },
          onError: (err, msg) => {
            if (err === 110 || err === 109) {
              tokenInfoRef.current = null;
            }
            setErrorMsg(`Connection error (${err}): ${msg}`);
          },
          onConnectionStateChanged: (_connection, state, reason) => {
            if (state === 5) {
              setErrorMsg(
                `Connection failed (reason ${reason}). Token/App ID mismatch ho sakta hai.`,
              );
            }
          },
        };

        agoraEngine.registerEventHandler(eventHandler);
        agoraEngine.initialize({ appId: tokenInfo.appId });
        agoraEngine.enableVideo();
        agoraEngine.startPreview();

        try {
          // @ts-ignore
          agoraEngine.setCameraZoomFactor(1);
        } catch {
          // optional on some devices
        }
      }

      agoraEngineRef.current?.joinChannel(
        tokenInfo.token,
        tokenInfo.channelName,
        tokenInfo.uid,
        {
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        },
      );
    },
    [],
  );

  const prepareAndJoin = useCallback(async () => {
    const appointmentId = appointmentIdRef.current;
    if (!appointmentId || isSettingUpRef.current) {
      return;
    }
    if (isJoinedRef.current && agoraEngineRef.current) {
      return;
    }

    isSettingUpRef.current = true;
    endedByUserRef.current = false;
    setErrorMsg(null);

    try {
      const hasPermission = await requestCallPermissions();
      if (!hasPermission) {
        setErrorMsg('Camera/Mic permission denied — Settings me jaake allow karo.');
        return;
      }

      setLoadingLabel('Checking consultation status...');
      const statusRes = await apiGetCallStatus(appointmentId);

      if (statusRes?.call_status === 'ended') {
        setErrorMsg('This consultation has already ended.');
        return;
      }

      if (statusRes?.call_status === 'not_started') {
        setLoadingLabel('Starting consultation...');
        await apiStartCall(appointmentId);
      }

      setLoadingLabel('Preparing secure connection...');
      const cached = tokenInfoRef.current;
      const now = Date.now();
      let tokenInfo = cached;

      if (!cached || cached.expiresAt <= now) {
        const tokenRes = await apiGetCallToken(appointmentId);
        if (!tokenRes?.token || !tokenRes?.channel) {
          throw new Error('Token response me token/channel missing hai.');
        }
        tokenInfo = buildTokenInfo(tokenRes);
        tokenInfoRef.current = tokenInfo;
      }

      if (tokenInfo) {
        await joinAgoraChannel(tokenInfo, appointmentId);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Consultation start nahi ho payi. Dobara try karo.');
    } finally {
      isSettingUpRef.current = false;
    }
  }, [joinAgoraChannel]);

  const startCall = useCallback(
    async (params: VideoCallParams) => {
      if (
        appointmentIdRef.current === params.appointmentId &&
        (isJoinedRef.current || agoraEngineRef.current)
      ) {
        setCallParams(params);
        setViewMode('fullscreen');
        return;
      }

      if (agoraEngineRef.current) {
        releaseAgoraEngine();
        resetCallState();
      }

      setCallParams(params);
      setViewMode('fullscreen');
      appointmentIdRef.current = params.appointmentId;
      await prepareAndJoin();
    },
    [prepareAndJoin, releaseAgoraEngine, resetCallState],
  );

  const minimizeCall = useCallback(() => {
    if (!callParams) {
      return;
    }
    setViewMode('minimized');
  }, [callParams]);

  const expandCall = useCallback(() => {
    if (!callParams) {
      return;
    }
    setViewMode('fullscreen');
    if (navigationRef.isReady()) {
      // @ts-expect-error nested stack screen
      navigationRef.navigate('HomeStack', {
        screen: 'PatientVideoCallScreen',
        params: callParams,
      });
    }
  }, [callParams]);

  const endCall = useCallback(async () => {
    const appointmentId = appointmentIdRef.current;
    endedByUserRef.current = true;

    if (appointmentId) {
      await apiPostCallEvent(appointmentId, 'left', sessionIdRef.current);
      try {
        await apiEndCall(appointmentId);
      } catch (e) {
        console.log('[API] end call failed:', e);
      }
    }

    releaseAgoraEngine();
    resetCallState();
  }, [releaseAgoraEngine, resetCallState]);

  const retryCall = useCallback(() => {
    prepareAndJoin();
  }, [prepareAndJoin]);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    try {
      agoraEngineRef.current?.muteLocalAudioStream(next);
      setIsMuted(next);
    } catch (e) {
      console.log('[Agora] mute toggle error:', e);
    }
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const next = !isCameraOn;
    try {
      agoraEngineRef.current?.muteLocalVideoStream(!next);
      setIsCameraOn(next);
    } catch (e) {
      console.log('[Agora] camera toggle error:', e);
    }
  }, [isCameraOn]);

  const toggleSpeaker = useCallback(() => {
    const next = !isSpeakerOn;
    try {
      agoraEngineRef.current?.setEnableSpeakerphone(next);
      setIsSpeakerOn(next);
    } catch (e) {
      console.log('[Agora] speaker toggle error:', e);
    }
  }, [isSpeakerOn]);

  const flipCamera = useCallback(() => {
    try {
      agoraEngineRef.current?.switchCamera();
    } catch (e) {
      console.log('[Agora] switchCamera error:', e);
    }
  }, []);

  const swapViews = useCallback(() => {
    setIsLocalViewBig(prev => !prev);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && appointmentIdRef.current && viewMode !== 'idle') {
        prepareAndJoin();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [prepareAndJoin, viewMode]);

  useEffect(() => {
    if (remoteUid !== null) {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setCallSeconds(prev => prev + 1);
        }, 1000);
      }
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [remoteUid]);

  const value = useMemo(
    (): VideoCallContextValue => ({
      callParams,
      viewMode,
      isCallActive: viewMode !== 'idle' && !!callParams,
      loadingLabel,
      isJoined,
      remoteUid,
      errorMsg,
      isMuted,
      isCameraOn,
      isSpeakerOn,
      isLocalViewBig,
      callSeconds,
      displayName,
      initials,
      otherPartyImage: callParams?.otherPartyImage,
      startCall,
      minimizeCall,
      expandCall,
      endCall,
      retryCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
      flipCamera,
      swapViews,
      formatDuration,
    }),
    [
      callParams,
      viewMode,
      isJoined,
      loadingLabel,
      remoteUid,
      errorMsg,
      isMuted,
      isCameraOn,
      isSpeakerOn,
      isLocalViewBig,
      callSeconds,
      displayName,
      initials,
      startCall,
      minimizeCall,
      expandCall,
      endCall,
      retryCall,
      toggleMute,
      toggleCamera,
      toggleSpeaker,
      flipCamera,
      swapViews,
      formatDuration,
    ],
  );

  return (
    <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const ctx = useContext(VideoCallContext);
  if (!ctx) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return ctx;
};
