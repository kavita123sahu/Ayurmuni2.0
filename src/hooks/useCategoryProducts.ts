import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getProduct,
  hasMoreProductPages,
  mapCatalogProductItem,
  normalizeApiList,
  PRODUCT_PAGE_SIZE,
  ProductQuery,
} from '../services/ProductServices';

export type CategoryProductFilter = {
  id?: string | null;
  product_subcategory_id?: string | null;
  health_category_id?: string | null;
  health_disease_id?: string | null;
  brand_name_id?: string | null;
  service_category_id?: string | null;
  search?: string;
};

const toProductQuery = (
  filter: CategoryProductFilter,
  page: number,
  pageSize: number,
): ProductQuery => {
  const query: ProductQuery = {
    page_size: pageSize,
    page,
  };

  // When searching, only send search so results come from the full catalog
  if (filter.search?.trim()) {
    query.search = filter.search.trim();
    return query;
  }

  if (filter.id) query.id = filter.id;
  if (filter.product_subcategory_id) {
    query.product_subcategory_id = filter.product_subcategory_id;
  }
  if (filter.health_category_id) {
    query.health_category_id = filter.health_category_id;
  }
  if (filter.health_disease_id) {
    query.health_disease_id = filter.health_disease_id;
  }
  if (filter.brand_name_id) {
    query.brand_name_id = filter.brand_name_id;
  }
  if (filter.service_category_id) {
    query.service_category_id = filter.service_category_id;
  }

  return query;
};

export const useCategoryProducts = (
  filter: CategoryProductFilter,
  fallbackProducts: any[] = [],
  options?: { enabled?: boolean; pageSize?: number },
) => {
  const enabled = options?.enabled !== false;
  const pageSize = options?.pageSize ?? PRODUCT_PAGE_SIZE;
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);
  const fallbackRef = useRef(fallbackProducts);
  const loadingLockRef = useRef(false);
  const productsLengthRef = useRef(0);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        id: filter.id ?? '',
        product_subcategory_id: filter.product_subcategory_id ?? '',
        health_category_id: filter.health_category_id ?? '',
        health_disease_id: filter.health_disease_id ?? '',
        brand_name_id: filter.brand_name_id ?? '',
        service_category_id: filter.service_category_id ?? '',
        search: filter.search ?? '',
        pageSize,
      }),
    [
      filter.id,
      filter.product_subcategory_id,
      filter.health_category_id,
      filter.health_disease_id,
      filter.brand_name_id,
      filter.service_category_id,
      filter.search,
      pageSize,
    ],
  );

  useEffect(() => {
    fallbackRef.current = fallbackProducts;
  }, [fallbackProducts]);

  useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products.length]);

  const fetchPage = useCallback(
    async (
      pageNumber: number,
      options?: { append?: boolean; refresh?: boolean },
    ) => {
      const reqId = ++requestIdRef.current;
      const append = options?.append === true;

      try {
        if (append) {
          setLoadingMore(true);
        } else if (!options?.refresh) {
          // Only show full skeleton when we have nothing to display yet
          setLoading(prev => (productsLengthRef.current > 0 ? prev : true));
        }

        const parsedFilter = JSON.parse(filterKey) as CategoryProductFilter & {
          pageSize?: number;
        };
        const size = parsedFilter.pageSize ?? PRODUCT_PAGE_SIZE;
        const searchOnly = Boolean(parsedFilter.search?.trim());

        const hasFilter = Boolean(
          searchOnly ||
            parsedFilter.id ||
            parsedFilter.product_subcategory_id ||
            parsedFilter.health_category_id ||
            parsedFilter.health_disease_id ||
            parsedFilter.brand_name_id ||
            parsedFilter.service_category_id,
        );

        const response = await getProduct(
          toProductQuery(parsedFilter, pageNumber, size),
        );
        if (reqId !== requestIdRef.current) {
          return;
        }

        const apiResults = normalizeApiList(response)
          .map(mapCatalogProductItem)
          .filter(Boolean);
        const more = hasMoreProductPages(response, apiResults.length, size);

        setHasMore(more);
        setPage(pageNumber);

        if (apiResults.length > 0) {
          setProducts(prev => {
            if (!append) {
              return apiResults;
            }
            const seen = new Set(
              prev.map((p: any) => String(p.variant_id ?? p.id ?? '')),
            );
            const merged = [...prev];
            apiResults.forEach((item: any) => {
              const key = String(item.variant_id ?? item.id ?? '');
              if (!key || seen.has(key)) {
                return;
              }
              seen.add(key);
              merged.push(item);
            });
            return merged;
          });
        } else if (!append) {
          const fallback = Array.isArray(fallbackRef.current)
            ? fallbackRef.current
            : [];
          const serviceOnly =
            Boolean(parsedFilter.service_category_id) &&
            !searchOnly &&
            !parsedFilter.id &&
            !parsedFilter.product_subcategory_id &&
            !parsedFilter.health_category_id &&
            !parsedFilter.health_disease_id &&
            !parsedFilter.brand_name_id;

          if (!hasFilter || (serviceOnly && fallback.length > 0)) {
            setProducts(fallback);
          } else {
            setProducts([]);
          }
          setHasMore(false);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        if (reqId !== requestIdRef.current) {
          return;
        }

        console.log('CATEGORY_PRODUCTS_ERROR =>', error);
        if (!append) {
          const fallback = Array.isArray(fallbackRef.current)
            ? fallbackRef.current
            : [];
          setProducts(fallback.length > 0 ? fallback : []);
        }
        setHasMore(false);
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          loadingLockRef.current = false;
        }
      }
    },
    [filterKey],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(true);
      return;
    }
    setPage(1);
    setHasMore(true);
    // Soft filter/search: keep previous rows so the screen does not remount
    fetchPage(1);
  }, [fetchPage, enabled]);

  const refresh = useCallback(() => {
    if (!enabled) {
      return;
    }
    setRefreshing(true);
    setHasMore(true);
    fetchPage(1, { refresh: true });
  }, [enabled, fetchPage]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      loading ||
      loadingMore ||
      refreshing ||
      !hasMore ||
      loadingLockRef.current
    ) {
      return;
    }

    loadingLockRef.current = true;
    fetchPage(page + 1, { append: true });
  }, [enabled, fetchPage, hasMore, loading, loadingMore, page, refreshing]);

  return {
    products,
    setProducts,
    loading: loading || !enabled,
    loadingMore,
    refreshing,
    hasMore,
    refresh,
    loadMore,
  };
};
