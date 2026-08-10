import { apiClient } from "./APIconfig";

export const ORDER_PAGE_SIZE = 10;

export type GetOrdersParams = {
  page?: number;
  page_size?: number;
};

export const place_order_API = async (data: Object) => {
  try {
    const response = await apiClient('order/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyOrderPayment = async (data: object) => {
  try {
    const response = await apiClient('order/verify-payment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const normalizeOrdersList = (response: any): any[] => {
  if (response?.success === false) {
    return [];
  }

  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.orders)) return data.orders;
    if (Array.isArray(data.items)) return data.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

export const hasMoreOrderPages = (
  response: any,
  resultsLength: number,
  pageSize: number = ORDER_PAGE_SIZE,
) => {
  const data = response?.data;

  // Plain array = API returned the full list (no pagination envelope)
  if (Array.isArray(data)) {
    return false;
  }

  if (data && typeof data === 'object' && 'next' in data) {
    return data.next != null && data.next !== '';
  }

  if (
    data &&
    typeof data === 'object' &&
    typeof data.count === 'number' &&
    typeof data.page === 'number'
  ) {
    return data.page * pageSize < data.count;
  }

  if (
    data &&
    typeof data === 'object' &&
    typeof data.count === 'number'
  ) {
    return resultsLength >= pageSize && resultsLength < data.count;
  }

  return resultsLength >= pageSize;
};

export const getOrders = async (params?: GetOrdersParams) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));

    const path = query.toString() ? `order/?${query.toString()}` : 'order/';

    const response = await apiClient(path, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTransactions = async (params?: {
  page?: number;
  page_size?: number;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    const path = query.toString()
      ? `order/transactions/?${query.toString()}`
      : 'order/transactions/';

    const response = await apiClient(path, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};
