import { pollOrderTracking } from "../services/OrderService";

export type OrderTrackingStep = {
  key: string;
  label: string;
  subtitle?: string;
  date?: string;
  completed: boolean;
  active: boolean;
};

/**
 * Maps backend `order_status` enum → tracker step rank.
 * Enum flow:
 *   pending → confirmed → processing → packed →
 *   dispatched → shipped → in_transit → out_for_delivery → delivered
 *   (+ cancelled / returned)
 *
 * Tracker steps:
 *   0 Placed → 1 Confirmed → 2 Processing → 3 Packed →
 *   4 Dispatched → 5 Shipped → 6 Out for delivery → 7 Delivered
 */
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  placed: 0,
  confirmed: 1,
  processing: 2,
  verified: 2,
  packed: 3,
  dispatched: 4,
  shipped: 5,
  in_transit: 5,
  out_for_delivery: 6,
  delivered: 7,
  completed: 7,
  cancelled: -1,
  returned: -1,
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
  const isReturned = currentStatus === 'returned';

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

  if (isCancelled || isReturned) {
    return [
      {
        key: 'placed',
        label: 'Order Placed',
        date: formatStepDate(order?.created_at),
        completed: true,
        active: false,
      },
      {
        key: isReturned ? 'returned' : 'cancelled',
        label: isReturned ? 'Returned' : 'Cancelled',
        subtitle:
          order?.cancellation_reason ??
          order?.return_reason ??
          (isReturned ? 'Order was returned' : 'Order was cancelled'),
        date: formatStepDate(order?.updated_at),
        completed: true,
        active: true,
      },
    ];
  }

  return [
    {
      key: 'placed',
      label: 'Order Placed',
      subtitle: 'We received your order',
      date: formatStepDate(order?.created_at ?? findHistoryDate('placed', 'pending')),
      completed: currentRank >= 0,
      active: currentRank === 0,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      subtitle: 'Order confirmed by pharmacy',
      date: formatStepDate(findHistoryDate('confirmed')),
      completed: currentRank >= 1,
      active: currentRank === 1,
    },
    {
      key: 'processing',
      label: 'Processing',
      subtitle: 'Preparing your items',
      date: formatStepDate(findHistoryDate('processing', 'verified')),
      completed: currentRank >= 2,
      active: currentRank === 2,
    },
    {
      key: 'packed',
      label: 'Packed',
      subtitle: 'Ready for dispatch',
      date: formatStepDate(findHistoryDate('packed')),
      completed: currentRank >= 3,
      active: currentRank === 3,
    },
    {
      key: 'dispatched',
      label: 'Dispatched',
      subtitle: 'Handed to courier',
      date: formatStepDate(findHistoryDate('dispatched')),
      completed: currentRank >= 4,
      active: currentRank === 4,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      subtitle:
        currentStatus === 'in_transit'
          ? 'In transit to your city'
          : 'On the way to you',
      date: formatStepDate(findHistoryDate('shipped', 'in_transit', 'transit')),
      completed: currentRank >= 5,
      active: currentRank === 5,
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      subtitle: 'Arriving today',
      date: formatStepDate(findHistoryDate('out_for_delivery')),
      completed: currentRank >= 6,
      active: currentRank === 6,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      subtitle: 'Order completed',
      date: formatStepDate(
        order?.delivered_at ?? findHistoryDate('delivered', 'completed'),
      ),
      completed: currentRank >= 7,
      active: currentRank >= 7,
    },
  ];
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

/** Accept true / "true" / 1 from API flags. */
export const isTruthyReviewFlag = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
};

const buildOrderItemReview = (source: any): OrderItemReview => {
  const rating = Number(source?.rating ?? 0);
  const flagged =
    isTruthyReviewFlag(source?.is_reviewed) ||
    isTruthyReviewFlag(source?.is_rated);
  // Only count star rating when this is explicitly a review record —
  // never treat catalog avg_rating / variant.rating as "already reviewed".
  const looksLikeReviewRecord =
    flagged ||
    Boolean(source?.order_id || source?.id || source?.review_id) ||
    Boolean(String(source?.review ?? source?.comment ?? '').trim());

  return {
    rating: Number.isFinite(rating) ? rating : 0,
    review: String(source?.review ?? source?.comment ?? ''),
    images: Array.isArray(source?.attachments)
      ? source.attachments
      : Array.isArray(source?.image_urls)
        ? source.image_urls
        : [],
    isRated: flagged || (looksLikeReviewRecord && rating > 0),
  };
};

/** Resolve product variant id from order line item shapes. */
export const resolveOrderItemVariantId = (item: any): string =>
  String(
    item?.variant?.variant_id ??
      item?.variant_id ??
      item?.product_variant_id ??
      item?.variant?.id ??
      item?.product?.variant_id ??
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
  const variantId = resolveOrderItemVariantId(item);
  const orderId = getOrderId(order);

  // 1) Explicit review fetched for this order item (GET review/?variant_id=)
  if (variantId && fetchedByVariant?.[variantId]) {
    return buildOrderItemReview(fetchedByVariant[variantId]);
  }

  // 2) Nested review on the line item (user review only)
  if (
    item?.review &&
    typeof item.review === 'object' &&
    (isTruthyReviewFlag(item.review.is_reviewed) ||
      isTruthyReviewFlag(item.review.is_rated) ||
      (Number(item.review.rating ?? 0) > 0 &&
        (item.review.order_id ||
          item.review.id ||
          item.review.review_id ||
          String(item.review.review ?? item.review.comment ?? '').trim())))
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
        // Without order_id, only accept explicit "already reviewed" flags
        return (
          isTruthyReviewFlag(review?.is_reviewed) ||
          isTruthyReviewFlag(review?.is_rated)
        );
      });

      if (matched) {
        return buildOrderItemReview(matched);
      }
    }
  }

  // 4) Flag only (is_reviewed / is_rated) — may have no star count until fetch completes
  if (
    isTruthyReviewFlag(item?.is_reviewed) ||
    isTruthyReviewFlag(item?.is_rated) ||
    isTruthyReviewFlag(item?.variant?.is_reviewed) ||
    isTruthyReviewFlag(item?.variant?.is_rated) ||
    isTruthyReviewFlag(item?.review?.is_reviewed) ||
    isTruthyReviewFlag(item?.review?.is_rated)
  ) {
    return buildOrderItemReview({
      is_reviewed: true,
      rating: Number(
        item?.review?.rating ?? item?.variant?.review_rating ?? 0,
      ),
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

/** True when this order line was already reviewed by the user (one-time). */
export const isOrderItemRated = (item: any, order?: any) => {
  if (
    isTruthyReviewFlag(item?.variant?.is_reviewed) ||
    isTruthyReviewFlag(item?.variant?.is_rated) ||
    isTruthyReviewFlag(item?.is_reviewed) ||
    isTruthyReviewFlag(item?.is_rated) ||
    isTruthyReviewFlag(item?.review?.is_reviewed) ||
    isTruthyReviewFlag(item?.review?.is_rated)
  ) {
    return true;
  }

  return Boolean(getOrderItemReview(item, order)?.isRated);
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