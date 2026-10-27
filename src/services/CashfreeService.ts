import { NativeModules, Platform } from 'react-native';
import {
  CASHFREE_ALLOWED_PAYMENT_METHODS,
  CASHFREE_APP_ID,
  CASHFREE_ENVIRONMENT,
  getCashfreeCredentials,
} from '../config/cashfreeConfig';
import { Colors } from '../common/Colors';

export type CashfreeCheckoutSession = {
  paymentSessionId: string;
  orderId: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  paymentId?: string;
  /** Optional — only if book-slot returns them (never hardcode secret in app). */
  appId?: string;
  appSecret?: string;
};

export type CashfreePaymentResult = {
  status: 'success' | 'failed' | 'cancelled';
  orderId: string;
  /** Cashfree numeric cf_payment_id */
  gatewayPaymentId: string;
  gatewaySignature: string;
  paymentSessionId: string;
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

/** Cashfree cf_payment_id is a long numeric id (never session_…). */
export const isCashfreePaymentId = (value: unknown): boolean =>
  /^\d{8,}$/.test(str(value));

const pickCfPaymentId = (source: any): string => {
  if (!source) return '';
  if (isCashfreePaymentId(source)) return str(source);

  const candidates = [
    source?.cf_payment_id,
    source?.cfPaymentId,
    source?.gateway_payment_id,
    source?.payment_id,
    source?.paymentId,
    source?.data?.cf_payment_id,
    source?.data?.gateway_payment_id,
    source?.data?.payment?.cf_payment_id,
    source?.payment?.cf_payment_id,
    source?.cashfree?.cf_payment_id,
  ];
  for (const c of candidates) {
    if (isCashfreePaymentId(c)) return str(c);
  }

  const lists = [
    source,
    source?.data,
    source?.payments,
    source?.data?.payments,
    source?.results,
  ];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    const paid =
      list.find((p: any) =>
        ['SUCCESS', 'PAID', 'success', 'paid'].includes(
          String(p?.payment_status ?? p?.status ?? '').toUpperCase(),
        ),
      ) || list[0];
    const id = pickCfPaymentId(paid);
    if (id) return id;
  }

  if (typeof source === 'object') {
    for (const value of Object.values(source)) {
      if (isCashfreePaymentId(value)) return str(value);
      if (value && typeof value === 'object') {
        const nested = pickCfPaymentId(value);
        if (nested) return nested;
      }
    }
  }
  return '';
};

const pickCfPaymentIdFromMeta = (meta: any): string => {
  if (!meta) return '';
  if (typeof meta?.get === 'function') {
    for (const key of [
      'cf_payment_id',
      'cfPaymentId',
      'payment_id',
      'paymentId',
      'transaction_id',
      'txn_id',
    ]) {
      const v = meta.get(key);
      if (isCashfreePaymentId(v)) return str(v);
    }
    try {
      return pickCfPaymentId(Object.fromEntries(meta.entries?.() ?? []));
    } catch {
      return '';
    }
  }
  return pickCfPaymentId(meta);
};

const pickCashfreeSecretFromBookSlot = (data: any): {
  appId: string;
  appSecret: string;
} => {
  const nested =
    (data?.cashfree && typeof data.cashfree === 'object' && data.cashfree) ||
    {};
  return {
    appId: str(
      nested.app_id ??
        nested.client_id ??
        nested.x_client_id ??
        data?.cashfree_app_id ??
        data?.x_client_id ??
        CASHFREE_APP_ID,
    ),
    appSecret: str(
      nested.app_secret ??
        nested.client_secret ??
        nested.x_client_secret ??
        data?.cashfree_app_secret ??
        data?.x_client_secret,
    ),
  };
};

export const isCashfreeNativeLinked = (): boolean => {
  const mods = NativeModules as Record<string, unknown>;
  return Boolean(
    mods?.CashfreePgApi ||
      mods?.RNCashfreePgApi ||
      mods?.CashfreePaymentGateway,
  );
};

/** Session from book-slot only (payment_session_id + gateway_order_id). */
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
    data?.gateway_order_id ??
      nested.order_id ??
      nested.cf_order_id ??
      nested.cashfree_order_id ??
      data?.cashfree_order_id ??
      data?.cf_order_id ??
      data?.order_id,
  );

  if (!paymentSessionId || !orderId) return null;

  const creds = pickCashfreeSecretFromBookSlot(data);
  return {
    paymentSessionId,
    orderId,
    environment: getCashfreeCredentials().environment,
    paymentId: str(data?.payment_id) || undefined,
    appId: creds.appId || undefined,
    appSecret: creds.appSecret || undefined,
  };
};

export const resolveCashfreeCheckout = async (
  paymentData: any,
): Promise<CashfreeCheckoutSession> => {
  const fromApi = parseCashfreeCheckout(paymentData);
  if (fromApi) {
    logCf('using book-slot session', {
      orderId: fromApi.orderId,
      paymentId: fromApi.paymentId,
      hasAppSecret: Boolean(fromApi.appSecret),
    });
    return fromApi;
  }

  throw new Error(
    'Cashfree payment_session_id missing from book-slot. Backend must return payment_session_id + gateway_order_id.',
  );
};

/**
 * Cashfree Get Payments (not a Django API).
 * Needs app id + secret — prefer values returned on book-slot, never commit secret.
 */
export const fetchCashfreeCfPaymentId = async (args: {
  orderId: string;
  appId?: string;
  appSecret?: string;
}): Promise<string> => {
  const cfg = getCashfreeCredentials();
  const orderId = str(args.orderId);
  const appId = str(args.appId) || cfg.appId || CASHFREE_APP_ID;
  // Prefer book-slot secret, else local cashfree.local.ts (same as earlier working flow)
  const appSecret = str(args.appSecret) || cfg.appSecret;
  if (!orderId || !appId || !appSecret) {
    logCf('skip Get Payments — missing orderId/appId/appSecret', {
      hasOrderId: Boolean(orderId),
      hasAppId: Boolean(appId),
      hasAppSecret: Boolean(appSecret),
    });
    return '';
  }

  const base =
    CASHFREE_ENVIRONMENT === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 900));
    }
    try {
      const response = await fetch(
        `${base}/orders/${encodeURIComponent(orderId)}/payments`,
        {
          method: 'GET',
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': appSecret,
          },
        },
      );
      const json: any = await response.json().catch(() => null);
      const id = pickCfPaymentId(json);
      logCf('Get Payments', {
        attempt: attempt + 1,
        http: response.status,
        cf_payment_id: id,
      });
      if (id) return id;
    } catch (error) {
      logCf('Get Payments error', { error: String(error), attempt: attempt + 1 });
    }
  }
  return '';
};

/** Resolve numeric cf_payment_id after SDK success (events + Cashfree Get Payments). */
export const resolveCashfreeCfPaymentId = async (args: {
  orderId: string;
  appId?: string;
  appSecret?: string;
  hintPaymentId?: string;
}): Promise<string> => {
  if (isCashfreePaymentId(args.hintPaymentId)) {
    return str(args.hintPaymentId);
  }
  return fetchCashfreeCfPaymentId({
    orderId: args.orderId,
    appId: args.appId,
    appSecret: args.appSecret,
  });
};

/**
 * Open Cashfree hosted Web Checkout.
 * Captures cf_payment_id from SDK analytics events when present.
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

  const env =
    session.environment === 'PRODUCTION' ||
    CASHFREE_ENVIRONMENT === 'PRODUCTION'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;

  const mode = opts?.mode || 'web';
  let capturedCfPaymentId = '';

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

    const cleanup = () => {
      try {
        CFPaymentGatewayService.removeCallback?.();
      } catch {
        // ignore
      }
      try {
        CFPaymentGatewayService.removeEventSubscriber?.();
      } catch {
        // ignore
      }
    };

    const finish = async (
      result: Omit<
        CashfreePaymentResult,
        'gatewayPaymentId' | 'gatewaySignature' | 'paymentSessionId'
      > & { gatewayPaymentId?: string },
    ) => {
      if (settled) return;
      settled = true;

      const orderId = str(result.orderId) || session.orderId;
      let cfPaymentId =
        str(result.gatewayPaymentId) || capturedCfPaymentId || '';

      if (result.status === 'success' && !isCashfreePaymentId(cfPaymentId)) {
        await new Promise(r => setTimeout(r, 500));
        cfPaymentId = capturedCfPaymentId || cfPaymentId;
      }

      if (result.status === 'success' && !isCashfreePaymentId(cfPaymentId)) {
        const cfg = getCashfreeCredentials();
        cfPaymentId = await fetchCashfreeCfPaymentId({
          orderId,
          appId: session.appId || cfg.appId,
          appSecret: session.appSecret || cfg.appSecret,
        });
      }

      cleanup();

      const finalResult: CashfreePaymentResult = {
        status: result.status,
        orderId,
        gatewayPaymentId: isCashfreePaymentId(cfPaymentId) ? cfPaymentId : '',
        gatewaySignature: isCashfreePaymentId(cfPaymentId) ? cfPaymentId : '',
        paymentSessionId: session.paymentSessionId,
        message: result.message,
        raw: result.raw,
      };
      logCf('checkout finished', {
        status: finalResult.status,
        orderId: finalResult.orderId,
        cf_payment_id: finalResult.gatewayPaymentId,
      });
      resolve(finalResult);
    };

    try {
      CFPaymentGatewayService.setEventSubscriber({
        onReceivedEvent(eventName: string, meta: any) {
          const id = pickCfPaymentIdFromMeta(meta);
          logCf('sdk event', {
            eventName,
            cf_payment_id: id || undefined,
          });
          if (id) capturedCfPaymentId = id;
        },
      });
    } catch (error) {
      logCf('setEventSubscriber failed', { error: String(error) });
    }

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
        CFPaymentGatewayService.doUPIPayment(
          new CFUPIIntentCheckoutPayment(cfSession, theme),
        );
        return;
      }

      CFPaymentGatewayService.doWebPayment(cfSession);
    } catch (error: any) {
      void finish({
        status: 'failed',
        orderId: session.orderId,
        gatewayPaymentId: '',
        message: str(error?.message) || 'Unable to open Cashfree checkout',
        raw: error,
      });
    }
  });
};

/**
 * Exact verify-payment body (no payment_gateway, no session_ ids):
 * {
 *   payment_id, gateway_order_id,
 *   gateway_payment_id: cf_payment_id,
 *   gateway_signature: cf_payment_id
 * }
 */
export const buildCashfreeVerifyPayload = (args: {
  paymentId: string;
  orderId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
}): {
  payment_id: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  gateway_signature: string;
} => {
  const orderId = str(args.orderId);
  const cfPaymentId = str(args.gatewayPaymentId);
  if (!isCashfreePaymentId(cfPaymentId)) {
    throw new Error(
      'Cashfree cf_payment_id missing. Cannot verify without numeric gateway_payment_id.',
    );
  }

  return {
    payment_id: str(args.paymentId),
    gateway_order_id: orderId,
    gateway_payment_id: cfPaymentId,
    gateway_signature: isCashfreePaymentId(args.gatewaySignature)
      ? str(args.gatewaySignature)
      : cfPaymentId,
  };
};
