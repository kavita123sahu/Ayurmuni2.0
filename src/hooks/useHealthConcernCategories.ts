import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getHealthCategories,
  mapProductCategory,
  normalizeApiList,
} from '../services/ProductServices';

const MEDICINE_SERVICE_NAMES = new Set(['medicine', 'medicines']);

export type HealthConcernItem = ReturnType<typeof mapProductCategory> & {
  service_category_id?: string;
  service_category_name?: string;
};

const mapHealthItem = (item: any): HealthConcernItem => ({
  ...mapProductCategory(item),
  service_category_id: item?.service_category_id
    ? String(item.service_category_id)
    : item?.parent_id
      ? String(item.parent_id)
      : undefined,
  service_category_name: item?.service_category_name
    ? String(item.service_category_name)
    : undefined,
});

/** Prefer medicine-tagged rows; never drop the whole list when API already scoped by service id. */
const filterMedicineConcerns = (
  list: HealthConcernItem[],
  serviceCategoryId?: string | null,
): HealthConcernItem[] => {
  const withId = list.filter(item => !!item.id);
  if (!withId.length) return [];

  if (!serviceCategoryId) {
    return withId.filter(item => {
      const serviceName = item.service_category_name?.trim().toLowerCase() ?? '';
      if (!serviceName) return true;
      return MEDICINE_SERVICE_NAMES.has(serviceName);
    });
  }

  const sid = String(serviceCategoryId);
  const scoped = withId.filter(item => {
    const itemServiceId = String(
      item.service_category_id || item.parent_id || '',
    );
    const serviceName = item.service_category_name?.trim().toLowerCase() ?? '';
    if (!itemServiceId && !serviceName) return true;
    if (itemServiceId && itemServiceId === sid) return true;
    if (MEDICINE_SERVICE_NAMES.has(serviceName)) return true;
    return false;
  });

  return scoped.length > 0 ? scoped : withId;
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

        const response = await getHealthCategories(
          serviceCategoryId
            ? { service_category_id: serviceCategoryId }
            : undefined,
        );
        if (reqId !== requestIdRef.current) {
          return;
        }

        if (response?.success === false) {
          setCategories([]);
          setError(response?.message || 'Unable to load health categories');
          return;
        }

        const list = filterMedicineConcerns(
          normalizeApiList(response).map(mapHealthItem),
          serviceCategoryId,
        );
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
