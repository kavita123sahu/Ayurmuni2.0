import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchHomeData,
  fetchCustomerData,
  updateProductData,
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

  const setProductData = useCallback(
    (updater: any[] | ((prev: any[]) => any[])) => {
      dispatch(updateProductData(updater));
    },
    [dispatch],
  );

  return {
    categories: home.categories,
    SuggestDoctor: home.SuggestDoctor,
    productData: home.productData,
    customerData: home.customerData,
    YogaSession: home.YogaSession,
    loadingCustomer: home.loadingCustomer,
    loadingCategories: home.loadingCategories,
    loadingDoctors: home.loadingDoctors,
    loadingProducts: home.loadingProducts,
    loadingNotification: home.loadingYoga,
    setProductData,
    fetchCustomerData: fetchCustomerDataFn,
    refreshHomeData,
    loading: !home.initialized,
    refreshing: false,
  };
};
