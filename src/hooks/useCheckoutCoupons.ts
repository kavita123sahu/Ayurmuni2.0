import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCoupons, validateCoupon } from '../services/CouponServices';
import {
  calcCouponDiscount,
  couponMatchesScope,
  findCouponByCode,
  isAdminSourceCoupon,
  type Coupon,
  type CouponScope,
} from '../utils/couponUtils';

export type ApplyCouponResult = {
  ok: boolean;
  discount: number;
  coupon: Coupon | null;
  error?: string;
};

/** Coupons that pass scope + min_amount / discount rules for this cart total */
export const filterEligibleCoupons = (
  list: Coupon[],
  scope: CouponScope,
  subtotal: number,
) =>
  list.filter(
    item =>
      couponMatchesScope(item, scope) &&
      calcCouponDiscount(item, subtotal).ok,
  );

/**
 * Order + consultation share the same rule:
 * show only source=admin coupons that match applies_to for the scope.
 */
const filterCheckoutCoupons = (list: Coupon[], scope: CouponScope) =>
  list.filter(
    item => isAdminSourceCoupon(item) && couponMatchesScope(item, scope),
  );

  
export const useCheckoutCoupons = (
  scope: CouponScope,
  subtotal: number,
) => {
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<Coupon | null>(null);
  const [validatedDiscount, setValidatedDiscount] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchCoupons(scope);
      // Same logic for order + consultation: admin source only
      setAllCoupons(filterCheckoutCoupons(list, scope));
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const coupons = useMemo(
    () => filterEligibleCoupons(allCoupons, scope, subtotal),
    [allCoupons, scope, subtotal],
  );

  const applyCode = useCallback(
    async (rawCode: string): Promise<ApplyCouponResult> => {
      const key = String(rawCode || '').trim().toUpperCase();
      if (!key) {
        const fail = {
          ok: false,
          discount: 0,
          coupon: null,
          error: 'Enter a coupon code',
        };
        setError(fail.error);
        return fail;
      }

      const validated = await validateCoupon({
        coupon_code: key,
        amount: subtotal,
        scope,
      });

      if (!validated.ok || !validated.coupon) {
        setApplied(null);
        setValidatedDiscount(null);
        const msg = validated.error || 'Invalid coupon code';
        setError(msg);
        return { ok: false, discount: 0, coupon: null, error: msg };
      }

      const coupon = validated.coupon;
      if (!couponMatchesScope(coupon, scope)) {
        setApplied(null);
        setValidatedDiscount(null);
        const msg =
          scope === 'consultation'
            ? 'This coupon is only valid for product orders'
            : 'This coupon is only valid for consultations';
        setError(msg);
        return { ok: false, discount: 0, coupon: null, error: msg };
      }

      // Checkout only accepts admin-sourced coupons (order + consultation)
      if (!isAdminSourceCoupon(coupon)) {
        setApplied(null);
        setValidatedDiscount(null);
        const msg =
          'This coupon is not available at checkout. Check Rewards for referral and reward coupons.';
        setError(msg);
        return { ok: false, discount: 0, coupon: null, error: msg };
      }

      const discount =
        validated.discount > 0
          ? validated.discount
          : calcCouponDiscount(coupon, subtotal).discount;

      if (discount <= 0) {
        setApplied(null);
        setValidatedDiscount(null);
        const msg = 'Coupon cannot be applied';
        setError(msg);
        return { ok: false, discount: 0, coupon: null, error: msg };
      }

      setApplied(coupon);
      setValidatedDiscount(discount);
      setError(null);
      if (!findCouponByCode(allCoupons, coupon.code)) {
        setAllCoupons(prev => [coupon, ...prev]);
      }
      return { ok: true, discount, coupon };
    },
    [allCoupons, scope, subtotal],
  );

  const remove = useCallback(() => {
    setApplied(null);
    setValidatedDiscount(null);
    setError(null);
  }, []);

  const discount = useMemo(() => {
    if (!applied) return 0;
    if (validatedDiscount != null && validatedDiscount > 0) {
      return Math.min(validatedDiscount, Math.round(subtotal));
    }
    const result = calcCouponDiscount(applied, subtotal);
    return result.ok ? result.discount : 0;
  }, [applied, subtotal, validatedDiscount]);

  useEffect(() => {
    if (!applied) return;
    if (validatedDiscount != null && validatedDiscount > 0) {
      if (validatedDiscount > Math.round(subtotal)) {
        setApplied(null);
        setValidatedDiscount(null);
        setError('Coupon no longer valid for this amount');
      }
      return;
    }
    const result = calcCouponDiscount(applied, subtotal);
    if (!result.ok) {
      setApplied(null);
      setValidatedDiscount(null);
      setError(result.error || null);
    }
  }, [applied, subtotal, validatedDiscount]);

  return {
    coupons,
    loading,
    applied,
    error,
    discount,
    payable: Math.max(0, Math.round(subtotal) - discount),
    applyCode,
    remove,
    reload: load,
  };
};
