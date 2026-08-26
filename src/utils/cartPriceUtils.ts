const toPositiveNumber = (value: unknown): number | null => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
};

/** Unit MRP for a cart line (display only). */
export const resolveCartItemMrp = (item: any): number => {
  if (!item || typeof item !== 'object') {
    return 0;
  }
  return (
    toPositiveNumber(item.variant?.mrp) ??
    toPositiveNumber(item.mrp) ??
    toPositiveNumber(item.medicine?.mrp) ??
    toPositiveNumber(item.product?.mrp) ??
    0
  );
};

/** Unit selling price for a cart line — never prefer MRP over selling_price. */
export const resolveCartItemSellingPrice = (item: any): number => {
  if (!item || typeof item !== 'object') {
    return 0;
  }

  const directCandidates = [
    item.variant?.selling_price,
    item.selling_price,
    item.variant?.unit_selling_price,
    item.unit_selling_price,
    item.unit_price,
    item.medicine?.selling_price,
    item.product?.selling_price,
    item.variant?.price,
  ];

  for (const candidate of directCandidates) {
    const parsed = toPositiveNumber(candidate);
    if (parsed != null) {
      return parsed;
    }
  }

  const mrp = resolveCartItemMrp(item);
  const qty = Math.max(1, Number(item.quantity) || 1);
  const price = toPositiveNumber(item.price);

  if (price == null) {
    // Last resort: use MRP only if nothing else exists (still show an amount).
    return mrp > 0 ? mrp : 0;
  }

  // API sometimes returns line total in `price`.
  if (qty > 1) {
    const perUnit = price / qty;
    if (perUnit > 0 && (mrp <= 0 || perUnit <= mrp)) {
      return perUnit;
    }
  }

  // When price is below MRP it is clearly the selling price.
  if (mrp > 0 && price < mrp) {
    return price;
  }

  // Same as MRP or no MRP — still use price so totals never go blank.
  return price;
};

/** Keep cart line `price` aligned with unit selling price after API merges. */
export const normalizeCartLineItem = (item: any): any => {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const sellingPrice = resolveCartItemSellingPrice(item);
  const mrp = resolveCartItemMrp(item);
  const variant = item.variant
    ? {
        ...item.variant,
        ...(sellingPrice > 0 ? { selling_price: sellingPrice } : {}),
        ...(mrp > 0 ? { mrp } : {}),
      }
    : item.variant;

  return {
    ...item,
    ...(variant ? { variant } : {}),
    ...(mrp > 0 ? { mrp } : {}),
    ...(sellingPrice > 0
      ? { selling_price: sellingPrice, price: sellingPrice }
      : {}),
  };
};

/**
 * Merge API cart item onto an existing line without letting MRP overwrite selling price.
 */
export const mergeCartLineWithApiItem = (
  existing: any,
  cartItemFromApi: any | null | undefined,
  quantity: number,
  variantId: string,
): any => {
  const existingSelling = resolveCartItemSellingPrice(existing);
  const apiSelling = cartItemFromApi
    ? resolveCartItemSellingPrice(cartItemFromApi)
    : 0;
  const sellingPrice = apiSelling > 0 ? apiSelling : existingSelling;
  const mrp =
    resolveCartItemMrp(cartItemFromApi) || resolveCartItemMrp(existing);

  const merged = {
    ...existing,
    ...(cartItemFromApi ?? {}),
    id: cartItemFromApi?.id ?? existing?.id,
    quantity: Number(cartItemFromApi?.quantity ?? quantity),
    variant_id:
      String(
        cartItemFromApi?.variant_id ??
          cartItemFromApi?.variant?.variant_id ??
          existing?.variant_id ??
          existing?.variant?.variant_id ??
          variantId,
      ) || variantId,
    variant: {
      ...(existing?.variant ?? {}),
      ...(cartItemFromApi?.variant ?? {}),
      ...(sellingPrice > 0 ? { selling_price: sellingPrice } : {}),
      ...(mrp > 0 ? { mrp } : {}),
    },
    ...(sellingPrice > 0
      ? { selling_price: sellingPrice, price: sellingPrice }
      : {}),
    ...(mrp > 0 ? { mrp } : {}),
  };

  return normalizeCartLineItem(merged);
};

export const computeCartItemsSubtotal = (items: any[]): number =>
  (items ?? []).reduce((sum, item) => {
    const unit = resolveCartItemSellingPrice(item);
    const qty = Number(item?.quantity) || 0;
    return sum + unit * qty;
  }, 0);
