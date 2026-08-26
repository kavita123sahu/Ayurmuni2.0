import { apiClient } from "./APIconfig";
import { BaseUrl } from "../config/Key";
import { Utils } from "../common/Utils";

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

/** Fetch a single order (full detail for Order Details refresh). */
export const getOrderById = async (orderId: string | number) => {
  try {
    const response = await apiClient(`order/${orderId}/`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const extractOrderDetail = (response: any): any | null => {
  const raw =
    response?.data?.data ??
    response?.data?.order ??
    response?.data ??
    response?.order ??
    response ??
    null;

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  // List envelope accidentally returned
  if (Array.isArray(raw.results) || Array.isArray(raw.orders)) {
    return null;
  }

  if (raw.id || raw.order_id || raw.order_code) {
    return raw;
  }

  return null;
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



export const cancelOrder = async (
  orderId: string | number,
  data: object,
) => {
  try {
    const response = await apiClient(
      `order/${orderId}/cancel/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );

    return response;
  } catch (error) {
    throw error;
  }
};

export const pollOrderTracking = async (orderId: string | number) => {
  try {
    const response = await apiClient(
      `order/${orderId}/unicommerce-poll/`,
      {
        method: 'POST',
      },
    );

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Normalise the tracking payload returned by the unicommerce-poll endpoint.
 * Extracts tracking_number, carrier, current_location, eta, delivery_agent, and
 * a structured location history list so the UI can render a live tracking card.
 */
export type LiveTrackingInfo = {
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation: string;
  eta: string;
  agentName: string;
  agentPhone: string;
  locationHistory: { label: string; time: string; active: boolean }[];
  lastUpdated: string;
};

export const extractLiveTracking = (pollResponse: any): LiveTrackingInfo | null => {
  // Poll response shapes: response.data.data / response.data / response
  const raw =
    pollResponse?.data?.data ??
    pollResponse?.data ??
    pollResponse ?? {};

  const trackingNumber = String(
    raw?.tracking_number ??
    raw?.awb_number ??
    raw?.awb ??
    raw?.shipment_tracking_number ??
    raw?.tracking_id ??
    '',
  ).trim();

  if (!trackingNumber) return null;

  const carrier = String(
    raw?.carrier ??
    raw?.courier ??
    raw?.courier_name ??
    raw?.shipping_carrier ??
    '',
  ).trim();

  const currentStatus = String(
    raw?.shipment_status ??
    raw?.tracking_status ??
    raw?.current_status ??
    raw?.order_status ??
    '',
  ).trim();

  const currentLocation = String(
    raw?.current_location ??
    raw?.tracking_location ??
    raw?.last_location ??
    raw?.location ??
    '',
  ).trim();

  const eta = String(
    raw?.estimated_delivery_time ??
    raw?.delivery_eta ??
    raw?.expected_delivery ??
    raw?.promised_delivery_date ??
    '',
  ).trim();

  const agentName = String(
    raw?.delivery_partner?.name ??
    raw?.delivery_agent?.name ??
    raw?.delivery_person?.name ??
    raw?.rider_name ??
    '',
  ).trim();

  const agentPhone = String(
    raw?.delivery_partner?.phone ??
    raw?.delivery_agent?.phone ??
    raw?.delivery_person?.phone ??
    raw?.rider_phone ??
    '',
  ).trim();

  // Build location history from status_history / tracking_history / scans
  const historyRaw: any[] =
    Array.isArray(raw?.tracking_history) ? raw.tracking_history :
    Array.isArray(raw?.status_history) ? raw.status_history :
    Array.isArray(raw?.scans) ? raw.scans :
    Array.isArray(raw?.activities) ? raw.activities : [];

  const locationHistory = historyRaw
    .slice()
    .reverse() // most recent first
    .slice(0, 6) // show last 6 events
    .map((entry: any, idx: number) => {
      const label = String(
        entry?.description ??
        entry?.status ??
        entry?.activity ??
        entry?.title ??
        entry?.location ??
        'Update',
      ).trim();

      const rawTime = entry?.timestamp ?? entry?.date ?? entry?.created_at ?? entry?.time ?? '';
      let timeStr = String(rawTime).trim();
      if (timeStr) {
        const parsed = new Date(timeStr);
        if (!Number.isNaN(parsed.getTime())) {
          timeStr = parsed.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }

      return { label, time: timeStr, active: idx === 0 };
    });

  const lastUpdated = (() => {
    const v = raw?.updated_at ?? raw?.last_updated ?? '';
    if (!v) return '';
    const p = new Date(v);
    return Number.isNaN(p.getTime())
      ? v
      : p.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  })();

  return {
    trackingNumber,
    carrier,
    status: currentStatus,
    currentLocation,
    eta,
    agentName,
    agentPhone,
    locationHistory,
    lastUpdated,
  };
};

export const downloadInvoiceFile = async (orderId: string | number) => {
  // Use the same token storage key as apiClient (_TOKEN, JSON-encoded)
  const token: string | null = await Utils.getData('_TOKEN');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = `${BaseUrl?.base_url}order/${orderId}/invoice/`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/pdf, application/octet-stream, */*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Try to get error body for better debugging
    let errMsg = `Invoice download failed: ${response.status}`;
    try {
      const errBody = await response.text();
      if (errBody) errMsg += ` — ${errBody.slice(0, 200)}`;
    } catch {}
    throw new Error(errMsg);
  }

  const contentType = response.headers.get('content-type') ?? '';

  // Some backends return JSON with a URL instead of raw PDF bytes
  if (contentType.includes('application/json')) {
    const json = await response.json();
    const pdfUrl: string | undefined =
      json?.data?.url ?? json?.url ?? json?.invoice_url ?? json?.file_url;
    if (pdfUrl) {
      // Fetch the actual PDF from the signed URL (no auth needed)
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Invoice PDF fetch failed: ${pdfResponse.status}`);
      }
      return {
        success: true,
        status: pdfResponse.status,
        data: await pdfResponse.arrayBuffer(),
      };
    }
    throw new Error('Invoice URL not found in response');
  }

  return {
    success: true,
    status: response.status,
    data: await response.arrayBuffer(),
  };
};