import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyPackages, MyPlan } from '../services/PackageServices';
import { isAuthenticated } from '../services/guestAuth';

const CACHE_TTL_MS = 60 * 1000;

let cache: { plans: MyPlan[]; at: number } | null = null;
let inflight: Promise<MyPlan[]> | null = null;
const listeners = new Set<(plans: MyPlan[]) => void>();

const readList = (res: any): MyPlan[] => {
  const data = res?.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

/**
 * Active purchased plans, shared across Home rail / Packages screen / purchase flow.
 * One request per minute at most; `force` bypasses the cache (used right before buying).
 */
export const fetchActivePlans = async (force = false): Promise<MyPlan[]> => {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.plans;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      if (!(await isAuthenticated())) return [];
      const res: any = await getMyPackages({ status: 'active' });
      const plans = res?.success
        ? readList(res).filter(p => String(p?.status || '').toLowerCase() === 'active')
        : [];
      console.log('ACTIVE_PLANS =>', plans.map(p => ({ id: p.id, package_id: p.package_id })));
      cache = { plans, at: Date.now() };
      listeners.forEach(fn => fn(plans));
      return plans;
    } catch (e) {
      console.log('ACTIVE_PLANS_ERROR =>', e);
      return cache?.plans ?? [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
};

/** Catalog package id a purchase belongs to (packages/my/ uses `package_id`; purchase records use `package`). */
export const getPurchasedPackageId = (plan: any): string => {
  const raw = plan?.package_id ?? plan?.package ?? plan?.package_snapshot?.id ?? '';
  return raw == null ? '' : String(raw).trim();
};

export const isSamePackage = (plan: any, packageId?: string | null) => {
  const target = packageId == null ? '' : String(packageId).trim();
  const owned = getPurchasedPackageId(plan);
  return !!target && !!owned && owned === target;
};

export const invalidateActivePlans = () => {
  cache = null;
};

export const useActivePlans = () => {
  const [plans, setPlans] = useState<MyPlan[]>(cache?.plans ?? []);

  useEffect(() => {
    listeners.add(setPlans);
    fetchActivePlans().then(setPlans);
    return () => {
      listeners.delete(setPlans);
    };
  }, []);

  const ownedIds = useMemo(() => {
    const ids = new Set(plans.map(getPurchasedPackageId).filter(Boolean));
    console.log('ACTIVE_PLANS_OWNED_PACKAGE_IDS =>', [...ids]);
    return ids;
  }, [plans]);

  const ownsPackage = useCallback(
    (packageId?: string | null) => {
      const target = packageId == null ? '' : String(packageId).trim();
      return !!target && ownedIds.has(target);
    },
    [ownedIds],
  );

  return { activePlans: plans, ownsPackage };
};
