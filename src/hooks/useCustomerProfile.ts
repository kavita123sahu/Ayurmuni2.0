import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCustomerData } from '../store/slices/homeSlice';
import { shouldRunThrottled } from '../utils/fetchThrottle';

const FOCUS_THROTTLE_MS = 60_000;

/**
 * Lightweight customer/profile fetch only — does NOT load the full home APIs.
 * Uses cache (force:false) by default so screens don't hammer the network.
 */
export const useCustomerProfile = (options?: {
  refreshOnFocus?: boolean;
}) => {
  // Opt-in focus refresh — most screens already have profile in Redux
  const refreshOnFocus = options?.refreshOnFocus === true;
  const dispatch = useAppDispatch();
  const customerData = useAppSelector(s => s.home.customerData);
  const loadingCustomer = useAppSelector(s => s.home.loadingCustomer);
  const hasDataRef = useRef(Boolean(customerData));
  hasDataRef.current = Boolean(customerData);

  const refreshCustomer = useCallback(
    async (force = false) => {
      await dispatch(fetchCustomerData(force));
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      if (!refreshOnFocus) return;

      if (!hasDataRef.current) {
        refreshCustomer(false);
        return;
      }

      if (shouldRunThrottled('customer-profile-focus', FOCUS_THROTTLE_MS)) {
        refreshCustomer(false);
      }
    }, [refreshOnFocus, refreshCustomer]),
  );

  return {
    customerData,
    loadingCustomer,
    refreshCustomer,
  };
};
