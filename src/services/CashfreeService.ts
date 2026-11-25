import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCashfreeCredentials,
  ThirdParty,
} from '../config/thirdParty';
import { Colors } from '../common/Colors';

const CASHFREE_APP_ID = ThirdParty.cashfree.appId;
const CASHFREE_ENVIRONMENT = ThirdParty.cashfree.environment;
const CASHFREE_ALLOWED_PAYMENT_METHODS =
  ThirdParty.cashfree.allowedPaymentMethods;

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

const readCashfreeEnvironment = (
  value: unknown,
): 'SANDBOX' | 'PRODUCTION' | null => {
  const raw = str(value).toUpperCase();
  if (raw === 'PRODUCTION' || raw === 'PROD' || raw === 'LIVE') {
    return 'PRODUCTION';
  }
  if (raw === 'SANDBOX' || raw === 'TEST') return 'SANDBOX';
  return null;
};

/**
 * Environment must match the Cashfree account that created this session.
 * Package purchase nests it at checkout.cashfree.environment.
 * Consult / order may put it on cashfree or omit it (app default).
 */
const pickCashfreeEnvironment = (data: any): 'SANDBOX' | 'PRODUCTION' => {
  const checkout =
    data?.checkout && typeof data.checkout === 'object' ? data.checkout : {};
  const nodes = [data?.cashfree, checkout?.cashfree, checkout, data];
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    const env = readCashfreeEnvironment(
      node.environment ??
        node.env ??
        node.mode ??
        node.cashfree_environment ??
        node.cf_environment,
    );
    if (env) return env;
  }

  const appId = str(
    data?.cashfree?.app_id ??
      data?.cashfree?.client_id ??
      checkout?.cashfree?.app_id ??
      checkout?.cashfree?.client_id ??
      data?.cashfree_app_id ??
      data?.x_client_id,
  );
  if (appId.startsWith('TEST')) return 'SANDBOX';
  if (appId) return 'PRODUCTION';
  return getCashfreeCredentials().environment;
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
  const checkout =
    data?.checkout && typeof data.checkout === 'object' ? data.checkout : {};
  const nested =
    (data?.cashfree && typeof data.cashfree === 'object' && data.cashfree) ||
    (checkout?.cashfree &&
      typeof checkout.cashfree === 'object' &&
      checkout.cashfree) ||
    checkout ||
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
      checkout?.gateway_order_id ??
      nested.order_id ??
      nested.cf_order_id ??
      nested.cashfree_order_id ??
      checkout?.cashfree_order_id ??
      data?.cashfree_order_id ??
      data?.cf_order_id ??
      data?.order_id,
  );

  if (!paymentSessionId || !orderId) return null;

  const creds = pickCashfreeSecretFromBookSlot(data);
  return {
    paymentSessionId,
    orderId,
    environment: pickCashfreeEnvironment(data),
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
      env: fromApi.environment,
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
  environment?: 'SANDBOX' | 'PRODUCTION';
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

  const environment = args.environment || CASHFREE_ENVIRONMENT;
  const base =
    environment === 'PRODUCTION'
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
  environment?: 'SANDBOX' | 'PRODUCTION';
}): Promise<string> => {
  if (isCashfreePaymentId(args.hintPaymentId)) {
    return str(args.hintPaymentId);
  }
  return fetchCashfreeCfPaymentId({
    orderId: args.orderId,
    appId: args.appId,
    appSecret: args.appSecret,
    environment: args.environment,
  });
};

/**
 * Open Cashfree hosted Web Checkout.
 * Captures cf_payment_id from SDK analytics events when present.
 */
export const openCashfreePayment = (
  session: CashfreeCheckoutSession,
  opts?: {
    mode?: 'web' | 'upi_intent';
    /** Fires as soon as checkout closes, before payment-id lookup. */
    onReturned?: (status: CashfreePaymentResult['status']) => void;
  },
): Promise<CashfreePaymentResult> => {
  const { CFPaymentGatewayService } = require('react-native-cashfree-pg-sdk');
  const {
    CFSession,
    CFEnvironment,
    CFThemeBuilder,
    CFUPIIntentCheckoutPayment,
  } = require('cashfree-pg-api-contract');

  const env =
    session.environment === 'PRODUCTION'
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

      // Checkout is visible again before cf_payment_id lookup finishes.
      try {
        opts?.onReturned?.(result.status);
      } catch {
        // ignore
      }

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
          environment: session.environment,
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
 * Verify body after Cashfree checkout.
 * gateway_order_id is the Cashfree order id. gateway_payment_id is included
 * only when it is the numeric cf_payment_id. The order id is not a payment id;
 * sending it makes verify-payment return "Payment verification failed."
 */
export const buildCashfreeVerifyPayload = (args: {
  paymentId: string;
  orderId: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
}): {
  payment_id: string;
  gateway_order_id: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
} => {
  const orderId = str(args.orderId);
  const paymentId = str(args.paymentId);
  if (!paymentId || !orderId) {
    throw new Error(
      'Cashfree verify needs payment_id and the Cashfree order id.',
    );
  }

  const cfPaymentId = isCashfreePaymentId(args.gatewayPaymentId)
    ? str(args.gatewayPaymentId)
    : '';
  const signature = isCashfreePaymentId(args.gatewaySignature)
    ? str(args.gatewaySignature)
    : cfPaymentId;

  return {
    payment_id: paymentId,
    gateway_order_id: orderId,
    ...(cfPaymentId
      ? {
          gateway_payment_id: cfPaymentId,
          gateway_signature: signature,
        }
      : {}),
  };
};

/* -------------------------------------------------------------------------- */
/*                     Verify enrichment / poll / pending                     */
/* -------------------------------------------------------------------------- */

const CASHFREE_PENDING_KEY = 'CASHFREE_PENDING_VERIFY';
const PENDING_TTL_MS = 60 * 60 * 1000; // 1 hour

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const statusValues = (response: any): string[] => {
  const nodes = [
    response,
    response?.data,
    response?.data?.payment,
    response?.data?.order,
    response?.data?.purchase,
    response?.payment,
    response?.order,
  ].filter(node => node && typeof node === 'object');
  return nodes.flatMap(node =>
    [node.payment_status, node.order_status, node.status, node.purchase?.status]
      .map(value => String(value || '').trim())
      .filter(Boolean),
  );
};

const isPaidStatus = (value: string) =>
  /^(paid|success|captured|completed)$/i.test(value) ||
  String(value).toUpperCase() === 'PAID';

const isUnpaidStatus = (value: string) =>
  /^(pending|created|initiated|active|failed|failure|user_dropped|cancelled|canceled|expired|terminated)$/i.test(
    value,
  );

/** True when a verify-payment response says Cashfree settled the charge. */
export const isCashfreePaymentVerified = (response: any) => {
  if (!response || typeof response !== 'object') return false;
  const statuses = statusValues(response);
  const paid = statuses.some(isPaidStatus);
  const unpaid = statuses.some(isUnpaidStatus);
  if (unpaid && !paid) return false;
  if (
    response.success === false ||
    response.success === 'false' ||
    response.success === 0
  ) {
    return false;
  }
  if (paid) return true;
  return (
    response.success === true ||
    response.success === 'true' ||
    response.success === 1
  );
};

/**
 * Ask verify-payment until Cashfree / webhook has captured the order.
 * gateway_payment_id is optional; payment_id + gateway_order_id are enough once settled.
 */
export const verifyCashfreeUntilSettled = async <T = any>(
  verifyFn: (payload: Record<string, any>) => Promise<T>,
  payload: Record<string, any>,
  opts?: { attempts?: number; waitMs?: number },
): Promise<T> => {
  const attempts = opts?.attempts ?? 4;
  const waitMs = opts?.waitMs ?? 1200;
  let last: T | null = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    last = await verifyFn(payload);
    if (isCashfreePaymentVerified(last)) return last;
    const pending = String((last as any)?.message || '')
      .toLowerCase()
      .includes('pending');
    if (!pending || attempt === attempts - 1) return last;
    await sleep(waitMs);
  }
  return last as T;
};

const normKey = (key: unknown) =>
  String(key || '')
    .toLowerCase()
    .replace(/[_-]/g, '');

const looksLikeSession = (value: string) =>
  /^session[_-]/i.test(value) || value.startsWith('payment_session');

const PAYMENT_RANK = [
  'gatewaypaymentid',
  'cfpaymentid',
  'cashfreepaymentid',
  'referenceid',
  'transactionid',
  'txnid',
  'pgpaymentid',
  'bankreference',
  'authid',
  'paymentid',
];
const ORDER_KEYS = new Set([
  'gatewayorderid',
  'cashfreeorderid',
  'cforderid',
  'orderid',
]);
const SIGN_KEYS = new Set([
  'gatewaysignature',
  'signature',
  'txnsignature',
  'paymentsignature',
]);

/**
 * Pull gateway ids out of a Cashfree SDK result, API payment row, or nested payload.
 * Prefers numeric cf_payment_id; never treats payment_session_id as a payment id.
 */
export const harvestCashfreeGateway = (
  root: any,
  internalPaymentId = '',
): {
  gateway_order_id: string;
  gateway_payment_id: string;
  gateway_signature: string;
} => {
  const found = {
    gateway_order_id: '',
    gateway_payment_id: '',
    gateway_signature: '',
  };
  const internal = str(internalPaymentId);
  let bestPaymentRank = 99;

  const visit = (node: any, depth: number) => {
    if (!node || typeof node !== 'object' || depth > 8) return;
    Object.entries(node).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (
          (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
          try {
            visit(JSON.parse(trimmed), depth + 1);
            return;
          } catch {
            /* keep raw */
          }
        }
      }
      const text = str(value);
      const name = normKey(key);
      if (!text) {
        if (value && typeof value === 'object') visit(value, depth + 1);
        return;
      }
      if (
        !found.gateway_order_id &&
        ORDER_KEYS.has(name) &&
        !looksLikeSession(text)
      ) {
        found.gateway_order_id = text;
      }
      const rank = PAYMENT_RANK.indexOf(name);
      const usablePayment =
        rank !== -1 &&
        rank < bestPaymentRank &&
        text !== internal &&
        !looksLikeSession(text) &&
        text !== found.gateway_order_id &&
        // Prefer numeric cf ids; also accept other gateway payment ids when present
        (isCashfreePaymentId(text) || rank <= 5);
      if (usablePayment) {
        bestPaymentRank = rank;
        found.gateway_payment_id = text;
      }
      if (!found.gateway_signature && SIGN_KEYS.has(name) && text.length > 8) {
        found.gateway_signature = text;
      }
      if (value && typeof value === 'object') visit(value, depth + 1);
    });
  };

  if (typeof root === 'string') {
    try {
      visit(JSON.parse(root), 0);
    } catch {
      /* not json */
    }
  } else {
    visit(root, 0);
  }
  return found;
};

/**
 * After checkout, webhook may store cf_payment_id on the payment row before
 * the SDK surfaces it. Poll loaders (e.g. getConsultationPayment) when missing.
 */
export const enrichCashfreeVerifyPayload = async (
  payload: Record<string, any>,
  loaders: Array<() => Promise<any>> = [],
) => {
  if (str(payload?.gateway_payment_id)) return payload;
  const internal = str(payload?.payment_id);
  const reads = loaders.filter(load => typeof load === 'function');
  if (!reads.length) return payload;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    for (const load of reads) {
      try {
        const response = await load();
        const found = harvestCashfreeGateway(response, internal);
        if (!found.gateway_payment_id) continue;
        return {
          ...payload,
          gateway_order_id:
            str(payload?.gateway_order_id) || found.gateway_order_id,
          gateway_payment_id: found.gateway_payment_id,
          gateway_signature:
            str(payload?.gateway_signature) ||
            found.gateway_signature ||
            (isCashfreePaymentId(found.gateway_payment_id)
              ? found.gateway_payment_id
              : ''),
        };
      } catch {
        /* webhook may not have landed yet */
      }
    }
    if (attempt < 4) await sleep(1200);
  }
  return payload;
};

export type CashfreePendingVerify = {
  kind: 'consultation' | 'order' | 'package' | 'diet';
  paymentId: string;
  orderId: string;
  sessionId?: string;
  /** Extra ids for resume (purchase_id, order_id, appointment_id, dietPlanId, …) */
  meta?: Record<string, string | number | null | undefined>;
  savedAt: number;
};

/** Persist pending Cashfree verify before opening the SDK (crash / kill safety). */
export const saveCashfreePending = async (
  payload: Omit<CashfreePendingVerify, 'savedAt'>,
) => {
  try {
    const row: CashfreePendingVerify = {
      ...payload,
      paymentId: str(payload.paymentId),
      orderId: str(payload.orderId),
      sessionId: str(payload.sessionId) || undefined,
      savedAt: Date.now(),
    };
    if (!row.paymentId || !row.orderId) return;
    await AsyncStorage.setItem(CASHFREE_PENDING_KEY, JSON.stringify(row));
  } catch {
    /* ignore quota */
  }
};

export const readCashfreePending = async (): Promise<CashfreePendingVerify | null> => {
  try {
    const raw = await AsyncStorage.getItem(CASHFREE_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (
      !parsed.savedAt ||
      Date.now() - Number(parsed.savedAt) > PENDING_TTL_MS
    ) {
      await AsyncStorage.removeItem(CASHFREE_PENDING_KEY);
      return null;
    }
    return parsed as CashfreePendingVerify;
  } catch {
    return null;
  }
};

export const clearCashfreePending = async () => {
  try {
    await AsyncStorage.removeItem(CASHFREE_PENDING_KEY);
  } catch {
    /* ignore */
  }
};
