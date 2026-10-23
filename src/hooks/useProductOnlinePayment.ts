
// /**
//  * Online flow:
//  * 1) Place prepaid order (API)
//  * 2) Clear placing loader, then open Razorpay SDK quickly
//  * 3) Verify payment
//  */
// export const useProductOnlinePayment = () => {
//   const [isPaying, setIsPaying] = useState(false);
//   const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
//   const paymentStartedRef = useRef(false);

//         const contactNumber = String(
//           customerInfo?.phone_number ??
//           address?.phone_number ??
//           address?.phone ??
//           '',
//         ).replace(/\D/g, '');
//         const customerName =
//           customerInfo?.first_name ??
//           customerInfo?.full_name ??
//           address?.name ??
//           'AyurMuni Customer';

//         // Stop button/loader BEFORE opening SDK — otherwise UI stays stuck
//         // on loading if the native sheet is slow or fails to present.
//         setIsPaying(false);

import { useCallback, useRef, useState } from 'react';
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';
import {
  toApiPaymentGateway,
  type PaymentGateway,
} from '../config/paymentGateways';
import {
  isRazorpayUserCancelled,
  openRazorpayPayment,
  pickRazorpayKey,
  toRazorpayPaise,
} from '../services/RazorpayService';
import {
  getGatewayOrderId,
  parsePineLabsCheckout,
  resolveOrderGateway,
  type PineLabsCheckout,
} from '../services/PineLabsService';
import {
  buildIciciVerifyPayload,
  isPayphiNativeLinked,
  isPayphiUserCancelled,
  openPayphiPayment,
  parsePayphiAppInfo,
  parsePayphiHostedCheckout,
  parsePayphiPaymentRequest,
  resolveIciciMerchantTxnNo,
} from '../services/PayphiService';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  buildPrepaidOrderPayload,
  getVerifiedOrderResult,
  isPrepaidVerifyAcceptable,
  OrderCartLine,
} from '../utils/orderPayload';
import { formatOrderStockError } from '../utils/productStockUtils';
import type {
  PineLabsCheckoutOutcome,
  PineLabsPageResult,
} from '../components/payment/PineLabsCheckoutModal';

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
  shippingMethod?: 'STD' | 'EXPRESS';
  coupon_code?: string;
  /** Local UI discount only — not sent on place-order */
  couponDiscount?: number;
  prepaidAmount?: number;
  /** pinelabs | razorpay | icici — sent as payment_gateway on place-order */
  gateway?: PaymentGateway;
  /** Opens Pine Labs WebView; required when gateway is pinelabs. */
  openPineLabsCheckout?: (
    checkout: PineLabsCheckout,
  ) => Promise<{ outcome: PineLabsCheckoutOutcome; pageResult?: PineLabsPageResult }>;
  onCouponRejected?: () => void;
  onSuccess: (
    orderResult: any,
    orderedCartItems: Array<{
      variant_id: string;
      quantity: number;
      source?: 'cart' | 'prescribed';
    }>,
  ) => void;
};

/** Merge top-level + data + nested payment — Razorpay fields can live in any of these. */
const pickPaymentData = (orderResponse: any) => {
  if (!orderResponse || typeof orderResponse !== 'object') return null;

  const data =
    orderResponse.data && typeof orderResponse.data === 'object'
      ? orderResponse.data
      : {};
  const nestedPayment =
    (data.payment && typeof data.payment === 'object' && data.payment) ||
    (orderResponse.payment &&
      typeof orderResponse.payment === 'object' &&
      orderResponse.payment) ||
    (data.order?.payment &&
      typeof data.order.payment === 'object' &&
      data.order.payment) ||
    {};

  return {
    ...orderResponse,
    ...data,
    ...(data.order && typeof data.order === 'object' ? data.order : {}),
    ...nestedPayment,
  };
};

const pickRazorpayOrderId = (paymentData: any): string => {
  // Never fall back to app `order_id` (UUID) — Razorpay needs order_xxxxx
  const candidates = [
    paymentData?.razorpay_order_id,
    paymentData?.razorpayOrderId,
    paymentData?.rzp_order_id,
    paymentData?.gateway_order_id,
    paymentData?.checkout?.razorpay_order_id,
    paymentData?.checkout?.order_id,
  ];
  for (const value of candidates) {
    const id = String(value ?? '').trim();
    if (id) return id;
  }
  return '';
};

/**
 * Online flow:
 * 1) Place prepaid order with selected payment_gateway
 * 2) Open Pine Labs WebView / Razorpay / ICICI PayPhi SDK
 * 3) Verify payment
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
      shippingMethod = 'STD',
      coupon_code,
      couponDiscount,
      prepaidAmount,
      gateway = 'razorpay',
      openPineLabsCheckout,
      onCouponRejected,
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
      const payableAmount = Math.round(
        prepaidAmount ??
          Math.max(0, subtotal + (Number(shippingFee) || 0) - (Number(couponDiscount) || 0)),
      );

      try {
        setIsPaying(true);
        paymentStartedRef.current = true;

        // Online place-order: do NOT send payment_method (Razorpay chooses later)
        // Match Postman: coupon_code optional only — no coupon_discount field
        const placePayload = buildPrepaidOrderPayload({
          delivery_address_id: address.id,
          cartItems,
          shipping_charges: shippingFee,
          cod_charges: 0,
          shipping_method: shippingMethod,
          prepaid_amount: payableAmount,
          coupon_code,
        });
        delete (placePayload as any).payment_method;
        const apiGateway = toApiPaymentGateway(gateway);
        (placePayload as any).payment_gateway = apiGateway;

        console.log(
          'ONLINE_ORDER_PAYLOAD =>',
          JSON.stringify(placePayload, null, 2),
        );

        let orderResponse = await _ORDER_SERVICES.place_order_API(
          placePayload,
        );
        console.log('ONLINE_ORDER_RESPONSE =>', orderResponse);
        console.log('ONLINE_ORDER_RESPONSE_DATA =>', orderResponse?.data);

        if (!orderResponse?.success) {
          const failMsg = String(
            orderResponse?.message ||
              orderResponse?.data?.message ||
              orderResponse?.data?.detail ||
              'Order failed',
          );
          const lower = failMsg.toLowerCase();
          const productMissing =
            lower.includes('product not found') ||
            lower.includes('product_not_found') ||
            orderResponse?.status === 404;

          // Coupon often causes "Product not found" when it doesn't match cart products
          if (coupon_code && (productMissing || lower.includes('coupon') || lower.includes('matching product') || lower.includes('does not apply'))) {
            console.warn('[PAY] place-order failed with coupon — retry without coupon', {
              coupon_code,
              message: failMsg,
              data: orderResponse?.data,
            });
            onCouponRejected?.();
            delete (placePayload as any).coupon_code;
            orderResponse = await _ORDER_SERVICES.place_order_API(placePayload);
            console.log('ONLINE_ORDER_RETRY_NO_COUPON =>', orderResponse);
            if (!orderResponse?.success) {
              const retryMsg = String(
                orderResponse?.message ||
                  orderResponse?.data?.message ||
                  failMsg,
              );
              showSuccessToast(retryMsg, 'error');
              return;
            }
            // success on retry — continue with payment below
          } else {
            showSuccessToast(
              formatOrderStockError(failMsg) || failMsg,
              'error',
            );
            return;
          }
        }

        const paymentData = pickPaymentData(orderResponse);
        const orderGateway = resolveOrderGateway(paymentData, apiGateway);

        const contactNumber = String(
          customerInfo?.phone_number ??
            customerInfo?.mobile ??
            address?.phone_number ??
            address?.phone ??
            '',
        ).replace(/\D/g, '');
        const customerName = String(
          customerInfo?.first_name ??
            customerInfo?.full_name ??
            address?.full_name ??
            address?.name ??
            'AyurMuni Customer',
        );
        const customerEmail = String(
          customerInfo?.email ?? address?.email ?? 'customer@ayurmuni.com',
        );

        const finishSuccess = (verifyResponse: any, extra: Record<string, any> = {}) => {
          showSuccessToast('Payment Successful', 'success');
          onSuccess(
            getVerifiedOrderResult(verifyResponse) ?? {
              ...paymentData,
              ...extra,
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
        };

        // ── Pine Labs (WebView) — only when user selected it ─────
        if (apiGateway === 'pinelabs') {
          if (!openPineLabsCheckout) {
            showSuccessToast(
              'Pine Labs checkout is not available on this screen.',
              'error',
            );
            return;
          }
          const checkout = parsePineLabsCheckout(paymentData);
          if (!checkout.redirectUrl || !checkout.orderId || !checkout.paymentId) {
            showSuccessToast(
              'Pine Labs checkout is not available right now',
              'error',
            );
            return;
          }
          setIsPaying(false);
          const { outcome, pageResult } = await openPineLabsCheckout(checkout);
          setIsVerifyingPayment(true);
          let verifyResponse: any = null;
          try {
            verifyResponse = await _ORDER_SERVICES.verifyOrderPayment({
              payment_id: checkout.paymentId,
              gateway_order_id: checkout.orderId,
              payment_gateway: 'pinelabs',
              outcome,
            });
          } catch (verifyError: any) {
            verifyResponse =
              verifyError?.response ?? verifyError?.data ?? verifyError;
          }
          setIsVerifyingPayment(false);
          if (verifyResponse?.success) {
            finishSuccess(verifyResponse);
            return;
          }
          if (outcome === 'closed' || pageResult?.status === 'failed') {
            showSuccessToast(
              outcome === 'closed'
                ? 'Payment cancelled. You can try again anytime.'
                : 'Payment failed at Pine Labs. Please try again.',
              'error',
            );
            return;
          }
          showSuccessToast(
            verifyResponse?.message || 'Payment verification failed.',
            'error',
          );
          return;
        }

        // ── ICICI PayPhi — only when user selected ICICI (never on Razorpay) ─
        if (apiGateway === 'icici') {
          const appInfo = parsePayphiAppInfo(paymentData);
          const payRequest = parsePayphiPaymentRequest(paymentData, {
            amount: payableAmount,
            customerName,
            customerEmail,
            customerMobile: contactNumber
              ? contactNumber.slice(-10)
              : undefined,
          });
          const hosted = parsePayphiHostedCheckout(paymentData);

          console.warn('[PAY] icici product start', {
            payment_id: paymentData?.payment_id,
            merchantId: appInfo?.merchantId,
            hosted: Boolean(hosted?.redirectUrl),
            native: Boolean(isPayphiNativeLinked() && appInfo && payRequest),
          });

          if (hosted?.redirectUrl && openPineLabsCheckout) {
            setIsPaying(false);
            const { outcome } = await openPineLabsCheckout({
              paymentId: hosted.paymentId,
              orderId: hosted.orderId,
              redirectUrl: hosted.redirectUrl,
              returnUrl: hosted.returnUrl,
            });
            console.warn('[PAY] icici product hosted', { outcome });
            setIsVerifyingPayment(true);
            let verifyResponse: any;
            try {
              verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(
                buildIciciVerifyPayload({
                  paymentId: hosted.paymentId,
                  merchantTxnNo: resolveIciciMerchantTxnNo(
                    paymentData,
                    hosted.orderId,
                  ),
                }),
              );
            } catch (verifyError: any) {
              verifyResponse =
                verifyError?.response ?? verifyError?.data ?? verifyError;
            }
            setIsVerifyingPayment(false);
            if (verifyResponse?.success) {
              finishSuccess(verifyResponse);
              return;
            }
            if (outcome === 'closed') {
              showSuccessToast(
                'Payment cancelled. You can try again anytime.',
                'error',
              );
              return;
            }
            showSuccessToast(
              verifyResponse?.message || 'Payment verification failed.',
              'error',
            );
            return;
          }

          if (isPayphiNativeLinked() && appInfo && payRequest) {
            let payphiResult;
            try {
              payphiResult = await openPayphiPayment(appInfo, payRequest);
            } catch (error: any) {
              console.warn('[PAY] icici product native error', {
                code: error?.code,
                message: error?.message,
                error,
              });
              setIsPaying(false);
              if (error?.message || error?.code) {
                showSuccessToast(String(error?.message || error?.code), 'error');
              }
              return;
            } finally {
              setIsPaying(false);
            }

            if (isPayphiUserCancelled(payphiResult) || payphiResult.status === 'cancelled') {
              console.warn('[PAY] icici cancelled', payphiResult);
              if (payphiResult?.message) {
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

            setIsVerifyingPayment(true);
            const merchantTxnNo = resolveIciciMerchantTxnNo(
              paymentData,
              payphiResult.gatewayOrderId,
            );
            const verifyBody = buildIciciVerifyPayload({
              paymentId: String(paymentData?.payment_id ?? ''),
              merchantTxnNo,
              gatewayPaymentId: payphiResult.gatewayPaymentId,
              gatewaySignature: payphiResult.gatewaySignature,
            });
            let verifyResponse: any;
            try {
              verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(verifyBody);
            } catch (verifyError: any) {
              verifyResponse =
                verifyError?.response ?? verifyError?.data ?? verifyError;
            }
            setIsVerifyingPayment(false);

            if (verifyResponse?.success || payphiResult.status === 'success') {
              finishSuccess(verifyResponse, {
                gateway_payment_id: payphiResult.gatewayPaymentId,
              });
              return;
            }
            if (payphiResult.status === 'pending') {
              console.warn('[PAY] icici pending', payphiResult);
              if (payphiResult.message) {
                showSuccessToast(payphiResult.message, 'success');
              }
              return;
            }
            console.warn('[PAY] icici verify failed', verifyResponse);
            if (verifyResponse?.message) {
              showSuccessToast(verifyResponse.message, 'error');
            }
            return;
          }

          setIsPaying(false);
          console.warn('[PAY] icici unavailable', {
            native: isPayphiNativeLinked(),
            hasAppInfo: Boolean(appInfo),
            hasPayRequest: Boolean(payRequest),
          });
          return;
        }

        // ── Razorpay ──────────────────────────────────────────────
        const razorpayKey = pickRazorpayKey(paymentData);
        const razorpayOrderId = pickRazorpayOrderId(paymentData);

        console.log('ONLINE_RAZORPAY_FIELDS =>', {
          selected: apiGateway,
          resolved: orderGateway,
          hasKey: Boolean(razorpayKey),
          orderId: razorpayOrderId,
          payment_id: paymentData?.payment_id,
          keys: paymentData ? Object.keys(paymentData) : [],
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
          paymentData?.amount,
          payableAmount,
        );

        let razorpayResult: any;
        try {
          razorpayResult = await openRazorpayPayment({
            key: razorpayKey,
            amount: amountPaise,
            order_id: razorpayOrderId,
            name: customerName,
            email: customerEmail,
            contact: contactNumber
              ? `91${contactNumber.slice(-10)}`
              : '919999999999',
            description: 'Product Order Payment',
            themeColor: Colors.primaryColor,
          });
        } catch (error: any) {
          console.log('ONLINE_RAZORPAY_CATCH =>', error);
          if (isRazorpayUserCancelled(error)) {
            showSuccessToast(
              'Payment cancelled. You can try again anytime.',
              'error',
            );
            return;
          }
          showSuccessToast(
            'Unable to complete payment. Please try again.',
            'error',
          );
          return;
        } finally {
          setIsPaying(false);
        }

        setIsVerifyingPayment(true);

        const gatewayOrderId = razorpayResult?.razorpay_order_id || razorpayOrderId;
        const verifyBody: Record<string, any> = {
          payment_id: paymentData?.payment_id,
          razorpay_order_id: gatewayOrderId,
          razorpay_payment_id: razorpayResult?.razorpay_payment_id,
          razorpay_signature: razorpayResult?.razorpay_signature,
          gateway_order_id: gatewayOrderId,
          gateway_payment_id: razorpayResult?.razorpay_payment_id,
          gateway_signature: razorpayResult?.razorpay_signature,
          payment_gateway: 'razorpay',
        };

        console.log('ONLINE_VERIFY_PAYLOAD =>', verifyBody);

        let verifyResponse: any;
        try {
          verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(verifyBody);
          console.log('ONLINE_VERIFY_RESPONSE =>', verifyResponse);
        } catch (verifyError: any) {
          console.log('ONLINE_VERIFY_ERROR =>', verifyError);
          verifyResponse =
            verifyError?.response ?? verifyError?.data ?? verifyError;
        }

        setIsVerifyingPayment(false);

        if (isPrepaidVerifyAcceptable(verifyResponse, razorpayResult)) {
          finishSuccess(verifyResponse, {
            razorpay_payment_id: razorpayResult?.razorpay_payment_id,
          });
          return;
        }

        showSuccessToast(
          formatOrderStockError(verifyResponse?.message) ||
            verifyResponse?.message ||
            'Payment verification failed. Some items may be out of stock.',
          'error',
        );
      } catch (error: any) {
        console.log('ONLINE_PAYMENT_FATAL =>', error);
        setIsVerifyingPayment(false);
        if (isRazorpayUserCancelled(error)) {
          showSuccessToast(
            'Payment cancelled. You can try again anytime.',
            'error',
          );
          return;
        }
        showSuccessToast(
          'Something went wrong. Please try again.',
          'error',
        );
      } finally {
        setIsPaying(false);
        paymentStartedRef.current = false;
      }
    },
    [isPaying],
  );

  return { isPaying, isVerifyingPayment, payOnline };
};
