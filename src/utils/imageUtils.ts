/** Normalize RN image values (string uri, { uri }, require) for `<Image source={{ uri }} />`. */
export const resolveImageUri = (image: unknown): string => {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return sanitizeImageUri(image.trim());
  }

  if (typeof image === 'object' && image !== null && 'uri' in image) {
    const uri = (image as { uri?: unknown }).uri;
    return uri != null ? sanitizeImageUri(String(uri).trim()) : '';
  }

  return '';
};

/** Drop placeholder / demo URLs (cart API sometimes returns example.com). */
export const sanitizeImageUri = (uri: string): string => {
  if (!uri) return '';
  const value = uri.trim();
  if (!value) return '';

  const lower = value.toLowerCase();
  if (
    lower.includes('example.com') ||
    lower.includes('placeholder') ||
    lower.includes('via.placeholder') ||
    lower.includes('picsum.photos') ||
    lower.endsWith('/null') ||
    lower === 'null' ||
    lower === 'undefined'
  ) {
    return '';
  }

  return value;
};

/** Remember cover URLs by variant so cart/checkout use real cover_image, not cart image_url. */
const variantImageCache = new Map<string, string>();

const isPreferredHost = (uri: string): boolean =>
  /ayurmuni\.s3\.|amazonaws\.com|cloudfront\.net/i.test(uri);

export const cacheVariantImage = (
  variantId: string | number | undefined | null,
  uri: string,
) => {
  const id = variantId != null ? String(variantId).trim() : '';
  const imageUri = sanitizeImageUri(
    typeof uri === 'string' ? uri.trim() : resolveImageUri(uri),
  );
  if (!id || !imageUri) return;

  const existing = variantImageCache.get(id);
  // Never let a weak URL overwrite a real CDN cover
  if (existing && isPreferredHost(existing) && !isPreferredHost(imageUri)) {
    return;
  }
  variantImageCache.set(id, imageUri);
};

export const getCachedVariantImage = (
  variantId: string | number | undefined | null,
): string => {
  const id = variantId != null ? String(variantId).trim() : '';
  if (!id) return '';
  return variantImageCache.get(id) || '';
};

export const extractVariantId = (item: any): string => {
  if (!item) return '';
  return String(
    item?.variant_id ??
      item?.variant?.variant_id ??
      item?.variant?.id ??
      (item?.sku_code || item?.cover_image || item?.is_default != null
        ? item?.id
        : '') ??
      '',
  ).trim();
};

const mediaItemUrl = (media: any): string => {
  if (!media) return '';
  return (
    resolveImageUri(media?.media_url) ||
    resolveImageUri(media?.url) ||
    resolveImageUri(media?.image_url) ||
    resolveImageUri(media?.image) ||
    resolveImageUri(media)
  );
};

/** Prefer is_cover / cover_image, then first media entry */
const firstMediaUrl = (media: any): string => {
  if (!Array.isArray(media) || !media.length) return '';
  const cover = media.find((m: any) => m?.is_cover === true);
  if (cover) {
    const uri = mediaItemUrl(cover);
    if (uri) return uri;
  }
  for (const item of media) {
    const uri = mediaItemUrl(item);
    if (uri) return uri;
  }
  return '';
};

const coverImageUrl = (cover: any): string => {
  if (!cover) return '';
  if (typeof cover === 'string') return sanitizeImageUri(cover.trim());
  return mediaItemUrl(cover);
};

/**
 * Resolve product / cart / order line image from common API shapes.
 * Prefers variant.cover_image.media_url, then media[].is_cover, then cached cover,
 * and only then flat image_url (skipping placeholder cart URLs).
 */
export const resolveProductImageUri = (item: any): string => {
  if (!item) return '';

  const variant = item?.variant ?? item?.selected_variant ?? null;
  const defaultVariant =
    Array.isArray(item?.variants) && item.variants.length
      ? item.variants.find((v: any) => v?.is_default) || item.variants[0]
      : null;

  const variantId =
    extractVariantId(item) ||
    extractVariantId(variant) ||
    extractVariantId(defaultVariant);

  const trustedCandidates = [
    // Explicit cover_image (product details shape)
    coverImageUrl(variant?.cover_image),
    coverImageUrl(item?.cover_image),
    coverImageUrl(defaultVariant?.cover_image),
    // Media arrays (prefer is_cover)
    firstMediaUrl(variant?.media),
    firstMediaUrl(item?.media),
    firstMediaUrl(defaultVariant?.media),
    coverImageUrl(item?.product?.cover_image),
    firstMediaUrl(item?.product?.media),
    firstMediaUrl(variant?.images),
    firstMediaUrl(item?.images),
  ];

  for (const value of trustedCandidates) {
    const uri = resolveImageUri(value);
    if (uri) {
      if (variantId) cacheVariantImage(variantId, uri);
      return uri;
    }
  }

  // Prefer previously cached cover for this variant over cart's flat image_url
  const cached = getCachedVariantImage(variantId);
  if (cached) return cached;

  const legacyCandidates = [
    variant?.image_url,
    variant?.thumbnail_url,
    variant?.image,
    item?.image_url,
    item?.thumbnail_url,
    item?.primary_image,
    item?.product_image,
    item?.image,
    defaultVariant?.image_url,
    item?.product?.image_url,
    item?.product?.thumbnail_url,
    item?.product?.image,
  ];

  for (const value of legacyCandidates) {
    const uri = resolveImageUri(value);
    if (uri) {
      if (variantId) cacheVariantImage(variantId, uri);
      return uri;
    }
  }

  return '';
};

/**
 * Rewrite cart line images: use cover_image / cache instead of placeholder image_url.
 */
export const enrichCartItemImages = (cartItem: any, variantIdHint?: string): any => {
  if (!cartItem) return cartItem;

  const variantId =
    String(variantIdHint || extractVariantId(cartItem) || '').trim();
  const resolved =
    resolveProductImageUri(cartItem) || getCachedVariantImage(variantId);

  const variant = cartItem.variant ? { ...cartItem.variant } : {};
  const safeVariantImageUrl = sanitizeImageUri(String(variant.image_url || ''));
  const safeItemImageUrl = sanitizeImageUri(String(cartItem.image_url || ''));
  const safeItemImage = sanitizeImageUri(String(cartItem.image || ''));

  if (!resolved) {
    // Strip placeholder image_url from cart payload so UI does not show example.com
    return {
      ...cartItem,
      image_url: safeItemImageUrl || undefined,
      image: safeItemImage || undefined,
      variant: {
        ...variant,
        image_url: safeVariantImageUrl || undefined,
      },
    };
  }

  const existingCover = coverImageUrl(variant.cover_image);

  if (!existingCover) {
    variant.cover_image = {
      media_url: resolved,
      media_type: 'image',
      is_cover: true,
    };
  }

  // Force cart image_url to real cover (never keep example.com)
  variant.image_url = resolved;
  if (variantId) {
    variant.variant_id = variant.variant_id || variantId;
    cacheVariantImage(variantId, resolved);
  }

  return {
    ...cartItem,
    variant_id: cartItem.variant_id || variantId,
    image_url: resolved,
    image: resolved,
    variant,
  };
};

/** Gallery list for product details: cover first, then remaining media (deduped) */
export const buildVariantGallery = (variant: any): any[] => {
  if (!variant) return [];
  const media = Array.isArray(variant.media) ? [...variant.media] : [];
  const cover = variant.cover_image;

  const dedupeKey = (m: any) =>
    String(m?.id ?? m?.media_url ?? m?.url ?? '');

  const seen = new Set<string>();
  const out: any[] = [];

  const push = (m: any) => {
    if (!m) return;
    const uri = mediaItemUrl(m);
    if (!uri) return;
    const key = dedupeKey(m) || uri;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(m);
  };

  if (cover) push(cover);

  media
    .filter((m: any) => m?.is_cover)
    .forEach(push);
  media
    .filter((m: any) => !m?.is_cover)
    .forEach(push);

  return out;
};

export const resolveImageSource = (image: unknown) => {
  const uri = resolveImageUri(image);
  if (uri) {
    return { uri };
  }

  if (typeof image === 'number') {
    return image;
  }

  return null;
};
