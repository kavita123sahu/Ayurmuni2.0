import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getHealthCategories,
  mapProductCategory,
  normalizeApiList,
} from '../services/ProductServices';

export type HealthCategoryItem = ReturnType<typeof mapProductCategory>;

export const useHealthCategories = (parentId?: string | null) => {
  const [categories, setCategories] = useState<HealthCategoryItem[]>([]);
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

        const response = await getHealthCategories(
          parentId ? { id: parentId } : undefined,
        );
        if (reqId !== requestIdRef.current) {
          return;
        }

        if (response?.success === false) {
          console.log('HEALTH_CATEGORIES_ERROR =>', response?.message);
          setCategories([]);
          return;
        }

        const raw = normalizeApiList(response);
        const parent = parentId ? String(parentId) : '';
        const list = raw
          .filter((item: any) => {
            const id = String(
              item?.id ??
                item?.product_category_id ??
                item?.category_id ??
                item?.health_category_id ??
                '',
            );
            if (!id) return false;
            if (!parent) return true;
            // Drop the parent concern row itself
            if (id === parent) return false;
            const itemParent =
              item?.parent_id != null ? String(item.parent_id) : '';
            // When API returns parent_id, keep only children of this concern
            if (itemParent) return itemParent === parent;
            // Assume ?id= already scoped the payload
            return true;
          })
          .map(mapProductCategory)
          .filter(item => item.id);

        setCategories(list);
      } catch (error) {
        if (reqId !== requestIdRef.current) {
          return;
        }
        console.log('HEALTH_CATEGORIES_ERROR =>', error);
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
