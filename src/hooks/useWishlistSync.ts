import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import {
  WishlistEvents,
  WISHLIST_UPDATED,
  WishlistUpdatedPayload,
} from '../common/Utils';
import { updateProductItem } from '../store/slices/homeSlice';
import { TogglewishlistProduct } from '../services/ProductServices';
import { requireAuth } from '../services/guestAuth';

type SetProducts = Dispatch<SetStateAction<any[]>>;

type SyncOptions = {
  /** Wishlist screen: remove row when heart is turned off */
  removeWhenUnwishlisted?: boolean;
};

/** Survives list refreshes that would otherwise wipe optimistic heart state. */
const wishlistCache = new Map<string, boolean>();

/** Coerce API / local wishlist flags (bool, 0/1, "true"/"false"). */
export const readWishlistFlag = (value: unknown): boolean => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0' || value == null) return false;
  const s = String(value).trim().toLowerCase();
  if (s === 'true' || s === 'yes' || s === 'on') return true;
  if (s === 'false' || s === 'no' || s === 'off' || s === '') return false;
  return Boolean(value);
};

export const resolveVariantId = (item: any): string =>
  String(
    item?.variant_id ??
      item?.variant?.variant_id ??
      item?.variant?.id ??
      item?.id ??
      '',
  ).trim();

/** Prefer live cache, then product fields. */
export const isItemWishlisted = (item: any): boolean => {
  const id = resolveVariantId(item);
  if (id && wishlistCache.has(id)) return wishlistCache.get(id)!;
  return readWishlistFlag(
    item?.is_wishlist_item ?? item?.is_wishlisted ?? item?.wishlisted,
  );
};

/** Apply cached hearts onto a product list after API fetches. */
export const applyWishlistCache = <T extends Record<string, any>>(
  products: T[],
): T[] => {
  if (!Array.isArray(products) || products.length === 0) return products;
  return products.map(item => {
    const id = resolveVariantId(item);
    if (!id) return item;
    if (wishlistCache.has(id)) {
      return { ...item, is_wishlist_item: wishlistCache.get(id)! };
    }
    const flag = readWishlistFlag(
      item?.is_wishlist_item ?? item?.is_wishlisted ?? item?.wishlisted,
    );
    return flag === readWishlistFlag(item?.is_wishlist_item)
      ? item
      : { ...item, is_wishlist_item: flag };
  });
};

export const seedWishlistCacheFromList = (products: any[]) => {
  if (!Array.isArray(products)) return;
  products.forEach(item => {
    const id = resolveVariantId(item);
    if (!id || wishlistCache.has(id)) return;
    wishlistCache.set(
      id,
      readWishlistFlag(
        item?.is_wishlist_item ?? item?.is_wishlisted ?? item?.wishlisted,
      ),
    );
  });
};

/**
 * Keep local product lists + home Redux in sync whenever wishlist changes
 * from any screen (details, home, search, wishlist, etc.).
 */
export function useWishlistSync(
  setProductData?: SetProducts,
  options?: SyncOptions,
) {
  const dispatch = useDispatch();
  const removeWhenUnwishlisted = Boolean(options?.removeWhenUnwishlisted);

  useEffect(() => {
    const sub = WishlistEvents.addListener(
      WISHLIST_UPDATED,
      (...args: unknown[]) => {
        const payload = args[0] as WishlistUpdatedPayload | undefined;
        if (!payload?.variantId) return;

        const { variantId, isWishlisted } = payload;
        const id = String(variantId);
        wishlistCache.set(id, isWishlisted);

        dispatch(
          updateProductItem({
            variantId: id,
            updates: { is_wishlist_item: isWishlisted },
          }),
        );

        if (!setProductData) return;

        setProductData(prev => {
          if (!Array.isArray(prev)) return prev;

          if (removeWhenUnwishlisted && !isWishlisted) {
            return prev.filter(item => resolveVariantId(item) !== id);
          }

          return prev.map(item =>
            resolveVariantId(item) === id
              ? { ...item, is_wishlist_item: isWishlisted }
              : item,
          );
        });
      },
    );

    return () => sub.remove();
  }, [dispatch, setProductData, removeWhenUnwishlisted]);
}

export type ToggleWishlistResult = 'ok' | 'auth' | 'error';

/** Optimistic toggle + broadcast to all listeners. */
export async function toggleWishlistItem(item: {
  variant_id?: string | number;
  is_wishlist_item?: boolean;
  [key: string]: any;
}): Promise<ToggleWishlistResult> {
  if (!(await requireAuth('Please login to save wishlist items'))) {
    return 'auth';
  }

  const variantId = resolveVariantId(item);
  if (!variantId) return 'error';

  const current = isItemWishlisted(item);
  const next = !current;

  wishlistCache.set(variantId, next);
  WishlistEvents.emit(WISHLIST_UPDATED, {
    variantId,
    isWishlisted: next,
  } satisfies WishlistUpdatedPayload);

  try {
    const response = await TogglewishlistProduct(variantId as any, 'POST');
    if (response?.success === false) {
      throw new Error(response?.message || 'Wishlist update failed');
    }
    // Prefer server flag when present
    const serverFlag =
      response?.data?.is_wishlist_item ??
      response?.data?.is_wishlisted ??
      response?.is_wishlist_item;
    if (serverFlag != null) {
      const resolved = readWishlistFlag(serverFlag);
      wishlistCache.set(variantId, resolved);
      if (resolved !== next) {
        WishlistEvents.emit(WISHLIST_UPDATED, {
          variantId,
          isWishlisted: resolved,
        } satisfies WishlistUpdatedPayload);
      }
    }
    return 'ok';
  } catch {
    wishlistCache.set(variantId, current);
    WishlistEvents.emit(WISHLIST_UPDATED, {
      variantId,
      isWishlisted: current,
    } satisfies WishlistUpdatedPayload);
    return 'error';
  }
}
