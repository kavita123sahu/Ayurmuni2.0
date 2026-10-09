
//   const initials = useMemo(
//     () =>
//       displayName
//         .trim()
//         .split(/\s+/)
//         .slice(0, 2)
//         .map(w => w.charAt(0).toUpperCase())
//         .join(''),
//     [displayName],
//   );

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
import { popVideoCallAndGoToAppointments } from '../navigation/navigationUtils';
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
import { CallEvents, CALL_ENDED } from '../common/Utils';
import { activateKeepAwake, deactivateKeepAwake } from '../utils/keepAwake';

export type VideoCallParams = {
  appointmentId: string;
  consultationId?: string;
  role?: 'doctor' | 'patient';
  otherPartyName?: string;
  otherPartyImage?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
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

const formatVideoCallError = (error: any): string => {
  const rawMessage = String(
    error?.message ?? error?.data?.message ?? error?.data?.detail ?? '',
  ).trim();
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes('unauthorized') ||
    normalized.includes('not allowed') ||
    error?.status === 403
  ) {
    return 'Video call is not active yet. Please wait for the doctor to start the consultation.';
  }

  if (normalized.includes('not started') || normalized.includes('not_started')) {
    return 'The doctor has not started the video call yet. Please wait.';
  }

  if (rawMessage) {
    return rawMessage;
  }

  return 'Consultation start nahi ho payi. Dobara try karo.';
};

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
  const endingRemoteRef = useRef(false);
  const hadRemoteParticipantRef = useRef(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const isSettingUpRef = useRef(false);
  const appointmentIdRef = useRef<string | null>(null);
  const callRoleRef = useRef<'doctor' | 'patient'>('patient');
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isJoinedRef = useRef(false);
  const endCallDueToRemoteRef = useRef<(reason?: string) => Promise<void>>(
    async () => {},
  );

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
    hadRemoteParticipantRef.current = false;
    endingRemoteRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (statusPollIntervalRef.current) {
      clearInterval(statusPollIntervalRef.current);
      statusPollIntervalRef.current = null;
    }
  }, []);

  const navigateAwayFromCall = useCallback(() => {
    if (!navigationRef.isReady()) {
      return;
    }
    popVideoCallAndGoToAppointments(navigationRef);
  }, []);

  const endCallDueToRemote = useCallback(
    async (_reason = 'The doctor has ended the call.') => {
      if (endedByUserRef.current || endingRemoteRef.current) {
        return;
      }
      endingRemoteRef.current = true;
      endedByUserRef.current = true;

      const appointmentId = appointmentIdRef.current;
      if (appointmentId) {
        await apiPostCallEvent(appointmentId, 'left', sessionIdRef.current);
      }

      releaseAgoraEngine();
      resetCallState();
      CallEvents.emit(CALL_ENDED, { appointmentId, call_status: 'ended' });
      navigateAwayFromCall();
    },
    [navigateAwayFromCall, releaseAgoraEngine, resetCallState],
  );

  useEffect(() => {
    endCallDueToRemoteRef.current = endCallDueToRemote;
  }, [endCallDueToRemote]);

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
            hadRemoteParticipantRef.current = true;
            setRemoteUid(uid);
          },
          onUserOffline: (_connection, uid) => {
            setRemoteUid(prev => (prev === uid ? null : prev));
            if (hadRemoteParticipantRef.current && !endedByUserRef.current) {
              endCallDueToRemoteRef.current(
                'The doctor has ended the call.',
              );
            }
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
    endingRemoteRef.current = false;
    hadRemoteParticipantRef.current = false;
    setErrorMsg(null);

    try {
      const hasPermission = await requestCallPermissions();
      if (!hasPermission) {
        setErrorMsg('Camera/Mic permission denied — Settings me jaake allow karo.');
        return;
      }

      setLoadingLabel('Checking consultation status...');
      const statusRes = await apiGetCallStatus(appointmentId);
      console.log("sttaussssss", statusRes);
      const callStatus = String(statusRes?.call_status ?? '').toLowerCase();
      const role = callRoleRef.current;

      if (callStatus === 'ended') {
        setErrorMsg('This consultation has already ended.');
        return;
      }

      if (callStatus !== 'in_progress') {
        if (role === 'patient') {
          setErrorMsg(
            callStatus === 'not_started'
              ? 'The doctor has not started the video call yet. Please wait.'
              : 'Video call is not active right now. Please try again when the consultation starts.',
          );
          return;
        }

        if (callStatus === 'not_started') {
          setLoadingLabel('Starting consultation...');
          await apiStartCall(appointmentId);
        } else {
          setErrorMsg('Video call is not available for this appointment.');
          return;
        }
      }

      setLoadingLabel('Preparing secure connection...');

      const tokenRes = await apiGetCallToken(appointmentId);

      if (!tokenRes?.token || !tokenRes?.channel) {
        throw new Error('Token response me token/channel missing hai.');
      }

      const tokenInfo = buildTokenInfo(tokenRes);
      if (tokenInfo) {
        await joinAgoraChannel(tokenInfo, appointmentId);
      }
    } catch (e: any) {
      setErrorMsg(formatVideoCallError(e));
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
      callRoleRef.current = params.role ?? 'patient';
      await prepareAndJoin();
    },
    [prepareAndJoin, releaseAgoraEngine, resetCallState],
  );

  const minimizeCall = useCallback(() => {
    // Prefer appointment ref so minimize still works if callParams briefly lags
    if (!appointmentIdRef.current && !callParams) {
      return;
    }
    setViewMode('minimized');
  }, [callParams]);

  const expandCall = useCallback(() => {
    const params = callParams;
    if (!params?.appointmentId && !appointmentIdRef.current) {
      return;
    }
    setViewMode('fullscreen');
    if (navigationRef.isReady()) {
      try {
        navigationRef.navigate('HomeStack', {
          screen: 'PatientVideoCallScreen',
          params: params ?? {
            appointmentId: appointmentIdRef.current!,
            role: callRoleRef.current,
          },
        });
      } catch (e) {
        console.log('[VideoCall] expand navigate failed:', e);
      }
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
    CallEvents.emit(CALL_ENDED, { appointmentId, call_status: 'ended' });
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

  // Screen must never sleep while a call is connecting, full-screen or minimized.
  useEffect(() => {
    if (viewMode === 'idle') {
      deactivateKeepAwake();
      return;
    }
    activateKeepAwake();
    return () => deactivateKeepAwake();
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'idle' || !appointmentIdRef.current || !isJoined) {
      if (statusPollIntervalRef.current) {
        clearInterval(statusPollIntervalRef.current);
        statusPollIntervalRef.current = null;
      }
      return;
    }

    const pollRemoteStatus = async () => {
      const appointmentId = appointmentIdRef.current;
      if (!appointmentId || endedByUserRef.current) {
        return;
      }

      try {
        const statusRes = await apiGetCallStatus(appointmentId);
        const callStatus = String(statusRes?.call_status ?? '').toLowerCase();
        if (callStatus === 'ended' || callStatus === 'completed') {
          await endCallDueToRemoteRef.current(
            'The doctor has ended the call.',
          );
        }
      } catch (e) {
        console.log('[API] call status poll failed:', e);
      }
    };

    pollRemoteStatus();
    statusPollIntervalRef.current = setInterval(pollRemoteStatus, 5000);

    return () => {
      if (statusPollIntervalRef.current) {
        clearInterval(statusPollIntervalRef.current);
        statusPollIntervalRef.current = null;
      }
    };
  }, [viewMode, isJoined]);

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
