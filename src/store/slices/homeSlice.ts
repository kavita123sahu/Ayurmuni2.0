import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as _HOME_SERVICES from '../../services/HomeServices';
import * as _PRODUCT_SERVICES from '../../services/ProductServices';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import * as _PATIENT_SERVICES from '../../services/PatientServices';
import { fetchWithCache } from '../../services/apiCache';
import { isAuthenticated } from '../../services/guestAuth';
import {
  getServiceCategoryIds,
  normalizeServiceCategories,
} from '../../utils/serviceCategoryUtils';
import { normalizeApiList } from '../../services/ProductServices';

const CACHE_KEYS = {
  categories: 'home_categories',
  doctors: 'home_doctors',
  medicineProducts: 'home_medicine_products',
  storeProducts: 'home_store_products',
  yoga: 'home_yoga',
  diet: 'home_diet',
  customer: 'home_customer',
};

type HomeState = {
  categories: any[];
  SuggestDoctor: any[];
  medicineProducts: any[];
  dietProducts: any[];
  storeProducts: any[];
  YogaSession: any[];
  customerData: any | null;
  loadingCategories: boolean;
  loadingDoctors: boolean;
  loadingProducts: boolean;
  loadingCustomer: boolean;
  loadingYoga: boolean;
  loadingDiet: boolean;
  initialized: boolean;
  error: string | null;
};

const initialState: HomeState = {
  categories: [],
  SuggestDoctor: [],
  medicineProducts: [],
  dietProducts: [],
  storeProducts: [],
  YogaSession: [],
  customerData: null,
  loadingCategories: false,
  loadingDoctors: false,
  loadingProducts: false,
  loadingCustomer: false,
  loadingYoga: false,
  loadingDiet: false,
  initialized: false,
  error: null,
};

/** Parse patients/diet-plans/ response into a plain array */
export const normalizeDietPlans = (response: any): any[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  // Direct list fields
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.results)) {
    return response.results;
  }

  const data = response.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.diet_plans)) return data.diet_plans;
    if (Array.isArray(data.plans)) return data.plans;
    if (Array.isArray(data.items)) return data.items;
    if (data.id || data.name) return [data];
  }

  // apiClient spreads JSON arrays as { 0: {...}, 1: {...} }
  const numericKeys = Object.keys(response)
    .filter(key => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (numericKeys.length > 0) {
    const list = numericKeys.map(key => response[key]).filter(Boolean);
    if (list.length > 0) {
      return list;
    }
  }

  return [];
};

export const mapDietPlanForHome = (item: any) => {
  const diseases = Array.isArray(item?.health_diseases)
    ? item.health_diseases
        .map((d: any) => d?.name)
        .filter(Boolean)
        .join(', ')
    : '';

  return {
    ...item,
    id: String(item?.id ?? ''),
    title: String(item?.name ?? 'Diet Plan'),
    name: String(item?.name ?? 'Diet Plan'),
    short_description: diseases || item?.season || item?.prakriti || '',
    difficulty: item?.prakriti || item?.season || 'Diet',
    thumbnail_url: item?.thumbnail_url || item?.image_url || '',
    price: item?.price ?? 0,
    is_paid: item?.is_paid ?? Number(item?.price) > 0,
    type: 'diet',
  };
};

const loadDietPlansForHome = async (): Promise<any[]> => {
  try {
    const res = await _PATIENT_SERVICES.getDietPlans();
    console.log('HOME_DIET_PLANS_RESPONSE =>', res);
    if (res?.success === false) {
      console.log('HOME_DIET_PLANS_FAILED =>', res?.message);
      return [];
    }
    return normalizeDietPlans(res)
      .map(mapDietPlanForHome)
      .filter(item => item.id);
  } catch (error) {
    console.log('HOME_DIET_PLANS_ERROR =>', error);
    return [];
  }
};

/** customers/products/?service_category_id=... for home medicine / products sections */
const loadProductsByServiceCategory = async (
  serviceCategoryId: string | null,
  label: 'medicine' | 'products',
): Promise<any[]> => {
  if (!serviceCategoryId) {
    console.log(`HOME_${label.toUpperCase()}_SKIP => missing service_category_id`);
    return [];
  }

  try {
    console.log(
      `HOME_${label.toUpperCase()}_FETCH => customers/products/?service_category_id=${serviceCategoryId}`,
    );
    const res = await _PRODUCT_SERVICES.getProduct({
      service_category_id: serviceCategoryId,
      page_size: 20,
    });
    console.log(`HOME_${label.toUpperCase()}_RESPONSE =>`, res);

    if (res?.success === false) {
      console.log(`HOME_${label.toUpperCase()}_FAILED =>`, res?.message);
      return [];
    }

    return normalizeApiList(res);
  } catch (error) {
    console.log(`HOME_${label.toUpperCase()}_ERROR =>`, error);
    return [];
  }
};

export const fetchHomeData = createAsyncThunk<
  {
    categories: any[];
    doctors: any[];
    medicineProducts: any[];
    storeProducts: any[];
    yoga: any[];
    diet: any[];
    customer: any;
  },
  boolean | undefined
>(
  'home/fetchAll',
  async (force = false, { rejectWithValue }) => {
    try {
      const categories = await fetchWithCache(
        CACHE_KEYS.categories,
        async () => {
          const res = await _HOME_SERVICES.getHomeCategory();
          const list = normalizeServiceCategories(res?.data ?? res);
          console.log('HOME_CATEGORIES =>', list);
          return list;
        },
        { ttl: 120_000, force },
      );

      const serviceIds = getServiceCategoryIds(categories);
      console.log('HOME_SERVICE_CATEGORY_IDS =>', serviceIds);

      const [doctors, medicineProducts, storeProducts, yoga, diet, customer] =
        await Promise.all([
          fetchWithCache(
            CACHE_KEYS.doctors,
            async () => {
              const res = await _HOME_SERVICES.getSuggestedDoctor();
              return normalizeApiList(res);
            },
            { ttl: 120_000, force },
          ),
          fetchWithCache(
            `${CACHE_KEYS.medicineProducts}_${serviceIds.medicine ?? 'none'}`,
            () =>
              loadProductsByServiceCategory(serviceIds.medicine, 'medicine'),
            { ttl: 120_000, force },
          ),
          fetchWithCache(
            `${CACHE_KEYS.storeProducts}_${serviceIds.products ?? 'none'}`,
            () =>
              loadProductsByServiceCategory(serviceIds.products, 'products'),
            { ttl: 120_000, force },
          ),
          fetchWithCache(
            CACHE_KEYS.yoga,
            async () => {
              const res = await _YOGA_SERVICES.getYogaSession();
              if (Array.isArray(res?.data)) {
                return res.data;
              }
              return normalizeApiList(res);
            },
            { ttl: 120_000, force },
          ),
          (async () => loadDietPlansForHome())(),
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

      return {
        categories,
        doctors,
        medicineProducts,
        storeProducts,
        yoga,
        diet,
        customer,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load home data');
    }
  },
);

/** Dedicated diet fetch for HomePage diet section */
export const fetchDietPlans = createAsyncThunk<any[], boolean | undefined>(
  'home/fetchDietPlans',
  async (force = true, { rejectWithValue }) => {
    try {
      return await fetchWithCache(
        CACHE_KEYS.diet,
        () => loadDietPlansForHome(),
        { ttl: 60_000, force },
      );
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load diet plans');
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
    updateMedicineProducts: (
      state,
      action: PayloadAction<any[] | ((prev: any[]) => any[])>,
    ) => {
      if (typeof action.payload === 'function') {
        state.medicineProducts = action.payload(state.medicineProducts);
      } else {
        state.medicineProducts = action.payload;
      }
    },
    updateStoreProducts: (
      state,
      action: PayloadAction<any[] | ((prev: any[]) => any[])>,
    ) => {
      if (typeof action.payload === 'function') {
        state.storeProducts = action.payload(state.storeProducts);
      } else {
        state.storeProducts = action.payload;
      }
    },
    updateProductItem: (
      state,
      action: PayloadAction<{ variantId: string; updates: Partial<any> }>,
    ) => {
      const { variantId, updates } = action.payload;
      const patchList = (list: any[]) =>
        list.map(p =>
          String(p.variant_id) === variantId ? { ...p, ...updates } : p,
        );
      state.medicineProducts = patchList(state.medicineProducts);
      state.storeProducts = patchList(state.storeProducts);
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
          state.loadingDiet = true;
        }
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.SuggestDoctor = action.payload.doctors;
        state.medicineProducts = action.payload.medicineProducts;
        state.storeProducts = action.payload.storeProducts;
        state.YogaSession = action.payload.yoga;
        state.dietProducts = action.payload.diet;
        state.customerData = action.payload.customer;
        state.loadingCategories = false;
        state.loadingDoctors = false;
        state.loadingProducts = false;
        state.loadingCustomer = false;
        state.loadingYoga = false;
        state.loadingDiet = false;
        state.initialized = true;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loadingCategories = false;
        state.loadingDoctors = false;
        state.loadingProducts = false;
        state.loadingCustomer = false;
        state.loadingYoga = false;
        state.loadingDiet = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDietPlans.pending, state => {
        state.loadingDiet = true;
      })
      .addCase(fetchDietPlans.fulfilled, (state, action) => {
        state.loadingDiet = false;
        state.dietProducts = action.payload ?? [];
      })
      .addCase(fetchDietPlans.rejected, state => {
        state.loadingDiet = false;
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

export const {
  updateMedicineProducts,
  updateStoreProducts,
  updateProductItem,
} = homeSlice.actions;
export const selectHomeData = (state: { home: HomeState }) => state.home;

export default homeSlice.reducer;
