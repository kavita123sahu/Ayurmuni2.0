import { pollOrderTracking } from "../services/OrderService";

export type OrderTrackingStep = {
  key: string;
  label: string;
  subtitle?: string;
  date?: string;
  completed: boolean;
  active: boolean;
};

const STATUS_RANK: Record<string, number> = {
  pending: 0,
  placed: 0,
  confirmed: 1,
  processing: 1,
  verified: 1,
  packed: 2,
  shipped: 2,
  in_transit: 2,
  out_for_delivery: 3,
  delivered: 4,
  completed: 4,
  cancelled: -1,
};

const normalizeStatus = (status?: string | null) =>
  String(status ?? 'pending').toLowerCase().replace(/\s+/g, '_');

export const getOrderStatusRank = (status?: string | null) =>
  STATUS_RANK[normalizeStatus(status)] ?? 0;

export const buildOrderTrackingSteps = (
  order: any,
): OrderTrackingStep[] => {
  const currentStatus = normalizeStatus(order?.order_status);
  const currentRank = getOrderStatusRank(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const history = Array.isArray(order?.status_history)
    ? order.status_history
    : Array.isArray(order?.tracking_history)
      ? order.tracking_history
      : [];

  const findHistoryDate = (...keys: string[]) => {
    const match = history.find((entry: any) => {
      const status = normalizeStatus(entry?.status ?? entry?.order_status ?? entry?.title);
      return keys.some(key => status.includes(key));
    });
    return match?.created_at ?? match?.date ?? match?.timestamp ?? '';
  };

  const formatStepDate = (value?: string) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const steps: OrderTrackingStep[] = [
    {
      key: 'placed',
      label: 'Order Placed',
      subtitle: 'We received your order',
      date: formatStepDate(order?.created_at ?? findHistoryDate('placed', 'pending', 'confirmed')),
      completed: currentRank >= 0 && !isCancelled,
      active: currentRank === 0,
    },
    {
      key: 'processing',
      label: 'Processing',
      subtitle: 'Packing your items',
      date: formatStepDate(findHistoryDate('processing', 'verified', 'packed')),
      completed: currentRank >= 1 && !isCancelled,
      active: currentRank === 1,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      subtitle: 'On the way to you',
      date: formatStepDate(findHistoryDate('shipped', 'transit', 'out_for_delivery')),
      completed: currentRank >= 2 && !isCancelled,
      active: currentRank === 2 || currentRank === 3,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      subtitle: 'Order completed',
      date: formatStepDate(
        order?.delivered_at ??
          order?.updated_at ??
          findHistoryDate('delivered', 'completed'),
      ),
      completed: currentRank >= 4,
      active: currentRank >= 4,
    },
  ];

  if (isCancelled) {
    return [
      {
        key: 'placed',
        label: 'Order Placed',
        date: formatStepDate(order?.created_at),
        completed: true,
        active: false,
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        subtitle: order?.cancellation_reason ?? 'Order was cancelled',
        date: formatStepDate(order?.updated_at),
        completed: true,
        active: true,
      },
    ];
  }

  return steps;
};

export const formatDeliveryAddress = (address?: any) => {
  if (!address) return '';

  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.zipcode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
};

export type OrderItemReview = {
  rating: number;
  review: string;
  images: string[];
  isRated: boolean;
};

const buildOrderItemReview = (source: any): OrderItemReview => ({
  rating: Number(source?.rating ?? 0),
  review: String(source?.review ?? source?.comment ?? ''),
  images: Array.isArray(source?.attachments)
    ? source.attachments
    : Array.isArray(source?.image_urls)
      ? source.image_urls
      : [],
  isRated:
    source?.is_reviewed === true ||
    source?.is_rated === true ||
    Number(source?.rating ?? 0) > 0,
});

const getItemVariantId = (item: any) =>
  String(
    item?.variant?.variant_id ??
      item?.variant_id ??
      item?.product_variant_id ??
      '',
  );

const getOrderId = (order?: any) =>
  String(order?.id ?? order?.order_id ?? '');

/** Prefer review for this order + variant (from order payload or fetched map). */
export const getOrderItemReview = (
  item: any,
  order?: any,
  fetchedByVariant?: Record<string, any> | null,
): OrderItemReview | null => {
  const variantId = getItemVariantId(item);
  const orderId = getOrderId(order);

  // 1) Explicit review fetched for this order item (GET review/?variant_id=)
  if (variantId && fetchedByVariant?.[variantId]) {
    return buildOrderItemReview(fetchedByVariant[variantId]);
  }

  // 2) Nested review on the line item
  if (
    item?.review &&
    (item.review.is_reviewed === true ||
      item.review.is_rated ||
      Number(item.review.rating ?? 0) > 0)
  ) {
    return buildOrderItemReview(item.review);
  }

  // 3) Reviews attached on the order object — match variant (+ order_id when present)
  const reviewLists = [
    order?.reviews,
    order?.product_reviews,
    order?.item_reviews,
  ].filter(Array.isArray);

  if (variantId) {
    for (const list of reviewLists) {
      const matched = list.find((review: any) => {
        const reviewVariant = String(
          review?.variant_id ??
            review?.variant?.variant_id ??
            review?.variant ??
            '',
        );
        if (reviewVariant !== variantId) return false;

        const reviewOrder = String(review?.order_id ?? review?.order ?? '');
        if (orderId && reviewOrder) {
          return reviewOrder === orderId;
        }
        return (
          review?.is_reviewed === true ||
          review?.is_rated === true ||
          Number(review?.rating ?? 0) > 0
        );
      });

      if (matched) {
        return buildOrderItemReview(matched);
      }
    }
  }

  // 4) Flag only (is_reviewed) — may have no star count until fetch completes
  if (item?.is_reviewed === true || item?.variant?.is_reviewed === true) {
    return buildOrderItemReview({
      is_reviewed: true,
      rating:
        item?.review?.rating ??
        item?.variant?.rating ??
        item?.rating ??
        item?.variant?.review_rating ??
        0,
      review:
        item?.review?.review ??
        item?.variant?.review ??
        item?.review_text ??
        '',
      image_urls: item?.review?.image_urls ?? item?.variant?.image_urls ?? [],
    });
  }

  return null;
};

/** True when API marks the line/variant as already reviewed (`is_reviewed`). */
export const isOrderItemRated = (item: any, order?: any) => {
  if (
    item?.variant?.is_reviewed === true ||
    item?.is_reviewed === true ||
    item?.review?.is_reviewed === true
  ) {
    return true;
  }

  if (getOrderItemReview(item, order)?.isRated) {
    return true;
  }

  if (item?.is_rated === true) {
    return true;
  }

  return false;
};

export const formatOrderDateTime = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};



export const refreshOrderTracking = async (
  orderId: string | number,
) => {
  if (!orderId) return null;

  try {
    const response = await pollOrderTracking(orderId);

    return (
      response?.data?.data ??
      response?.data ??
      response
    );
  } catch (error) {
    console.log('Order tracking error:', error);
    throw error;
  }
};