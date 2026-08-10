import { useCallback, useEffect, useState } from 'react';
import * as _MEDICINE_SERVICES from '../services/MedicineServices';

export function useBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await _MEDICINE_SERVICES.getBrands();
      console.log("brandataaaaaaaaaaaaa", response);
      const list = Array.isArray(response?.data) ? response.data : [];
      setBrands(response.data);
    } catch {
      setError('Unable to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    refresh: fetchBrands,
  };
}
