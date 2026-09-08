import { apiClient } from './APIconfig';
import {
  calcCouponDiscount,
  couponMatchesScope,
  normalizeCoupon,
  parseCouponList,
  type Coupon,
  type CouponListParams,
  type CouponScope,
} from '../utils/couponUtils';

const buildQuery = (params: CouponListParams = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;
    qs.set(key, String(value));
  });
  const encoded = qs.toString();
  return encoded ? `?${encoded}` : '';
};

const pickErrorMessage = (response: any): string => {
  const data = response?.data ?? response ?? {};
  if (typeof data === 'string' && data.trim()) return data.trim();

  const fieldErrors =
    data?.errors || data?.error || data?.non_field_errors || data?.detail;

  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    return String(fieldErrors[0]);
  }
  if (typeof fieldErrors === 'string' && fieldErrors.trim()) {
    return fieldErrors.trim();
  }
  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstKey = Object.keys(fieldErrors)[0];
    const firstVal = firstKey ? fieldErrors[firstKey] : null;
    if (Array.isArray(firstVal) && firstVal[0]) return String(firstVal[0]);
    if (typeof firstVal === 'string') return firstVal;
  }

  return (
    response?.message ||
    data?.message ||
    data?.detail ||
    'Invalid coupon code'
  );
};

/** GET /promotions/coupons/ */
export const getCoupons = async (params: CouponListParams = {}) => {
  return apiClient(`promotions/coupons/${buildQuery(params)}`, {
    method: 'GET',
  });
};

export const fetchCoupons = async (
  scope?: CouponScope,
  extra: CouponListParams = {},
): Promise<Coupon[]> => {
  try {
    const response = await getCoupons({
      page: 1,
      page_size: 50,
      ...extra,
    });
    console.log('fetchCouponsresponse', response);
    if (response?.success === false) return [];
    const list = parseCouponList(response);
    if (!scope || scope === 'all') return list;
    return list.filter(item => couponMatchesScope(item, scope));
  } catch {
    return [];
  }
};

export const searchCoupon = async (query: string): Promise<Coupon | null> => {
  const key = String(query || '').trim();
  if (!key) return null;

  const looksLikeId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      key,
    );

  try {
    const response = await getCoupons(
      looksLikeId ? { id: key } : { search: key, page_size: 10 },
    );
    if (response?.success === false) return null;
    const list = parseCouponList(response);
    const upper = key.toUpperCase();
    return (
      list.find(item => item.code === upper || item.id === key) || null
    );
  } catch {
    return null;
  }
};

export type ValidateCouponResult = {
  ok: boolean;
  coupon: Coupon | null;
  discount: number;
  error?: string;
  response?: any;
};

/**
 * POST /promotions/coupons/validate/
 * Payload: { coupon_code } only — same simple style as other services.
 */
export const validateCoupon = async (data: {
  coupon_code: string;
  /** Used only for local discount calc if API omits discount — not sent */
  amount?: number;
  scope?: CouponScope;
}): Promise<ValidateCouponResult> => {
  const coupon_code = String(data.coupon_code || '')
    .trim()
    .toUpperCase();

  if (!coupon_code) {
    return {
      ok: false,
      coupon: null,
      discount: 0,
      error: 'Enter a coupon code',
    };
  }

  try {
    const response = await apiClient('promotions/coupons/validate/', {
      method: 'POST',
      body: JSON.stringify({ coupon_code }),
    });

    console.log('validateCoupon response', response);

    if (!response || response.success === false) {
      return {
        ok: false,
        coupon: null,
        discount: 0,
        error: pickErrorMessage(response),
        response,
      };
    }

    const payload = response?.data ?? response ?? {};
    const couponRaw =
      payload.coupon ||
      payload.promotion ||
      (payload.code || payload.coupon_code || payload.discount_type
        ? payload
        : null);

    const coupon =
      normalizeCoupon(couponRaw) ||
      normalizeCoupon({
        ...(couponRaw && typeof couponRaw === 'object' ? couponRaw : {}),
        code: couponRaw?.code || couponRaw?.coupon_code || coupon_code,
      });

    const amount = Math.max(0, Math.round(Number(data.amount) || 0));
    let discount = Math.round(
      Number(
        payload.discount_amount ??
          payload.discount ??
          payload.coupon_discount ??
          payload.amount_saved ??
          payload.savings ??
          0,
      ) || 0,
    );

    if (discount <= 0 && coupon && amount > 0) {
      const local = calcCouponDiscount(coupon, amount);
      if (!local.ok) {
        return {
          ok: false,
          coupon: null,
          discount: 0,
          error: local.error || 'Coupon cannot be applied',
          response,
        };
      }
      discount = local.discount;
    } else if (coupon && amount > 0 && discount > 0) {
      // Always enforce max_discount_amount / min_amount locally
      const local = calcCouponDiscount(coupon, amount);
      if (!local.ok) {
        return {
          ok: false,
          coupon: null,
          discount: 0,
          error: local.error || 'Coupon cannot be applied',
          response,
        };
      }
      discount = Math.min(discount, local.discount);
    }

    if (!coupon && discount <= 0) {
      return {
        ok: false,
        coupon: null,
        discount: 0,
        error: pickErrorMessage(response),
        response,
      };
    }

    const resolved: Coupon =
      coupon ||
      ({
        id: coupon_code,
        code: coupon_code,
        title: coupon_code,
        description: '',
        image_url: null,
        discount_type: 'flat',
        discount_value: discount,
        min_amount: 0,
        min_order_amount: 0,
        max_discount: null,
        applicable_on: data.scope || 'all',
        applies_to:
          data.scope === 'consultation'
            ? 'consultation'
            : data.scope === 'product'
              ? 'order'
              : 'both',
        visibility: 'general',
        source: 'campaign',
        brand_id: null,
        service_category_id: null,
        starts_at: null,
        expires_at: null,
        remaining_uses: null,
        max_uses_per_customer: null,
      });

    return {
      ok: true,
      coupon: resolved,
      discount: Math.max(0, discount),
      response,
    };
  } catch (error: any) {
    return {
      ok: false,
      coupon: null,
      discount: 0,
      error: error?.message || 'Could not validate coupon',
    };
  }
};
