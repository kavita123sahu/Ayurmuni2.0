/**
 * Cashfree client config.
 *
 * Create Order: Django (book-slot) returns payment_session_id + gateway_order_id.
 * After pay: app calls Cashfree Get Payments (needs APP_SECRET) to get cf_payment_id
 * for verify-payment — same as when verify worked earlier.
 *
 * APP_SECRET lives in gitignored `cashfree.local.ts` (not committed).
 */

export type CashfreeEnvMode = 'SANDBOX' | 'PRODUCTION';

export type CashfreeClientConfig = {
  appId: string;
  /** Sandbox Get Payments only — from cashfree.local.ts */
  appSecret: string;
  environment: CashfreeEnvMode;
};

export const CASHFREE_ENVIRONMENT: CashfreeEnvMode = 'SANDBOX';

/** Public App ID (x-client-id). */
export const CASHFREE_APP_ID =
  'TEST11316999e2fd8b8aca2f940e69d699961311';

const loadLocalAppSecret = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const local = require('./cashfree.local');
    return String(local?.CASHFREE_APP_SECRET ?? '').trim();
  } catch {
    return '';
  }
};

export const getCashfreeCredentials = (): CashfreeClientConfig => ({
  appId: CASHFREE_APP_ID,
  appSecret: loadLocalAppSecret(),
  environment: CASHFREE_ENVIRONMENT,
});

/** Client Create Order stays off — book-slot creates the Cashfree order. */
export const CASHFREE_ALLOW_CLIENT_CREATE_ORDER = false;

export const CASHFREE_ALLOWED_PAYMENT_METHODS =
  'cc,dc,nb,upi,app,emi,paylater';
