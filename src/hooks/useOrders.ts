import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  hasMoreOrderPages,
  normalizeOrdersList,
  ORDER_PAGE_SIZE,
} from '../services/OrderService';
import {
  mapOrderToListItem,
  mapOrdersToRecentProducts,
  OrderListItem,
} from '../utils/orderUtils';

export function useOrders(options?: { pageSize?: number; enabled?: boolean }) {
  const pageSize = options?.pageSize ?? ORDER_PAGE_SIZE;
  const enabled = options?.enabled !== false;

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingLockRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      // Only block pagination while another request is in flight.
      // Refresh / replace must always be allowed so the header button works.
      if (loadingLockRef.current && mode === 'append') {
        return;
      }

      const requestId = ++requestIdRef.current;
      loadingLockRef.current = true;

      try {
        if (mode === 'replace') {
          setLoading(true);
        } else if (mode === 'append') {
          setLoadingMore(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const response = await _ORDER_SERVICES.getOrders({
          page: pageToLoad,
          page_size: pageSize,
        });

        // Ignore stale responses (e.g. focus refresh finished after a newer tap)
        if (requestId !== requestIdRef.current) {
          return;
        }

        const list = normalizeOrdersList(response);
        let more = hasMoreOrderPages(response, list.length, pageSize);

        setOrders(prev => {
          if (mode !== 'append') {
            return list;
          }
          const seen = new Set(prev.map((o: any) => String(o?.id)));
          const unique = list.filter((o: any) => {
            const id = String(o?.id);
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          if (unique.length === 0) {
            more = false;
          }
          return [...prev, ...unique];
        });
        setPage(pageToLoad);
        pageRef.current = pageToLoad;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setError('Unable to load orders');
        if (mode !== 'append') {
          setOrders([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          loadingLockRef.current = false;
        }
      }
    },
    [enabled, pageSize],
  );

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    fetchPage(1, 'replace');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      loadingLockRef.current ||
      !hasMoreRef.current ||
      loading ||
      refreshing
    ) {
      return;
    }
    fetchPage(pageRef.current + 1, 'append');
  }, [enabled, fetchPage, loading, refreshing]);

  const onRefresh = useCallback(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    // Force a new request even if one is already in flight
    fetchPage(1, 'refresh');
  }, [fetchPage]);

  const orderListItems = useMemo(
    (): OrderListItem[] => orders.map(mapOrderToListItem),
    [orders],
  );

  const recentProducts = useMemo(
    () => mapOrdersToRecentProducts(orders, 3),
    [orders],
  );

  return {
    orders,
    orderListItems,
    recentProducts,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    page,
    refresh: onRefresh,
    loadMore,
  };
}
