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
import BackIconButton from '../../components/BackIconButton';
import { formatTo12Hour } from '../../common/DataInterface';
import { RupeeAmount } from '../../utils/currencyUtils';

const STORAGE_KEY = 'SELECTED_SLOT';


/* -------------------------------------------------------------------------- */
/*                                   SCREEN                                   */
/* -------------------------------------------------------------------------- */

const RazorpayScreen = ({
    route,
    navigation,
}: any) => {

    const {
        doctorInfo,
        slotId,
        date,
        concern,
        patientsList,
        selectedTime, medical_record_ids
    } = route?.params || {};


    console.log("doctorInfodoctorInfodoctorInfo",
        patientsList,
    )



    /* -------------------------------------------------------------------------- */
    /*                                   STATES                                   */
    /* -------------------------------------------------------------------------- */

    const [loading, setLoading] =
        useState(false);

    const [isVerifyingPayment, setIsVerifyingPayment] =
        useState(false);

    const paymentStartedRef =
        useRef(false);




    const totalAmount = useMemo(() => {

        return Number(
            slotId?.amount || 0,
        );

    }, [slotId]);

    useFocusEffect(
        React.useCallback(() => {
            if (!isVerifyingPayment) return;

            const onBackPress = () => true;

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress,
            );

            return () => {
                subscription.remove();
            };
        }, [isVerifyingPayment]),
    );

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
                    slot_id: slotId?.id,
                    concern: concern,
                    medical_record_ids: medical_record_ids

                });

            console.log("bookslottttttornottt", paymentResponse);
            if (!paymentResponse?.success) {

                showSuccessToast(paymentResponse?.message, 'error');
                return;
            }

            const paymentData = paymentResponse?.data;

            const contactNumber = String(doctorInfo?.phone_number || '')
                .replace(/\D/g, '');

            await openRazorpayPayment({
                key: paymentData?.razorpay_key,
                amount: Number(paymentData?.amount) * 100,
                order_id: paymentData?.razorpay_order_id,
                name: doctorInfo?.full_name,
                email: doctorInfo?.email || 'test@gmail.com',
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
                        console.log("yessssssssssssss")
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
                        //     doctorInfo,
                        //     date,
                        //     concern,
                        //     selectedTime,
                        // }
                    } else {
                        console.log("noooooooooooooooo")
                        setIsVerifyingPayment(false);
                        showSuccessToast('Payment verification failed', 'error');
                    }
                })
                // .catch(async () => {
                //     setIsVerifyingPayment(false);
                //     showSuccessToast('Payment cancelled', 'error');
                //     paymentStartedRef.current = false;

                // });
                .catch(async (error: any) => {
                    setIsVerifyingPayment(false);
                    paymentStartedRef.current = false;

                    console.log("Razorpay Error:", error);

                    // Payment cancel / exit
                    if (
                        error?.code === RazorpayCheckout.PAYMENT_CANCELLED ||
                        error?.description?.toLowerCase().includes('cancel') ||
                        error?.description?.toLowerCase().includes('dismiss') ||
                        error?.description?.toLowerCase().includes('exit')
                    ) {
                        // Clear reserved slot if needed
                        try {
                            await Utils.storeData(STORAGE_KEY, null);
                        } catch (e) {
                            console.log(e);
                        }

                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'HomeScreen' }],
                        });

                        return;
                    }

                    showSuccessToast('Payment Failed', 'error');
                });
        } catch (error) {
            setIsVerifyingPayment(false);

            showSuccessToast('Something went wrong', 'error');
        } finally {

            setLoading(false);
            paymentStartedRef.current = false;
        }
    };
    const CommonLabelText = ({
        label,
        value,
    }: {
        label: string;
        value: string;
    }) => {
        return (
            <View style={styles.infoRow}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        );
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

                        <BackIconButton
                            disabled={isVerifyingPayment}
                            onPress={() => {
                                if (isVerifyingPayment) return;
                                navigation.goBack();
                            }}
                        />

                        {/* <BackIconButton onPress={() => navigation.goBack()} /> */}
                        {/* )
                } */}

                        <Text style={styles.headerTitle}>
                            Confirm Booking
                        </Text>

                        <View style={{ width: 40 }} />

                    </View>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.card}>
                            <View style={styles.row}>
                                {doctorInfo?.profile_image ? (
                                    <View style={[styles.avatarFallback, styles.avatarImageWrap]}>
                                        <Image
                                            source={{ uri: doctorInfo?.profile_image }}
                                            style={styles.avatar}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarLetter}>
                                            {doctorInfo?.full_name?.charAt(0)?.toUpperCase() || ''}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.doctorMeta}>
                                    <Text style={styles.doctorName} numberOfLines={2}>
                                        {doctorInfo?.full_name}
                                    </Text>
                                    {!!doctorInfo?.designation && (
                                        <Text style={styles.speciality} numberOfLines={1}>
                                            {doctorInfo?.designation}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.value}>{date}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Time</Text>
                                <Text style={styles.value}>
                                    {formatTo12Hour(selectedTime)}
                                </Text>
                            </View>

                            {concern ? (
                                <View style={styles.concernSection}>
                                    <Text style={styles.label}>Concern</Text>
                                    <Text style={styles.concernValue}>{concern}</Text>
                                </View>
                            ) : null}

                            <View style={styles.divider} />

                            <Text style={styles.label1}>Patient</Text>
                            <CommonLabelText
                                label="Name"
                                value={`${patientsList?.first_name || ''} ${patientsList?.last_name || ''}`.trim()}
                            />
                            <CommonLabelText label="Mobile" value={patientsList?.phone_number} />
                            <CommonLabelText label="Relation" value={patientsList?.relation} />
                        </View>

                        <View style={styles.paymentCard}>
                            <View style={styles.amountRow}>
                                <View>
                                    <Text style={styles.totalLabel}>Total Amount</Text>
                                    <View style={styles.paymentInfo}>
                                        <Ionicons
                                            name="shield-checkmark"
                                            size={14}
                                            color={Colors.primaryColor}
                                        />
                                        <Text style={styles.paymentInfoText}>
                                            Secure Razorpay checkout
                                        </Text>
                                    </View>
                                </View>
                                <RupeeAmount value={totalAmount} style={styles.totalAmount} />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                disabled={loading}
                                onPress={handlePayment}
                                style={[styles.payButton, loading && styles.payButtonDisabled]}
                            >
                                {loading ? (
                                    <View style={styles.loaderRow}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={styles.payText}>Processing...</Text>
                                    </View>
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                                        <Text style={styles.payText}>Pay Now</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.cancelButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>


                </SafeAreaView>)}

            <Modal
                visible={isVerifyingPayment}
                transparent={false}
                animationType="fade"
                onRequestClose={() => { }}
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
                            Payment is being verified.
                            {"\n"}
                            Please do not press Back or close the app.
                            {"\n"}
                            This may take a few seconds.
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
        backgroundColor: '#F5F8F6',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
    },

    backIcon: {
        width: 40,
        height: 40,
    },

    headerTitle: {
        fontSize: 17,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    card: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },

    avatarImageWrap: {
        backgroundColor: Colors.bgcolor || '#F0F7F4',
        overflow: 'hidden',
        padding: 0,
    },

    avatarFallback: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        marginRight: 12,
        alignItems: 'center',
    },

    avatarLetter: {
        fontSize: 22,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },

    doctorMeta: {
        flex: 1,
        minWidth: 0,
    },

    doctorName: {
        fontSize: 15,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    speciality: {
        marginTop: 2,
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    divider: {
        height: 1,
        backgroundColor: '#E8EEF2',
        marginVertical: 12,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    label: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    label1: {
        fontSize: 12,
        color: '#0F172A',
        marginBottom: 6,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    value: {
        flex: 1,
        textAlign: 'right',
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    concernSection: {
        marginTop: 4,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E8EEF2',
    },

    concernValue: {
        marginTop: 4,
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 18,
    },

    paymentCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    totalLabel: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    totalAmount: {
        fontSize: 24,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsBold,
    },

    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    paymentInfoText: {
        marginLeft: 5,
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    footer: {
        marginTop: 'auto',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },

    payButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    payButtonDisabled: {
        opacity: 0.7,
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
        fontSize: 15,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    paymentProcessingContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginTop: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },

    processingTitle: {
        marginTop: 12,
        fontSize: 16,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    cancelButton: {
        marginTop: 10,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    cancelText: {
        color: '#EF4444',
        fontSize: 13,
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
        paddingHorizontal: 28,
    },

    verificationTitle: {
        marginTop: 20,
        fontSize: 20,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    verificationSubtitle: {
        marginTop: 8,
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: Fonts.PoppinsRegular,
    },

    verificationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 22,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F5F8F6',
    },

    verificationInfoText: {
        marginLeft: 8,
        color: '#475569',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
    },
});