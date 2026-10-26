import { useCallback, useEffect, useRef, useState } from 'react';
import * as _PRODUCT_SERVICES from '../services/ProductServices';
import {
  extractReviewsList,
  normalizeReviewsForDisplay,
} from '../utils/reviewUtils';

type FetchOpts = {
  /** Keep current content on screen (pull-to-refresh). */
  soft?: boolean;
};

export const useProductData = (variantID: string) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ReviewAll, setReviewAll] = useState<any[]>([]);
  const [ProductData, setProductData] = useState<any>(null);
  const ProductDataRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const fetchAllData = useCallback(
    async (opts?: FetchOpts) => {
      if (!variantID) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const requestId = ++requestIdRef.current;
      const soft = Boolean(opts?.soft);

      // Related / trending / best taps: clear + skeleton. Pull-to-refresh: soft.
      if (!soft) {
        ProductDataRef.current = null;
        setProductData(null);
        setReviewAll([]);
        setLoading(true);
      } else if (!ProductDataRef.current) {
        setLoading(true);
      }

      _PRODUCT_SERVICES
        .getReviewsAll({ entity_type: 'product', variant_id: variantID })
        .then(res => {
          if (requestId !== requestIdRef.current) return;
          setReviewAll(
            normalizeReviewsForDisplay(extractReviewsList(res)),
          );
        })
        .catch(error => console.log('ProductReviews API ERROR ===>', error));

      try {
        const ProductList =
          await _PRODUCT_SERVICES.getProductByVariant(variantID);
        if (requestId !== requestIdRef.current) return;
        const next = ProductList?.data || null;
        ProductDataRef.current = next;
        setProductData(next);
      } catch (error) {
        console.log('ProductList API ERROR ===>', error);
        if (requestId !== requestIdRef.current) return;
        if (!soft) {
          ProductDataRef.current = null;
          setProductData(null);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [variantID],
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData({ soft: true });
  }, [fetchAllData]);

  return {
    loading,
    refreshing,
    ProductData,
    ReviewAll,
    onRefresh,
  };
};
