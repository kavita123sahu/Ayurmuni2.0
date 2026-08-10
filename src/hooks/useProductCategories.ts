import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProductCategories,
  mapProductCategory,
  normalizeApiList,
} from '../services/ProductServices';

export type ProductCategoryItem = ReturnType<typeof mapProductCategory>;

export const useProductCategories = (parentId?: string | null) => {
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);

  const loadCategories = useCallback(
    async (options?: { refresh?: boolean }) => {
      const reqId = ++requestIdRef.current;

      try {
        if (!options?.refresh) {
          setLoading(true);
        }

        const response = await getProductCategories(parentId ?? undefined);
        if (reqId !== requestIdRef.current) {
          return;
        }

        if (response?.success === false) {
          console.log('PRODUCT_CATEGORIES_ERROR =>', response?.message);
          setCategories([]);
          return;
        }

        const list = normalizeApiList(response)
          .map(mapProductCategory)
          .filter(item => item.id);

        setCategories(list);
      } catch (error) {
        if (reqId !== requestIdRef.current) {
          return;
        }
        console.log('PRODUCT_CATEGORIES_ERROR =>', error);
        setCategories([]);
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [parentId],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadCategories({ refresh: true });
  }, [loadCategories]);

  return {
    categories,
    loading,
    refreshing,
    refresh,
  };
};
