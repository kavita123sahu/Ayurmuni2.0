import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchHomeData,
  fetchCustomerData,
  fetchDietPlans,
  updateMedicineProducts,
  updateStoreProducts,
  updateProductItem,
  selectHomeData,
} from '../store/slices/homeSlice';

export const useHomeData = () => {
  const dispatch = useAppDispatch();
  const home = useAppSelector(selectHomeData);

  useEffect(() => {
    if (!home.initialized) {
      dispatch(fetchHomeData(false));
    }
  }, [dispatch, home.initialized]);

  const refreshHomeData = useCallback(async () => {
    await dispatch(fetchHomeData(true));
  }, [dispatch]);

  const fetchCustomerDataFn = useCallback(async () => {
    await dispatch(fetchCustomerData(true));
  }, [dispatch]);

  const fetchDietPlansFn = useCallback(async (force = true) => {
    await dispatch(fetchDietPlans(force));
  }, [dispatch]);

  const setMedicineProducts = useCallback(
    (updater: any[] | ((prev: any[]) => any[])) => {
      dispatch(updateMedicineProducts(updater));
    },
    [dispatch],
  );

  const setStoreProducts = useCallback(
    (updater: any[] | ((prev: any[]) => any[])) => {
      dispatch(updateStoreProducts(updater));
    },
    [dispatch],
  );

  return {
    categories: home.categories,
    SuggestDoctor: home.SuggestDoctor,
    medicineProducts: home.medicineProducts,
    storeProducts: home.storeProducts,
    dietProducts: home.dietProducts,
    productData: home.storeProducts,
    customerData: home.customerData,
    YogaSession: home.YogaSession,
    loadingCustomer: home.loadingCustomer,
    loadingCategories: home.loadingCategories,
    loadingDoctors: home.loadingDoctors,
    loadingProducts: home.loadingProducts,
    loadingDiet: home.loadingDiet,
    loadingNotification: home.loadingYoga,
    setMedicineProducts,
    setStoreProducts,
    setProductData: setStoreProducts,
    fetchCustomerData: fetchCustomerDataFn,
    fetchDietPlans: fetchDietPlansFn,
    refreshHomeData,
    loading: !home.initialized,
    refreshing: false,
  };
};

export { updateProductItem };
