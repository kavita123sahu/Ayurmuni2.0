import { BaseUrl } from '../config/Key';
import { parsePaymentGateway, type PaymentGateway } from '../config/paymentGateways';

/** Pine Labs hosted checkout from book-slot / place-order. */
export type PineLabsCheckout = {
  paymentId: string;
  orderId: string;
  redirectUrl: string;
  returnUrl: string;
};

const str = (value: unknown): string => {
  if (value == null) return '';
  return String(value).trim();
};

/**
 * Checkout gateway = what the user selected.
 * Never override with response.gateway (retry can return a stale ICICI order).
 */
export const resolveOrderGateway = (
  _data: any,
  requested: PaymentGateway,
): PaymentGateway => requested;

const getPineLabsRedirectUrl = (data: any): string => {
  const checkout = data?.checkout ?? {};
  return (
    str(data?.redirect_url) ||
    str(data?.checkout_url) ||
    str(checkout?.redirect_url) ||
    str(checkout?.checkout_url)
  );
};

/** Order id for verify-payment `gateway_order_id`. */
export const getGatewayOrderId = (
  data: any,
  gateway: PaymentGateway,
): string => {
  if (gateway === 'razorpay') {
    return str(data?.razorpay_order_id) || str(data?.gateway_order_id);
  }
  if (gateway === 'icici') {
    return (
      str(data?.gateway_order_id) ||
      str(data?.icici?.merchantTxnNo) ||
      str(data?.invoice_no)
    );
  }
  const checkout = data?.checkout ?? {};
  return (
    str(data?.gateway_order_id) ||
    str(checkout?.order_id) ||
    str(data?.order_id)
  );
};

export const hasGatewayOrder = (data: any): boolean =>
  Boolean(
    data?.razorpay_order_id ||
      data?.gateway_order_id ||
      data?.invoice_no ||
      data?.icici ||
      getPineLabsRedirectUrl(data),
  );

export const parsePineLabsCheckout = (data: any): PineLabsCheckout => {
  const checkout = data?.checkout ?? {};
  return {
    paymentId: str(data?.payment_id) || str(checkout?.payment_id),
    orderId: getGatewayOrderId(data, 'pinelabs'),
    redirectUrl: getPineLabsRedirectUrl(data),
    returnUrl: str(data?.return_url) || str(data?.callback_url) || str(checkout?.return_url),
  };
};

const PINELABS_HOST_RE = /(pinelabs|pluralpay|pluralonline|pinepg)\./i;
const RETURN_PATH_RE =
  /(payment[-_]?(status|success|failure|failed|cancel|callback|result|complete))|(\/callback)|(\/return)/i;
const PINELABS_RESULT_PATH_RE =
  /\/(status|result|response|success|failure|failed|payment[-_]?(success|failure|status)|complete)(\/|\?|#|$)/i;

const hostOf = (url: string) => {
  const match = /^[a-z]+:\/\/([^/?#]+)/i.exec(url);
  return match ? match[1].toLowerCase() : '';
};

const pathOf = (url: string) => {
  const match = /^[a-z]+:\/\/[^/?#]+([^?#]*)/i.exec(url);
  return match?.[1] || '/';
};

export const isPineLabsHostUrl = (url: string) =>
  PINELABS_HOST_RE.test(hostOf(url));

export const readPineLabsStatusText = (
  text: string,
): 'success' | 'failed' | 'unknown' => {
  const t = text.toLowerCase();
  if (/(fail|declin|unsuccess|cancel|rejected|error)/.test(t)) return 'failed';
  if (/(success|successful|paid|completed|approved)/.test(t)) return 'success';
  return 'unknown';
};

/** True when Pine Labs is sending the user back to our app / callback. */
export const isPineLabsReturnUrl = (url: string, returnUrl?: string): boolean => {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  if (returnUrl && url.startsWith(returnUrl)) return true;
  const host = hostOf(url);
  if (PINELABS_HOST_RE.test(host)) return PINELABS_RESULT_PATH_RE.test(pathOf(url));
  if (host && host === hostOf(BaseUrl.base_url)) return true;
  return RETURN_PATH_RE.test(url);
};
