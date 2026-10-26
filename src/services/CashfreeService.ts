import { NativeModules, Platform } from 'react-native';
import {
  CASHFREE_ALLOWED_PAYMENT_METHODS,
  getCashfreeCredentials,
} from '../config/cashfreeConfig';
import { Colors } from '../common/Colors';

export type CashfreeCheckoutSession = {
  paymentSessionId: string;
  orderId: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  paymentId?: string;
};

export type CashfreePaymentResult = {
  status: 'success' | 'failed' | 'cancelled';
  orderId: string;
  /** Cashfree `cf_payment_id` when available */
  gatewayPaymentId: string;
  /** Non-empty stand-in for verify API (Cashfree has no Razorpay signature) */
  gatewaySignature: string;
  message: string;
  raw?: any;
};

const str = (value: unknown): string => {
  if (value == null) return '';
  return String(value).trim();
};

const logCf = (step: string, data?: Record<string, unknown>) => {
  console.warn('[CASHFREE]', step, data ?? '');
};

export const isCashfreeNativeLinked = (): boolean => {
  const mods = NativeModules as Record<string, unknown>;
  return Boolean(
    mods?.CashfreePgApi ||
      mods?.RNCashfreePgApi ||
      mods?.CashfreePaymentGateway,
  );
};

/** Pull session fields from book-slot / place-order `data` (Django Create Order). */
export const parseCashfreeCheckout = (
  data: any,
): CashfreeCheckoutSession | null => {
  const nested =
    (data?.cashfree && typeof data.cashfree === 'object' && data.cashfree) ||
    (data?.checkout && typeof data.checkout === 'object' && data.checkout) ||
    {};

  const paymentSessionId = str(
    nested.payment_session_id ??
      nested.paymentSessionId ??
      data?.payment_session_id ??
      data?.paymentSessionId ??
      data?.cf_payment_session_id,
  );
  const orderId = str(
    nested.order_id ??
      nested.cf_order_id ??
      nested.cashfree_order_id ??
      data?.cashfree_order_id ??
      data?.cf_order_id ??
      data?.gateway_order_id ??
      data?.order_id,
  );

  if (!paymentSessionId || !orderId) return null;

  const creds = getCashfreeCredentials();
  return {
    paymentSessionId,
    orderId,
    environment: creds.environment,
    paymentId: str(data?.payment_id) || undefined,
  };
};

/**
 * Require backend `payment_session_id`. Client never Create-Orders (secret on Django).
 */
export const resolveCashfreeCheckout = async (
  paymentData: any,
  _fallback?: {
    amount: number;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
  },
): Promise<CashfreeCheckoutSession> => {
  const fromApi = parseCashfreeCheckout(paymentData);
  if (fromApi) {
    logCf('using backend payment_session_id', {
      orderId: fromApi.orderId,
      paymentId: fromApi.paymentId,
    });
    return fromApi;
  }

  throw new Error(
    'Cashfree payment_session_id missing from server. Backend must create the Cashfree order.',
  );
};

/**
 * Client no longer calls Cashfree Get Payments (needs secret).
 * Django verify should resolve cf_payment_id; SDK onVerify may only return order_id.
 */
export const fetchCashfreePaymentRefs = async (
  orderId: string,
): Promise<{ gatewayPaymentId: string; gatewaySignature: string }> => {
  const id = str(orderId);
  return { gatewayPaymentId: '', gatewaySignature: id };
};

/**
 * Open Cashfree hosted Web Checkout.
 * - doWebPayment(session) — NOT makePayment
 * - Hosted UI: Card, NB, Wallet, EMI, Pay Later + UPI Intent/QR
 * - Optional mode 'upi_intent' → CFUPIIntentCheckoutPayment
 */
export const openCashfreePayment = (
  session: CashfreeCheckoutSession,
  opts?: { mode?: 'web' | 'upi_intent' },
): Promise<CashfreePaymentResult> => {
  const { CFPaymentGatewayService } = require('react-native-cashfree-pg-sdk');
  const {
    CFSession,
    CFEnvironment,
    CFThemeBuilder,
    CFUPIIntentCheckoutPayment,
  } = require('cashfree-pg-api-contract');

  const creds = getCashfreeCredentials();
  const env =
    session.environment === 'PRODUCTION' || creds.environment === 'PRODUCTION'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;

  const mode = opts?.mode || 'web';

  logCf('openCheckout', {
    orderId: session.orderId,
    env: session.environment,
    mode,
    platform: Platform.OS,
    sessionPrefix: session.paymentSessionId.slice(0, 12),
    payment_methods: CASHFREE_ALLOWED_PAYMENT_METHODS,
  });

  return new Promise(resolve => {
    let settled = false;
    const finish = async (
      result: Omit<
        CashfreePaymentResult,
        'gatewayPaymentId' | 'gatewaySignature'
      > & {
        gatewayPaymentId?: string;
        gatewaySignature?: string;
      },
    ) => {
      if (settled) return;
      settled = true;
      try {
        CFPaymentGatewayService.removeCallback?.();
      } catch {
        // ignore
      }

      let gatewayPaymentId = str(result.gatewayPaymentId);
      let gatewaySignature = str(result.gatewaySignature);

      if (result.status === 'success') {
        const refs = await fetchCashfreePaymentRefs(result.orderId);
        gatewayPaymentId =
          refs.gatewayPaymentId || gatewayPaymentId || result.orderId;
        gatewaySignature =
          refs.gatewaySignature ||
          gatewaySignature ||
          session.paymentSessionId ||
          result.orderId;
      }

      const finalResult: CashfreePaymentResult = {
        status: result.status,
        orderId: result.orderId,
        gatewayPaymentId,
        gatewaySignature,
        message: result.message,
        raw: result.raw,
      };
      logCf('checkout finished', finalResult as any);
      resolve(finalResult);
    };

    CFPaymentGatewayService.setCallback({
      onVerify(orderID: string) {
        void finish({
          status: 'success',
          orderId: str(orderID) || session.orderId,
          message: 'Payment successful',
        });
      },
      onError(error: any, orderID: string) {
        const message = str(
          error?.message ??
            error?.getMessage?.() ??
            error?.status ??
            error?.code ??
            error,
        );
        const lower = message.toLowerCase();
        const cancelled =
          lower.includes('cancel') ||
          lower.includes('user_dropped') ||
          lower.includes('user dropped') ||
          str(error?.status).toLowerCase() === 'cancelled';

        void finish({
          status: cancelled ? 'cancelled' : 'failed',
          orderId: str(orderID) || session.orderId,
          gatewayPaymentId: '',
          gatewaySignature: '',
          message:
            message || (cancelled ? 'Payment cancelled' : 'Payment failed'),
          raw: error,
        });
      },
    });

    try {
      if (!session.paymentSessionId || !session.orderId) {
        throw new Error(
          'Cashfree session missing payment_session_id or order_id',
        );
      }

      const cfSession = new CFSession(
        session.paymentSessionId,
        session.orderId,
        env,
      );

      if (mode === 'upi_intent') {
        const theme = new CFThemeBuilder()
          .setNavigationBarBackgroundColor(Colors.primaryColor || '#0D614E')
          .setNavigationBarTextColor('#FFFFFF')
          .setButtonBackgroundColor(Colors.primaryColor || '#0D614E')
          .setButtonTextColor('#FFFFFF')
          .setPrimaryTextColor('#212121')
          .setSecondaryTextColor('#757575')
          .build();
        const upiPayment = new CFUPIIntentCheckoutPayment(cfSession, theme);
        CFPaymentGatewayService.doUPIPayment(upiPayment);
        return;
      }

      CFPaymentGatewayService.doWebPayment(cfSession);
    } catch (error: any) {
      void finish({
        status: 'failed',
        orderId: session.orderId,
        gatewayPaymentId: '',
        gatewaySignature: '',
        message: str(error?.message) || 'Unable to open Cashfree checkout',
        raw: error,
      });
    }
  });
};

/** Consult verify-payment body — Django verifies via Cashfree APIs. */
export const buildCashfreeVerifyPayload = (args: {
  paymentId: string;
  orderId: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
}): {
  payment_id: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  gateway_signature: string;
  payment_gateway: 'cashfree';
} => {
  const orderId = str(args.orderId);
  const gatewayPaymentId = str(args.gatewayPaymentId) || orderId;
  const gatewaySignature =
    str(args.gatewaySignature) || gatewayPaymentId || orderId;

  return {
    payment_id: str(args.paymentId),
    gateway_order_id: orderId,
    gateway_payment_id: gatewayPaymentId,
    gateway_signature: gatewaySignature,
    payment_gateway: 'cashfree',
  };
};
