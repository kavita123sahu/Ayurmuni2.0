import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as _HOME_SERVICES from '../../services/HomeServices';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import {
  getServiceCategoryIds,
  normalizeServiceCategories,
} from '../../utils/serviceCategoryUtils';
import {
  mapCatalogProductItem,
  normalizeApiList,
} from '../../services/ProductServices';
import { normalizeYogaSessionList } from '../../utils/yogaUtils';

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
  if (!response || response?.success === false) {
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
    // Single plan object only when it looks like a real plan row
    if (data.id && (data.name || data.title)) return [data];
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
  const guidance = String(item?.guidance || item?.guide || '').trim();
  const subtitle =
    String(
      guidance ||
      item?.season ||
      item?.subtitle ||
      item?.short_description ||
      '',
    ).trim() || '';

  return {
    ...item,
    id: String(item?.id ?? ''),
    title: String(item?.name ?? 'Diet Plan'),
    name: String(item?.name ?? 'Diet Plan'),
    guidance: guidance || null,
    // Prefer guidance; never use disease names as subtitle
    short_description: subtitle,
    subtitle,
    prakriti: item?.prakriti || '',
    difficulty: item?.prakriti || item?.season || 'Diet',
    thumbnail_url: item?.thumbnail_url || item?.image_url || '',
    price: item?.price ?? 0,
    is_paid: item?.is_paid ?? Number(item?.price) > 0,
    type: 'diet',
  };
};

const loadDietPlansForHome = async (
  healthDiseaseId?: string | null,
): Promise<any[]> => {
  try {
    // Disease selected → suggested (personalized) diet for that disease
    // No disease → full browse list with no filter params
    const res = healthDiseaseId
      ? await _HOME_SERVICES.getSuggestedDietPlans({
          health_disease_id: healthDiseaseId,
        })
      : await _HOME_SERVICES.getDietPlansBrowse();
    console.log('HOME_DIET_PLANS_RESPONSE =>', res);

    if (res?.success === false) {
      console.log('HOME_DIET_PLANS_FAILED =>', res?.message);
      // Suggested empty with disease → try browse filtered by disease
      if (healthDiseaseId) {
        const browse = await _HOME_SERVICES.getDietPlansBrowse({
          health_disease_id: healthDiseaseId,
        });
        return normalizeDietPlans(browse)
          .map(mapDietPlanForHome)
          .filter(item => item.id);
      }
      return [];
    }

    const list = normalizeDietPlans(res)
      .map(mapDietPlanForHome)
      .filter(item => item.id);

    console.log('HOME_DIET_PLANS_PARSED_COUNT =>', list.length);
    return list;
  } catch (error) {
    console.log('HOME_DIET_PLANS_ERROR =>', error);
    return [];
  }
};

/** Keep product rows even when variant mapping is incomplete (guest payloads vary). */
const mapHomeProductItem = (item: any) => {
  const mapped = mapCatalogProductItem(item);
  if (mapped) return mapped;
  if (!item || typeof item !== 'object') return null;

  const id =
    item.id ??
    item.product_id ??
    item.variant_id ??
    item.uuid ??
    item.product?.id ??
    item.variant?.id;
  if (id == null || String(id).trim() === '') return null;

  return {
    ...item,
    id: String(id),
    variant_id: String(item.variant_id ?? item.variant?.id ?? id),
    name: String(
      item.name ||
      item.product_name ||
      item.title ||
      item.product?.name ||
      'Product',
    ).trim(),
    selling_price:
      item.selling_price ?? item.price ?? item.variant?.selling_price ?? 0,
  };
};

const parseHomeProductResponse = (res: any): any[] => {
  if (!res || res?.success === false) return [];
  return normalizeApiList(res).map(mapHomeProductItem).filter(Boolean);
};

/** Homepage products / medicines via HomeServices only (works for guest token). */
const loadCatalogFallback = async (
  kind: 'products' | 'medicines',
  categories: any[] = [],
  healthDiseaseId?: string | null,
): Promise<any[]> => {
  const serviceIds = getServiceCategoryIds(categories);
  const serviceCategoryId =
    kind === 'medicines' ? serviceIds.medicine : serviceIds.products;

  // With disease: keep service + disease. Without: no disease filter.
  const attempts: Array<{
    service_category_id?: string | null;
    health_disease_id?: string | null;
  }> = healthDiseaseId
    ? [
        {
          service_category_id: serviceCategoryId,
          health_disease_id: healthDiseaseId,
        },
        { health_disease_id: healthDiseaseId },
      ]
    : [{ service_category_id: serviceCategoryId }, {}];

  for (const attempt of attempts) {
    try {
      const res = await _HOME_SERVICES.getHomeProducts({
        service_category_id: attempt.service_category_id,
        health_disease_id: attempt.health_disease_id,
        page: 1,
        page_size: 12,
      });
      const list = parseHomeProductResponse(res);
      if (list.length > 0) {
        console.log(
          `HOME_${kind.toUpperCase()}_HOMESERVICES_FALLBACK =>`,
          list.length,
        );
        return list;
      }
    } catch (error) {
      console.log(`HOME_${kind.toUpperCase()}_HOMESERVICES_ERROR =>`, error);
    }
  }

  return [];
};

/**
 * Disease selected → suggested APIs (+ disease id).
 * No disease → unfiltered browse catalog (no filter params).
 */
const loadSuggestedCatalog = async (
  kind: 'products' | 'medicines',
  categories: any[] = [],
  healthDiseaseId?: string | null,
): Promise<any[]> => {
  try {
    if (!healthDiseaseId) {
      return await loadCatalogFallback(kind, categories, null);
    }

    const res =
      kind === 'medicines'
        ? await _HOME_SERVICES.getSuggestedMedicines({
            health_disease_id: healthDiseaseId,
          })
        : await _HOME_SERVICES.getSuggestedProducts({
            health_disease_id: healthDiseaseId,
          });

    console.log(`HOME_${kind.toUpperCase()}_SUGGESTED_RAW =>`, res);

    const suggested = parseHomeProductResponse(res);
    if (suggested.length > 0) {
      return suggested;
    }

    return await loadCatalogFallback(kind, categories, healthDiseaseId);
  } catch (error) {
    console.log(`HOME_${kind.toUpperCase()}_ERROR:`, error);
    try {
      return await loadCatalogFallback(kind, categories, healthDiseaseId);
    } catch (fallbackError) {
      console.log(`HOME_${kind.toUpperCase()}_FALLBACK_ERROR:`, fallbackError);
      return [];
    }
  }
};

/** Resolve selected health disease ids from profile payload */
export const resolveHealthDiseaseIds = (customer: any): string[] => {
  if (!customer || typeof customer !== 'object') return [];

  const fromIds = Array.isArray(customer.health_disease_ids)
    ? customer.health_disease_ids
    : [];
  const fromObjects = Array.isArray(customer.health_diseases)
    ? customer.health_diseases
    : [];

  const ids = [
    ...fromIds.map((id: any) => String(id ?? '').trim()),
    ...fromObjects.map((item: any) =>
      String(item?.id ?? item?.health_disease_id ?? '').trim(),
    ),
  ].filter(Boolean);

  return Array.from(new Set(ids));
};

const parseDoctorList = (res: any): any[] =>
  normalizeApiList(res).filter(
    (item: any) =>
      item &&
      (item.id || item.doctor_id) &&
      String(item.full_name || item.name || '').trim(),
  );

const loadHomeDoctors = async (healthDiseaseId?: string | null) => {
  if (healthDiseaseId) {
    const suggested = parseDoctorList(
      await _HOME_SERVICES.getSuggestedDoctor({
        health_disease_id: healthDiseaseId,
      }),
    );
    if (suggested.length > 0) return suggested;
    return parseDoctorList(
      await _HOME_SERVICES.getDoctorsBrowse({
        health_disease_id: healthDiseaseId,
      }),
    );
  }
  // No disease → all doctors, no filter params
  return parseDoctorList(await _HOME_SERVICES.getDoctorsBrowse());
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
  async (_force = false, { rejectWithValue }) => {
    try {
      const safe = async <T,>(
        label: string,
        fn: () => Promise<T>,
        fallback: T,
      ): Promise<T> => {
        try {
          const result = await fn();
          console.log(`HOME_${label}_LOADED =>`, result);
          return result;
        } catch (error) {
          console.log(`HOME_${label}_SAFE_SKIP =>`, error);
          return fallback;
        }
      };

      // Categories + customer first so disease selection can drive rail filters
      const [categories, customer] = await Promise.all([
        safe(
          'CATEGORIES',
          async () => {
            console.log('HOME_CATEGORIES_API_CALL');
            const res = await _HOME_SERVICES.getHomeCategory();
            const list = normalizeServiceCategories(res?.data ?? res);
            console.log('HOME_CATEGORIES_API_RESPONSE =>', list);
            return list;
          },
          [],
        ),
        safe(
          'CUSTOMER',
          async () => {
            console.log('HOME_CUSTOMER_API_CALL');
            const res = await _PROFILE_SERVICES.user_profile();
            const data =
              res?.status === 200 ? res?.data ?? null : null;
            console.log('HOME_CUSTOMER_API_RESPONSE =>', data);
            return data;
          },
          null,
        ),
      ]);

      const diseaseIds = resolveHealthDiseaseIds(customer);
      // APIs take singular health_disease_id — use first selected (or comma-join)
      const healthDiseaseId =
        diseaseIds.length > 0 ? diseaseIds.join(',') : null;
      const hasDiseaseFilter = Boolean(healthDiseaseId);

      console.log('HOME_SERVICE_CATEGORY_IDS =>', getServiceCategoryIds(categories));
      console.log('HOME_HEALTH_DISEASE_IDS =>', diseaseIds);
      console.log(
        'HOME_RAILS_MODE =>',
        hasDiseaseFilter ? 'suggested+disease' : 'browse-all-no-filter',
      );

      const [
        doctors,
        medicineProducts,
        storeProducts,
        yoga,
        diet,
      ] = await Promise.all([
        safe(
          'DOCTORS',
          async () => {
            console.log('HOME_DOCTORS_API_CALL');
            const list = await loadHomeDoctors(healthDiseaseId);
            console.log('HOME_DOCTORS_API_RESPONSE =>', list);
            return list;
          },
          [],
        ),

        safe(
          'MEDICINE',
          async () => {
            console.log('HOME_MEDICINE_API_CALL');
            return loadSuggestedCatalog('medicines', categories, healthDiseaseId);
          },
          [],
        ),

        safe(
          'PRODUCTS',
          async () => {
            console.log('HOME_PRODUCTS_API_CALL');
            return loadSuggestedCatalog('products', categories, healthDiseaseId);
          },
          [],
        ),

        safe(
          'YOGA',
          async () => {
            console.log('HOME_YOGA_API_CALL');
            const res = await _YOGA_SERVICES.getYogaSession(
              healthDiseaseId
                ? { health_disease_id: healthDiseaseId }
                : undefined,
            );
            const list = normalizeYogaSessionList(res);
            console.log('HOME_YOGA_API_RESPONSE =>', list);
            return list;
          },
          [],
        ),

        safe(
          'DIET',
          async () => {
            console.log('HOME_DIET_API_CALL');
            const list = await loadDietPlansForHome(healthDiseaseId);
            console.log('HOME_DIET_API_RESPONSE =>', list);
            return list;
          },
          [],
        ),
      ]);

      console.log('HOME_FETCH_ALL_COMPLETED');

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
      console.log('HOME_FETCH_ALL_ERROR =>', error);
      return rejectWithValue(
        error?.message ?? 'Failed to load home data',
      );
    }
  },
);

/** Dedicated diet fetch for HomePage diet section — always network */
export const fetchDietPlans = createAsyncThunk<any[], boolean | undefined>(
  'home/fetchDietPlans',
  async (_force = true, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { home?: { customerData?: any } };
      const diseaseIds = resolveHealthDiseaseIds(state?.home?.customerData);
      const healthDiseaseId =
        diseaseIds.length > 0 ? diseaseIds.join(',') : null;
      return await loadDietPlansForHome(healthDiseaseId);
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load diet plans');
    }
  },
);

export const fetchCustomerData = createAsyncThunk<any | null, boolean | undefined>(
  'home/fetchCustomer',
  async (_force = true, { rejectWithValue }) => {
    try {
      const res = await _PROFILE_SERVICES.user_profile();
      return res?.status === 200 ? res?.data ?? null : null;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to load profile');
    }
  },
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    resetHomeState: () => initialState,
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
        state.categories = action.payload.categories ?? [];
        state.SuggestDoctor = action.payload.doctors ?? [];
        state.medicineProducts = action.payload.medicineProducts ?? [];
        state.storeProducts = action.payload.storeProducts ?? [];
        state.YogaSession = action.payload.yoga ?? [];
        state.dietProducts = Array.isArray(action.payload.diet)
          ? action.payload.diet
          : [];
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
        // Always replace — empty API must clear previous diet cards
        state.dietProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDietPlans.rejected, state => {
        state.loadingDiet = false;
        state.dietProducts = [];
      })
      .addCase(fetchCustomerData.pending, state => {
        state.loadingCustomer = true;
      })
      .addCase(fetchCustomerData.fulfilled, (state, action) => {
        state.loadingCustomer = false;
        // Keep last known profile during soft refresh / auth race (null payload)
        // so home header prakriti does not flicker away.
        if (action.payload != null) {
          state.customerData = action.payload;
        }
      })
      .addCase(fetchCustomerData.rejected, state => {
        state.loadingCustomer = false;
      });
  },
});

export const {
  resetHomeState,
  updateMedicineProducts,
  updateStoreProducts,
  updateProductItem,
} = homeSlice.actions;
export const selectHomeData = (state: { home: HomeState }) => state.home;

export default homeSlice.reducer;
