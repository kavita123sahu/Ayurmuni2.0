import { DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import type { PaymentGateway } from '../config/paymentGateways';

/**
 * ICICI PayPhi Customer SDK (react-native-payphi-sdk).
 * Flow: setAppInfo → makePayment → listen for `payment_response`.
 *
 * Install: copy `react-native-payphi-sdk-v1.0.0.tgz` to `vendor/`, then
 *   npm install ./vendor/react-native-payphi-sdk-v1.0.0.tgz
 * and rebuild the native app.
 */

export type PayphiEnvironment = 'UAT' | 'PROD' | 'SANDBOX' | string;

export type PayphiAppInfo = {
  merchantId: string;
  environment: PayphiEnvironment;
  aggregatorId?: string;
  appName?: string;
  appVersion?: string;
  [key: string]: unknown;
};

export type PayphiPaymentRequest = {
  amount: number | string;
  invoiceNo: string;
  currencyCode?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerName?: string;
  paymentId?: string;
  /** Extra fields returned by the backend (secureHash, udf*, etc.). */
  [key: string]: unknown;
};

export type PayphiPaymentResult = {
  status: 'success' | 'failed' | 'cancelled' | 'pending';
  raw: any;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  message: string;
};

const RESPONSE_EVENT = 'payment_response';

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (value == null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return '';
};

const loadPayphiSdk = (): any => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-payphi-sdk');
    return mod?.default ?? mod?.PayphiSdk ?? mod;
  } catch (error) {
    console.log('[PAYPHI] SDK package missing =>', error);
    return null;
  }
};

const getNativeEmitter = (sdk: any): { addListener: Function; remove?: Function } | null => {
  const native =
    NativeModules?.PayphiSdk ||
    NativeModules?.RNPayphiSdk ||
    NativeModules?.PayPhi ||
    sdk?.NativeModule ||
    null;
  if (native) {
    try {
      return new NativeEventEmitter(native);
    } catch {
      // fall through to DeviceEventEmitter
    }
  }
  return DeviceEventEmitter;
};

/** True when the PayPhi RN package is linked. */
export const isPayphiSdkAvailable = (): boolean => Boolean(loadPayphiSdk());

/**
 * Pull merchant/env config for `setAppInfo` from place-order / book-slot response.
 * Backend should return these when `payment_gateway: 'payphi'`.
 */
export const parsePayphiAppInfo = (data: any): PayphiAppInfo | null => {
  const src =
    data?.payphi ??
    data?.checkout ??
    data?.sdk ??
    data?.gateway_data ??
    data?.app_info ??
    data ??
    {};
  const merchantId = pickString(
    src.merchantId,
    src.merchant_id,
    data?.merchant_id,
    data?.merchantId,
  );
  if (!merchantId) return null;

  const environment = pickString(
    src.environment,
    src.env,
    data?.environment,
    data?.env,
    'UAT',
  ).toUpperCase();

  return {
    merchantId,
    environment: environment || 'UAT',
    aggregatorId: pickString(src.aggregatorId, src.aggregator_id) || undefined,
    appName: pickString(src.appName, src.app_name, 'Ayurmuni') || 'Ayurmuni',
    appVersion: pickString(src.appVersion, src.app_version) || undefined,
    ...(typeof src === 'object' && src !== data ? src : {}),
  };
};

/**
 * Build `makePayment` payload from API payment payload + customer details.
 * Prefer an explicit `sdk_payload` / `make_payment` object from the backend.
 */
export const parsePayphiPaymentRequest = (
  data: any,
  fallback: {
    amount: number;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
  },
): PayphiPaymentRequest | null => {
  const checkout = data?.checkout ?? data?.payphi ?? data?.gateway_data ?? {};
  const explicit =
    data?.sdk_payload ??
    data?.make_payment ??
    data?.makePayment ??
    checkout?.sdk_payload ??
    checkout?.make_payment ??
    null;

  const invoiceNo = pickString(
    explicit?.invoiceNo,
    explicit?.invoice_no,
    data?.invoice_no,
    data?.invoiceNo,
    data?.gateway_order_id,
    data?.payphi_order_id,
    checkout?.invoice_no,
    checkout?.order_id,
    data?.order_id,
  );

  const amountRaw =
    explicit?.amount ??
    data?.amount ??
    data?.summary?.total_payable_amount ??
    checkout?.amount ??
    fallback.amount;

  const amountNum = Number(amountRaw);
  if (!invoiceNo || !Number.isFinite(amountNum) || amountNum <= 0) {
    return null;
  }

  // API amounts may be paise or rupees — prefer explicit rupee fields when present.
  const amountRupees = pickString(
    data?.amount_rupees,
    data?.payable_amount,
    data?.summary?.total_payable_amount,
  )
    ? Number(
        data?.amount_rupees ??
          data?.payable_amount ??
          data?.summary?.total_payable_amount,
      )
    : amountNum > 100000
      ? amountNum / 100
      : amountNum;

  const base: PayphiPaymentRequest = {
    ...(explicit && typeof explicit === 'object' ? explicit : {}),
    amount: Number.isFinite(amountRupees) ? amountRupees : amountNum,
    invoiceNo,
    currencyCode: pickString(
      explicit?.currencyCode,
      explicit?.currency,
      data?.currency,
      data?.summary?.currency,
      'INR',
    ) || 'INR',
    customerEmail: pickString(
      explicit?.customerEmail,
      explicit?.email,
      data?.customer_email,
      fallback.customerEmail,
    ),
    customerMobile: pickString(
      explicit?.customerMobile,
      explicit?.mobile,
      data?.customer_mobile,
      fallback.customerMobile,
    ),
    customerName: pickString(
      explicit?.customerName,
      explicit?.userName,
      data?.customer_name,
      fallback.customerName,
    ),
    paymentId: pickString(data?.payment_id, checkout?.payment_id) || undefined,
  };

  return base;
};

const classifyPayphiResponse = (raw: any): PayphiPaymentResult['status'] => {
  const code = pickString(
    raw?.responseCode,
    raw?.response_code,
    raw?.statusCode,
    raw?.status_code,
    raw?.code,
  ).toUpperCase();
  const status = pickString(raw?.status, raw?.payment_status, raw?.txnStatus).toLowerCase();
  const message = pickString(raw?.message, raw?.responseMessage, raw?.description).toLowerCase();

  if (
    code === 'E000' ||
    status === 'success' ||
    status === 'successful' ||
    status === 'paid' ||
    status === 'completed' ||
    status === 'captured'
  ) {
    return 'success';
  }
  if (
    status === 'pending' ||
    status === 'processing' ||
    status === 'in_progress' ||
    code === 'E00328' ||
    code === 'E00329'
  ) {
    return 'pending';
  }
  if (
    status === 'cancel' ||
    status === 'cancelled' ||
    status === 'canceled' ||
    message.includes('cancel') ||
    message.includes('user closed') ||
    code === 'USER_CANCELLED'
  ) {
    return 'cancelled';
  }
  return 'failed';
};

export const mapPayphiResponse = (raw: any): PayphiPaymentResult => {
  const status = classifyPayphiResponse(raw);
  return {
    status,
    raw,
    gatewayOrderId: pickString(
      raw?.invoiceNo,
      raw?.invoice_no,
      raw?.merchantTxnNo,
      raw?.gateway_order_id,
      raw?.order_id,
      raw?.txnId,
    ),
    gatewayPaymentId: pickString(
      raw?.txnId,
      raw?.txn_id,
      raw?.payment_id,
      raw?.gateway_payment_id,
      raw?.transactionId,
      raw?.rrn,
    ),
    gatewaySignature: pickString(
      raw?.secureHash,
      raw?.secure_hash,
      raw?.signature,
      raw?.gateway_signature,
    ),
    message: pickString(
      raw?.message,
      raw?.responseMessage,
      raw?.description,
      status === 'success'
        ? 'Payment successful'
        : status === 'cancelled'
          ? 'Payment cancelled'
          : status === 'pending'
            ? 'Payment pending'
            : 'Payment failed',
    ),
  };
};

/** Initialize the ICICI PayPhi SDK with merchant / environment from the API. */
export const setPayphiAppInfo = async (info: PayphiAppInfo): Promise<void> => {
  const sdk = loadPayphiSdk();
  if (!sdk) {
    throw new Error(
      'PayPhi SDK is not installed. Add react-native-payphi-sdk and rebuild the app.',
    );
  }
  const fn = sdk.setAppInfo || sdk.setAppinfo || sdk.init;
  if (typeof fn !== 'function') {
    throw new Error('PayPhi SDK setAppInfo is unavailable');
  }
  await Promise.resolve(fn.call(sdk, info));
};

/**
 * Open the ICICI PayPhi checkout sheet and resolve with `payment_response`.
 */
export const openPayphiPayment = async (
  appInfo: PayphiAppInfo | null,
  request: PayphiPaymentRequest,
  timeoutMs = 10 * 60 * 1000,
): Promise<PayphiPaymentResult> => {
  const sdk = loadPayphiSdk();
  if (!sdk) {
    throw new Error(
      'PayPhi SDK is not installed. Add react-native-payphi-sdk and rebuild the app.',
    );
  }

  if (appInfo?.merchantId) {
    await setPayphiAppInfo(appInfo);
  }

  const makePayment = sdk.makePayment || sdk.startPayment || sdk.pay;
  if (typeof makePayment !== 'function') {
    throw new Error('PayPhi SDK makePayment is unavailable');
  }

  return new Promise<PayphiPaymentResult>((resolve, reject) => {
    let settled = false;
    const emitter = getNativeEmitter(sdk);

    const finish = (result: PayphiPaymentResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        subscription?.remove?.();
      } catch {
        // ignore
      }
      resolve(result);
    };

    const onResponse = (payload: any) => {
      console.log('[PAYPHI] payment_response =>', payload);
      finish(mapPayphiResponse(payload));
    };

    const subscription = emitter?.addListener?.(RESPONSE_EVENT, onResponse);

    const timer = setTimeout(() => {
      finish({
        status: 'pending',
        raw: { timeout: true },
        gatewayOrderId: String(request.invoiceNo || ''),
        gatewayPaymentId: '',
        gatewaySignature: '',
        message: 'Payment timed out. Please check your order status.',
      });
    }, timeoutMs);

    try {
      const maybePromise = makePayment.call(sdk, request);
      // Some SDK builds return the result from makePayment instead of an event.
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise
          .then((payload: any) => {
            if (payload != null) onResponse(payload);
          })
          .catch((error: any) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            try {
              subscription?.remove?.();
            } catch {
              // ignore
            }
            reject(error);
          });
      }
    } catch (error) {
      settled = true;
      clearTimeout(timer);
      try {
        subscription?.remove?.();
      } catch {
        // ignore
      }
      reject(error);
    }
  });
};

export const isPayphiUserCancelled = (result: PayphiPaymentResult | any): boolean => {
  if (!result) return false;
  if (result?.status === 'cancelled') return true;
  const msg = String(result?.message ?? result?.description ?? '').toLowerCase();
  return msg.includes('cancel') || msg.includes('closed by user');
};

/** Detect PayPhi orders from API payloads. */
export const hasPayphiOrder = (data: any): boolean => {
  const gateway = String(
    data?.payment_gateway ?? data?.gateway ?? data?.provider ?? '',
  )
    .toLowerCase()
    .replace(/[\s_-]/g, '');
  if (gateway === 'payphi' || gateway === 'icici' || gateway === 'icicipayphi') {
    return true;
  }
  return !!(
    data?.payphi ||
    data?.invoice_no ||
    data?.sdk_payload ||
    data?.make_payment ||
    data?.checkout?.invoice_no
  );
};

export const payphiGatewayId = (): PaymentGateway => 'payphi';
