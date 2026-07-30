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

export const getOrderItemReview = (item: any, order?: any) => {
  const buildReview = (source: any) => ({
    rating: Number(source?.rating ?? 0),
    review: String(source?.review ?? source?.comment ?? ''),
    images: Array.isArray(source?.attachments)
      ? source.attachments
      : Array.isArray(source?.image_urls)
        ? source.image_urls
        : [],
    isRated: source?.is_rated === true || Number(source?.rating ?? 0) > 0,
  });

  if (item?.review && (item.review.is_rated || Number(item.review.rating ?? 0) > 0)) {
    return buildReview(item.review);
  }

  const variantId = String(
    item?.variant?.variant_id ?? item?.variant_id ?? item?.product_variant_id ?? '',
  );

  if (!variantId) {
    return null;
  }

  const reviewLists = [
    order?.reviews,
    order?.product_reviews,
    order?.item_reviews,
  ].filter(Array.isArray);

  for (const list of reviewLists) {
    const matched = list.find((review: any) => {
      const reviewVariant = String(review?.variant_id ?? review?.variant ?? '');
      return reviewVariant === variantId;
    });

    if (matched) {
      return buildReview(matched);
    }
  }

  return null;
};

export const isOrderItemRated = (item: any, order?: any) => {
  if (getOrderItemReview(item, order)?.isRated) {
    return true;
  }

  if (item?.is_rated === true || item?.is_reviewed === true) {
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
