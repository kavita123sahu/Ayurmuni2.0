import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProduct, normalizeApiList, ProductQuery } from '../services/ProductServices';

export type CategoryProductFilter = {
  id?: string | null;
  product_subcategory_id?: string | null;
  health_category_id?: string | null;
  health_disease_id?: string | null;
  brand_name_id?: string | null;
  search?: string;
  page?: number;
};

const toProductQuery = (filter: CategoryProductFilter): ProductQuery => {
  const query: ProductQuery = {
    page_size: 100,
    page: filter.page ?? 1,
  };

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
  if (filter.search?.trim()) {
    query.search = filter.search.trim();
  }

  return query;
};

export const useCategoryProducts = (
  filter: CategoryProductFilter,
  fallbackProducts: any[] = [],
) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);
  const fallbackRef = useRef(fallbackProducts);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        id: filter.id ?? '',
        product_subcategory_id: filter.product_subcategory_id ?? '',
        health_category_id: filter.health_category_id ?? '',
        health_disease_id: filter.health_disease_id ?? '',
        brand_name_id: filter.brand_name_id ?? '',
        search: filter.search ?? '',
        page: filter.page ?? 1,
      }),
    [
      filter.id,
      filter.product_subcategory_id,
      filter.health_category_id,
      filter.health_disease_id,
      filter.brand_name_id,
      filter.search,
      filter.page,
    ],
  );

  useEffect(() => {
    fallbackRef.current = fallbackProducts;
  }, [fallbackProducts]);

  const loadProducts = useCallback(
    async (options?: { refresh?: boolean }) => {
      const reqId = ++requestIdRef.current;

      try {
        if (!options?.refresh) {
          setLoading(true);
        }

        const parsedFilter = JSON.parse(filterKey) as CategoryProductFilter;
        const hasFilter = Boolean(
          parsedFilter.id ||
            parsedFilter.product_subcategory_id ||
            parsedFilter.health_category_id ||
            parsedFilter.health_disease_id ||
            parsedFilter.brand_name_id ||
            parsedFilter.search,
        );

        const response = await getProduct(toProductQuery(parsedFilter));
        if (reqId !== requestIdRef.current) {
          return;
        }

        const apiResults = normalizeApiList(response);

        if (apiResults.length > 0) {
          setProducts(apiResults);
        } else if (!hasFilter) {
          setProducts(fallbackRef.current);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (reqId !== requestIdRef.current) {
          return;
        }

        console.log('CATEGORY_PRODUCTS_ERROR =>', error);
        setProducts([]);
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [filterKey],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadProducts({ refresh: true });
  }, [loadProducts]);

  return {
    products,
    loading,
    refreshing,
    refresh,
  };
};
