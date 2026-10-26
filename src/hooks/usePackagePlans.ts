import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMyPackages,
  getPackagePlans,
  MyPackagesQuery,
  MyPlan,
  PackagePlan,
} from '../services/PackageServices';

/** `{ data: { results, next } }` | `{ data: [] }` | `{ results, next }` → `{ list, next }` */
const readPage = <T>(res: any, tag: string): { list: T[]; next: string | null } => {
  const data = res?.data;
  const list: T[] = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : Array.isArray(res?.results)
        ? res.results
        : [];
  const next: string | null = data?.next ?? res?.next ?? null;

  console.log(`${tag}_SUCCESS =>`, res?.success, '| status =>', res?.status);
  console.log(`${tag}_COUNT =>`, data?.count ?? res?.count ?? list.length);
  console.log(`${tag}_NEXT =>`, next);
  console.log(`${tag}_LIST =>`, list.length, list);

  return { list, next };
};

/**
 * Shared page loader for the packages APIs.
 * `fetcher` must be memoised by the caller; changing it restarts from page 1.
 */
const usePaginatedList = <T>(
  fetcher: (page: number) => Promise<any>,
  tag: string,
  enabled = true,
) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (mode === 'more' && busyRef.current) return;
      busyRef.current = true;
      const requestId = ++requestIdRef.current;

      if (mode === 'initial') setLoading(true);
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'refresh') setRefreshing(true);
      setError(null);

      try {
        console.log(`${tag}_FETCH => page ${page} (${mode})`);
        const res = await fetcher(page);
        if (requestId !== requestIdRef.current) return;
        if (!res?.success) throw new Error(res?.message || 'Failed to load');

        const { list, next } = readPage<T>(res, tag);
        setItems(prev => (mode === 'more' ? [...prev, ...list] : list));
        setHasMore(Boolean(next));
        pageRef.current = page;
      } catch (e: any) {
        if (requestId !== requestIdRef.current) return;
        console.log(`${tag}_ERROR =>`, e?.message ?? e);
        setError(e?.message ?? 'Failed to load');
        if (mode !== 'more') {
          setItems([]);
          setHasMore(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          busyRef.current = false;
        }
      }
    },
    [fetcher, tag],
  );

  useEffect(() => {
    if (!enabled) return;
    fetchPage(1, 'initial');
  }, [fetchPage, enabled]);

  const loadMore = useCallback(() => {
    if (!hasMore || busyRef.current) return;
    fetchPage(pageRef.current + 1, 'more');
  }, [hasMore, fetchPage]);

  const refresh = useCallback(() => fetchPage(1, 'refresh'), [fetchPage]);

  return { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh };
};

/** All package plans (Home rail, Consult rail, Packages screen). */
export const usePackagePlans = () => {
  const fetcher = useCallback((page: number) => getPackagePlans(page), []);
  const { items, ...rest } = usePaginatedList<PackagePlan>(fetcher, 'PACKAGE_PLANS');
  return { plans: items, ...rest };
};

/**
 * Purchased plans. Profile → My Plans passes no doctor_id;
 * Confirm Booking passes doctor_id and waits (`enabled`) until it is known.
 */
export const useMyPackages = (
  filters: Omit<MyPackagesQuery, 'page'>,
  enabled = true,
) => {
  const { status, search, id, doctor_id } = filters;
  const fetcher = useCallback(
    (page: number) => getMyPackages({ status, search, id, doctor_id, page }),
    [status, search, id, doctor_id],
  );
  const { items, ...rest } = usePaginatedList<MyPlan>(fetcher, 'MY_PACKAGES', enabled);
  return { purchases: items, ...rest };
};
