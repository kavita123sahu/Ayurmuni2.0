import { useCallback, useState } from 'react';
import { fetchActivePlans, invalidateActivePlans, isSamePackage } from './useActivePlans';
import {
  MyPlan,
  PackageCheckout,
  PackagePlan,
  PackagePurchase,
  purchasePackage,
  verifyPackagePayment,
} from '../services/PackageServices';
import {
  isRazorpayUserCancelled,
  openRazorpayPayment,
  openRazorpaySubscription,
  toRazorpayPaise,
} from '../services/RazorpayService';
import { getPayerDetails } from '../services/PayerDetails';
import { requireAuth } from '../services/guestAuth';
import { navigationRef } from '../navigation/navigationRef';
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';
import type { PaymentGateway } from '../config/paymentGateways';
import { toApiPaymentGateway } from '../config/paymentGateways';
import {
  openCashfreePayment,
  resolveCashfreeCheckout,
  resolveCashfreeCfPaymentId,
  buildCashfreeVerifyPayload,
} from '../services/CashfreeService';
import {
  openPayphiPayment,
  isPayphiUserCancelled,
  parsePayphiPaymentRequest,
  parsePayphiAppInfo,
  buildIciciVerifyPayload,
  resolveIciciMerchantTxnNo,
} from '../services/PayphiService';

/**
 * Package CTA flow:
 * - open plan (`book_consultation`) â†’ normal consultation booking
 * - prepaid package â†’ purchase â†’ Razorpay (order or subscription) â†’ verify â†’ My Plans
 */
export type PlanTransferPrompt = {
  plan: PackagePlan;
  /** Buying the same package again (credits keep the old validity). */
  samePlan: boolean;
  currentPlan: MyPlan;
};

export const usePackagePurchase = (navigation: any) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [transferPrompt, setTransferPrompt] = useState<PlanTransferPrompt | null>(null);
  const [payPlan, setPayPlan] = useState<PackagePlan | null>(null);

  const runPurchase = useCallback(
    async (plan: PackagePlan, gateway: PaymentGateway = 'razorpay') => {
      setProcessingId(plan.id);
      setPayPlan(null);
      try {
        const payer = await getPayerDetails();
        console.log('PACKAGE_PAYER =>', payer);

        const apiGateway = toApiPaymentGateway(gateway);
        const res: any = await purchasePackage({
          package_id: plan.id,
          patient_id: payer.patient?.id ?? null,
          payment_gateway: apiGateway,
        });
        if (!res?.success || !res?.data?.purchase) {
          showSuccessToast(res?.message || 'Could not start purchase', 'error');
          return;
        }

        const purchase: PackagePurchase = res.data.purchase;
        const razorpayKey: string = res.data.razorpay_key;
        const checkout: PackageCheckout = res.data.checkout;
        const checkoutData =
          checkout && typeof checkout === 'object' ? checkout : {};
        const paymentSource = {
          ...res.data,
          ...checkoutData,
          cashfree: checkoutData.cashfree || res.data.cashfree,
          icici: checkoutData.icici || res.data.icici,
        };
        const gatewayUsed = toApiPaymentGateway(
          checkoutData.payment_gateway ||
            purchase.payment_gateway ||
            res.data.payment_gateway ||
            gateway,
        );

        console.log('PACKAGE_PURCHASE_ID =>', purchase.id, '| gateway =>', gatewayUsed);

        let verifyPayload: any = { purchase_id: purchase.id };
        const djangoPaymentId = String(
          res.data?.payment_id || purchase.id || '',
        );

        try {
          if (gatewayUsed === 'cashfree') {
            const cfSession = await resolveCashfreeCheckout(paymentSource);
            const cfResult = await openCashfreePayment(cfSession);
            if (cfResult.status === 'cancelled') {
              showSuccessToast(
                cfResult.message || 'Payment cancelled. You can try again anytime.',
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
            const cfOrderId = String(cfSession.orderId || '');
            const cfGatewayPaymentId = await resolveCashfreeCfPaymentId({
              orderId: cfOrderId,
              appId: cfSession.appId,
              appSecret: cfSession.appSecret,
              hintPaymentId: cfResult.gatewayPaymentId,
              environment: cfSession.environment,
            });
            verifyPayload = {
              ...verifyPayload,
              ...buildCashfreeVerifyPayload({
                paymentId: djangoPaymentId,
                orderId: cfOrderId,
                gatewayPaymentId: cfGatewayPaymentId,
                gatewaySignature: cfGatewayPaymentId,
              }),
            };
          } else if (gatewayUsed === 'icici') {
            const appInfo = parsePayphiAppInfo(paymentSource);
            const payRequest = parsePayphiPaymentRequest(paymentSource);
            if (!payRequest) {
              showSuccessToast(
                'ICICI payment details missing for this plan. Try Razorpay.',
                'error',
              );
              return;
            }
            const payphiResult = await openPayphiPayment(appInfo, payRequest);
            if (
              isPayphiUserCancelled(payphiResult) ||
              payphiResult.status === 'cancelled'
            ) {
              showSuccessToast(
                payphiResult.message ||
                  'Payment cancelled. You can try again anytime.',
                'error',
              );
              return;
            }
            const merchantTxnNo = resolveIciciMerchantTxnNo(
              paymentSource,
              payphiResult.gatewayOrderId || payphiResult.gatewayPaymentId,
            );
            verifyPayload = {
              ...verifyPayload,
              ...buildIciciVerifyPayload({
                paymentId: djangoPaymentId,
                merchantTxnNo,
                gatewayPaymentId:
                  payphiResult.gatewayPaymentId || payphiResult.gatewayOrderId,
              }),
            };
          } else {
            const checkoutBase = {
              key: razorpayKey,
              ...payer.prefill,
              description: plan.name,
              themeColor: Colors.primaryColor,
            };
            const result =
              checkout?.type === 'subscription'
                ? await openRazorpaySubscription({
                    ...checkoutBase,
                    subscription_id: String(
                      checkout.razorpay_subscription_id || '',
                    ),
                  })
                : await openRazorpayPayment({
                    ...checkoutBase,
                    order_id: String(checkout?.razorpay_order_id || ''),
                    amount: toRazorpayPaise(
                      purchase.paid_price,
                      Number(purchase.paid_price),
                    ),
                  });
            verifyPayload = {
              ...verifyPayload,
              razorpay_order_id: String(
                result?.razorpay_order_id || checkout?.razorpay_order_id || '',
              ),
              razorpay_payment_id: String(result?.razorpay_payment_id || ''),
              razorpay_signature: String(result?.razorpay_signature || ''),
            };
          }
        } catch (error: any) {
          console.log('PACKAGE_PAY_ERROR =>', error);
          const cancelled =
            isRazorpayUserCancelled(error) || isPayphiUserCancelled(error);
          showSuccessToast(
            cancelled
              ? 'Payment cancelled. You can try again anytime.'
              : error?.description ||
                  error?.message ||
                  'Payment failed. Please try again.',
            'error',
          );
          return;
        }

        const verify: any = await verifyPackagePayment(verifyPayload);

        if (!verify?.success) {
          showSuccessToast(verify?.message || 'Payment verification failed', 'error');
          return;
        }

        invalidateActivePlans();
        showSuccessToast(verify?.message || 'Care plan activated', 'success');
        if (navigationRef.isReady()) {
          navigationRef.navigate('HomeStack', {
            screen: 'MyPlansScreen',
            params: { highlightId: purchase.id },
          });
        } else {
          navigation.navigate('MyPlansScreen', { highlightId: purchase.id });
        }
      } catch (error: any) {
        console.log('PACKAGE_PURCHASE_ERROR =>', error);
        showSuccessToast(error?.message || 'Something went wrong. Please try again.', 'error');
      } finally {
        setProcessingId(null);
      }
    },
    [navigation],
  );

  const openGatewayPicker = useCallback((plan: PackagePlan) => {
    setPayPlan(plan);
  }, []);

  const startPlan = useCallback(
    async (plan: PackagePlan) => {
      if (processingId) return;
      console.log('PACKAGE_START =>', plan.id, plan.name, plan.button_action);

      if (plan.button_action === 'book_consultation' || !plan.can_be_purchased) {
        navigation.navigate('AllDoctors');
        return;
      }

      if (!(await requireAuth('Please login to buy a care plan'))) return;

      setProcessingId(plan.id);
      const active = await fetchActivePlans(true);
      setProcessingId(null);
      if (active.length > 0) {
        const same = active.find(p => isSamePackage(p, plan.id));
        setTransferPrompt({
          plan,
          samePlan: !!same,
          currentPlan: same ?? active[0],
        });
        return;
      }

      openGatewayPicker(plan);
    },
    [navigation, processingId, openGatewayPicker],
  );

  const confirmTransfer = useCallback(() => {
    const plan = transferPrompt?.plan;
    setTransferPrompt(null);
    if (plan) openGatewayPicker(plan);
  }, [transferPrompt, openGatewayPicker]);

  const cancelTransfer = useCallback(() => setTransferPrompt(null), []);

  const confirmGatewayPay = useCallback(
    (gateway: PaymentGateway) => {
      if (!payPlan) return;
      runPurchase(payPlan, gateway);
    },
    [payPlan, runPurchase],
  );

  const cancelGatewayPay = useCallback(() => setPayPlan(null), []);

  return {
    startPlan,
    processingId,
    transferPrompt,
    confirmTransfer,
    cancelTransfer,
    payPlan,
    confirmGatewayPay,
    cancelGatewayPay,
  };
};
