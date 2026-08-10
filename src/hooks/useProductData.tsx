import { useCallback, useEffect, useState } from 'react';
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

  const fetchAllData = useCallback(async () => {
    if (!variantID) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // GET product + GET review/?entity_type=product&variant_id=
      const [ProductList, ProductReviews] = await Promise.all([
        _PRODUCT_SERVICES.getProductByVariant(variantID),
        _PRODUCT_SERVICES.getReviewsAll({
          entity_type: 'product',
          variant_id: variantID,
        }),
      ]);

      console.log('ProductReviews =>', ProductReviews);
      setProductData(ProductList?.data || null);
      setReviewAll(
        normalizeReviewsForDisplay(extractReviewsList(ProductReviews)),
      );
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
