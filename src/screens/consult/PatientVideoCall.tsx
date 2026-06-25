// // import React, {
// //     useState,
// //     useEffect,
// //     useRef,
// //     useCallback,
// // } from 'react';
// // import {
// //     View,
// //     Text,
// //     TouchableOpacity,
// //     StyleSheet,
// //     ActivityIndicator,
// //     Modal,
// //     Alert,
// //     StatusBar,
// //     Platform,
// // } from 'react-native';
// // import {
// //     IRtcEngine,
// //     IRtcEngineEventHandler,
// // } from 'react-native-agora';
// // import axios from 'axios';
// // import {
// //     createAgoraRtcEngine,
// //     ChannelProfileType,
// //     ClientRoleType,
// //     RtcSurfaceView,
// //     VideoSourceType,
// // } from 'react-native-agora';

// // import { NativeModules } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // const engine = createAgoraRtcEngine();


// // // ─── Types ────────────────────────────────────────────────────────────────────

// // interface TokenData {
// //     app_id: string;
// //     token: string;
// //     channel: string;
// //     uid: number | null;
// // }

// // interface CallStatusData {
// //     call_status: 'not_started' | 'active' | 'ended';
// // }

// // type CallState = 'idle' | 'joining' | 'active' | 'ended';

// // interface PatientVideoCallProps {
// //     consultationId?: string;
// //     doctorName?: string;
// //     onCallEnd?: () => void;
// // }

// // // ─── Config ───────────────────────────────────────────────────────────────────

// // const API_BASE =
// //     'https://ba17-203-110-81-106.ngrok-free.app';

// // const TEST_CONFIG = {
// //     enabled: false,
// //     appId: '',
// //     token: '',
// //     channel: '',
// //     uid: null as number | null,
// // };


// // console.log(NativeModules);
// // console.log(
// //     'AGORAAAAAAAAAAAAAAAAAAAAA =>',
// //     NativeModules.AgoraRtcNg
// // );
// // // ─── Helpers ──────────────────────────────────────────────────────────────────

// // function getAccessToken(): string {
// //     return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgxODcxMDk1LCJpYXQiOjE3ODE3ODQ2OTYsImp0aSI6IjkyYWQ5YmU1Zjg1NjQyZmFiMGIyY2YxYzFkNzQwYTQ0IiwidXNlcl9pZCI6IjI4ZTQ4MTZjLTRiZjQtNDUwYS1iN2ZkLTkyZWUwOTc3MjU1YyIsInJvbGUiOiJjdXN0b21lciIsImN1c3RvbWVyX2lkIjoiNGI2NjA1ZDctY2EzZi00NDkzLTk5ZTMtYzdkYTNiNGMxMWI4IiwicGF0aWVudF9pZCI6ImRhMDEzZGYwLWM3MDAtNDE2MS1iNjNjLTBkOGVhOGEzZTM1YiIsInZlbmRvcl9pZCI6bnVsbCwiZG9jdG9yX2lkIjpudWxsfQ.Z4YWE6_lszCwMTXd_4zEp41fHR_a8x8gc2-CqiHDMUQ';
// // }


// // function authHeaders() {
// //     return {
// //         Authorization: `Bearer ${getAccessToken()}`,
// //         'ngrok-skip-browser-warning': 'true',
// //     };
// // }

// // function apiErrorMessage(err: any, fallback: string): string {
// //     return err?.response?.data?.message || err?.message || fallback;
// // }

// // function formatDuration(s: number): string {
// //     const mm = Math.floor(s / 60).toString().padStart(2, '0');
// //     const ss = (s % 60).toString().padStart(2, '0');
// //     return `${mm}:${ss}`;
// // }

// // // ─── API calls ────────────────────────────────────────────────────────────────

// // async function fetchCallStatus(consultationId: string): Promise<CallStatusData> {
// //     const response = await axios.get(
// //         `${API_BASE}/doctors/appointments/${consultationId}/call/status/`,
// //         { headers: authHeaders() },
// //     );
// //     if (response.data?.success && response.data?.data) {
// //         return response.data.data as CallStatusData;
// //     }
// //     throw new Error(response.data?.message || 'Failed to get call status');
// // }

// // async function markEnded(consultationId: string): Promise<void> {
// //     const response = await axios.post(
// //         `${API_BASE}/doctors/appointments/${consultationId}/call/end/`,
// //         {},
// //         { headers: authHeaders() },
// //     );
// //     if (!response.data?.success) {
// //         throw new Error(response.data?.message || 'Failed to end call');
// //     }
// // }

// // async function fetchAgoraToken(consultationId: string): Promise<TokenData> {
// //     if (TEST_CONFIG.enabled) {
// //         return {
// //             app_id: TEST_CONFIG.appId,
// //             token: TEST_CONFIG.token,
// //             channel: TEST_CONFIG.channel,
// //             uid: TEST_CONFIG.uid,
// //         };
// //     }
// //     const response = await axios.post(
// //         `${API_BASE}/doctors/appointments/${consultationId}/call/token/`,
// //         {},
// //         { headers: authHeaders() },
// //     );
// //     if (response.data?.success && response.data?.data) {
// //         return response.data.data as TokenData;
// //     }
// //     throw new Error(response.data?.message || 'Failed to get token');
// // }

// // // ─── Component ────────────────────────────────────────────────────────────────

// // export default function PatientVideoCall({
// //     consultationId = '4f34a05b-a4d1-4dec-acbe-46093c7c943d',
// //     doctorName = 'Doctor',
// //     onCallEnd,
// // }: PatientVideoCallProps) {
// //     const [callState, setCallState] = useState<CallState>('idle');
// //     const [isMuted, setIsMuted] = useState(false);
// //     const [isCameraOff, setIsCameraOff] = useState(false);
// //     const [doctorJoined, setDoctorJoined] = useState(false);
// //     const [duration, setDuration] = useState(0);
// //     const [error, setError] = useState<string | null>(null);
// //     const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
// //     const [remoteUid, setRemoteUid] = useState<number | null>(null);
// //     const [localUid, setLocalUid] = useState<number>(0);
// //     const [connectingStep, setConnectingStep] = useState(
// //         'Preparing consultation...'
// //     );

// //     const [speakerEnabled, setSpeakerEnabled] = useState(true);
// //     const engineRef = useRef<IRtcEngine | null>(null);
// //     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

// //     // ── Event handler ────────────────────────────────────────────────────────
// //     const eventHandler = useRef<IRtcEngineEventHandler>({
// //         onJoinChannelSuccess: (_connection, uid) => {
// //             console.log('Patient joined channel, uid:', uid);
// //             setLocalUid(uid);
// //             setCallState('active');
// //             timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
// //         },
// //         onUserJoined: (_connection, uid) => {
// //             console.log('Remote user joined:', uid);
// //             setRemoteUid(uid);
// //             setDoctorJoined(true);
// //         },
// //         onUserOffline: (_connection, uid) => {
// //             console.log('Remote user left:', uid);
// //             setRemoteUid(null);
// //             setDoctorJoined(false);
// //         },
// //         onError: (err, msg) => {
// //             console.error('Agora error:', err, msg);
// //             setError(`Connection error (${err}). Please try again.`);
// //         },
// //         onConnectionStateChanged: (_connection, state) => {
// //             console.log('Connection state changed:', state);
// //             // state 5 = FAILED
// //             if (state === 5) {
// //                 setError('Connection lost. Please check your network and try again.');
// //             }
// //         },
// //     });

// //     const switchCamera = useCallback(() => {
// //         engineRef.current?.switchCamera();
// //     }, []);

// //     const toggleSpeaker = useCallback(() => {
// //         engineRef.current?.setEnableSpeakerphone(!speakerEnabled);
// //         setSpeakerEnabled(prev => !prev);
// //     }, [speakerEnabled]);


// //     // ── Join ──────────────────────────────────────────────────────────────────
// //     const joinCall = useCallback(async () => {
// //         setCallState('joining');
// //         setError(null);

// //         try {
// //             if (!getAccessToken()) {
// //                 throw new Error('Please log in again — session token not found');
// //             }

// //             if (!TEST_CONFIG.enabled) {
// //                 setConnectingStep('Checking appointment');

// //                 const callStatus =
// //                     await fetchCallStatus(consultationId);

// //                 setConnectingStep('Generating secure room');

// //                 const tokenData =
// //                     await fetchAgoraToken(consultationId);

// //                 setConnectingStep('Connecting to doctor');

// //                 // engine.initialize(...);

// //                 setConnectingStep('Starting video');
// //                 if (callStatus.call_status === 'ended') {
// //                     throw new Error('This video call has already ended.');
// //                 }
// //                 if (callStatus.call_status === 'not_started') {
// //                     throw new Error(
// //                         'Please wait for the doctor to start the consultation.',
// //                     );
// //                 }
// //             }

// //             const tokenData = await fetchAgoraToken(consultationId);

// //             console.log("tokendataaaaaaaaaaaa", tokenData);



// //             if (!tokenData?.app_id || !tokenData?.channel || !tokenData?.token) {
// //                 throw new Error('Invalid token data received');
// //             }

// //             // Create engine
// //             const engine = createAgoraRtcEngine();
// //             engineRef.current = engine;

// //             engine.initialize({
// //                 appId: tokenData.app_id,
// //                 channelProfile:
// //                     ChannelProfileType.ChannelProfileCommunication,
// //             });


// //             engine.registerEventHandler(eventHandler.current);

// //             // Enable video
// //             engine.enableVideo();
// //             engine.startPreview();

// //             // Join channel
// //             engine.joinChannel(
// //                 tokenData.token,
// //                 tokenData.channel,
// //                 tokenData.uid ?? 0,
// //                 {
// //                     clientRoleType: ClientRoleType.ClientRoleBroadcaster,
// //                     publishMicrophoneTrack: true,
// //                     publishCameraTrack: true,
// //                     autoSubscribeAudio: true,
// //                     autoSubscribeVideo: true,
// //                 },
// //             );
// //         } catch (err: any) {
// //             const message = apiErrorMessage(
// //                 err,
// //                 'Could not join. Check your connection or credentials.',
// //             );
// //             setError(message);
// //             setCallState('idle');
// //         }
// //     }, [consultationId]);

// //     // ── Leave ─────────────────────────────────────────────────────────────────
// //     const leaveCall = useCallback(async () => {
// //         if (timerRef.current) {
// //             clearInterval(timerRef.current);
// //             timerRef.current = null;
// //         }
// //         setShowLeaveConfirm(false);

// //         const engine = engineRef.current;
// //         if (engine) {
// //             engine.leaveChannel();
// //             engine.stopPreview();
// //             engine.disableVideo();
// //             engine.unregisterEventHandler(eventHandler.current);
// //             engine.release();
// //             engineRef.current = null;
// //         }

// //         try {
// //             await markEnded(consultationId);
// //         } catch (e: any) {
// //             console.error('markEnded error:', e);
// //         }

// //         setCallState('ended');
// //         if (onCallEnd) onCallEnd();
// //     }, [consultationId, onCallEnd]);

// //     const toggleMic = useCallback(() => {
// //         const engine = engineRef.current;
// //         if (!engine) return;
// //         engine.muteLocalAudioStream(!isMuted);
// //         setIsMuted(m => !m);
// //     }, [isMuted]);

// //     const toggleCamera = useCallback(() => {
// //         const engine = engineRef.current;
// //         if (!engine) return;
// //         engine.muteLocalVideoStream(!isCameraOff);
// //         setIsCameraOff(c => !c);
// //     }, [isCameraOff]);

// //     // ── Cleanup on unmount ────────────────────────────────────────────────────
// //     useEffect(() => {
// //         return () => {
// //             if (timerRef.current) clearInterval(timerRef.current);
// //             const engine = engineRef.current;
// //             if (engine) {
// //                 engine.leaveChannel();
// //                 engine.stopPreview();
// //                 engine.release();
// //                 engineRef.current = null;
// //             }
// //         };
// //     }, []);

// //     // ── Ended screen ──────────────────────────────────────────────────────────
// //     if (callState === 'ended') {
// //         return (
// //             <SafeAreaView style={styles.safeArea}>
// //                 <View style={styles.statusBanner}>
// //                     <View style={styles.greenDot} />

// //                     <Text style={styles.statusText}>
// //                         {doctorJoined
// //                             ? 'Doctor Connected'
// //                             : 'Waiting For Doctor'}
// //                     </Text>
// //                 </View>
// //                 <View style={styles.endedContainer}>
// //                     <View style={styles.endedIconCircle}>
// //                         <Text style={styles.endedIcon}>✓</Text>
// //                     </View>
// //                     <Text style={styles.endedTitle}>Consultation Ended</Text>
// //                     <Text style={styles.endedDuration}>
// //                         Duration: {formatDuration(duration)}
// //                     </Text>
// //                     <TouchableOpacity
// //                         style={styles.closeButton}
// //                         onPress={() => {
// //                             setCallState('idle');
// //                             setDuration(0);
// //                             setDoctorJoined(false);
// //                             setRemoteUid(null);
// //                             setError(null);
// //                         }}>
// //                         <Text style={styles.closeButtonText}>Close</Text>
// //                     </TouchableOpacity>
// //                 </View>
// //             </SafeAreaView>
// //         );
// //     }

// //     // ── Main screen ───────────────────────────────────────────────────────────
// //     return (
// //         <SafeAreaView style={styles.safeArea}>
// //             <StatusBar barStyle="light-content" backgroundColor="#111827" />

// //             {/* Header */}
// //             <View style={styles.header}>
// //                 <View style={styles.headerLeft}>
// //                     <View style={styles.headerIcon}>
// //                         <Text style={styles.headerIconText}>🌿</Text>
// //                     </View>
// //                     <View>
// //                         <Text style={styles.headerTitle}>Video Consultation</Text>
// //                         <Text style={styles.headerSubtitle}>Patient View</Text>
// //                     </View>
// //                 </View>
// //                 {callState === 'active' && (
// //                     <View style={styles.timerBadge}>
// //                         <Text style={styles.timerText}>{formatDuration(duration)}</Text>
// //                     </View>
// //                 )}
// //             </View>

// //             {/* Video Area */}
// //             <View style={styles.videoContainer}>
// //                 {/* Remote video (doctor) */}
// //                 {callState === 'active' && remoteUid !== null ? (
// //                     <RtcSurfaceView
// //                         style={styles.remoteVideo}
// //                         canvas={{ uid: remoteUid, sourceType: VideoSourceType.VideoSourceRemote }}
// //                     />
// //                 ) : (
// //                     <View style={styles.remoteVideoPlaceholder} />
// //                 )}

// //                 {/* Waiting for doctor overlay */}
// //                 {callState === 'active' && !doctorJoined && (
// //                     <View style={styles.waitingOverlay}>
// //                         <View style={styles.waitingIconCircle}>
// //                             <Text style={styles.waitingIcon}>👥</Text>
// //                         </View>
// //                         <View style={styles.waitingCard}>
// //                             <Text style={styles.waitingDoctor}>
// //                                 Dr. {doctorName}
// //                             </Text>

// //                             <ActivityIndicator
// //                                 size="large"
// //                                 color="#0D614E"
// //                             />

// //                             <Text style={styles.waitingTitle}>
// //                                 Doctor has been notified
// //                             </Text>

// //                             <Text style={styles.waitingSubtitle}>
// //                                 Waiting for consultation to begin
// //                             </Text>
// //                         </View>
// //                     </View>
// //                 )}

// //                 {/* Idle / joining overlay */}
// //                 {callState !== 'active' && (
// //                     <View style={styles.idleOverlay}>
// //                         <Text style={styles.idleIcon}>📹</Text>
// //                         {callState === 'joining' ? (
// //                             <>
// //                                 <ActivityIndicator
// //                                     size="large"
// //                                     color="#0D614E"
// //                                     style={{ marginBottom: 12 }}
// //                                 />
// //                                 <Text style={styles.idleText}> {connectingStep}
// //                                     ...</Text>
// //                             </>
// //                         ) : (
// //                             <>
// //                                 <Text style={styles.idleText}>Ready to join consultation</Text>
// //                                 <TouchableOpacity
// //                                     style={styles.joinButton}
// //                                     onPress={joinCall}
// //                                     activeOpacity={0.85}>
// //                                     <Text style={styles.joinButtonIcon}>📞 </Text>
// //                                     <Text style={styles.joinButtonText}>Join Consultation</Text>
// //                                 </TouchableOpacity>
// //                             </>
// //                         )}

// //                         {error && (
// //                             <View style={styles.errorBanner}>
// //                                 <Text style={styles.errorIcon}>⚠️ </Text>
// //                                 <Text style={styles.errorText}>{error}</Text>
// //                             </View>
// //                         )}
// //                     </View>
// //                 )}

// //                 {/* Doctor connected badge */}
// //                 {doctorJoined && callState === 'active' && (
// //                     <View style={styles.doctorBadge}>
// //                         <Text style={styles.doctorBadgeText}>✓ Doctor Connected</Text>
// //                     </View>
// //                 )}

// //                 {/* Doctor name tag */}
// //                 {doctorJoined && (
// //                     <View style={styles.doctorNameTag}>
// //                         <Text style={styles.doctorNameTagText}>Dr. {doctorName}</Text>
// //                     </View>
// //                 )}

// //                 {/* Local video PiP */}
// //                 {callState === 'active' && (
// //                     <View style={styles.localVideoContainer}>
// //                         {isCameraOff ? (
// //                             <View style={styles.cameraOffPlaceholder}>
// //                                 <Text style={styles.cameraOffIcon}>📵</Text>
// //                             </View>
// //                         ) : (
// //                             <RtcSurfaceView
// //                                 style={styles.localVideo}
// //                                 canvas={{
// //                                     uid: localUid,
// //                                     sourceType: VideoSourceType.VideoSourceCamera,
// //                                 }}
// //                             />
// //                         )}
// //                         <View style={styles.youLabel}>
// //                             <Text style={styles.youLabelText}>
// //                                 You{isMuted ? ' (Muted)' : ''}
// //                             </Text>
// //                         </View>
// //                     </View>
// //                 )}
// //             </View>

// //             {/* Controls */}
// //             {callState === 'active' && (
// //                 <View style={styles.controlsBar}>

// //                     <TouchableOpacity
// //                         style={styles.roundControl}
// //                         onPress={toggleMic}>
// //                         <Text>
// //                             {isMuted ? '🔇' : '🎤'}
// //                         </Text>
// //                     </TouchableOpacity>

// //                     <TouchableOpacity
// //                         style={styles.roundControl}
// //                         onPress={toggleCamera}>
// //                         <Text>
// //                             {isCameraOff ? '📵' : '📷'}
// //                         </Text>
// //                     </TouchableOpacity>

// //                     <TouchableOpacity
// //                         style={styles.roundControl}
// //                         onPress={switchCamera}>
// //                         <Text>🔄</Text>
// //                     </TouchableOpacity>

// //                     <TouchableOpacity
// //                         style={styles.roundControl}
// //                         onPress={toggleSpeaker}>
// //                         <Text>
// //                             {speakerEnabled ? '🔊' : '🔈'}
// //                         </Text>
// //                     </TouchableOpacity>

// //                     <TouchableOpacity
// //                         style={styles.endCallButton}
// //                         onPress={() =>
// //                             setShowLeaveConfirm(true)
// //                         }>
// //                         <Text>📞</Text>
// //                     </TouchableOpacity>

// //                 </View>
// //             )}

// //             {/* Leave Confirm Modal */}
// //             <Modal
// //                 visible={showLeaveConfirm}
// //                 transparent
// //                 animationType="fade"
// //                 onRequestClose={() => setShowLeaveConfirm(false)}>
// //                 <View style={styles.modalOverlay}>
// //                     <View style={styles.modalCard}>
// //                         <Text style={styles.modalTitle}>End Consultation?</Text>
// //                         <Text style={styles.modalMessage}>
// //                             Are you sure you want to leave the consultation?
// //                         </Text>
// //                         <View style={styles.modalActions}>
// //                             <TouchableOpacity
// //                                 style={styles.modalCancelButton}
// //                                 onPress={() => setShowLeaveConfirm(false)}>
// //                                 <Text style={styles.modalCancelText}>Cancel</Text>
// //                             </TouchableOpacity>
// //                             <TouchableOpacity
// //                                 style={styles.modalLeaveButton}
// //                                 onPress={leaveCall}>
// //                                 <Text style={styles.modalLeaveText}>Leave Call</Text>
// //                             </TouchableOpacity>
// //                         </View>
// //                     </View>
// //                 </View>
// //             </Modal>
// //         </SafeAreaView>
// //     );
// // }

// // // ─── Styles ───────────────────────────────────────────────────────────────────

// // const BRAND = '#0D614E';
// // const BRAND_DARK = '#0a4d3e';

// // const styles = StyleSheet.create({
// //     safeArea: {
// //         flex: 1,
// //         backgroundColor: '#111827',
// //     },
// //     statusBanner: {
// //         position: 'absolute',
// //         top: 12,
// //         alignSelf: 'center',
// //         flexDirection: 'row',
// //         backgroundColor: 'rgba(0,0,0,0.5)',
// //         paddingHorizontal: 12,
// //         paddingVertical: 8,
// //         borderRadius: 20,
// //         zIndex: 999
// //     },

// //     greenDot: {
// //         width: 8,
// //         height: 8,
// //         borderRadius: 4,
// //         backgroundColor: '#22C55E',
// //         marginRight: 8,
// //         marginTop: 5
// //     },

// //     statusText: {
// //         color: '#fff'
// //     },

// //     // ── Header
// //     header: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         paddingHorizontal: 16,
// //         paddingVertical: 12,
// //         backgroundColor: 'rgba(255,255,255,0.08)',
// //         borderBottomWidth: 1,
// //         borderBottomColor: 'rgba(255,255,255,0.06)',
// //     },
// //     headerLeft: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 10,
// //     },
// //     headerIcon: {
// //         width: 40,
// //         height: 40,
// //         borderRadius: 10,
// //         backgroundColor: BRAND,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         marginRight: 10,
// //     },
// //     headerIconText: { fontSize: 20 },
// //     headerTitle: {
// //         fontSize: 17,
// //         fontWeight: '700',
// //         color: '#FFFFFF',
// //     },
// //     headerSubtitle: {
// //         fontSize: 12,
// //         color: '#9CA3AF',
// //         marginTop: 1,
// //     },
// //     timerBadge: {
// //         paddingHorizontal: 12,
// //         paddingVertical: 6,
// //         backgroundColor: 'rgba(255,255,255,0.10)',
// //         borderRadius: 8,
// //     },
// //     timerText: {
// //         color: '#FFFFFF',
// //         fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
// //         fontSize: 14,
// //         fontWeight: '600',
// //     },

// //     // ── Video container
// //     videoContainer: {
// //         flex: 1,
// //         backgroundColor: '#030712',
// //         position: 'relative',
// //     },
// //     remoteVideo: {
// //         ...StyleSheet.absoluteFillObject,
// //     },
// //     remoteVideoPlaceholder: {
// //         ...StyleSheet.absoluteFillObject,
// //         backgroundColor: '#030712',
// //     },

// //     // ── Waiting overlay
// //     waitingOverlay: {
// //         ...StyleSheet.absoluteFillObject,
// //         backgroundColor: 'rgba(3,7,18,0.88)',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         zIndex: 10,
// //     },
// //     waitingIconCircle: {
// //         width: 80,
// //         height: 80,
// //         borderRadius: 40,
// //         backgroundColor: 'rgba(255,255,255,0.08)',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         marginBottom: 16,
// //     },
// //     waitingIcon: { fontSize: 36 },
// //     waitingText: {
// //         color: '#9CA3AF',
// //         fontSize: 16,
// //     },

// //     waitingCard: {
// //         alignItems: 'center'
// //     },

// //     waitingDoctor: {
// //         color: '#fff',
// //         fontSize: 24,
// //         fontWeight: '700',
// //         marginBottom: 20
// //     },

// //     waitingTitle: {
// //         color: '#fff',
// //         fontSize: 18,
// //         fontWeight: '600',
// //         marginTop: 20
// //     },

// //     waitingSubtitle: {
// //         color: '#9CA3AF',
// //         marginTop: 8
// //     }
// //     ,
// //     // ── Idle overlay
// //     idleOverlay: {
// //         ...StyleSheet.absoluteFillObject,
// //         backgroundColor: '#030712',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         zIndex: 10,
// //         paddingHorizontal: 24,
// //     },
// //     idleIcon: { fontSize: 48, marginBottom: 16 },
// //     idleText: {
// //         color: '#9CA3AF',
// //         fontSize: 16,
// //         marginBottom: 24,
// //         textAlign: 'center',
// //     },
// //     joinButton: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         backgroundColor: BRAND,
// //         paddingHorizontal: 28,
// //         paddingVertical: 14,
// //         borderRadius: 14,
// //         marginBottom: 16,
// //     },
// //     joinButtonIcon: { fontSize: 16 },
// //     joinButtonText: {
// //         color: '#FFFFFF',
// //         fontWeight: '700',
// //         fontSize: 16,
// //     },
// //     errorBanner: {
// //         flexDirection: 'row',
// //         alignItems: 'flex-start',
// //         backgroundColor: 'rgba(239,68,68,0.15)',
// //         borderRadius: 10,
// //         paddingHorizontal: 14,
// //         paddingVertical: 10,
// //         marginTop: 8,
// //         maxWidth: 340,
// //     },
// //     errorIcon: { fontSize: 14, marginRight: 6, marginTop: 1 },
// //     errorText: {
// //         color: '#F87171',
// //         fontSize: 13,
// //         flex: 1,
// //     },

// //     // ── Badges
// //     doctorBadge: {
// //         position: 'absolute',
// //         top: 12,
// //         right: 12,
// //         backgroundColor: 'rgba(16,185,129,0.90)',
// //         borderRadius: 8,
// //         paddingHorizontal: 10,
// //         paddingVertical: 5,
// //         zIndex: 20,
// //     },
// //     doctorBadgeText: {
// //         color: '#FFFFFF',
// //         fontSize: 12,
// //         fontWeight: '600',
// //     },
// //     doctorNameTag: {
// //         position: 'absolute',
// //         bottom: 12,
// //         left: 12,
// //         backgroundColor: 'rgba(0,0,0,0.55)',
// //         borderRadius: 8,
// //         paddingHorizontal: 10,
// //         paddingVertical: 5,
// //         zIndex: 20,
// //     },
// //     doctorNameTagText: {
// //         color: '#FFFFFF',
// //         fontSize: 13,
// //     },

// //     // ── Local PiP
// //     localVideoContainer: {
// //         position: 'absolute',
// //         bottom: 12,
// //         right: 12,
// //         width: 110,
// //         aspectRatio: 9 / 16,
// //         borderRadius: 10,
// //         overflow: 'hidden',
// //         borderWidth: 2,
// //         borderColor: 'rgba(255,255,255,0.20)',
// //         backgroundColor: '#1F2937',
// //         zIndex: 20,
// //     },
// //     localVideo: {
// //         width: '100%',
// //         height: '100%',
// //     },
// //     cameraOffPlaceholder: {
// //         flex: 1,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         backgroundColor: '#1F2937',
// //     },
// //     cameraOffIcon: { fontSize: 24 },
// //     youLabel: {
// //         position: 'absolute',
// //         bottom: 4,
// //         left: 4,
// //         backgroundColor: 'rgba(0,0,0,0.55)',
// //         borderRadius: 4,
// //         paddingHorizontal: 6,
// //         paddingVertical: 2,
// //     },
// //     youLabelText: {
// //         color: '#FFFFFF',
// //         fontSize: 9,
// //     },

// //     // ── Controls bar
// //     controlsBar: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         gap: 10,
// //         paddingHorizontal: 16,
// //         paddingVertical: 12,
// //         backgroundColor: 'rgba(255,255,255,0.07)',
// //         borderTopWidth: 1,
// //         borderTopColor: 'rgba(255,255,255,0.06)',
// //     },
// //     controlButton: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 6,
// //         paddingHorizontal: 16,
// //         paddingVertical: 10,
// //         borderRadius: 12,
// //         backgroundColor: 'rgba(255,255,255,0.10)',
// //         minWidth: 90,
// //         justifyContent: 'center',
// //     },
// //     controlButtonActive: {
// //         backgroundColor: '#EF4444',
// //     },
// //     roundControl: {
// //         width: 58,
// //         height: 58,
// //         borderRadius: 29,
// //         backgroundColor: 'rgba(255,255,255,0.15)',
// //         alignItems: 'center',
// //         justifyContent: 'center'
// //     },

// //     endCallButton: {
// //         width: 64,
// //         height: 64,
// //         borderRadius: 32,
// //         backgroundColor: '#EF4444',
// //         alignItems: 'center',
// //         justifyContent: 'center'
// //     },
// //     leaveButton: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 6,
// //         paddingHorizontal: 16,
// //         paddingVertical: 10,
// //         borderRadius: 12,
// //         backgroundColor: '#EF4444',
// //         minWidth: 90,
// //         justifyContent: 'center',
// //     },
// //     controlButtonIcon: { fontSize: 16 },
// //     controlButtonText: {
// //         color: '#FFFFFF',
// //         fontWeight: '600',
// //         fontSize: 13,
// //     },

// //     // ── Ended screen
// //     endedContainer: {
// //         flex: 1,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         paddingHorizontal: 32,
// //     },
// //     endedIconCircle: {
// //         width: 80,
// //         height: 80,
// //         borderRadius: 40,
// //         backgroundColor: 'rgba(16,185,129,0.15)',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         marginBottom: 20,
// //     },
// //     endedIcon: { fontSize: 36, color: '#34D399' },
// //     endedTitle: {
// //         fontSize: 24,
// //         fontWeight: '700',
// //         color: '#FFFFFF',
// //         marginBottom: 8,
// //     },
// //     endedDuration: {
// //         fontSize: 15,
// //         color: '#9CA3AF',
// //         marginBottom: 28,
// //     },
// //     closeButton: {
// //         paddingHorizontal: 32,
// //         paddingVertical: 12,
// //         backgroundColor: BRAND,
// //         borderRadius: 12,
// //     },
// //     closeButtonText: {
// //         color: '#FFFFFF',
// //         fontWeight: '700',
// //         fontSize: 15,
// //     },

// //     // ── Modal
// //     modalOverlay: {
// //         flex: 1,
// //         backgroundColor: 'rgba(0,0,0,0.70)',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     modalCard: {
// //         backgroundColor: '#1F2937',
// //         borderRadius: 20,
// //         padding: 24,
// //         width: '85%',
// //         maxWidth: 360,
// //     },
// //     modalTitle: {
// //         fontSize: 20,
// //         fontWeight: '700',
// //         color: '#FFFFFF',
// //         marginBottom: 8,
// //     },
// //     modalMessage: {
// //         fontSize: 14,
// //         color: '#9CA3AF',
// //         marginBottom: 24,
// //         lineHeight: 20,
// //     },
// //     modalActions: {
// //         flexDirection: 'row',
// //         gap: 10,
// //     },
// //     modalCancelButton: {
// //         flex: 1,
// //         paddingVertical: 12,
// //         borderRadius: 10,
// //         backgroundColor: '#374151',
// //         alignItems: 'center',
// //     },
// //     modalCancelText: {
// //         color: '#FFFFFF',
// //         fontWeight: '600',
// //         fontSize: 14,
// //     },
// //     modalLeaveButton: {
// //         flex: 1,
// //         paddingVertical: 12,
// //         borderRadius: 10,
// //         backgroundColor: '#EF4444',
// //         alignItems: 'center',
// //     },
// //     modalLeaveText: {
// //         color: '#FFFFFF',
// //         fontWeight: '600',
// //         fontSize: 14,
// //     },
// // });


// // VideoCallScreen.tsx
// // The actual in-call UI: local + remote video, mute/camera/switch/end controls.

// import React, {
//     useState,
//     useEffect,
//     useRef,
//     useCallback,
// } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     ActivityIndicator,
//     Modal,
//     StatusBar,
//     Platform,
// } from 'react-native';
// import {
//     IRtcEngine,
//     IRtcEngineEventHandler,
//     createAgoraRtcEngine,
//     ChannelProfileType,
//     ClientRoleType,
//     RtcSurfaceView,
//     VideoSourceType,
// } from 'react-native-agora';
// import axios from 'axios';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRoute, useNavigation } from '@react-navigation/native';

// const engine = createAgoraRtcEngine();

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface TokenData {
//     app_id: string;
//     token: string;
//     channel: string;
//     uid: number | null;
// }

// interface CallStatusData {
//     call_status: 'not_started' | 'active' | 'ended';
// }

// type CallState = 'idle' | 'joining' | 'active' | 'ended';

// interface PatientVideoCallProps {
//     consultationId?: string;
//     doctorName?: string;
//     onCallEnd?: () => void;
// }

// // ─── Config ───────────────────────────────────────────────────────────────────

// // 🔧 Move this to your existing API config/env file if you have one
// const API_BASE = 'https://aghast-cognition-earflap.ngrok-free.dev';

// const TEST_CONFIG = {
//     enabled: false,
//     appId: '',
//     token: '',
//     channel: '',
//     uid: null as number | null,
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// // 🔧 Replace with your real auth/token storage (AsyncStorage, Redux, etc.)
// function getAccessToken(): string {
//     // TODO: pull this from your auth store instead of hardcoding
//     return '';
// }

// function authHeaders() {
//     return {
//         Authorization: `Bearer ${getAccessToken()}`,
//         'ngrok-skip-browser-warning': 'true',
//     };
// }

// function apiErrorMessage(err: any, fallback: string): string {
//     return err?.response?.data?.message || err?.message || fallback;
// }

// function formatDuration(s: number): string {
//     const mm = Math.floor(s / 60).toString().padStart(2, '0');
//     const ss = (s % 60).toString().padStart(2, '0');
//     return `${mm}:${ss}`;
// }

// // ─── API calls ────────────────────────────────────────────────────────────────

// async function fetchCallStatus(consultationId: string): Promise<CallStatusData> {
//     const response = await axios.get(
//         `${API_BASE}/doctors/appointments/${consultationId}/call/status/`,
//         { headers: authHeaders() },
//     );
//     if (response.data?.success && response.data?.data) {
//         return response.data.data as CallStatusData;
//     }
//     throw new Error(response.data?.message || 'Failed to get call status');
// }

// async function markEnded(consultationId: string): Promise<void> {
//     const response = await axios.post(
//         `${API_BASE}/doctors/appointments/${consultationId}/call/end/`,
//         {},
//         { headers: authHeaders() },
//     );
//     if (!response.data?.success) {
//         throw new Error(response.data?.message || 'Failed to end call');
//     }
// }

// async function fetchAgoraToken(consultationId: string): Promise<TokenData> {
//     if (TEST_CONFIG.enabled) {
//         return {
//             app_id: TEST_CONFIG.appId,
//             token: TEST_CONFIG.token,
//             channel: TEST_CONFIG.channel,
//             uid: TEST_CONFIG.uid,
//         };
//     }
//     const response = await axios.post(
//         `${API_BASE}/doctors/appointments/${consultationId}/call/token/`,
//         {},
//         { headers: authHeaders() },
//     );
//     if (response.data?.success && response.data?.data) {
//         return response.data.data as TokenData;
//     }
//     throw new Error(response.data?.message || 'Failed to get token');
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function PatientVideoCall({
//     consultationId: propConsultationId,
//     doctorName: propDoctorName,
//     onCallEnd,
// }: PatientVideoCallProps) {
//     // Allow this screen to be used either via navigation params (from
//     // GlobalIncomingCallListener) or via direct props.
//     const route = useRoute<any>();
//     const navigation = useNavigation<any>();

//     const consultationId =
//         propConsultationId ?? route.params?.consultationId;
//     const doctorName = propDoctorName ?? route.params?.doctorName ?? 'Doctor';

//     console.log("consulationiddddd", consultationId)

//     const [callState, setCallState] = useState<CallState>('idle');
//     const [isMuted, setIsMuted] = useState(false);
//     const [isCameraOff, setIsCameraOff] = useState(false);
//     const [doctorJoined, setDoctorJoined] = useState(false);
//     const [duration, setDuration] = useState(0);
//     const [error, setError] = useState<string | null>(null);
//     const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
//     const [remoteUid, setRemoteUid] = useState<number | null>(null);
//     const [localUid, setLocalUid] = useState<number>(0);
//     const [connectingStep, setConnectingStep] = useState(
//         'Preparing consultation...',
//     );
//     const [speakerEnabled, setSpeakerEnabled] = useState(true);

//     const engineRef = useRef<IRtcEngine | null>(null);
//     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//     // ── Event handler ────────────────────────────────────────────────────────
//     const eventHandler = useRef<IRtcEngineEventHandler>({
//         onJoinChannelSuccess: (_connection, uid) => {
//             setLocalUid(uid);
//             setCallState('active');
//             timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
//         },
//         onUserJoined: (_connection, uid) => {
//             setRemoteUid(uid);
//             setDoctorJoined(true);
//         },
//         onUserOffline: (_connection, uid) => {
//             setRemoteUid(null);
//             setDoctorJoined(false);
//         },
//         onError: (err, msg) => {
//             setError(`Connection error (${err}). Please try again.`);
//         },
//         onConnectionStateChanged: (_connection, state) => {
//             // state 5 = FAILED
//             if (state === 5) {
//                 setError('Connection lost. Please check your network and try again.');
//             }
//         },
//     });

//     const switchCamera = useCallback(() => {
//         engineRef.current?.switchCamera();
//     }, []);

//     const toggleSpeaker = useCallback(() => {
//         engineRef.current?.setEnableSpeakerphone(!speakerEnabled);
//         setSpeakerEnabled(prev => !prev);
//     }, [speakerEnabled]);

//     // ── Join ──────────────────────────────────────────────────────────────────
//     const joinCall = useCallback(async () => {
//         setCallState('joining');
//         setError(null);

//         try {
//             if (!getAccessToken()) {
//                 throw new Error('Please log in again — session token not found');
//             }

//             if (!TEST_CONFIG.enabled) {
//                 setConnectingStep('Checking appointment');

//                 const callStatus = await fetchCallStatus(consultationId);

//                 if (callStatus.call_status === 'ended') {
//                     throw new Error('This video call has already ended.');
//                 }
//                 if (callStatus.call_status === 'not_started') {
//                     throw new Error(
//                         'Please wait for the doctor to start the consultation.',
//                     );
//                 }

//                 setConnectingStep('Generating secure room');
//             }

//             const tokenData = await fetchAgoraToken(consultationId);

//             if (!tokenData?.app_id || !tokenData?.channel || !tokenData?.token) {
//                 throw new Error('Invalid token data received');
//             }

//             setConnectingStep('Connecting to doctor');

//             const rtcEngine = createAgoraRtcEngine();
//             engineRef.current = rtcEngine;

//             rtcEngine.initialize({
//                 appId: tokenData.app_id,
//                 channelProfile: ChannelProfileType.ChannelProfileCommunication,
//             });

//             rtcEngine.registerEventHandler(eventHandler.current);

//             setConnectingStep('Starting video');
            
//             rtcEngine.enableVideo();
//             rtcEngine.startPreview();

//             rtcEngine.joinChannel(
//                 tokenData.token,
//                 tokenData.channel,
//                 tokenData.uid ?? 0,
//                 {
//                     clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//                     publishMicrophoneTrack: true,
//                     publishCameraTrack: true,
//                     autoSubscribeAudio: true,
//                     autoSubscribeVideo: true,
//                 },
//             );
//         } catch (err: any) {
//             const message = apiErrorMessage(
//                 err,
//                 'Could not join. Check your connection or credentials.',
//             );
//             setError(message);
//             setCallState('idle');
//         }
//     }, [consultationId]);

//     // ── Leave ─────────────────────────────────────────────────────────────────
//     const leaveCall = useCallback(async () => {
//         if (timerRef.current) {
//             clearInterval(timerRef.current);
//             timerRef.current = null;
//         }
//         setShowLeaveConfirm(false);

//         const rtcEngine = engineRef.current;
//         if (rtcEngine) {
//             rtcEngine.leaveChannel();
//             rtcEngine.stopPreview();
//             rtcEngine.disableVideo();
//             rtcEngine.unregisterEventHandler(eventHandler.current);
//             rtcEngine.release();
//             engineRef.current = null;
//         }

//         try {
//             await markEnded(consultationId);
//         } catch (e: any) {
//             // non-fatal — call has already been left locally
//         }

//         setCallState('ended');
//         if (onCallEnd) onCallEnd();
//     }, [consultationId, onCallEnd]);

//     const toggleMic = useCallback(() => {
//         const rtcEngine = engineRef.current;
//         if (!rtcEngine) return;
//         rtcEngine.muteLocalAudioStream(!isMuted);
//         setIsMuted(m => !m);
//     }, [isMuted]);

//     const toggleCamera = useCallback(() => {
//         const rtcEngine = engineRef.current;
//         if (!rtcEngine) return;
//         rtcEngine.muteLocalVideoStream(!isCameraOff);
//         setIsCameraOff(c => !c);
//     }, [isCameraOff]);

//     // ── Cleanup on unmount ────────────────────────────────────────────────────
//     useEffect(() => {
//         return () => {
//             if (timerRef.current) clearInterval(timerRef.current);
//             const rtcEngine = engineRef.current;
//             if (rtcEngine) {
//                 rtcEngine.leaveChannel();
//                 rtcEngine.stopPreview();
//                 rtcEngine.release();
//                 engineRef.current = null;
//             }
//         };
//     }, []);

//     // ── Ended screen ──────────────────────────────────────────────────────────
//     if (callState === 'ended') {
//         return (
//             <SafeAreaView style={styles.safeArea}>
//                 <View style={styles.statusBanner}>
//                     <View style={styles.greenDot} />
//                     <Text style={styles.statusText}>
//                         {doctorJoined ? 'Doctor Connected' : 'Waiting For Doctor'}
//                     </Text>
//                 </View>
//                 <View style={styles.endedContainer}>
//                     <View style={styles.endedIconCircle}>
//                         <Text style={styles.endedIcon}>✓</Text>
//                     </View>
//                     <Text style={styles.endedTitle}>Consultation Ended</Text>
//                     <Text style={styles.endedDuration}>
//                         Duration: {formatDuration(duration)}
//                     </Text>
//                     <TouchableOpacity
//                         style={styles.closeButton}
//                         onPress={() => {
//                             if (navigation?.canGoBack?.()) {
//                                 navigation.goBack();
//                             } else {
//                                 setCallState('idle');
//                                 setDuration(0);
//                                 setDoctorJoined(false);
//                                 setRemoteUid(null);
//                                 setError(null);
//                             }
//                         }}>
//                         <Text style={styles.closeButtonText}>Close</Text>
//                     </TouchableOpacity>
//                 </View>
//             </SafeAreaView>
//         );

//     }

//     // ── Main screen ───────────────────────────────────────────────────────────
//     return (
//         <SafeAreaView style={styles.safeArea}>
//             <StatusBar barStyle="light-content" backgroundColor="#111827" />

//             {/* Header */}
//             <View style={styles.header}>
//                 <View style={styles.headerLeft}>
//                     <View style={styles.headerIcon}>
//                         <Text style={styles.headerIconText}>🌿</Text>
//                     </View>
//                     <View>
//                         <Text style={styles.headerTitle}>Video Consultation</Text>
//                         <Text style={styles.headerSubtitle}>Patient View</Text>
//                     </View>
//                 </View>
//                 {callState === 'active' && (
//                     <View style={styles.timerBadge}>
//                         <Text style={styles.timerText}>{formatDuration(duration)}</Text>
//                     </View>
//                 )}
//             </View>

//             {/* Video Area */}
//             <View style={styles.videoContainer}>
//                 {callState === 'active' && remoteUid !== null ? (
//                     <RtcSurfaceView
//                         style={styles.remoteVideo}
//                         canvas={{ uid: remoteUid, sourceType: VideoSourceType.VideoSourceRemote }}
//                     />
//                 ) : (
//                     <View style={styles.remoteVideoPlaceholder} />
//                 )}

//                 {callState === 'active' && !doctorJoined && (
//                     <View style={styles.waitingOverlay}>
//                         <View style={styles.waitingIconCircle}>
//                             <Text style={styles.waitingIcon}>👥</Text>
//                         </View>
//                         <View style={styles.waitingCard}>
//                             <Text style={styles.waitingDoctor}>Dr. {doctorName}</Text>
//                             <ActivityIndicator size="large" color="#0D614E" />
//                             <Text style={styles.waitingTitle}>
//                                 Doctor has been notified
//                             </Text>
//                             <Text style={styles.waitingSubtitle}>
//                                 Waiting for consultation to begin
//                             </Text>
//                         </View>
//                     </View>
//                 )}

//                 {callState !== 'active' && (
//                     <View style={styles.idleOverlay}>
//                         <Text style={styles.idleIcon}>📹</Text>
//                         {callState === 'joining' ? (
//                             <>
//                                 <ActivityIndicator
//                                     size="large"
//                                     color="#0D614E"
//                                     style={{ marginBottom: 12 }}
//                                 />
//                                 <Text style={styles.idleText}>{connectingStep}...</Text>
//                             </>
//                         ) : (
//                             <>
//                                 <Text style={styles.idleText}>Ready to join consultation</Text>
//                                 <TouchableOpacity
//                                     style={styles.joinButton}
//                                     onPress={joinCall}
//                                     activeOpacity={0.85}>
//                                     <Text style={styles.joinButtonIcon}>📞 </Text>
//                                     <Text style={styles.joinButtonText}>Join Consultation</Text>
//                                 </TouchableOpacity>
//                             </>
//                         )}

//                         {error && (
//                             <View style={styles.errorBanner}>
//                                 <Text style={styles.errorIcon}>⚠️ </Text>
//                                 <Text style={styles.errorText}>{error}</Text>
//                             </View>
//                         )}
//                     </View>
//                 )}

//                 {doctorJoined && callState === 'active' && (
//                     <View style={styles.doctorBadge}>
//                         <Text style={styles.doctorBadgeText}>✓ Doctor Connected</Text>
//                     </View>
//                 )}

//                 {doctorJoined && (
//                     <View style={styles.doctorNameTag}>
//                         <Text style={styles.doctorNameTagText}>Dr. {doctorName}</Text>
//                     </View>
//                 )}

//                 {callState === 'active' && (
//                     <View style={styles.localVideoContainer}>
//                         {isCameraOff ? (
//                             <View style={styles.cameraOffPlaceholder}>
//                                 <Text style={styles.cameraOffIcon}>📵</Text>
//                             </View>
//                         ) : (
//                             <RtcSurfaceView
//                                 style={styles.localVideo}
//                                 canvas={{
//                                     uid: localUid,
//                                     sourceType: VideoSourceType.VideoSourceCamera,
//                                 }}
//                             />
//                         )}
//                         <View style={styles.youLabel}>
//                             <Text style={styles.youLabelText}>
//                                 You{isMuted ? ' (Muted)' : ''}
//                             </Text>
//                         </View>
//                     </View>
//                 )}
//             </View>

//             {/* Controls */}
//             {callState === 'active' && (
//                 <View style={styles.controlsBar}>
//                     <TouchableOpacity style={styles.roundControl} onPress={toggleMic}>
//                         <Text>{isMuted ? '🔇' : '🎤'}</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.roundControl} onPress={toggleCamera}>
//                         <Text>{isCameraOff ? '📵' : '📷'}</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.roundControl} onPress={switchCamera}>
//                         <Text>🔄</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.roundControl} onPress={toggleSpeaker}>
//                         <Text>{speakerEnabled ? '🔊' : '🔈'}</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         style={styles.endCallButton}
//                         onPress={() => setShowLeaveConfirm(true)}>
//                         <Text>📞</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {/* Leave Confirm Modal */}
//             <Modal
//                 visible={showLeaveConfirm}
//                 transparent
//                 animationType="fade"
//                 onRequestClose={() => setShowLeaveConfirm(false)}>
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalCard}>
//                         <Text style={styles.modalTitle}>End Consultation?</Text>
//                         <Text style={styles.modalMessage}>
//                             Are you sure you want to leave the consultation?
//                         </Text>
//                         <View style={styles.modalActions}>
//                             <TouchableOpacity
//                                 style={styles.modalCancelButton}
//                                 onPress={() => setShowLeaveConfirm(false)}>
//                                 <Text style={styles.modalCancelText}>Cancel</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={styles.modalLeaveButton}
//                                 onPress={leaveCall}>
//                                 <Text style={styles.modalLeaveText}>Leave Call</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>
//         </SafeAreaView>
//     );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const BRAND = '#0D614E';

// const styles = StyleSheet.create({
//     safeArea: { flex: 1, backgroundColor: '#111827' },
//     statusBanner: {
//         position: 'absolute',
//         top: 12,
//         alignSelf: 'center',
//         flexDirection: 'row',
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 20,
//         zIndex: 999,
//     },
//     greenDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         backgroundColor: '#22C55E',
//         marginRight: 8,
//         marginTop: 5,
//     },
//     statusText: { color: '#fff' },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         backgroundColor: 'rgba(255,255,255,0.08)',
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.06)',
//     },
//     headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//     headerIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 10,
//         backgroundColor: BRAND,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 10,
//     },
//     headerIconText: { fontSize: 20 },
//     headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
//     headerSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
//     timerBadge: {
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         backgroundColor: 'rgba(255,255,255,0.10)',
//         borderRadius: 8,
//     },
//     timerText: {
//         color: '#FFFFFF',
//         fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     videoContainer: { flex: 1, backgroundColor: '#030712', position: 'relative' },
//     remoteVideo: { ...StyleSheet.absoluteFillObject },
//     remoteVideoPlaceholder: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: '#030712',
//     },
//     waitingOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: 'rgba(3,7,18,0.88)',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 10,
//     },
//     waitingIconCircle: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: 'rgba(255,255,255,0.08)',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 16,
//     },
//     waitingIcon: { fontSize: 36 },
//     waitingCard: { alignItems: 'center' },
//     waitingDoctor: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 20 },
//     waitingTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 20 },
//     waitingSubtitle: { color: '#9CA3AF', marginTop: 8 },
//     idleOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: '#030712',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 10,
//         paddingHorizontal: 24,
//     },
//     idleIcon: { fontSize: 48, marginBottom: 16 },
//     idleText: { color: '#9CA3AF', fontSize: 16, marginBottom: 24, textAlign: 'center' },
//     joinButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: BRAND,
//         paddingHorizontal: 28,
//         paddingVertical: 14,
//         borderRadius: 14,
//         marginBottom: 16,
//     },
//     joinButtonIcon: { fontSize: 16 },
//     joinButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
//     errorBanner: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         backgroundColor: 'rgba(239,68,68,0.15)',
//         borderRadius: 10,
//         paddingHorizontal: 14,
//         paddingVertical: 10,
//         marginTop: 8,
//         maxWidth: 340,
//     },
//     errorIcon: { fontSize: 14, marginRight: 6, marginTop: 1 },
//     errorText: { color: '#F87171', fontSize: 13, flex: 1 },
//     doctorBadge: {
//         position: 'absolute',
//         top: 12,
//         right: 12,
//         backgroundColor: 'rgba(16,185,129,0.90)',
//         borderRadius: 8,
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         zIndex: 20,
//     },
//     doctorBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
//     doctorNameTag: {
//         position: 'absolute',
//         bottom: 12,
//         left: 12,
//         backgroundColor: 'rgba(0,0,0,0.55)',
//         borderRadius: 8,
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         zIndex: 20,
//     },
//     doctorNameTagText: { color: '#FFFFFF', fontSize: 13 },
//     localVideoContainer: {
//         position: 'absolute',
//         bottom: 12,
//         right: 12,
//         width: 110,
//         aspectRatio: 9 / 16,
//         borderRadius: 10,
//         overflow: 'hidden',
//         borderWidth: 2,
//         borderColor: 'rgba(255,255,255,0.20)',
//         backgroundColor: '#1F2937',
//         zIndex: 20,
//     },
//     localVideo: { width: '100%', height: '100%' },
//     cameraOffPlaceholder: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#1F2937',
//     },
//     cameraOffIcon: { fontSize: 24 },
//     youLabel: {
//         position: 'absolute',
//         bottom: 4,
//         left: 4,
//         backgroundColor: 'rgba(0,0,0,0.55)',
//         borderRadius: 4,
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//     },
//     youLabelText: { color: '#FFFFFF', fontSize: 9 },
//     controlsBar: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 10,
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         backgroundColor: 'rgba(255,255,255,0.07)',
//         borderTopWidth: 1,
//         borderTopColor: 'rgba(255,255,255,0.06)',
//     },
//     roundControl: {
//         width: 58,
//         height: 58,
//         borderRadius: 29,
//         backgroundColor: 'rgba(255,255,255,0.15)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     endCallButton: {
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: '#EF4444',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     endedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
//     endedIconCircle: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: 'rgba(16,185,129,0.15)',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 20,
//     },
//     endedIcon: { fontSize: 36, color: '#34D399' },
//     endedTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
//     endedDuration: { fontSize: 15, color: '#9CA3AF', marginBottom: 28 },
//     closeButton: {
//         paddingHorizontal: 32,
//         paddingVertical: 12,
//         backgroundColor: BRAND,
//         borderRadius: 12,
//     },
//     closeButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.70)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     modalCard: {
//         backgroundColor: '#1F2937',
//         borderRadius: 20,
//         padding: 24,
//         width: '85%',
//         maxWidth: 360,
//     },
//     modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
//     modalMessage: { fontSize: 14, color: '#9CA3AF', marginBottom: 24, lineHeight: 20 },
//     modalActions: { flexDirection: 'row', gap: 10 },
//     modalCancelButton: {
//         flex: 1,
//         paddingVertical: 12,
//         borderRadius: 10,
//         backgroundColor: '#374151',
//         alignItems: 'center',
//     },
//     modalCancelText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
//     modalLeaveButton: {
//         flex: 1,
//         paddingVertical: 12,
//         borderRadius: 10,
//         backgroundColor: '#EF4444',
//         alignItems: 'center',
//     },
//     modalLeaveText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
// });