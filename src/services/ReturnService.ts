import { Asset } from 'react-native-image-picker';
import { apiClient } from './APIconfig';
import { UploadProfilePhoto } from './ProfileServices';
import { extractUploadUrl } from '../utils/reviewUtils';

// ─── Reasons ──────────────────────────────────────────────────────────────────

/** Labels for backend reason codes (`exception_reasons` on eligibility items). */
export const RETURN_REASONS: { code: string; label: string }[] = [
  { code: 'damaged_product', label: 'Product arrived damaged' },
  { code: 'incorrect_product', label: 'Received wrong / incorrect product' },
  { code: 'tampered_product', label: 'Package or seal was tampered' },
  { code: 'expired_product', label: 'Product is expired or near expiry' },
  { code: 'material_defect', label: 'Manufacturing / material defect' },
  { code: 'incorrect_fulfilment', label: 'Wrong quantity or item missing' },
  { code: 'other', label: 'Other' },
];

const humanizeCode = (code: string) =>
  code.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());

/** Reason options for the picker: backend codes first, then "Other". */
export const buildReasonOptions = (codes: string[]) => {
  if (!codes.length) return RETURN_REASONS;
  const options = codes.map(code => ({
    code,
    label: RETURN_REASONS.find(r => r.code === code)?.label ?? humanizeCode(code),
  }));
  return [...options, { code: 'other', label: 'Other' }];
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReturnEligibilityItem = {
  orderItemId: string;
  name: string;
  image?: string;
  /** Quantity ordered. */
  quantity: number;
  /** Max quantity that can still be returned. */
  returnableQuantity: number;
  price: number;
  eligible: boolean;
  reason: string;
  /** Reason codes accepted for this item (`exception_reasons`). */
  allowedReasons: string[];
  windowEndsAt: string;
  raw: any;
};

export type ReturnEligibility = {
  eligible: boolean;
  message: string;
  isCod: boolean;
  /** Refund method the backend will use for prepaid orders (original source). */
  refundMode: string;
  returnWindowEndsAt: string;
  /** Union of every item's `exception_reasons`. */
  allowedReasons: string[];
  orderCode: string;
  deliveredAt: string;
  items: ReturnEligibilityItem[];
  raw: any;
};

export type ReturnRequestItem = { order_item_id: string; quantity: number };

export type ReturnMedia = { media_url: string; media_type: 'image' | 'video' };

export type CreateReturnPayload = {
  reason: string;
  reason_code?: string;
  items: ReturnRequestItem[];
  media?: ReturnMedia[];
  upi_id?: string;
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  orderCode: string;
  status: string;
  reason: string;
  reasonCode: string;
  reviewNote: string;
  reviewedAt: string;
  reversePickupCode: string;
  refundDetails: {
    account_holder_name?: string;
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
  };
  refundRequest: any;
  items: {
    id: string;
    orderItemId: string;
    quantity: number;
    skuCode: string;
    variantId: string;
    sellingPrice: number;
  }[];
  media: ReturnMedia[];
  createdAt: string;
  updatedAt: string;
  raw: any;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isTrue = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1';

const str = (...values: unknown[]) => {
  for (const v of values) {
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

const num = (...values: unknown[]) => {
  for (const v of values) {
    const n = Number(v);
    if (v != null && v !== '' && Number.isFinite(n)) return n;
  }
  return 0;
};

const unwrap = (response: any) => response?.data?.data ?? response?.data ?? response ?? {};

export const isCodOrder = (order: any) => {
  const method = str(
    order?.payment_method,
    order?.payment_type,
    order?.payment_mode,
  ).toLowerCase();
  return (
    isTrue(order?.is_cod) ||
    method === 'cod' ||
    method.includes('cash')
  );
};

// ─── Eligibility ──────────────────────────────────────────────────────────────

const mapEligibilityItem = (item: any, orderItems: any[]): ReturnEligibilityItem => {
  const orderItemId = str(item?.order_item_id, item?.id, item?.item_id);
  const variantId = str(item?.variant_id);
  const orderLine =
    orderItems.find(line => str(line?.id, line?.order_item_id) === orderItemId) ??
    (variantId
      ? orderItems.find(
          line => str(line?.variant_id, line?.variant?.id, line?.variant?.variant_id) === variantId,
        )
      : undefined) ??
    item?.order_item ??
    {};
  const quantity = num(item?.ordered_quantity, item?.quantity, orderLine?.quantity, 1) || 1;
  const returnableQuantity = num(
    item?.available_quantity,
    item?.returnable_quantity,
    item?.eligible_quantity,
    item?.max_return_quantity,
    item?.remaining_quantity,
    quantity,
  );
  const eligible =
    item?.eligible != null ? isTrue(item.eligible) : isTrue(item?.is_eligible);
  return {
    orderItemId,
    name: str(
      item?.product_name,
      item?.variant_title,
      item?.variant?.variant_title,
      orderLine?.variant?.variant_title,
      orderLine?.product_name,
      orderLine?.name,
      item?.sku_code,
      'Product',
    ),
    image: str(
      item?.image,
      item?.image_url,
      item?.variant?.image,
      orderLine?.variant?.image,
      orderLine?.variant?.images?.[0]?.image_url,
      orderLine?.image,
      orderLine?.image_url,
      orderLine?.variant?.image_url,
    ) || undefined,
    quantity,
    returnableQuantity: eligible ? Math.max(1, Math.min(returnableQuantity, quantity)) : 0,
    price: num(item?.selling_price, item?.price, orderLine?.selling_price, orderLine?.price),
    eligible,
    reason: str(
      item?.reason,
      item?.message,
      item?.ineligible_reason,
      item?.ineligibility_reason,
      eligible ? '' : 'Not eligible for return',
    ),
    allowedReasons: Array.isArray(item?.exception_reasons)
      ? item.exception_reasons.map((code: unknown) => String(code)).filter(Boolean)
      : [],
    windowEndsAt: str(item?.window_ends_at, item?.return_window_ends_at),
    raw: item,
  };
};

export const normalizeReturnEligibility = (
  response: any,
  order?: any,
): ReturnEligibility => {
  const data = unwrap(response);
  const orderItems: any[] = Array.isArray(order?.items) ? order.items : [];
  const rawItems: any[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.eligible_items)
      ? [
          ...data.eligible_items.map((i: any) => ({ ...i, eligible: i?.eligible ?? true })),
          ...(Array.isArray(data?.ineligible_items)
            ? data.ineligible_items.map((i: any) => ({ ...i, eligible: false }))
            : []),
        ]
      : [];

  const items = rawItems.map(item => mapEligibilityItem(item, orderItems));
  const eligible =
    data?.eligible != null
      ? isTrue(data.eligible)
      : items.some(item => item.eligible);

  const allowedReasons = Array.from(new Set(items.flatMap(item => item.allowedReasons)));
  const latestWindow = items
    .map(item => item.windowEndsAt)
    .filter(Boolean)
    .sort()
    .pop();

  return {
    eligible,
    // Envelope message ("…retrieved successfully") is not a user-facing reason.
    message: str(
      data?.message,
      data?.reason,
      !eligible && items.length ? 'None of the items in this order can be returned right now.' : '',
    ),
    isCod:
      isTrue(data?.is_cod) ||
      str(data?.payment_method, data?.payment_type).toLowerCase() === 'cod' ||
      (data?.is_cod == null && isCodOrder(order)),
    refundMode: str(data?.refund_mode, data?.refund_method),
    returnWindowEndsAt: str(
      data?.return_window_ends_at,
      data?.return_window_end,
      data?.return_deadline,
      latestWindow,
    ),
    allowedReasons,
    orderCode: str(data?.order_code, order?.order_code),
    deliveredAt: str(data?.delivered_at, order?.delivered_at),
    items,
    raw: data,
  };
};

/** GET /order/{order_id}/return-eligibility/?reason_code= */
export const getReturnEligibility = async (
  orderId: string | number,
  reasonCode?: string,
) => {
  const qs = reasonCode ? `?reason_code=${encodeURIComponent(reasonCode)}` : '';
  const response = await apiClient(`order/${orderId}/return-eligibility/${qs}`, {
    method: 'GET',
  });
  console.log('RETURN_ELIGIBILITY =>', JSON.stringify(response));
  return response;
};

// ─── Create ───────────────────────────────────────────────────────────────────

/** POST /order/{order_id}/returns/ */
export const createReturnRequest = async (
  orderId: string | number,
  payload: CreateReturnPayload,
) => {
  console.log('RETURN_CREATE_PAYLOAD =>', JSON.stringify(payload));
  const response = await apiClient(`order/${orderId}/returns/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  console.log('RETURN_CREATE_RESPONSE =>', JSON.stringify(response));
  return response;
};

export const uploadReturnMedia = async (
  asset: Pick<Asset, 'uri' | 'type' | 'fileName'>,
): Promise<string> => {
  if (!asset.uri) throw new Error('Missing file uri');
  const formData = new FormData();
  formData.append('image', {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `return_${Date.now()}.jpg`,
  } as any);
  formData.append('dir', 'return_files');
  const response = await UploadProfilePhoto(formData);
  const url = extractUploadUrl(response);
  if (!response?.success || !url) {
    throw new Error(response?.message || 'Upload failed');
  }
  return url;
};

// ─── List / detail ────────────────────────────────────────────────────────────

export const normalizeReturnRequest = (raw: any): ReturnRequest => ({
  id: str(raw?.id),
  orderId: str(raw?.order_id, raw?.order?.id),
  orderCode: str(raw?.order_code, raw?.order?.order_code),
  status: str(raw?.status, 'requested').toLowerCase(),
  reason: str(raw?.reason),
  reasonCode: str(raw?.reason_code),
  reviewNote: str(raw?.review_note),
  reviewedAt: str(raw?.reviewed_at),
  reversePickupCode: str(raw?.unicommerce_reverse_pickup_code, raw?.reverse_pickup_code),
  refundDetails: raw?.refund_details ?? {},
  refundRequest: raw?.refund_request ?? null,
  items: (Array.isArray(raw?.items) ? raw.items : []).map((item: any) => ({
    id: str(item?.id),
    orderItemId: str(item?.order_item_id),
    quantity: num(item?.quantity, 1),
    skuCode: str(item?.sku_code),
    variantId: str(item?.variant_id),
    sellingPrice: num(item?.selling_price),
  })),
  media: Array.isArray(raw?.media) ? raw.media : [],
  createdAt: str(raw?.created_at),
  updatedAt: str(raw?.updated_at),
  raw,
});

export const normalizeReturnList = (response: any): ReturnRequest[] => {
  if (response?.success === false) return [];
  const data = response?.data;
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.data?.results)
        ? data.data.results
        : [];
  return list.map(normalizeReturnRequest);
};

export const hasMoreReturnPages = (response: any) => {
  const next = response?.data?.next ?? response?.data?.data?.next;
  return next != null && next !== '';
};

/** GET /order/{order_id}/returns/ — return requests for one order. */
export const getOrderReturns = async (orderId: string | number) =>
  apiClient(`order/${orderId}/returns/`, { method: 'GET' });

/** GET /order/returns/ — every return request of the customer. */
export const getAllReturns = async (params?: { page?: number; page_size?: number }) => {
  const parts: string[] = [];
  if (params?.page) parts.push(`page=${params.page}`);
  if (params?.page_size) parts.push(`page_size=${params.page_size}`);
  return apiClient(`order/returns/${parts.length ? `?${parts.join('&')}` : ''}`, {
    method: 'GET',
  });
};

/** GET /order/returns/{return_id}/ */
export const getReturnById = async (returnId: string | number) => {
  const response = await apiClient(`order/returns/${returnId}/`, { method: 'GET' });
  const data = unwrap(response);
  return data && typeof data === 'object' && data.id ? normalizeReturnRequest(data) : null;
};

// ─── Status display ───────────────────────────────────────────────────────────

export const RETURN_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; hint: string }
> = {
  requested: { label: 'Requested', color: '#92400E', bg: '#FEF3C7', hint: 'We are reviewing your request.' },
  pending: { label: 'Under review', color: '#92400E', bg: '#FEF3C7', hint: 'We are reviewing your request.' },
  approved: { label: 'Approved', color: '#1E40AF', bg: '#DBEAFE', hint: 'Pickup will be scheduled soon.' },
  pickup_scheduled: { label: 'Pickup scheduled', color: '#5B21B6', bg: '#EDE9FE', hint: 'Keep the items packed for pickup.' },
  picked_up: { label: 'Picked up', color: '#5B21B6', bg: '#EDE9FE', hint: 'Items are on their way back to us.' },
  received: { label: 'Received', color: '#0369A1', bg: '#E0F2FE', hint: 'Items received. Refund is being processed.' },
  refund_initiated: { label: 'Refund initiated', color: '#166534', bg: '#DCFCE7', hint: 'Refund has been initiated.' },
  refunded: { label: 'Refunded', color: '#166534', bg: '#DCFCE7', hint: 'Refund completed.' },
  completed: { label: 'Completed', color: '#166534', bg: '#DCFCE7', hint: 'Return completed.' },
  rejected: { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2', hint: 'Your return request was rejected.' },
  cancelled: { label: 'Cancelled', color: '#475569', bg: '#F1F5F9', hint: 'This return request was cancelled.' },
};

export const getReturnStatusMeta = (status: string) =>
  RETURN_STATUS_META[status] ?? {
    label: status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Requested',
    color: '#475569',
    bg: '#F1F5F9',
    hint: '',
  };

/** Ordered progress steps shown on the return detail timeline. */
export const RETURN_STEPS = [
  { key: 'requested', label: 'Return requested' },
  { key: 'approved', label: 'Approved' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'received', label: 'Received at warehouse' },
  { key: 'refunded', label: 'Refund completed' },
] as const;

const STEP_INDEX: Record<string, number> = {
  requested: 0,
  pending: 0,
  approved: 1,
  pickup_scheduled: 1,
  picked_up: 2,
  received: 3,
  refund_initiated: 3,
  refunded: 4,
  completed: 4,
};

export const getReturnStepIndex = (status: string) => STEP_INDEX[status] ?? 0;

export const getReasonLabel = (code: string, fallback = '') =>
  RETURN_REASONS.find(r => r.code === code)?.label ?? fallback;

// ─── Validation ───────────────────────────────────────────────────────────────

export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const ACCOUNT_RE = /^\d{9,18}$/;

export const maskAccount = (value?: string) => {
  const v = String(value || '');
  return v.length > 4 ? `•••• ${v.slice(-4)}` : v;
};
