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
  const stockQty = getProductStockQty(item);
  if (stockQty === null) {
    return true;
  }
  return stockQty <= 0;
};

export const canAddProductQty = (item: any, nextQty: number): boolean => {
  if (nextQty <= 0) {
    return true;
  }
  if (isProductOutOfStock(item)) {
    return false;
  }

  const stockQty = getProductStockQty(item);
  if (stockQty === null || !Number.isFinite(stockQty)) {
    return false;
  }

  return nextQty <= stockQty;
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
