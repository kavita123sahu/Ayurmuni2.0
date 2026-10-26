/**
 * Cashfree Payments — client-safe config only.
 *
 * Mobile SDK needs from Django Create Order:
 *   - payment_session_id
 *   - order_id
 * Plus local env: SANDBOX | PRODUCTION
 *
 * Never put CASHFREE_APP_SECRET / x-client-secret in this app.
 * Create Order + Get Payments stay on the Django backend.
 */

export type CashfreeEnvMode = 'SANDBOX' | 'PRODUCTION';

export type CashfreeClientConfig = {
  /** Public client id (optional; SDK checkout uses session from backend). */
  appId: string;
  environment: CashfreeEnvMode;
};

/** Flip to PRODUCTION when Django serves live Cashfree sessions. */
export const CASHFREE_ENVIRONMENT: CashfreeEnvMode = 'SANDBOX';

/**
 * Optional public App ID for logs / future SDK helpers.
 * Leave empty if unused — never add the secret here.
 */
export const CASHFREE_APP_ID = '';

export const getCashfreeCredentials = (): CashfreeClientConfig => ({
  appId: CASHFREE_APP_ID,
  environment: CASHFREE_ENVIRONMENT,
});

/** Client must never Create Order — secret lives on Django. */
export const CASHFREE_ALLOW_CLIENT_CREATE_ORDER = false;

/**
 * Preferred methods when Django sets order_meta.payment_methods.
 * UPI = Intent + Dynamic QR (Collect deprecated). Never use CFUPI Collect.
 * Codes: cc,dc | nb | upi | app | emi | paylater
 */
export const CASHFREE_ALLOWED_PAYMENT_METHODS =
  'cc,dc,nb,upi,app,emi,paylater';
