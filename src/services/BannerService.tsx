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
    item?.hero_image ||
    item?.cover_url ||
    (typeof item?.image === 'string' ? item.image : '') ||
    item?.url ||
    item?.cover_image?.media_url ||
    item?.banner?.media_url ||
    item?.banner?.image_url ||
    '';
  const out = String(uri || '').trim();
  return /^https?:\/\//i.test(out) || out.startsWith('/') ? out : out;
};

/** Prefer redirect_link (hero events) then legacy redirect_url. */
export const getBannerRedirectUrl = (item: any): string =>
  String(
    item?.redirect_link ||
      item?.redirect_url ||
      item?.link ||
      item?.deep_link ||
      item?.deeplink ||
      '',
  ).trim();

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

/**
 * Normalize live hero event → banner row(s) Detailimages can render.
 *
 * API shape:
 * data: {
 *   id, title, scope, media: [{ media_url, media_type, redirect_link }],
 *   starts_at, ends_at
 * }
 */
export const normalizeHeroEventToBanners = (event: any): any[] => {
  if (event == null || event === false) return [];

  if (Array.isArray(event)) {
    return event.filter(Boolean);
  }

  // Hero event: expand media[] into carousel slides
  const mediaList = Array.isArray(event?.media) ? event.media : [];
  if (mediaList.length > 0) {
    return mediaList
      .map((media: any, index: number) => {
        if (!media || typeof media !== 'object') return null;
        const mediaUrl = String(media.media_url || '').trim();
        if (!mediaUrl) return null;
        // Skip non-image media for the image carousel (videos later)
        const mediaType = String(media.media_type || 'image').toLowerCase();
        if (mediaType && mediaType !== 'image') return null;

        const redirect =
          String(media.redirect_link || media.redirect_url || '').trim() ||
          null;

        return {
          id: `${event.id || 'hero'}-${index}`,
          event_id: event.id,
          title: event.title,
          scope: event.scope,
          event_tags: event.event_tags,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          media_url: mediaUrl,
          image_url: mediaUrl,
          media_type: media.media_type || 'image',
          redirect_link: redirect,
          redirect_url: redirect,
          is_active: true,
        };
      })
      .filter(Boolean);
  }

  const nested = toList(event);
  if (nested.length > 0) {
    return nested;
  }

  // Fallback: single event with top-level image fields
  if (getBannerImageUri(event)) {
    const redirect = getBannerRedirectUrl(event) || null;
    return [
      {
        ...event,
        media_url: getBannerImageUri(event),
        redirect_link: redirect,
        redirect_url: redirect,
        is_active: true,
      },
    ];
  }

  return [];
};

/**
 * Customer — Current Live Hero
 * GET /banners/events/?mode=production&scope=hero
 * Returns the live hero event, or data: null when none.
 */
export const getHeroBannerEvent = async () => {
  try {
    const response = await apiClient(
      'banners/events/?mode=production&scope=hero',
      { method: 'GET' },
      true,
    );

    if (response?.success === false) {
      return { success: false, data: [] as any[], images: [] as string[] };
    }

    // data: null → no live event
    const event =
      response?.data === null
        ? null
        : response?.data !== undefined
          ? response.data
          : response?.event ?? null;

    if (event == null || event === false) {
      return { success: true, data: [] as any[], images: [] as string[] };
    }

    const banners = normalizeHeroEventToBanners(event).filter(isBannerActive);
    const images = normalizeBannerImages(banners);

    return {
      success: true,
      data: banners,
      images,
      event,
    };
  } catch {
    return { success: false, data: [] as any[], images: [] as string[] };
  }
};

export const getBanners = async (
  screen?: BannerScreen,
  serviceCategoryId?: string | null,
) => {
  try {
    // Home uses live hero event API
    if (screen === 'home') {
      return getHeroBannerEvent();
    }

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
    return { success: false, data: [] as any[], images: [] as string[] };
  }
};

export { sameUriList };
