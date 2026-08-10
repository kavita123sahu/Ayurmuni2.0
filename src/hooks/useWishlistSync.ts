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
            return prev.filter(item => String(item?.variant_id) !== id);
          }

          return prev.map(item =>
            String(item?.variant_id) === id
              ? { ...item, is_wishlist_item: isWishlisted }
              : item,
          );
        });
      },
    );

    return () => sub.remove();
  }, [dispatch, setProductData, removeWhenUnwishlisted]);
}

/** Optimistic toggle + broadcast to all listeners. */
export async function toggleWishlistItem(item: {
  variant_id?: string | number;
  is_wishlist_item?: boolean;
}): Promise<boolean> {
  if (!(await requireAuth('Please login to save wishlist items'))) {
    return false;
  }

  const variantId = String(
    item?.variant_id ?? (item as any)?.variant?.variant_id ?? (item as any)?.id ?? '',
  );
  if (!variantId) return false;

  const next = !Boolean(item?.is_wishlist_item);

  WishlistEvents.emit(WISHLIST_UPDATED, {
    variantId,
    isWishlisted: next,
  } satisfies WishlistUpdatedPayload);

  try {
    await TogglewishlistProduct(variantId as any, 'POST');
    return true;
  } catch {
    WishlistEvents.emit(WISHLIST_UPDATED, {
      variantId,
      isWishlisted: !next,
    } satisfies WishlistUpdatedPayload);
    return false;
  }
}
