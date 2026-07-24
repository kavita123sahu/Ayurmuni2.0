import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCart, syncCartQuantity, selectCartCount } from '../store/slices/cartSlice';
import { showSuccessToast } from '../config/Key';
import { requireAuth } from '../services/guestAuth';

export const useAllCartData = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);

  const fetchAllData = useCallback(
    async (force = true) => {
      await dispatch(fetchCart(force));
    },
    [dispatch],
  );

  const onRefresh = useCallback(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  return {
    loading: cart.loading,
    refreshing: cart.loading,
    CartData: cart.cartData,
    favDoctor: [],
    fetchAllData,
    onRefresh,
    itemCount: cart.itemCount,
  };
};

type UseCartActionsReturn = {
  isAdding: boolean;
  addToCart: (variantId: string | number, quantity: number) => Promise<boolean>;
  updateCartQuantity: (variantId: string | number, quantity: number) => Promise<boolean>;
  cartCount: number;
};

export const useCartActions = (): UseCartActionsReturn => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const cartCount = useAppSelector(selectCartCount);

  const updateCartQuantityFn = useCallback(
    async (variantId: string | number, quantity: number): Promise<boolean> => {
      if (!variantId) {
        return false;
      }
      if (!(await requireAuth('Please login to update cart'))) {
        return false;
      }

      const result = await dispatch(syncCartQuantity({ variantId, quantity }));
      if (syncCartQuantity.rejected.match(result)) {
        if (result.payload === 'LOGIN_REQUIRED') {
          return false;
        }
        return false;
      }
      return true;
    },
    [dispatch],
  );

  const addToCartFn = useCallback(
    async (variantId: string | number, quantity: number): Promise<boolean> => {
      if (!variantId) {
        return false;
      }
      if (!(await requireAuth('Please login to add items to cart'))) {
        return false;
      }

      const result = await dispatch(syncCartQuantity({ variantId, quantity }));
      if (syncCartQuantity.rejected.match(result)) {
        return false;
      }
      if (syncCartQuantity.fulfilled.match(result)) {
        showSuccessToast(result.payload?.message || 'Added to cart', 'success');
        return true;
      }
      return false;
    },
    [dispatch],
  );

  return {
    isAdding: !!cart.addingVariantId,
    addToCart: addToCartFn,
    updateCartQuantity: updateCartQuantityFn,
    cartCount,
  };
};

export const useCartCount = () => useAppSelector(selectCartCount);

export const useVariantCartQuantity = (variantId: string | number) =>
  useAppSelector(state => state.cart.variantQuantities[String(variantId)] ?? 0);
