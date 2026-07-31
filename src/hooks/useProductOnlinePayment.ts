import { useCallback, useRef, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';
import { openRazorpayPayment } from '../services/RazorpayService';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  buildPrepaidOrderPayload,
  getRazorpayPaymentMethod,
  getVerifiedOrderResult,
  isPrepaidVerifyAcceptable,
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
  payment_method?: any;
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
 * 1) Place prepaid with payment_method: "upi" (API expects this for online)
 * 2) User pays in Razorpay
 * 3) Verify — prefer Razorpay method, fallback "upi"
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

        // ── 1) Place prepaid — online sends payment_method: "upi" ────────────
        const placePayload = buildPrepaidOrderPayload({
          delivery_address_id: address.id,
          cartItems,
          shipping_charges: shippingFee,
          cod_charges: codCharges,
          prepaid_amount: payableAmount,
          payment_method: 'upi',
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

            // Prefer Razorpay method; online default is upi
            const paymentMethod =
              getRazorpayPaymentMethod(razorpayResult) || 'upi';

            const verifyBody: Record<string, any> = {
              payment_id: paymentData?.payment_id,
              razorpay_order_id: paymentData?.razorpay_order_id,
              razorpay_payment_id: razorpayResult?.razorpay_payment_id,
              razorpay_signature: razorpayResult?.razorpay_signature,
              payment_type: 'prepaid',
              payment_method: paymentMethod,
            };

            console.log(
              'VERIFY_PAYLOAD =>',
              JSON.stringify(verifyBody, null, 2),
            );

            let verifyResponse: any;
            try {
              verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(
                verifyBody,
              );
            } catch (verifyError: any) {
              // Some APIs throw on Unicommerce/sync 4xx but still create the order
              verifyResponse =
                verifyError?.response ??
                verifyError?.data ??
                verifyError;
            }
            console.log('verifyResponse', verifyResponse);

            setIsVerifyingPayment(false);

            // Razorpay already charged — confirm even on Unicommerce/sync verify noise
            if (isPrepaidVerifyAcceptable(verifyResponse, razorpayResult)) {
              showSuccessToast('Payment Successful', 'success');
              onSuccess(
                getVerifiedOrderResult(verifyResponse) ?? {
                  ...paymentData,
                  razorpay_payment_id: razorpayResult?.razorpay_payment_id,
                  payment_status: 'paid',
                },
                cartItems.map((item: any) => ({
                  id: item.id,
                  cart_item_id: item.id ?? item.cart_item_id,
                  variant_id: String(item.variant_id),
                  quantity: Number(item.quantity),
                  name: item.name,
                  image: item.image,
                  price: item.price,
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
