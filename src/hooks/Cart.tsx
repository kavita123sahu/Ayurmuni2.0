import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCart, syncCartQuantity, selectCartCount } from '../store/slices/cartSlice';
import { showSuccessToast } from '../config/Key';
import { requireAuth } from '../services/guestAuth';

type FetchCartOptions = boolean | { force?: boolean; silent?: boolean };

export const useAllCartData = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);

  const hasCachedCart =
    Boolean(cart.cartData?.my_cart) ||
    Boolean(cart.cartData?.prescription_cart) ||
    cart.itemCount > 0;

  const fetchAllData = useCallback(
    async (arg: FetchCartOptions = true) => {
      if (typeof arg === 'boolean') {
        await dispatch(fetchCart({ force: arg, silent: false }));
        return;
      }
      await dispatch(
        fetchCart({
          force: arg.force ?? true,
          silent: arg.silent ?? false,
        }),
      );
    },
    [dispatch],
  );

  const onRefresh = useCallback(async () => {
    await dispatch(fetchCart({ force: true, silent: true }));
  }, [dispatch]);

  return {
    // Block UI with skeleton only on cold load (no cart payload yet)
    loading: cart.loading && !hasCachedCart,
    refreshing: cart.loading,
    CartData: cart.cartData,
    favDoctor: [],
    fetchAllData,
    onRefresh,
    itemCount: cart.itemCount,
    hasCachedCart,
  };
};

type UseCartActionsReturn = {
  isAdding: boolean;
  addToCart: (
    variantId: string | number,
    quantity: number,
    options?: { currentQuantity?: number; prescriptionRequired?: boolean },
  ) => Promise<boolean>;
  updateCartQuantity: (
    variantId: string | number,
    quantity: number,
    options?: { currentQuantity?: number; prescriptionRequired?: boolean },
  ) => Promise<boolean>;
  cartCount: number;
};

export const useCartActions = (): UseCartActionsReturn => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const cartCount = useAppSelector(selectCartCount);

  const updateCartQuantityFn = useCallback(
    async (
      variantId: string | number,
      quantity: number,
      options?: { currentQuantity?: number; prescriptionRequired?: boolean },
    ): Promise<boolean> => {
      if (!variantId) {
        return false;
      }
      if (!(await requireAuth('Please login to update cart'))) {
        return false;
      }

      const result = await dispatch(
        syncCartQuantity({
          variantId,
          quantity,
          currentQuantity: options?.currentQuantity,
          prescriptionRequired: options?.prescriptionRequired,
        }),
      );
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
    async (
      variantId: string | number,
      quantity: number,
      options?: { currentQuantity?: number; prescriptionRequired?: boolean },
    ): Promise<boolean> => {
      if (!variantId) {
        return false;
      }
      if (!(await requireAuth('Please login to add items to cart'))) {
        return false;
      }

      const result = await dispatch(
        syncCartQuantity({
          variantId,
          quantity,
          currentQuantity: options?.currentQuantity,
          prescriptionRequired: options?.prescriptionRequired,
        }),
      );
      if (syncCartQuantity.rejected.match(result)) {
        return false;
      }
      console.log("cartttttAPIIIIIIIIIIIIIII", result);
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
