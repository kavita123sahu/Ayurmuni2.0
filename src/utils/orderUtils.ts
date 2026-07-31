import { resolveProductImageUri } from './imageUtils';

export type OrderListItem = {
  id: string;
  orderCode: string;
  title: string;
  status: string;
  date: string;
  amount: string;
  image?: string;
  moreCount?: number;
  raw: any;
};

const formatOrderDate = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatOrderStatus = (
  status?: string | null,
): 'DELIVERED' | 'IN PROGRESS' => {
  const normalized = String(status ?? '').toLowerCase();

  if (normalized === 'delivered' || normalized === 'completed') {
    return 'DELIVERED';
  }

  return 'IN PROGRESS';
};

export const mapOrderToListItem = (order: any): OrderListItem => {
  const items = Array.isArray(order?.items) ? order.items : [];
  const firstItem = items[0];
  const firstTitle =
    firstItem?.variant?.variant_title ??
    firstItem?.product_name ??
    'Medicines Order';
  const moreCount = Math.max(0, items.length - 1);

  const title =
    moreCount > 0 ? `${firstTitle} +${moreCount} more` : firstTitle;

  return {
    id: String(order?.id ?? order?.order_code ?? ''),
    orderCode: String(order?.order_code ?? order?.id ?? ''),
    title,
    status: String(order?.order_status ?? 'pending'),
    date: formatOrderDate(order?.created_at),
    amount: String(order?.total_amount ?? '0.00'),
    image: resolveProductImageUri(firstItem),
    moreCount,
    raw: order,
  };
};

/** Latest purchased items for Medicine screen "Recent Orders" preview. */
export const mapOrdersToRecentProducts = (orders: any[] = [], limit = 3) => {
  const sorted = [...orders].sort(
    (a, b) =>
      new Date(b?.created_at ?? 0).getTime() -
      new Date(a?.created_at ?? 0).getTime(),
  );

  const recentItems: Array<{
    id: string;
    variantId: string;
    name: string;
    price: number;
    image: { uri: string } | number;
    lastOrdered: string;
  }> = [];

  for (const order of sorted) {
    const orderDate = formatOrderDate(order?.created_at);
    const items = Array.isArray(order?.items) ? order.items : [];

    for (const item of items) {
      if (recentItems.length >= limit) {
        break;
      }

      const imageUri = resolveProductImageUri(item);
      recentItems.push({
        id: String(item?.id ?? item?.variant?.variant_id ?? recentItems.length),
        variantId: String(
          item?.variant?.variant_id ??
            item?.variant_id ??
            item?.product_variant_id ??
            item?.variant?.id ??
            '',
        ),
        name: item?.variant?.variant_title ?? 'Product',
        price: Number(item?.selling_price ?? item?.variant?.selling_price ?? 0),
        image: imageUri
          ? { uri: imageUri }
          : require('../assets/images/RecentsImage.png'),
        lastOrdered: orderDate,
      });
    }

    if (recentItems.length >= limit) {
      break;
    }
  }

  return recentItems;
};

export const mapBrandItem = (brand: any) => {
  const imageUrl =
    brand?.brand_image ??
    brand?.image_url ??
    brand?.logo ??
    brand?.image ??
    null;

  return {
    id: String(brand?.id ?? brand?.brand_id ?? brand?.brand_name_id ?? ''),
    name: String(brand?.brand_name ?? brand?.name ?? ''),
    ...(imageUrl ? { image: { uri: String(imageUrl) } } : {}),
  };
};
