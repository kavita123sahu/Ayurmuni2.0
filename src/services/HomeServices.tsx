import { apiClient } from './APIconfig';
import { applyDoctorFeesToResponse } from '../utils/doctorUtils';

const appendParam = (
  query: URLSearchParams,
  key: string,
  value?: string | number | null,
) => {
  if (value == null) return;
  const text = String(value).trim();
  if (!text) return;
  query.set(key, text);
};

export const getHomeCategory = async () => {
  try {
    const response = await apiClient('customers/dashboard/categories/', {
      method: 'GET',
    });
    console.log('categoryapiresponse', response);
    return response;
  } catch (error) {
    throw error;
  }
};

type DiseaseFilter = {
  health_disease_id?: string | null;
};

/** Homepage personalized doctors: GET /customers/doctors/?suggested=true */
export const getSuggestedDoctor = async (options?: DiseaseFilter) => {
  try {
    const query = new URLSearchParams();
    query.set('suggested', 'true');
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const response = await apiClient(
      `customers/doctors/?${query.toString()}`,
      { method: 'GET' },
    );
    console.log('sugesstedresposneeee', response);
    return applyDoctorFeesToResponse(response);
  } catch (error) {
    throw error;
  }
};

/** Browse doctors — no filters unless health_disease_id is passed */
export const getDoctorsBrowse = async (options?: DiseaseFilter & {
  page_size?: number;
}) => {
  try {
    const query = new URLSearchParams();
    query.set('page_size', String(options?.page_size ?? 12));
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const response = await apiClient(
      `customers/doctors/?${query.toString()}`,
      { method: 'GET' },
    );
    return applyDoctorFeesToResponse(response);
  } catch (error) {
    throw error;
  }
};

/** Homepage personalized products: GET /customers/suggested/products/ */
export const getSuggestedProducts = async (options?: DiseaseFilter) => {
  try {
    const query = new URLSearchParams();
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const qs = query.toString();
    const path = qs
      ? `customers/suggested/products/?${qs}`
      : 'customers/suggested/products/';
    const response = await apiClient(path, { method: 'GET' });
    console.log('HOME_SUGGESTED_PRODUCTS =>', response);
    return response;
  } catch (error) {
    throw error;
  }
};

/** Homepage personalized medicines: GET /customers/suggested/medicines/ */
export const getSuggestedMedicines = async (options?: DiseaseFilter) => {
  try {
    const query = new URLSearchParams();
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const qs = query.toString();
    const path = qs
      ? `customers/suggested/medicines/?${qs}`
      : 'customers/suggested/medicines/';
    const response = await apiClient(path, { method: 'GET' });
    console.log('HOME_SUGGESTED_MEDICINES =>', response);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Guest-safe product listing via HomeServices (same token as suggested).
 * GET /customers/products/
 */
export const getHomeProducts = async (options?: {
  service_category_id?: string | null;
  health_disease_id?: string | null;
  page_size?: number;
  page?: number;
}) => {
  try {
    const query = new URLSearchParams();
    const page = options?.page ?? 1;
    const pageSize = options?.page_size ?? 12;
    query.set('page', String(page));
    query.set('page_size', String(pageSize));
    appendParam(query, 'service_category_id', options?.service_category_id);
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const response = await apiClient(`customers/products/?${query.toString()}`, {
      method: 'GET',
    });
    console.log('HOME_PRODUCTS_BROWSE =>', response);
    return response;
  } catch (error) {
    throw error;
  }
};

/** Homepage personalized diet plans: GET /customers/suggested/diet-plans/ */
export const getSuggestedDietPlans = async (options?: DiseaseFilter) => {
  try {
    const query = new URLSearchParams();
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const qs = query.toString();
    const path = qs
      ? `customers/suggested/diet-plans/?${qs}`
      : 'customers/suggested/diet-plans/';
    const response = await apiClient(path, { method: 'GET' });
    return response;
  } catch (error) {
    throw error;
  }
};

/** Browse diet plans when no disease selected (no filter params) */
export const getDietPlansBrowse = async (options?: DiseaseFilter & {
  page_size?: number;
}) => {
  try {
    const query = new URLSearchParams();
    query.set('page_size', String(options?.page_size ?? 12));
    appendParam(query, 'health_disease_id', options?.health_disease_id);
    const response = await apiClient(
      `patients/diet-plans/?${query.toString()}`,
      { method: 'GET' },
    );
    return response;
  } catch (error) {
    throw error;
  }
};
