/**
 * All third-party SDK credentials in one place.
 * Change values here only — do not scatter keys across services.
 */

export const ThirdParty = {
  /** Agora video call (react-native-agora) */
  agora: {
    appId: 'b717053bd3f14a819ffd0c7b6490f169',
  },

  /** OneSignal push */
  oneSignal: {
    appId: '5c79696d-81e8-46a7-922d-b0b08eef4e57',
  },

  /** Google Maps + Places */
  google: {
    mapsApiKey: 'AIzaSyC6Z-IW1Fr-o4eqzCxgAbjHRa7tmU31RKA',
    placesApiKey: 'AIzaSyClCQ_htPKkUayS7yWuY9kNj54gIQSnXiE',
  },

  /** Cashfree (client App ID; secret optional for Get Payments) */
  cashfree: {
    appId: 'TEST11316999e2fd8b8aca2f940e69d699961311',
    appSecret: '',
    environment: 'SANDBOX' as 'SANDBOX' | 'PRODUCTION',
    allowClientCreateOrder: false,
    allowedPaymentMethods: 'cc,dc,nb,upi,app,emi,paylater',
  },

  /** ICICI PayPhi native SDK */
  payphi: {
    merchantId: '100000000007164',
    appId: '80bc18249511f868',
    secretKey: 'db06cca0-838b-4e01-8b20-6ac446ffb6bd',
    aggregatorID: 'A100000000007164',
    environment: 'INT' as 'INT' | 'PROD',
    authRedirectBase:
      'https://pgpayuat.icicibank.com/tsp/pg/api/v2/authRedirect',
    merchantName: 'Ayurmuni',
  },
} as const;

export const getAgoraAppId = () => ThirdParty.agora.appId;

export const getOneSignalAppId = () => ThirdParty.oneSignal.appId;

export const getGoogleMapsApiKey = () => ThirdParty.google.mapsApiKey;

export const getGooglePlacesApiKey = () => ThirdParty.google.placesApiKey;

export const getCashfreeCredentials = () => {
  let appSecret = ThirdParty.cashfree.appSecret;
  if (!appSecret) {
    try {
      // Optional local override (gitignored)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const local = require('./cashfree.local');
      appSecret = String(local?.CASHFREE_APP_SECRET ?? '').trim();
    } catch {
      appSecret = '';
    }
  }
  return {
    appId: ThirdParty.cashfree.appId,
    appSecret,
    environment: ThirdParty.cashfree.environment,
  };
};

export const getPayphiCredentials = () => ({
  merchantId: ThirdParty.payphi.merchantId,
  appId: ThirdParty.payphi.appId,
  secretKey: ThirdParty.payphi.secretKey,
  aggregatorID: ThirdParty.payphi.aggregatorID,
  environment: ThirdParty.payphi.environment,
  authRedirectBase: ThirdParty.payphi.authRedirectBase,
  merchantName: ThirdParty.payphi.merchantName,
});

export type PayphiCredentialSet = ReturnType<typeof getPayphiCredentials>;
export type CashfreeClientConfig = ReturnType<typeof getCashfreeCredentials>;
