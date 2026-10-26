import { InteractionManager, NativeModules } from 'react-native';
import { getPayphiCredentials } from '../config/payphiConfig';

/**
 * ICICI PayPhi Customer SDK
 *
 * Flow: setAppInfo (login) → makePayment → payment_response → verify-payment
 *
 * Keys match book-slot / place-order `data.icici` and the native SDK:
 *   merchantId, merchantTxnNo, amount, currencyCode, customerEmailID,
 *   aggregatorID, secretKey / secureToken
 *
 * Config (payphiConfig) fills MID / AppId / Key / Agg / env only when API omits them.
 */

export type PayphiAppInfo = {
  merchantId: string;
  appId: string;
  environment: string;
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
  apiVersion?: string;
  transactionType?: string;
  payType?: string;
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

export type PayphiHostedCheckout = {
  paymentId: string;
  orderId: string;
  redirectUrl: string;
  returnUrl: string;
};

const str = (value: unknown): string => {
  if (value == null) return '';
  const s = String(value).trim();
  return s;
};

/** SDK HMAC + sheet need amount as "##.##" */
const toAmount = (value: unknown): string => {
  const n = Number(String(value ?? '').replace(/[,₹]/g, '').replace(/rs\.?/gi, '').trim());
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toFixed(2);
};

const waitForUi = (): Promise<void> =>
  new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => setTimeout(resolve, 120));
  });

/** Native SDK rejects "UAT" — ICICI UAT uses env "INT". */
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

/** ICICI /merapp/login often returns HTTP 200 with this business error body. */
const isSoftLoginFailure = (error: any): boolean => {
  const code = str(error?.code || error?.userInfo?.code).toLowerCase();
  const msg = str(error?.message || error).toLowerCase();
  return (
    code.includes('server communication error') ||
    msg.includes('server communication error') ||
    (/\b200\b/.test(code) && msg.includes('setappinfo')) ||
    (/\b200\b/.test(msg) && msg.includes('communication'))
  );
};

/** Copy-paste block for ICICI when login fails. */
const logIciciLoginReport = (
  title: string,
  details: Record<string, unknown>,
) => {
  const lines = [
    '',
    '========== ICICI PAYPHI — SEND THIS TO ICICI TEAM ==========',
    `TITLE: ${title}`,
    `TIME: ${new Date().toISOString()}`,
    'APP: Ayurmuni | package: com.ayurmuniecosystem',
    'loginUrl: https://pgpayuat.icicibank.com/merapp/login/',
    'debugSHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25',
    'NOTE: setAppInfo login uses MID+AppId+env only — Key/Agg are for makePayment',
    '---',
    ...Object.entries(details).map(([k, v]) => {
      const val =
        typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
      return `${k}: ${val}`;
    }),
    '============================================================',
    '',
  ];
  console.warn(lines.join('\n'));
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

/** `data.icici` from book-slot / place-order (may be missing — then use top-level + config). */
export const getIciciPayload = (data: any): Record<string, any> | null => {
  const icici = data?.icici;
  if (!icici || typeof icici !== 'object' || Array.isArray(icici)) return null;
  return icici;
};

/** Build setAppInfo args from `data.icici` + config fallbacks. */
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
    merchantName: str(icici?.merchantName) || 'Ayurmuni',
  };
};

/** Build makePayment payload from `data.icici` (exact SDK keys) + config fallbacks. */
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
  const merchantTxnNo =
    str(icici.merchantTxnNo) ||
    str(data?.gateway_order_id) ||
    str(data?.invoice_no) ||
    str(data?.invoiceNo);
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

  if (!merchantId || !merchantTxnNo || !amount || !customerEmailID) {
    logPayphi('parsePayphiPaymentRequest missing fields', {
      hasMerchantId: Boolean(merchantId),
      hasMerchantTxnNo: Boolean(merchantTxnNo),
      hasAmount: Boolean(amount),
      hasEmail: Boolean(customerEmailID),
      hasIciciObject: Boolean(getIciciPayload(data)),
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
    apiVersion: str(icici.apiVersion) || '1.0',
    transactionType: str(icici.transactionType) || 'SALE',
    payType: str(icici.payType) || '0',
    ...(secretKey ? { secretKey } : {}),
    ...(secureToken ? { secureToken } : {}),
    paymentId: str(data?.payment_id),
  };
};

/**
 * Hosted checkout: redirectURI + tranCtx from initiateSale.
 * Does not need Customer SDK App ID /merapp/login.
 */
export const parsePayphiHostedCheckout = (
  data: any,
): PayphiHostedCheckout | null => {
  const creds = getPayphiCredentials();
  const icici = getIciciPayload(data) || {};
  const tranCtx = str(icici.tranCtx) || str(data?.tranCtx);
  const redirectBase =
    str(icici.redirectURI) ||
    str(data?.redirectURI) ||
    creds.authRedirectBase;

  const redirectUrl = tranCtx
    ? `${redirectBase}${redirectBase.includes('?') ? '&' : '?'}tranCtx=${encodeURIComponent(tranCtx)}`
    : '';

  const paymentId = str(data?.payment_id);
  const orderId =
    str(data?.gateway_order_id) || str(icici.merchantTxnNo);

  if (!paymentId || !orderId || !redirectUrl) return null;

  return {
    paymentId,
    orderId,
    redirectUrl,
    returnUrl: str(data?.return_url),
  };
};

/** Exact message from PayPhi SDK / response — no custom copy. */
const sdkMessage = (raw: any, error?: any): string =>
  str(
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

const mapPayphiResponse = (raw: any): PayphiPaymentResult => {
  const code = str(raw?.responseCode || raw?.ResponseCode).toUpperCase();
  const statusRaw = str(raw?.status || raw?.txnStatus).toLowerCase();
  const message = sdkMessage(raw);

  let status: PayphiPaymentResult['status'] = 'failed';
  if (
    raw?.error == null &&
    (code === 'E000' ||
      code === '000' ||
      ['success', 'successful', 'sucess', 'paid', 'completed'].includes(statusRaw))
  ) {
    status = 'success';
  } else if (statusRaw === 'pending' || statusRaw === 'processing' || code === 'R1000') {
    status = 'pending';
  } else if (
    ['cancel', 'cancelled', 'canceled'].includes(statusRaw) ||
    message.toLowerCase().includes('cancel')
  ) {
    status = 'cancelled';
  }

  logPayphi('payment_response mapped', {
    status,
    code,
    message,
    raw,
  });

  return {
    status,
    raw,
    gatewayOrderId: str(raw?.merchantTxnNo || raw?.MerchantTxnNo),
    gatewayPaymentId: str(raw?.txnId || raw?.TxnID || raw?.rrn || raw?.RRN),
    gatewaySignature: str(raw?.secureHash || raw?.SecureHash),
    message,
  };
};

const setAppInfo = async (info: PayphiAppInfo): Promise<void> => {
  const sdk = getSdk();
  if (!sdk) {
    throw new Error('PayPhi native SDK is not linked');
  }

  const merchantId = str(info.merchantId);
  const appId = str(info.appId) || merchantId;
  const environment = sdkEnv(info.environment);
  const merchantName = str(info.merchantName) || 'Ayurmuni';

  logPayphi('setAppInfo', {
    environment,
    merchantId,
    appId,
    merchantName,
  });

  try {
    const status = await sdk.setAppInfo(environment, merchantId, appId, merchantName);
    logPayphi('setAppInfo OK', { status });
  } catch (error: any) {
    // Exact SDK error only — log + rethrow as-is
    logPayphi('setAppInfo FAILED', {
      code: error?.code,
      message: sdkMessage(null, error),
      error,
    });
    throw error;
  }
};

/**
 * Open native PayPhi payment sheet.
 * setAppInfo = SDK login. On "server communication error 200", MID/AppId are usually
 * already stored by the AAR — still open makePayment so the payment screen can show.
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
  if (!appInfo?.merchantId) {
    throw new Error('merchantId missing');
  }

  const amount = toAmount(request.amount);
  if (!amount) {
    throw new Error('amount missing or invalid');
  }

  const creds = getPayphiCredentials();
  logPayphi('openPayment', {
    merchantId: appInfo.merchantId,
    appId: appInfo.appId,
    environment: appInfo.environment,
    merchantTxnNo: request.merchantTxnNo,
    amount,
    merchantName: appInfo.merchantName,
    hasSecretKey: Boolean(str(request.secretKey) || creds.secretKey),
    aggregatorID: str(request.aggregatorID) || creds.aggregatorID,
  });

  await waitForUi();

  let loginSoftContinued = false;
  try {
    await setAppInfo(appInfo);
  } catch (initError: any) {
    const code = str(initError?.code);
    const msg = sdkMessage(null, initError);

    logIciciLoginReport('2) LOGIN FAILED — setAppInfo /merapp/login', {
      step: 'setAppInfo FAILED',
      environment: sdkEnv(appInfo.environment),
      merchantId: appInfo.merchantId,
      appId: appInfo.appId,
      errorCode: code,
      errorMessage: msg,
      askIcici:
        'Confirm Customer App SDK enabled on INT, App ID (may differ from MID), whitelist package com.ayurmuniecosystem + debug SHA1',
    });

    if (!isSoftLoginFailure(initError)) {
      throw initError;
    }

    // Retry once on QA if INT returned the known 200 business error
    if (sdkEnv(appInfo.environment) === 'INT') {
      try {
        logPayphi('setAppInfo retry on QA after INT login error');
        await setAppInfo({ ...appInfo, environment: 'QA' });
        logPayphi('setAppInfo OK on QA retry');
      } catch (qaError: any) {
        if (!isSoftLoginFailure(qaError)) {
          throw qaError;
        }
        loginSoftContinued = true;
        logPayphi('soft-continue after login fail — opening makePayment sheet', {
          intCode: code,
          qaCode: str(qaError?.code),
          qaMessage: sdkMessage(null, qaError),
        });
      }
    } else {
      loginSoftContinued = true;
      logPayphi('soft-continue after login fail — opening makePayment sheet', {
        code,
        message: msg,
      });
    }
  }

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
      logPayphi('payment_response', {
        status: result.status,
        gatewayOrderId: result.gatewayOrderId,
        message: result.message,
      });
      resolve(result);
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
      logPayphi('payment timeout', { merchantTxnNo: request.merchantTxnNo });
      finish({
        status: 'pending',
        raw: { timeout: true },
        gatewayOrderId: str(request.merchantTxnNo),
        gatewayPaymentId: '',
        gatewaySignature: '',
        message: '',
      });
    }, timeoutMs);

    try {
      const secretKey = str(request.secretKey) || creds.secretKey;
      const secureToken = str(request.secureToken);

      const payload: Record<string, string> = {
        amount,
        merchantId: str(request.merchantId),
        merchantTxnNo: str(request.merchantTxnNo),
        currencyCode: str(request.currencyCode) || '356',
        customerEmailID: str(request.customerEmailID),
        customerMobileNo: str(request.customerMobileNo),
        customerName: str(request.customerName),
        addlParam1: str(request.addlParam1),
        addlParam2: str(request.addlParam2),
        aggregatorID: str(request.aggregatorID) || creds.aggregatorID,
        apiVersion: str(request.apiVersion) || '1.0',
        transactionType: str(request.transactionType) || 'SALE',
        payType: str(request.payType) || '0',
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
          'ICICI PayPhi needs secretKey (UAT Key) or secureToken to open SDK',
        );
      }

      logPayphi('makePayment', {
        amount: payload.amount,
        merchantId: payload.merchantId,
        merchantTxnNo: payload.merchantTxnNo,
        aggregatorID: payload.aggregatorID,
        hasSecretKey: Boolean(secretKey),
        hasSecureToken: Boolean(secureToken),
        loginSoftContinued,
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

/** Verify-payment body for consult / order APIs. */
/** Consult verify-payment: payment_id, gateway_order_id, gateway_payment_id, gateway_signature */
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
): string =>
  str(paymentData?.icici?.merchantTxnNo) ||
  str(paymentData?.gateway_order_id) ||
  str(sdkGatewayOrderId);
