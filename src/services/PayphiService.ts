import { InteractionManager, NativeModules } from 'react-native';
import { getPayphiCredentials } from '../config/payphiConfig';

/**
 * ICICI PayPhi — setAppInfo → makePayment → map response → verify-payment.
 * Credentials live in payphiConfig; API `data.icici` overrides when present.
 */

export type PayphiAppInfo = {
  merchantId: string;
  appId: string;
  environment: string;
  aggregatorID: string;
  merchantName: string;
};

export type PayphiPaymentRequest = {
  amount: string;
  merchantId: string;
  merchantTxnNo: string;
  currencyCode: string;
  customerEmailID: string;
  customerMobileNo?: string;
  customerName?: string;
  aggregatorID?: string;
  addlParam1?: string;
  addlParam2?: string;
  secretKey?: string;
  secureToken?: string;
  paymentId?: string;
};

export type PayphiPaymentResult = {
  status: 'success' | 'failed' | 'cancelled' | 'pending';
  raw: any;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  message: string;
};

const str = (value: unknown): string =>
  value == null ? '' : String(value).trim();

/** Always unique alphanumeric merchantTxnNo, max 20 chars (PayPhi limit). */
export const createPayphiMerchantTxnNo = (): string => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = Date.now().toString(36);
  while (out.length < 20) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out.replace(/[^a-z0-9]/gi, '').slice(0, 20);
};

/**
 * Alphanumeric only, max 20 (PayPhi limit).
 * Prefer the book-slot value — do not invent a new id when API sent one
 * (verify looks up the id your backend already stored).
 */
export const normalizePayphiMerchantTxnNo = (value?: string): string => {
  const cleaned = str(value).replace(/[^a-zA-Z0-9]/g, '');
  if (!cleaned) return createPayphiMerchantTxnNo();
  if (cleaned.length > 20) {
    logPayphi('merchantTxnNo truncated to 20 — ask backend to issue ≤20 alnum', {
      originalLen: cleaned.length,
    });
    return cleaned.slice(0, 20);
  }
  return cleaned;
};

const toAmount = (value: unknown): string => {
  const n = Number(
    String(value ?? '')
      .replace(/[,₹]/g, '')
      .replace(/rs\.?/gi, '')
      .trim(),
  );
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toFixed(2);
};

const waitForUi = (): Promise<void> =>
  new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => setTimeout(resolve, 120));
  });

const sdkEnv = (value?: string): string => {
  const env = str(value || 'INT').toUpperCase();
  if (env === 'PROD' || env === 'PRODUCTION' || env === 'LIVE') return 'PROD';
  if (env === 'PREPROD') return 'PREPROD';
  if (env === 'QA') return 'QA';
  if (env === 'DEV') return 'dev';
  return 'INT';
};

const logPayphi = (step: string, data?: Record<string, unknown>) => {
  console.warn('[PAYPHI]', step, data ?? '');
};

let cachedSdk: any | undefined;

const getSdk = (): any => {
  if (cachedSdk !== undefined) return cachedSdk;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-payphi-sdk');
    cachedSdk = mod?.default ?? mod?.PayphiSdk ?? mod ?? null;
  } catch {
    cachedSdk = null;
  }
  return cachedSdk;
};

export const isPayphiNativeLinked = (): boolean =>
  Boolean(NativeModules?.PayphiSdk);

export const getIciciPayload = (data: any): Record<string, any> | null => {
  const icici = data?.icici;
  if (!icici || typeof icici !== 'object' || Array.isArray(icici)) return null;
  return icici;
};

export const parsePayphiAppInfo = (data: any): PayphiAppInfo | null => {
  const creds = getPayphiCredentials();
  const icici = getIciciPayload(data);
  const merchantId =
    str(icici?.merchantId) ||
    str(data?.merchant_id) ||
    str(data?.merchantId) ||
    creds.merchantId;
  if (!merchantId) return null;

  return {
    merchantId,
    appId:
      str(icici?.appId) ||
      str(data?.app_id) ||
      str(data?.appId) ||
      creds.appId ||
      merchantId,
    environment: sdkEnv(
      str(icici?.environment) || str(data?.environment) || creds.environment,
    ),
    aggregatorID:
      str(icici?.aggregatorID) ||
      str(data?.aggregatorID) ||
      creds.aggregatorID,
    merchantName: str(icici?.merchantName) || 'Ayurmuni',
  };
};

export const parsePayphiPaymentRequest = (
  data: any,
  fallback?: {
    amount?: number;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
  },
): PayphiPaymentRequest | null => {
  const icici = getIciciPayload(data) || {};
  const creds = getPayphiCredentials();
  const merchantId = str(icici.merchantId) || creds.merchantId;
  const merchantTxnNo = normalizePayphiMerchantTxnNo(
    str(icici.merchantTxnNo) ||
      str(data?.gateway_order_id) ||
      str(data?.invoice_no) ||
      str(data?.invoiceNo),
  );
  const amount = toAmount(
    icici.amount ??
      data?.amount ??
      data?.summary?.total_payable_amount ??
      fallback?.amount,
  );
  const customerEmailID =
    str(icici.customerEmailID) ||
    str(data?.customer_email) ||
    str(fallback?.customerEmail);

  if (!merchantId || !amount || !customerEmailID) {
    logPayphi('parsePayphiPaymentRequest missing', {
      hasMerchantId: Boolean(merchantId),
      hasAmount: Boolean(amount),
      hasEmail: Boolean(customerEmailID),
    });
    return null;
  }

  const secretKey = str(icici.secretKey) || creds.secretKey;
  const secureToken = str(icici.secureToken);

  return {
    amount,
    merchantId,
    merchantTxnNo,
    currencyCode: str(icici.currencyCode) || '356',
    customerEmailID,
    customerMobileNo:
      str(icici.customerMobileNo) ||
      str(data?.customer_mobile) ||
      str(fallback?.customerMobile),
    customerName:
      str(icici.customerName) ||
      str(data?.customer_name) ||
      str(fallback?.customerName),
    aggregatorID: str(icici.aggregatorID) || creds.aggregatorID,
    addlParam1: str(icici.addlParam1),
    addlParam2: str(icici.addlParam2),
    ...(secretKey ? { secretKey } : {}),
    ...(secureToken ? { secureToken } : {}),
    paymentId: str(data?.payment_id),
  };
};

/** ICICI success codes: 0000 (web/card), E000 / 000 (legacy). */
const isSuccessCode = (code: string): boolean => {
  const c = code.replace(/^0+/, '') || '0';
  return (
    code === 'E000' ||
    code === '0000' ||
    code === '000' ||
    c === '0' ||
    code === '00'
  );
};

const sdkMessage = (raw: any, error?: any): string =>
  str(
    raw?.respDescription ??
      raw?.message ??
      raw?.responseMessage ??
      raw?.ResponseMessage ??
      raw?.error ??
      error?.message ??
      error?.code ??
      raw?.responseCode ??
      raw?.ResponseCode ??
      error,
  );

export const mapPayphiResponse = (raw: any): PayphiPaymentResult => {
  const code = str(raw?.responseCode || raw?.ResponseCode).toUpperCase();
  const statusRaw = str(raw?.status || raw?.txnStatus).toLowerCase();
  const desc = str(raw?.respDescription).toLowerCase();
  const message = sdkMessage(raw);

  let status: PayphiPaymentResult['status'] = 'failed';

  if (raw?.error != null && !isSuccessCode(code)) {
    status = 'failed';
  } else if (
    isSuccessCode(code) ||
    desc.includes('transaction successful') ||
    desc.includes('success') ||
    ['success', 'successful', 'sucess', 'paid', 'completed'].includes(statusRaw)
  ) {
    status = 'success';
  } else if (
    statusRaw === 'pending' ||
    statusRaw === 'processing' ||
    code === 'R1000'
  ) {
    status = 'pending';
  } else if (
    ['cancel', 'cancelled', 'canceled'].includes(statusRaw) ||
    message.toLowerCase().includes('cancel')
  ) {
    status = 'cancelled';
  }

  const gatewayPaymentId = str(
    raw?.txnID ||
      raw?.txnId ||
      raw?.TxnID ||
      raw?.TxnId ||
      raw?.rrn ||
      raw?.RRN,
  );
  const gatewayOrderId = str(raw?.merchantTxnNo || raw?.MerchantTxnNo);
  const gatewaySignature = str(raw?.secureHash || raw?.SecureHash);

  logPayphi('payment_response mapped', {
    status,
    code,
    message,
    gatewayOrderId,
    gatewayPaymentId,
    hasSignature: Boolean(gatewaySignature),
  });

  return {
    status,
    raw,
    gatewayOrderId,
    gatewayPaymentId,
    gatewaySignature,
    message,
  };
};

const setAppInfo = async (info: PayphiAppInfo): Promise<void> => {
  const sdk = getSdk();
  if (!sdk) throw new Error('PayPhi native SDK is not linked');

  const creds = getPayphiCredentials();
  const environment = sdkEnv(info.environment);
  const aggregatorID = str(info.aggregatorID) || creds.aggregatorID;
  const appId = str(info.appId) || creds.appId || str(info.merchantId);
  const merchantName = str(info.merchantName) || 'Ayurmuni';

  if (!aggregatorID || !appId) {
    throw new Error('PayPhi setAppInfo needs aggregatorID and appId');
  }

  // SDK login: environment, aggregatorID, appId, merchantName
  logPayphi('setAppInfo', { environment, aggregatorID, appId, merchantName });
  const status = await sdk.setAppInfo(
    environment,
    aggregatorID,
    appId,
    merchantName,
  );
  logPayphi('setAppInfo OK', { status });
};

/**
 * Opens native PayPhi sheet. Login (setAppInfo) must succeed first.
 */
export const openPayphiPayment = async (
  appInfo: PayphiAppInfo | null,
  request: PayphiPaymentRequest,
  timeoutMs = 10 * 60 * 1000,
): Promise<PayphiPaymentResult> => {
  const sdk = getSdk();
  if (!sdk || !isPayphiNativeLinked()) {
    const err: any = new Error('PayPhi native SDK is not linked');
    err.code = 'PAYPHI_NATIVE_MISSING';
    throw err;
  }
  if (!appInfo?.merchantId) throw new Error('merchantId missing');

  const amount = toAmount(request.amount);
  if (!amount) throw new Error('amount missing or invalid');

  const creds = getPayphiCredentials();
  /**
   * MUST match book-slot / place-order gateway_order_id (backend stores it).
   * Generating a new id here causes verify → "Payment not found."
   * Only generate when API omitted a usable txn (alnum ≤20).
   */
  const merchantTxnNo = normalizePayphiMerchantTxnNo(request.merchantTxnNo);
  const aggregatorID =
    str(request.aggregatorID) ||
    str(appInfo.aggregatorID) ||
    creds.aggregatorID;

  logPayphi('openPayment', {
    merchantId: appInfo.merchantId,
    appId: appInfo.appId,
    environment: appInfo.environment,
    merchantTxnNo,
    fromApi: str(request.merchantTxnNo),
    amount,
    aggregatorID,
  });

  await waitForUi();
  await setAppInfo({ ...appInfo, aggregatorID });
  await waitForUi();

  return new Promise<PayphiPaymentResult>((resolve, reject) => {
    let settled = false;
    let subscription: { remove?: () => void } | null = null;

    const finish = (result: PayphiPaymentResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        subscription?.remove?.();
      } catch {
        // ignore
      }
      // Prefer the txn we sent if SDK omits it.
      const gatewayOrderId = result.gatewayOrderId || merchantTxnNo;
      logPayphi('payment_response', {
        status: result.status,
        gatewayOrderId,
        gatewayPaymentId: result.gatewayPaymentId,
        message: result.message,
      });
      resolve({ ...result, gatewayOrderId });
    };

    try {
      if (typeof sdk.addPaymentResponseListener === 'function') {
        subscription = sdk.addPaymentResponseListener((payload: any) => {
          finish(mapPayphiResponse(payload));
        });
      }
    } catch (error) {
      reject(error);
      return;
    }

    const timer = setTimeout(() => {
      finish({
        status: 'pending',
        raw: { timeout: true },
        gatewayOrderId: merchantTxnNo,
        gatewayPaymentId: '',
        gatewaySignature: '',
        message: 'Payment timed out',
      });
    }, timeoutMs);

    try {
      const secretKey = str(request.secretKey) || creds.secretKey;
      const secureToken = str(request.secureToken);

      const payload: Record<string, string> = {
        amount,
        merchantId: str(request.merchantId),
        merchantTxnNo,
        currencyCode: str(request.currencyCode) || '356',
        customerEmailID: str(request.customerEmailID),
        customerMobileNo: str(request.customerMobileNo),
        customerName: str(request.customerName),
        addlParam1: str(request.addlParam1),
        addlParam2: str(request.addlParam2),
        aggregatorID,
        apiVersion: '4',
      };
      if (secretKey) payload.secretKey = secretKey;
      if (secureToken) payload.secureToken = secureToken;

      if (!payload.merchantId || !payload.merchantTxnNo || !payload.customerEmailID) {
        throw new Error(
          'ICICI PayPhi needs merchantId, merchantTxnNo and customerEmailID',
        );
      }
      if (!secretKey && !secureToken) {
        throw new Error(
          'ICICI PayPhi needs secretKey (UAT Key) or secureToken',
        );
      }

      logPayphi('makePayment', {
        amount: payload.amount,
        merchantId: payload.merchantId,
        merchantTxnNo: payload.merchantTxnNo,
        apiVersion: payload.apiVersion,
        hasSecretKey: Boolean(secretKey),
        hasSecureToken: Boolean(secureToken),
      });

      sdk.makePayment(payload);
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

export const isPayphiUserCancelled = (
  result: PayphiPaymentResult | any,
): boolean => {
  if (!result) return false;
  if (result.status === 'cancelled') return true;
  const msg = str(result.message || result.description).toLowerCase();
  return msg.includes('cancel') || msg.includes('closed by user');
};

/**
 * Exact verify-payment body (same 4 keys as Cashfree consult verify):
 *   payment_id, gateway_order_id, gateway_payment_id, gateway_signature
 */
export const buildIciciVerifyPayload = (args: {
  paymentId: string;
  merchantTxnNo: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
}): {
  payment_id: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  gateway_signature: string;
} => ({
  payment_id: str(args.paymentId),
  gateway_order_id: str(args.merchantTxnNo),
  gateway_payment_id: str(args.gatewayPaymentId),
  gateway_signature: str(args.gatewaySignature),
});

export const resolveIciciMerchantTxnNo = (
  paymentData: any,
  sdkGatewayOrderId?: string,
): string => {
  // Backend stores gateway_order_id / merchantTxnNo at book-slot — prefer that.
  const fromApi = str(
    paymentData?.gateway_order_id || paymentData?.icici?.merchantTxnNo,
  ).replace(/[^a-zA-Z0-9]/g, '');
  if (fromApi) return fromApi.slice(0, 20);
  const fromSdk = str(sdkGatewayOrderId).replace(/[^a-zA-Z0-9]/g, '');
  return fromSdk.slice(0, 20);
};
