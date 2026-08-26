import { apiClient } from './APIconfig';

export type ProductQuery = {
  id?: string;
  product_subcategory_id?: string;
  health_category_id?: string;
  health_disease_id?: string;
  brand_name_id?: string;
  category_id?: string;
  service_category_id?: string;
  variant_id?: string;
  search?: string;
  /** Discovery rail: home|featured|personalized|trending|best_sellers|new_arrivals|related|similar|recently_viewed */
  section?: ProductSectionType | string;
  page?: number;
  page_size?: number;
};

export type ProductSectionType =
  | 'home'
  | 'featured'
  | 'personalized'
  | 'trending'
  | 'best_sellers'
  | 'new_arrivals'
  | 'related'
  | 'similar'
  | 'recently_viewed';

export const PRODUCT_SECTION_LABELS: Record<ProductSectionType, string> = {
  home: 'For You',
  featured: 'Featured Products',
  personalized: 'Personalized For You',
  trending: 'Trending Now',
  best_sellers: 'Best Sellers',
  new_arrivals: 'New Arrivals',
  related: 'Related Products',
  similar: 'Similar Products',
  recently_viewed: 'Recently Viewed',
};

export type ProductCategoryQuery = {
  id?: string;
  service_category_id?: string;
};

const appendQueryParam = (
  query: URLSearchParams,
  key: string,
  value: unknown,
) => {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    query.append(key, String(value));
  }
};

const buildProductQuery = (params: ProductQuery = {}) => {
  const query = new URLSearchParams();

  appendQueryParam(query, 'id', params.id);
  appendQueryParam(query, 'product_subcategory_id', params.product_subcategory_id);
  appendQueryParam(query, 'health_category_id', params.health_category_id);
  appendQueryParam(query, 'health_disease_id', params.health_disease_id);
  appendQueryParam(query, 'brand_name_id', params.brand_name_id);
  appendQueryParam(query, 'category_id', params.category_id);
  appendQueryParam(query, 'service_category_id', params.service_category_id);
  appendQueryParam(query, 'variant_id', params.variant_id);
  appendQueryParam(query, 'search', params.search);
  // Only send section when caller asks — do not default on every catalog query
  appendQueryParam(query, 'section', params.section);
  appendQueryParam(query, 'page', params.page);
  appendQueryParam(query, 'page_size', params.page_size);

  const qs = query.toString();

  console.log('buildProductQueryqsssss', qs);
  return qs ? `customers/products/?${qs}` : 'customers/products/';

};

const buildProductCategoryQuery = (params: ProductCategoryQuery = {}) => {
  const query = new URLSearchParams();
  appendQueryParam(query, 'id', params.id);
  const qs = query.toString();
  return qs ? `customers/product-categories/?${qs}` : 'customers/product-categories/';
};

export const PRODUCT_PAGE_SIZE = 20;

export const normalizeApiList = (response: any): any[] => {
  if (response?.success === false) {
    return [];
  }

  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.medicines)) return data.medicines;
    if (Array.isArray(data.suggested)) return data.suggested;
    if (Array.isArray(data.suggested_products)) return data.suggested_products;
    if (Array.isArray(data.suggested_medicines)) return data.suggested_medicines;
    if (Array.isArray(data.categories)) return data.categories;
    if (Array.isArray(data.product_categories)) return data.product_categories;
    if (Array.isArray(data.health_categories)) return data.health_categories;
    if (Array.isArray(data.subcategories)) return data.subcategories;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.children)) return data.children;
  }

  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.medicines)) return response.medicines;
  if (Array.isArray(response)) return response;

  const numericKeys = Object.keys(response || {})
    .filter(key => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (numericKeys.length > 0) {
    const list = numericKeys.map(key => response[key]).filter(Boolean);
    if (list.length > 0) return list;
  }

  return [];
};

/** Flatten nested catalog/suggested product so cards always have variant_id + name. */
export const mapCatalogProductItem = (item: any) => {
  if (!item || typeof item !== 'object') return null;

  const nestedProduct =
    item.product && typeof item.product === 'object' ? item.product : null;
  const variants = Array.isArray(item.variants)
    ? item.variants
    : Array.isArray(nestedProduct?.variants)
      ? nestedProduct.variants
      : [];
  const def =
    variants.find((v: any) => v?.is_default) ||
    variants[0] ||
    item.variant ||
    nestedProduct ||
    {};

  const variantId =
    item.variant_id ??
    def.variant_id ??
    def.id ??
    nestedProduct?.variant_id ??
    null;
  const productId = item.id ?? item.product_id ?? nestedProduct?.id ?? def.product_id;
  const name = String(
    item.name ||
    item.product_name ||
    item.title ||
    nestedProduct?.name ||
    def.name ||
    '',
  ).trim();

  if (!variantId && !productId) return null;

  return {
    ...nestedProduct,
    ...def,
    ...item,
    id: productId ?? variantId,
    variant_id: variantId ?? productId,
    name: name || 'Product',
    selling_price:
      def.selling_price ??
      item.selling_price ??
      item.price ??
      nestedProduct?.selling_price,
    mrp: def.mrp ?? item.mrp ?? nestedProduct?.mrp,
    is_wishlist_item:
      def.is_wishlist_item ??
      item.is_wishlist_item ??
      nestedProduct?.is_wishlist_item,
  };
};

export const hasMoreProductPages = (
  response: any,
  resultsLength: number,
  pageSize: number = PRODUCT_PAGE_SIZE,
) => {
  const data = response?.data;

  if (data && typeof data === 'object' && data.next != null && data.next !== '') {
    return true;
  }

  if (
    data &&
    typeof data === 'object' &&
    typeof data.count === 'number' &&
    typeof data.page === 'number'
  ) {
    return data.page * pageSize < data.count;
  }

  return resultsLength >= pageSize;
};

const resolveImageUrl = (item: any): string => {
  // Prefer cover_image / media over flat image_url (cart may send example.com placeholders)
  if (typeof item?.cover_image?.media_url === 'string') {
    const cover = item.cover_image.media_url.trim();
    if (cover && !/example\.com|placeholder/i.test(cover)) return cover;
  }
  const variants = Array.isArray(item?.variants) ? item.variants : [];
  const def = variants.find((v: any) => v?.is_default) || variants[0];
  if (typeof def?.cover_image?.media_url === 'string') {
    const cover = def.cover_image.media_url.trim();
    if (cover && !/example\.com|placeholder/i.test(cover)) return cover;
  }
  const coverMedia = Array.isArray(def?.media)
    ? def.media.find((m: any) => m?.is_cover) || def.media[0]
    : null;
  if (typeof coverMedia?.media_url === 'string') {
    const mediaUrl = coverMedia.media_url.trim();
    if (mediaUrl && !/example\.com|placeholder/i.test(mediaUrl)) return mediaUrl;
  }
  if (typeof item?.image_url === 'string' && item.image_url.trim()) {
    const url = item.image_url.trim();
    if (!/example\.com|placeholder/i.test(url)) return url;
  }
  if (typeof item?.image === 'string' && !/example\.com|placeholder/i.test(item.image)) {
    return item.image;
  }
  if (item?.image?.url) return String(item.image.url);
  if (item?.icon_url) return String(item.icon_url);
  return '';
};

export const mapProductCategory = (item: any) => ({
  id: String(
    item?.id ??
    item?.product_category_id ??
    item?.category_id ??
    item?.health_category_id ??
    '',
  ),
  name: String(
    item?.name ??
    item?.category_name ??
    item?.product_category_name ??
    item?.title ??
    'Category',
  ),
  image_url: resolveImageUrl(item),
  parent_id:
    item?.parent_id != null
      ? String(item.parent_id)
      : item?.service_category_id != null
        ? String(item.service_category_id)
        : undefined,
});

export const getProduct = async (params: ProductQuery = {}) => {
  try {
    const response = await apiClient(buildProductQuery(params), {
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Discovery / ecommerce rails (catalog list).
 * related|similar should pass product id; others work with section alone (default home).
 */
export const getProductsBySection = async ({
  section = 'home',
  productId,
  page = 1,
  page_size = 12,
}: {
  section?: ProductSectionType | string;
  productId?: string | number | null;
  page?: number;
  page_size?: number;
}) => {
  const params: ProductQuery = {
    section: section || 'home',
    page,
    page_size,
  };
  if (productId != null && String(productId).trim() !== '') {
    params.id = String(productId).trim();
  }
  return getProduct(params);
};

/** Product Details discovery: GET customers/products/discovery/?section=&product_id= */
export const getProductDiscovery = async ({
  section,
  productId,
  page = 1,
  page_size = 12,
}: {
  section: ProductSectionType | string;
  productId?: string | number | null;
  page?: number;
  page_size?: number;
}) => {
  const query = new URLSearchParams();
  appendQueryParam(query, 'section', section);
  appendQueryParam(query, 'product_id', productId);
  appendQueryParam(query, 'page', page);
  appendQueryParam(query, 'page_size', page_size);
  const qs = query.toString();
  const path = qs
    ? `customers/products/discovery/?${qs}`
    : 'customers/products/discovery/';
  return apiClient(path, { method: 'GET' });
};

const buildHealthCategoryQuery = (params: ProductCategoryQuery = {}) => {
  const query = new URLSearchParams();
  appendQueryParam(query, 'id', params.id);
  appendQueryParam(query, 'service_category_id', params.service_category_id);
  const qs = query.toString();
  return qs ? `customers/health-categories/?${qs}` : 'customers/health-categories/';
};

export type HealthCategoryFetchParams = {
  /** Parent health concern id → returns disease children */
  id?: string;
  /** Dashboard service category id → top-level concerns for that service */
  service_category_id?: string;
};

/**
 * Health categories / diseases.
 * - `{ id }` → children (diseases) of a concern
 * - `{ service_category_id }` → top-level concerns for a service
 * - bare string → treated as parent concern `id` (disease list)
 */
export const getHealthCategories = async (
  options?: string | HealthCategoryFetchParams,
) => {
  try {
    const params: ProductCategoryQuery =
      typeof options === 'string'
        ? options
          ? { id: options }
          : {}
        : {
            ...(options?.id ? { id: options.id } : {}),
            ...(options?.service_category_id
              ? { service_category_id: options.service_category_id }
              : {}),
          };

    const response = await apiClient(buildHealthCategoryQuery(params), {
      method: 'GET',
    });

    if (response?.success !== false) {
      return response;
    }

    const legacyId = params.id || params.service_category_id;
    const legacyQuery = legacyId
      ? `user/health-categories/?category_id=${encodeURIComponent(String(legacyId))}`
      : 'user/health-categories/';

    return apiClient(legacyQuery, { method: 'GET' }, false);
  } catch (error) {
    throw error;
  }
};

export const getProductCategories = async (parentId?: string) => {
  try {
    const response = await apiClient(
      buildProductCategoryQuery(parentId ? { id: parentId } : {}),
      { method: 'GET' },
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getProductsByCategory = async (
  categoryId?: string,
  search?: string,
) =>
  getProduct({
    id: categoryId,
    search,
    page_size: 100,
  });

export const getProductByVariant = async (variantID: string) => {
  try {
    const response = await apiClient(
      buildProductQuery({ variant_id: variantID }),
      { method: 'GET' },
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getReviewsAll = async (payload: object) => {
  try {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== null && value !== '',
      ),
    );

    const query = new URLSearchParams(cleanPayload as any).toString();

    const response = await apiClient(`review/?${query}`, {
      method: 'GET',
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const TogglewishlistProduct = async (
  variant_ID: number,
  method: 'POST',
) => {
  try {
    const response = await apiClient(
      `favorites/products/?variant_id=${variant_ID}`,
      { method },
    );

    return response;
  } catch (error) {
    throw error;
  }
};
