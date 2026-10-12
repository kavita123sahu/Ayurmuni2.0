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
import { getDoctorDisplayName, resolveDoctorProfileImageUri } from '../../utils/doctorUtils';
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
    resolveDefaultGateway,
    resolveEnabledGateways,
    type PaymentGateway,
} from '../../config/paymentGateways';
import {
    getGatewayOrderId,
    hasGatewayOrder,
    parsePineLabsCheckout,
    resolveOrderGateway,
    type PineLabsCheckout,
} from '../../services/PineLabsService';
import PaymentGatewaySelector from '../../components/payment/PaymentGatewaySelector';
import PineLabsCheckoutModal, {
    type PineLabsCheckoutOutcome,
    type PineLabsPageResult,
} from '../../components/payment/PineLabsCheckoutModal';

type PineLabsFinishResult = {
    outcome: PineLabsCheckoutOutcome;
    pageResult?: PineLabsPageResult;
};
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

/** One-line summary of an API response for the payment debug logs. */
const logPayStep = (step: string, response: any) =>
    console.log(`[PAY] ${step} =>`, {
        success: response?.success,
        status: response?.status,
        message: response?.message,
        payment_id: response?.data?.payment_id,
        appointment_id: readAppointmentId(response?.data),
        gateway: response?.data?.payment_gateway ?? response?.data?.gateway,
        gateway_order_id: response?.data?.gateway_order_id ?? response?.data?.razorpay_order_id,
        payment_status: response?.data?.status ?? response?.data?.payment_status,
    });

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

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * verify-payment for Pine Labs `{ payment_id, gateway_order_id }`.
 * The backend webhook may land a moment after the redirect, so a returned checkout is re-checked briefly.
 */
const verifyPineLabsPayment = async (
    checkout: PineLabsCheckout,
    outcome: PineLabsCheckoutOutcome,
) => {
    const attempts = outcome === 'returned' ? 4 : 1;
    let last: any = null;
    for (let i = 0; i < attempts; i += 1) {
        try {
            last = await _CONSULT_SERVICES.verifyConsultationPayment({
                payment_id: checkout.paymentId,
                gateway_order_id: checkout.orderId,
            });
            logPayStep(`5. verify attempt ${i + 1}/${attempts}`, last);
            if (isApiSuccess(last)) return last;
        } catch (e) {
            console.log('[PAY] 5. verify error =>', e);
        }
        if (i < attempts - 1) await wait(2500);
    }
    return last;
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
        () => resolveEnabledGateways(customerData),
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
    const [pineCheckout, setPineCheckout] = useState<PineLabsCheckout | null>(null);

    const pineResolveRef = useRef<
        ((result: PineLabsFinishResult) => void) | null
    >(null);

    const openPineLabsCheckout = useCallback(
        (checkout: PineLabsCheckout) =>
            new Promise<PineLabsFinishResult>(resolve => {
                pineResolveRef.current = resolve;
                setPineCheckout(checkout);
            }),
        [],
    );

    const pineVerifiedRef = useRef<any>(null);

    const checkPineLabsOnResume = useCallback(async () => {
        if (!pineCheckout) return false;

        try {
            const res =
                await _CONSULT_SERVICES.verifyConsultationPayment({
                    payment_id: pineCheckout.paymentId,
                    gateway_order_id: pineCheckout.orderId,
                });

            logPayStep('4a. verify on app resume', res);

            if (isApiSuccess(res)) {
                pineVerifiedRef.current = res;
            }

            return isApiSuccess(res);
        } catch (e) {
            console.log('[PAY] 4a. verify on resume error =>', e);
            return false;
        }
    }, [pineCheckout]);

    const onPineLabsFinish = useCallback(
        (
            outcome: PineLabsCheckoutOutcome,
            pageResult?: PineLabsPageResult,
        ) => {
            console.log('[PAY] Pine Labs modal finished =>', {
                outcome,
                pageResult,
            });

            setPineCheckout(null);

            pineResolveRef.current?.({
                outcome,
                pageResult,
            });

            pineResolveRef.current = null;
        },
        [],
    );

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

            let paymentResponse: any;
            if (planPurchaseId) {
                paymentResponse =
                    await _CONSULT_SERVICES.createConsultationPayment({
                        slot_id: currentSlotId,
                        package_purchase_id: planPurchaseId,
                        concern: concern,
                        medical_record_ids: medical_record_ids,
                        ...(planPayable && planPayable > 0
                            ? { payment_gateway: gateway }
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
                    gateway,
                    saved_pending: pendingPayment,
                });
                // A payment was already created for this slot on an earlier tap → retry only.
                if (pendingPayment?.appointment_id) {
                    try {
                        paymentResponse =
                            await _CONSULT_SERVICES.retryConsultationPayment(
                                pendingPayment.appointment_id,
                                gateway,
                            );
                    } catch (retryError) {
                        console.log('[PAY] 2. retry error =>', retryError);
                        paymentResponse = null;
                    }
                    logPayStep('2. retry (earlier attempt for this slot)', paymentResponse);
                    if (!isApiSuccess(paymentResponse)) {
                        await clearPendingConsultPayment(currentSlotId);
                        paymentResponse = null;
                    }
                }
                // First tap for this slot → book-slot only (no retry right after).
                if (!paymentResponse) {
                    paymentResponse =
                        await _CONSULT_SERVICES.createConsultationPayment({
                            slot_id: currentSlotId,
                            concern: concern,
                            medical_record_ids: medical_record_ids,
                            coupon_code: appliedCoupon?.code,
                            payment_gateway: gateway,
                        });
                    logPayStep('2. book-slot (first attempt)', paymentResponse);

                    const duplicateAppointmentId = isDuplicateGatewayOrder(paymentResponse)
                        ? readAppointmentId(paymentResponse?.data) ||
                        readAppointmentId(paymentResponse?.data?.errors)
                        : '';
                    if (duplicateAppointmentId) {
                        try {
                            const retryResponse =
                                await _CONSULT_SERVICES.retryConsultationPayment(
                                    duplicateAppointmentId,
                                    gateway,
                                );
                            logPayStep('2b. retry (duplicate order)', retryResponse);
                            if (isApiSuccess(retryResponse)) paymentResponse = retryResponse;
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

            const paymentData = paymentResponse?.data ?? {};
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
                    gateway,
                );
            }

            const orderGateway = resolveOrderGateway(paymentData, gateway);
            console.log('[PAY] 3. order gateway =>', orderGateway);

            if (orderGateway === 'pinelabs') {
                const checkout = parsePineLabsCheckout(paymentData);

                console.log('[PAY] 3. pine labs checkout =>', checkout);

                if (
                    !checkout.redirectUrl ||
                    !checkout.orderId ||
                    !checkout.paymentId
                ) {
                    console.log(
                        '[PAY] stop: checkout fields missing =>',
                        {
                            redirectUrl: checkout.redirectUrl,
                            orderId: checkout.orderId,
                            paymentId: checkout.paymentId,
                        },
                    );

                    showSuccessToast(
                        'Pine Labs checkout is not available right now',
                        'error',
                    );

                    return;
                }

                console.log('[PAY] Opening Pine Labs checkout =>', {
                    paymentId: checkout.paymentId,
                    orderId: checkout.orderId,
                    redirectUrl: checkout.redirectUrl,
                });

                // Reset previous verification result
                pineVerifiedRef.current = null;

                // Open Pine Labs WebView
                const { outcome, pageResult } =
                    await openPineLabsCheckout(checkout);

                console.log('[PAY] 4. Pine Labs checkout finished =>', {
                    outcome,
                    pageStatus: pageResult?.status,
                    pageText: pageResult?.text,
                });

                setIsVerifyingPayment(true);

                let verifyResponse: any = null;

                try {
                    // First priority:
                    // If payment was already verified while app resumed,
                    // use that response.
                    if (pineVerifiedRef.current) {
                        verifyResponse = pineVerifiedRef.current;

                        console.log(
                            '[PAY] 4a. using resume verification response =>',
                            verifyResponse,
                        );
                    } else {
                        // IMPORTANT:
                        // Do NOT convert failed into "closed".
                        // Send the actual checkout outcome.
                        verifyResponse = await verifyPineLabsPayment(
                            checkout,
                            outcome,
                        );

                        console.log(
                            '[PAY] 4b. final Pine Labs verification =>',
                            verifyResponse,
                        );
                    }
                } catch (verifyError) {
                    console.log(
                        '[PAY] Pine Labs verification error =>',
                        verifyError,
                    );
                }

                pineVerifiedRef.current = null;

                setIsVerifyingPayment(false);

                // --------------------------------------------------
                // SUCCESS
                // --------------------------------------------------

                if (verifyResponse?.success) {
                    console.log(
                        '[PAY] result: Pine Labs payment SUCCESS',
                    );

                    await onBookingSuccess(
                        verifyResponse?.data,
                        currentSlotId,
                        'Payment Successful',
                    );

                    return;
                }

                // --------------------------------------------------
                // PINE LABS PAYMENT FAILED
                // --------------------------------------------------

                if (pageResult?.status === 'failed') {
                    console.log(
                        '[PAY] result: Pine Labs payment FAILED',
                        {
                            outcome,
                            pageResult,
                            verifyResponse,
                        },
                    );

                    showSuccessToast(
                        'Payment failed at Pine Labs. Please try again or use another payment method.',
                        'error',
                    );

                    return;
                }

                // --------------------------------------------------
                // PINE LABS SHOWED SUCCESS BUT BACKEND VERIFY FAILED
                // --------------------------------------------------

                if (pageResult?.status === 'success') {
                    console.log(
                        '[PAY] Pine Labs shows SUCCESS but backend verification failed',
                        {
                            status: verifyResponse?.status,
                            message: verifyResponse?.message,
                            response: verifyResponse,
                        },
                    );

                    showSuccessToast(
                        'Payment received. Your booking is being confirmed — check My Appointments in a moment.',
                        'success',
                    );

                    return;
                }

                // --------------------------------------------------
                // USER CLOSED / CANCELLED CHECKOUT
                // --------------------------------------------------

                if (outcome === 'closed') {
                    console.log(
                        '[PAY] result: Pine Labs checkout closed by user',
                    );

                    showSuccessToast(
                        'Payment cancelled. You can try again anytime.',
                        'error',
                    );

                    return;
                }

                // --------------------------------------------------
                // UNKNOWN / VERIFICATION FAILURE
                // --------------------------------------------------

                console.log(
                    '[PAY] result: Pine Labs payment verification failed',
                    {
                        outcome,
                        pageResult,
                        verifyResponse,
                    },
                );

                showSuccessToast(
                    verifyResponse?.message ||
                    'Payment verification failed. Please try again.',
                    'error',
                );

                return;
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
                    key:
                        paymentData?.razorpay_key ||
                        paymentData?.gateway_key ||
                        paymentData?.key_id,
                    amount: amountPaise,
                    order_id: getGatewayOrderId(paymentData, 'razorpay'),
                    name: doctorInfo?.full_name || doctorName,
                    email: doctorInfo?.email || 'customer@ayurmuni.com',
                    contact: contactNumber,
                    description: 'Consultation payment',
                    themeColor: Colors.primaryColor,
                });
                console.log("razorpayResultrazorpayResultrazorpayResult", razorpayResult);
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
                    payment_id: String(paymentData?.payment_id ?? ''),
                    gateway_order_id:
                        razorpayResult?.razorpay_order_id ||
                        getGatewayOrderId(paymentData, 'razorpay'),
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

            <PineLabsCheckoutModal
                visible={!!pineCheckout}
                url={pineCheckout?.redirectUrl ?? ''}
                returnUrl={pineCheckout?.returnUrl}
                onFinish={onPineLabsFinish}
                checkOnResume={checkPineLabsOnResume}
            />
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
