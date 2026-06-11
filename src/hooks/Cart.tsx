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



type UseCartActionsReturn = {
    isAdding: boolean;
    addToCart: (variantId: string | number, quantity: number) => Promise<boolean>;
};

export const useCartActions = (): UseCartActionsReturn => {
    const [isAdding, setIsAdding] = useState(false);

    const addToCart = useCallback(
        async (variantId: string | number, quantity: number): Promise<boolean> => {
            if (!variantId || isAdding) return false;
            console.log("variiiiiiii", variantId, quantity)
            setIsAdding(true);
            try {
                const response = await _CART_SERVICES.AddupdateCart({
                    variant_id: variantId,
                    quantity,                  // whatever qty user selected
                });
                console.log("rasonsecardd", response)
                return response?.success ?? false;
            } catch (error) {
                console.error('[CART ERROR]', error);
                return false;
            } finally {
                setIsAdding(false);
            }
        },
        [isAdding],
    );

    return { isAdding, addToCart };
};