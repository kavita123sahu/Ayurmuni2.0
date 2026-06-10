import { useCallback, useEffect, useState } from "react";
import *as _PRODUCT_SERVICES from "../services/ProductServices";
export const useProductData = (variantID : string) => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [ProductData, setProductData] =
        useState<any[]>([]);



    const fetchAllData =
        useCallback(async () => {

            try {

                setLoading(true);

                const [
                    ProductList,
                ] = await Promise.all([
                    _PRODUCT_SERVICES.getProductByVariant(variantID),

                ]);

                console.log('ALLProductList ==>', ProductList);
                setProductData(ProductList?.data || [],)

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
        onRefresh,
    };
};

