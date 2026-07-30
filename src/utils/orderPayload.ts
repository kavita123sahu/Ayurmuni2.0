/**
 * Order API payloads — COD & prepaid (online).
 *
 * COD:
 * {
 *   delivery_address_id, payment_type: "cod", payment_method: "cash",
 *   shipping_method, shipping_charges, cod_charges, prepaid_amount: 0,
 *   cart_item_ids: [], gift_wrap_item_ids: []
 * }
 *
 * Prepaid (online):
 * {
 *   delivery_address_id, payment_type: "prepaid",
 *   payment_method: <from Razorpay SDK — upi|card|wallet|netbanking|…>,
 *   shipping_method, shipping_charges, cod_charges, prepaid_amount,
 *   cart_item_ids: [], gift_wrap_item_ids: []
 * }
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
};

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
};

/** Complete COD order payload */
export const buildCodOrderPayload = ({
  delivery_address_id,
  cartItems,
  shipping_charges = 0,
  cod_charges = 0,
  shipping_method = 'STD',
}: CommonArgs): OrderPayload => ({
  delivery_address_id,
  payment_type: 'cod',
  payment_method: 'cash',
  shipping_method,
  shipping_charges: Number(shipping_charges) || 0,
  cod_charges: Number(cod_charges) || 0,
  prepaid_amount: 0,
  cart_item_ids: buildCartItemIds(cartItems),
  gift_wrap_item_ids: buildGiftWrapItemIds(cartItems),
});

type PrepaidArgs = CommonArgs & {
  prepaid_amount: number;
  /**
   * From Razorpay event after user picks UPI / card / wallet / etc.
   * Omit when creating the Razorpay order (before user pays).
   */
  payment_method?: string | null;
};

/** Complete prepaid / online order payload */
export const buildPrepaidOrderPayload = ({
  delivery_address_id,
  cartItems,
  shipping_charges = 0,
  cod_charges = 0,
  shipping_method = 'STD',
  prepaid_amount,
  payment_method,
}: PrepaidArgs): OrderPayload => {
  const payload: OrderPayload = {
    delivery_address_id,
    payment_type: 'prepaid',
    shipping_method,
    shipping_charges: Number(shipping_charges) || 0,
    cod_charges: Number(cod_charges) || 0,
    prepaid_amount: Number(prepaid_amount) || 0,
    cart_item_ids: buildCartItemIds(cartItems),
    gift_wrap_item_ids: buildGiftWrapItemIds(cartItems),
  };

  if (payment_method != null && String(payment_method).trim() !== '') {
    payload.payment_method = String(payment_method).trim().toLowerCase();
  }

  return payload;
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
