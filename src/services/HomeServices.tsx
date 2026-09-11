import { apiClient } from './APIconfig';

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

/** Homepage personalized doctors: GET /customers/doctors/?suggested=true */
export const getSuggestedDoctor = async () => {
  try {
    const response = await apiClient('customers/doctors/?suggested=true', {
      method: 'GET',
    });
    console.log('sugesstedresposneeee', response);
    return response;
  } catch (error) {
    throw error;
  }
};

/** Homepage personalized products: GET /customers/suggested/products/ */
export const getSuggestedProducts = async () => {
  try {
    const response = await apiClient('customers/suggested/products/', {
      method: 'GET',
    });
    console.log('sugesstedresposneeee', response);
    return response;
  } catch (error) {
    throw error;
  }
};

/** Homepage personalized medicines: GET /customers/suggested/medicines/ */
export const getSuggestedMedicines = async () => {
  try {
    const response = await apiClient('customers/suggested/medicines/', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/** Homepage personalized diet plans: GET /customers/suggested/diet-plans/ */
export const getSuggestedDietPlans = async () => {
  try {
    const response = await apiClient('customers/suggested/diet-plans/', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};
