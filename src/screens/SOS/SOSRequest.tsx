import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SOSHeader from '../../components/SOSHeader';
import { Fonts } from '../../common/Fonts';
import LottieView from 'lottie-react-native';

const SOSRequest = (props: any) => {

    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {

                if (prev <= 1) {
                    clearInterval(timer);

                    props.navigation.navigate('SOSConfirmed');

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);


        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFB" }}>

            <SOSHeader
                title="Emergency SOS"
                onBackPress={() => props.navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >

                <View style={styles.animationWrapper}>
                    <LottieView
                        source={require('../../assets/animations/success.json')}
                        autoPlay
                        loop={true}
                        style={{ width: 180, height: 180 }}
                    />
                </View>

                <Text style={styles.title}>SOS Request Sent!</Text>

                <Text style={styles.desc}>
                    Medical assistance is being dispatched to your current location.
                    Please stay calm and keep your line open.
                </Text>

                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                <Text style={styles.timerLabel}>Waiting Timer</Text>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => props.navigation.navigate('SOSCancel')}>
                    <Text style={styles.cancelText}>Cancel SOS</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    Average response time 5-10 mins
                </Text>
                <Text style={styles.footerText2}>
                    Ref: #SOS-8821
                </Text>

            </ScrollView>

        </SafeAreaView>
    )
}

export default SOSRequest;

const styles = StyleSheet.create({

    container: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        alignItems: 'center'
    },

    animationWrapper: {
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    lottie: {
        width: 180,
        height: 180,
    },

    title: {
        fontSize: 24,
        color: "#0D614E",
        fontFamily: Fonts.PoppinsSemiBold,
        marginTop: 10
    },

    desc: {
        textAlign: 'center',
        color: "#64748B",
        fontSize: 16,
        marginTop: 10,
        lineHeight: 26,
        fontFamily: Fonts.PoppinsMedium,
        paddingHorizontal: 10
    },

    timer: {
        fontSize: 40,
        color: "#10B981",
        marginTop: 25,
        fontFamily: Fonts.PoppinsBold
    },

    timerLabel: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
        fontFamily: Fonts.PoppinsSemiBold
    },

    cancelBtn: {
        width: "100%",
        backgroundColor: "#F43F5E0D",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 30,
        borderWidth: 1.2,
        borderColor: "#F43F5E1A"
    },

    cancelText: {
        color: "#F43F5E",
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    footerText: {
        textAlign: "center",
        fontSize: 14,
        color: "#334155",
        marginTop: 20,
        fontFamily: Fonts.PoppinsMedium
    },

    footerText2: {
        textAlign: "center",
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
        fontFamily: Fonts.PoppinsMedium
    },
});