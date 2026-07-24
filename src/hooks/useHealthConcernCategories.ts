import { useCallback, useEffect, useRef, useState } from 'react';
import { getHealthCategories, mapProductCategory, normalizeApiList } from '../services/ProductServices';

const MEDICINE_SERVICE_NAMES = new Set(['medicine', 'medicines']);

export type HealthConcernItem = ReturnType<typeof mapProductCategory> & {
  service_category_id?: string;
  service_category_name?: string;
};

const mapHealthItem = (item: any): HealthConcernItem => ({
  ...mapProductCategory(item),
  service_category_id: item?.service_category_id
    ? String(item.service_category_id)
    : undefined,
  service_category_name: item?.service_category_name
    ? String(item.service_category_name)
    : undefined,
});

const filterMedicineConcerns = (
  list: HealthConcernItem[],
  serviceCategoryId?: string | null,
) => {
  if (!list.length) {
    return list;
  }

  return list.filter(item => {
    if (!item.id) {
      return false;
    }

    if (serviceCategoryId) {
      return item.service_category_id === String(serviceCategoryId);
    }

    const serviceName = item.service_category_name?.trim().toLowerCase() ?? '';
    return MEDICINE_SERVICE_NAMES.has(serviceName);
  });
};

export const useHealthConcernCategories = (serviceCategoryId?: string | null) => {
  const [categories, setCategories] = useState<HealthConcernItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadCategories = useCallback(
    async (options?: { refresh?: boolean }) => {
      const reqId = ++requestIdRef.current;

      try {
        if (!options?.refresh) {
          setLoading(true);
        }
        setError(null);

        let response = await getHealthCategories(serviceCategoryId ?? undefined);
        if (reqId !== requestIdRef.current) {
          return;
        }

        if (response?.success === false) {
          setCategories([]);
          setError(response?.message || 'Unable to load health categories');
          return;
        }

        let list = normalizeApiList(response).map(mapHealthItem);

        if (serviceCategoryId && list.length === 0) {
          response = await getHealthCategories();
          if (reqId !== requestIdRef.current) {
            return;
          }
          if (response?.success !== false) {
            list = filterMedicineConcerns(
              normalizeApiList(response).map(mapHealthItem),
              serviceCategoryId,
            );
          }
        } else if (serviceCategoryId) {
          list = list.length > 0 ? list : filterMedicineConcerns(list, serviceCategoryId);
        } else {
          list = filterMedicineConcerns(list, null);
        }

        setCategories(list);
      } catch (err) {
        if (reqId !== requestIdRef.current) {
          return;
        }
        console.log('HEALTH_CATEGORIES_ERROR =>', err);
        setCategories([]);
        setError('Unable to load health categories');
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [serviceCategoryId],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const refresh = useCallback(() => {
    loadCategories({ refresh: true });
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refresh,
  };
};
