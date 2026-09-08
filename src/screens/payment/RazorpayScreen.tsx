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
    Modal,
    ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';

import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { showSuccessToast } from '../../config/Key';
import { openRazorpayPayment } from '../../services/RazorpayService';
import { Utils } from '../../common/Utils';
import { formatTo12Hour } from '../../common/DataInterface';
import { RupeeAmount } from '../../utils/currencyUtils';
import CouponApplyCard from '../../components/CouponApplyCard';
import { useCheckoutCoupons } from '../../hooks/useCheckoutCoupons';
import TablerIcon from '../../components/TablerIcon';
import AppHeader from '../../components/AppHeader';
import { getDoctorDisplayName } from '../../utils/doctorUtils';

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

const resolveProfileImageUri = (doctor: any): string => {
    const img = doctor?.profile_image;
    if (!img) return '';
    if (typeof img === 'string') return img;
    return String(img?.url || img?.uri || img?.media_url || '').trim();
};

const formatDisplayDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        weekday: 'short',
    });
};

const RazorpayScreen = ({ route, navigation }: any) => {
    const {
        doctorInfo,
        slotId,
        date,
        concern,
        patientsList,
        selectedTime,
        medical_record_ids,
        medical_records = [],
    } = route?.params || {};

    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 8);

    const [loading, setLoading] = useState(false);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const paymentStartedRef = useRef(false);
    const [feeQuote, setFeeQuote] = useState<FeeQuote | null>(null);
    const [feeQuoteLoading, setFeeQuoteLoading] = useState(true);

    const doctorName = useMemo(
        () => getDoctorDisplayName(doctorInfo),
        [doctorInfo],
    );
    const profileImageUri = useMemo(
        () => resolveProfileImageUri(doctorInfo),
        [doctorInfo],
    );
    const qualification = useMemo(
        () =>
            String(
                doctorInfo?.qualification ||
                    doctorInfo?.designation ||
                    '',
            ).trim(),
        [doctorInfo],
    );
    const patientName = useMemo(
        () =>
            `${patientsList?.first_name || ''} ${patientsList?.last_name || ''}`.trim() ||
            patientsList?.full_name ||
            'Patient',
        [patientsList],
    );
    const timeLabel = useMemo(
        () => formatTo12Hour(selectedTime) || selectedTime || '—',
        [selectedTime],
    );
    const dateLabel = useMemo(() => formatDisplayDate(date) || date || '—', [date]);

    const loadFeeQuote = useCallback(async () => {
        const id = slotId?.id;
        if (!id) {
            setFeeQuoteLoading(false);
            return;
        }
        setFeeQuoteLoading(true);
        try {
            const response = await _CONSULT_SERVICES.getConsultationFeeQuote(id);
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
        const discount = Math.min(roundMoney(couponDiscount), consultationFee);
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
            return () => subscription.remove();
        }, [isVerifyingPayment]),
    );

    const handlePayment = async () => {
        if (loading || paymentStartedRef.current) return;

        try {
            setLoading(true);
            paymentStartedRef.current = true;

            const currentSlotId = slotId?.id;
            const pendingPayment = await getPendingConsultPayment(currentSlotId);

            let paymentResponse: any;
            if (pendingPayment?.appointment_id) {
                paymentResponse =
                    await _CONSULT_SERVICES.retryConsultationPayment(
                        pendingPayment.appointment_id,
                    );
            } else {
                paymentResponse =
                    await _CONSULT_SERVICES.createConsultationPayment({
                        slot_id: currentSlotId,
                        concern: concern,
                        medical_record_ids: medical_record_ids,
                        coupon_code: appliedCoupon?.code,
                    });
            }

            if (!paymentResponse?.success) {
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
                name: doctorInfo?.full_name || doctorName,
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
                        setIsVerifyingPayment(false);
                        showSuccessToast('Payment verification failed', 'error');
                    }
                })
                .catch(async (error: any) => {
                    setIsVerifyingPayment(false);
                    paymentStartedRef.current = false;

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

    const payDisabled = loading || feeQuoteLoading;

    return (
        <>
            {!isVerifyingPayment && (
                <SafeAreaView
                    style={styles.safeArea}
                    edges={['top', 'left', 'right']}
                >
                    <StatusBar
                        backgroundColor="#FFFFFF"
                        barStyle="dark-content"
                    />

                    <AppHeader
                        title="Confirm Booking"
                        onLeftPress={() => {
                            if (isVerifyingPayment) return;
                            navigation.goBack();
                        }}
                    />

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Doctor hero */}
                        <LinearGradient
                            colors={['#E8F8F2', '#FFFFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.heroCard}
                        >
                            <View style={styles.heroRow}>
                                <View style={styles.avatarWrap}>
                                    {profileImageUri ? (
                                        <Image
                                            source={{ uri: profileImageUri }}
                                            style={styles.avatar}
                                        />
                                    ) : (
                                        <View style={styles.avatarFallback}>
                                            <Text style={styles.avatarLetter}>
                                                {doctorName
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'D'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.heroInfo}>
                                    <Text style={styles.doctorName} numberOfLines={2}>
                                        {doctorName}
                                    </Text>
                                    {!!qualification && (
                                        <Text
                                            style={styles.qualification}
                                            numberOfLines={1}
                                        >
                                            {qualification}
                                        </Text>
                                    )}
                                    <View style={styles.secureChip}>
                                        <TablerIcon
                                            name="shield"
                                            size={11}
                                            color={Colors.primaryColor}
                                        />
                                        <Text style={styles.secureChipText}>
                                            Secure checkout
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.slotStrip}>
                                <View style={styles.slotItem}>
                                    <View
                                        style={[
                                            styles.slotIcon,
                                            { backgroundColor: '#EAF8F4' },
                                        ]}
                                    >
                                        <TablerIcon
                                            name="calendar"
                                            size={14}
                                            color={Colors.primaryColor}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.slotLabel}>Date</Text>
                                        <Text
                                            style={styles.slotValue}
                                            numberOfLines={1}
                                        >
                                            {dateLabel}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.slotDivider} />
                                <View style={styles.slotItem}>
                                    <View
                                        style={[
                                            styles.slotIcon,
                                            { backgroundColor: '#E0F2FE' },
                                        ]}
                                    >
                                        <TablerIcon
                                            name="clock"
                                            size={14}
                                            color="#0369A1"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.slotLabel}>Time</Text>
                                        <Text
                                            style={styles.slotValue}
                                            numberOfLines={1}
                                        >
                                            {timeLabel}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Patient + concern + docs */}
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <View
                                    style={[
                                        styles.sectionIcon,
                                        { backgroundColor: '#EEF2FF' },
                                    ]}
                                >
                                    <TablerIcon
                                        name="user"
                                        size={14}
                                        color="#4F46E5"
                                    />
                                </View>
                                <Text style={styles.sectionTitle}>
                                    Patient details
                                </Text>
                            </View>

                            <View style={styles.patientRow}>
                                <View style={styles.patientAvatar}>
                                    <Text style={styles.patientInitial}>
                                        {patientName?.charAt(0)?.toUpperCase() ||
                                            'P'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                        style={styles.patientName}
                                        numberOfLines={1}
                                    >
                                        {patientName}
                                    </Text>
                                    <Text
                                        style={styles.patientMeta}
                                        numberOfLines={1}
                                    >
                                        {[
                                            patientsList?.phone_number,
                                            patientsList?.relation,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </Text>
                                </View>
                            </View>

                            {!!concern ? (
                                <View style={styles.concernBox}>
                                    <Text style={styles.concernLabel}>
                                        Concern
                                    </Text>
                                    <Text style={styles.concernValue}>
                                        {concern}
                                    </Text>
                                </View>
                            ) : null}

                            {Array.isArray(medical_records) &&
                            medical_records.length > 0 ? (
                                <View style={styles.docsSection}>
                                    <Text style={styles.docsTitle}>
                                        Attached documents
                                    </Text>
                                    {medical_records.map(
                                        (doc: any, index: number) => (
                                            <View
                                                key={String(doc?.id ?? index)}
                                                style={styles.docRow}
                                            >
                                                <TablerIcon
                                                    name="file"
                                                    size={15}
                                                    color={Colors.primaryColor}
                                                />
                                                <Text
                                                    style={styles.docName}
                                                    numberOfLines={1}
                                                >
                                                    {doc?.description ||
                                                        doc?.file_name ||
                                                        `Document ${index + 1}`}
                                                </Text>
                                                <Text style={styles.docType}>
                                                    {String(
                                                        doc?.file_type || 'file',
                                                    ).toUpperCase()}
                                                </Text>
                                            </View>
                                        ),
                                    )}
                                </View>
                            ) : null}
                        </View>

                        {/* Coupons */}
                        <View style={styles.card}>
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

                        {/* Amount summary */}
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <View
                                    style={[
                                        styles.sectionIcon,
                                        { backgroundColor: '#ECFDF5' },
                                    ]}
                                >
                                    <TablerIcon
                                        name="receipt"
                                        size={14}
                                        color="#15803D"
                                    />
                                </View>
                                <Text style={styles.sectionTitle}>
                                    Amount summary
                                </Text>
                            </View>

                            {feeQuoteLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primaryColor}
                                    style={{ marginVertical: 14 }}
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
                                            <Text
                                                style={
                                                    styles.summaryDiscountLabel
                                                }
                                            >
                                                Coupon
                                                {appliedCoupon?.code
                                                    ? ` (${appliedCoupon.code})`
                                                    : ''}
                                            </Text>
                                            <View style={styles.discountRow}>
                                                <Text
                                                    style={
                                                        styles.summaryDiscountValue
                                                    }
                                                >
                                                    −{' '}
                                                </Text>
                                                <RupeeAmount
                                                    value={
                                                        feeBreakdown.discount
                                                    }
                                                    style={
                                                        styles.summaryDiscountValue
                                                    }
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
                                                value={
                                                    feeBreakdown.feeAfterDiscount
                                                }
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
                                                value={
                                                    feeBreakdown.convenience
                                                }
                                                style={styles.summaryValue}
                                                decimals={2}
                                            />
                                        </View>
                                    ) : null}

                                    <LinearGradient
                                        colors={['#ECFDF5', '#D1FAE5']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.totalStrip}
                                    >
                                        <View>
                                            <Text style={styles.totalLabel}>
                                                Total payable
                                            </Text>
                                            <View style={styles.secureRow}>
                                                <TablerIcon
                                                    name="shield"
                                                    size={12}
                                                    color={Colors.primaryColor}
                                                />
                                                <Text style={styles.secureText}>
                                                    Razorpay secure
                                                </Text>
                                            </View>
                                        </View>
                                        <RupeeAmount
                                            value={totalAmount}
                                            style={styles.totalAmount}
                                            decimals={2}
                                            iconSize={16}
                                            iconColor={Colors.primaryColor}
                                        />
                                    </LinearGradient>
                                </>
                            )}
                        </View>

                        <View style={{ height: 108 }} />
                    </ScrollView>

                    {/* Sticky pay bar */}
                    <View
                        style={[
                            styles.stickyBar,
                            { paddingBottom: footerBottomPad },
                        ]}
                    >
                        <View style={styles.stickyRow}>
                            <View style={styles.stickyPriceBox}>
                                {feeQuoteLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={Colors.primaryColor}
                                    />
                                ) : (
                                    <RupeeAmount
                                        value={totalAmount}
                                        style={styles.stickyPrice}
                                        decimals={2}
                                        iconSize={16}
                                        iconColor={Colors.primaryColor}
                                    />
                                )}
                                <Text style={styles.stickyHint}>
                                    Total payable
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                disabled={payDisabled}
                                onPress={handlePayment}
                                style={styles.primaryBtnWrap}
                            >
                                <LinearGradient
                                    colors={
                                        payDisabled
                                            ? ['#6c9180', '#6c9180']
                                            : ['#0D614E', '#14937A']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.primaryBtn}
                                >
                                    {loading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <>
                                            <TablerIcon
                                                name="credit-card"
                                                size={16}
                                                color="#FFFFFF"
                                            />
                                            <Text style={styles.primaryBtnText}>
                                                Pay now
                                            </Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        {/* <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.cancelLink}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelLinkText}>Cancel</Text>
                        </TouchableOpacity> */}
                    </View>
                </SafeAreaView>
            )}

            <Modal
                visible={isVerifyingPayment}
                transparent={false}
                animationType="fade"
                onRequestClose={() => {}}
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
                            Payment is being verified.{'\n'}
                            Please do not press Back or close the app.{'\n'}
                            This may take a few seconds.
                        </Text>
                        <View style={styles.verificationInfo}>
                            <TablerIcon
                                name="shield"
                                size={16}
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },
    scrollContent: {
        paddingBottom: 8,
    },

    heroCard: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarWrap: {
        width: 64,
        height: 64,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#F0F7F4',
        borderWidth: 2,
        borderColor: '#A7E0CF',
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarFallback: {
        flex: 1,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },
    heroInfo: {
        flex: 1,
        minWidth: 0,
    },
    doctorName: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 21,
    },
    qualification: {
        marginTop: 1,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    secureChip: {
        marginTop: 6,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ECF8F3',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    secureChipText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },

    slotStrip: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D7EBE3',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    slotItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    slotIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotDivider: {
        width: StyleSheet.hairlineWidth,
        height: 28,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 8,
    },
    slotLabel: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        includeFontPadding: false,
    },
    slotValue: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },

    card: {
        marginTop: 8,
        marginHorizontal: 10,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 12,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },

    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    patientAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    patientInitial: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#4F46E5',
    },
    patientName: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    patientMeta: {
        marginTop: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },

    concernBox: {
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E2E8F0',
    },
    concernLabel: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 3,
    },
    concernValue: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: Fonts.PoppinsRegular,
        color: '#334155',
    },

    docsSection: {
        marginTop: 10,
    },
    docsTitle: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#64748B',
        marginBottom: 6,
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E2E8F0',
    },
    docName: {
        flex: 1,
        fontSize: 12,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
    },
    docType: {
        fontSize: 10,
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
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
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    summaryValue: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    summaryDiscountLabel: {
        flex: 1,
        fontSize: 12,
        color: '#15803D',
        fontFamily: Fonts.PoppinsMedium,
    },
    summaryDiscountValue: {
        fontSize: 13,
        color: '#15803D',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalStrip: {
        marginTop: 6,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    totalLabel: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#14532D',
    },
    secureRow: {
        marginTop: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    secureText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#3F6212',
    },
    totalAmount: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },

    stickyBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E8F2EE',
        paddingTop: 8,
        paddingHorizontal: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    stickyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stickyPriceBox: {
        minWidth: 96,
    },
    stickyPrice: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    stickyHint: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        includeFontPadding: false,
    },
    primaryBtnWrap: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryBtn: {
        minHeight: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 14,
    },
    primaryBtnText: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },
    cancelLink: {
        marginTop: 6,
        alignItems: 'center',
        paddingVertical: 4,
    },
    cancelLinkText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#EF4444',
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
        gap: 8,
    },
    verificationInfoText: {
        color: '#475569',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
    },
});
