
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
  buildIciciVerifyPayload,
  isPayphiNativeLinked,
  isPayphiUserCancelled,
  openPayphiPayment,
  parsePayphiAppInfo,
  parsePayphiPaymentRequest,
  resolveIciciMerchantTxnNo,
} from '../services/PayphiService';
import {
  buildCashfreeVerifyPayload,
  openCashfreePayment,
  resolveCashfreeCheckout,
  resolveCashfreeCfPaymentId,
} from '../services/CashfreeService';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  buildPrepaidOrderPayload,
  getVerifiedOrderResult,
  isPrepaidVerifyAcceptable,
  OrderCartLine,
} from '../utils/orderPayload';
import { formatOrderStockError } from '../utils/productStockUtils';

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
  /** cashfree | razorpay | icici — sent as payment_gateway on POST /order/ */
  gateway?: PaymentGateway;
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

/** Merge top-level + data + nested payment — Razorpay/ICICI fields can live in any of these. */
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

  // Do NOT spread `data.order` over payment fields — nested order often omits
  // amount / payment_id / gateway_order_id and wiped them (ICICI SDK never opened).
  const merged = {
    ...orderResponse,
    ...data,
    ...nestedPayment,
  };

  // Keep order entity available without clobbering payment keys
  if (data.order && typeof data.order === 'object') {
    merged.order = data.order;
  }
  if (data.icici && typeof data.icici === 'object') {
    merged.icici = data.icici;
  }
  if (data.summary && typeof data.summary === 'object') {
    merged.summary = data.summary;
  }

  return merged;
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
 * 2) Open Cashfree / Razorpay / ICICI PayPhi SDK
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
      gateway = 'cashfree',
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

        // POST /order/ — include payment_gateway (e.g. "cashfree")
        const apiGateway = toApiPaymentGateway(gateway);
        const placePayload = buildPrepaidOrderPayload({
          delivery_address_id: address.id,
          cartItems,
          shipping_charges: shippingFee,
          cod_charges: 0,
          shipping_method: shippingMethod,
          prepaid_amount: payableAmount,
          coupon_code,
          payment_gateway: apiGateway,
        });
        delete (placePayload as any).payment_method;
        placePayload.payment_gateway = apiGateway;

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

        // ── ICICI PayPhi — only when user selected ICICI (never on Razorpay) ─
        if (apiGateway === 'icici') {
          const appInfo = parsePayphiAppInfo(paymentData);
          const payRequest = parsePayphiPaymentRequest(paymentData, {
            amount: payableAmount,
            customerName,
            customerEmail:
              customerEmail && customerEmail.includes('@')
                ? customerEmail
                : 'customer@ayurmuni.com',
            customerMobile: contactNumber
              ? contactNumber.slice(-10)
              : undefined,
          });

          console.warn('[PAY] icici product start', {
            payment_id: paymentData?.payment_id,
            gateway_order_id: paymentData?.gateway_order_id,
            amount: paymentData?.amount ?? payableAmount,
            merchantId: appInfo?.merchantId,
            appId: appInfo?.appId,
            merchantTxnNo: payRequest?.merchantTxnNo,
            hasIciciBlock: Boolean(paymentData?.icici),
            nativeLinked: isPayphiNativeLinked(),
            hasAppInfo: Boolean(appInfo),
            hasPayRequest: Boolean(payRequest),
          });

          // Clear loader before native sheet so UI is not stuck if SDK is slow
          setIsPaying(false);

          let nativeOpenFailed: any = null;
          if (isPayphiNativeLinked() && appInfo && payRequest) {
            try {
              const payphiResult = await openPayphiPayment(appInfo, payRequest);
              console.warn('[PAY] icici product native', payphiResult);

              if (
                isPayphiUserCancelled(payphiResult) ||
                payphiResult.status === 'cancelled'
              ) {
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

              const merchantTxnNo = resolveIciciMerchantTxnNo(
                paymentData,
                payphiResult.gatewayOrderId || payRequest.merchantTxnNo,
              );
              if (!paymentData?.payment_id || !merchantTxnNo) {
                showSuccessToast(
                  'ICICI verify failed: missing payment_id or gateway_order_id.',
                  'error',
                );
                return;
              }

              const txnPaymentId =
                String(payphiResult.gatewayPaymentId || '').trim() ||
                merchantTxnNo;

              setIsVerifyingPayment(true);
              // Same 4-key body as docs; signature = txn id (not PayPhi secureHash)
              const verifyBody = buildIciciVerifyPayload({
                paymentId: String(paymentData.payment_id),
                merchantTxnNo,
                gatewayPaymentId: txnPaymentId,
              });
              console.warn('[PAY] icici product verify prep', {
                ...verifyBody,
                sdk_secureHash: payphiResult.gatewaySignature || null,
              });

              let verifyResponse: any;
              try {
                verifyResponse =
                  await _ORDER_SERVICES.verifyOrderPayment(verifyBody);
              } catch (verifyError: any) {
                verifyResponse =
                  verifyError?.response ?? verifyError?.data ?? verifyError;
              }

              // If backend still rejects, retry once with original place-order
              // gateway_order_id when it is a PayPhi-safe id (not Razorpay order_*).
              const verifyMsg = String(
                verifyResponse?.message ||
                  verifyResponse?.data?.message ||
                  '',
              ).toLowerCase();
              const placeOrderTxn = String(
                paymentData?.icici?.merchantTxnNo ||
                  paymentData?.gateway_order_id ||
                  '',
              ).trim();
              if (
                !verifyResponse?.success &&
                verifyMsg.includes('signature') &&
                placeOrderTxn &&
                placeOrderTxn !== merchantTxnNo &&
                !/^order_/i.test(placeOrderTxn)
              ) {
                const retryBody = buildIciciVerifyPayload({
                  paymentId: String(paymentData.payment_id),
                  merchantTxnNo: placeOrderTxn.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
                  gatewayPaymentId: txnPaymentId,
                });
                console.warn('[PAY] icici product verify retry', retryBody);
                try {
                  verifyResponse =
                    await _ORDER_SERVICES.verifyOrderPayment(retryBody);
                } catch (verifyError: any) {
                  verifyResponse =
                    verifyError?.response ?? verifyError?.data ?? verifyError;
                }
              }

              setIsVerifyingPayment(false);
              console.warn('[PAY] icici product verify', verifyResponse);

              if (verifyResponse?.success) {
                finishSuccess(verifyResponse, {
                  gateway_payment_id: txnPaymentId,
                  payment_gateway: 'icici',
                });
                return;
              }
              if (payphiResult.status === 'pending') {
                console.warn('[PAY] icici pending', payphiResult);
                showSuccessToast(
                  payphiResult.message ||
                    'Payment is being processed. Check My Orders shortly.',
                  'success',
                );
                return;
              }
              showSuccessToast(
                verifyResponse?.message || 'Payment verification failed',
                'error',
              );
              return;
            } catch (error: any) {
              nativeOpenFailed = error;
              console.warn('[PAY] icici product native error', {
                code: error?.code,
                message: error?.message,
                error,
              });
            }
          }

          console.warn('[PAY] icici product stop', {
            code: nativeOpenFailed?.code,
            message: nativeOpenFailed?.message,
            native: isPayphiNativeLinked(),
            hasAppInfo: Boolean(appInfo),
            hasPayRequest: Boolean(payRequest),
          });
          if (!isPayphiNativeLinked()) {
            showSuccessToast(
              'ICICI PayPhi SDK is not linked in this build. Rebuild the app after installing react-native-payphi-sdk.',
              'error',
            );
          } else if (!appInfo || !payRequest) {
            showSuccessToast(
              'ICICI payment data incomplete (merchantId / amount / email). Try again or contact support.',
              'error',
            );
          } else if (nativeOpenFailed?.message || nativeOpenFailed?.code) {
            showSuccessToast(
              String(nativeOpenFailed?.message || nativeOpenFailed?.code),
              'error',
            );
          } else {
            showSuccessToast(
              'Unable to open ICICI payment. Please try again.',
              'error',
            );
          }
          return;
        }

        // ── Cashfree ──────────────────────────────────────────────
        if (apiGateway === 'cashfree') {
          let cfSession;
          try {
            cfSession = await resolveCashfreeCheckout(paymentData);
          } catch (sessionError: any) {
            console.warn('ONLINE_CASHFREE_SESSION =>', sessionError);
            showSuccessToast(
              sessionError?.message ||
                'Cashfree session was not created. Backend must return payment_session_id.',
              'error',
            );
            return;
          }

          setIsPaying(false);
          const cfResult = await openCashfreePayment(cfSession);
          console.warn('ONLINE_CASHFREE_RESULT =>', cfResult);

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

          const cfOrderId =
            String(paymentData?.gateway_order_id || '').trim() ||
            cfResult.orderId ||
            cfSession.orderId;
          const djangoPaymentId = String(
            paymentData?.payment_id || cfSession.paymentId || '',
          ).trim();

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
              'Payment received, but Cashfree cf_payment_id is missing. Ensure book-slot/order returns cashfree credentials.',
              'error',
            );
            return;
          }

          setIsVerifyingPayment(true);
          let verifyBody;
          try {
            verifyBody = buildCashfreeVerifyPayload({
              paymentId: djangoPaymentId,
              orderId: cfOrderId,
              gatewayPaymentId: cfGatewayPaymentId,
              gatewaySignature: cfGatewayPaymentId,
            });
          } catch (buildError: any) {
            setIsVerifyingPayment(false);
            showSuccessToast(
              buildError?.message || 'Unable to build Cashfree verify payload.',
              'error',
            );
            return;
          }

          let verifyResponse: any;
          try {
            verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(verifyBody);
          } catch (verifyError: any) {
            verifyResponse =
              verifyError?.response ?? verifyError?.data ?? verifyError;
          }
          setIsVerifyingPayment(false);

          if (verifyResponse?.success || cfResult.status === 'success') {
            finishSuccess(verifyResponse, {
              cashfree_order_id: cfResult.orderId,
              payment_gateway: 'cashfree',
            });
            return;
          }
          showSuccessToast(
            verifyResponse?.message || 'Payment verification failed.',
            'error',
          );
          return;
        }

        // ── Razorpay ──────────────────────────────────────────────
        if (apiGateway !== 'razorpay') {
          showSuccessToast(
            `Unsupported payment gateway: ${apiGateway}`,
            'error',
          );
          return;
        }

        const razorpayKey = pickRazorpayKey(paymentData);
        const razorpayOrderId = pickRazorpayOrderId(paymentData);

        console.log('ONLINE_RAZORPAY_FIELDS =>', {
          selected: apiGateway,
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
