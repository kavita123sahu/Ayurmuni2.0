import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCoupons, validateCoupon } from '../services/CouponServices';
import { fetchRewards } from '../services/RewardServices';
import {
  calcCouponDiscount,
  couponMatchesScope,
  findCouponByCode,
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

const mergeByCode = (lists: Coupon[][]): Coupon[] => {
  const seen = new Set<string>();
  const out: Coupon[] = [];
  lists.flat().forEach(item => {
    const key = item.code || item.id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
};

const isRewardSourceCoupon = (coupon: Coupon) => {
  const source = String(coupon.source || '').toLowerCase();
  return (
    source === 'referral' || source === 'reward' || source === 'loyalty'
  );
};

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
      // Scoped coupon list from promotions/coupons/
      const list = await fetchCoupons(scope);

      // Order checkout only: also merge referral/reward grants for orders
      // Consultation: consult coupons only (no rewards merge)
      let rewardCoupons: Coupon[] = [];
      if (scope === 'product') {
        const rewardPayload = await fetchRewards();
        rewardCoupons = (rewardPayload.rewards || [])
          .map(r => r.coupon)
          .filter((c): c is Coupon => Boolean(c))
          // Rewards on order checkout: order + both only
          .filter(c => couponMatchesScope(c, 'product'));
      }

      // Strict applies_to gate:
      // product → order | both ; consultation → consultation/consult | both
      const merged = mergeByCode([list, rewardCoupons]).filter(item =>
        couponMatchesScope(item, scope),
      );

      // Consultation checkout: drop referral/reward sources — consult offers only
      const scoped =
        scope === 'consultation'
          ? merged.filter(item => {
              const source = String(item.source || '').toLowerCase();
              return (
                source !== 'referral' &&
                source !== 'reward' &&
                source !== 'loyalty'
              );
            })
          : merged;

      setAllCoupons(scoped);
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

      // Only apply when validate API succeeds. Never local-fallback —
      // that caused "valid in UI" then 400 on order/book-slot.
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

      // Consultation checkout: referral/reward coupons belong on orders / profile
      if (scope === 'consultation' && isRewardSourceCoupon(coupon)) {
        setApplied(null);
        setValidatedDiscount(null);
        const msg = 'Use a consultation coupon here. Rewards apply on orders.';
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
    [allCoupons, coupons, scope, subtotal],
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
