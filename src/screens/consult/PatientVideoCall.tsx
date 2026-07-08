import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PermissionsAndroid,
    Platform,
    TouchableOpacity,
    AppState,
    AppStateStatus,
    ActivityIndicator,
    Image,
    Animated,
    Easing,
} from 'react-native';
import {
    createAgoraRtcEngine,
    IRtcEngine,
    IRtcEngineEventHandler,
    RtcSurfaceView,
    ChannelProfileType,
    ClientRoleType,
    RenderModeType,
} from 'react-native-agora';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '../../common/Vector';
import { Utils } from '../../common/Utils';
import { BaseUrl } from '../../config/Key';

// ─────────────────────────────────────────────────────────
// 👉 Apna actual API base URL yahan daal
// ─────────────────────────────────────────────────────────
const API_BASE_URL = 'https://aghast-cognition-earflap.ngrok-free.dev';

// 👉 Agar endpoint pattern alag hai (jaise /consultations/ instead of /appointments/),
// bas ye function badal de — baaki sab code isi se URLs banata hai
const callUrl = (appointmentId: string, action: string) =>
    `${BaseUrl?.base_url}doctors/appointments/${appointmentId}/call/${action}/`;

// ─────────────────────────────────────────────────────────
// Auth helper — assume Bearer token AsyncStorage me stored hai
// ─────────────────────────────────────────────────────────
async function getAuthHeaders() {
    const token = await Utils.getData('_TOKEN');
    console.log('Authtoken:', token);
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// ─────────────────────────────────────────────────────────
// Generic fetch wrapper — timeout + non-2xx ko error banata hai,
// aur backend ke { success, message, data } envelope ko yahin unwrap kar deta hai
// taaki upar wale API helpers ko seedha "data" object mile.
// ─────────────────────────────────────────────────────────
async function apiFetch(url: string, options: RequestInit = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        let body: any = null;
        const text = await response.text();
        try {
            body = text ? JSON.parse(text) : null;
        } catch {
            body = text;
        }

        if (!response.ok) {
            const error: any = new Error(body?.message || `Request failed (${response.status})`);
            error.status = response.status;
            error.data = body?.data ?? body;
            throw error;
        }

        // 👉 Backend response shape: { success, message, data: {...} }
        // Yahin unwrap kar rahe hain taaki callers ko seedha data object mile
        // (agar kabhi "data" key na ho, poora body hi return kar do — safe fallback)
        if (body && typeof body === 'object' && 'data' in body) {
            return body.data;
        }
        return body;
    } catch (e: any) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
            const timeoutError: any = new Error('Request timed out — network dheema ya server slow hai.');
            timeoutError.status = 0;
            throw timeoutError;
        }
        if (e.message === 'Network request failed') {
            const networkError: any = new Error(
                'Network error — internet connection check karo, ya API_BASE_URL galat ho sakta hai.'
            );
            networkError.status = 0;
            throw networkError;
        }
        throw e;
    }
}

// ─────────────────────────────────────────────────────────
// API calls — har ek yahan ek jagah, error handling ke saath
// (in sab ko ab seedha "data" object milta hai, .data.xyz nahi likhna)
// ─────────────────────────────────────────────────────────
async function apiGetCallStatus(appointmentId: string) {
    const headers = await getAuthHeaders();
    return apiFetch(callUrl(appointmentId, 'status'), { method: 'GET', headers });
    // returns: { call_status: 'not_started' | 'in_progress' | 'ended', ... }
}

async function apiStartCall(appointmentId: string) {
    const headers = await getAuthHeaders();
    try {
        return await apiFetch(callUrl(appointmentId, 'start'), { method: 'POST', headers, body: '{}' });
        // returns: { call_status: 'in_progress', call_started_at, call_started_by, channel }
    } catch (e: any) {
        // already_started ko error nahi, normal flow maanenge
        if (e?.data?.call_status === 'in_progress' || e?.status === 409) {
            return e.data;
        }
        throw e;
    }
}

async function apiGetCallToken(appointmentId: string) {
    const headers = await getAuthHeaders();
    return apiFetch(callUrl(appointmentId, 'token'), { method: 'POST', headers, body: '{}' });
    // returns: { token, channel, uid, app_id, expires_at (unix seconds), role, appointment_id, call_status }
}

async function apiPostCallEvent(appointmentId: string, event: 'joined' | 'left', sessionId?: string) {
    try {
        const headers = await getAuthHeaders();
        await apiFetch(callUrl(appointmentId, 'events'), {
            method: 'POST',
            headers,
            body: JSON.stringify({
                event_type: event,
                session_id: sessionId ?? null,
                metadata: {
                    source: 'agora_sdk',
                },
            }),
        });
    } catch (e) {
        console.log(`[API] events(${event}) failed:`, e);
        // event logging fail hone se call flow mat roko
    }
}

async function apiEndCall(appointmentId: string) {
    const headers = await getAuthHeaders();
    await apiFetch(callUrl(appointmentId, 'end'), { method: 'POST', headers, body: '{}' });
}

// ─────────────────────────────────────────────────────────
// Permissions
// ─────────────────────────────────────────────────────────
async function requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted' &&
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted'
        );
    }
    return true;
}

type CallScreenParams = {
    appointmentId: string;
    role?: 'doctor' | 'patient';
    otherPartyName?: string;
    otherPartyImage?: string; // full image URL
};

const PatientVideoCallScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const {
        appointmentId,
        role = 'patient',
        otherPartyName,
        otherPartyImage,
    } = route.params as CallScreenParams;

    console.log("otherPartyNameotherPartyName", otherPartyName)
    const otherPartyLabel = role === 'patient' ? 'doctor' : 'patient';
    const displayName = otherPartyName || (role === 'patient' ? 'Doctor' : 'Patient');
    const initials = displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w.charAt(0).toUpperCase())
        .join('');

    const agoraEngineRef = useRef<IRtcEngine | null>(null);
    const tokenInfoRef = useRef<{ token: string; channelName: string; uid: number; appId: string; expiresAt: number } | null>(null);
    const endedByUserRef = useRef(false);
    const sessionIdRef = useRef<string | undefined>(undefined);
    const isSettingUpRef = useRef(false);

    const [loadingLabel, setLoadingLabel] = useState('Connecting to the consultation...');
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 👉 UI controls state
    const [isMuted, setIsMuted] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    // 👉 NEW: camera on/off aur speaker on/off state
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    // false = doctor/remote video BIG, my video small (default)
    // true  = my video BIG, doctor/remote video small
    const [isLocalViewBig, setIsLocalViewBig] = useState(false);

    // 👉 call duration timer (jab remote join kare tab se start)
    const [callSeconds, setCallSeconds] = useState(0);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 👉 "connecting..." pulsing ring animation (waiting avatar ke peeche)
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // ─────────────────────────────────────────────────────
    // Step 1-3: Status check -> Start (if needed) -> Token
    // ─────────────────────────────────────────────────────
    const prepareAndJoin = useCallback(async () => {
        if (isSettingUpRef.current) return;
        isSettingUpRef.current = true;
        endedByUserRef.current = false;
        setErrorMsg(null);

        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                setErrorMsg('Camera/Mic permission denied — Settings me jaake allow karo.');
                isSettingUpRef.current = false;
                return;
            }

            // Step 1 — status check
            setLoadingLabel('Checking consultation status...');
            const statusRes = await apiGetCallStatus(appointmentId);
            console.log('[Status API] response:', JSON.stringify(statusRes));

            if (statusRes?.call_status === 'ended') {
                setErrorMsg('This consultation has already ended.');
                isSettingUpRef.current = false;
                return;
            }

            // Step 2 — start call agar not_started hai
            if (statusRes?.call_status === 'not_started') {
                setLoadingLabel('Starting consultation...');
                const startRes = await apiStartCall(appointmentId);
                console.log('[Start API] response:', JSON.stringify(startRes));
            }

            // Step 3 — token le (cache use karo agar valid hai)
            setLoadingLabel('Preparing secure connection...');
            const cached = tokenInfoRef.current;
            const now = Date.now();
            let tokenInfo = cached;

            if (!cached || cached.expiresAt <= now) {
                const tokenRes = await apiGetCallToken(appointmentId);
                console.log('[Token API] response:', JSON.stringify(tokenRes));

                if (!tokenRes?.token || !tokenRes?.channel) {
                    throw new Error('Token response me token/channel missing hai — backend response check karo.');
                }

                let expiresAtMs: number;
                if (typeof tokenRes.expires_at === 'number') {
                    expiresAtMs = tokenRes.expires_at * 1000;
                } else if (tokenRes.expires_at) {
                    expiresAtMs = new Date(tokenRes.expires_at).getTime();
                } else {
                    expiresAtMs = now + 23 * 60 * 60 * 1000; // fallback ~23hr
                }

                tokenInfo = {
                    token: tokenRes.token,
                    channelName: tokenRes.channel,
                    uid: tokenRes.uid ?? 0,
                    appId: tokenRes.app_id || FALLBACK_APP_ID,
                    expiresAt: expiresAtMs,
                };
                tokenInfoRef.current = tokenInfo;
            }

            await joinAgoraChannel(tokenInfo!);
        } catch (e: any) {
            console.log('[Call setup] failed:', e);
            setErrorMsg(e?.message || 'Consultation start nahi ho payi. Dobara try karo.');
        } finally {
            isSettingUpRef.current = false;
        }
    }, [appointmentId]);

    // ─────────────────────────────────────────────────────
    // Agora joinChannel — client SDK only, koi backend call nahi
    // ─────────────────────────────────────────────────────
    const joinAgoraChannel = useCallback(
        async (tokenInfo: { token: string; channelName: string; uid: number; appId: string }) => {
            setLoadingLabel('Joining call...');
            console.log('[Agora] Joining with:', {
                channelName: tokenInfo.channelName,
                uid: tokenInfo.uid,
                appId: tokenInfo.appId,
                tokenPreview: tokenInfo.token?.slice(0, 20) + '...',
            });

            if (!agoraEngineRef.current) {
                const agoraEngine = createAgoraRtcEngine();
                agoraEngineRef.current = agoraEngine;

                const eventHandler: IRtcEngineEventHandler = {
                    onJoinChannelSuccess: (connection) => {
                        console.log('[Agora] Local join success');
                        setIsJoined(true);
                        setErrorMsg(null);
                        const sessionId = connection?.channelId
                            ? `${connection.channelId}-${connection.localUid}`
                            : undefined;
                        sessionIdRef.current = sessionId;
                        apiPostCallEvent(appointmentId, 'joined', sessionId);
                    },
                    onUserJoined: (_connection, uid) => {
                        console.log('[Agora] Remote user joined:', uid);
                        setRemoteUid(uid);
                    },
                    onUserOffline: (_connection, uid) => {
                        console.log('[Agora] Remote user left:', uid);
                        setRemoteUid(prev => (prev === uid ? null : prev));
                    },
                    onLeaveChannel: () => {
                        console.log('[Agora] Left channel');
                        setIsJoined(false);
                        if (!endedByUserRef.current) {
                            apiPostCallEvent(appointmentId, 'left', sessionIdRef.current);
                        }
                    },
                    onError: (err, msg) => {
                        console.log('[Agora] Error:', err, msg);
                        if (err === 110 || err === 109) {
                            tokenInfoRef.current = null;
                        }
                        setErrorMsg(`Connection error (${err}): ${msg}`);
                    },
                    onConnectionStateChanged: (_connection, state, reason) => {
                        console.log('[Agora] Connection state changed:', state, 'reason:', reason);
                        if (state === 5) {
                            setErrorMsg(`Connection failed (reason ${reason}). Token/App ID mismatch ho sakta hai.`);
                        }
                    },
                };

                agoraEngine.registerEventHandler(eventHandler);
                agoraEngine.initialize({ appId: tokenInfo.appId });
                agoraEngine.enableVideo();
                agoraEngine.startPreview();

                // 👉 FIX (zoom issue): kuch devices par camera default zoom factor
                // 1 se zyada set aa jaata hai (ya pichli session se carry hota hai),
                // jisse video zoomed dikhta hai. Yahan explicitly reset kar rahe hain
                // taaki hamesha full/normal field-of-view dikhe (poora face visible).
                try {
                    // @ts-ignore - available on native engine even if TS types miss it on older versions
                    agoraEngine.setCameraZoomFactor(1);
                } catch (e) {
                    console.log('[Agora] setCameraZoomFactor not supported / failed:', e);
                }
            }

            const joinResult = agoraEngineRef.current.joinChannel(
                tokenInfo.token,
                tokenInfo.channelName,
                tokenInfo.uid,
                {
                    channelProfile: ChannelProfileType.ChannelProfileCommunication,
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                }
            );
            console.log('[Agora] joinChannel call returned code:', joinResult, '(0 = request sent ok)');
        },
        [appointmentId]
    );

    // ─────────────────────────────────────────────────────
    // Mount + app resume par re-check
    // ─────────────────────────────────────────────────────
    useEffect(() => {
        prepareAndJoin();

        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active') {
                prepareAndJoin();
            }
        };
        const sub = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            sub.remove();
            try {
                agoraEngineRef.current?.leaveChannel();
                agoraEngineRef.current?.unregisterEventHandler({} as IRtcEngineEventHandler);
                agoraEngineRef.current?.release();
            } catch (e) {
                console.log('[Agora] Cleanup error:', e);
            }
            agoraEngineRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointmentId]);

    useEffect(() => {
        if (remoteUid !== null) {
            if (!timerIntervalRef.current) {
                timerIntervalRef.current = setInterval(() => {
                    setCallSeconds(prev => prev + 1);
                }, 1000);
            }
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [remoteUid]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDuration = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleEndCall = async () => {
        endedByUserRef.current = true;
        await apiPostCallEvent(appointmentId, 'left', sessionIdRef.current);
        try {
            await apiEndCall(appointmentId);
        } catch (e) {
            console.log('[API] end call failed:', e);
        }
        try {
            agoraEngineRef.current?.leaveChannel();
        } catch (e) {
            console.log('[Agora] leaveChannel error:', e);
        }
        setIsJoined(false);
        navigation.goBack();
    };

    const handleRetry = () => {
        prepareAndJoin();
    };

    const handleToggleMute = () => {
        const next = !isMuted;
        try {
            agoraEngineRef.current?.muteLocalAudioStream(next);
            setIsMuted(next);
        } catch (e) {
            console.log('[Agora] mute toggle error:', e);
        }
    };

    const handleFlipCamera = () => {
        try {
            agoraEngineRef.current?.switchCamera();
            setIsFrontCamera(prev => !prev);
        } catch (e) {
            console.log('[Agora] switchCamera error:', e);
        }
    };

    // 👉 NEW: Camera on/off toggle. muteLocalVideoStream(true) = camera band,
    // but audio call chalta rahta hai. isCameraOn state se hum UI mein
    // "Camera off" wala clean avatar dikhate hain — plain black screen nahi,
    // jisse user ko lage ki bug hai.
    const handleToggleCamera = () => {
        const next = !isCameraOn; // next value of "camera on"
        try {
            agoraEngineRef.current?.muteLocalVideoStream(!next);
            setIsCameraOn(next);
        } catch (e) {
            console.log('[Agora] camera toggle error:', e);
        }
    };

    // 👉 NEW: Speaker on/off toggle (loudspeaker vs earpiece).
    const handleToggleSpeaker = () => {
        const next = !isSpeakerOn;
        try {
            agoraEngineRef.current?.setEnableSpeakerphone(next);
            setIsSpeakerOn(next);
        } catch (e) {
            console.log('[Agora] speaker toggle error:', e);
        }
    };

    const handleSwapViews = () => {
        setIsLocalViewBig(prev => !prev);
    };

    const showLocalBig = isLocalViewBig;
    const remoteAvailable = remoteUid !== null;

    const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
    const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

    return (
        <SafeAreaView style={styles.container}>
            {/* ───────────── HEADER ───────────── */}
            <View style={styles.header}>
                {otherPartyImage ? (
                    <Image source={{ uri: otherPartyImage }} style={styles.headerAvatar} />
                ) : (
                    <View style={styles.headerAvatarFallback}>
                        <Text style={styles.headerAvatarInitials}>{initials || '?'}</Text>
                    </View>
                )}
                <View style={styles.headerTextBlock}>
                    <Text style={styles.headerName} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <View style={styles.headerStatusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: remoteAvailable ? '#3ddc84' : '#f5a623' },
                            ]}
                        />
                        <Text style={styles.headerStatusText}>
                            {remoteAvailable ? `Connected • ${formatDuration(callSeconds)}` : loadingLabel}
                        </Text>
                    </View>
                </View>
            </View>

            {errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                    <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.remoteContainer}>
                {/* ───────── Waiting / connecting placeholder — pulsing avatar ───────── */}
                {(!isJoined || (isJoined && !remoteAvailable && !showLocalBig)) && (
                    <View style={styles.loadingContainer}>
                        <View style={styles.pulseWrap}>
                            <Animated.View
                                style={[
                                    styles.pulseRing,
                                    { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                                ]}
                            />
                            {otherPartyImage ? (
                                <Image source={{ uri: otherPartyImage }} style={styles.pulseAvatar} />
                            ) : (
                                <View style={styles.pulseAvatarFallback}>
                                    <Text style={styles.pulseAvatarInitials}>{initials || '?'}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.loadingText}>
                            {!isJoined
                                ? loadingLabel
                                : `Waiting for ${displayName} to join the consultation...`}
                        </Text>
                        {!errorMsg && isJoined && (
                            <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
                        )}
                    </View>
                )}

                {/* ───────── MY CAMERA — hamesha mounted, sirf position/size badalta hai.
                    👉 FIX: stable `key` diya hai taaki React ise swap/toggle par
                    re-create na kare (yahi cause tha black-screen flash ka). */}
                {isJoined && (
                    <TouchableOpacity
                        key="local-video-tile"
                        style={showLocalBig ? styles.bigVideoWrap : styles.pipWrap}
                        activeOpacity={showLocalBig ? 1 : 0.85}
                        disabled={showLocalBig}
                        onPress={handleSwapViews}
                    >
                        {isCameraOn ? (
                            <RtcSurfaceView
                                canvas={{ uid: 0, renderMode: RenderModeType.RenderModeFit }}
                                style={styles.fillVideo}
                                zOrderMediaOverlay={true}
                            />
                        ) : (
                            // 👉 Camera off hone par black frame ki jagah clean placeholder —
                            // taaki lage feature hai, bug nahi.
                            <View style={styles.cameraOffPlaceholder}>
                                <MaterialIcons name="videocam-off" size={showLocalBig ? 36 : 22} color="#8a8a95" />
                                <Text style={styles.cameraOffText}>Camera off</Text>
                            </View>
                        )}
                        <View style={styles.nameTag}>
                            <Text style={styles.nameTagText}>You</Text>
                        </View>
                        {!showLocalBig && (
                            <View style={styles.swapHintBadge}>
                                <MaterialIcons name="flip-camera-android" size={14} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {/* ───────── DOCTOR CAMERA — hamesha mounted (jab available ho), sirf position/size badalta hai */}
                {remoteAvailable && (
                    <TouchableOpacity
                        key="remote-video-tile"
                        style={!showLocalBig ? styles.bigVideoWrap : styles.pipWrap}
                        activeOpacity={!showLocalBig ? 1 : 0.85}
                        disabled={!showLocalBig}
                        onPress={handleSwapViews}
                    >
                        <RtcSurfaceView
                            canvas={{ uid: remoteUid!, renderMode: RenderModeType.RenderModeFit }}
                            style={styles.fillVideo}
                        />
                        <View style={styles.nameTag}>
                            <Text style={styles.nameTagText} numberOfLines={1}>
                                {displayName}
                            </Text>
                        </View>
                        {showLocalBig && (
                            <View style={styles.swapHintBadge}>
                                <MaterialIcons name="flip-camera-android" size={14} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* ───────────── CONTROL BAR ───────────── */}
            <View style={styles.controlsBar}>
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={handleToggleMute}
                >
                    <MaterialIcons name={isMuted ? 'mic-off' : 'mic'} size={22} color="#fff" />
                    <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
                    onPress={handleToggleCamera}
                >
                    <MaterialIcons name={isCameraOn ? 'videocam' : 'videocam-off'} size={22} color="#fff" />
                    <Text style={styles.controlLabel}>{isCameraOn ? 'Cam off' : 'Cam on'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
                    <MaterialIcons name="call-end" size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
                    onPress={handleToggleSpeaker}
                >
                    <MaterialIcons name={isSpeakerOn ? 'volume-up' : 'hearing'} size={22} color="#fff" />
                    <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera}>
                    <MaterialIcons name="flip-camera-ios" size={22} color="#fff" />
                    <Text style={styles.controlLabel}>Flip</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// 👉 Fallback App ID — sirf tab use hoga agar backend token response me app_id na bheje.
const FALLBACK_APP_ID = 'b717053bd3f14a819ffd0c7b6490f169';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b0b0f', padding: 16 },
    title: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 16 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 14,
        backgroundColor: '#17171d',
        borderRadius: 16,
        padding: 10,
    },
    headerAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 12,
        backgroundColor: '#2a2a33',
    },
    headerAvatarFallback: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 12,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarInitials: { color: '#fff', fontSize: 16, fontWeight: '700' },
    headerTextBlock: { flex: 1 },
    headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
    headerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    headerStatusText: { color: '#9a9aa5', fontSize: 12.5 },

    errorBanner: {
        backgroundColor: '#d32f2f',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: { color: '#fff', fontSize: 13, flex: 1, marginRight: 8 },
    retryButton: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    retryText: { color: '#d32f2f', fontWeight: '600', fontSize: 12 },
    remoteContainer: { flex: 1, backgroundColor: '#111', borderRadius: 12, overflow: 'hidden' },
    fillVideo: { flex: 1 },

    bigVideoWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },

    pipWrap: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 104,
        height: 148,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        zIndex: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },

    // 👉 NEW: camera-off placeholder (local tile) — same size as fillVideo
    cameraOffPlaceholder: {
        flex: 1,
        backgroundColor: '#1c1c22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraOffText: { color: '#8a8a95', fontSize: 10.5, marginTop: 4 },

    nameTag: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 5,
    },
    nameTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },

    swapHintBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 10,
        padding: 4,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    loadingText: { color: '#aaa', textAlign: 'center', marginTop: 14, fontSize: 13.5 },

    pulseWrap: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    pulseRing: {
        position: 'absolute',
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#4f46e5',
    },
    pulseAvatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    pulseAvatarFallback: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    pulseAvatarInitials: { color: '#fff', fontSize: 28, fontWeight: '700' },

    // 👉 5 buttons ab fit karne hain, isliye gap kam kiya aur horizontal padding add kiya
    controlsBar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 6,
        backgroundColor: '#17171d',
        borderRadius: 24,
        paddingVertical: 12,
    },
    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a33',
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    controlButtonActive: {
        backgroundColor: '#4f46e5',
    },
    controlLabel: { color: '#ccc', fontSize: 9, marginTop: 2 },
    endButton: {
        backgroundColor: '#e53935',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#e53935',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default PatientVideoCallScreen;

// import React, { useRef, useState, useEffect, useCallback } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     PermissionsAndroid,
//     Platform,
//     TouchableOpacity,
// } from 'react-native';
// import {
//     createAgoraRtcEngine,
//     IRtcEngine,
//     IRtcEngineEventHandler,
//     RtcSurfaceView,
//     ChannelProfileType,
//     ClientRoleType,
// } from 'react-native-agora';
// import { SafeAreaView } from 'react-native-safe-area-context';


// // 👉 Agora console se mila hua App ID yahan daal
// const APP_ID = 'b717053bd3f14a819ffd0c7b6490f169';

// // 👉 Testing ke liye: Agora console -> Project -> "Primary Certificate" agar OFF hai (App ID Only mode),
// // toh TOKEN = '' rakh sakta hai. Agar Certificate ON hai (production), toh temp token console se generate
// // kar ya apna token server bana — verna joinChannel fail hoga (error code 110 aayega).
// const TOKEN = '007eJxTYNAIbEhSPebD8Gdi9FSPKXMe/0iQ/DohIVNsfcTs+Ihf8vUKDEnmhuYGpsZJKcZphiaJFoaWaWkpBsnmSWYmlgZphmaWDxXdshoCGRncVpxhYmSAQBCfh6EktbhENzkjMS8vNYeBAQAhDyHu';
// const CHANNEL_NAME = 'test-channel'; // dono users same channel name use karenge tabhi milenge
// const LOCAL_UID = 0; // 0 = Agora khud ek unique uid assign kar dega

// async function requestPermissions(): Promise<boolean> {
//     if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.requestMultiple([
//             PermissionsAndroid.PERMISSIONS.CAMERA,
//             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         ]);
//         return (
//             granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted' &&
//             granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted'
//         );
//     }
//     return true;
// }

// const VideoCallScreen: React.FC = () => {
//     const agoraEngineRef = useRef<IRtcEngine | null>(null);
//     const [isJoined, setIsJoined] = useState(false);
//     const [remoteUid, setRemoteUid] = useState<number | null>(null);
//     const [errorMsg, setErrorMsg] = useState<string | null>(null);

//     const setupEngine = useCallback(async () => {
//         try {
//             const hasPermission = await requestPermissions();
//             if (!hasPermission) {
//                 setErrorMsg('Camera/Mic permission denied — Settings me jaake allow karo.');
//                 return;
//             }

//             const agoraEngine = createAgoraRtcEngine();
//             agoraEngineRef.current = agoraEngine;

//             const eventHandler: IRtcEngineEventHandler = {
//                 onJoinChannelSuccess: () => {
//                     console.log('[Agora] Local join success');
//                     setIsJoined(true);
//                     setErrorMsg(null);
//                 },
//                 onUserJoined: (_connection, uid) => {
//                     console.log('[Agora] Remote user joined:', uid);
//                     setRemoteUid(uid);
//                 },
//                 onUserOffline: (_connection, uid) => {
//                     console.log('[Agora] Remote user left:', uid);
//                     setRemoteUid(prev => (prev === uid ? null : prev));
//                 },
//                 onError: (err, msg) => {
//                     console.log('[Agora] Error:', err, msg);
//                     // error 110 / 109 = token invalid/expired — App ID Only mode me TOKEN='' hona chahiye
//                     setErrorMsg(`Agora error ${err}: ${msg}`);
//                 },
//             };

//             agoraEngine.registerEventHandler(eventHandler);
//             agoraEngine.initialize({ appId: APP_ID });
//             agoraEngine.enableVideo();
//             agoraEngine.startPreview();

//             agoraEngine.joinChannel(TOKEN, CHANNEL_NAME, LOCAL_UID, {
//                 channelProfile: ChannelProfileType.ChannelProfileCommunication,
//                 clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//             });
//         } catch (e: any) {
//             console.log('[Agora] Setup failed:', e);
//             setErrorMsg(e?.message || 'Video call start nahi ho payi. Native build check karo.');
//         }
//     }, []);

//     useEffect(() => {
//         setupEngine();

//         return () => {
//             try {
//                 agoraEngineRef.current?.leaveChannel();
//                 agoraEngineRef.current?.unregisterEventHandler({} as IRtcEngineEventHandler);
//                 agoraEngineRef.current?.release();
//             } catch (e) {
//                 console.log('[Agora] Cleanup error:', e);
//             }
//             agoraEngineRef.current = null;
//         };
//     }, [setupEngine]);

//     const handleLeave = () => {
//         try {
//             agoraEngineRef.current?.leaveChannel();
//             setIsJoined(false);
//             setRemoteUid(null);
//         } catch (e) {
//             console.log('[Agora] Leave error:', e);
//         }
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <Text style={styles.title}>Video Call</Text>
//             <Text style={styles.subtitle}>Channel: {CHANNEL_NAME}</Text>

//             {errorMsg && (
//                 <View style={styles.errorBanner}>
//                     <Text style={styles.errorText}>{errorMsg}</Text>
//                 </View>
//             )}

//             {/* Remote user full screen */}
//             <View style={styles.remoteContainer}>
//                 {remoteUid !== null ? (
//                     <RtcSurfaceView
//                         canvas={{ uid: remoteUid }}
//                         style={styles.remoteVideo}
//                     />
//                 ) : (
//                     <View style={styles.loadingContainer}>
//                         <Text style={styles.loadingText}>
//                             {isJoined
//                                 ? 'Waiting for the doctor to join the consultation...'
//                                 : 'Connecting to the consultation...'}
//                         </Text>
//                     </View>
//                 )}

//                 {/* Local preview small box, top-right */}
//                 {isJoined && (
//                     <View style={styles.localPreviewBox}>
//                         <RtcSurfaceView canvas={{ uid: LOCAL_UID }} style={styles.localVideo} />
//                     </View>
//                 )}
//             </View>

//             <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
//                 <Text style={styles.leaveButtonText}>Call leave</Text>
//             </TouchableOpacity>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#000', padding: 16 },
//     title: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 10 },
//     subtitle: { color: '#aaa', fontSize: 13, marginTop: 4, marginBottom: 16 },
//     errorBanner: {
//         backgroundColor: '#d32f2f',
//         padding: 10,
//         borderRadius: 8,
//         marginBottom: 12,
//     },
//     errorText: { color: '#fff', fontSize: 13 },
//     remoteContainer: {
//         flex: 1,
//         backgroundColor: '#111',
//         borderRadius: 12,
//         overflow: 'hidden',
//     },
//     remoteVideo: { flex: 1 },
//     localPreviewBox: {
//         position: 'absolute',
//         top: 12,
//         right: 12,
//         width: 100,
//         height: 140,
//         borderRadius: 8,
//         overflow: 'hidden',
//         borderWidth: 1,
//         borderColor: '#444',
//     },
//     localVideo: { flex: 1 },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 24,
//     },
//     loadingText: { color: '#aaa', textAlign: 'center' },
//     leaveButton: {
//         backgroundColor: '#d32f2f',
//         paddingVertical: 14,
//         borderRadius: 10,
//         alignItems: 'center',
//         marginTop: 14,
//     },
//     leaveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
// });

// export default VideoCallScreen;
