/**
 * Stock from API `quantity` — same rule for listing cards and details.
 *
 * Listing example:
 *   { product_name, variant_id, quantity: 900 } → in stock
 *   { quantity: 0 } → out of stock (disabled ADD, still tappable for details)
 */

export const LOW_STOCK_THRESHOLD = 10;

const toNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const truthyFlag = (value: unknown) =>
  value === true ||
  value === 1 ||
  value === '1' ||
  String(value || '').toLowerCase() === 'true';

const stockStatusText = (item: any) =>
  String(
    item?.stock_status ??
      item?.availability ??
      item?.variant?.stock_status ??
      item?.variant?.availability ??
      '',
  ).toLowerCase();

/** Cart/API out-of-stock flags (do not treat cart qty as inventory). */
export const hasOutOfStockFlag = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;
  if (
    item.in_stock === false ||
    item.is_available === false ||
    item.available === false ||
    item.variant?.in_stock === false ||
    item.variant?.is_available === false ||
    item.variant?.available === false
  ) {
    return true;
  }
  const status = stockStatusText(item);
  if (
    status.includes('out_of_stock') ||
    status.includes('out of stock') ||
    status === 'unavailable' ||
    status === 'sold_out' ||
    status === 'sold out'
  ) {
    return true;
  }
  return (
    truthyFlag(item._isOutOfStock) ||
    truthyFlag(item.out_of_stock) ||
    truthyFlag(item.is_out_of_stock) ||
    truthyFlag(item.variant?.out_of_stock) ||
    truthyFlag(item.variant?.is_out_of_stock)
  );
};

const STOCK_FIELDS = [
  'stock_quantity',
  'available_quantity',
  'available_stock',
  'inventory_quantity',
  'stock_qty',
  'available_qty',
  'remaining_stock',
  'max_quantity',
  'stock',
  'inventory',
];

/** Listing inventory seen this session, keyed by variant id. */
const listingStockByVariant = new Map<string, number>();

const variantKey = (item: any): string =>
  String(
    item?.variant_id ??
      item?.variant?.variant_id ??
      item?.variant?.id ??
      '',
  ).trim();

export const rememberListingStock = (
  variantId: string | number | null | undefined,
  qty: number | null | undefined,
) => {
  const id = String(variantId ?? '').trim();
  if (!id || qty == null || !Number.isFinite(Number(qty))) return;
  listingStockByVariant.set(id, Number(qty));
};

/** Remember catalog `quantity` as inventory (never call this with a cart line). */
export const trackListingStock = (item: any) => {
  if (!item || typeof item !== 'object') return;
  const qty = getProductStockQty(item);
  if (qty == null) return;
  rememberListingStock(variantKey(item) || item?.id, qty);
};

const readStockField = (source: any): number | null => {
  if (!source || typeof source !== 'object') return null;
  for (const key of STOCK_FIELDS) {
    const n = toNumber(source[key]);
    if (n !== null) return n;
  }
  return null;
};

/**
 * Inventory on a cart line. Never uses line `quantity` (that is units in cart).
 */
export const getCartInventoryQty = (item: any): number | null => {
  if (!item || typeof item !== 'object') return null;
  if (hasOutOfStockFlag(item)) return 0;

  const fromFields =
    readStockField(item) ??
    readStockField(item.variant) ??
    readStockField(item.product);

  if (fromFields !== null) return fromFields;

  const remembered = listingStockByVariant.get(variantKey(item));
  if (remembered != null) return remembered;

  // Nested variant.quantity is inventory. Line `quantity` is units in cart
  // (they can be equal — stock 1 and 1 already in cart must still cap at 1).
  const variantQty = toNumber(item.variant?.quantity);
  if (variantQty !== null && item.variant && (item.cart_item_id || item.id)) {
    return variantQty;
  }

  return null;
};

/**
 * Inventory count from API `quantity` (listing or selected variant).
 */
export const getProductStockQty = (item: any): number | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  // Prefer top-level quantity (product list / variant detail)
  const topQuantity = toNumber(item.quantity);
  if (topQuantity !== null) {
    return topQuantity;
  }

  // Nested variant only if top-level quantity is absent
  if (item.variant && typeof item.variant === 'object') {
    const nestedQuantity = toNumber(item.variant.quantity);
    if (nestedQuantity !== null) {
      return nestedQuantity;
    }
  }

  return null;
};

/**
 * quantity <= 0 → out of stock
 * quantity > 0 → in stock
 * missing quantity → out of stock (cannot sell unknown inventory)
 */
export const isProductOutOfStock = (item: any): boolean => {
  if (hasOutOfStockFlag(item)) return true;
  const stockQty = getProductStockQty(item);
  if (stockQty === null) {
    return true;
  }
  return stockQty <= 0;
};

/** User-facing block when next cart qty is not allowed. */
export const getAddQtyBlockMessage = (
  item: any,
  nextQty: number,
  options?: { cartLine?: boolean },
): string | null => {
  if (nextQty <= 0) return null;

  if (options?.cartLine) {
    if (hasOutOfStockFlag(item)) {
      return 'This product is not available';
    }
    const stock = getCartInventoryQty(item);
    if (stock === null) return null;
    if (stock <= 0) return 'This product is not available';
    if (nextQty > stock) {
      return stock === 1
        ? 'Only 1 item available.'
        : `Only ${stock} items available.`;
    }
    return null;
  }

  if (isProductOutOfStock(item)) {
    return 'This product is not available';
  }
  const stockQty = getProductStockQty(item);
  if (stockQty === null || stockQty <= 0) {
    return 'This product is not available';
  }
  if (nextQty > stockQty) {
    return stockQty === 1
      ? 'Only 1 item available.'
      : `Only ${stockQty} items available.`;
  }
  return null;
};

export const canAddProductQty = (item: any, nextQty: number): boolean =>
  getAddQtyBlockMessage(item, nextQty) == null;

/** Friendly payment/checkout copy when the API rejects stock. */
export const formatOrderStockError = (message?: string | null): string | null => {
  const text = String(message || '').trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  if (
    lower.includes('out of stock') ||
    lower.includes('out_of_stock') ||
    lower.includes('insufficient stock') ||
    lower.includes('not available') ||
    lower.includes('no stock')
  ) {
    return 'Some items are out of stock. Please update your cart and try again.';
  }
  return null;
};

export type ProductStockTone = 'out_of_stock' | 'low_stock' | 'in_stock';

/** quantity > 0 and <= LOW_STOCK_THRESHOLD */
export const isProductLowStock = (item: any): boolean => {
  const stockQty = getProductStockQty(item);
  if (stockQty === null || stockQty <= 0) {
    return false;
  }
  return stockQty <= LOW_STOCK_THRESHOLD;
};

export const getProductStockDisplay = (
  item: any,
): {
  qty: number | null;
  tone: ProductStockTone;
  label: string;
  color: string;
  backgroundColor: string;
} => {
  const qty = getProductStockQty(item);

  if (qty === null || qty <= 0) {
    return {
      qty,
      tone: 'out_of_stock',
      label: 'Out of stock',
      color: '#DC2626',
      backgroundColor: '#FEE2E2',
    };
  }

  if (qty <= LOW_STOCK_THRESHOLD) {
    return {
      qty,
      tone: 'low_stock',
      label: `Low stock — only ${qty} left`,
      color: '#B45309',
      backgroundColor: '#FEF3C7',
    };
  }

  return {
    qty,
    tone: 'in_stock',
    label: 'In stock',
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
  };
};
