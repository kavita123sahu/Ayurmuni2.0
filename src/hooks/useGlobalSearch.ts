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
    /** Only true when user commits a search (submit / pick result). Typing = false. */
    saveRecent?: boolean;
  },
) => {
  const types = options?.types || DEFAULT_SEARCH_TYPES;
  const pageSize = options?.pageSize || 10;
  const saveRecent = options?.saveRecent === true;

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GlobalSearchGrouped>(emptyGrouped());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (opts?: {
      isRefresh?: boolean;
      page?: number;
      append?: boolean;
      saveRecent?: boolean;
    }) => {
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
          // Typing/browse recommendations never save; commit via saveRecent override
          save_recent:
            opts?.saveRecent !== undefined ? opts.saveRecent : saveRecent,
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
    [query, enabled, types, pageSize, saveRecent],
  );

  useEffect(() => {
    load({ page: 1, saveRecent: false });
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || refreshing) return;
    load({ page: page + 1, append: true, saveRecent: false });
  }, [hasMore, loading, loadingMore, refreshing, load, page]);

  /** Persist current query as a recent search (submit / pick recommendation). */
  const commitRecentSearch = useCallback(
    async (overrideQuery?: string) => {
      const q = String(overrideQuery || query || '').trim();
      if (!q) return;
      try {
        await globalSearch({
          search: q,
          types,
          include_top: true,
          exact_count: false,
          save_recent: true,
          page: 1,
          page_size: pageSize,
        });
      } catch {
        // ignore save failures
      }
    },
    [query, types, pageSize],
  );

  return {
    loading,
    loadingMore,
    refreshing,
    error,
    results,
    total: countGlobalSearchHits(results),
    hasMore,
    refresh: () => load({ isRefresh: true, page: 1, saveRecent: false }),
    reload: () => load({ page: 1, saveRecent: false }),
    loadMore,
    commitRecentSearch,
  };
};

export const useRecentSearches = (enabled = true) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecentSearchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!enabled) {
      // Keep cached chips; do not wipe when search leaves idle
      return;
    }
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const list = await getRecentSearches(10);
      if (reqId !== requestIdRef.current) return;
      console.log('RECENT_SEARCH_LIST =>', list?.length, list);
      setItems(list);
    } catch (e: any) {
      if (reqId !== requestIdRef.current) return;
      console.log('RECENT_SEARCH_LIST_ERROR =>', e?.message || e);
      setError(e?.message || 'Unable to load recent searches');
      // Keep previous items if refresh fails
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const clearAll = useCallback(async () => {
    const {
      clearAllRecentSearches,
    } = await import('../services/GlobalSearchService');
    await clearAllRecentSearches();
    setItems([]);
  }, []);

  const removeOne = useCallback(
    async (opts: { id?: string; query?: string }) => {
      const {
        deleteRecentSearches,
      } = await import('../services/GlobalSearchService');
      await deleteRecentSearches(opts);
      setItems(prev =>
        prev.filter(item => {
          if (opts.id && item.id === opts.id) return false;
          if (
            opts.query &&
            item.query.toLowerCase() === opts.query.toLowerCase()
          ) {
            return false;
          }
          return true;
        }),
      );
    },
    [],
  );

  return {
    loading,
    items,
    error,
    refresh: load,
    clearAll,
    removeOne,
  };
};
