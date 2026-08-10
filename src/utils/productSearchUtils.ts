import { matchesSearch } from './searchUtils';

export type ProductSortKey = 'relevance' | 'price_low' | 'price_high' | 'discount';

export type PriceRangeKey = 'all' | 'under_200' | '200_500' | '500_1000' | 'above_1000';

export const PRICE_RANGE_OPTIONS: { key: PriceRangeKey; label: string; min?: number; max?: number }[] = [
  { key: 'all', label: 'All prices' },
  { key: 'under_200', label: 'Under ₹200', max: 200 },
  { key: '200_500', label: '₹200 - ₹500', min: 200, max: 500 },
  { key: '500_1000', label: '₹500 - ₹1000', min: 500, max: 1000 },
  { key: 'above_1000', label: 'Above ₹1000', min: 1000 },
];

export const PRODUCT_SORT_OPTIONS: { key: ProductSortKey; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'discount', label: 'Max Discount' },
];

const getPrice = (item: any) =>
  Number(item?.selling_price ?? item?.price ?? 0);

const getDiscountPct = (item: any) => {
  const mrp = Number(item?.mrp ?? 0);
  const price = getPrice(item);
  if (mrp <= price || mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export type ApplyProductFiltersInput = {
  products: any[];
  search?: string;
  sortBy?: ProductSortKey;
  brandName?: string | null;
  priceRange?: PriceRangeKey;
};

export const applyProductFilters = ({
  products,
  search = '',
  sortBy = 'relevance',
  brandName = null,
  priceRange = 'all',
}: ApplyProductFiltersInput): any[] => {
  const list = Array.isArray(products) ? products : [];
  const q = search.trim().toLowerCase();
  const priceOption = PRICE_RANGE_OPTIONS.find(option => option.key === priceRange);

  let result = list.filter(item => {
    if (q) {
      const matchesQuery = matchesSearch(
        q,
        item?.name,
        item?.product_name,
        item?.brand_name,
        item?.subtitle,
        item?.short_description,
        item?.variant_title,
        item?.tag,
      );
      if (!matchesQuery) return false;
    }

    if (brandName) {
      const itemBrand = String(item?.brand_name ?? item?.brand?.name ?? '').trim();
      if (itemBrand !== brandName) return false;
    }

    if (priceOption && priceOption.key !== 'all') {
      const price = getPrice(item);
      if (priceOption.min !== undefined && price < priceOption.min) return false;
      if (priceOption.max !== undefined && price > priceOption.max) return false;
    }

    return true;
  });

  if (sortBy === 'price_low') {
    result = [...result].sort((a, b) => getPrice(a) - getPrice(b));
  } else if (sortBy === 'price_high') {
    result = [...result].sort((a, b) => getPrice(b) - getPrice(a));
  } else if (sortBy === 'discount') {
    result = [...result].sort((a, b) => getDiscountPct(b) - getDiscountPct(a));
  }

  return result;
};

export const getSortLabel = (sortBy: ProductSortKey) =>
  PRODUCT_SORT_OPTIONS.find(option => option.key === sortBy)?.label ?? 'Relevance';

const getProductCategoryId = (item: any) =>
  String(
    item?.category_id ??
      item?.dashboard_category_id ??
      item?.category?.id ??
      item?.category?.category_id ??
      '',
  );

export const filterProductsByCategory = (
  products: any[],
  categoryId?: string | null,
) => {
  const list = Array.isArray(products) ? products : [];
  if (!categoryId) {
    return list;
  }

  const normalizedCategoryId = String(categoryId);
  const filtered = list.filter(
    item => getProductCategoryId(item) === normalizedCategoryId,
  );

  return filtered.length > 0 ? filtered : list;
};
