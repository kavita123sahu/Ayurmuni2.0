import { formatRupee } from './currencyUtils';

export type CouponScope = 'product' | 'consultation' | 'all';
export type CouponAppliesTo = 'order' | 'consultation' | 'both';
export type CouponVisibility = 'general' | 'private';
export type CouponSource =
  | 'campaign'
  | 'referral'
  | 'reward'
  | 'loyalty'
  | 'admin'
  | string;

export type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  image_url: string | null;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  /** API: min_amount */
  min_amount: number;
  /** @deprecated alias of min_amount */
  min_order_amount: number;
  /** API: max_discount_amount */
  max_discount: number | null;
  applicable_on: CouponScope;
  applies_to: CouponAppliesTo;
  visibility: CouponVisibility;
  source: CouponSource;
  brand_id: string | null;
  service_category_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  remaining_uses: number | null;
  max_uses_per_customer: number | null;
};

export type CouponListParams = {
  id?: string;
  search?: string;
  visibility?: CouponVisibility;
  source?: string;
  applies_to?: CouponAppliesTo;
  discount_type?: 'percentage' | 'flat';
  brand_id?: string;
  page?: number;
  page_size?: number;
};

const pickList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.coupons)) return data.coupons;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const parseDateMs = (value: any): number | null => {
  if (!value) return null;
  const ms = Date.parse(String(value));
  return Number.isNaN(ms) ? null : ms;
};

const toNumberOrNull = (value: any): number | null => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const isCouponCurrentlyVisible = (raw: any): boolean => {
  if (!raw || typeof raw !== 'object') return false;
  if (raw.is_deleted === true || raw.deleted === true || raw.deleted_at) {
    return false;
  }
  if (raw.is_active === false || raw.active === false) return false;
  const status = String(raw.status || '').toLowerCase();
  if (
    status === 'inactive' ||
    status === 'deleted' ||
    status === 'expired' ||
    status === 'draft' ||
    status === 'revoked' ||
    status === 'used_up'
  ) {
    return false;
  }

  const now = Date.now();
  const starts = parseDateMs(
    raw.starts_at || raw.start_at || raw.valid_from,
  );
  const expires = parseDateMs(
    raw.expires_at || raw.expiry || raw.valid_till || raw.valid_until,
  );
  if (starts != null && starts > now) return false;
  if (expires != null && expires < now) return false;

  const visibility = String(raw.visibility || 'general').toLowerCase();
  if (visibility === 'private') {
    const remaining = toNumberOrNull(
      raw.remaining_uses ??
        raw.uses_remaining ??
        raw.grant?.remaining_uses ??
        raw.customer_grant?.remaining_uses,
    );
    if (remaining != null && remaining <= 0) return false;
  }

  return true;
};

const parseAppliesTo = (raw: any): CouponAppliesTo => {
  const value = String(
    raw.applies_to || raw.applicable_on || raw.applicable_to || raw.scope || '',
  )
    .toLowerCase()
    .trim();

  if (
    !value ||
    value === 'both' ||
    value === 'all' ||
    value === 'any' ||
    value.includes('both')
  ) {
    return 'both';
  }

  // API may send "consult" | "consultation" | "appointment"
  if (
    value === 'consult' ||
    value === 'consultation' ||
    value.includes('consult') ||
    value.includes('appointment')
  ) {
    return 'consultation';
  }

  // API may send "order" | "orders" | "product" | "products"
  if (
    value === 'order' ||
    value === 'orders' ||
    value === 'product' ||
    value === 'products' ||
    value.includes('order') ||
    value.includes('product')
  ) {
    return 'order';
  }

  return 'both';
};

const appliesToScope = (appliesTo: CouponAppliesTo): CouponScope => {
  if (appliesTo === 'consultation') return 'consultation';
  if (appliesTo === 'order') return 'product';
  return 'all';
};

export const scopeToAppliesTo = (
  scope?: CouponScope,
): CouponAppliesTo | undefined => {
  if (scope === 'product') return 'order';
  if (scope === 'consultation') return 'consultation';
  return undefined;
};

/**
 * Checkout / booking coupon visibility:
 * - product (order checkout): applies_to "order" | "both" only
 * - consultation booking: applies_to "consultation"/"consult" | "both" only
 */
export const couponMatchesScope = (coupon: Coupon, scope: CouponScope) => {
  if (!coupon) return false;
  if (scope === 'all') return true;

  const applies = coupon.applies_to;
  if (applies === 'both') return true;

  if (scope === 'product') {
    return applies === 'order';
  }

  if (scope === 'consultation') {
    return applies === 'consultation';
  }

  return false;
};

export const normalizeCoupon = (raw: any): Coupon | null => {
  if (!raw || typeof raw !== 'object') return null;
  if (!isCouponCurrentlyVisible(raw)) return null;

  const nested = raw.coupon && typeof raw.coupon === 'object' ? raw.coupon : null;
  const src = nested || raw;

  const code = String(src.code || src.coupon_code || src.name || '')
    .trim()
    .toUpperCase();
  if (!code) return null;

  const typeRaw = String(
    src.discount_type || src.type || src.offer_type || 'flat',
  ).toLowerCase();
  const discount_type: 'percent' | 'flat' =
    typeRaw.includes('percent') || typeRaw.includes('%')
      ? 'percent'
      : 'flat';

  const discount_value = Number(
    src.discount_value ?? src.value ?? src.amount ?? src.discount ?? 0,
  );
  if (!Number.isFinite(discount_value) || discount_value <= 0) return null;

  const applies_to = parseAppliesTo(src);
  const max_discount = toNumberOrNull(
    src.max_discount_amount ??
      src.max_discount ??
      src.max_cap ??
      src.max_amount,
  );
  const min_amount =
    toNumberOrNull(src.min_amount ?? src.min_order_amount ?? src.min_order) ||
    0;
  const remaining_uses = toNumberOrNull(
    raw.remaining_uses ??
      raw.uses_remaining ??
      raw.grant?.remaining_uses ??
      src.remaining_uses,
  );
  const description = String(
    src.description || src.subtitle || src.details || '',
  ).trim();
  const title = String(
    src.title ||
      src.name ||
      description ||
      (discount_type === 'percent'
        ? `${discount_value}% off`
        : `Flat ${formatRupee(discount_value)} off`),
  ).trim();

  return {
    id: String(src.id || raw.id || code),
    code,
    title,
    description,
    image_url:
      src.image_url ||
      src.image ||
      src.banner_url ||
      src.logo_url ||
      null,
    discount_type,
    discount_value,
    min_amount,
    min_order_amount: min_amount,
    max_discount,
    applicable_on: appliesToScope(applies_to),
    applies_to,
    visibility: String(src.visibility || raw.visibility || 'general')
      .toLowerCase()
      .includes('private')
      ? 'private'
      : 'general',
    source: String(src.source || raw.source || 'campaign').toLowerCase(),
    brand_id:
      src.brand_id != null && src.brand_id !== ''
        ? String(src.brand_id)
        : null,
    service_category_id:
      src.service_category_id != null && src.service_category_id !== ''
        ? String(src.service_category_id)
        : null,
    starts_at: src.starts_at || src.start_at || src.valid_from || null,
    expires_at:
      src.expires_at || src.expiry || src.valid_till || src.valid_until || null,
    remaining_uses,
    max_uses_per_customer: toNumberOrNull(src.max_uses_per_customer),
  };
};

export const parseCouponList = (response: any): Coupon[] => {
  const seen = new Set<string>();
  return pickList(response)
    .map(normalizeCoupon)
    .filter((item): item is Coupon => {
      if (!item) return false;
      const key = item.id || item.code;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/**
 * Flat → discount_value
 * Percentage → subtotal * value / 100, capped by max_discount_amount
 * Rejects when cart < min_amount
 */
export const calcCouponDiscount = (
  coupon: Coupon | null | undefined,
  subtotal: number,
): { ok: boolean; discount: number; error?: string } => {
  if (!coupon) return { ok: false, discount: 0, error: 'Enter a coupon code' };
  const amount = Number(subtotal) || 0;
  if (amount <= 0) {
    return { ok: false, discount: 0, error: 'Add items before applying a coupon' };
  }

  const minAmount = Number(coupon.min_amount || coupon.min_order_amount || 0);
  if (minAmount > 0 && amount < minAmount) {
    return {
      ok: false,
      discount: 0,
      error: `Add items worth ${formatRupee(minAmount)} or more to use this coupon`,
    };
  }

  let discount =
    coupon.discount_type === 'percent'
      ? (amount * coupon.discount_value) / 100
      : coupon.discount_value;

  if (coupon.max_discount != null && coupon.max_discount > 0) {
    discount = Math.min(discount, coupon.max_discount);
  }

  discount = Math.min(Math.max(0, Math.round(discount)), amount);
  if (discount <= 0) {
    return { ok: false, discount: 0, error: 'Coupon is not valid for this amount' };
  }
  return { ok: true, discount };
};

export const findCouponByCode = (coupons: Coupon[], code: string) => {
  const key = String(code || '').trim().toUpperCase();
  if (!key) return null;
  return coupons.find(c => c.code === key) || null;
};

export const couponOfferTitle = (coupon: Coupon) => {
  if (coupon.discount_type === 'percent') {
    return `Tap To Apply: ${Math.round(coupon.discount_value)}% Off`;
  }
  return `Tap To Apply: Flat ${formatRupee(coupon.discount_value)} Off`;
};

export const couponSavingsLabel = (coupon: Coupon) => {
  if (coupon.discount_type === 'percent') {
    const cap =
      coupon.max_discount != null
        ? ` (max ${formatRupee(coupon.max_discount)})`
        : '';
    return `${coupon.discount_value}% off${cap}`;
  }
  return `Flat ${formatRupee(coupon.discount_value)} off`;
};

export const couponMinNote = (coupon: Coupon) => {
  const min = Number(coupon.min_amount || coupon.min_order_amount || 0);
  if (min <= 0) return '';
  return `Valid only on orders of ${formatRupee(min)} & above`;
};

export const couponMaxNote = (coupon: Coupon) => {
  if (
    coupon.discount_type === 'percent' &&
    coupon.max_discount != null &&
    coupon.max_discount > 0
  ) {
    return `Maximum discount ${formatRupee(coupon.max_discount)}`;
  }
  return '';
};

export const couponAppliesLabel = (coupon: Coupon) => {
  if (coupon.applies_to === 'order') return 'Orders';
  if (coupon.applies_to === 'consultation') return 'Consultations';
  return 'Orders & consultations';
};

export const couponExpiryLabel = (coupon: Coupon) => {
  if (!coupon.expires_at) return '';
  const date = new Date(coupon.expires_at);
  if (Number.isNaN(date.getTime())) return '';
  return `Valid till ${date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
};

export const couponSourceLabel = (source: string) => {
  const key = String(source || '').toLowerCase();
  if (key === 'referral') return 'Referral';
  if (key === 'reward') return 'Reward';
  if (key === 'loyalty') return 'Loyalty';
  if (key === 'admin') return 'Special';
  if (key === 'campaign') return 'Campaign';
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Offer';
};
