import { BaseUrl } from '../config/Key';
import { normalizeGateway, type PaymentGateway } from '../config/paymentGateways';

/** Pine Labs (Plural) hosted checkout details from book-slot / retry. */
export type PineLabsCheckout = {
  paymentId: string;
  orderId: string;
  redirectUrl: string;
  /** Where Pine Labs returns after payment; reaching it closes the WebView. */
  returnUrl: string;
};

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (value == null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return '';
};

/**
 * Which gateway the backend created the order on.
 * Falls back to the requested gateway, then to the presence of gateway-specific fields.
 */
export const resolveOrderGateway = (data: any, requested: PaymentGateway): PaymentGateway => {
  const explicit = normalizeGateway(
    data?.gateway ?? data?.payment_gateway ?? data?.gateway_name ?? data?.provider,
  );
  if (explicit) return explicit;
  if (data?.razorpay_order_id) return 'razorpay';
  if (getPineLabsRedirectUrl(data)) return 'pinelabs';
  return requested;
};

const getPineLabsRedirectUrl = (data: any): string => {
  const checkout = data?.checkout ?? data?.pinelabs ?? data?.gateway_data ?? {};
  return pickString(
    data?.redirect_url,
    data?.checkout_url,
    data?.payment_url,
    data?.pinelabs_redirect_url,
    data?.challenge_url,
    checkout?.redirect_url,
    checkout?.checkout_url,
    checkout?.payment_url,
  );
};

/** Order id used by verify-payment as `gateway_order_id`. */
export const getGatewayOrderId = (data: any, gateway: PaymentGateway): string => {
  const checkout = data?.checkout ?? data?.pinelabs ?? data?.gateway_data ?? {};
  return gateway === 'razorpay'
    ? pickString(data?.razorpay_order_id, data?.gateway_order_id, data?.order_id)
    : pickString(
        data?.gateway_order_id,
        data?.pinelabs_order_id,
        checkout?.order_id,
        checkout?.gateway_order_id,
        data?.order_id,
      );
};

/** True when book-slot created a gateway order that still needs to be paid. */
export const hasGatewayOrder = (data: any): boolean =>
  !!(
    data?.razorpay_order_id ||
    data?.gateway_order_id ||
    data?.pinelabs_order_id ||
    getPineLabsRedirectUrl(data)
  );

export const parsePineLabsCheckout = (data: any): PineLabsCheckout => {
  const checkout = data?.checkout ?? data?.pinelabs ?? data?.gateway_data ?? {};
  return {
    paymentId: pickString(data?.payment_id, data?.payment?.id, checkout?.payment_id),
    orderId: getGatewayOrderId(data, 'pinelabs'),
    redirectUrl: getPineLabsRedirectUrl(data),
    returnUrl: pickString(
      data?.callback_url,
      data?.return_url,
      data?.redirect_back_url,
      checkout?.callback_url,
      checkout?.return_url,
    ),
  };
};

const PINELABS_HOST_RE = /(pinelabs|pluralpay|pluralonline|pinepg)\./i;
const RETURN_PATH_RE =
  /(payment[-_]?(status|success|failure|failed|cancel|callback|result|complete))|(\/callback)|(\/return)|(pinelabs\/(success|failure|return|callback))/i;

/** Pine Labs' own result pages (when no merchant callback is configured). */
const PINELABS_RESULT_PATH_RE =
  /\/(status|result|response|success|failure|failed|payment[-_]?(success|failure|failed|status|result)|order[-_]?status|complete|thank[-_]?you)(\/|\?|#|$)/i;

const hostOf = (url: string) => {
  const match = /^[a-z]+:\/\/([^/?#]+)/i.exec(url);
  return match ? match[1].toLowerCase() : '';
};

export const isPineLabsHostUrl = (url: string) => PINELABS_HOST_RE.test(hostOf(url));

/** Rough read of Pine Labs' result page text. */
export const readPineLabsStatusText = (text: string): 'success' | 'failed' | 'unknown' => {
  const t = text.toLowerCase();
  if (/(fail|declin|unsuccess|cancel|rejected|error)/.test(t)) return 'failed';
  if (/(success|successful|paid|completed|approved|processed)/.test(t)) return 'success';
  return 'unknown';
};

/** `/status` from `https://host/status?x=1#y` — query and hash excluded. */
const pathOf = (url: string) => {
  const match = /^[a-z]+:\/\/[^/?#]+([^?#]*)/i.exec(url);
  return match?.[1] || '/';
};

/**
 * Pine Labs finished and is sending the user back (to the backend callback / app return page).
 * Bank 3-D Secure pages are on other hosts, so only explicit return URLs or our own backend count.
 */
export const isPineLabsReturnUrl = (url: string, returnUrl?: string): boolean => {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  if (returnUrl && url.startsWith(returnUrl)) return true;
  const host = hostOf(url);
  if (PINELABS_HOST_RE.test(host)) return PINELABS_RESULT_PATH_RE.test(pathOf(url));
  if (host && host === hostOf(BaseUrl.base_url)) return true;
  return RETURN_PATH_RE.test(url);
};
