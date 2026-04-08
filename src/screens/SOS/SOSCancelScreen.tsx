import React from 'react';
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

const SOSCancelScreen = (props : any) => {

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFB" }}>

            <SOSHeader
                title="Emergency SOS"
                onBackPress={() =>props.navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.animationWrapper}>
                    <LottieView
                        source={require('../../assets/animations/alert.json')} // ✅ yaha change
                        autoPlay
                        loop
                        style={{ width: 180, height: 180 }}
                    />
                </View>

                <Text style={styles.title}>
                    Are you sure you want to cancel your SOS request?
                </Text>

                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        Cancelling this request will immediately halt all dispatched
                        medical assistance. Your assigned doctor will be recalled and
                        emergency services will be notified of the stand-down.
                    </Text>
                </View>

                <TouchableOpacity style={styles.keepBtn}>
                    <Text style={styles.keepText}>Keep SOS Active</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Confirm Cancellation</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>SOS ID: #SOS-8821</Text>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SOSCancelScreen;

const styles = StyleSheet.create({

    container: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        alignItems: 'center',
        backgroundColor: "#FDFDFB"
    },

    animationWrapper: {
        height: 220,
        width: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        color: "#0F172A",
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
        marginTop: 20,
    },

    infoCard: {
        marginTop: 20,
        padding: 24,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 2,
        borderLeftColor: "#0D614E",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 3,
        marginBottom: 10
    },

    infoText: {
        fontSize: 16,
        color: "#475569",
        fontFamily: Fonts.PoppinsMedium,
        lineHeight: 28,
    },

    keepBtn: {
        width: "100%",
        backgroundColor: "#0D614E",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 25
    },

    keepText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    cancelBtn: {
        width: "100%",
        backgroundColor: "#F43F5E0D",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#F43F5E1A"
    },

    cancelText: {
        color: "#F43F5E",
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    footer: {
        marginTop: 20,
        fontSize: 14,
        color: "#94A3B8",
        fontFamily: Fonts.PoppinsMedium,
    },
});