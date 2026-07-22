import { matchesSearch } from './searchUtils';

export type ProductSortKey = 'relevance' | 'price_low' | 'price_high' | 'discount';

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
};

export const applyProductFilters = ({
  products,
  search = '',
  sortBy = 'relevance',
}: ApplyProductFiltersInput): any[] => {
  const list = Array.isArray(products) ? products : [];
  const q = search.trim().toLowerCase();

  let result = list.filter(item => {
    if (!q) return true;
    return matchesSearch(
      q,
      item?.name,
      item?.product_name,
      item?.brand_name,
      item?.subtitle,
      item?.short_description,
      item?.variant_title,
      item?.tag,
    );
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
