import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import SOSHeader from '../../components/SOSHeader';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';

const SOSConfirmed = (props : any) => {

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFB" }}>

            <SOSHeader
                title="SOS Confirmed"
                onBackPress={() => props.navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <LinearGradient
                    colors={[
                        'transparent',
                        'rgba(182,23,34,0.02)',
                        'rgba(182,23,34,0.04)',
                        'rgba(182,23,34,0.06)',
                        'rgba(182,23,34,0.08)',
                    ]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.gradientBlur}
                />

                <View style={styles.imageWrapper}>
                    <Image
                        source={Images.doctorImage}
                        style={styles.doctorImage}
                    />
                </View>

                <Text style={styles.title}>
                    Dr. Arjun R Nair has accepted your request
                </Text>

                <Text style={styles.subtitle}>
                    He will connect with you shortly.
                </Text>

                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        “Please stay on this screen. Your video call will start automatically.”
                    </Text>
                </View>

                <TouchableOpacity style={styles.primaryBtn}>
                    <Text style={styles.primaryText}>Join Video Consultation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={()=> props.navigation.navigate('SOSCancel')}>
                    <Text style={styles.secondaryText}>Cancel SOS</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>
                    REF ID: #SOS-992-ARJUN
                </Text>

            </ScrollView>

        </SafeAreaView>
    )
}

export default SOSConfirmed;

const styles = StyleSheet.create({

    container: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        alignItems: 'center'
    },

    gradientBlur: {
        position: 'absolute',
        top: 300,
        width: 3000,
        height: 600,
        borderRadius: 250,
        alignSelf: 'center',
    },

    imageWrapper: {
        width:224,
        height: 224,
        backgroundColor:Colors.fieldGrayColor,
        marginBottom:40,
        borderRadius: 40,
    },

    doctorImage: {
        width:224,
        height: 224,
        borderRadius: 40,
    },

    title: {
        fontSize: 30,
        textAlign: 'center',
        color: "#0F172A",
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 38,
        marginBottom:20

    },

    subtitle: {
        fontSize: 18,
        color: "#0D614E",
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom:30
    },

    infoCard: {
        padding: 20,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 2,
        borderColor: "#0D614E",
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 15,
        marginBottom:20
    },

    infoText: {
        fontSize: 14,
        color: "#3F4948",
        fontFamily: Fonts.PoppinsMedium,
        textAlign: 'center'
    },

    primaryBtn: {
        width: "100%",
        backgroundColor: "#0D614E",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 25
    },

    primaryText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    secondaryBtn: {
        width: "100%",
        backgroundColor: "#FEE2E2",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 12,
        borderColor:"#F43F5E1A",
        borderWidth:1,
    },

    secondaryText: {
        color: "#F43F5E",
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        
    },

    footer: {
        marginTop: 20,
        fontSize: 14,
        color: "#64748B",
        fontFamily: Fonts.PoppinsMedium,
    },
});