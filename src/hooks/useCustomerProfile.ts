import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCustomerData } from '../store/slices/homeSlice';

/**
 * Lightweight customer/profile fetch only — does NOT load the full home APIs.
 * Use on Checkout and other screens that only need addresses / customer info.
 */
export const useCustomerProfile = (options?: { refreshOnFocus?: boolean }) => {
  const refreshOnFocus = options?.refreshOnFocus !== false;
  const dispatch = useAppDispatch();
  const customerData = useAppSelector(s => s.home.customerData);
  const loadingCustomer = useAppSelector(s => s.home.loadingCustomer);

  const refreshCustomer = useCallback(async () => {
    await dispatch(fetchCustomerData(true));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (!refreshOnFocus) return;
      refreshCustomer();
    }, [refreshOnFocus, refreshCustomer]),
  );

  return {
    customerData,
    loadingCustomer,
    refreshCustomer,
  };
};
