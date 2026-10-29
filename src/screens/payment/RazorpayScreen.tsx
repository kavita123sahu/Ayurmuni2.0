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
import { showSuccessToast } from '../../config/Key';
import {
    isRazorpayUserCancelled,
    openRazorpayPayment,
    pickRazorpayKey,
    toRazorpayPaise,
} from '../../services/RazorpayService';
import { Utils } from '../../common/Utils';
import { formatTo12Hour } from '../../common/DataInterface';
import { RupeeAmount } from '../../utils/currencyUtils';
import CouponApplyCard from '../../components/CouponApplyCard';
import { useCheckoutCoupons } from '../../hooks/useCheckoutCoupons';
import TablerIcon from '../../components/TablerIcon';
import AppHeader from '../../components/AppHeader';
import DietitianBadge from '../../components/DietitianBadge';
import {
    formatDoctorSpecialization,
    getDoctorDisplayName,
    resolveDoctorProfileImageUri,
} from '../../utils/doctorUtils';
import { usePatientData } from '../../hooks/usePatientData';
import { useMyPackages } from '../../hooks/usePackagePlans';
import ActivePlanPickerSheet from '../../components/packages/ActivePlanPickerSheet';
import {
    getConsultBenefit,
    getPlanConsultState,
    isActivePlan,
    type PlanEligibility,
} from '../../components/packages/packageUi';
import type { MyPlan } from '../../services/PackageServices';
import { useAppSelector } from '../../store/hooks';
import {
    filterRunnableGateways,
    getGatewayOrderId,
    hasGatewayOrder,
    resolveDefaultGateway,
    resolveEnabledGateways,
    toApiPaymentGateway,
    type PaymentGateway,
} from '../../config/paymentGateways';
import {
    buildIciciVerifyPayload,
    isPayphiNativeLinked,
    isPayphiUserCancelled,
    openPayphiPayment,
    parsePayphiAppInfo,
    parsePayphiPaymentRequest,
    resolveIciciMerchantTxnNo,
} from '../../services/PayphiService';
import {
    buildCashfreeVerifyPayload,
    openCashfreePayment,
    resolveCashfreeCheckout,
    resolveCashfreeCfPaymentId,
} from '../../services/CashfreeService';
import PaymentGatewaySelector from '../../components/payment/PaymentGatewaySelector';
import {
    calculateFeeBreakdown,
    feeRateLabel,
    parseFeeQuoteConfig,
    roundMoney,
    type FeeQuoteConfig,
} from '../../utils/feeQuote';
import { styles } from './RazorpayScreen.styles';

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
    gateway?: PaymentGateway;
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
            gateway: stored.gateway || undefined,
        };
    } catch {
        return null;
    }
};

const savePendingConsultPayment = async (
    slotId: string | number | undefined,
    appointmentId: string | number | undefined,
    paymentId?: string | number | undefined,
    gateway?: PaymentGateway,
) => {
    if (slotId == null || appointmentId == null || appointmentId === '') return;
    await Utils.storeData(PENDING_PAYMENT_KEY, {
        slot_id: String(slotId),
        appointment_id: String(appointmentId),
        ...(paymentId != null && paymentId !== ''
            ? { payment_id: String(paymentId) }
            : {}),
        ...(gateway ? { gateway } : {}),
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

/** Gateway rejected the order because one already exists for this merchant reference. */
const isDuplicateGatewayOrder = (response: any) => {
    const errors = response?.data?.errors ?? response?.errors ?? {};
    const code = String(errors?.error_code ?? response?.data?.error_code ?? '').toUpperCase();
    const text = String(errors?.error_message ?? '').toLowerCase();
    return code === 'DUPLICATE_REQUEST' || text.includes('duplicate merchant reference');
};

const readAppointmentId = (data: any) =>
    String(
        data?.appointment_id ||
        data?.appointmentId ||
        data?.consultation_id ||
        data?.appointment?.id ||
        '',
    ).trim();

const PAID_STATUSES = ['success', 'paid', 'captured', 'completed', 'confirmed'];

/** book-slot finished the booking itself — nothing to pay at a gateway. */
const isBookingAlreadyPaid = (data: any) => {
    if (hasGatewayOrder(data)) return false;
    const status = String(data?.status ?? data?.payment_status ?? '').toLowerCase();
    const bookingStatus = String(data?.booking?.status ?? '').toLowerCase();
    return (
        PAID_STATUSES.includes(status) ||
        PAID_STATUSES.includes(bookingStatus) ||
        data?.funded_by_package === true ||
        !!data?.package_purchase_id
    );
};

/** book-slot / retry may put fields on `data` or at the top level. */
const pickConsultPaymentData = (response: any) => {
    if (!response || typeof response !== 'object') return {};
    const data =
        response.data && typeof response.data === 'object' ? response.data : {};
    return {
        ...response,
        ...data,
        payment_id: data.payment_id ?? response.payment_id,
        appointment_id: data.appointment_id ?? response.appointment_id,
        gateway: data.payment_gateway ?? data.gateway ?? response.gateway,
        payment_gateway: data.payment_gateway ?? data.gateway ?? response.gateway,
        gateway_order_id: data.gateway_order_id ?? response.gateway_order_id,
        razorpay_order_id: data.razorpay_order_id ?? response.razorpay_order_id,
        razorpay_key: data.razorpay_key ?? response.razorpay_key,
        key_id: data.key_id ?? response.key_id,
        icici: data.icici ?? response.icici,
        summary: data.summary ?? response.summary,
        status: data.status ?? response.status,
        payment_status: data.payment_status ?? response.payment_status,
    };
};

/** One-line summary of an API response for the payment debug logs. */
const logPayStep = (step: string, response: any) => {
    const data = pickConsultPaymentData(response);
    console.log(`[PAY] ${step} =>`, {
        success: response?.success,
        status: response?.status,
        message: response?.message,
        payment_id: data.payment_id,
        appointment_id: readAppointmentId(data),
        gateway: data.payment_gateway ?? data.gateway,
        gateway_order_id: data.gateway_order_id ?? data.razorpay_order_id,
        payment_status: data.payment_status ?? data.status,
    });
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

/** Payable after the plan is applied (fee-quote with package_purchase_id). Missing → covered (0). */
const resolvePlanPayableRupees = (data: any): number => {
    const summary = data?.summary ?? {};
    const candidates = [
        summary?.total_payable_amount,
        data?.total_payable_amount,
        summary?.payable_amount,
        data?.payable_amount,
        data?.amount,
    ];
    for (const value of candidates) {
        if (value == null || value === '') continue;
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0) return roundMoney(n);
    }
    return 0;
};

const PLAN_NOT_ELIGIBLE = 'This package cannot be used for this doctor.';

/** fee-quote `data.package_funding` → selectable only when `can_fund` is true. */
const readPlanFunding = (res: any): PlanEligibility => {
    const data = res?.data ?? {};
    const funding = data?.package_funding ?? {};
    const canFund = isApiSuccess(res) && funding?.can_fund === true;
    const payableRaw = funding?.total_payable_amount;
    const payable =
        payableRaw != null && payableRaw !== '' && Number.isFinite(Number(payableRaw))
            ? roundMoney(Number(payableRaw))
            : canFund
                ? resolvePlanPayableRupees(data)
                : null;
    const remaining = funding?.quantity_remaining;
    return {
        loading: false,
        canFund,
        reason: canFund
            ? ''
            : String(funding?.ineligible_reason || res?.message || PLAN_NOT_ELIGIBLE),
        payable,
        quantityRemaining:
            remaining != null && Number.isFinite(Number(remaining)) ? Number(remaining) : null,
    };
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
        doctorId,
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
    const [planSheetVisible, setPlanSheetVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<MyPlan | null>(null);
    const [planPayable, setPlanPayable] = useState<number | null>(null);
    const [planQuoteLoading, setPlanQuoteLoading] = useState(false);
    const planPromptShownRef = useRef(false);

    const customerData = useAppSelector(s => s.home.customerData);
    const enabledGateways = useMemo(
        () =>
            filterRunnableGateways(resolveEnabledGateways(customerData), {
                payphiNativeLinked: isPayphiNativeLinked(),
            }),
        [customerData],
    );
    const [gateway, setGateway] = useState<PaymentGateway>(() =>
        resolveDefaultGateway(customerData, enabledGateways),
    );
    useEffect(() => {
        if (!enabledGateways.includes(gateway)) {
            setGateway(resolveDefaultGateway(customerData, enabledGateways));
        }
    }, [enabledGateways, gateway, customerData]);

    const planDoctorId = String(
        doctorId || doctorInfo?.doctor_id || doctorInfo?.id || '',
    ).trim();

    const { purchases: activePurchases } = useMyPackages(
        { status: 'active', doctor_id: planDoctorId },
        !!planDoctorId,
    );
    const activePlans = useMemo(
        () => activePurchases.filter(isActivePlan),
        [activePurchases],
    );
    // fee-quote per plan → package_funding.can_fund decides if the plan is selectable
    const [planEligibility, setPlanEligibility] = useState<Record<string, PlanEligibility>>({});
    const activePlanKey = activePlans.map(p => p.id).join(',');

    useEffect(() => {
        const id = slotId?.id;
        if (!id || activePlans.length === 0) return;
        let cancelled = false;
        setPlanEligibility(
            Object.fromEntries(
                activePlans.map(p => [
                    p.id,
                    { loading: true, canFund: false, reason: '', payable: null, quantityRemaining: null },
                ]),
            ),
        );
        Promise.all(
            activePlans.map(async plan => {
                try {
                    const res = await _CONSULT_SERVICES.getConsultationFeeQuote(id, undefined, plan.id);
                    return [plan.id, readPlanFunding(res)] as const;
                } catch (e: any) {
                    return [
                        plan.id,
                        {
                            loading: false,
                            canFund: false,
                            reason: e?.message || 'Unable to check this plan',
                            payable: null,
                            quantityRemaining: null,
                        },
                    ] as const;
                }
            }),
        ).then(entries => {
            if (cancelled) return;
            const next = Object.fromEntries(entries);
            console.log('CONSULT_PLAN_ELIGIBILITY =>', next);
            setPlanEligibility(next);
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePlanKey, slotId?.id]);

    const usablePlans = useMemo(
        () => activePlans.filter(p => planEligibility[p.id]?.canFund),
        [activePlans, planEligibility],
    );

    useEffect(() => {
        console.log(
            'CONSULT_ACTIVE_PLANS =>',
            activePlans.map(p => ({ id: p.id, name: p.name, state: getPlanConsultState(p) })),
        );
        if (activePlans.length > 0 && !planPromptShownRef.current) {
            planPromptShownRef.current = true;
            setPlanSheetVisible(true);
        }
    }, [activePlans]);

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
    const specialization = useMemo(
        () => formatDoctorSpecialization(doctorInfo),
        [doctorInfo],
    );
    const attachedDocs = useMemo(() => {
        if (Array.isArray(medical_records) && medical_records.length > 0) {
            return medical_records;
        }
        // Fallback: IDs only — still show a placeholder row per attachment
        if (Array.isArray(medical_record_ids) && medical_record_ids.length > 0) {
            return medical_record_ids.map((id: any, index: number) => ({
                id,
                description: `Document ${index + 1}`,
                file_type: 'file',
            }));
        }
        return [];
    }, [medical_records, medical_record_ids]);
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

    const handleSelectPlan = useCallback(
        async (plan: MyPlan) => {
            setPlanSheetVisible(false);
            const id = slotId?.id;
            if (!id) return;
            setSelectedPlan(plan);
            const cached = planEligibility[plan.id];
            if (cached && !cached.loading && cached.canFund) {
                setPlanPayable(cached.payable ?? 0);
                console.log('CONSULT_PLAN_PAYABLE (cached) =>', plan.id, cached.payable);
                return;
            }
            setPlanQuoteLoading(true);
            try {
                const response = await _CONSULT_SERVICES.getConsultationFeeQuote(
                    id,
                    undefined,
                    plan.id,
                );
                const funding = readPlanFunding(response);
                if (!funding.canFund) {
                    showSuccessToast(funding.reason, 'error');
                    setSelectedPlan(null);
                    setPlanPayable(null);
                    return;
                }
                console.log('CONSULT_PLAN_PAYABLE =>', plan.id, funding.payable);
                setPlanPayable(funding.payable ?? 0);
            } catch (error: any) {
                console.log('CONSULT_PLAN_QUOTE_ERROR =>', error);
                showSuccessToast(error?.message || 'Unable to apply plan', 'error');
                setSelectedPlan(null);
                setPlanPayable(null);
            } finally {
                setPlanQuoteLoading(false);
            }
        },
        [slotId?.id, planEligibility],
    );

    const clearSelectedPlan = useCallback(() => {
        setSelectedPlan(null);
        setPlanPayable(null);
    }, []);

    const usingPlan = !!selectedPlan && planPayable != null;
    const totalAmount = usingPlan ? planPayable : feeBreakdown.total;
    const planCoveredAmount = usingPlan
        ? Math.max(0, roundMoney(feeBreakdown.total - planPayable))
        : 0;

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

    const onBookingSuccess = async (
        SlotsDetail: any,
        currentSlotId: string | number | undefined,
        message: string,
    ) => {
        // Toast only — do NOT show CustomNotification modal; OneSignal push covers that
        showSuccessToast(message, 'success');
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
        // Plan bookings return no concern / patient — fill from this screen so both flows match
        navigation.navigate('BookingConfrimScreen', {
            SlotsDetail: {
                concern,
                patient_name: patientName,
                patient_phone: activePatient?.phone_number || activePatient?.phone,
                ...(SlotsDetail ?? {}),
            },
        });
    };

    const handlePayment = async () => {
        if (loading || paymentStartedRef.current) return;

        try {
            setLoading(true);
            paymentStartedRef.current = true;

            const currentSlotId = slotId?.id;
            const planPurchaseId = usingPlan ? selectedPlan?.id : undefined;
            const pendingPayment = planPurchaseId
                ? null
                : await getPendingConsultPayment(currentSlotId);
            const apiGateway = toApiPaymentGateway(gateway);

            let paymentResponse: any;
            if (planPurchaseId) {
                paymentResponse =
                    await _CONSULT_SERVICES.createConsultationPayment({
                        slot_id: currentSlotId,
                        package_purchase_id: planPurchaseId,
                        concern: concern,
                        medical_record_ids: medical_record_ids,
                        ...(planPayable && planPayable > 0
                            ? { payment_gateway: apiGateway }
                            : {}),
                    });
                console.log('ConsultationPlanBookingResponse =>', paymentResponse);
                if (!isApiSuccess(paymentResponse)) {
                    showSuccessToast(
                        paymentResponse?.message || 'Unable to book with this plan',
                        'error',
                    );
                    return;
                }
                // Plan covers the consultation — appointment is confirmed, no gateway
                if (!hasGatewayOrder(paymentResponse?.data)) {
                    await onBookingSuccess(
                        paymentResponse?.data,
                        currentSlotId,
                        paymentResponse?.message || 'Appointment confirmed with your plan',
                    );
                    return;
                }
            } else {
                console.log('[PAY] 1. start =>', {
                    slot_id: currentSlotId,
                    gateway: apiGateway,
                    saved_pending: pendingPayment,
                });

                // Retry ONLY if pending was created for the SAME gateway.
                // Old ICICI pending + Razorpay select was returning gateway:icici (no razorpay_key).
                const canRetry =
                    Boolean(pendingPayment?.appointment_id) &&
                    (!pendingPayment?.gateway ||
                        pendingPayment.gateway === apiGateway);

                if (canRetry && pendingPayment?.appointment_id) {
                    try {
                        paymentResponse =
                            await _CONSULT_SERVICES.retryConsultationPayment(
                                pendingPayment.appointment_id,
                                apiGateway,
                            );
                    } catch (retryError) {
                        console.log('[PAY] 2. retry error =>', retryError);
                        paymentResponse = null;
                    }
                    logPayStep('2. retry (same gateway pending)', paymentResponse);
                    const retryData = pickConsultPaymentData(paymentResponse);
                    const retryGateway = String(
                        retryData?.payment_gateway ?? retryData?.gateway ?? '',
                    ).toLowerCase();
                    // Backend ignored payment_gateway and returned another gateway → book-slot fresh
                    if (
                        !isApiSuccess(paymentResponse) ||
                        (retryGateway && retryGateway !== apiGateway)
                    ) {
                        console.warn('[PAY] 2. retry gateway mismatch — clear & book-slot', {
                            selected: apiGateway,
                            returned: retryGateway,
                        });
                        await clearPendingConsultPayment(currentSlotId);
                        paymentResponse = null;
                    }
                } else if (pendingPayment?.appointment_id) {
                    console.warn('[PAY] skip retry — pending gateway differs', {
                        pending: pendingPayment.gateway,
                        selected: apiGateway,
                    });
                    await clearPendingConsultPayment(currentSlotId);
                }

                // book-slot: slot_id + payment_gateway (required), concern / medical_record_ids / coupon_code optional
                if (!paymentResponse) {
                    paymentResponse =
                        await _CONSULT_SERVICES.createConsultationPayment({
                            slot_id: currentSlotId,
                            concern: concern,
                            medical_record_ids: medical_record_ids,
                            coupon_code: appliedCoupon?.code,
                            payment_gateway: apiGateway,
                        });
                    logPayStep('2. book-slot', paymentResponse);

                    const duplicateAppointmentId = isDuplicateGatewayOrder(paymentResponse)
                        ? readAppointmentId(pickConsultPaymentData(paymentResponse)) ||
                          readAppointmentId(paymentResponse?.data?.errors)
                        : '';
                    if (duplicateAppointmentId) {
                        try {
                            const retryResponse =
                                await _CONSULT_SERVICES.retryConsultationPayment(
                                    duplicateAppointmentId,
                                    apiGateway,
                                );
                            logPayStep('2b. retry (duplicate order)', retryResponse);
                            if (isApiSuccess(retryResponse)) {
                                paymentResponse = retryResponse;
                            }
                        } catch (retryError) {
                            console.log('[PAY] 2b. retry error =>', retryError);
                        }
                    }
                }
            }

            if (!isApiSuccess(paymentResponse)) {
                console.log('[PAY] stop: order not created =>', paymentResponse);
                showSuccessToast(
                    isDuplicateGatewayOrder(paymentResponse)
                        ? 'A payment for this slot is already in progress. Please try again in a minute or choose another payment method.'
                        : paymentResponse?.message || 'Unable to start payment',
                    'error',
                );
                return;
            }

            const paymentData = pickConsultPaymentData(paymentResponse);
            const appointmentId =
                readAppointmentId(paymentData) || pendingPayment?.appointment_id || '';

            // Backend already confirmed the booking (e.g. auto-applied package / zero payable) — no gateway.
            if (isBookingAlreadyPaid(paymentData)) {
                console.log('[PAY] 3. already paid / no gateway order → booking success');
                await onBookingSuccess(
                    paymentData,
                    currentSlotId,
                    paymentResponse?.message || 'Appointment confirmed',
                );
                return;
            }

            if (appointmentId) {
                await savePendingConsultPayment(
                    currentSlotId,
                    appointmentId,
                    paymentData?.payment_id,
                    apiGateway,
                );
            }

            // Always use the gateway the user selected (not stale response.gateway)
            console.log('[PAY] 3. order gateway =>', {
                selected: apiGateway,
                api_returned: paymentData?.gateway ?? paymentData?.payment_gateway,
            });

            const payableRupees = resolveConsultPayableRupees(
                paymentData,
                totalAmount,
            );

            const contactNumber = String(
                activePatient?.phone_number ||
                activePatient?.phone ||
                doctorInfo?.phone_number ||
                '',
            ).replace(/\D/g, '');
            const customerName = String(
                activePatient?.first_name ||
                activePatient?.full_name ||
                doctorInfo?.full_name ||
                doctorName ||
                'AyurMuni Customer',
            );
            const customerEmail = String(
                activePatient?.email || doctorInfo?.email || 'customer@ayurmuni.com',
            );

            // ── ICICI PayPhi only when user selected ICICI (never on Razorpay) ──
            if (apiGateway === 'icici') {
                const appInfo = parsePayphiAppInfo(paymentData);
                const payRequest = parsePayphiPaymentRequest(paymentData, {
                    amount: payableRupees,
                    customerName,
                    customerEmail,
                    customerMobile: contactNumber
                        ? contactNumber.slice(-10)
                        : undefined,
                });
                console.warn('[PAY] icici start', {
                    payment_id: paymentData?.payment_id,
                    merchantId: appInfo?.merchantId,
                    appId: appInfo?.appId,
                    native: Boolean(isPayphiNativeLinked() && appInfo && payRequest),
                });

                const finishIciciVerify = async (args: {
                    merchantTxnNo: string;
                    gatewayPaymentId?: string;
                    gatewaySignature?: string;
                    pendingMessage?: string;
                }) => {
                    if (!paymentData?.payment_id || !args.merchantTxnNo) {
                        showSuccessToast(
                            'ICICI verify failed: missing payment_id or gateway_order_id.',
                            'error',
                        );
                        return;
                    }
                    setIsVerifyingPayment(true);
                    const verifyResponse =
                        await _CONSULT_SERVICES.verifyConsultationPayment(
                            buildIciciVerifyPayload({
                                paymentId: String(paymentData.payment_id),
                                merchantTxnNo: args.merchantTxnNo,
                                gatewayPaymentId: args.gatewayPaymentId,
                                gatewaySignature: args.gatewaySignature,
                            }),
                        );
                    logPayStep('5. icici verify', verifyResponse);
                    setIsVerifyingPayment(false);

                    if (verifyResponse?.success) {
                        await onBookingSuccess(
                            verifyResponse?.data,
                            currentSlotId,
                            args.pendingMessage || 'Payment Successful',
                        );
                        return;
                    }
                    if (args.pendingMessage) {
                        showSuccessToast(args.pendingMessage, 'success');
                        return;
                    }
                    showSuccessToast(
                        verifyResponse?.message || 'Payment verification failed',
                        'error',
                    );
                };

                let nativeOpenFailed: any = null;
                if (isPayphiNativeLinked() && appInfo && payRequest) {
                    try {
                        const payphiResult = await openPayphiPayment(
                            appInfo,
                            payRequest,
                        );
                        console.warn('[PAY] icici native', payphiResult);

                        if (
                            isPayphiUserCancelled(payphiResult) ||
                            payphiResult.status === 'cancelled'
                        ) {
                            console.warn('[PAY] icici cancelled', payphiResult);
                            if (payphiResult.message) {
                                showSuccessToast(payphiResult.message, 'error');
                            }
                            return;
                        }

                        if (payphiResult.status === 'failed') {
                            console.warn('[PAY] icici failed', payphiResult);
                            showSuccessToast(
                                payphiResult.message || String(payphiResult.raw ?? ''),
                                'error',
                            );
                            return;
                        }

                        const verifyTxnNo = resolveIciciMerchantTxnNo(
                            paymentData,
                            payphiResult.gatewayOrderId,
                        );
                        console.warn('[PAY] icici verify prep', {
                            payment_id: paymentData?.payment_id,
                            book_slot_gateway_order_id:
                                paymentData?.gateway_order_id ||
                                paymentData?.icici?.merchantTxnNo,
                            sdk_merchantTxnNo: payphiResult.gatewayOrderId,
                            verify_gateway_order_id: verifyTxnNo,
                            gateway_payment_id: payphiResult.gatewayPaymentId,
                            has_signature: Boolean(payphiResult.gatewaySignature),
                        });
                        await finishIciciVerify({
                            merchantTxnNo: verifyTxnNo,
                            // Same as Cashfree: signature = txn id (not PayPhi secureHash)
                            gatewayPaymentId: payphiResult.gatewayPaymentId,
                            gatewaySignature:
                                payphiResult.gatewayPaymentId || verifyTxnNo,
                            pendingMessage:
                                payphiResult.status === 'pending'
                                    ? payphiResult.message || undefined
                                    : undefined,
                        });
                        return;
                    } catch (error: any) {
                        nativeOpenFailed = error;
                        console.warn('[PAY] icici native error', {
                            code: error?.code,
                            message: error?.message,
                            error,
                        });
                    }
                }

                console.warn('[PAY] icici stop', {
                    code: nativeOpenFailed?.code,
                    message: nativeOpenFailed?.message,
                    native: isPayphiNativeLinked(),
                    hasAppInfo: Boolean(appInfo),
                    hasPayRequest: Boolean(payRequest),
                });
                if (!isPayphiNativeLinked()) {
                    showSuccessToast(
                        "ICICI PayPhi SDK is not linked in this build. Rebuild the app (npx react-native run-android) after installing react-native-payphi-sdk.",
                        'error',
                    );
                } else if (!appInfo || !payRequest) {
                    showSuccessToast(
                        'ICICI payment data incomplete (merchantId / txn / email). Try again or contact support.',
                        'error',
                    );
                } else if (nativeOpenFailed?.message || nativeOpenFailed?.code) {
                    // Exact SDK / bridge message only
                    showSuccessToast(
                        String(nativeOpenFailed?.message || nativeOpenFailed?.code),
                        'error',
                    );
                }
                return;
            }

            // ── Cashfree SDK ───────────────────────────────────────
            // book-slot → (session from API or SANDBOX create) → doWebPayment → verify
            if (apiGateway === 'cashfree') {
                let cfSession;
                try {
                    cfSession = await resolveCashfreeCheckout(paymentData);
                } catch (sessionError: any) {
                    console.warn('[PAY] cashfree session error', sessionError);
                    showSuccessToast(
                        sessionError?.message ||
                            'Cashfree session was not created. Backend must return payment_session_id.',
                        'error',
                    );
                    return;
                }

                console.warn('[PAY] cashfree start', {
                    orderId: cfSession.orderId,
                    paymentId: paymentData?.payment_id || cfSession.paymentId,
                    env: cfSession.environment,
                });

                const cfResult = await openCashfreePayment(cfSession);
                console.warn('[PAY] cashfree result', cfResult);

                if (cfResult.status === 'cancelled') {
                    showSuccessToast(
                        cfResult.message ||
                            'Payment cancelled. You can try again anytime.',
                        'error',
                    );
                    return;
                }
                if (cfResult.status === 'failed') {
                    showSuccessToast(
                        cfResult.message || 'Cashfree payment failed',
                        'error',
                    );
                    return;
                }

                const djangoPaymentId = String(
                    paymentData?.payment_id || cfSession.paymentId || '',
                );
                if (!djangoPaymentId) {
                    showSuccessToast(
                        'Cashfree paid, but payment_id missing for verify. Check My Appointments.',
                        'success',
                    );
                    return;
                }

                const cfOrderId =
                    String(paymentData?.gateway_order_id || '').trim() ||
                    cfResult.orderId ||
                    cfSession.orderId;

                // cf_payment_id from SDK events or Cashfree Get Payments (not a Django API)
                let cfGatewayPaymentId = String(
                    cfResult.gatewayPaymentId || '',
                ).trim();
                if (!/^\d{8,}$/.test(cfGatewayPaymentId)) {
                    cfGatewayPaymentId = await resolveCashfreeCfPaymentId({
                        orderId: cfOrderId,
                        appId: cfSession.appId,
                        appSecret: cfSession.appSecret,
                        hintPaymentId: cfResult.gatewayPaymentId,
                    });
                }
                if (!/^\d{8,}$/.test(cfGatewayPaymentId)) {
                    showSuccessToast(
                        'Payment received, but Cashfree cf_payment_id is missing. Ensure book-slot returns cashfree credentials, or check My Appointments.',
                        'error',
                    );
                    return;
                }

                setIsVerifyingPayment(true);
                let verifyResponse;
                try {
                    // Exact body — no payment_gateway, no session_ ids
                    verifyResponse =
                        await _CONSULT_SERVICES.verifyConsultationPayment(
                            buildCashfreeVerifyPayload({
                                paymentId: djangoPaymentId,
                                orderId: cfOrderId,
                                gatewayPaymentId: cfGatewayPaymentId,
                                gatewaySignature: cfGatewayPaymentId,
                            }),
                        );
                } catch (verifyError: any) {
                    setIsVerifyingPayment(false);
                    showSuccessToast(
                        verifyError?.message ||
                            'Cashfree verify payload failed.',
                        'error',
                    );
                    return;
                }
                logPayStep('5. cashfree verify', verifyResponse);
                setIsVerifyingPayment(false);

                if (verifyResponse?.success) {
                    await onBookingSuccess(
                        verifyResponse?.data,
                        currentSlotId,
                        'Payment Successful',
                    );
                } else {
                    showSuccessToast(
                        verifyResponse?.message ||
                            'Payment received. Booking will confirm shortly — check My Appointments.',
                        verifyResponse?.success === false ? 'error' : 'success',
                    );
                }
                return;
            }

            // ── Razorpay native SDK ────────────────────────────────
            // book-slot → openRazorpayPayment → verify-payment
            if (apiGateway !== 'razorpay') {
                console.warn('[PAY] stop: unsupported gateway', {
                    selected: apiGateway,
                });
                return;
            }

            const razorpayKey = pickRazorpayKey(paymentData);
            const razorpayOrderId = getGatewayOrderId(paymentData, 'razorpay');
            console.warn('[PAY] razorpay fields', {
                hasKey: Boolean(razorpayKey),
                orderId: razorpayOrderId,
                payment_id: paymentData?.payment_id,
            });
            if (!razorpayKey || !razorpayOrderId) {
                showSuccessToast(
                    !razorpayKey
                        ? 'Payment key missing from order response'
                        : 'Razorpay order was not created',
                    'error',
                );
                return;
            }

            const amountPaise = toRazorpayPaise(
                paymentData?.amount ??
                paymentData?.summary?.total_payable_amount,
                payableRupees,
            );

            let razorpayResult: any;

            try {
                razorpayResult = await openRazorpayPayment({
                    key: razorpayKey,
                    amount: amountPaise,
                    order_id: razorpayOrderId,
                    name: doctorInfo?.full_name || doctorName,
                    email:
                        activePatient?.email ||
                        doctorInfo?.email ||
                        'customer@ayurmuni.com',
                    contact: contactNumber,
                    description: 'Consultation payment',
                    themeColor: Colors.primaryColor,
                });
                console.log('[PAY] 4. razorpay SDK result =>', {
                    order_id: razorpayResult?.razorpay_order_id,
                    payment_id: razorpayResult?.razorpay_payment_id,
                });
            } catch (error: any) {
                setIsVerifyingPayment(false);
                console.log('[PAY] razorpay SDK error =>', error);

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

            // verify-payment: payment_id, gateway_order_id, gateway_payment_id, gateway_signature
            const verifyResponse =
                await _CONSULT_SERVICES.verifyConsultationPayment({
                    payment_id: String(paymentData?.payment_id ?? ''),
                    gateway_order_id: String(
                        razorpayResult?.razorpay_order_id ||
                            getGatewayOrderId(paymentData, 'razorpay') ||
                            '',
                    ),
                    gateway_payment_id: String(
                        razorpayResult?.razorpay_payment_id ?? '',
                    ),
                    gateway_signature: String(
                        razorpayResult?.razorpay_signature ?? '',
                    ),
                });
            logPayStep('5. razorpay verify', verifyResponse);

            setIsVerifyingPayment(false);

            if (verifyResponse?.success) {
                await onBookingSuccess(
                    verifyResponse?.data,
                    currentSlotId,
                    'Payment Successful',
                );
            } else {
                showSuccessToast(
                    verifyResponse?.message || 'Payment verification failed',
                    'error',
                );
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

    const payDisabled =
        loading ||
        planQuoteLoading ||
        (usingPlan ? false : feeQuoteLoading || !feeQuote);
    const priceLoading = usingPlan ? planQuoteLoading : feeQuoteLoading || planQuoteLoading;
    const planIsFree = usingPlan && planPayable === 0;
    const selectedPlanRemaining = (() => {
        const benefit = selectedPlan ? getConsultBenefit(selectedPlan) : null;
        if (!benefit) return '';
        if (benefit.quantity_remaining == null) return 'Unlimited consultations';
        return `${benefit.quantity_remaining} consultation${benefit.quantity_remaining === 1 ? '' : 's'} left`;
    })();

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
                                    <DietitianBadge doctor={doctorInfo} />
                                    {!!specialization && (
                                        <Text
                                            style={styles.qualification}
                                            numberOfLines={1}
                                        >
                                            {specialization}
                                        </Text>
                                    )}
                                    {!!qualification && (
                                        <Text
                                            style={styles.qualification}
                                            numberOfLines={1}
                                        >
                                            {qualification}
                                        </Text>
                                    )}
                                    <Text style={styles.secureChipText} numberOfLines={1}>
                                        {dateLabel} · {timeLabel}
                                    </Text>
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

                            <View style={styles.docsSection}>
                                <Text style={styles.docsTitle}>
                                    Attached documents
                                </Text>
                                {attachedDocs.length > 0 ? (
                                    attachedDocs.map(
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
                                    )
                                ) : (
                                    <Text style={styles.concernValue}>
                                        No documents attached
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Active plan */}
                        {activePlans.length > 0 ? (
                            selectedPlan ? (
                                <LinearGradient
                                    colors={['#0A4A3C', '#0D614E', '#178A6E']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.planCard}
                                >
                                    <View style={styles.planIcon}>
                                        <TablerIcon name="star-filled" size={16} color="#E8C27A" />
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={styles.planEyebrow}>Booking with your plan</Text>
                                        <Text style={styles.planName} numberOfLines={1}>
                                            {selectedPlan.name}
                                        </Text>
                                        {planQuoteLoading ? (
                                            <Text style={styles.planMeta}>Checking plan benefit…</Text>
                                        ) : (
                                            <Text style={styles.planMeta} numberOfLines={1}>
                                                {[
                                                    planIsFree ? 'No payment needed' : null,
                                                    selectedPlanRemaining,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.planActions}>
                                        <TouchableOpacity
                                            disabled={loading}
                                            onPress={() => setPlanSheetVisible(true)}
                                            style={styles.planChangeBtn}
                                        >
                                            <Text style={styles.planChangeText}>Change</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            disabled={loading}
                                            onPress={clearSelectedPlan}
                                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        >
                                            <Text style={styles.planRemoveText}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            ) : (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => setPlanSheetVisible(true)}
                                    style={styles.planPrompt}
                                >
                                    <View style={styles.planPromptIcon}>
                                        <TablerIcon name="star-filled" size={15} color="#B7791F" />
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={styles.planPromptTitle}>
                                            You have {activePlans.length} active plan
                                            {activePlans.length > 1 ? 's' : ''}
                                        </Text>
                                        <Text style={styles.planPromptSub}>
                                            {usablePlans.length > 0
                                                ? 'Book this consultation without paying'
                                                : 'Consultations in your plans are used up'}
                                        </Text>
                                    </View>
                                    <Text style={styles.planPromptCta}>
                                        {usablePlans.length > 0 ? 'Use plan' : 'View'}
                                    </Text>
                                </TouchableOpacity>
                            )
                        ) : null}

                        {/* Coupons */}
                        {usingPlan ? null : (
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
                        )}

                        {!planIsFree && enabledGateways.length > 1 ? (
                            <View style={styles.card}>
                                <PaymentGatewaySelector
                                    gateways={enabledGateways}
                                    selected={gateway}
                                    onSelect={setGateway}
                                    disabled={loading}
                                />
                            </View>
                        ) : null}

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

                            {priceLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primaryColor}
                                    style={{ marginVertical: 14 }}
                                />
                            ) : usingPlan ? (
                                <>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>
                                            Consultation total
                                        </Text>
                                        <RupeeAmount
                                            value={feeBreakdown.total}
                                            style={styles.summaryValue}
                                            decimals={2}
                                        />
                                    </View>
                                    {planCoveredAmount > 0 ? (
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryDiscountLabel} numberOfLines={1}>
                                                Covered by plan
                                            </Text>
                                            <View style={styles.discountRow}>
                                                <Text style={styles.summaryDiscountValue}>−{' '}</Text>
                                                <RupeeAmount
                                                    value={planCoveredAmount}
                                                    style={styles.summaryDiscountValue}
                                                    decimals={2}
                                                />
                                            </View>
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
                                                    name="star-filled"
                                                    size={12}
                                                    color={Colors.primaryColor}
                                                />
                                                <Text style={styles.secureText}>
                                                    Paid via {selectedPlan?.name || 'plan'}
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
                                                Discount
                                                {/* {appliedCoupon?.code
                                                    ? ` (${appliedCoupon.code})`
                                                    : ''} */}
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
                                                Sub total(After coupon)
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

                                    {feeBreakdown.gst > 0 ? (
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
                                {priceLoading ? (
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
                                                name={planIsFree ? 'circle-check' : 'credit-card'}
                                                size={16}
                                                color="#FFFFFF"
                                            />
                                            <Text style={styles.primaryBtnText}>
                                                {planIsFree ? 'Confirm booking' : 'Pay now'}
                                            </Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            )}

            <ActivePlanPickerSheet
                visible={planSheetVisible && !isVerifyingPayment}
                plans={activePlans}
                eligibility={planEligibility}
                selectedId={selectedPlan?.id}
                onSelect={handleSelectPlan}
                onPayNormally={() => {
                    setPlanSheetVisible(false);
                    clearSelectedPlan();
                }}
                onClose={() => setPlanSheetVisible(false)}
            />

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
