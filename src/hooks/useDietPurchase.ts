import { useCallback, useEffect, useRef, useState } from 'react';
import { requireAuth } from '../services/guestAuth';
import { getPayerDetails } from '../services/PayerDetails';
import { showSuccessToast } from '../config/Key';
import {
  buildDietVerifyPayload,
  clearDietPaymentSettled,
  dietPlanNeedsPurchase,
  isDietAlreadyPurchasedMessage,
  isDietPaymentSettled,
  isDietPaymentVerified,
  parseDietPurchase,
  purchaseDietPlan,
  rememberDietPaymentSettled,
  verifyDietPayment,
  type ParsedDietPurchase,
} from '../services/DietPurchaseService';
import {
  clearCashfreePending,
  enrichCashfreeVerifyPayload,
  harvestCashfreeGateway,
  openCashfreePayment,
  resolveCashfreeCheckout,
  resolveCashfreeCfPaymentId,
  saveCashfreePending,
  verifyCashfreeUntilSettled,
} from '../services/CashfreeService';

export type DietPurchaseReview = {
  item: any;
  options?: { daily_water_intake_goal?: number };
  quote: ParsedDietPurchase | null;
  loading: boolean;
  paying: boolean;
  error: string;
};

type StartPlanFn = (
  planId?: string,
  options?: { daily_water_intake_goal?: number },
) => Promise<any>;

type Args = {
  plan: any;
  planId: string;
  status: string;
  startPlan: StartPlanFn;
  onStarted?: () => void;
  onConflict?: (payload: {
    activeName: string;
    activeId: string;
    activePlanId: string;
    catalogId: string;
    waterGoal?: number;
  }) => void;
};

/**
 * Paid diets: purchase → invoice sheet → Cashfree → verify → start.
 * Free / already-running / settled plans call start directly.
 */
export const useDietPurchase = ({
  plan,
  planId,
  status,
  startPlan,
  onStarted,
  onConflict,
}: Args) => {
  const [review, setReview] = useState<DietPurchaseReview | null>(null);
  const [settled, setSettled] = useState(false);
  const customStartRef = useRef<StartPlanFn | null>(null);
  const onConflictRef = useRef(onConflict);
  const onStartedRef = useRef(onStarted);
  onConflictRef.current = onConflict;
  onStartedRef.current = onStarted;

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await isDietPaymentSettled(planId);
      if (alive) setSettled(ok);
    })();
    return () => {
      alive = false;
    };
  }, [planId]);

  const finish = useCallback(
    async (options?: { daily_water_intake_goal?: number }) => {
      const starter = customStartRef.current || startPlan;
      customStartRef.current = null;
      const result = await starter(planId, options);
      if (result === true) {
        await clearDietPaymentSettled(planId);
        setSettled(false);
        onStartedRef.current?.();
      }
      if (result?.conflict) {
        onConflictRef.current?.({
          activeName:
            result.activePlan?.name ||
            result.activePlan?.title ||
            'Your current plan',
          activeId: result.activePlan?.patient_diet_plan_id || '',
          activePlanId: String(
            result.activePlan?.diet_plan_id || result.activePlan?.id || '',
          ).trim(),
          catalogId: planId,
          waterGoal: options?.daily_water_intake_goal,
        });
      }
      return result;
    },
    [planId, startPlan],
  );

  const requestPurchase = useCallback(async (): Promise<
    | ParsedDietPurchase
    | { cancelled: true }
    | { skipGateway: true; alreadyPaid?: boolean; error: string; purchaseId?: string }
    | { error: string }
  > => {
    if (!(await requireAuth('Please login to start a diet plan'))) {
      return { cancelled: true };
    }
    const id = String(planId || '').trim();
    if (!id) return { error: 'Could not start payment.' };

    try {
      const payer = await getPayerDetails();
      const body = {
        diet_plan_id: id,
        patient_id: payer.patient?.id ?? null,
        payment_gateway: 'cashfree',
      };
      const result: any = await purchaseDietPlan(body);
      if (!result?.success) {
        const message = result?.message || 'Could not start payment.';
        if (isDietAlreadyPurchasedMessage(message)) {
          return { skipGateway: true, alreadyPaid: true, error: '' };
        }
        return { error: message };
      }
      return parseDietPurchase(result, body.payment_gateway);
    } catch (err: any) {
      const message = err?.message || 'Unable to start payment.';
      if (isDietAlreadyPurchasedMessage(message)) {
        return { skipGateway: true, alreadyPaid: true, error: '' };
      }
      return { error: message };
    }
  }, [planId]);

  const openCheckout = useCallback(
    async (item: any, options?: { daily_water_intake_goal?: number }) => {
      setReview({
        item,
        options,
        quote: null,
        loading: true,
        paying: false,
        error: '',
      });
      const parsed = await requestPurchase();
      if ('cancelled' in parsed && parsed.cancelled) {
        setReview(null);
        return;
      }
      if ('skipGateway' in parsed && parsed.skipGateway && !parsed.error) {
        setReview(null);
        await rememberDietPaymentSettled(planId, (parsed as any).purchaseId);
        setSettled(true);
        await finish(options);
        return;
      }
      if ('error' in parsed && parsed.error && !('purchaseId' in parsed)) {
        setReview({
          item,
          options,
          quote: null,
          loading: false,
          paying: false,
          error: parsed.error,
        });
        return;
      }
      const quote = parsed as ParsedDietPurchase;
      setReview({
        item,
        options,
        quote: quote.error && !quote.purchaseId ? null : quote,
        loading: false,
        paying: false,
        error: quote.error || '',
      });
    },
    [requestPurchase, planId, finish],
  );

  const begin = useCallback(
    async (
      options?: { daily_water_intake_goal?: number },
      /** e.g. pause-active-then-start after a conflict confirm */
      customStart?: StartPlanFn,
    ) => {
      customStartRef.current = customStart || null;
      const needsPay =
        dietPlanNeedsPurchase(plan, status) &&
        !(await isDietPaymentSettled(planId));
      if (!needsPay) {
        return finish(options);
      }
      if (!(await requireAuth('Please login to start a diet plan'))) {
        customStartRef.current = null;
        return false;
      }
      openCheckout(plan, options);
      return 'payment';
    },
    [plan, status, planId, finish, openCheckout],
  );

  const pay = useCallback(async () => {
    const current = review;
    if (!current?.quote || current.quote.error || current.paying || current.loading) {
      return;
    }
    setReview({ ...current, paying: true, error: '' });

    const parsed = current.quote;
    if (parsed.skipGateway) {
      await rememberDietPaymentSettled(planId, parsed.purchaseId);
      setSettled(true);
      setReview(null);
      await finish(current.options);
      return;
    }

    try {
      const paymentSource = {
        ...parsed.purchase,
        ...parsed.checkout,
        cashfree: parsed.checkout?.cashfree || parsed.purchase?.cashfree,
        payment_session_id: parsed.sessionId,
        gateway_order_id: parsed.gatewayOrderId,
        cashfree_order_id: parsed.gatewayOrderId,
      };
      const cfSession = await resolveCashfreeCheckout(paymentSource);
      await saveCashfreePending({
        kind: 'diet',
        paymentId: String(parsed.purchaseId || ''),
        orderId: String(cfSession.orderId || parsed.gatewayOrderId || ''),
        sessionId: cfSession.paymentSessionId,
        meta: {
          diet_plan_id: planId,
          purchase_id: parsed.purchaseId,
          water_goal: current.options?.daily_water_intake_goal ?? null,
        },
      });
      const cfResult = await openCashfreePayment(cfSession);

      if (cfResult.status === 'cancelled') {
        await clearCashfreePending();
        showSuccessToast(
          cfResult.message || 'Payment cancelled. You can try again anytime.',
          'error',
        );
        setReview(null);
        return;
      }
      if (cfResult.status === 'failed') {
        await clearCashfreePending();
        showSuccessToast(
          cfResult.message || 'Cashfree payment failed',
          'error',
        );
        setReview(null);
        return;
      }

      const harvested = harvestCashfreeGateway(
        cfResult.raw || cfResult,
        parsed.purchaseId,
      );
      const cfOrderId =
        harvested.gateway_order_id ||
        String(cfSession.orderId || parsed.gatewayOrderId || '');
      let cfGatewayPaymentId =
        harvested.gateway_payment_id ||
        String(cfResult.gatewayPaymentId || '');
      if (!/^\d{8,}$/.test(cfGatewayPaymentId)) {
        cfGatewayPaymentId = await resolveCashfreeCfPaymentId({
          orderId: cfOrderId,
          appId: cfSession.appId,
          appSecret: cfSession.appSecret,
          hintPaymentId: cfResult.gatewayPaymentId,
          environment: cfSession.environment,
        });
      }

      let verifyBody = buildDietVerifyPayload(parsed, {
        gateway_order_id: cfOrderId,
        gateway_payment_id: cfGatewayPaymentId,
        cashfree_order_id: cfOrderId,
        cf_payment_id: cfGatewayPaymentId,
      });
      verifyBody = await enrichCashfreeVerifyPayload(verifyBody, []);

      const verify = await verifyCashfreeUntilSettled(
        verifyDietPayment,
        verifyBody,
      );

      if (!isDietPaymentVerified(verify)) {
        showSuccessToast(
          verify?.message || 'Payment verification failed.',
          'error',
        );
        setReview(null);
        return;
      }

      await clearCashfreePending();
      showSuccessToast(verify?.message || 'Payment successful.', 'success');
      await rememberDietPaymentSettled(planId, parsed.purchaseId);
      setSettled(true);
      setReview(null);
      await finish(current.options);
    } catch (err: any) {
      console.log('DIET_PAY_ERROR =>', err);
      showSuccessToast(
        err?.message || 'Unable to complete payment. Please try again.',
        'error',
      );
      setReview(null);
    }
  }, [review, planId, finish]);

  const closeReview = useCallback(() => {
    if (review?.paying) return;
    setReview(null);
  }, [review]);

  const requiresPayment =
    dietPlanNeedsPurchase(plan, status) && !settled;

  return {
    begin,
    busy: Boolean(review),
    requiresPayment,
    review,
    pay,
    closeReview,
  };
};
