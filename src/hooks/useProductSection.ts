import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProductDiscovery,
  getProductsBySection,
  hasMoreProductPages,
  mapCatalogProductItem,
  normalizeApiList,
  PRODUCT_SECTION_LABELS,
  ProductSectionType,
} from '../services/ProductServices';

type Options = {
  section: ProductSectionType | string;
  productId?: string | number | null;
  enabled?: boolean;
  pageSize?: number;
  /** Enable paged load-more on horizontal scroll */
  paginated?: boolean;
  /** Use customers/products/discovery/ (product details) */
  discoveryApi?: boolean;
};

const mergeProductPages = (prev: any[], incoming: any[]) => {
  const seen = new Set(
    prev.map(item => String(item?.variant_id ?? item?.id ?? '')),
  );
  const merged = [...prev];
  incoming.forEach(item => {
    const key = String(item?.variant_id ?? item?.id ?? '');
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged;
};

/**
 * Loads a product discovery rail (featured, related, similar, etc.).
 */
export const useProductSection = ({
  section,
  productId,
  enabled = true,
  pageSize = 12,
  paginated = false,
  discoveryApi = false,
}: Options) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const requestIdRef = useRef(0);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreLockRef = useRef(false);

  const title =
    PRODUCT_SECTION_LABELS[section as ProductSectionType] ||
    String(section || 'Products')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

  const fetchPage = useCallback(
    async (pageNumber: number, append: boolean) => {
      if (!enabled) {
        return;
      }

      const pid = String(productId || '').trim();
      if (discoveryApi && !pid) {
        setProducts([]);
        setLoading(false);
        setLoadingMore(false);
        setHasMore(false);
        setInitialLoadDone(true);
        return;
      }

      const needsProductId =
        discoveryApi || section === 'related' || section === 'similar';
      if (needsProductId && !pid && !discoveryApi) {
        setProducts([]);
        setLoading(false);
        setLoadingMore(false);
        setHasMore(false);
        setInitialLoadDone(true);
        return;
      }

      const reqId = ++requestIdRef.current;

      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const res = discoveryApi
          ? await getProductDiscovery({
              section: section || 'home',
              productId: pid,
              page: pageNumber,
              page_size: pageSize,
            })
          : await getProductsBySection({
              section: section || 'home',
              productId,
              page: pageNumber,
              page_size: pageSize,
            });

        if (reqId !== requestIdRef.current) return;

        if (res?.success === false) {
          if (!append) setProducts([]);
          setHasMore(false);
          hasMoreRef.current = false;
          return;
        }

        const apiResults = normalizeApiList(res)
          .map(mapCatalogProductItem)
          .filter(Boolean);
        const more = hasMoreProductPages(res, apiResults.length, pageSize);

        setHasMore(more);
        hasMoreRef.current = more;
        setPage(pageNumber);
        pageRef.current = pageNumber;

        if (append) {
          setProducts(prev => mergeProductPages(prev, apiResults));
        } else {
          setProducts(apiResults);
        }
      } catch (e) {
        if (reqId !== requestIdRef.current) return;
        console.log('PRODUCT_SECTION_ERROR', section, e);
        if (!append) setProducts([]);
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreLockRef.current = false;
          if (!append) {
            setInitialLoadDone(true);
          }
        }
      }
    },
    [enabled, section, productId, pageSize, discoveryApi],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setInitialLoadDone(false);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    fetchPage(1, false);
  }, [fetchPage, enabled]);

  useEffect(() => {
    if (!enabled) {
      setProducts([]);
      setLoading(false);
      setLoadingMore(false);
      setInitialLoadDone(false);
    }
  }, [enabled]);

  const refresh = useCallback(() => {
    setInitialLoadDone(false);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (
      !paginated ||
      loadingMore ||
      loading ||
      !hasMoreRef.current ||
      loadingMoreLockRef.current
    ) {
      return;
    }
    loadingMoreLockRef.current = true;
    fetchPage(pageRef.current + 1, true);
  }, [paginated, fetchPage, loadingMore, loading]);

  return {
    title,
    products,
    setProducts,
    loading,
    loadingMore,
    hasMore: paginated ? hasMore : false,
    loadMore: paginated ? loadMore : undefined,
    refresh,
    page,
    initialLoadDone,
  };
};
