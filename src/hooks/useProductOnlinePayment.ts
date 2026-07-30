import { useCallback, useRef, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';
import { openRazorpayPayment } from '../services/RazorpayService';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  buildPrepaidOrderPayload,
  getRazorpayPaymentMethod,
  OrderCartLine,
} from '../utils/orderPayload';

type CartLine = OrderCartLine & {
  variant_id: string | number;
  quantity: number;
  price: number;
  name?: string;
  discount?: number;
  source?: 'cart' | 'prescribed';
};

type OnlinePaymentArgs = {
  cartItems: CartLine[];
  address: any;
  customerInfo?: any;
  shippingFee: number;
  codCharges?: number;
  onSuccess: (
    orderResult: any,
    orderedCartItems: Array<{
      variant_id: string;
      quantity: number;
      source?: 'cart' | 'prescribed';
    }>,
  ) => void;
};

/**
 * Online flow:
 * 1) Place prepaid order WITHOUT payment_method (creates Razorpay order)
 * 2) User selects method in Razorpay (UPI / card / wallet / …)
 * 3) Verify — payment_method = exact value from Razorpay success event
 */
export const useProductOnlinePayment = () => {
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const paymentStartedRef = useRef(false);

  const payOnline = useCallback(
    async ({
      cartItems,
      address,
      customerInfo = {},
      shippingFee,
      codCharges = 0,
      onSuccess,
    }: OnlinePaymentArgs) => {
      if (isPaying || paymentStartedRef.current) return;

      if (!address?.id) {
        showSuccessToast('Please select a delivery address', 'error');
        return;
      }
      if (!cartItems.length) {
        showSuccessToast('Cart is empty', 'error');
        return;
      }
      if (cartItems.some(item => !(item.cart_item_id ?? item.id))) {
        showSuccessToast('Cart item id missing. Please refresh cart.', 'error');
        return;
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );
      const payableAmount = Math.round(subtotal + (Number(shippingFee) || 0));

      try {
        setIsPaying(true);
        paymentStartedRef.current = true;

        // ── 1) Place prepaid — no static payment_method ─────────────────────
        const placePayload = buildPrepaidOrderPayload({
          delivery_address_id: address.id,
          cartItems,
          shipping_charges: shippingFee,
          cod_charges: codCharges,
          prepaid_amount: payableAmount,
          // payment_method intentionally omitted — comes from Razorpay after pay
        });
        console.log(
          'ORDER_PAYLOAD_PREPAID (before Razorpay) =>',
          JSON.stringify(placePayload, null, 2),
        );

        const orderResponse = await _ORDER_SERVICES.place_order_API(
          placePayload,
        );
        if (!orderResponse?.success) {
          showSuccessToast(orderResponse?.message ?? 'Order failed', 'error');
          return;
        }

        const paymentData = orderResponse?.data;
        const contactNumber = String(
          customerInfo?.phone_number ??
            address?.phone_number ??
            address?.phone ??
            '',
        ).replace(/\D/g, '');
        const customerName =
          customerInfo?.first_name ??
          customerInfo?.full_name ??
          address?.name ??
          'AyurMuni Customer';

        // ── 2) Razorpay — user picks method ─────────────────────────────────
        await openRazorpayPayment({
          key: paymentData?.razorpay_key,
          amount: Number(paymentData?.amount ?? payableAmount) * 100,
          order_id: paymentData?.razorpay_order_id,
          name: customerName,
          email: customerInfo?.email ?? address?.email ?? 'customer@ayurmuni.com',
          contact: contactNumber
            ? `91${contactNumber.slice(-10)}`
            : '919999999999',
          description: 'Product Order Payment',
          themeColor: Colors.primaryColor,
        })
          .then(async (razorpayResult: any) => {
            setIsVerifyingPayment(true);

            console.log(
              'RAZORPAY_SUCCESS_EVENT =>',
              JSON.stringify(razorpayResult, null, 2),
            );

            // Exact method user selected in Razorpay UI
            const paymentMethod = getRazorpayPaymentMethod(razorpayResult);

            const verifyBody: Record<string, any> = {
              payment_id: paymentData?.payment_id,
              razorpay_order_id: paymentData?.razorpay_order_id,
              razorpay_payment_id: razorpayResult?.razorpay_payment_id,
              razorpay_signature: razorpayResult?.razorpay_signature,
              payment_type: 'prepaid',
            };

            if (paymentMethod) {
              verifyBody.payment_method = paymentMethod;
            } else {
              console.warn(
                'RAZORPAY_METHOD_MISSING — SDK event had no method field',
                razorpayResult,
              );
            }

            console.log(
              'VERIFY_PAYLOAD =>',
              JSON.stringify(verifyBody, null, 2),
            );

            const verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(
              verifyBody,
            );
            setIsVerifyingPayment(false);

            if (verifyResponse?.success) {
              showSuccessToast('Payment Successful', 'success');
              onSuccess(
                verifyResponse?.data?.order ?? verifyResponse?.data,
                cartItems.map(item => ({
                  variant_id: String(item.variant_id),
                  quantity: Number(item.quantity),
                  source: item.source,
                })),
              );
              return;
            }

            showSuccessToast(
              verifyResponse?.message ?? 'Payment verification failed',
              'error',
            );
          })
          .catch((error: any) => {
            setIsVerifyingPayment(false);
            if (
              error?.code === RazorpayCheckout.PAYMENT_CANCELLED ||
              error?.description?.toLowerCase().includes('cancel') ||
              error?.description?.toLowerCase().includes('dismiss') ||
              error?.description?.toLowerCase().includes('exit')
            ) {
              showSuccessToast('Payment cancelled', 'error');
              return;
            }
            showSuccessToast('Payment Failed', 'error');
          });
      } catch {
        setIsVerifyingPayment(false);
        showSuccessToast('Something went wrong', 'error');
      } finally {
        setIsPaying(false);
        paymentStartedRef.current = false;
      }
    },
    [isPaying],
  );

  return { isPaying, isVerifyingPayment, payOnline };
};
