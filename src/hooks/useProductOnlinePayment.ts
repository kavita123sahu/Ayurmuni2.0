// import { useCallback, useRef, useState } from 'react';
// import RazorpayCheckout from 'react-native-razorpay';
// import { showSuccessToast } from '../config/Key';
// import { Colors } from '../common/Colors';
// import {
//   openRazorpayPayment,
//   toRazorpayPaise,
// } from '../services/RazorpayService';
// import * as _ORDER_SERVICES from '../services/OrderService';
// import {
//   buildPrepaidOrderPayload,
//   getVerifiedOrderResult,
//   isPrepaidVerifyAcceptable,
//   OrderCartLine,
// } from '../utils/orderPayload';

// type CartLine = OrderCartLine & {
//   variant_id: string | number;
//   quantity: number;
//   price: number;
//   name?: string;
//   discount?: number;
//   source?: 'cart' | 'prescribed';
// };

// type OnlinePaymentArgs = {
//   cartItems: CartLine[];
//   address: any;
//   customerInfo?: any;
//   shippingFee: number;
//   // payment_method?: any;
//   codCharges?: number;
//   onSuccess: (
//     orderResult: any,
//     orderedCartItems: Array<{
//       variant_id: string;
//       quantity: number;
//       source?: 'cart' | 'prescribed';
//     }>,
//   ) => void;
// };

// const pickPaymentData = (orderResponse: any) => {
//   const root = orderResponse?.data ?? orderResponse;
//   if (!root || typeof root !== 'object') return null;
//   // Some APIs nest payment under data.payment / data.order
//   return root.payment && typeof root.payment === 'object'
//     ? { ...root, ...root.payment }
//     : root;
// };

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

//   const payOnline = useCallback(
//     async ({
//       cartItems,
//       address,
//       customerInfo = {},
//       shippingFee,
//       codCharges = 0,
//       onSuccess,
//     }: OnlinePaymentArgs) => {
//       if (isPaying || paymentStartedRef.current) return;

//       if (!address?.id) {
//         showSuccessToast('Please select a delivery address', 'error');
//         return;
//       }
//       if (!cartItems.length) {
//         showSuccessToast('Cart is empty', 'error');
//         return;
//       }
//       if (cartItems.some(item => !(item.cart_item_id ?? item.id))) {
//         showSuccessToast('Cart item id missing. Please refresh cart.', 'error');
//         return;
//       }

//       const subtotal = cartItems.reduce(
//         (sum, item) => sum + Number(item.price) * Number(item.quantity),
//         0,
//       );
//       const payableAmount = Math.round(subtotal + (Number(shippingFee) || 0));

//       try {
//         setIsPaying(true);
//         paymentStartedRef.current = true;

//         const placePayload = buildPrepaidOrderPayload({
//           delivery_address_id: address.id,
//           cartItems,
//           shipping_charges: shippingFee,
//           cod_charges: codCharges,
//           prepaid_amount: payableAmount,
//           // payment_method: 'upi',
//         });

//         const orderResponse = await _ORDER_SERVICES.place_order_API(
//           placePayload,
//         );
//         if (!orderResponse?.success) {
//           showSuccessToast(orderResponse?.message ?? 'Order failed', 'error');
//           return;
//         }

//         const paymentData = pickPaymentData(orderResponse);
//         const razorpayKey = String(
//           paymentData?.razorpay_key ?? paymentData?.key ?? '',
//         ).trim();
//         const razorpayOrderId = String(
//           paymentData?.razorpay_order_id ?? paymentData?.order_id ?? '',
//         ).trim();

//         if (!razorpayKey || !razorpayOrderId) {
//           showSuccessToast(
//             'Payment gateway not ready. Please try again.',
//             'error',
//           );
//           return;
//         }

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

//         const amountPaise = toRazorpayPaise(
//           paymentData?.amount,
//           payableAmount,
//         );

//         // Stop button/loader BEFORE opening SDK — otherwise UI stays stuck
//         // on loading if the native sheet is slow or fails to present.
//         setIsPaying(false);

//         try {
//           const razorpayResult: any = await openRazorpayPayment({
//             key: razorpayKey,
//             amount: amountPaise,
//             order_id: razorpayOrderId,
//             name: customerName,
//             email:
//               customerInfo?.email ?? address?.email ?? 'customer@ayurmuni.com',
//             contact: contactNumber
//               ? `91${contactNumber.slice(-10)}`
//               : '919999999999',
//             description: 'Product Order Payment',
//             themeColor: Colors.primaryColor,
//           });

//           setIsVerifyingPayment(true);

//           const verifyBody: Record<string, any> = {
//             payment_id: paymentData?.payment_id,
//             razorpay_order_id: razorpayOrderId,
//             razorpay_payment_id: razorpayResult?.razorpay_payment_id,
//             razorpay_signature: razorpayResult?.razorpay_signature,
//           };

//           let verifyResponse: any;
//           try {
//             verifyResponse = await _ORDER_SERVICES.verifyOrderPayment(
//               verifyBody,
//             );
//           } catch (verifyError: any) {
//             verifyResponse =
//               verifyError?.response ?? verifyError?.data ?? verifyError;
//           }

//           setIsVerifyingPayment(false);

//           if (isPrepaidVerifyAcceptable(verifyResponse, razorpayResult)) {
//             showSuccessToast('Payment Successful', 'success');
//             onSuccess(
//               getVerifiedOrderResult(verifyResponse) ?? {
//                 ...paymentData,
//                 razorpay_payment_id: razorpayResult?.razorpay_payment_id,
//                 payment_status: 'paid',
//               },
//               cartItems.map((item: any) => ({
//                 id: item.id,
//                 cart_item_id: item.id ?? item.cart_item_id,
//                 variant_id: String(item.variant_id),
//                 quantity: Number(item.quantity),
//                 name: item.name,
//                 image: item.image,
//                 price: item.price,
//                 source: item.source,
//               })),
//             );
//             return;
//           }

//           showSuccessToast(
//             verifyResponse?.message ?? 'Payment verification failed',
//             'error',
//           );
//         } catch (error: any) {
//           setIsVerifyingPayment(false);
//           if (
//             error?.code === RazorpayCheckout.PAYMENT_CANCELLED ||
//             error?.description?.toLowerCase?.().includes('cancel') ||
//             error?.description?.toLowerCase?.().includes('dismiss') ||
//             error?.description?.toLowerCase?.().includes('exit')
//           ) {
//             showSuccessToast('Payment cancelled', 'error');
//             return;
//           }
//           showSuccessToast(
//             error?.description || 'Unable to open payment. Please try again.',
//             'error',
//           );
//         }
//       } catch {
//         setIsVerifyingPayment(false);
//         showSuccessToast('Something went wrong', 'error');
//       } finally {
//         setIsPaying(false);
//         paymentStartedRef.current = false;
//       }
//     },
//     [isPaying],
//   );

//   return { isPaying, isVerifyingPayment, payOnline };
// };



import { useCallback, useRef, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';
import {
  openRazorpayPayment,
  toRazorpayPaise,
} from '../services/RazorpayService';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  buildPrepaidOrderPayload,
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
  codCharges?: number;
  shippingMethod?: 'STD' | 'EXPRESS';
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
  ];
  for (const value of candidates) {
    const id = String(value ?? '').trim();
    if (id) return id;
  }
  return '';
};

/**
 * Online flow:
 * 1) Place prepaid order (API)
 * 2) Clear placing loader, then open Razorpay SDK quickly
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

        // Online place-order: do NOT send payment_method (Razorpay chooses later)
        const placePayload = buildPrepaidOrderPayload({
          delivery_address_id: address.id,
          cartItems,
          shipping_charges: shippingFee,
          cod_charges: 0,
          shipping_method: shippingMethod,
          prepaid_amount: payableAmount,
        });
        delete (placePayload as any).payment_method;

        console.log(
          'ONLINE_ORDER_PAYLOAD =>',
          JSON.stringify(placePayload, null, 2),
        );

        const orderResponse = await _ORDER_SERVICES.place_order_API(
          placePayload,
        );
        console.log('ONLINE_ORDER_RESPONSE =>', orderResponse);

        if (!orderResponse?.success) {
          showSuccessToast(orderResponse?.message ?? 'Order failed', 'error');
          return;
        }

        const paymentData = pickPaymentData(orderResponse);
        const razorpayKey = String(
          paymentData?.razorpay_key ??
            paymentData?.key ??
            paymentData?.key_id ??
            '',
        ).trim();
        const razorpayOrderId = pickRazorpayOrderId(paymentData);

        console.log('ONLINE_RAZORPAY_FIELDS =>', {
          razorpayKey: razorpayKey ? `${razorpayKey.slice(0, 8)}…` : '',
          razorpayOrderId,
          amount: paymentData?.amount,
          payment_id: paymentData?.payment_id,
        });

        if (!razorpayKey || !razorpayOrderId) {
          showSuccessToast(
            'Payment gateway not ready. Please try again.',
            'error',
          );
          return;
        }

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

        const amountPaise = toRazorpayPaise(
          paymentData?.amount,
          payableAmount,
        );

        console.log('ONLINE_OPENING_RAZORPAY =>', {
          amountPaise,
          payableAmount,
          apiAmount: paymentData?.amount,
        });

        // Keep isPaying true so button stays disabled while SDK presents
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
          const desc = String(error?.description ?? error?.message ?? '');
          if (
            error?.code === RazorpayCheckout.PAYMENT_CANCELLED ||
            desc.toLowerCase().includes('cancel') ||
            desc.toLowerCase().includes('dismiss') ||
            desc.toLowerCase().includes('exit')
          ) {
            showSuccessToast('Payment cancelled', 'error');
            return;
          }
          showSuccessToast(
            desc || 'Unable to open payment. Please try again.',
            'error',
          );
          return;
        } finally {
          setIsPaying(false);
        }

        setIsVerifyingPayment(true);

        const verifyBody: Record<string, any> = {
          payment_id: paymentData?.payment_id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayResult?.razorpay_payment_id,
          razorpay_signature: razorpayResult?.razorpay_signature,
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
      } catch (error: any) {
        console.log('ONLINE_PAYMENT_FATAL =>', error);
        setIsVerifyingPayment(false);
        showSuccessToast(
          error?.message || error?.description || 'Something went wrong',
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
