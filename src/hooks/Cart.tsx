import { useCallback, useEffect, useState } from "react";
import * as _CART_SERVICES from '../services/CartService';

export const useAllCartData = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [CartData, setCartData] =
    useState<any>({});

    const [favDoctor, setFavDoctors] =
        useState<any[]>([]);

    const fetchAllData =
        useCallback(async () => {

            try {

                setLoading(true);

                const [
                    CartList,
                ] = await Promise.all([
                    // _CONSULT_SERVICES.getConsultCategory(),
                    _CART_SERVICES.getAllCart(),
                ]);

                console.log('ALLcartlist DATA ==>', CartList?.data);

             setCartData(
    CartList?.data || {},
);

            } catch (error) {

                console.log(
                    'CONSULT API ERROR ===>',
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
        CartData,
        favDoctor,
        onRefresh,
    };
};
