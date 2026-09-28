export type FeeRate = {
  flat: number;
  percent: number;
};

export type FeeQuoteConfig = {
  baseAmount: number;
  gst: FeeRate;
  /** True only when a positive GST amount should be shown/charged. */
  gstPresent: boolean;
  platformFee: FeeRate;
  shipping: FeeRate;
  cod: FeeRate;
  currency: string;
  durationMinutes: number | null;
  /** Coupon amount returned by the quote, when the API applied one. */
  couponDiscount: number | null;
  /** summary.items_after_discount from fee-quote response. */
  itemsAfterDiscount: number | null;
  /** Standard delivery charge before the free-delivery check. */
  deliveryCharge: number;
  freeDeliveryMinimum: number;
  items: OrderFeeItem[];
  summaryCod: number;
  /**
   * Explicit product_gst from summary (including 0).
   * null = field absent — may fall back to config/item rates.
   */
  summaryProductGst: number | null;
  /** Explicit platform_fee from summary when provided. */
  summaryPlatformFee: number | null;
  /** Actual delivery charged (delivery_amount), when provided. */
  summaryDeliveryAmount: number | null;
  /** free_delivery_applicable from summary. */
  summaryFreeDelivery: boolean | null;
  /** total_payable_amount from summary — prefer for grand total. */
  summaryTotalPayable: number | null;
  /** Delivery slabs from configurations.delivery.variation_factors. */
  variationFactors: any[];
  /** Extra free-delivery rules from configurations.delivery.free_delivery_conditions. */
  freeDeliveryConditions: any[];
  /** Coupon sent with the quote request, when known. */
  quotedCouponCode?: string;
};

export type OrderFeeItem = {
  sellingPrice: number;
  quantity: number;
  gstPercent: number;
};

export type FeeBreakdown = {
  baseAmount: number;
  discount: number;
  taxable: number;
  /** Prefer API summary.items_after_discount when present. */
  itemsAfterDiscount: number;
  gst: number;
  /** False when API had no GST — UI should hide the GST row. */
  gstPresent: boolean;
  gstRate: FeeRate;
  platformFee: number;
  platformRate: FeeRate;
  shipping: number;
  shippingRate: FeeRate;
  cod: number;
  codRate: FeeRate;
  total: number;
  deliveryCharge: number;
  freeDeliveryMinimum: number;
  freeDelivery: boolean;
  freeDeliveryNote: string;
};

const EMPTY_RATE: FeeRate = { flat: 0, percent: 0 };

export const roundMoney = (value: number) =>
  Math.round((Number(value) || 0) * 100) / 100;

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const readFeeRate = (source: any): FeeRate => ({
  flat: Math.max(
    0,
    toNumber(
      source?.flat ??
        source?.amount ??
        source?.fixed ??
        source?.value ??
        source?.fee ??
        source?.charge,
    ),
  ),
  percent: Math.max(
    0,
    toNumber(
      source?.percent ??
        source?.percentage ??
        source?.rate ??
        source?.gst_percent ??
        source?.platform_fee_percent,
    ),
  ),
});

/**
 * Configuration-driven charge.
 * Flat wins when it is set (matches fee-quote summary: gst flat 10, platform flat 30).
 * Otherwise the percent is applied to the taxable base.
 */
export const chargeFromRate = (rate: FeeRate | undefined, taxableBase: number): number => {
  const flat = rate?.flat ?? 0;
  const percent = rate?.percent ?? 0;
  if (flat > 0) return roundMoney(flat);
  if (percent > 0) return roundMoney((Math.max(0, taxableBase) * percent) / 100);
  return 0;
};

export const feeRateLabel = (prefix: string, rate: FeeRate | undefined): string => {
  if ((rate?.percent ?? 0) > 0 && !(rate?.flat && rate.flat > 0)) {
    return `${prefix} (${rate?.percent}%)`;
  }
  return prefix;
};

const firstRate = (...sources: any[]): FeeRate => {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    const rate = readFeeRate(source);
    if (rate.flat > 0 || rate.percent > 0) return rate;
  }
  return { ...EMPTY_RATE };
};

const firstPositive = (...values: unknown[]): number => {
  for (const value of values) {
    const n = toNumber(value);
    if (n > 0) return roundMoney(n);
  }
  return 0;
};

export const parseFeeQuoteConfig = (
  data: any,
  fallbackBase = 0,
  options?: { ignoreConsultationFee?: boolean },
): FeeQuoteConfig | null => {
  if (!data || typeof data !== 'object') return null;

  const config = data.configurations ?? data.configuration ?? {};
  // Prefer nested summary; otherwise summary fields may live on data itself
  const summary =
    data.summary && typeof data.summary === 'object' ? data.summary : data;

  const baseAmount = firstPositive(
    ...(options?.ignoreConsultationFee
      ? []
      : [
        config?.consultation?.global_fee,
        summary?.consultation_fee,
        summary?.taxable_consultation_fee,
        data?.consultation_fee,
      ]),
    summary?.items_after_discount,
    summary?.item_total,
    summary?.subtotal,
    summary?.order_amount,
    summary?.cart_total,
    fallbackBase,
  );

  const itemsAfterDiscountRaw =
    summary?.items_after_discount ?? data?.items_after_discount;
  const itemsAfterDiscount =
    itemsAfterDiscountRaw == null || itemsAfterDiscountRaw === ''
      ? null
      : roundMoney(toNumber(itemsAfterDiscountRaw));

  const gst = firstRate(
    config?.gst,
    data?.gst_percent != null || data?.gst_amount != null
      ? { flat: data?.gst_amount, percent: data?.gst_percent }
      : null,
  );

  // Explicit summary GST (0 is a real value — do NOT invent from item %)
  const productGstRaw =
    summary?.product_gst ?? summary?.gst_amount ?? data?.product_gst;
  const hasExplicitProductGst =
    productGstRaw != null && productGstRaw !== '';
  const summaryProductGst = hasExplicitProductGst
    ? roundMoney(toNumber(productGstRaw))
    : null;

  // Show/charge GST only when summary says > 0, or (no summary field) config rate > 0
  const gstPresent =
    summaryProductGst != null
      ? summaryProductGst > 0
      : gst.flat > 0 || gst.percent > 0;

  const platformFee = firstRate(
    config?.platform_fee,
    config?.platformFee,
    summary?.platform_fee != null
      ? { flat: summary.platform_fee, percent: 0 }
      : null,
    data?.platform_fee_percent != null || data?.platform_fee != null
      ? { flat: data?.platform_fee, percent: data?.platform_fee_percent }
      : null,
  );

  const summaryPlatformRaw =
    summary?.platform_fee ?? data?.platform_fee;
  const summaryPlatformFee =
    summaryPlatformRaw == null || summaryPlatformRaw === ''
      ? null
      : roundMoney(toNumber(summaryPlatformRaw));

  const shipping = firstRate(
    config?.shipping,
    config?.delivery,
    config?.shipping_charges,
    config?.delivery_fee,
  );
  const cod = firstRate(
    config?.cod,
    config?.cod_charges,
    summary?.cod_charges != null
      ? { flat: summary.cod_charges, percent: 0 }
      : null,
    config?.cash_on_delivery,
  );

  const delivery = readDeliveryRules(config?.delivery, summary);

  // Actual charged delivery from summary (0 when free delivery applies)
  const deliveryAmountRaw =
    summary?.delivery_amount ?? data?.delivery_amount;
  const summaryDeliveryAmount =
    deliveryAmountRaw == null || deliveryAmountRaw === ''
      ? null
      : roundMoney(toNumber(deliveryAmountRaw));

  const freeDeliveryFlag =
    summary?.free_delivery_applicable ?? data?.free_delivery_applicable;
  const summaryFreeDelivery =
    typeof freeDeliveryFlag === 'boolean' ? freeDeliveryFlag : null;

  const totalPayableRaw =
    summary?.total_payable_amount ?? data?.total_payable_amount;
  const summaryTotalPayable =
    totalPayableRaw == null || totalPayableRaw === ''
      ? null
      : roundMoney(toNumber(totalPayableRaw));

  const hasItems = Array.isArray(data?.items) && data.items.length > 0;
  const hasConfigKeys =
    config &&
    typeof config === 'object' &&
    Object.keys(config).length > 0;
  const hasSummary =
    summary &&
    typeof summary === 'object' &&
    (summary !== data || hasExplicitProductGst || itemsAfterDiscount != null);
  const hasRates =
    gst.flat > 0 ||
    gst.percent > 0 ||
    platformFee.flat > 0 ||
    platformFee.percent > 0 ||
    shipping.flat > 0 ||
    shipping.percent > 0 ||
    delivery.charge > 0 ||
    (summaryPlatformFee != null && summaryPlatformFee > 0);

  if (
    baseAmount <= 0 &&
    !hasRates &&
    !hasItems &&
    !hasConfigKeys &&
    !hasSummary &&
    fallbackBase <= 0
  ) {
    return null;
  }

  const resolvedBase =
    baseAmount > 0 ? baseAmount : roundMoney(Math.max(0, fallbackBase));

  // List delivery charge (before free-delivery waiver)
  const listDeliveryCharge = firstPositive(
    summary?.delivery_charges,
    delivery.charge,
  );

  return {
    baseAmount: resolvedBase,
    gst: gstPresent ? gst : { ...EMPTY_RATE },
    gstPresent,
    platformFee:
      summaryPlatformFee != null
        ? { flat: summaryPlatformFee, percent: 0 }
        : platformFee,
    shipping,
    cod,
    currency: String(summary?.currency || data?.currency || 'INR'),
    durationMinutes: toNumber(config?.consultation?.duration_minutes) || null,
    couponDiscount:
      summary?.coupon_discount == null && data?.coupon_discount == null
        ? null
        : roundMoney(toNumber(summary?.coupon_discount ?? data?.coupon_discount)),
    itemsAfterDiscount,
    deliveryCharge: listDeliveryCharge,
    freeDeliveryMinimum: firstPositive(
      summary?.free_delivery_minimum_order_value,
      delivery.minimum,
    ),
    // Never apply item GST % when summary already set product_gst (incl. 0)
    items:
      summaryProductGst != null
        ? readOrderItems(data?.items).map(item => ({ ...item, gstPercent: 0 }))
        : gstPresent
          ? readOrderItems(data?.items)
          : readOrderItems(data?.items).map(item => ({ ...item, gstPercent: 0 })),
    summaryCod: firstPositive(summary?.cod_charges, summary?.cod_charge),
    summaryProductGst,
    summaryPlatformFee,
    summaryDeliveryAmount,
    summaryFreeDelivery,
    summaryTotalPayable,
    variationFactors: delivery.factors,
    freeDeliveryConditions: delivery.conditions,
  };
};

const gstPercentFromClass = (source: any): number => {
  if (source == null || source === '') return 0;
  if (Array.isArray(source)) {
    const percents = source
      .map(entry => gstPercentFromClass(entry))
      .filter(n => n > 0);
    if (!percents.length) return 0;
    const looksLikeSplit = percents.every(n => n <= 50) && percents.length > 1;
    return looksLikeSplit
      ? Math.min(100, percents.reduce((sum, n) => sum + n, 0))
      : percents[0];
  }
  if (typeof source === 'number') return source > 0 && source <= 100 ? source : 0;
  if (typeof source === 'string') {
    const match = source.match(/(\d+(?:\.\d+)?)/);
    const n = match ? Number(match[1]) : 0;
    return n > 0 && n <= 100 ? n : 0;
  }
  if (typeof source !== 'object') return 0;

  const direct = firstPositive(
    source.tax_percentage,
    source.taxPercentage,
    source.gst_percentage,
    source.gstPercentage,
    source.percentage,
    source.percent,
    source.igst,
    source.integrated_gst,
    source.integratedGst,
    source.rate,
  );
  if (direct > 0 && direct <= 100) return direct;

  const split =
    toNumber(source.cgst ?? source.central_gst ?? source.centralGst) +
    toNumber(source.sgst ?? source.state_gst ?? source.stateGst);
  if (split > 0 && split <= 100) return split;

  const nested = gstPercentFromClass(
    source.tax_type ||
    source.taxType ||
    source.gst_tax_type ||
    source.gstTaxType ||
    source.components,
  );
  if (nested > 0) return nested;

  return gstPercentFromClass(
    source.code ||
    source.gst_tax_type_code ||
    source.gstTaxTypeCode ||
    source.name,
  );
};

const readOrderItems = (items: any): OrderFeeItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      sellingPrice: toNumber(item?.selling_price ?? item?.price ?? item?.unit_price),
      quantity: Math.max(0, toNumber(item?.quantity) || 1),
      gstPercent: gstPercentFromClass(
        item?.unicommerce_gst_class ?? item?.gst_class ?? item?.gst,
      ),
    }))
    .filter(item => item.sellingPrice > 0 && item.quantity > 0);
};

const readMoneyField = (source: any): number => {
  if (source == null || source === '') return 0;
  if (typeof source === 'number' || typeof source === 'string') {
    return firstPositive(source);
  }
  if (typeof source !== 'object') return 0;
  return firstPositive(
    source.amount,
    source.flat,
    source.charge,
    source.charges,
    source.value,
    source.fee,
    source.standard,
    source.base,
    source.delivery_charge,
    source.delivery_charges,
    source.shipping_charge,
  );
};

const readDeliveryRules = (delivery: any, summary: any) => {
  const charge = firstPositive(
    readMoneyField(delivery?.charges),
    readMoneyField(delivery?.charge),
    summary?.delivery_charges,
    summary?.delivery_charge,
  );
  const minimum = firstPositive(
    delivery?.free_delivery_minimum_order_value,
    summary?.free_delivery_minimum_order_value,
  );
  return {
    charge,
    minimum,
    factors: Array.isArray(delivery?.variation_factors)
      ? delivery.variation_factors
      : [],
    conditions: Array.isArray(delivery?.free_delivery_conditions)
      ? delivery.free_delivery_conditions
      : delivery?.free_delivery_conditions &&
        typeof delivery.free_delivery_conditions === 'object'
        ? [delivery.free_delivery_conditions]
        : [],
  };
};

/** Charge from a variation slab when the order value falls in its range. */
const chargeFromVariation = (factor: any, orderValue: number): number | null => {
  if (!factor || typeof factor !== 'object') return null;
  const min = firstPositive(
    factor.min_order_value,
    factor.minimum_order_value,
    factor.min,
    factor.from,
  );
  const max = firstPositive(
    factor.max_order_value,
    factor.maximum_order_value,
    factor.max,
    factor.to,
  );
  if (min > 0 && orderValue < min) return null;
  if (max > 0 && orderValue > max) return null;

  const markedFree = factor.free === true || factor.is_free === true;
  const charge = readMoneyField(
    factor.charge ??
    factor.charges ??
    factor.amount ??
    factor.delivery_charge ??
    factor.delivery_charges ??
    factor.fee,
  );
  if (markedFree) return 0;
  if (charge > 0) return charge;
  return null;
};

const matchesFreeDeliveryCondition = (condition: any, orderValue: number) => {
  if (!condition || typeof condition !== 'object') return false;
  const min = firstPositive(
    condition.min_order_value,
    condition.minimum_order_value,
    condition.free_delivery_minimum_order_value,
    condition.order_value,
  );
  if (min > 0) return orderValue >= min;
  return (
    condition.free === true ||
    condition.is_free === true ||
    condition.applicable === true
  );
};

/** Item GST, platform fee, and delivery from the order fee-quote configuration. */
export const calculateOrderFees = ({
  quote,
  fallbackSubtotal = 0,
  localDiscount = 0,
  includeCod = false,
  couponCode,
}: {
  quote: FeeQuoteConfig | null;
  fallbackSubtotal?: number;
  localDiscount?: number;
  includeCod?: boolean;
  couponCode?: string;
}): FeeBreakdown => {
  const items = quote?.items ?? [];
  // Prefer summary items_after_discount as the bill base when present
  const itemTotal =
    quote?.itemsAfterDiscount != null && quote.itemsAfterDiscount > 0
      ? roundMoney(quote.itemsAfterDiscount)
      : items.length
        ? roundMoney(
            items.reduce(
              (sum, item) => sum + item.sellingPrice * item.quantity,
              0,
            ),
          )
        : roundMoney(quote?.baseAmount || fallbackSubtotal);

  const requestedCoupon = String(couponCode || '').trim();
  const quoteMatchesCoupon =
    (quote?.quotedCouponCode || '') === requestedCoupon;
  const apiDiscount =
    quoteMatchesCoupon && quote?.couponDiscount != null
      ? Number(quote.couponDiscount)
      : null;
  const resolvedDiscount =
    apiDiscount != null && apiDiscount >= 0 && quote?.couponDiscount != null
      ? apiDiscount
      : localDiscount;
  const discount = roundMoney(
    Math.min(Math.max(0, resolvedDiscount), itemTotal),
  );
  const taxable = roundMoney(Math.max(0, itemTotal - discount));
  const itemsAfterDiscount = roundMoney(
    quote?.itemsAfterDiscount != null ? quote.itemsAfterDiscount : taxable,
  );
  const discountRatio = itemTotal > 0 ? itemsAfterDiscount / itemTotal : 1;

  // Prefer explicit summary.product_gst (0 means no GST — do not invent from items)
  let gst = 0;
  let gstPresent = false;
  if (quote?.summaryProductGst != null) {
    gst = roundMoney(Math.max(0, quote.summaryProductGst));
    gstPresent = gst > 0;
  } else if (quote?.gstPresent) {
    const computedGst = items.reduce((sum, item) => {
      if (item.gstPercent <= 0) return sum;
      const line = item.sellingPrice * item.quantity * discountRatio;
      return sum + (line * item.gstPercent) / 100;
    }, 0);
    gst = roundMoney(
      computedGst > 0
        ? computedGst
        : chargeFromRate(quote?.gst, itemsAfterDiscount),
    );
    gstPresent = gst > 0;
  }

  const platformFee =
    quote?.summaryPlatformFee != null
      ? roundMoney(Math.max(0, quote.summaryPlatformFee))
      : chargeFromRate(quote?.platformFee, itemsAfterDiscount);

  const freeDeliveryMinimum = quote?.freeDeliveryMinimum ?? 0;
  const slabCharge = (quote?.variationFactors ?? [])
    .map(factor => chargeFromVariation(factor, itemsAfterDiscount))
    .find((charge): charge is number => charge != null);
  const listDeliveryCharge =
    slabCharge != null ? slabCharge : quote?.deliveryCharge ?? 0;

  const meetsMinimum =
    freeDeliveryMinimum > 0 && itemsAfterDiscount >= freeDeliveryMinimum;
  const meetsCondition = (quote?.freeDeliveryConditions ?? []).some(condition =>
    matchesFreeDeliveryCondition(condition, itemsAfterDiscount),
  );
  const freeFromSlab = slabCharge === 0;
  const freeDelivery =
    quote?.summaryFreeDelivery != null
      ? quote.summaryFreeDelivery
      : meetsMinimum || meetsCondition || freeFromSlab;

  // Prefer summary.delivery_amount (actual charged) when present
  const shipping =
    quote?.summaryDeliveryAmount != null
      ? roundMoney(Math.max(0, quote.summaryDeliveryAmount))
      : freeDelivery
        ? 0
        : roundMoney(listDeliveryCharge);

  const configuredCod = chargeFromRate(quote?.cod, itemsAfterDiscount);
  const cod = includeCod
    ? roundMoney(configuredCod > 0 ? configuredCod : quote?.summaryCod ?? 0)
    : 0;

  const freeDeliveryNote = freeDelivery && freeDeliveryMinimum > 0
    ? `Free delivery on orders of ₹${freeDeliveryMinimum}+`
    : freeDeliveryMinimum > 0 && itemsAfterDiscount < freeDeliveryMinimum
      ? `Add ₹${roundMoney(freeDeliveryMinimum - itemsAfterDiscount)} more for free delivery`
      : '';

  const computedTotal = roundMoney(
    itemsAfterDiscount + gst + platformFee + shipping + cod,
  );
  // Prefer API total_payable_amount when it matches the same coupon context
  const total =
    quote?.summaryTotalPayable != null && quoteMatchesCoupon
      ? roundMoney(Math.max(0, quote.summaryTotalPayable))
      : computedTotal;

  return {
    baseAmount: itemTotal,
    discount,
    taxable: itemsAfterDiscount,
    itemsAfterDiscount,
    gst,
    gstPresent,
    platformFee,
    platformRate:
      quote?.summaryPlatformFee != null
        ? { flat: quote.summaryPlatformFee, percent: 0 }
        : quote?.platformFee ?? EMPTY_RATE,
    shipping,
    shippingRate: { flat: shipping, percent: 0 },
    cod,
    codRate: quote?.cod ?? EMPTY_RATE,
    gstRate: gstPresent ? quote?.gst ?? EMPTY_RATE : EMPTY_RATE,
    total,
    deliveryCharge: listDeliveryCharge,
    freeDeliveryMinimum,
    freeDelivery,
    freeDeliveryNote,
  };
};

export const calculateFeeBreakdown = ({
  baseAmount,
  discount = 0,
  gst,
  platformFee,
  shipping,
  cod,
  includeShipping = true,
  includeCod = false,
}: {
  baseAmount: number;
  discount?: number;
  gst: FeeRate;
  platformFee: FeeRate;
  shipping?: FeeRate;
  cod?: FeeRate;
  includeShipping?: boolean;
  includeCod?: boolean;
}): FeeBreakdown => {
  const base = roundMoney(Math.max(0, baseAmount));
  const appliedDiscount = roundMoney(Math.min(Math.max(0, discount), base));
  const taxable = roundMoney(Math.max(0, base - appliedDiscount));
  const gstAmount = chargeFromRate(gst, taxable);
  const platformAmount = chargeFromRate(platformFee, taxable);
  const shippingAmount = includeShipping
    ? chargeFromRate(shipping, taxable)
    : 0;
  const codAmount = includeCod ? chargeFromRate(cod, taxable) : 0;
  const gstPresent = gstAmount > 0 || gst.flat > 0 || gst.percent > 0;

  return {
    baseAmount: base,
    discount: appliedDiscount,
    taxable,
    itemsAfterDiscount: taxable,
    gst: gstPresent ? gstAmount : 0,
    gstPresent,
    gstRate: gstPresent ? gst : EMPTY_RATE,
    platformFee: platformAmount,
    platformRate: platformFee,
    shipping: shippingAmount,
    shippingRate: shipping ?? EMPTY_RATE,
    cod: codAmount,
    codRate: cod ?? EMPTY_RATE,
    total: roundMoney(
      taxable +
        (gstPresent ? gstAmount : 0) +
        platformAmount +
        shippingAmount +
        codAmount,
    ),
    deliveryCharge: shipping?.flat ?? 0,
    freeDeliveryMinimum: 0,
    freeDelivery: false,
    freeDeliveryNote: '',
  };
};



// export type FeeRate = {
//   flat: number;
//   percent: number;
// };

// export type FeeQuoteConfig = {
//   baseAmount: number;
//   gst: FeeRate;
//   platformFee: FeeRate;
//   shipping: FeeRate;
//   cod: FeeRate;
//   currency: string;
//   durationMinutes: number | null;
//   /** Coupon amount returned by the quote, when the API applied one. */
//   couponDiscount: number | null;
//   /** Items total after coupon from fee-quote summary.items_after_discount. */
//   itemsAfterDiscount: number | null;
//   /** Standard delivery charge before the free-delivery check. */
//   deliveryCharge: number;
//   freeDeliveryMinimum: number;
//   items: OrderFeeItem[];
//   summaryCod: number;
//   summaryProductGst: number;
//   /** Delivery slabs from configurations.delivery.variation_factors. */
//   variationFactors: any[];
//   /** Extra free-delivery rules from configurations.delivery.free_delivery_conditions. */
//   freeDeliveryConditions: any[];
//   /** Coupon sent with the quote request, when known. */
//   quotedCouponCode?: string;
// };

// export type OrderFeeItem = {
//   sellingPrice: number;
//   quantity: number;
//   gstPercent: number;
// };

// export type FeeBreakdown = {
//   baseAmount: number;
//   discount: number;
//   taxable: number;
//   /** Prefer API summary.items_after_discount when present. */
//   itemsAfterDiscount: number;
//   gst: number;
//   gstRate: FeeRate;
//   platformFee: number;
//   platformRate: FeeRate;
//   shipping: number;
//   shippingRate: FeeRate;
//   cod: number;
//   codRate: FeeRate;
//   total: number;
//   deliveryCharge: number;
//   freeDeliveryMinimum: number;
//   freeDelivery: boolean;
//   freeDeliveryNote: string;
// };

// const EMPTY_RATE: FeeRate = { flat: 0, percent: 0 };

// export const roundMoney = (value: number) =>
//   Math.round((Number(value) || 0) * 100) / 100;

// const toNumber = (value: unknown): number => {
//   const n = Number(value);
//   return Number.isFinite(n) ? n : 0;
// };

// export const readFeeRate = (source: any): FeeRate => ({
//   flat: Math.max(0, toNumber(source?.flat ?? source?.amount ?? source?.fixed)),
//   percent: Math.max(0, toNumber(source?.percent ?? source?.percentage)),
// });

// /**
//  * Configuration-driven charge.
//  * Flat wins when it is set (matches fee-quote summary: gst flat 10, platform flat 30).
//  * Otherwise the percent is applied to the taxable base.
//  */
// export const chargeFromRate = (rate: FeeRate | undefined, taxableBase: number): number => {
//   const flat = rate?.flat ?? 0;
//   const percent = rate?.percent ?? 0;
//   if (flat > 0) return roundMoney(flat);
//   if (percent > 0) return roundMoney((Math.max(0, taxableBase) * percent) / 100);
//   return 0;
// };

// export const feeRateLabel = (prefix: string, rate: FeeRate | undefined): string => {
//   if ((rate?.percent ?? 0) > 0 && !(rate?.flat && rate.flat > 0)) {
//     return `${prefix} (${rate?.percent}%)`;
//   }
//   return prefix;
// };

// const firstRate = (...sources: any[]): FeeRate => {
//   for (const source of sources) {
//     if (!source || typeof source !== 'object') continue;
//     const rate = readFeeRate(source);
//     if (rate.flat > 0 || rate.percent > 0) return rate;
//   }
//   return { ...EMPTY_RATE };
// };

// const firstPositive = (...values: unknown[]): number => {
//   for (const value of values) {
//     const n = toNumber(value);
//     if (n > 0) return roundMoney(n);
//   }
//   return 0;
// };

// export const parseFeeQuoteConfig = (
//   data: any,
//   fallbackBase = 0,
//   options?: { ignoreConsultationFee?: boolean },
// ): FeeQuoteConfig | null => {
//   if (!data || typeof data !== 'object') return null;

//   const config = data.configurations ?? data.configuration ?? {};
//   const summary = data.summary ?? {};

//   const baseAmount = firstPositive(
//     ...(options?.ignoreConsultationFee
//       ? []
//       : [
//           config?.consultation?.global_fee,
//           summary?.consultation_fee,
//           summary?.taxable_consultation_fee,
//           data?.consultation_fee,
//         ]),
//     summary?.item_total,
//     summary?.subtotal,
//     summary?.order_amount,
//     summary?.cart_total,
//     fallbackBase,
//   );

//   const itemsAfterDiscountRaw =
//     summary?.items_after_discount ?? data?.items_after_discount;
//   const itemsAfterDiscount =
//     itemsAfterDiscountRaw == null || itemsAfterDiscountRaw === ''
//       ? null
//       : roundMoney(toNumber(itemsAfterDiscountRaw));

//   const gst = firstRate(
//     config?.gst,
//     data?.gst_percent != null || data?.gst_amount != null
//       ? { flat: data?.gst_amount, percent: data?.gst_percent }
//       : null,
//   );
//   const platformFee = firstRate(
//     config?.platform_fee,
//     config?.platformFee,
//     data?.platform_fee_percent != null || data?.platform_fee != null
//       ? { flat: data?.platform_fee, percent: data?.platform_fee_percent }
//       : null,
//   );
//   const shipping = firstRate(
//     config?.shipping,
//     config?.delivery,
//     config?.shipping_charges,
//     config?.delivery_fee,
//   );
//   const cod = firstRate(
//     config?.cod,
//     config?.cod_charges,
//     config?.cash_on_delivery,
//   );

//   if (baseAmount <= 0 && gst.flat <= 0 && gst.percent <= 0 && platformFee.flat <= 0 && platformFee.percent <= 0) {
//     return null;
//   }

//   const delivery = readDeliveryRules(config?.delivery, summary);

//   return {
//     baseAmount,
//     gst,
//     platformFee,
//     shipping,
//     cod,
//     currency: String(summary?.currency || data?.currency || 'INR'),
//     durationMinutes: toNumber(config?.consultation?.duration_minutes) || null,
//     couponDiscount:
//       summary?.coupon_discount == null && data?.coupon_discount == null
//         ? null
//         : roundMoney(toNumber(summary?.coupon_discount ?? data?.coupon_discount)),
//     itemsAfterDiscount,
//     deliveryCharge: delivery.charge,
//     freeDeliveryMinimum: delivery.minimum,
//     items: readOrderItems(data?.items),
//     summaryCod: firstPositive(summary?.cod_charges, summary?.cod_charge),
//     summaryProductGst: firstPositive(summary?.product_gst, summary?.gst),
//     variationFactors: delivery.factors,
//     freeDeliveryConditions: delivery.conditions,
//   };
// };

// const gstPercentFromClass = (source: any): number => {
//   if (source == null || source === '') return 0;
//   if (Array.isArray(source)) {
//     const percents = source
//       .map(entry => gstPercentFromClass(entry))
//       .filter(n => n > 0);
//     if (!percents.length) return 0;
//     const looksLikeSplit = percents.every(n => n <= 50) && percents.length > 1;
//     return looksLikeSplit
//       ? Math.min(100, percents.reduce((sum, n) => sum + n, 0))
//       : percents[0];
//   }
//   if (typeof source === 'number') return source > 0 && source <= 100 ? source : 0;
//   if (typeof source === 'string') {
//     const match = source.match(/(\d+(?:\.\d+)?)/);
//     const n = match ? Number(match[1]) : 0;
//     return n > 0 && n <= 100 ? n : 0;
//   }
//   if (typeof source !== 'object') return 0;

//   const direct = firstPositive(
//     source.tax_percentage,
//     source.taxPercentage,
//     source.gst_percentage,
//     source.gstPercentage,
//     source.percentage,
//     source.percent,
//     source.igst,
//     source.integrated_gst,
//     source.integratedGst,
//     source.rate,
//   );
//   if (direct > 0 && direct <= 100) return direct;

//   const split =
//     toNumber(source.cgst ?? source.central_gst ?? source.centralGst) +
//     toNumber(source.sgst ?? source.state_gst ?? source.stateGst);
//   if (split > 0 && split <= 100) return split;

//   const nested = gstPercentFromClass(
//     source.tax_type ||
//       source.taxType ||
//       source.gst_tax_type ||
//       source.gstTaxType ||
//       source.components,
//   );
//   if (nested > 0) return nested;

//   return gstPercentFromClass(
//     source.code ||
//       source.gst_tax_type_code ||
//       source.gstTaxTypeCode ||
//       source.name,
//   );
// };

// const readOrderItems = (items: any): OrderFeeItem[] => {
//   if (!Array.isArray(items)) return [];
//   return items
//     .map((item: any) => ({
//       sellingPrice: toNumber(item?.selling_price ?? item?.price ?? item?.unit_price),
//       quantity: Math.max(0, toNumber(item?.quantity) || 1),
//       gstPercent: gstPercentFromClass(
//         item?.unicommerce_gst_class ?? item?.gst_class ?? item?.gst,
//       ),
//     }))
//     .filter(item => item.sellingPrice > 0 && item.quantity > 0);
// };

// const readMoneyField = (source: any): number => {
//   if (source == null || source === '') return 0;
//   if (typeof source === 'number' || typeof source === 'string') {
//     return firstPositive(source);
//   }
//   if (typeof source !== 'object') return 0;
//   return firstPositive(
//     source.amount,
//     source.flat,
//     source.charge,
//     source.charges,
//     source.value,
//     source.fee,
//     source.standard,
//     source.base,
//     source.delivery_charge,
//     source.delivery_charges,
//     source.shipping_charge,
//   );
// };

// const readDeliveryRules = (delivery: any, summary: any) => {
//   const charge = firstPositive(
//     readMoneyField(delivery?.charges),
//     readMoneyField(delivery?.charge),
//     summary?.delivery_charges,
//     summary?.delivery_charge,
//   );
//   const minimum = firstPositive(
//     delivery?.free_delivery_minimum_order_value,
//     summary?.free_delivery_minimum_order_value,
//   );
//   return {
//     charge,
//     minimum,
//     factors: Array.isArray(delivery?.variation_factors)
//       ? delivery.variation_factors
//       : [],
//     conditions: Array.isArray(delivery?.free_delivery_conditions)
//       ? delivery.free_delivery_conditions
//       : delivery?.free_delivery_conditions &&
//           typeof delivery.free_delivery_conditions === 'object'
//         ? [delivery.free_delivery_conditions]
//         : [],
//   };
// };

// /** Charge from a variation slab when the order value falls in its range. */
// const chargeFromVariation = (factor: any, orderValue: number): number | null => {
//   if (!factor || typeof factor !== 'object') return null;
//   const min = firstPositive(
//     factor.min_order_value,
//     factor.minimum_order_value,
//     factor.min,
//     factor.from,
//   );
//   const max = firstPositive(
//     factor.max_order_value,
//     factor.maximum_order_value,
//     factor.max,
//     factor.to,
//   );
//   if (min > 0 && orderValue < min) return null;
//   if (max > 0 && orderValue > max) return null;

//   const markedFree = factor.free === true || factor.is_free === true;
//   const charge = readMoneyField(
//     factor.charge ??
//       factor.charges ??
//       factor.amount ??
//       factor.delivery_charge ??
//       factor.delivery_charges ??
//       factor.fee,
//   );
//   if (markedFree) return 0;
//   if (charge > 0) return charge;
//   return null;
// };

// const matchesFreeDeliveryCondition = (condition: any, orderValue: number) => {
//   if (!condition || typeof condition !== 'object') return false;
//   const min = firstPositive(
//     condition.min_order_value,
//     condition.minimum_order_value,
//     condition.free_delivery_minimum_order_value,
//     condition.order_value,
//   );
//   if (min > 0) return orderValue >= min;
//   return (
//     condition.free === true ||
//     condition.is_free === true ||
//     condition.applicable === true
//   );
// };

// /** Item GST, platform fee, and delivery from the order fee-quote configuration. */
// export const calculateOrderFees = ({
//   quote,
//   fallbackSubtotal = 0,
//   localDiscount = 0,
//   includeCod = false,
//   couponCode,
// }: {
//   quote: FeeQuoteConfig | null;
//   fallbackSubtotal?: number;
//   localDiscount?: number;
//   includeCod?: boolean;
//   couponCode?: string;
// }): FeeBreakdown => {
//   const items = quote?.items ?? [];
//   const itemTotal = items.length
//     ? roundMoney(
//         items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
//       )
//     : roundMoney(quote?.baseAmount || fallbackSubtotal);

//   const requestedCoupon = String(couponCode || '').trim();
//   const quoteMatchesCoupon =
//     (quote?.quotedCouponCode || '') === requestedCoupon;
//   const resolvedDiscount =
//     quoteMatchesCoupon && quote?.couponDiscount != null
//       ? quote.couponDiscount
//       : localDiscount;
//   const discount = roundMoney(
//     Math.min(Math.max(0, resolvedDiscount), itemTotal),
//   );
//   const taxable = roundMoney(Math.max(0, itemTotal - discount));
//   const itemsAfterDiscount = roundMoney(
//     quote?.itemsAfterDiscount != null ? quote.itemsAfterDiscount : taxable,
//   );
//   const discountRatio = itemTotal > 0 ? itemsAfterDiscount / itemTotal : 1;

//   const computedGst = items.reduce((sum, item) => {
//     if (item.gstPercent <= 0) return sum;
//     const line = item.sellingPrice * item.quantity * discountRatio;
//     return sum + (line * item.gstPercent) / 100;
//   }, 0);
//   const gst = roundMoney(
//     computedGst > 0 ? computedGst : (quote?.summaryProductGst ?? 0) * discountRatio,
//   );

//   const platformFee = chargeFromRate(quote?.platformFee, itemsAfterDiscount);
//   const slabCharge = (quote?.variationFactors ?? [])
//     .map(factor => chargeFromVariation(factor, itemsAfterDiscount))
//     .find((charge): charge is number => charge != null);
//   const deliveryCharge =
//     slabCharge != null ? slabCharge : quote?.deliveryCharge ?? 0;
//   const freeDeliveryMinimum = quote?.freeDeliveryMinimum ?? 0;
//   const meetsMinimum =
//     freeDeliveryMinimum > 0 && itemsAfterDiscount >= freeDeliveryMinimum;
//   const meetsCondition = (quote?.freeDeliveryConditions ?? []).some(condition =>
//     matchesFreeDeliveryCondition(condition, itemsAfterDiscount),
//   );
//   const freeFromSlab = slabCharge === 0;
//   const freeDelivery = meetsMinimum || meetsCondition || freeFromSlab;
//   const shipping = freeDelivery ? 0 : roundMoney(deliveryCharge);
//   const configuredCod = chargeFromRate(quote?.cod, itemsAfterDiscount);
//   const cod = includeCod
//     ? roundMoney(configuredCod > 0 ? configuredCod : quote?.summaryCod ?? 0)
//     : 0;

//   const freeDeliveryNote = freeDelivery && freeDeliveryMinimum > 0
//     ? `Free delivery on orders of ₹${freeDeliveryMinimum}+`
//     : freeDeliveryMinimum > 0 && itemsAfterDiscount < freeDeliveryMinimum
//       ? `Add ₹${roundMoney(freeDeliveryMinimum - itemsAfterDiscount)} more for free delivery`
//       : '';

//   return {
//     baseAmount: itemTotal,
//     discount,
//     taxable: itemsAfterDiscount,
//     itemsAfterDiscount,
//     gst,
//     platformFee,
//     platformRate: quote?.platformFee ?? EMPTY_RATE,
//     shipping,
//     shippingRate: { flat: shipping, percent: 0 },
//     cod,
//     codRate: quote?.cod ?? EMPTY_RATE,
//     gstRate: (() => {
//       const percents = [
//         ...new Set(items.map(item => item.gstPercent).filter(n => n > 0)),
//       ];
//       return percents.length === 1
//         ? { flat: 0, percent: percents[0] }
//         : quote?.gst ?? EMPTY_RATE;
//     })(),
//     total: roundMoney(itemsAfterDiscount + gst + platformFee + shipping + cod),
//     deliveryCharge,
//     freeDeliveryMinimum,
//     freeDelivery,
//     freeDeliveryNote,
//   };
// };

// export const calculateFeeBreakdown = ({
//   baseAmount,
//   discount = 0,
//   gst,
//   platformFee,
//   shipping,
//   cod,
//   includeShipping = true,
//   includeCod = false,
// }: {
//   baseAmount: number;
//   discount?: number;
//   gst: FeeRate;
//   platformFee: FeeRate;
//   shipping?: FeeRate;
//   cod?: FeeRate;
//   includeShipping?: boolean;
//   includeCod?: boolean;
// }): FeeBreakdown => {
//   const base = roundMoney(Math.max(0, baseAmount));
//   const appliedDiscount = roundMoney(Math.min(Math.max(0, discount), base));
//   const taxable = roundMoney(Math.max(0, base - appliedDiscount));
//   const gstAmount = chargeFromRate(gst, taxable);
//   const platformAmount = chargeFromRate(platformFee, taxable);
//   const shippingAmount = includeShipping
//     ? chargeFromRate(shipping, taxable)
//     : 0;
//   const codAmount = includeCod ? chargeFromRate(cod, taxable) : 0;

//   return {
//     baseAmount: base,
//     discount: appliedDiscount,
//     taxable,
//     itemsAfterDiscount: taxable,
//     gst: gstAmount,
//     gstRate: gst,
//     platformFee: platformAmount,
//     platformRate: platformFee,
//     shipping: shippingAmount,
//     shippingRate: shipping ?? EMPTY_RATE,
//     cod: codAmount,
//     codRate: cod ?? EMPTY_RATE,
//     total: roundMoney(taxable + gstAmount + platformAmount + shippingAmount + codAmount),
//     deliveryCharge: shipping?.flat ?? 0,
//     freeDeliveryMinimum: 0,
//     freeDelivery: false,
//     freeDeliveryNote: '',
//   };
// };
