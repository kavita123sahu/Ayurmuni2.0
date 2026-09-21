import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProductCategories,
  mapProductCategory,
  normalizeApiList,
} from '../services/ProductServices';

export type ProductCategoryItem = ReturnType<typeof mapProductCategory>;

const mapList = (response: any): ProductCategoryItem[] =>
  normalizeApiList(response)
    .map(mapProductCategory)
    .filter(item => item.id);

export const useProductCategories = (
  parentId?: string | null,
  serviceCategoryId?: string | null,
) => {
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);

  const loadCategories = useCallback(
    async (options?: { refresh?: boolean }) => {
      const reqId = ++requestIdRef.current;
      const parent = parentId ? String(parentId) : '';

      try {
        if (!options?.refresh) {
          setLoading(true);
        }

        let response = await getProductCategories(
          parent || undefined,
          serviceCategoryId,
        );

        if (reqId !== requestIdRef.current) {
          return;
        }

        if (response?.success === false) {
          console.log('PRODUCT_CATEGORIES_ERROR =>', response?.message);
          response = null;
        }

        let list = mapList(response);

        // Top-level empty with service filter → retry without service filter
        if (!list.length && !parent && serviceCategoryId) {
          const fallbackRes = await getProductCategories(undefined, undefined);
          if (reqId !== requestIdRef.current) {
            return;
          }
          list = mapList(fallbackRes);
        }

        // When loading children, keep only rows under this parent
        if (parent) {
          list = list.filter(item => {
            if (item.id === parent) return false;
            const itemParent = String(item.parent_id || '');
            if (itemParent) return itemParent === parent;
            // API already scoped by ?id=parent
            return true;
          });
        }

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
    [parentId, serviceCategoryId],
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
