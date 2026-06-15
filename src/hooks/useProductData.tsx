import { useCallback, useEffect, useState } from "react";
import *as _PRODUCT_SERVICES from "../services/ProductServices";
export const useProductData = (variantID: string) => {

    const [loading, setLoading] =
        useState(true);


    const [refreshing, setRefreshing] =
        useState(false);

    const [ReviewAll, setReviewAll] =
        useState<any>(null);


    const [ProductData, setProductData] =
        useState<any>(null);

    const ReviewPayload = {
        entity_type: 'product',
        variant_id: variantID,
    };

    const fetchAllData =
        useCallback(async () => {

            try {

                setLoading(true);

                const [
                    ProductList,
                    ProductReviews,
                ] = await Promise.all([
                    _PRODUCT_SERVICES.getProductByVariant(variantID),
                    _PRODUCT_SERVICES.getReviewsAll(ReviewPayload),

                ]);

                console.log('ProductReviewsProductReviewsProductReviews ==>', ProductReviews);
                setProductData(ProductList?.data || [])
                setReviewAll(ProductReviews?.data || [])

            } catch (error) {

                console.log(
                    'ProductList API ERROR ===>',
                    error,
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }
        }, []);



    useEffect(() => {
        fetchAllData();
    }, []);

    const onRefresh =
        useCallback(() => {

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

