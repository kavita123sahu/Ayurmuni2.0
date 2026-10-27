import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PayphiSdk } = NativeModules;

let payphiEmitter = null;
const getEmitter = () => {
  if (!PayphiSdk) return null;
  if (!payphiEmitter) {
    payphiEmitter = new NativeEventEmitter(PayphiSdk);
  }
  return payphiEmitter;
};

/** Drop null/undefined — New Arch rejects them as Invalid Parameter. */
const cleanStringMap = (input = {}) => {
  const out = {};
  Object.keys(input || {}).forEach(key => {
    const value = input[key];
    if (value === undefined || value === null) return;
    if (typeof value === 'object') return;
    const asString = String(value).trim();
    if (asString === '') return;
    out[key] = asString;
  });
  return out;
};

const formatAmount = raw => {
  if (raw === undefined || raw === null || raw === '') return '';
  const cleaned = String(raw)
    .replace(/,/g, '')
    .replace(/₹/g, '')
    .replace(/rs\.?/gi, '')
    .trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toFixed(2);
};

const assertNative = () => {
  if (!PayphiSdk) {
    throw new Error(
      `The package 'react-native-payphi-sdk' doesn't seem to be linked. Make sure: \n\n` +
        Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
        '- You rebuilt the app after installing the package\n',
    );
  }
};

export default {
  getPlatformVersion: async () => `${Platform.OS} ${Platform.Version}`,

  isLinked: () => Boolean(PayphiSdk),

  setAppInfo: async (environment, merchantId, appId, merchantName = '') => {
    assertNative();
    return PayphiSdk.setAppInfo(
      cleanStringMap({
        environment: environment || 'INT',
        merchantId,
        appId: appId || merchantId,
        merchantName: merchantName || 'Ayurmuni',
      }),
    );
  },

  makePayment: (payload = {}) => {
    assertNative();

    const amount = formatAmount(payload.amount);
    if (!amount) {
      console.warn('[PAYPHI] makePayment blocked: invalid amount', payload.amount);
      return;
    }

    const secureToken = payload.secureToken || payload.SecureToken || '';
    const secretKey = payload.secretKey || payload.secret_key || '';

    const nativePayload = cleanStringMap({
      amount,
      merchantId: payload.merchantId,
      merchantTxnNo: payload.merchantTxnNo,
      currencyCode: payload.currencyCode || '356',
      customerEmailID: payload.customerEmailID,
      customerMobileNo: payload.customerMobileNo,
      customerName: payload.customerName,
      aggregatorID: payload.aggregatorID || payload.aggregatorId,
      addlParam1: payload.addlParam1 || '',
      addlParam2: payload.addlParam2 || '',
      apiVersion: payload.apiVersion || '4',
      ...(secureToken ? { secureToken: String(secureToken) } : {}),
      ...(secretKey ? { secretKey: String(secretKey) } : {}),
    });

    console.warn('[PAYPHI] makePayment bridge =>', {
      ...nativePayload,
      secretKey: nativePayload.secretKey ? '[set]' : undefined,
      secureToken: nativePayload.secureToken ? '[set]' : undefined,
    });

    PayphiSdk.makePayment(nativePayload);
  },

  addPaymentResponseListener: callback => {
    const emitter = getEmitter();
    if (!emitter) return { remove: () => {} };
    return emitter.addListener('payment_response', event => {
      try {
        callback(typeof event === 'string' ? JSON.parse(event) : event);
      } catch {
        callback(event);
      }
    });
  },
};
