// AyurMuni — Patient Video Call Screen (React Native)
// Install: npm install react-native-agora axios
//          cd ios && pod install

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
} from "react-native";
import {
    createAgoraRtcEngine,
    IRtcEngine,
    ChannelProfileType,
    ClientRoleType,
    RtcSurfaceView,
    VideoSourceType,
} from "react-native-agora";
import { useNavigation } from '@react-navigation/native';

import axios from "axios";

// ─── API helper ───────────────────────────────────────────────
const API_BASE = "https://ayurmuni-backend.onrender.com";

async function fetchAgoraToken(consultationId: any, authToken: any) {
    const { data } = await axios.post(
        `${API_BASE}/consultations/${consultationId}/token/`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return data; // { token, channel, uid, app_id }
}

async function markEnded(consultationId: any, authToken: any) {
    await axios.post(
        `${API_BASE}/consultations/${consultationId}/end/`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
    );
}

// ─── Android permissions ──────────────────────────────────────
async function requestAndroidPermissions() {
    if (Platform.OS !== "android") return true;
    const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return (
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
    );
}

// ─── Main screen ──────────────────────────────────────────────
export default function PatientVideoCallScreen({
    //   consultationId,
    //   authToken,
    //   doctorName,
    //   navigation,
}) {
    const [callState, setCallState] = useState("idle"); // idle | joining | active | ended
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [doctorJoined, setDoctorJoined] = useState(false);
    const [duration, setDuration] = useState(0);
    const navigation = useNavigation();

    const consultationId = "123456";
    const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgxNDUwMzg5LCJpYXQiOjE3ODEzNjM5ODksImp0aSI6IjU1YjFhZDhlMzJhMzQyZjU5ZjY5YjExMzNkMTRkNWU4IiwidXNlcl9pZCI6IjI4ZTQ4MTZjLTRiZjQtNDUwYS1iN2ZkLTkyZWUwOTc3MjU1YyIsInJvbGUiOiJjdXN0b21lciIsImN1c3RvbWVyX2lkIjoiNGI2NjA1ZDctY2EzZi00NDkzLTk5ZTMtYzdkYTNiNGMxMWI4IiwicGF0aWVudF9pZCI6ImRhMDEzZGYwLWM3MDAtNDE2MS1iNjNjLTBkOGVhOGEzZTM1YiIsInZlbmRvcl9pZCI6bnVsbCwiZG9jdG9yX2lkIjpudWxsfQ.TTZfCBjAZN9uB3_JQIvJCPdh0bI7568UlL-NPROV4sM";
    const doctorName = "Amit Sharma";


    const [doctorUid, setDoctorUid] = useState<number | null>(null);

    const engineRef = useRef<IRtcEngine | null>(null);

    const timerRef = useRef<any>(null);

    const myUidRef = useRef<number | null>(null);



    // ── Join call ─────────────────────────────────────────────
    const joinCall = useCallback(async () => {
        setCallState("joining");

        // 1. Request permissions (Android)
        const hasPermission = await requestAndroidPermissions();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Camera and microphone access are required for the consultation.");
            setCallState("idle");
            return;
        }

        try {
            // 2. Fetch token from Django backend
            const { token, channel, uid, app_id } = await fetchAgoraToken(consultationId, authToken);
            myUidRef.current = uid;

            // 3. Create Agora engine
            const engine = createAgoraRtcEngine();
            engineRef.current = engine;

            engine.initialize({
                appId: app_id,
                channelProfile: ChannelProfileType.ChannelProfileCommunication,
            });

            // 4. Event listeners
            engine.addListener("onUserJoined", (connection, remoteUid) => {
                setDoctorUid(remoteUid);
                setDoctorJoined(true);
            });

            engine.addListener("onUserOffline", () => {
                setDoctorJoined(false);
                setDoctorUid(null);
            });

            engine.addListener("onError", (errorCode) => {
                console.error("Agora error:", errorCode);
            });

            // 5. Enable video
            engine.enableVideo();
            engine.startPreview();

            // 6. Join channel
            await engine.joinChannel(token, channel, uid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });

            setCallState("active");

            // Start duration timer
            timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

        } catch (err) {
            console.error("Error joining call:", err);
            Alert.alert("Connection Error", "Could not connect to the consultation. Please try again.");
            setCallState("idle");
        }
    }, [consultationId, authToken]);

    // ── Leave call ────────────────────────────────────────────
    const leaveCall = useCallback(async () => {
        clearInterval(timerRef.current);

        if (engineRef.current) {
            engineRef.current.leaveChannel();
            engineRef.current.stopPreview();
            engineRef.current.release();
            engineRef.current = null;
        }

        await markEnded(consultationId, authToken);
        setCallState("ended");
    }, [consultationId, authToken]);

    // ── Confirm before leaving ────────────────────────────────
    const confirmLeave = () => {
        Alert.alert(
            "End Consultation",
            "Are you sure you want to end the consultation?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "End Call", onPress: leaveCall, style: "destructive" },
            ]
        );
    };

    // ── Toggle mic ────────────────────────────────────────────
    const toggleMic = () => {
        engineRef.current?.muteLocalAudioStream(!isMuted);
        setIsMuted((m) => !m);
    };

    // ── Toggle camera ─────────────────────────────────────────
    const toggleCamera = () => {
        engineRef.current?.muteLocalVideoStream(!isCameraOff);
        setIsCameraOff((c) => !c);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            engineRef.current?.leaveChannel();
            engineRef.current?.release();
        };
    }, []);

    const formatDuration = (secs: any) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────

    if (callState === "ended") {
        return (
            <SafeAreaView style={styles.endedContainer}>
                <Text style={styles.endedTitle}>Consultation Ended</Text>
                <Text style={styles.endedSub}>Duration: {formatDuration(duration)}</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

            {/* ── Remote video (doctor) — full screen ── */}
            <View style={styles.remoteVideoContainer}>
                {doctorJoined && doctorUid !== null ? (
                    <RtcSurfaceView
                        style={styles.remoteVideo}
                        canvas={{ uid: doctorUid, sourceType: VideoSourceType.VideoSourceRemote }}
                    />
                ) : (
                    <View style={styles.waitingBox}>
                        {callState === "joining" ? (
                            <>
                                <ActivityIndicator size="large" color="#00e0c7" />
                                <Text style={styles.waitingText}>Connecting to consultation…</Text>
                            </>
                        ) : callState === "active" ? (
                            <Text style={styles.waitingText}>
                                Waiting for Dr. {doctorName} to join…
                            </Text>
                        ) : (
                            <Text style={styles.waitingText}>
                                Your consultation with Dr. {doctorName}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* ── Local video (patient) — PiP ── */}
            {callState === "active" && (
                <View style={styles.localVideoContainer}>
                    <RtcSurfaceView
                        style={styles.localVideo}
                        canvas={{ uid: 0, sourceType: VideoSourceType.VideoSourceCamera }}
                        zOrderMediaOverlay={true}
                    />
                    {isCameraOff && (
                        <View style={styles.cameraOffOverlay}>
                            <Text style={{ color: "#aaa", fontSize: 12 }}>Camera off</Text>
                        </View>
                    )}
                </View>
            )}

            {/* ── Duration badge ── */}
            {callState === "active" && (
                <View style={styles.timerBadge}>
                    <Text style={styles.timerText}>{formatDuration(duration)}</Text>
                </View>
            )}

            {/* ── Doctor name badge ── */}
            {doctorJoined && (
                <View style={styles.doctorBadge}>
                    <Text style={styles.doctorBadgeText}>Dr. {doctorName}</Text>
                </View>
            )}

            {/* ── Controls ── */}
            <SafeAreaView style={styles.controls}>
                {callState === "idle" && (
                    <TouchableOpacity style={styles.startBtn} onPress={joinCall}>
                        <Text style={styles.startBtnText}>Join Consultation</Text>
                    </TouchableOpacity>
                )}

                {callState === "active" && (
                    <View style={styles.activeControls}>
                        <TouchableOpacity
                            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                            onPress={toggleMic}
                        >
                            <Text style={styles.controlBtnText}>{isMuted ? "Unmute" : "Mute"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.endBtn} onPress={confirmLeave}>
                            <Text style={styles.endBtnText}>End Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]}
                            onPress={toggleCamera}
                        >
                            <Text style={styles.controlBtnText}>{isCameraOff ? "Camera On" : "Camera Off"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0d0d1a",
    },
    remoteVideoContainer: {
        flex: 1,
    },
    remoteVideo: {
        flex: 1,
    },
    waitingBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    waitingText: {
        color: "#aaa",
        fontSize: 16,
        marginTop: 12,
        textAlign: "center",
        paddingHorizontal: 32,
    },
    localVideoContainer: {
        position: "absolute",
        top: 50,
        right: 16,
        width: 100,
        height: 140,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.2)",
    },
    localVideo: {
        width: "100%",
        height: "100%",
    },
    cameraOffOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#222",
        justifyContent: "center",
        alignItems: "center",
    },
    timerBadge: {
        position: "absolute",
        top: 16,
        left: 16,
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    timerText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 1,
    },
    doctorBadge: {
        position: "absolute",
        bottom: 110,
        left: 16,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    doctorBadgeText: {
        color: "#fff",
        fontSize: 13,
    },
    controls: {
        backgroundColor: "#16213e",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    startBtn: {
        backgroundColor: "#00897b",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 8,
    },
    startBtnText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    activeControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    controlBtn: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 6,
        borderRadius: 10,
        backgroundColor: "#2a2a4a",
        alignItems: "center",
    },
    controlBtnActive: {
        backgroundColor: "#e65c00",
    },
    controlBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    endBtn: {
        flex: 1.4,
        paddingVertical: 12,
        marginHorizontal: 6,
        borderRadius: 10,
        backgroundColor: "#c0392b",
        alignItems: "center",
    },
    endBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    endedContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 32,
    },
    endedTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    endedSub: {
        fontSize: 16,
        color: "#666",
        marginBottom: 32,
    },
    backBtn: {
        backgroundColor: "#00897b",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    backBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});