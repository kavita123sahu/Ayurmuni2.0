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
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';

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

  const runPurchase = useCallback(
    async (plan: PackagePlan) => {
      setProcessingId(plan.id);
      try {
        const payer = await getPayerDetails();
        console.log('PACKAGE_PAYER =>', payer);

        const res: any = await purchasePackage({
          package_id: plan.id,
          patient_id: payer.patient?.id ?? null,
        });
        if (!res?.success || !res?.data?.purchase) {
          showSuccessToast(res?.message || 'Could not start purchase', 'error');
          return;
        }

        const purchase: PackagePurchase = res.data.purchase;
        const razorpayKey: string = res.data.razorpay_key;
        const checkout: PackageCheckout = res.data.checkout;
        console.log('PACKAGE_PURCHASE_ID =>', purchase.id, '| status =>', purchase.status);
        console.log('PACKAGE_CHECKOUT =>', checkout);
        console.log('PACKAGE_RAZORPAY_KEY =>', razorpayKey ? `${razorpayKey.slice(0, 8)}â€¦` : '');

        const checkoutBase = {
          key: razorpayKey,
          ...payer.prefill,
          description: plan.name,
          themeColor: Colors.primaryColor,
        };

        let result: any;
        try {
          result =
            checkout?.type === 'subscription'
              ? await openRazorpaySubscription({
                  ...checkoutBase,
                  subscription_id: String(checkout.razorpay_subscription_id || ''),
                })
              : await openRazorpayPayment({
                  ...checkoutBase,
                  order_id: String(checkout?.razorpay_order_id || ''),
                  amount: toRazorpayPaise(purchase.paid_price, Number(purchase.paid_price)),
                });
          console.log('PACKAGE_RAZORPAY_RESULT =>', result);
        } catch (error: any) {
          console.log('PACKAGE_RAZORPAY_ERROR =>', error);
          showSuccessToast(
            isRazorpayUserCancelled(error)
              ? 'Payment cancelled. You can try again anytime.'
              : error?.description || error?.message || 'Payment failed. Please try again.',
            'error',
          );
          return;
        }

        const verify: any = await verifyPackagePayment({
          purchase_id: purchase.id,
          razorpay_order_id: String(
            result?.razorpay_order_id || checkout?.razorpay_order_id || '',
          ),
          razorpay_payment_id: String(result?.razorpay_payment_id || ''),
          razorpay_signature: String(result?.razorpay_signature || ''),
        });

        if (!verify?.success) {
          showSuccessToast(verify?.message || 'Payment verification failed', 'error');
          return;
        }

        invalidateActivePlans();
        showSuccessToast(verify?.message || 'Care plan activated', 'success');
        navigation.navigate('MyPlansScreen', { highlightId: purchase.id });
      } catch (error: any) {
        console.log('PACKAGE_PURCHASE_ERROR =>', error);
        showSuccessToast(error?.message || 'Something went wrong. Please try again.', 'error');
      } finally {
        setProcessingId(null);
      }
    },
    [navigation],
  );

  const startPlan = useCallback(
    async (plan: PackagePlan) => {
      if (processingId) return;
      console.log('PACKAGE_START =>', plan.id, plan.name, plan.button_action);

      if (plan.button_action === 'book_consultation' || !plan.can_be_purchased) {
        navigation.navigate('AllDoctors');
        return;
      }

      if (!(await requireAuth('Please login to buy a care plan'))) return;

      // Existing active plan â†’ confirm credit transfer before calling the purchase API
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
        console.log('PACKAGE_TRANSFER_PROMPT =>', plan.id, '| same =>', !!same);
        return;
      }

      runPurchase(plan);
    },
    [navigation, processingId, runPurchase],
  );

  const confirmTransfer = useCallback(() => {
    const plan = transferPrompt?.plan;
    setTransferPrompt(null);
    if (plan) runPurchase(plan);
  }, [transferPrompt, runPurchase]);

  const cancelTransfer = useCallback(() => setTransferPrompt(null), []);

  return { startPlan, processingId, transferPrompt, confirmTransfer, cancelTransfer };
};
