// BookingConfirmScreen.tsx

import React, {
    useCallback,
    useEffect,
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
import CouponApplyCard from '../../components/CouponApplyCard';
import { useCheckoutCoupons } from '../../hooks/useCheckoutCoupons';
import TablerIcon from '../../components/TablerIcon';

const STORAGE_KEY = 'SELECTED_SLOT';
/** Persists first book-slot payment so a return visit can call retry. */
const PENDING_PAYMENT_KEY = 'CONSULT_PENDING_PAYMENT';

type FeeQuote = {
    slot_id?: string;
    doctor_id?: string;
    doctor_name?: string;
    consultation_fee: number;
    gst_percent: number;
    gst_amount: number;
    platform_fee_percent: number;
    platform_fee: number;
    convenience: number;
    amount: number;
    currency?: string;
};

const roundMoney = (value: number) =>
    Math.round((Number(value) || 0) * 100) / 100;

type PendingConsultPayment = {
    slot_id: string;
    appointment_id: string;
    payment_id?: string;
};

const getPendingConsultPayment = async (
    slotId: string | number | undefined,
): Promise<PendingConsultPayment | null> => {
    if (slotId == null || slotId === '') return null;
    try {
        const stored = await Utils.getData(PENDING_PAYMENT_KEY);
        if (
            !stored?.appointment_id ||
            String(stored.slot_id) !== String(slotId)
        ) {
            return null;
        }
        return {
            slot_id: String(stored.slot_id),
            appointment_id: String(stored.appointment_id),
            payment_id: stored.payment_id
                ? String(stored.payment_id)
                : undefined,
        };
    } catch {
        return null;
    }
};

const savePendingConsultPayment = async (
    slotId: string | number | undefined,
    appointmentId: string | number | undefined,
    paymentId?: string | number | undefined,
) => {
    if (slotId == null || appointmentId == null || appointmentId === '') return;
    await Utils.storeData(PENDING_PAYMENT_KEY, {
        slot_id: String(slotId),
        appointment_id: String(appointmentId),
        ...(paymentId != null && paymentId !== ''
            ? { payment_id: String(paymentId) }
            : {}),
    });
};

const clearPendingConsultPayment = async (
    slotId?: string | number | null,
) => {
    try {
        if (slotId == null) {
            await Utils.removeData(PENDING_PAYMENT_KEY);
            return;
        }
        const stored = await Utils.getData(PENDING_PAYMENT_KEY);
        if (stored && String(stored.slot_id) === String(slotId)) {
            await Utils.removeData(PENDING_PAYMENT_KEY);
        }
    } catch {
        // ignore
    }
};

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
        selectedTime, medical_record_ids, medical_records = [],
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

    const [feeQuote, setFeeQuote] = useState<FeeQuote | null>(null);
    const [feeQuoteLoading, setFeeQuoteLoading] = useState(true);

    const loadFeeQuote = useCallback(async () => {
        const id = slotId?.id;
        if (!id) {
            setFeeQuoteLoading(false);
            return;
        }
        setFeeQuoteLoading(true);
        try {
            const response = await _CONSULT_SERVICES.getConsultationFeeQuote(id);
            console.log("feeQuoteResponse", response);
            if (response?.success && response?.data) {
                const d = response.data;
                setFeeQuote({
                    slot_id: d.slot_id,
                    doctor_id: d.doctor_id,
                    doctor_name: d.doctor_name,
                    consultation_fee: roundMoney(d.consultation_fee),
                    gst_percent: Number(d.gst_percent) || 0,
                    gst_amount: roundMoney(d.gst_amount),
                    platform_fee_percent: Number(d.platform_fee_percent) || 0,
                    platform_fee: roundMoney(d.platform_fee),
                    convenience: roundMoney(d.convenience),
                    amount: roundMoney(d.amount),
                    currency: d.currency || 'INR',
                });
            } else {
                setFeeQuote(null);
            }
        } catch {
            setFeeQuote(null);
        } finally {
            setFeeQuoteLoading(false);
        }
    }, [slotId?.id]);

    useEffect(() => {
        loadFeeQuote();
    }, [loadFeeQuote]);

    // Coupon reduces consultation fee first; GST / platform % apply on that amount
    const consultationFee = useMemo(() => {
        if (feeQuote) return feeQuote.consultation_fee;
        return roundMoney(Number(slotId?.amount || 0));
    }, [feeQuote, slotId?.amount]);

    const {
        coupons,
        loading: couponsLoading,
        applied: appliedCoupon,
        error: couponError,
        discount: couponDiscount,
        applyCode,
        remove: removeCoupon,
    } = useCheckoutCoupons('consultation', consultationFee);

    const feeBreakdown = useMemo(() => {
        const gstPercent = feeQuote?.gst_percent ?? 0;
        const platformPercent = feeQuote?.platform_fee_percent ?? 0;
        const convenience = feeQuote?.convenience ?? 0;
        const discount = Math.min(
            roundMoney(couponDiscount),
            consultationFee,
        );
        // GST + platform fee are always on the post-coupon amount
        const feeAfterDiscount = roundMoney(
            Math.max(0, consultationFee - discount),
        );

        const scaleOrPercent = (
            percent: number,
            apiAmount: number | undefined,
        ) => {
            if (percent > 0) {
                return roundMoney((feeAfterDiscount * percent) / 100);
            }
            if (discount <= 0) {
                return roundMoney(apiAmount ?? 0);
            }
            if (consultationFee > 0 && (apiAmount ?? 0) > 0) {
                return roundMoney(
                    ((apiAmount ?? 0) * feeAfterDiscount) / consultationFee,
                );
            }
            return 0;
        };

        const gst = scaleOrPercent(gstPercent, feeQuote?.gst_amount);
        const platformFee = scaleOrPercent(
            platformPercent,
            feeQuote?.platform_fee,
        );
        const total = roundMoney(
            feeAfterDiscount + gst + platformFee + convenience,
        );
        return {
            consultationFee,
            discount,
            feeAfterDiscount,
            gst,
            gstPercent,
            platformFee,
            platformPercent,
            convenience,
            total,
        };
    }, [feeQuote, consultationFee, couponDiscount]);

    const totalAmount = feeBreakdown.total;

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

            const currentSlotId = slotId?.id;
            const pendingPayment = await getPendingConsultPayment(currentSlotId);
            console.log('pendingPayment', pendingPayment);
            // Retry only when a payment/appointment was already created for this slot
            let paymentResponse: any;
            if (pendingPayment?.appointment_id) {
                console.log(
                    'CONSULT_PAYMENT_RETRY =>',
                    pendingPayment.appointment_id,
                );
                paymentResponse =
                    await _CONSULT_SERVICES.retryConsultationPayment(
                        pendingPayment.appointment_id,
                    );

                console.log('CONSULT_PAYMENT_RETRY_RESPONSE =>', paymentResponse);
            } else {
                paymentResponse =
                    await _CONSULT_SERVICES.createConsultationPayment({
                        slot_id: currentSlotId,
                        concern: concern,
                        medical_record_ids: medical_record_ids,
                        coupon_code: appliedCoupon?.code,
                    });
            }

            console.log('bookslottttttornottt', paymentResponse);
            if (!paymentResponse?.success) {
                // Stale local pending — clear so next attempt can create fresh
                if (pendingPayment?.appointment_id) {
                    await clearPendingConsultPayment(currentSlotId);
                }
                showSuccessToast(paymentResponse?.message, 'error');
                return;
            }

            const paymentData = paymentResponse?.data;
            const appointmentId =
                paymentData?.appointment_id ||
                paymentData?.appointmentId ||
                paymentData?.consultation_id ||
                pendingPayment?.appointment_id;

            // Persist so going back + returning uses retry API next time
            await savePendingConsultPayment(
                currentSlotId,
                appointmentId,
                paymentData?.payment_id,
            );

            const contactNumber = String(doctorInfo?.phone_number || '').replace(
                /\D/g,
                '',
            );

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
                            razorpay_payment_id:
                                razorpayResult?.razorpay_payment_id,
                            razorpay_signature:
                                razorpayResult?.razorpay_signature,
                        });

                    setIsVerifyingPayment(false);

                    console.log('verfiyResposne', verifyResponse);

                    const SlotsDetail = verifyResponse?.data;
                    if (verifyResponse?.success) {
                        setIsVerifyingPayment(false);
                        showSuccessToast('Payment Successful', 'success');
                        try {
                            const { OneSignal } = require('react-native-onesignal');
                            OneSignal.User.pushSubscription.optIn();
                        } catch {
                            // ignore
                        }
                        try {
                            const {
                                refreshUnreadBadge,
                            } = require('../../screens/notifications/notificationRouter');
                            refreshUnreadBadge();
                        } catch {
                            // ignore
                        }
                        try {
                            await Utils.storeData(STORAGE_KEY, null);
                            await clearPendingConsultPayment(currentSlotId);
                        } catch (e) {
                            console.log('clear storage on success error', e);
                        }
                        navigation.navigate('BookingConfrimScreen', {
                            SlotsDetail,
                        });
                    } else {
                        console.log('noooooooooooooooo');
                        setIsVerifyingPayment(false);
                        showSuccessToast('Payment verification failed', 'error');
                    }
                })
                .catch(async (error: any) => {
                    setIsVerifyingPayment(false);
                    paymentStartedRef.current = false;

                    console.log('Razorpay Error:', error);

                    // Keep pending payment so next visit for same slot uses retry API
                    if (
                        error?.code === RazorpayCheckout.PAYMENT_CANCELLED ||
                        error?.description?.toLowerCase().includes('cancel') ||
                        error?.description?.toLowerCase().includes('dismiss') ||
                        error?.description?.toLowerCase().includes('exit')
                    ) {
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

                            {Array.isArray(medical_records) && medical_records.length > 0 ? (
                                <View style={styles.docsSection}>
                                    <Text style={styles.label1}>Attached Documents</Text>
                                    {medical_records.map((doc: any, index: number) => (
                                        <View
                                            key={String(doc?.id ?? index)}
                                            style={styles.docRow}
                                        >
                                            <TablerIcon
                                                name="file"
                                                size={16}
                                                color={Colors.primaryColor}
                                            />
                                            <Text style={styles.docName} numberOfLines={1}>
                                                {doc?.description ||
                                                    doc?.file_name ||
                                                    `Document ${index + 1}`}
                                            </Text>
                                            <Text style={styles.docType}>
                                                {String(doc?.file_type || 'file').toUpperCase()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            <CouponApplyCard
                                coupons={coupons}
                                loading={couponsLoading}
                                applied={appliedCoupon}
                                discount={couponDiscount}
                                error={couponError}
                                checkoutScope="consultation"
                                onApply={applyCode}
                                onRemove={removeCoupon}
                            />
                        </View>


                        <View style={styles.paymentCard}>
                            <Text style={styles.summaryTitle}>Amount Summary</Text>

                            {feeQuoteLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primaryColor}
                                    style={{ marginVertical: 12 }}
                                />
                            ) : (
                                <>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            Consultation fee
                                        </Text>
                                        <RupeeAmount
                                            value={feeBreakdown.consultationFee}
                                            style={styles.summaryValue}
                                            decimals={2}
                                        />
                                    </View>

                                    {feeBreakdown.discount > 0 ? (
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryDiscountLabel}>
                                                Coupon discount
                                                {appliedCoupon?.code
                                                    ? ` (${appliedCoupon.code})`
                                                    : ''}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.summaryDiscountValue}>− </Text>
                                                <RupeeAmount
                                                    value={feeBreakdown.discount}
                                                    style={styles.summaryDiscountValue}
                                                    decimals={2}
                                                />
                                            </View>
                                        </View>
                                    ) : null}

                                    {feeBreakdown.discount > 0 ? (
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>
                                                After coupon
                                            </Text>
                                            <RupeeAmount
                                                value={feeBreakdown.feeAfterDiscount}
                                                style={styles.summaryValue}
                                                decimals={2}
                                            />
                                        </View>
                                    ) : null}

                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            Platform fee
                                            {feeBreakdown.platformPercent > 0
                                                ? ` (${feeBreakdown.platformPercent}%)`
                                                : ''}
                                        </Text>
                                        <RupeeAmount
                                            value={feeBreakdown.platformFee}
                                            style={styles.summaryValue}
                                            decimals={2}
                                        />
                                    </View>

                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            GST
                                            {feeBreakdown.gstPercent > 0
                                                ? ` (${feeBreakdown.gstPercent}%)`
                                                : ''}
                                        </Text>
                                        <RupeeAmount
                                            value={feeBreakdown.gst}
                                            style={styles.summaryValue}
                                            decimals={2}
                                        />
                                    </View>

                                    {feeBreakdown.convenience > 0 ? (
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>
                                                Convenience
                                            </Text>
                                            <RupeeAmount
                                                value={feeBreakdown.convenience}
                                                style={styles.summaryValue}
                                                decimals={2}
                                            />
                                        </View>
                                    ) : null}

                                    <View style={styles.summaryDivider} />

                                    <View style={styles.amountRow}>
                                        <View>
                                            <Text style={styles.totalLabel}>
                                                Total Amount
                                            </Text>
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
                                        <RupeeAmount
                                            value={totalAmount}
                                            style={styles.totalAmount}
                                            decimals={2}
                                        />
                                    </View>
                                </>
                            )}
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                disabled={loading || feeQuoteLoading}
                                onPress={handlePayment}
                                style={[
                                    styles.payButton,
                                    (loading || feeQuoteLoading) && styles.payButtonDisabled,
                                ]}
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

    docsSection: {
        marginTop: 10,
        marginBottom: 4,
    },

    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 6,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    docName: {
        flex: 1,
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
    },

    docType: {
        fontSize: 10,
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
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

    summaryTitle: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 10,
    },

    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },

    summaryLabel: {
        flex: 1,
        flexShrink: 1,
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        paddingRight: 4,
    },

    summaryValue: {
        flexShrink: 0,
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'right',
    },

    summaryDiscountLabel: {
        flex: 1,
        flexShrink: 1,
        fontSize: 13,
        color: '#15803D',
        fontFamily: Fonts.PoppinsMedium,
        paddingRight: 4,
    },

    summaryDiscountValue: {
        flexShrink: 0,
        fontSize: 13,
        color: '#15803D',
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'right',
    },

    summaryDivider: {
        height: 1,
        backgroundColor: '#E8EEF2',
        marginVertical: 10,
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
    strikeAmount: {
        fontSize: 13,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 2,
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