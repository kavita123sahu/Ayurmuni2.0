/**
 * Order API payloads — COD & prepaid (online).
 * Match backend Postman contract:
 *
 * {
 *   delivery_address_id,
 *   payment_type: "cod" | "prepaid",
 *   shipping_method: "STD",
 *   shipping_charges,
 *   cod_charges,
 *   prepaid_amount,
 *   coupon_code?,              // optional
 *   cart_item_ids: [],
 *   gift_wrap_item_ids: []
 * }
 *
 * COD also sends payment_method: "cash".
 * Do NOT send coupon_discount on place-order (server computes it).
 */

export type OrderCartLine = {
  id?: string | number;
  cart_item_id?: string | number;
  variant_id?: string | number;
  gift_wrap?: boolean;
  is_gift_wrap?: boolean;
};

export type OrderPayload = {
  delivery_address_id: string | number;
  payment_type: 'cod' | 'prepaid';
  payment_method?: string;
  shipping_method: 'STD' | 'EXPRESS';
  shipping_charges: number;
  cod_charges: number;
  prepaid_amount: number;
  cart_item_ids: string[];
  gift_wrap_item_ids: string[];
  coupon_code?: string;
};

const hasOrderEntity = (response: any): boolean => {
  const data = response?.data;
  const order = data?.order ?? data;
  return Boolean(
    order?.id ||
      order?.order_id ||
      order?.order_number ||
      order?.order_code ||
      data?.order_id ||
      data?.order_number ||
      data?.order_code ||
      response?.order_id ||
      response?.order_code,
  );
};

const getResponseMessage = (response: any): string =>
  String(
    response?.message ??
      response?.data?.message ??
      response?.error ??
      response?.detail ??
      '',
  ).toLowerCase();

const isFulfillmentNoise = (msg: string): boolean =>
  msg.includes('out of stock') ||
  msg.includes('sku') ||
  msg.includes('insufficient') ||
  msg.includes('unicommerce') ||
  msg.includes('uni-commerce') ||
  msg.includes('fulfillment') ||
  msg.includes('inventory') ||
  msg.includes('warehouse') ||
  msg.includes('sync') ||
  msg.includes('channel item') ||
  msg.includes('facility') ||
  msg.includes('allocation');

const isHardPaymentFailure = (msg: string): boolean =>
  msg.includes('signature') ||
  msg.includes('invalid payment') ||
  msg.includes('payment failed') ||
  msg.includes('authentication failed') ||
  msg.includes('unauthorized') ||
  msg.includes('not verified');

/**
 * After place/verify — treat as success if order was created,
 * even when Unicommerce / stock sync returns an error message.
 * Unicommerce errors are handled server-side; user should still see confirmation.
 */
export const isOrderVerifySuccessful = (response: any): boolean => {
  if (!response || typeof response !== 'object') return false;
  if (response.success === true || response.status === true) return true;
  // Some APIs use success: "true" / 1
  if (response.success === 'true' || response.success === 1) return true;

  if (hasOrderEntity(response)) return true;

  const data = response.data ?? {};
  const msg = getResponseMessage(response);
  const paidLike =
    data?.payment_id ||
    data?.razorpay_payment_id ||
    data?.status === 'paid' ||
    data?.payment_status === 'paid' ||
    data?.payment_status === 'success' ||
    data?.order_status ||
    data?.verified === true ||
    response?.payment_id ||
    response?.payment_status === 'paid';

  // Paid / placed with fulfillment noise — still confirm for the user
  if (isFulfillmentNoise(msg) && (paidLike || hasOrderEntity(response))) {
    return true;
  }

  // success:false but only Unicommerce/stock noise (order already created server-side)
  if (response.success === false && isFulfillmentNoise(msg) && !isHardPaymentFailure(msg)) {
    return true;
  }

  return false;
};

/**
 * After Razorpay charge succeeds — confirm unless verify is a hard payment failure.
 * Covers verify responses that omit order entity but still create the order.
 */
export const isPrepaidVerifyAcceptable = (
  response: any,
  razorpayResult?: any,
): boolean => {
  if (isOrderVerifySuccessful(response)) return true;

  const razorpayPaid = Boolean(razorpayResult?.razorpay_payment_id);
  if (!razorpayPaid) return false;

  const msg = getResponseMessage(response);
  if (isHardPaymentFailure(msg)) return false;

  // Money already collected — soft/fulfillment errors should not block confirmation
  return true;
};

export const getVerifiedOrderResult = (response: any) =>
  response?.data?.order ??
  (response?.data?.id ||
  response?.data?.order_code ||
  response?.data?.order_number ||
  response?.data?.order_id
    ? response.data
    : null) ??
  response?.order ??
  null;

/** Prefer cart line id (`item.id`); never fall back to variant_id. */
export const getCartItemId = (item: OrderCartLine): string | null => {
  const id = item?.cart_item_id ?? item?.id ?? null;
  if (id == null || String(id).trim() === '') return null;
  // Guard: if caller accidentally passed variant as id and also has variant_id equal, still OK —
  // but never substitute variant_id when cart id is missing.
  return String(id);
};

export const buildCartItemIds = (items: OrderCartLine[] = []): string[] =>
  items.map(getCartItemId).filter((id): id is string => Boolean(id));

/** Always an array — [] when no gift wrap */
export const buildGiftWrapItemIds = (items: OrderCartLine[] = []): string[] =>
  items
    .filter(item => Boolean(item?.gift_wrap || item?.is_gift_wrap))
    .map(getCartItemId)
    .filter((id): id is string => Boolean(id));

/**
 * Method the user selected in Razorpay checkout (SDK success event).
 * Passes through as-is — no static default like "upi".
 */
export const getRazorpayPaymentMethod = (
  razorpayResult?: any,
): string | null => {
  if (!razorpayResult || typeof razorpayResult !== 'object') {
    return null;
  }

  // Some SDK builds stringify the payload
  let data = razorpayResult;
  if (typeof razorpayResult === 'string') {
    try {
      data = JSON.parse(razorpayResult);
    } catch {
      return null;
    }
  }

  const candidates = [
    data.method,
    data.payment_method,
    data.razorpay_payment_method,
    data.wallet,
    data.data?.method,
    data.payload?.method,
  ];

  for (const value of candidates) {
    if (value != null && String(value).trim() !== '') {
      return String(value).trim().toLowerCase();
    }
  }

  return null;
};

/** @deprecated alias */
export const resolveRazorpayPaymentMethod = getRazorpayPaymentMethod;

type CommonArgs = {
  delivery_address_id: string | number;
  cartItems: OrderCartLine[];
  shipping_charges?: number;
  cod_charges?: number;
  shipping_method?: 'STD' | 'EXPRESS';
  /** Final payable total (after coupon if applied) — always sent on place-order */
  prepaid_amount?: number;
  coupon_code?: string;
};

const withCouponFields = (
  payload: OrderPayload,
  args: { coupon_code?: string },
): OrderPayload => {
  const code = String(args.coupon_code || '').trim().toUpperCase();
  if (code) {
    payload.coupon_code = code;
  }
  return payload;
};

/** Complete COD order payload */
export const buildCodOrderPayload = ({
  delivery_address_id,
  cartItems,
  shipping_charges = 0,
  cod_charges = 0,
  shipping_method = 'STD',
  prepaid_amount = 0,
  coupon_code,
}: CommonArgs): OrderPayload =>
  withCouponFields(
    {
      delivery_address_id,
      payment_type: 'cod',
      payment_method: 'cash',
      shipping_method,
      shipping_charges: Number(shipping_charges) || 0,
      cod_charges: Number(cod_charges) || 0,
      prepaid_amount: Math.max(0, Math.round(Number(prepaid_amount) || 0)),
      cart_item_ids: buildCartItemIds(cartItems),
      gift_wrap_item_ids: buildGiftWrapItemIds(cartItems),
    },
    { coupon_code },
  );

type PrepaidArgs = CommonArgs & {
  prepaid_amount: number;
  /**
   * From Razorpay event after user picks UPI / card / wallet / etc.
   * Omit when creating the Razorpay order (before user pays).
   */
  payment_method?: string | null;
};

/**
 * Complete prepaid / online order payload.
 * Do not send payment_method on create — Razorpay sets the method after pay.
 */
export const buildPrepaidOrderPayload = ({
  delivery_address_id,
  cartItems,
  shipping_charges = 0,
  cod_charges = 0,
  shipping_method = 'STD',
  prepaid_amount,
  coupon_code,
}: PrepaidArgs): OrderPayload => {
  // Intentionally ignore payment_method for place-order (online).
  return withCouponFields(
    {
      delivery_address_id,
      payment_type: 'prepaid',
      shipping_method,
      shipping_charges: Number(shipping_charges) || 0,
      cod_charges: Number(cod_charges) || 0,
      prepaid_amount: Math.max(0, Math.round(Number(prepaid_amount) || 0)),
      cart_item_ids: buildCartItemIds(cartItems),
      gift_wrap_item_ids: buildGiftWrapItemIds(cartItems),
    },
    { coupon_code },
  );
};

/** Unified builder used by hooks */
export const buildOrderPayload = (args: {
  delivery_address_id: string | number;
  cartItems: OrderCartLine[];
  shipping_charges?: number;
  cod_charges?: number;
  prepaid_amount?: number;
  shipping_method?: 'STD' | 'EXPRESS';
  mode: 'cod' | 'prepaid';
  payment_method?: string | null;
  coupon_code?: string;
}): OrderPayload => {
  if (args.mode === 'cod') {
    return buildCodOrderPayload(args);
  }
  return buildPrepaidOrderPayload({
    ...args,
    prepaid_amount: args.prepaid_amount ?? 0,
    payment_method: args.payment_method,
  });
};
