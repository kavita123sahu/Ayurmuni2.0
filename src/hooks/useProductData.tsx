import { useCallback, useEffect, useRef, useState } from 'react';
import * as _PRODUCT_SERVICES from '../services/ProductServices';
import {
  extractReviewsList,
  normalizeReviewsForDisplay,
} from '../utils/reviewUtils';

export const useProductData = (variantID: string) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ReviewAll, setReviewAll] = useState<any[]>([]);
  const [ProductData, setProductData] = useState<any>(null);
  const ProductDataRef = useRef<any>(null);

  const fetchAllData = useCallback(async () => {
    if (!variantID) {
      setLoading(false);
      return;
    }

    // Reviews load independently so the product renders as soon as it arrives.
    _PRODUCT_SERVICES
      .getReviewsAll({ entity_type: 'product', variant_id: variantID })
      .then(res =>
        setReviewAll(normalizeReviewsForDisplay(extractReviewsList(res))),
      )
      .catch(error => console.log('ProductReviews API ERROR ===>', error));

    try {
      // Only show the full-screen shimmer on first load; refreshes keep current content.
      if (!ProductDataRef.current) setLoading(true);
      const ProductList = await _PRODUCT_SERVICES.getProductByVariant(variantID);
      const next = ProductList?.data || null;
      ProductDataRef.current = next;
      setProductData(next);
    } catch (error) {
      console.log('ProductList API ERROR ===>', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [variantID]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  return {
    loading,
    refreshing,
    ProductData,
    ReviewAll,
    onRefresh,
  };
};
