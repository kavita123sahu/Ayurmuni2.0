import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as _CART_SERVICES from '../../services/CartService';
import { fetchWithCache, invalidateCache } from '../../services/apiCache';
import { isAuthenticated } from '../../services/guestAuth';

const CART_CACHE_KEY = 'cart_data';

type CartData = {
  my_cart?: { items?: any[]; subtotal?: number };
  prescription_cart?: { items?: any[]; subtotal?: number };
};

export type CartLineItem = {
  variant_id: string;
  quantity: number;
  source?: 'cart' | 'prescribed';
};

type CartState = {
  cartData: CartData;
  itemCount: number;
  variantQuantities: Record<string, number>;
  loading: boolean;
  addingVariantId: string | null;
  error: string | null;
};

const getVariantIdFromItem = (item: any): string =>
  String(item?.variant_id ?? item?.variant?.variant_id ?? '');

const computeMetrics = (data: CartData) => {
  const items = data?.my_cart?.items ?? [];
  const variantQuantities: Record<string, number> = {};
  let itemCount = 0;

  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 0;
    itemCount += qty;
    const vid = getVariantIdFromItem(item);
    if (vid) {
      variantQuantities[vid] = qty;
    }
  });

  return { itemCount, variantQuantities };
};

const patchCartItemQuantity = (
  data: CartData,
  variantId: string,
  quantity: number,
  cartItemFromApi?: any | null,
): CartData => {
  const items = [...(data?.my_cart?.items ?? [])];
  const index = items.findIndex(
    item => getVariantIdFromItem(item) === variantId,
  );

  if (quantity <= 0) {
    if (index >= 0) {
      items.splice(index, 1);
    }
  } else if (index >= 0) {
    const existing = items[index];
    items[index] = {
      ...existing,
      ...(cartItemFromApi ?? {}),
      // Prefer API cart line id (data.item.id)
      id: cartItemFromApi?.id ?? existing?.id,
      quantity: Number(cartItemFromApi?.quantity ?? quantity),
      variant_id: getVariantIdFromItem(cartItemFromApi ?? existing) || variantId,
      variant: cartItemFromApi?.variant ?? existing?.variant,
      price: cartItemFromApi?.price ?? existing?.price,
    };
  } else {
    items.push(
      cartItemFromApi
        ? {
            ...cartItemFromApi,
            id: cartItemFromApi.id,
            variant_id:
              getVariantIdFromItem(cartItemFromApi) || variantId,
            quantity: Number(cartItemFromApi.quantity ?? quantity),
          }
        : { variant_id: variantId, quantity },
    );
  }

  return {
    ...data,
    my_cart: {
      ...data.my_cart,
      items,
    },
  };
};

const removeVariantsFromCartData = (
  data: CartData,
  items: CartLineItem[],
): CartData => {
  const variantIds = new Set(items.map(item => String(item.variant_id)));

  const myCartItems = (data?.my_cart?.items ?? []).filter(
    item => !variantIds.has(getVariantIdFromItem(item)),
  );

  const prescriptionGroups = (data?.prescription_cart?.items ?? [])
    .map((prescription: any) => ({
      ...prescription,
      items: (prescription?.items ?? []).filter(
        (item: any) => !variantIds.has(getVariantIdFromItem(item)),
      ),
    }))
    .filter((prescription: any) => (prescription?.items ?? []).length > 0);

  return {
    ...data,
    my_cart: {
      ...data.my_cart,
      items: myCartItems,
    },
    prescription_cart: {
      ...data.prescription_cart,
      items: prescriptionGroups,
    },
  };
};

const initialState: CartState = {
  cartData: {},
  itemCount: 0,
  variantQuantities: {},
  loading: false,
  addingVariantId: null,
  error: null,
};

type FetchCartArg = boolean | { force?: boolean; silent?: boolean } | undefined;

const parseFetchCartArg = (arg: FetchCartArg) => {
  if (typeof arg === 'boolean') {
    return { force: arg, silent: false };
  }
  return { force: arg?.force ?? false, silent: arg?.silent ?? false };
};

export const fetchCart = createAsyncThunk<CartData, FetchCartArg>(
  'cart/fetch',
  async (arg, { rejectWithValue }) => {
    const { force } = parseFetchCartArg(arg);
    try {
      if (!(await isAuthenticated())) {
        return {};
      }
      const response = await fetchWithCache(
        CART_CACHE_KEY,
        async () => {
          const res = await _CART_SERVICES.getAllCart();
          return res?.data ?? {};
        },
        { ttl: 30_000, force },
      );
      return response as CartData;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to fetch cart');
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async (
    { variantId, quantity }: { variantId: string | number; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      if (!(await isAuthenticated())) {
        return rejectWithValue('LOGIN_REQUIRED');
      }
      const response = await _CART_SERVICES.AddupdateCart({
        variant_id: String(variantId),
        quantity,
      });
      if (!response?.success) {
        return rejectWithValue(response?.message ?? 'Failed to update cart');
      }
      invalidateCache(CART_CACHE_KEY);
      // API returns cart line id on data.item.id (not variant.variant_id)
      const cartItem = response?.data?.item ?? null;
      return {
        variantId: String(variantId),
        quantity: Number(cartItem?.quantity ?? quantity),
        cartItemId: cartItem?.id ? String(cartItem.id) : null,
        cartItem,
        message: response.message,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to update cart');
    }
  },
);

/** Updates cart on API; optimistic Redux state is updated in addToCart reducers. */
export const syncCartQuantity = createAsyncThunk(
  'cart/syncQuantity',
  async (
    { variantId, quantity }: { variantId: string | number; quantity: number },
    { dispatch, rejectWithValue },
  ) => {
    const result = await dispatch(addToCart({ variantId, quantity }));
    if (addToCart.rejected.match(result)) {
      await dispatch(fetchCart({ force: true, silent: true }));
      return rejectWithValue(result.payload);
    }
    return result.payload;
  },
);

/** Removes ordered products from cart after successful checkout. */
export const removeOrderedItemsFromCart = createAsyncThunk(
  'cart/removeOrderedItems',
  async (items: CartLineItem[], { dispatch, rejectWithValue }) => {
    try {
      if (!(await isAuthenticated()) || !items.length) {
        return { removed: 0 };
      }

      const uniqueItems = items.filter(item => item.variant_id && item.quantity > 0);

      for (const item of uniqueItems) {
        await _CART_SERVICES.AddupdateCart({
          variant_id: item.variant_id,
          quantity: 0,
        });
      }

      invalidateCache(CART_CACHE_KEY);
      await dispatch(fetchCart({ force: true, silent: true }));
      dispatch(applyOrderedItemRemoval(uniqueItems));
      return { removed: uniqueItems.length };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to clear cart');
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setVariantQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) => {
      const { variantId, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.variantQuantities[variantId];
      } else {
        state.variantQuantities[variantId] = quantity;
      }
      state.cartData = patchCartItemQuantity(state.cartData, variantId, quantity);
      const metrics = computeMetrics(state.cartData);
      state.itemCount = metrics.itemCount;
      state.variantQuantities = metrics.variantQuantities;
    },
    clearCartState: () => initialState,
    applyOrderedItemRemoval: (state, action: PayloadAction<CartLineItem[]>) => {
      state.cartData = removeVariantsFromCartData(state.cartData, action.payload);
      const metrics = computeMetrics(state.cartData);
      state.itemCount = metrics.itemCount;
      state.variantQuantities = metrics.variantQuantities;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.pending, (state, action) => {
        const { silent } = parseFetchCartArg(action.meta.arg);
        if (!silent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartData = action.payload;
        const metrics = computeMetrics(action.payload);
        state.itemCount = metrics.itemCount;
        state.variantQuantities = metrics.variantQuantities;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.pending, (state, action) => {
        state.addingVariantId = String(action.meta.arg.variantId);
        const { variantId, quantity } = action.meta.arg;
        const id = String(variantId);
        state.cartData = patchCartItemQuantity(state.cartData, id, quantity);
        if (quantity <= 0) {
          delete state.variantQuantities[id];
        } else {
          state.variantQuantities[id] = quantity;
        }
        state.itemCount = Object.values(state.variantQuantities).reduce(
          (sum, q) => sum + q,
          0,
        );
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.addingVariantId = null;
        const { variantId, quantity, cartItem } = action.payload as {
          variantId: string;
          quantity: number;
          cartItemId?: string | null;
          cartItem?: any;
          message?: string;
        };
        const id = String(variantId);
        state.cartData = patchCartItemQuantity(
          state.cartData,
          id,
          quantity,
          cartItem,
        );
        if (quantity <= 0) {
          delete state.variantQuantities[id];
        } else {
          state.variantQuantities[id] = quantity;
        }
        state.itemCount = Object.values(state.variantQuantities).reduce(
          (sum, q) => sum + q,
          0,
        );
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.addingVariantId = null;
        state.error = action.payload as string;
      });
  },
});

export const { setVariantQuantity, clearCartState, applyOrderedItemRemoval } = cartSlice.actions;
export const selectCartCount = (state: { cart: CartState }) => state.cart.itemCount;
export const selectVariantQuantity =
  (variantId: string) => (state: { cart: CartState }) =>
    state.cart.variantQuantities[variantId] ?? 0;
export const selectIsAddingVariant =
  (variantId: string) => (state: { cart: CartState }) =>
    state.cart.addingVariantId === variantId;

export default cartSlice.reducer;
