import { apiClient } from './apiClient';

export const getOrderFeeQuote = async (payload) => {
  const body = { cart_item_ids: payload.cart_item_ids || [] };
  const coupon = String(payload.coupon_code || '').trim();
  if (coupon) body.coupon_code = coupon;
  return apiClient('order/fee-quote/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const placeOrder = async (data) =>
  apiClient('order/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyOrderPayment = async (data) =>
  apiClient('order/verify-payment/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getOrders = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.page_size) query.set('page_size', String(params.page_size));
  const qs = query.toString();
  return apiClient(qs ? `order/?${qs}` : 'order/', { method: 'GET' });
};

export const getTransactions = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.page_size) query.set('page_size', String(params.page_size));
  const qs = query.toString();
  return apiClient(qs ? `order/transactions/?${qs}` : 'order/transactions/', {
    method: 'GET',
  });
};

export const getOrderById = async (orderId) =>
  apiClient(`order/${encodeURIComponent(String(orderId))}/`, { method: 'GET' });

export const normalizeOrdersList = (response) => {
  if (response?.success === false) return [];
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

export const extractOrderDetail = (response) => {
  const raw =
    response?.data?.data ??
    response?.data?.order ??
    response?.data ??
    response?.order ??
    response ??
    null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (Array.isArray(raw.results) || Array.isArray(raw.orders)) return null;
  if (raw.id || raw.order_id || raw.order_code) return raw;
  return null;
};
