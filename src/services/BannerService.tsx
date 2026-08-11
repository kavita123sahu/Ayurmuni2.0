import { apiClient } from './APIconfig';

export type BannerScreen = 'home' | 'product' | 'consult' | 'medicine';

/** Match API `service_category_code` (e.g. PRODU) to app screens */
const SCREEN_SERVICE_CODES: Record<BannerScreen, string[]> = {
  home: [],
  product: ['PRODU', 'PROD', 'PRODUCT', 'PRODUCTS', 'STORE', 'SHOP'],
  consult: ['CONS', 'CONSULT', 'DOCT', 'DOCTOR', 'TELE'],
  medicine: ['MEDI', 'MEDIC', 'MEDICINE', 'PHAR', 'AYUR'],
};

const SCREEN_ALIASES: Record<BannerScreen, string[]> = {
  home: ['home', 'home_page', 'homepage', 'home-page'],
  product: ['product', 'products', 'product_page', 'store', 'shop'],
  consult: ['consult', 'consultation', 'doctor', 'consult_page', 'doctors'],
  medicine: ['medicine', 'medicines', 'pharmacy', 'medicine_page'],
};

/**
 * apiClient spreads JSON onto the response object.
 * Handle `data` array, nested lists, and `{0:...,1:...}` spreads.
 */
const toList = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.banners)) return payload.banners;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.banners)) return payload.data.banners;

  // apiClient: { success, 0: item, 1: item, ... }
  const numericKeys = Object.keys(payload)
    .filter(key => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (numericKeys.length > 0) {
    return numericKeys.map(key => payload[key]).filter(Boolean);
  }

  return [];
};

const isBannerActive = (item: any) => {
  const visible = item?.is_active ?? item?.visible ?? item?.is_visible;
  return !(visible === false || visible === 0 || visible === '0');
};

export const getBannerImageUri = (item: any): string => {
  if (typeof item === 'string' && /^https?:\/\//i.test(item.trim())) {
    return item.trim();
  }
  if (typeof item === 'number') {
    return '';
  }
  const uri =
    item?.media_url ||
    item?.image_url ||
    item?.banner_image ||
    (typeof item?.image === 'string' ? item.image : '') ||
    item?.url ||
    item?.cover_image?.media_url ||
    '';
  const out = String(uri || '').trim();
  return /^https?:\/\//i.test(out) || out.startsWith('/') ? out : out;
};

export const normalizeBannerImages = (banners: any[]): string[] =>
  (Array.isArray(banners) ? banners : [])
    .map(getBannerImageUri)
    .filter(uri => typeof uri === 'string' && uri.length > 0);

/**
 * Prefer service_category_id, then service_category_code, then legacy screen aliases.
 * Home shows all active banners when no service filter matches.
 */
export const filterBannersForScreen = (
  banners: any[],
  screen: BannerScreen,
  serviceCategoryId?: string | null,
): any[] => {
  const list = (Array.isArray(banners) ? banners : []).filter(isBannerActive);

  if (!list.length) return [];

  if (serviceCategoryId != null && String(serviceCategoryId).trim() !== '') {
    const id = String(serviceCategoryId).trim();
    const byId = list.filter(
      item => String(item?.service_category_id ?? '').trim() === id,
    );
    if (byId.length > 0) {
      return byId;
    }
  }

  const codes = SCREEN_SERVICE_CODES[screen] || [];
  if (codes.length > 0) {
    const byCode = list.filter(item => {
      const code = String(item?.service_category_code ?? '')
        .trim()
        .toUpperCase();
      if (!code) return false;
      return codes.some(
        c => code === c || code.startsWith(c) || code.includes(c),
      );
    });
    if (byCode.length > 0) {
      return byCode;
    }
  }

  if (screen === 'home') {
    return list;
  }

  const aliases = SCREEN_ALIASES[screen] || [];
  const byAlias = list.filter(item => {
    const key = String(
      item?.screen ||
        item?.page ||
        item?.placement ||
        item?.banner_for ||
        item?.banner_type ||
        item?.type ||
        '',
    ).toLowerCase();
    if (!key) return false;
    return aliases.some(alias => key.includes(alias));
  });

  return byAlias;
};

const sameUriList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((uri, i) => uri === b[i]);

export const getBanners = async (
  screen?: BannerScreen,
  serviceCategoryId?: string | null,
) => {
  try {
    const response = await apiClient(
      'customers/banners/',
      { method: 'GET' },
      true,
    );

    if (!response?.success && response?.success !== undefined) {
      return { success: false, data: [] as any[], images: [] as string[] };
    }

    const raw = toList(response?.data ?? response);
    const filtered = screen
      ? filterBannersForScreen(raw, screen, serviceCategoryId)
      : raw.filter(isBannerActive);
    const images = normalizeBannerImages(filtered);

    return {
      success: true,
      data: filtered,
      images,
    };
  } catch (error) {
    console.log('getBanners error', error);
    return { success: false, data: [] as any[], images: [] as string[] };
  }
};

export { sameUriList };
