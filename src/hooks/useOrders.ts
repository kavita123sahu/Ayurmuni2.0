import { useCallback, useEffect, useMemo, useState } from 'react';
import * as _ORDER_SERVICES from '../services/OrderService';
import {
  mapOrderToListItem,
  mapOrdersToRecentProducts,
  OrderListItem,
} from '../utils/orderUtils';

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await _ORDER_SERVICES.getOrders();
      console.log("orderlistttt", response);
      const list = Array.isArray(response?.data) ? response.data : [];
      setOrders(list);
    } catch {
      setError('Unable to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orderListItems = useMemo(
    (): OrderListItem[] => orders.map(mapOrderToListItem),
    [orders],
  );

  const recentProducts = useMemo(
    () => mapOrdersToRecentProducts(orders, 3),
    [orders],
  );

  const onRefresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  return {
    orders,
    orderListItems,
    recentProducts,
    loading,
    refreshing,
    error,
    refresh: onRefresh,
  };
}
