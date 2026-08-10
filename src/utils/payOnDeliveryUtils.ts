/**
 * Normalize API pay_on_delivery flags.
 * Boolean("false") is true in JS — so string "false" must be handled explicitly.
 */
export const isPayOnDeliveryEnabled = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null) return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes'
    ) {
      return true;
    }
    return false;
  }

  return false;
};

/** Read COD flag from cart line / variant / product shapes. */
export const resolvePayOnDelivery = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;

  return isPayOnDeliveryEnabled(
    item.pay_on_delivery ??
      item.is_pay_on_delivery ??
      item.variant?.pay_on_delivery ??
      item.variant?.is_pay_on_delivery ??
      item.product?.pay_on_delivery ??
      item.selectedVariant?.pay_on_delivery,
  );
};
