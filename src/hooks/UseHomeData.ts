import { useCallback, useEffect, useRef } from 'react';
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
  const emptyReloadTriedRef = useRef(false);

  useEffect(() => {
    if (!home.initialized) {
      emptyReloadTriedRef.current = false;
      // Always network — home slice no longer caches
      dispatch(fetchHomeData());
      return;
    }

    // One retry if catalogs came back empty (guest token ready after first paint)
    const noCatalog =
      !(home.medicineProducts?.length > 0) &&
      !(home.storeProducts?.length > 0);
    if (noCatalog && !emptyReloadTriedRef.current) {
      emptyReloadTriedRef.current = true;
      dispatch(fetchHomeData());
    }
  }, [
    dispatch,
    home.initialized,
    home.medicineProducts?.length,
    home.storeProducts?.length,
  ]);

  const refreshHomeData = useCallback(async () => {
    await dispatch(fetchHomeData());
  }, [dispatch]);

  const fetchCustomerDataFn = useCallback(async (_force = false) => {
    await dispatch(fetchCustomerData());
  }, [dispatch]);

  const fetchDietPlansFn = useCallback(async (_force = true) => {
    await dispatch(fetchDietPlans());
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
