import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GlobalSearchGrouped,
  RecentSearchItem,
  countGlobalSearchHits,
  emptyGrouped,
  getRecentSearches,
  globalSearch,
  mergeGlobalSearchGroups,
  DEFAULT_SEARCH_TYPES,
} from '../services/GlobalSearchService';

export const useGlobalSearch = (
  query: string,
  enabled = true,
  options?: {
    types?: string;
    pageSize?: number;
  },
) => {
  const types = options?.types || DEFAULT_SEARCH_TYPES;
  const pageSize = options?.pageSize || 10;

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GlobalSearchGrouped>(emptyGrouped());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (opts?: { isRefresh?: boolean; page?: number; append?: boolean }) => {
      const q = String(query || '').trim();
      if (!enabled || !q) {
        setResults(emptyGrouped());
        setError(null);
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        setPage(1);
        setHasMore(false);
        return;
      }

      const nextPage = opts?.page || 1;
      const reqId = ++requestIdRef.current;
      try {
        if (opts?.isRefresh) setRefreshing(true);
        else if (opts?.append) setLoadingMore(true);
        else setLoading(true);
        setError(null);

        const { grouped, hasMore: more } = await globalSearch({
          search: q,
          types,
          include_top: true,
          exact_count: false,
          save_recent: true,
          page: nextPage,
          page_size: pageSize,
        });

        if (reqId !== requestIdRef.current) return;

        setResults(prev =>
          opts?.append ? mergeGlobalSearchGroups(prev, grouped) : grouped,
        );
        setPage(nextPage);
        setHasMore(more);
      } catch (e: any) {
        if (reqId !== requestIdRef.current) return;
        setError(e?.message || 'Unable to search');
        if (!opts?.append) setResults(emptyGrouped());
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [query, enabled, types, pageSize],
  );

  useEffect(() => {
    load({ page: 1 });
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || refreshing) return;
    load({ page: page + 1, append: true });
  }, [hasMore, loading, loadingMore, refreshing, load, page]);

  return {
    loading,
    loadingMore,
    refreshing,
    error,
    results,
    total: countGlobalSearchHits(results),
    hasMore,
    refresh: () => load({ isRefresh: true, page: 1 }),
    reload: () => load({ page: 1 }),
    loadMore,
  };
};

export const useRecentSearches = (enabled = true) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecentSearchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      return;
    }
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const list = await getRecentSearches();
      if (reqId !== requestIdRef.current) return;
      setItems(list);
    } catch (e: any) {
      if (reqId !== requestIdRef.current) return;
      setError(e?.message || 'Unable to load recent searches');
      setItems([]);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading,
    items,
    error,
    refresh: load,
  };
};
