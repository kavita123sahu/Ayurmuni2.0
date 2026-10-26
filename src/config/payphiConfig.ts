/**
 * ICICI PayPhi credentials (Customer SDK + hosted authRedirect).
 *
 * setAppInfo (SDK login /merapp/login) uses ONLY:
 *   merchantId, appId, environment (INT)
 * makePayment (payment sheet HMAC) uses:
 *   secretKey + aggregatorID + merchantTxnNo + amount + …
 *
 * Package to whitelist with ICICI: com.ayurmuniecosystem
 * Debug SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
 *
 * If ICICI issues a Customer App ID different from MID, set `appId` only.
 */

export type PayphiCredentialSet = {
  merchantId: string;
  appId: string;
  secretKey: string;
  aggregatorID: string;
  /** Native SDK: INT | QA | PREPROD | PROD | dev — never "UAT" */
  environment: 'INT' | 'QA' | 'PREPROD' | 'PROD' | 'dev';
  authRedirectBase: string;
};

export const PAYPHI_UAT: PayphiCredentialSet = {
  merchantId: '100000000007164',
  // Same as MID until ICICI confirms a separate Customer App ID
  appId: '100000000007164',
  secretKey: 'db06cca0-838b-4e01-8b20-6ac446ffb6bd',
  aggregatorID: 'A100000000007164',
  environment: 'INT',
  authRedirectBase:
    'https://pgpayuat.icicibank.com/tsp/pg/api/v2/authRedirect',
};

export const PAYPHI_PROD: PayphiCredentialSet = {
  merchantId: '',
  appId: '',
  secretKey: '',
  aggregatorID: '',
  environment: 'PROD',
  authRedirectBase:
    'https://secure-ptg.phicommerce.com/pg/api/v2/authRedirect',
};

export const getPayphiCredentials = (): PayphiCredentialSet => {
  if (PAYPHI_PROD.merchantId && PAYPHI_PROD.secretKey) {
    return PAYPHI_PROD;
  }
  return PAYPHI_UAT;
};
