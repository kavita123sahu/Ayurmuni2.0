import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    StyleSheet,
} from 'react-native';

import {
    createAgoraRtcEngine,
    IRtcEngine,
    ChannelProfileType,
    ClientRoleType,
    RtcSurfaceView,
} from 'react-native-agora';

const APP_ID = 'ac075395befb41729d00203d7f553935';

const CHANNEL_NAME = 'consult_demo';

const VideoCallScreen = () => {
    const [engine, setEngine] = useState<IRtcEngine | null>(null);

    const [joined, setJoined] = useState(false);

    const [remoteUsers, setRemoteUsers] = useState<number[]>([]);

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);
        }
    };

    useEffect(() => {
        setupAgora();

        return () => {
            if (engine) {
                engine.leaveChannel();
                engine.release();
            }
        };
    }, []);

    const setupAgora = async () => {
        await requestPermissions();

        const agoraEngine = createAgoraRtcEngine();

        agoraEngine.initialize({
            appId: APP_ID,
        });

        agoraEngine.enableVideo();

        agoraEngine.startPreview();

        agoraEngine.registerEventHandler({
            onJoinChannelSuccess: () => {
                console.log('Joined');
                setJoined(true);
            },

            onUserJoined: (_, uid) => {
                console.log('Remote Joined', uid);

                setRemoteUsers(prev => {
                    if (prev.includes(uid)) {
                        return prev;
                    }
                    return [...prev, uid];
                });
            },

            onUserOffline: (_, uid) => {
                console.log('Remote Left', uid);

                setRemoteUsers(prev =>
                    prev.filter(item => item !== uid),
                );
            },
        });

        setEngine(agoraEngine);
    };

    const joinCall = async () => {
        if (!engine) {
            return;
        }

        engine.joinChannel(
            '',
            CHANNEL_NAME,
            0,
            {
                channelProfile:
                    ChannelProfileType.ChannelProfileCommunication,

                clientRoleType:
                    ClientRoleType.ClientRoleBroadcaster,
            },
        );
    };

    const leaveCall = async () => {
        if (!engine) {
            return;
        }

        engine.leaveChannel();

        setJoined(false);

        setRemoteUsers([]);
    };

    return (
        <View style={styles.container}>
            {!joined ? (
                <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={joinCall}>
                    <Text style={styles.btnText}>
                        Join Call
                    </Text>
                </TouchableOpacity>
            ) : (
                <>
                    {/* Local User */}

                    <View style={styles.localContainer}>
                        <RtcSurfaceView
                            canvas={{
                                uid: 0,
                            }}
                            style={styles.localVideo}
                        />
                    </View>

                    {/* Remote Users */}

                    {remoteUsers.map(uid => (
                        <View
                            key={uid}
                            style={styles.remoteContainer}>
                            <RtcSurfaceView
                                canvas={{
                                    uid,
                                }}
                                style={styles.remoteVideo}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.leaveBtn}
                        onPress={leaveCall}>
                        <Text style={styles.btnText}>
                            Leave Call
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    localContainer: {
        flex: 1,
    },

    remoteContainer: {
        height: 200,
        marginTop: 10,
    },

    localVideo: {
        flex: 1,
    },

    remoteVideo: {
        flex: 1,
    },

    joinBtn: {
        height: 55,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 10,
    },

    leaveBtn: {
        height: 55,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 10,
    },

    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});