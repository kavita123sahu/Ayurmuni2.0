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

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      if (loadingLockRef.current && mode === 'append') {
        return;
      }

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
          // If API ignored page and returned duplicates, stop paging
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
        setError('Unable to load orders');
        if (mode !== 'append') {
          setOrders([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        loadingLockRef.current = false;
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
