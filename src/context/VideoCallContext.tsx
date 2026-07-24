// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { AppState, AppStateStatus } from 'react-native';
// import {
//   createAgoraRtcEngine,
//   IRtcEngine,
//   IRtcEngineEventHandler,
//   ChannelProfileType,
//   ClientRoleType,
// } from 'react-native-agora';
// import { navigationRef } from '../navigation/navigationRef';
// import { popVideoCallAndGoToAppointments } from '../navigation/navigationUtils';
// import {
//   apiGetCallStatus,
//   apiGetCallToken,
//   apiPostCallEvent,
//   apiStartCall,
//   buildTokenInfo,
//   isRemoteParticipantLeft,
//   requestCallPermissions,
//   TokenInfo,
// } from '../services/videoCallApi';

// export type VideoCallParams = {
//   appointmentId: string;
//   /** Optional second id — consultation id when different from appointment id */
//   consultationId?: string;
//   role?: 'doctor' | 'patient';
//   otherPartyName?: string;
//   otherPartyImage?: string;
// };

// type ViewMode = 'idle' | 'fullscreen' | 'minimized';

// type VideoCallContextValue = {
//   callParams: VideoCallParams | null;
//   viewMode: ViewMode;
//   isCallActive: boolean;
//   loadingLabel: string;
//   isJoined: boolean;
//   remoteUid: number | null;
//   errorMsg: string | null;
//   isMuted: boolean;
//   isCameraOn: boolean;
//   isSpeakerOn: boolean;
//   isLocalViewBig: boolean;
//   callSeconds: number;
//   displayName: string;
//   initials: string;
//   otherPartyImage?: string;
//   startCall: (params: VideoCallParams) => Promise<void>;
//   minimizeCall: () => void;
//   expandCall: () => void;
//   endCall: () => Promise<void>;
//   retryCall: () => void;
//   toggleMute: () => void;
//   toggleCamera: () => void;
//   toggleSpeaker: () => void;
//   flipCamera: () => void;
//   swapViews: () => void;
//   formatDuration: (seconds: number) => string;
// };

// const VideoCallContext = createContext<VideoCallContextValue | null>(null);

// export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [callParams, setCallParams] = useState<VideoCallParams | null>(null);
//   const [viewMode, setViewMode] = useState<ViewMode>('idle');
//   const [loadingLabel, setLoadingLabel] = useState('Connecting to the consultation...');
//   const [isJoined, setIsJoined] = useState(false);
//   const [remoteUid, setRemoteUid] = useState<number | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(true);
//   const [isLocalViewBig, setIsLocalViewBig] = useState(false);
//   const [callSeconds, setCallSeconds] = useState(0);

//   const agoraEngineRef = useRef<IRtcEngine | null>(null);
//   const tokenInfoRef = useRef<TokenInfo | null>(null);
//   const endedByUserRef = useRef(false);
//   const sessionIdRef = useRef<string | undefined>(undefined);
//   const isSettingUpRef = useRef(false);
//   const appointmentIdRef = useRef<string | null>(null);
//   const appointmentIdCandidatesRef = useRef<string[]>([]);
//   const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const isJoinedRef = useRef(false);
//   const hadRemoteParticipantRef = useRef(false);
//   const endCallDueToRemoteRef = useRef<(reason?: string) => Promise<void>>(
//     async () => {},
//   );
//   const statusPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
//     null,
//   );
//   const statusPollFailuresRef = useRef(0);

//   const displayName =
//     callParams?.otherPartyName ||
//     (callParams?.role === 'patient' ? 'Doctor' : 'Patient');

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

//   const formatDuration = useCallback((totalSeconds: number) => {
//     const m = Math.floor(totalSeconds / 60)
//       .toString()
//       .padStart(2, '0');
//     const s = (totalSeconds % 60).toString().padStart(2, '0');
//     return `${m}:${s}`;
//   }, []);

//   const releaseAgoraEngine = useCallback(() => {
//     try {
//       agoraEngineRef.current?.leaveChannel();
//       agoraEngineRef.current?.unregisterEventHandler({} as IRtcEngineEventHandler);
//       agoraEngineRef.current?.release();
//     } catch (e) {
//       console.log('[Agora] Cleanup error:', e);
//     }
//     agoraEngineRef.current = null;
//   }, []);

//   const resetCallState = useCallback(() => {
//     setViewMode('idle');
//     setCallParams(null);
//     setIsJoined(false);
//     isJoinedRef.current = false;
//     setRemoteUid(null);
//     setErrorMsg(null);
//     setCallSeconds(0);
//     setIsMuted(false);
//     setIsCameraOn(true);
//     setIsSpeakerOn(true);
//     setIsLocalViewBig(false);
//     tokenInfoRef.current = null;
//     appointmentIdRef.current = null;
//     appointmentIdCandidatesRef.current = [];
//     sessionIdRef.current = undefined;
//     isSettingUpRef.current = false;
//     hadRemoteParticipantRef.current = false;
//     if (timerIntervalRef.current) {
//       clearInterval(timerIntervalRef.current);
//       timerIntervalRef.current = null;
//     }
//   }, []);

//   const navigateAwayFromCall = useCallback(() => {
//     if (!navigationRef.isReady()) {
//       return;
//     }
//     popVideoCallAndGoToAppointments(navigationRef);
//   }, []);

//   const getCallIds = useCallback((): string[] => {
//     const fromRef = appointmentIdCandidatesRef.current.filter(Boolean);
//     if (fromRef.length) {
//       return fromRef;
//     }
//     return appointmentIdRef.current ? [appointmentIdRef.current] : [];
//   }, []);

//   const endCallDueToRemote = useCallback(
//     async (reason = 'The doctor has ended the call.') => {
//       const callIds = getCallIds();
//       const appointmentId = callIds[0];
//       if (!appointmentId || endedByUserRef.current) {
//         return;
//       }

//       endedByUserRef.current = true;

//       releaseAgoraEngine();
//       resetCallState();
//       navigateAwayFromCall();
//     },
//     [navigateAwayFromCall, releaseAgoraEngine, resetCallState, getCallIds],
//   );

//   useEffect(() => {
//     endCallDueToRemoteRef.current = endCallDueToRemote;
//   }, [endCallDueToRemote]);

//   const joinAgoraChannel = useCallback(
//     async (tokenInfo: TokenInfo, _primaryId: string) => {
//       setLoadingLabel('Joining call...');

//       if (!agoraEngineRef.current) {
//         const agoraEngine = createAgoraRtcEngine();
//         agoraEngineRef.current = agoraEngine;

//         const eventHandler: IRtcEngineEventHandler = {
//           onJoinChannelSuccess: connection => {
//             setIsJoined(true);
//             isJoinedRef.current = true;
//             setErrorMsg(null);
//             const sessionId = connection?.channelId
//               ? `${connection.channelId}-${connection.localUid}`
//               : undefined;
//             sessionIdRef.current = sessionId;
//             const callIds = appointmentIdCandidatesRef.current.filter(Boolean);
//             if (callIds.length) {
//               apiPostCallEvent(callIds, 'joined', sessionId);
//             }
//           },
//           onUserJoined: (_connection, uid) => {
//             hadRemoteParticipantRef.current = true;
//             setRemoteUid(uid);
//           },
//           onUserOffline: (_connection, uid) => {
//             setRemoteUid(prev => (prev === uid ? null : prev));
//             if (hadRemoteParticipantRef.current && !endedByUserRef.current) {
//               endCallDueToRemoteRef.current(
//                 'The doctor has left the consultation.',
//               );
//             }
//           },
//           onLeaveChannel: () => {
//             setIsJoined(false);
//             isJoinedRef.current = false;
//             if (!endedByUserRef.current) {
//               const callIds = appointmentIdCandidatesRef.current.filter(Boolean);
//               if (callIds.length) {
//                 apiPostCallEvent(callIds, 'left', sessionIdRef.current);
//               }
//             }
//           },
//           onError: (err, msg) => {
//             if (err === 110 || err === 109) {
//               tokenInfoRef.current = null;
//             }
//             setErrorMsg(`Connection error (${err}): ${msg}`);
//           },
//           onConnectionStateChanged: (_connection, state, reason) => {
//             if (state === 5) {
//               setErrorMsg(
//                 `Connection failed (reason ${reason}). Token/App ID mismatch ho sakta hai.`,
//               );
//             }
//           },
//         };

//         agoraEngine.registerEventHandler(eventHandler);
//         agoraEngine.initialize({ appId: tokenInfo.appId });
//         agoraEngine.enableVideo();
//         agoraEngine.startPreview();

//         try {
//           // @ts-ignore
//           agoraEngine.setCameraZoomFactor(1);
//         } catch {
//           // optional on some devices
//         }
//       }

//       agoraEngineRef.current?.joinChannel(
//         tokenInfo.token,
//         tokenInfo.channelName,
//         tokenInfo.uid,
//         {
//           channelProfile: ChannelProfileType.ChannelProfileCommunication,
//           clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//         },
//       );
//     },
//     [],
//   );

//   const prepareAndJoin = useCallback(async () => {
//     const callIds = getCallIds();
//     if (!callIds.length || isSettingUpRef.current) {
//       return;
//     }
//     if (isJoinedRef.current && agoraEngineRef.current) {
//       return;
//     }

//     isSettingUpRef.current = true;
//     endedByUserRef.current = false;
//     hadRemoteParticipantRef.current = false;
//     setErrorMsg(null);

//     try {
//       const hasPermission = await requestCallPermissions();
//       if (!hasPermission) {
//         setErrorMsg('Camera/Mic permission denied — Settings allow camera.');
//         return;
//       }

//       setLoadingLabel('Checking consultation status...');
//       const statusRes = await apiGetCallStatus(...callIds);

//       if (statusRes?.call_status === 'ended') {
//         setErrorMsg('This consultation has already ended.');
//         return;
//       }

//       if (statusRes?.call_status === 'not_started') {
//         setLoadingLabel('Starting consultation...');
//         await apiStartCall(...callIds);
//       }

//       setLoadingLabel('Preparing secure connection...');
//       const cached = tokenInfoRef.current;
//       const now = Date.now();
//       let tokenInfo = cached;

//       if (!cached || cached.expiresAt <= now) {
//         const tokenRes = await apiGetCallToken(...callIds);
//         if (!tokenRes?.token || !tokenRes?.channel) {
//           throw new Error('Token response me token/channel is missing.');
//         }
//         tokenInfo = buildTokenInfo(tokenRes);
//         tokenInfoRef.current = tokenInfo;
//       }

//       if (tokenInfo) {
//         await joinAgoraChannel(tokenInfo, callIds[0]);
//       }
//     } catch (e: any) {
//       setErrorMsg(e?.message || 'Consultation start nahi ho payi. Dobara try karo.');
//     } finally {
//       isSettingUpRef.current = false;
//     }
//   }, [getCallIds, joinAgoraChannel]);

//   const startCall = useCallback(
//     async (params: VideoCallParams) => {
//       const primaryId =
//         typeof params.appointmentId === 'string'
//           ? params.appointmentId.trim()
//           : '';
//       const secondaryId =
//         typeof params.consultationId === 'string'
//           ? params.consultationId.trim()
//           : '';

//       if (!primaryId) {
//         setErrorMsg('Appointment id is missing — cannot start video call.');
//         return;
//       }

//       if (
//         appointmentIdRef.current === primaryId &&
//         (isJoinedRef.current || agoraEngineRef.current)
//       ) {
//         setCallParams({ ...params, appointmentId: primaryId, consultationId: secondaryId || undefined });
//         setViewMode('fullscreen');
//         return;
//       }

//       if (agoraEngineRef.current) {
//         releaseAgoraEngine();
//         resetCallState();
//       }

//       const normalizedParams = {
//         ...params,
//         appointmentId: primaryId,
//         consultationId: secondaryId || undefined,
//       };

//       setCallParams(normalizedParams);
//       setViewMode('fullscreen');
//       appointmentIdRef.current = primaryId;
//       appointmentIdCandidatesRef.current = [
//         primaryId,
//         secondaryId,
//       ].filter((id, index, list) => !!id && list.indexOf(id) === index) as string[];
//       await prepareAndJoin();
//     },
//     [prepareAndJoin, releaseAgoraEngine, resetCallState],
//   );

//   const minimizeCall = useCallback(() => {
//     if (!callParams) {
//       return;
//     }
//     setViewMode('minimized');
//   }, [callParams]);

//   const expandCall = useCallback(() => {
//     if (!callParams) {
//       return;
//     }
//     setViewMode('fullscreen');
//     if (navigationRef.isReady()) {
//       // @ts-expect-error nested stack screen
//       navigationRef.navigate('HomeStack', {
//         screen: 'PatientVideoCallScreen',
//         params: callParams,
//       });
//     }
//   }, [callParams]);

//   const endCall = useCallback(async () => {
//     const callIds = getCallIds();
//     endedByUserRef.current = true;

//     if (callIds.length) {
//       await apiPostCallEvent(callIds, 'left', sessionIdRef.current);
//     }

//     releaseAgoraEngine();
//     resetCallState();
//   }, [getCallIds, releaseAgoraEngine, resetCallState]);

//   const retryCall = useCallback(() => {
//     prepareAndJoin();
//   }, [prepareAndJoin]);

//   const toggleMute = useCallback(() => {
//     const next = !isMuted;
//     try {
//       agoraEngineRef.current?.muteLocalAudioStream(next);
//       setIsMuted(next);
//     } catch (e) {
//       console.log('[Agora] mute toggle error:', e);
//     }
//   }, [isMuted]);

//   const toggleCamera = useCallback(() => {
//     const next = !isCameraOn;
//     try {
//       agoraEngineRef.current?.muteLocalVideoStream(!next);
//       setIsCameraOn(next);
//     } catch (e) {
//       console.log('[Agora] camera toggle error:', e);
//     }
//   }, [isCameraOn]);

//   const toggleSpeaker = useCallback(() => {
//     const next = !isSpeakerOn;
//     try {
//       agoraEngineRef.current?.setEnableSpeakerphone(next);
//       setIsSpeakerOn(next);
//     } catch (e) {
//       console.log('[Agora] speaker toggle error:', e);
//     }
//   }, [isSpeakerOn]);

//   const flipCamera = useCallback(() => {
//     try {
//       agoraEngineRef.current?.switchCamera();
//     } catch (e) {
//       console.log('[Agora] switchCamera error:', e);
//     }
//   }, []);

//   const swapViews = useCallback(() => {
//     setIsLocalViewBig(prev => !prev);
//   }, []);

//   useEffect(() => {
//     const handleAppStateChange = (nextState: AppStateStatus) => {
//       if (
//         nextState === 'active' &&
//         appointmentIdRef.current &&
//         viewMode !== 'idle' &&
//         !isJoinedRef.current &&
//         !isSettingUpRef.current
//       ) {
//         prepareAndJoin();
//       }
//     };
//     const sub = AppState.addEventListener('change', handleAppStateChange);
//     return () => sub.remove();
//   }, [prepareAndJoin, viewMode]);

//   useEffect(() => {
//     if (remoteUid !== null) {
//       if (!timerIntervalRef.current) {
//         timerIntervalRef.current = setInterval(() => {
//           setCallSeconds(prev => prev + 1);
//         }, 1000);
//       }
//     } else if (timerIntervalRef.current) {
//       clearInterval(timerIntervalRef.current);
//       timerIntervalRef.current = null;
//     }

//     return () => {
//       if (timerIntervalRef.current) {
//         clearInterval(timerIntervalRef.current);
//         timerIntervalRef.current = null;
//       }
//     };
//   }, [remoteUid]);

//   useEffect(() => {
//     if (viewMode === 'idle' || !appointmentIdRef.current || !isJoined) {
//       if (statusPollIntervalRef.current) {
//         clearInterval(statusPollIntervalRef.current);
//         statusPollIntervalRef.current = null;
//       }
//       statusPollFailuresRef.current = 0;
//       return;
//     }

//     const pollRemoteStatus = async () => {
//       const callIds = getCallIds();
//       const appointmentId = callIds[0];
//       if (!appointmentId || endedByUserRef.current) {
//         return;
//       }

//       if (statusPollFailuresRef.current >= 3) {
//         return;
//       }

//       try {
//         const statusRes = await apiGetCallStatus(...callIds);
//         statusPollFailuresRef.current = 0;
//         const localRole = callParams?.role === 'doctor' ? 'doctor' : 'patient';

//         if (isRemoteParticipantLeft(statusRes, localRole)) {
//           await endCallDueToRemoteRef.current(
//             localRole === 'patient'
//               ? 'The doctor has ended the call.'
//               : 'The patient has left the call.',
//           );
//         }
//       } catch (e) {
//         statusPollFailuresRef.current += 1;
//         console.log('[API] call status poll failed:', e);
//       }
//     };

//     pollRemoteStatus();
//     statusPollIntervalRef.current = setInterval(pollRemoteStatus, 8000);

//     return () => {
//       if (statusPollIntervalRef.current) {
//         clearInterval(statusPollIntervalRef.current);
//         statusPollIntervalRef.current = null;
//       }
//       statusPollFailuresRef.current = 0;
//     };
//   }, [viewMode, isJoined, callParams?.role, getCallIds]);

//   const value = useMemo(
//     (): VideoCallContextValue => ({
//       callParams,
//       viewMode,
//       isCallActive: viewMode !== 'idle' && !!callParams,
//       loadingLabel,
//       isJoined,
//       remoteUid,
//       errorMsg,
//       isMuted,
//       isCameraOn,
//       isSpeakerOn,
//       isLocalViewBig,
//       callSeconds,
//       displayName,
//       initials,
//       otherPartyImage: callParams?.otherPartyImage,
//       startCall,
//       minimizeCall,
//       expandCall,
//       endCall,
//       retryCall,
//       toggleMute,
//       toggleCamera,
//       toggleSpeaker,
//       flipCamera,
//       swapViews,
//       formatDuration,
//     }),
//     [
//       callParams,
//       viewMode,
//       isJoined,
//       loadingLabel,
//       remoteUid,
//       errorMsg,
//       isMuted,
//       isCameraOn,
//       isSpeakerOn,
//       isLocalViewBig,
//       callSeconds,
//       displayName,
//       initials,
//       startCall,
//       minimizeCall,
//       expandCall,
//       endCall,
//       retryCall,
//       toggleMute,
//       toggleCamera,
//       toggleSpeaker,
//       flipCamera,
//       swapViews,
//       formatDuration,
//     ],
//   );

//   return (
//     <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>
//   );
// };

// export const useVideoCall = () => {
//   const ctx = useContext(VideoCallContext);
//   if (!ctx) {
//     throw new Error('useVideoCall must be used within VideoCallProvider');
//   }
//   return ctx;
// };

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
  const sessionIdRef = useRef<string | undefined>(undefined);
  const isSettingUpRef = useRef(false);
  const appointmentIdRef = useRef<string | null>(null);
  const callRoleRef = useRef<'doctor' | 'patient'>('patient');
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
