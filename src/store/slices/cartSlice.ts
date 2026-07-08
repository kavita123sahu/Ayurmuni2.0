import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as _CART_SERVICES from '../../services/CartService';
import { fetchWithCache, invalidateCache } from '../../services/apiCache';
import { isAuthenticated } from '../../services/guestAuth';

const CART_CACHE_KEY = 'cart_data';

type CartData = {
  my_cart?: { items?: any[]; subtotal?: number };
  prescription_cart?: { items?: any[]; subtotal?: number };
};

type CartState = {
  cartData: CartData;
  itemCount: number;
  variantQuantities: Record<string, number>;
  loading: boolean;
  addingVariantId: string | null;
  error: string | null;
};

const computeMetrics = (data: CartData) => {
  const items = data?.my_cart?.items ?? [];
  const variantQuantities: Record<string, number> = {};
  let itemCount = 0;

  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 0;
    itemCount += qty;
    const vid = String(item.variant_id ?? item.variant?.variant_id ?? '');
    if (vid) variantQuantities[vid] = qty;
  });

  return { itemCount, variantQuantities };
};

const initialState: CartState = {
  cartData: {},
  itemCount: 0,
  variantQuantities: {},
  loading: false,
  addingVariantId: null,
  error: null,
};

export const fetchCart = createAsyncThunk<CartData, boolean | undefined>(
  'cart/fetch',
  async (force = false, { rejectWithValue }) => {
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
        return rejectWithValue(response?.message ?? 'Failed to add to cart');
      }
      invalidateCache(CART_CACHE_KEY);
      return { variantId: String(variantId), quantity, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to add to cart');
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
      state.itemCount = Object.values(state.variantQuantities).reduce(
        (sum, q) => sum + q,
        0,
      );
    },
    clearCartState: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.pending, state => {
        state.loading = true;
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
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.addingVariantId = null;
        const { variantId, quantity } = action.payload;
        state.variantQuantities[variantId] = quantity;
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

export const { setVariantQuantity, clearCartState } = cartSlice.actions;
export const selectCartCount = (state: { cart: CartState }) => state.cart.itemCount;
export const selectVariantQuantity = (variantId: string) => (state: { cart: CartState }) =>
  state.cart.variantQuantities[variantId] ?? 0;
export const selectIsAddingVariant = (variantId: string) => (state: { cart: CartState }) =>
  state.cart.addingVariantId === variantId;

export default cartSlice.reducer;
