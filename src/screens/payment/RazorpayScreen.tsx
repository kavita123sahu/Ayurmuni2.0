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

import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { showSuccessToast } from '../../config/Key';
import {
    isRazorpayUserCancelled,
    openRazorpayPayment,
    toRazorpayPaise,
} from '../../services/RazorpayService';
import { Utils } from '../../common/Utils';
import { formatTo12Hour } from '../../common/DataInterface';
import { RupeeAmount } from '../../utils/currencyUtils';
import CouponApplyCard from '../../components/CouponApplyCard';
import { useCheckoutCoupons } from '../../hooks/useCheckoutCoupons';
import TablerIcon from '../../components/TablerIcon';
import AppHeader from '../../components/AppHeader';
import { getDoctorDisplayName, resolveDoctorProfileImageUri } from '../../utils/doctorUtils';
import { usePatientData } from '../../hooks/usePatientData';
import {
    calculateFeeBreakdown,
    feeRateLabel,
    parseFeeQuoteConfig,
    roundMoney,
    type FeeQuoteConfig,
} from '../../utils/feeQuote';

const STORAGE_KEY = 'SELECTED_SLOT';
/** Persists first book-slot payment so a return visit can call retry. */
const PENDING_PAYMENT_KEY = 'CONSULT_PENDING_PAYMENT';

const getPatientDisplayName = (patient: any) =>
    `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() ||
    patient?.full_name ||
    'Patient';

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

const resolveProfileImageUri = (doctor: any): string =>
    resolveDoctorProfileImageUri(doctor);

const isApiSuccess = (response: any) =>
    response?.success === true ||
    response?.success === 'true' ||
    response?.success === 1;

const isPendingPaymentStatus = (data: any) => {
    const status = String(
        data?.status ?? data?.payment_status ?? '',
    ).toLowerCase();
    return (
        status === 'pending' ||
        status === 'created' ||
        status === 'initiated'
    );
};

/** Book-slot no longer sends data.amount. Use summary / configurations, then the screen total. */
const resolveConsultPayableRupees = (data: any, fallback: number) => {
    const summary = data?.summary ?? {};
    const direct = [
        data?.amount,
        data?.total_payable_amount,
        summary?.total_payable_amount,
        summary?.payable_amount,
        summary?.amount,
    ];
    for (const value of direct) {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0) return n;
    }

    const parsed = parseFeeQuoteConfig(data, fallback);
    if (parsed) {
        const breakdown = calculateFeeBreakdown({
            baseAmount: parsed.baseAmount,
            discount: parsed.couponDiscount ?? 0,
            gst: parsed.gst,
            platformFee: parsed.platformFee,
            includeShipping: false,
            includeCod: false,
        });
        if (breakdown.total > 0) return breakdown.total;
    }

    return fallback > 0 ? fallback : 0;
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
    const [feeQuote, setFeeQuote] = useState<FeeQuoteConfig | null>(null);
    const [quotedCouponCode, setQuotedCouponCode] = useState('');
    const [feeQuoteLoading, setFeeQuoteLoading] = useState(true);
    const [activePatient, setActivePatient] = useState<any>(patientsList || null);
    const [patientPickerVisible, setPatientPickerVisible] = useState(false);
    const [switchingPatient, setSwitchingPatient] = useState(false);

    const {
        patients,
        selectedPatient,
        fetchPatients,
        switchPatient,
    } = usePatientData();

    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [fetchPatients]),
    );

    useEffect(() => {
        if (selectedPatient?.id) {
            setActivePatient(selectedPatient);
        }
    }, [selectedPatient]);

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
        () => getPatientDisplayName(activePatient),
        [activePatient],
    );
    const timeLabel = useMemo(
        () => formatTo12Hour(selectedTime) || selectedTime || '—',
        [selectedTime],
    );
    const dateLabel = useMemo(() => formatDisplayDate(date) || date || '—', [date]);

    const handleSelectPatient = useCallback(
        async (patient: any) => {
            if (!patient?.id || String(patient.id) === String(activePatient?.id)) {
                setPatientPickerVisible(false);
                return;
            }
            try {
                setSwitchingPatient(true);
                setPatientPickerVisible(false);
                await switchPatient(String(patient.id));
                setActivePatient(patient);
                showSuccessToast('Patient switched successfully', 'success');
            } catch (error) {
                console.log('SWITCH PATIENT ERROR =>', error);
                showSuccessToast('Failed to switch patient', 'error');
            } finally {
                setSwitchingPatient(false);
            }
        },
        [activePatient?.id, switchPatient],
    );

    const loadFeeQuote = useCallback(async (couponCode?: string) => {
        const id = slotId?.id;
        if (!id) {
            setFeeQuoteLoading(false);
            return;
        }
        setFeeQuoteLoading(true);
        try {
            const response = await _CONSULT_SERVICES.getConsultationFeeQuote(
                id,
                couponCode,
            );
            console.log('Consultationfeequoteresponse =>', response);
            const parsed = parseFeeQuoteConfig(
                response?.data,
                Number(slotId?.amount || 0),
            );
            setQuotedCouponCode(String(couponCode || '').trim());
            setFeeQuote(response?.success && parsed ? parsed : null);
        } catch {
            setFeeQuote(null);
        } finally {
            setFeeQuoteLoading(false);
        }
    }, [slotId?.id, slotId?.amount]);

    const consultationFee = useMemo(() => {
        if (feeQuote?.baseAmount) return feeQuote.baseAmount;
        return roundMoney(Number(slotId?.amount || 0));
    }, [feeQuote, slotId?.amount]);

    const {
        coupons,
        eligibleCoupons,
        loading: couponsLoading,
        applied: appliedCoupon,
        error: couponError,
        discount: couponDiscount,
        applyCode,
        remove: removeCoupon,
    } = useCheckoutCoupons('consultation', consultationFee);

    useEffect(() => {
        loadFeeQuote(appliedCoupon?.code);
    }, [appliedCoupon?.code, loadFeeQuote]);

    const feeBreakdown = useMemo(() => {
        const requestedCoupon = String(appliedCoupon?.code || '').trim();
        const quoteDiscount =
            requestedCoupon === quotedCouponCode && feeQuote?.couponDiscount != null
                ? feeQuote.couponDiscount
                : couponDiscount;
        const quote = calculateFeeBreakdown({
            baseAmount: consultationFee,
            discount: quoteDiscount,
            gst: feeQuote?.gst ?? { flat: 0, percent: 0 },
            platformFee: feeQuote?.platformFee ?? { flat: 0, percent: 0 },
            includeShipping: false,
            includeCod: false,
        });
        return {
            consultationFee: quote.baseAmount,
            discount: quote.discount,
            feeAfterDiscount: quote.taxable,
            gst: quote.gst,
            gstLabel: feeRateLabel('GST', quote.gstRate),
            platformFee: quote.platformFee,
            platformLabel: feeRateLabel('Platform fee', quote.platformRate),
            total: quote.total,
        };
    }, [feeQuote, consultationFee, couponDiscount, appliedCoupon, quotedCouponCode]);

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
            console.log('ConsultationPaymentResponse =>', paymentResponse);

            // success: true with status pending is a created Razorpay order, not a failure.
            if (!isApiSuccess(paymentResponse)) {
                if (pendingPayment?.appointment_id) {
                    await clearPendingConsultPayment(currentSlotId);
                }
                showSuccessToast(
                    paymentResponse?.message || 'Unable to start payment',
                    'error',
                );
                return;
            }

            let paymentData = paymentResponse?.data ?? {};
            const appointmentId = String(
                paymentData?.appointment_id ||
                paymentData?.appointmentId ||
                paymentData?.consultation_id ||
                pendingPayment?.appointment_id ||
                '',
            ).trim();

            if (appointmentId) {
                await savePendingConsultPayment(
                    currentSlotId,
                    appointmentId,
                    paymentData?.payment_id,
                );
            }

            // Pending order already exists — refresh checkout via retry before opening Razorpay.
            if (
                appointmentId &&
                !pendingPayment?.appointment_id &&
                isPendingPaymentStatus(paymentData)
            ) {
                try {
                    const retryResponse =
                        await _CONSULT_SERVICES.retryConsultationPayment(
                            appointmentId,
                        );
                    console.log('ConsultationRetryResponse =>', retryResponse);
                    if (isApiSuccess(retryResponse) && retryResponse?.data) {
                        paymentData = {
                            ...paymentData,
                            ...retryResponse.data,
                            summary:
                                retryResponse.data?.summary ??
                                paymentData?.summary,
                            configurations:
                                retryResponse.data?.configurations ??
                                paymentData?.configurations,
                        };
                    }
                } catch (retryError) {
                    console.log('CONSULT_RETRY_ERROR =>', retryError);
                }
            }

            const payableRupees = resolveConsultPayableRupees(
                paymentData,
                totalAmount,
            );
            const amountPaise = toRazorpayPaise(
                paymentData?.amount ??
                paymentData?.summary?.total_payable_amount,
                payableRupees,
            );

            const contactNumber = String(
                activePatient?.phone_number ||
                activePatient?.phone ||
                doctorInfo?.phone_number ||
                '',
            ).replace(/\D/g, '');

            let razorpayResult: any;
            try {
                razorpayResult = await openRazorpayPayment({
                    key: paymentData?.razorpay_key,
                    amount: amountPaise,
                    order_id: paymentData?.razorpay_order_id,
                    name: doctorInfo?.full_name || doctorName,
                    email: doctorInfo?.email || 'customer@ayurmuni.com',
                    contact: contactNumber,
                    description: 'Consultation payment',
                    themeColor: Colors.primaryColor,
                });
            } catch (error: any) {
                setIsVerifyingPayment(false);
                console.log('CONSULT_RAZORPAY_CATCH =>', error);

                if (isRazorpayUserCancelled(error)) {
                    showSuccessToast(
                        'Payment cancelled. You can try again anytime.',
                        'error',
                    );
                    return;
                }

                showSuccessToast(
                    error?.description ||
                    error?.message ||
                    'Payment failed. Please try again.',
                    'error',
                );
                return;
            }

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
                showSuccessToast('Payment verification failed', 'error');
            }
        } catch (error: any) {
            setIsVerifyingPayment(false);
            console.log('CONSULT_HANDLE_PAYMENT_CATCH =>', error);
            if (isRazorpayUserCancelled(error)) {
                showSuccessToast(
                    'Payment cancelled. You can try again anytime.',
                    'error',
                );
                return;
            }
            showSuccessToast(
                error?.description ||
                error?.message ||
                'Something went wrong. Please try again.',
                'error',
            );
        } finally {
            setLoading(false);
            paymentStartedRef.current = false;
        }
    };

    const payDisabled = loading || feeQuoteLoading || !feeQuote;

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
                                            <TablerIcon
                                                name="user-filled"
                                                size={28}
                                                color="#FFFFFF"
                                            />
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
                                            activePatient?.phone_number,
                                            activePatient?.relation,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    disabled={switchingPatient || loading}
                                    onPress={() => setPatientPickerVisible(true)}
                                    style={styles.changePatientBtn}
                                >
                                    {switchingPatient ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={Colors.primaryColor}
                                        />
                                    ) : (
                                        <>
                                            <Text style={styles.changePatientText}>
                                                Change
                                            </Text>
                                            <TablerIcon
                                                name="chevron-down"
                                                size={14}
                                                color={Colors.primaryColor}
                                            />
                                        </>
                                    )}
                                </TouchableOpacity>
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
                                eligibleCoupons={eligibleCoupons}
                                cartAmount={consultationFee}
                                loading={couponsLoading}
                                applied={appliedCoupon}
                                discount={feeBreakdown.discount || couponDiscount}
                                payable={totalAmount}
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
                                            {feeBreakdown.platformLabel}
                                        </Text>
                                        <RupeeAmount
                                            value={feeBreakdown.platformFee}
                                            style={styles.summaryValue}
                                            decimals={2}
                                        />
                                    </View>

                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            {feeBreakdown.gstLabel}
                                        </Text>
                                        <RupeeAmount
                                            value={feeBreakdown.gst}
                                            style={styles.summaryValue}
                                            decimals={2}
                                        />
                                    </View>

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
                visible={patientPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPatientPickerVisible(false)}
            >
                <View style={styles.pickerOverlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setPatientPickerVisible(false)}
                    />
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select patient</Text>
                            <TouchableOpacity
                                onPress={() => setPatientPickerVisible(false)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <TablerIcon
                                    name="x"
                                    size={18}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={styles.pickerList}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {(patients?.length ? patients : activePatient ? [activePatient] : []).map(
                                (patient: any) => {
                                    const name = getPatientDisplayName(patient);
                                    const selected =
                                        String(patient?.id) ===
                                        String(activePatient?.id);
                                    return (
                                        <TouchableOpacity
                                            key={String(patient?.id)}
                                            activeOpacity={0.75}
                                            style={[
                                                styles.pickerRow,
                                                selected && styles.pickerRowSelected,
                                            ]}
                                            onPress={() => handleSelectPatient(patient)}
                                        >
                                            <View
                                                style={[
                                                    styles.pickerAvatar,
                                                    selected &&
                                                    styles.pickerAvatarSelected,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.pickerInitial,
                                                        selected &&
                                                        styles.pickerInitialSelected,
                                                    ]}
                                                >
                                                    {name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || 'P'}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1, minWidth: 0 }}>
                                                <Text
                                                    style={styles.pickerName}
                                                    numberOfLines={1}
                                                >
                                                    {name}
                                                </Text>
                                                <Text
                                                    style={styles.pickerMeta}
                                                    numberOfLines={1}
                                                >
                                                    {[
                                                        patient?.phone_number,
                                                        patient?.relation,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ') || '—'}
                                                </Text>
                                            </View>
                                            {selected ? (
                                                <TablerIcon
                                                    name="check"
                                                    size={16}
                                                    color={Colors.primaryColor}
                                                />
                                            ) : null}
                                        </TouchableOpacity>
                                    );
                                },
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
        backgroundColor: '#DFE5E7',
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
    changePatientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.bgborderColor,
        backgroundColor: Colors.onfillColor,
        minWidth: 72,
        justifyContent: 'center',
    },
    changePatientText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },

    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 20,
        maxHeight: '62%',
        zIndex: 1,
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    pickerTitle: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    pickerList: {
        maxHeight: 360,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8EEF2',
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    pickerRowSelected: {
        borderColor: Colors.bgborderColor,
        backgroundColor: Colors.onfillColor,
    },
    pickerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerAvatarSelected: {
        backgroundColor: Colors.primaryColor,
    },
    pickerInitial: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#475569',
    },
    pickerInitialSelected: {
        color: '#FFFFFF',
    },
    pickerName: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    pickerMeta: {
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
