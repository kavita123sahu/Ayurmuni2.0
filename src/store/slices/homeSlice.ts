import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as _HOME_SERVICES from '../../services/HomeServices';
import * as _PRODUCT_SERVICES from '../../services/ProductServices';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import { fetchWithCache } from '../../services/apiCache';
import { isAuthenticated } from '../../services/guestAuth';

const CACHE_KEYS = {
  categories: 'home_categories',
  doctors: 'home_doctors',
  products: 'home_products',
  yoga: 'home_yoga',
  customer: 'home_customer',
};

type HomeState = {
  categories: any[];
  SuggestDoctor: any[];
  productData: any[];
  YogaSession: any[];
  customerData: any | null;
  loadingCategories: boolean;
  loadingDoctors: boolean;
  loadingProducts: boolean;
  loadingCustomer: boolean;
  loadingYoga: boolean;
  initialized: boolean;
  error: string | null;
};

const initialState: HomeState = {
  categories: [],
  SuggestDoctor: [],
  productData: [],
  YogaSession: [],
  customerData: null,
  loadingCategories: false,
  loadingDoctors: false,
  loadingProducts: false,
  loadingCustomer: false,
  loadingYoga: false,
  initialized: false,
  error: null,
};

export const fetchHomeData = createAsyncThunk<
  {
    categories: any[];
    doctors: any[];
    products: any[];
    yoga: any[];
    customer: any;
  },
  boolean | undefined
>(
  'home/fetchAll',
  async (force = false, { rejectWithValue }) => {
    try {
      const [categories, doctors, products, yoga, customer] = await Promise.all([
        fetchWithCache(
          CACHE_KEYS.categories,
          async () => {
            const res = await _HOME_SERVICES.getHomeCategory();
            return res?.data ?? [];
          },
          { ttl: 120_000, force },
        ),
        fetchWithCache(
          CACHE_KEYS.doctors,
          async () => {
            const res = await _HOME_SERVICES.getSuggestedDoctor();
            return res?.data?.results ?? [];
          },
          { ttl: 120_000, force },
        ),
        fetchWithCache(
          CACHE_KEYS.products,
          async () => {
            const res = await _PRODUCT_SERVICES.getProduct();
            return res?.data?.results ?? [];
          },
          { ttl: 120_000, force },
        ),
        fetchWithCache(
          CACHE_KEYS.yoga,
          async () => {
            const res = await _YOGA_SERVICES.getYogaSession();
            return res?.data ?? [];
          },
          { ttl: 120_000, force },
        ),
        (async () => {
          if (!(await isAuthenticated())) {
            return null;
          }
          return fetchWithCache(
            CACHE_KEYS.customer,
            async () => {
              const res = await _PROFILE_SERVICES.user_profile();
              return res?.status === 200 ? res?.data ?? null : null;
            },
            { ttl: 60_000, force },
          );
        })(),
      ]);

      return { categories, doctors, products, yoga, customer };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load home data');
    }
  },
);

export const fetchCustomerData = createAsyncThunk<any | null, boolean | undefined>(
  'home/fetchCustomer',
  async (force = true, { rejectWithValue }) => {
    try {
      if (!(await isAuthenticated())) {
        return null;
      }
      const customer = await fetchWithCache(
        CACHE_KEYS.customer,
        async () => {
          const res = await _PROFILE_SERVICES.user_profile();
          return res?.status === 200 ? res?.data ?? null : null;
        },
        { ttl: 60_000, force },
      );
      return customer;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load profile');
    }
  },
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    updateProductData: (state, action: PayloadAction<any[] | ((prev: any[]) => any[])>) => {
      if (typeof action.payload === 'function') {
        state.productData = action.payload(state.productData);
      } else {
        state.productData = action.payload;
      }
    },
    updateProductItem: (
      state,
      action: PayloadAction<{ variantId: string; updates: Partial<any> }>,
    ) => {
      const { variantId, updates } = action.payload;
      state.productData = state.productData.map(p =>
        String(p.variant_id) === variantId ? { ...p, ...updates } : p,
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchHomeData.pending, state => {
        if (!state.initialized) {
          state.loadingCategories = true;
          state.loadingDoctors = true;
          state.loadingProducts = true;
          state.loadingCustomer = true;
          state.loadingYoga = true;
        }
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.SuggestDoctor = action.payload.doctors;
        state.productData = action.payload.products;
        state.YogaSession = action.payload.yoga;
        state.customerData = action.payload.customer;
        state.loadingCategories = false;
        state.loadingDoctors = false;
        state.loadingProducts = false;
        state.loadingCustomer = false;
        state.loadingYoga = false;
        state.initialized = true;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loadingCategories = false;
        state.loadingDoctors = false;
        state.loadingProducts = false;
        state.loadingCustomer = false;
        state.loadingYoga = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomerData.pending, state => {
        state.loadingCustomer = true;
      })
      .addCase(fetchCustomerData.fulfilled, (state, action) => {
        state.loadingCustomer = false;
        state.customerData = action.payload;
      })
      .addCase(fetchCustomerData.rejected, state => {
        state.loadingCustomer = false;
      });
  },
});

export const { updateProductData, updateProductItem } = homeSlice.actions;
export const selectHomeData = (state: { home: HomeState }) => state.home;

export default homeSlice.reducer;
