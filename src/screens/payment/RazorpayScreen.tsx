// BookingConfirmScreen.tsx

import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
    BackHandler,
    Alert,
    Modal,
    ScrollView,
} from 'react-native';

import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { apiClient } from '../../services/APIconfig';
import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import {
    useFocusEffect,
} from '@react-navigation/native';

import RazorpayCheckout from 'react-native-razorpay';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';

import {
    showSuccessToast,
} from '../../config/Key';
import { Ionicons } from '../../common/Vector';
import { openRazorpayPayment } from '../../services/RazorpayService';
import { Utils } from '../../common/Utils';

const STORAGE_KEY = 'SELECTED_SLOT';


/* -------------------------------------------------------------------------- */
/*                                   SCREEN                                   */
/* -------------------------------------------------------------------------- */

const RazorpayScreen = ({
    route,
    navigation,
}: any) => {

    const {
        doctorData,
        slotId,
        date,
        concern,
        selectedTime,
    } = route?.params || {};



    console.log("paymentdatatta",
        slotId,
        date,
        concern,
        selectedTime,)

    /* -------------------------------------------------------------------------- */
    /*                                   STATES                                   */
    /* -------------------------------------------------------------------------- */

    const [loading, setLoading] =
        useState(false);

    const [isVerifyingPayment, setIsVerifyingPayment] =
        useState(false);

    const paymentStartedRef =
        useRef(false);




    // const confirmExit = useCallback(() => {
    //     Alert.alert(
    //         'Cancel payment',
    //         'Do you want to cancel payment?',
    //         [
    //             {
    //                 text: 'No',
    //                 style: 'cancel',
    //             },
    //             {
    //                 text: 'Yes',
    //                 onPress: async () => {
    //                     // Clear local reservation
    //                     try {
    //                         await Utils.storeData(STORAGE_KEY, null);
    //                     } catch (e) {
    //                         console.log('clear storage error', e);
    //                     }
    //                     navigation.goBack();
    //                 },
    //             },
    //         ],
    //         { cancelable: true },
    //     );
    // }, [navigation]);

    /* -------------------------------------------------------------------------- */
    /*                             DISABLE BACK PRESS                             */
    /* -------------------------------------------------------------------------- */

    // useFocusEffect(
    //     useCallback(() => {

    //         const onBackPress = () => {
    //             confirmExit();
    //             return true;
    //         };

    //         const subscription = BackHandler.addEventListener(
    //             'hardwareBackPress',
    //             onBackPress,
    //         );

    //         return () => subscription.remove();

    //     }, [confirmExit]),
    // );

    /* -------------------------------------------------------------------------- */
    /*                                PRICE DATA                                  */
    /* -------------------------------------------------------------------------- */

    const totalAmount = useMemo(() => {

        return Number(
            doctorData?.consult_fee?.amount || 0,
        );

    }, [doctorData]);

    /* -------------------------------------------------------------------------- */
    /*                              PAYMENT HANDLER                               */
    /* -------------------------------------------------------------------------- */

    const handlePayment = async () => {
        if (loading || paymentStartedRef.current) return;

        try {
            setLoading(true);
            paymentStartedRef.current = true;

            const paymentResponse =
                await _CONSULT_SERVICES.createConsultationPayment({
                    slot_id: slotId,
                    concern: concern

                });

            console.log("paymentResponse", paymentResponse);
            if (!paymentResponse?.success) {

                showSuccessToast(paymentResponse?.message, 'error');
                return;
            }

            const paymentData = paymentResponse?.data;

            const contactNumber = String(doctorData?.phone_number || '')
                .replace(/\D/g, '');

            await openRazorpayPayment({
                key: paymentData?.razorpay_key,
                amount: Number(paymentData?.amount) * 100,
                order_id: paymentData?.razorpay_order_id,
                name: doctorData?.full_name,
                email: doctorData?.email || 'test@gmail.com',
                contact: `91${contactNumber}`,
                themeColor: Colors.primaryColor,
            })
                .then(async (razorpayResult: any) => {
                    setIsVerifyingPayment(true);

                    const verifyResponse =
                        await _CONSULT_SERVICES.verifyConsultationPayment({
                            payment_id: paymentData?.payment_id,
                            razorpay_order_id: paymentData?.razorpay_order_id,
                            razorpay_payment_id: razorpayResult?.razorpay_payment_id,
                            razorpay_signature: razorpayResult?.razorpay_signature,
                        });

                    setIsVerifyingPayment(false);

                    console.log("verfiyResposne", verifyResponse);

                    const SlotsDetail = verifyResponse?.data;
                    if (verifyResponse?.success) {
                        setIsVerifyingPayment(false);

                        showSuccessToast('Payment Successful', 'success');
                        // Clear local reservation after successful payment
                        try {
                            await Utils.storeData(STORAGE_KEY, null);
                        } catch (e) {
                            console.log('clear storage on success error', e);
                        }
                        navigation.navigate('BookingConfrimScreen', {

                            SlotsDetail
                        });

                        // , {
                        //     doctorData,
                        //     date,
                        //     concern,
                        //     selectedTime,
                        // }
                    } else {
                        setIsVerifyingPayment(false);
                        showSuccessToast('Payment verification failed', 'error');
                    }
                })
                .catch(async () => {
                    setIsVerifyingPayment(false);

                    showSuccessToast('Payment cancelled', 'error');
                    paymentStartedRef.current = false;

                });
        } catch (error) {
            setIsVerifyingPayment(false);

            showSuccessToast('Something went wrong', 'error');
        } finally {

            setLoading(false);
            paymentStartedRef.current = false;
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                   RENDER                                   */
    /* -------------------------------------------------------------------------- */

    return (
        <>
            {!isVerifyingPayment && (
                <SafeAreaView style={styles.container}>

                    <StatusBar
                        backgroundColor="#FFFFFF"
                        barStyle="dark-content"
                    />

                    {/* HEADER */}

                    <View style={styles.header}>

                        {/* {
                    !paymentProcessing && ( */}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.goBack()}
                        >
                            <Image
                                source={Images.backIcon}
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>
                        {/* )
                } */}

                        <Text style={styles.headerTitle}>
                            Confirm Booking
                        </Text>

                        <View style={{ width: 40 }} />

                    </View>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 30,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* DOCTOR CARD */}

                        <View style={styles.card}>

                            <View style={styles.row}>

                                <Image
                                    source={Images.doctorImage}
                                    style={styles.avatar}
                                />

                                <View style={{ flex: 1 }}>

                                    <Text style={styles.doctorName}>
                                        {doctorData?.full_name}
                                    </Text>

                                    <Text style={styles.speciality}>
                                        {doctorData?.designation}
                                    </Text>

                                </View>

                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>
                                    Appointment Date
                                </Text>

                                <Text style={styles.value}>
                                    {date}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>
                                    Consultation Time
                                </Text>

                                <Text style={styles.value}>
                                    {selectedTime}
                                </Text>
                            </View>

                            {concern ? (
                                <View style={styles.concernSection}>
                                    <Text style={styles.label}>
                                        Concern
                                    </Text>
                                    <Text style={styles.concernValue}>
                                        {concern}
                                    </Text>
                                </View>
                            ) : null}

                        </View>

                        {/* PAYMENT CARD */}

                        <View style={styles.paymentCard}>

                            <View style={styles.amountRow}>

                                <Text style={styles.totalLabel}>
                                    Total Amount
                                </Text>

                                <Text style={styles.totalAmount}>
                                    ₹ {totalAmount}
                                </Text>

                            </View>

                            <View style={styles.paymentInfo}>

                                <Ionicons
                                    name="shield-checkmark"
                                    size={18}
                                    color={Colors.primaryColor}
                                />

                                <Text style={styles.paymentInfoText}>
                                    Secure payment powered by Razorpay
                                </Text>

                            </View>

                        </View>

                        {/* BUTTON */}

                        <View style={styles.footer}>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                disabled={loading}
                                onPress={handlePayment}
                                style={[
                                    styles.payButton,

                                    loading && {
                                        opacity: 0.7,
                                    },
                                ]}
                            >

                                {
                                    loading ? (

                                        <View style={styles.loaderRow}>

                                            <ActivityIndicator
                                                size="small"
                                                color="#FFFFFF"
                                            />

                                            <Text style={styles.payText}>
                                                Processing Payment...
                                            </Text>

                                        </View>

                                    ) : (

                                        <View style={styles.buttonContent}>
                                            <Ionicons
                                                name="card-outline"
                                                size={20}
                                                color="#FFFFFF"
                                            />

                                            <Text style={styles.payText}>
                                                Pay Now
                                            </Text>
                                        </View>
                                    )
                                }

                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.8} style={styles.cancelButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelText}> Cancel Payment </Text>
                            </TouchableOpacity>

                        </View>

                    </ScrollView>


                </SafeAreaView>)}

            <Modal
                visible={isVerifyingPayment}
                animationType="fade"
                transparent={false}
            >
                <SafeAreaView style={styles.verificationScreen}>
                    <View style={styles.verificationContent}>

                        <ActivityIndicator
                            size="large"
                            color={Colors.primaryColor}
                        />

                        <Text style={styles.verificationTitle}>
                            Verifying Payment
                        </Text>

                        <Text style={styles.verificationSubtitle}>
                            Please wait while we confirm your transaction.
                        </Text>

                        <View style={styles.verificationInfo}>
                            <Ionicons
                                name="shield-checkmark"
                                size={18}
                                color={Colors.primaryColor}
                            />

                            <Text style={styles.verificationInfoText}>
                                Do not press back or close the app
                            </Text>
                        </View>

                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
};

export default RazorpayScreen;

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 20,
        paddingTop: 10,
    },

    backIcon: {
        width: 40,
        height: 40,
    },

    headerTitle: {
        fontSize: 20,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    card: {
        backgroundColor: '#FFFFFF',

        marginHorizontal: 20,
        marginTop: 30,

        borderRadius: 24,

        padding: 18,

        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: 70,
        height: 70,

        borderRadius: 18,

        marginRight: 14,
    },

    doctorName: {
        fontSize: 18,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    speciality: {
        marginTop: -4,

        fontSize: 14,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    divider: {
        height: 1,

        backgroundColor: '#E2E8F0',

        marginVertical: 18,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',

        marginBottom: 14,
    },

    label: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    value: {
        flex: 1,

        textAlign: 'right',

        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    concernSection: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },

    concernValue: {
        marginTop: 8,
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 18,
    },

    paymentCard: {
        backgroundColor: '#FFFFFF',

        marginHorizontal: 20,
        marginTop: 20,

        borderRadius: 24,

        padding: 18,

        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    totalLabel: {
        fontSize: 16,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    totalAmount: {
        fontSize: 28,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsBold,
    },

    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 14,
    },

    paymentInfoText: {
        marginLeft: 8,

        fontSize: 13,
        color: '#64748B',

        fontFamily: Fonts.PoppinsMedium,
    },

    footer: {
        marginTop: 'auto',

        paddingHorizontal: 20,
        paddingBottom: 24,
    },

    payButton: {
        height: 58,

        borderRadius: 18,

        backgroundColor: Colors.primaryColor,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },

    loaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    payText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    paymentProcessingContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 20,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },

    processingTitle: {
        marginTop: 16,
        fontSize: 18,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    cancelButton: {
        marginTop: 20,
        height: 46,
        minWidth: 160,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    cancelText: {
        color: '#EF4444',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    verificationScreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    verificationContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    verificationTitle: {
        marginTop: 24,
        fontSize: 22,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    verificationSubtitle: {
        marginTop: 10,
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: Fonts.PoppinsRegular,
    },

    verificationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
    },

    verificationInfoText: {
        marginLeft: 8,
        color: '#475569',
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
    },

});