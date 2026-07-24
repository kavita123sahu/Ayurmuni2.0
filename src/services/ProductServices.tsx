import { apiClient } from './APIconfig';

export type ProductQuery = {
  id?: string;
  product_subcategory_id?: string;
  health_category_id?: string;
  health_disease_id?: string;
  category_id?: string;
  variant_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export type ProductCategoryQuery = {
  id?: string;
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
  appendQueryParam(query, 'category_id', params.category_id);
  appendQueryParam(query, 'variant_id', params.variant_id);
  appendQueryParam(query, 'search', params.search);
  appendQueryParam(query, 'page', params.page);
  appendQueryParam(query, 'page_size', params.page_size);

  const qs = query.toString();
  return qs ? `customers/products/?${qs}` : 'customers/products/';
};

const buildProductCategoryQuery = (params: ProductCategoryQuery = {}) => {
  const query = new URLSearchParams();
  appendQueryParam(query, 'id', params.id);
  const qs = query.toString();
  return qs ? `customers/product-categories/?${qs}` : 'customers/product-categories/';
};

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
    if (Array.isArray(data.categories)) return data.categories;
    if (Array.isArray(data.product_categories)) return data.product_categories;
    if (Array.isArray(data.health_categories)) return data.health_categories;
    if (Array.isArray(data.subcategories)) return data.subcategories;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.children)) return data.children;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const resolveImageUrl = (item: any): string => {
  if (typeof item?.image_url === 'string') return item.image_url;
  if (typeof item?.image === 'string') return item.image;
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

const buildHealthCategoryQuery = (params: ProductCategoryQuery = {}) => {
  const query = new URLSearchParams();
  appendQueryParam(query, 'id', params.id);
  const qs = query.toString();
  return qs ? `customers/health-categories/?${qs}` : 'customers/health-categories/';
};

export const getHealthCategories = async (parentId?: string) => {
  try {
    const response = await apiClient(
      buildHealthCategoryQuery(parentId ? { id: parentId } : {}),
      { method: 'GET' },
    );

    if (response?.success !== false) {
      return response;
    }

    const legacyQuery = parentId
      ? `user/health-categories/?category_id=${encodeURIComponent(parentId)}`
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
