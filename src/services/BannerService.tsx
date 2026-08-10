import { apiClient } from './APIconfig';

export type BannerScreen = 'home' | 'product' | 'consult' | 'medicine';

const SCREEN_ALIASES: Record<BannerScreen, string[]> = {
  home: ['home', 'home_page', 'homepage', 'home-page'],
  product: ['product', 'products', 'product_page', 'store', 'shop'],
  consult: ['consult', 'consultation', 'doctor', 'consult_page', 'doctors'],
  medicine: ['medicine', 'medicines', 'pharmacy', 'medicine_page'],
};

const toList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.banners)) return payload.banners;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.banners)) return payload.data.banners;
  return [];
};

export const getBannerImageUri = (item: any): string => {
  const uri =
    item?.media_url ||
    item?.image_url ||
    item?.banner_image ||
    item?.image ||
    item?.url ||
    item?.cover_image?.media_url ||
    '';
  return String(uri || '').trim();
};

export const normalizeBannerImages = (banners: any[]): string[] =>
  (Array.isArray(banners) ? banners : [])
    .map(getBannerImageUri)
    .filter(Boolean);

export const filterBannersForScreen = (
  banners: any[],
  screen: BannerScreen,
): any[] => {
  const list = Array.isArray(banners) ? banners : [];
  const aliases = SCREEN_ALIASES[screen];

  const matched = list.filter(item => {
    const visible = item?.is_active ?? item?.visible ?? item?.is_visible;
    if (visible === false || visible === 0 || visible === '0') {
      return false;
    }

    const key = String(
      item?.screen ||
        item?.page ||
        item?.placement ||
        item?.banner_for ||
        item?.banner_type ||
        item?.type ||
        '',
    ).toLowerCase();

    if (!key) {
      return true;
    }
    return aliases.some(alias => key.includes(alias));
  });

  return matched.length > 0 ? matched : list.filter(item => {
    const visible = item?.is_active ?? item?.visible ?? item?.is_visible;
    return !(visible === false || visible === 0 || visible === '0');
  });
};

export const getBanners = async (screen?: BannerScreen) => {
  try {
    const path = screen
      ? `customers/banners/?screen=${encodeURIComponent(screen)}`
      : 'customers/banners/';
    const response = await apiClient(path, { method: 'GET' }, false);

    if (!response?.success && response?.success !== undefined) {
      return { success: false, data: [] as any[] };
    }

    const raw = toList(response?.data ?? response);
    const filtered = screen ? filterBannersForScreen(raw, screen) : raw;

    return {
      success: true,
      data: filtered,
      images: normalizeBannerImages(filtered),
    };
  } catch (error) {
    console.log('getBanners error', error);
    return { success: false, data: [] as any[], images: [] as string[] };
  }
};
