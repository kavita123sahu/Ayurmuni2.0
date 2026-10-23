/**
 * ICICI PayPhi credentials (Customer SDK + hosted authRedirect).
 *
 * Native SDK needs: merchantId, appId, secretKey, aggregatorID, environment=INT
 * Package to whitelist: com.ayurmuniecosystem
 *
 * If ICICI gives a different App ID than MID, update `appId` only.
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
  appId: '100000000007164',
  secretKey: 'db06cca0-838b-4e01-8b20-6ac446ffb6bd',
  aggregatorID: 'A100000000007164',
  environment: 'INT',
  authRedirectBase:
    'https://pgpayuat.icici.bank.in/tsp/pg/api/v2/authRedirect',
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
