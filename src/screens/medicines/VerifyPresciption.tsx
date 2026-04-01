import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, Animated, Easing } from 'react-native'
import React, { useRef, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'
import { Fonts } from '../../common/Fonts';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const VerifyPresciption = () => {

    const [patientName, setPatientName] = useState("Jonathan Doe");
    const [doctorName, setDoctorName] = useState("Dr. Sarah Williams");

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.container}>

            <AppHeader
                title="Verify Prescription"
                leftIcon={Images.backIcon}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
            >

                <View style={styles.header}>
                    <Text style={styles.stepText}>Step 2: Verify Prescription</Text>
                    <Text style={styles.count}>2 / 3</Text>
                </View>

                <View style={styles.progressBg}>
                    <View style={styles.progressFill} />
                </View>

                <View style={styles.loaderBox}>
                    <Animated.View style={[styles.loaderCircle, { transform: [{ rotate }] }]} />
                    <Text style={styles.loaderText}>
                        Extracting information from your prescription...
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Uploaded Prescription</Text>

                <Image
                    source={Images.doc1}
                    style={styles.prescriptionImg}
                />

                <View style={styles.verificationBox}>
                    <Animated.View style={[styles.smallLoader, { transform: [{ rotate }] }]} />
                    <View>
                        <Text style={styles.verificationTitle}>Verification Pending</Text>
                        <Text style={styles.verificationDesc}>
                            Our Specialist processing the text. This takes 12 to 24 hours.
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Confirm Extracted Details</Text>

                <View style={styles.inputBox}>
                    <Text style={styles.label}>PATIENT NAME</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            value={patientName}
                            onChangeText={setPatientName}
                            style={styles.input}
                        />
                        <Image source={Images.edit} style={styles.editIcon} />
                    </View>
                </View>

                <View style={styles.inputBox}>
                    <Text style={styles.label}>DOCTOR NAME</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            value={doctorName}
                            onChangeText={setDoctorName}
                            style={styles.input}
                        />
                        <Image source={Images.edit} style={styles.editIcon} />
                    </View>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.checkout}>
                <View style={styles.checkoutRow}>
                    <Text style={styles.checkoutText}>Confirm & Continue</Text>
                    <Image source={Images.arrowRight} style={styles.checkoutIcon} />
                </View>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

export default VerifyPresciption;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFB',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    stepText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    count: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold
    },

    progressBg: {
        height: 8,
        backgroundColor: '#0D614E33',
        borderRadius: 10,
        marginVertical: 10,
    },

    progressFill: {
        width: '66%',
        height: 8,
        backgroundColor: '#0D614E',
        borderRadius: 10,
    },

    loaderBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#0D614E66',
        borderRadius: 12,
        padding: 12,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    loaderCircle: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#0D614E',
        borderTopColor: 'transparent',
        marginRight: 10,
    },

    loaderText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    sectionTitle: {
        fontSize: 18,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        marginTop: 16,
        marginBottom: 8,
    },

    prescriptionImg: {
        width: '100%',
        height: 264,
        borderRadius: 20,
        marginBottom: 16,
    },

    verificationBox: {
        backgroundColor: '#0D614E0D',
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#0D614E1A'
    },

    smallLoader: {
        height: 20,
        width: 20,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#0D614E',
        borderTopColor: 'transparent',
        marginRight: 10,
    },

    verificationTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        paddingHorizontal: 10
    },

    verificationDesc: {
        fontSize: 14,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
        paddingHorizontal: 10
    },

    inputBox: {
        backgroundColor: '#fafafb',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    label: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsBold,
        letterSpacing: 0.5,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

    },

    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        paddingVertical: 0,
        paddingHorizontal: 0,
        includeFontPadding: false,
        lineHeight: 20, 
    },

    editIcon: {
        width: 18,
        height: 18,
        tintColor: '#94A3B8',
        marginLeft: 8,
    },

    checkout: {
        backgroundColor: '#0D614E',
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: 20
    },

    checkoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    checkoutText: {
        color: '#ffff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    checkoutIcon: {
        width: 24,
        height: 24,
        marginLeft: 8,
        tintColor: '#fff',
        top: -2
    },
});