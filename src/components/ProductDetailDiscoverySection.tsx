import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import SectionHeader from './SectionHeader';
import ProductCard, { HORIZONTAL_CARD_WIDTH } from './ProductCard';
import { useProductSection } from '../hooks/useProductSection';
import type { ProductSectionType } from '../services/ProductServices';
import {
  TopSellingListSkeleton,
  HorizontalProductCardSkeleton,
} from '../simmerScreen/ShimmerHook';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { syncCartQuantity } from '../store/slices/cartSlice';
import { showSuccessToast } from '../config/Key';
import { requireAuth } from '../services/guestAuth';
import { navigateToProductDetails } from '../navigation/productNavigation';
import {
  toggleWishlistItem,
  useWishlistSync,
} from '../hooks/useWishlistSync';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../utils/prescriptionUtils';

const H_PAD = 16;
const RAIL_GAP = 12;

type Props = {
  section: ProductSectionType | string;
  productId?: string | number | null;
  navigation: any;
  enabled?: boolean;
  titleOverride?: string;
  excludeVariantId?: string | number | null;
  discoveryApi?: boolean;
  paginated?: boolean;
  /** Fired once after the first fetch finishes (empty or with data) */
  onInitialLoadComplete?: () => void;
};

/**
 * Product Details discovery — horizontal rail, auto load-more with skeleton (no View all / no button).
 */
const ProductDetailDiscoverySection = ({
  section,
  productId,
  navigation,
  enabled = true,
  titleOverride,
  excludeVariantId,
  discoveryApi = false,
  paginated = false,
  onInitialLoadComplete,
}: Props) => {
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);
  const readyNotifiedRef = useRef(false);

  const {
    title,
    products,
    setProducts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    initialLoadDone,
  } = useProductSection({
    section,
    productId,
    enabled,
    paginated,
    discoveryApi,
    pageSize: 8,
  });

  useWishlistSync(setProducts);

  useEffect(() => {
    if (!enabled) {
      readyNotifiedRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (
      enabled &&
      initialLoadDone &&
      !loading &&
      !loadingMore &&
      !readyNotifiedRef.current
    ) {
      readyNotifiedRef.current = true;
      onInitialLoadComplete?.();
    }
  }, [
    enabled,
    initialLoadDone,
    loading,
    loadingMore,
    onInitialLoadComplete,
  ]);

  const visibleProducts = useMemo(() => {
    const exclude = String(excludeVariantId || '').trim();
    if (!exclude) return products;
    return products.filter(
      item => String(item?.variant_id ?? item?.id ?? '') !== exclude,
    );
  }, [products, excludeVariantId]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id ?? '');
      if (!variantId) return;

      if (newQty > 0 && isProductOutOfStock(item)) {
        showSuccessToast('This product is out of stock', 'error');
        return;
      }
      if (!canAddProductQty(item, newQty)) {
        showSuccessToast('Not enough stock available', 'error');
        return;
      }

      const currentQty = Number(variantQuantities[variantId] ?? 0);
      if (newQty > currentQty && !canAddProductWithoutPrescription(item)) {
        return;
      }

      const result = await dispatch(
        syncCartQuantity({
          variantId,
          quantity: newQty,
          currentQuantity: currentQty,
          prescriptionRequired: item?.prescription_required,
        }),
      );
      if (syncCartQuantity.rejected.match(result)) {
        showSuccessToast(
          (result.payload as string) || 'Failed to update cart',
          'error',
        );
      }
    },
    [dispatch, variantQuantities],
  );

  const handleWishlist = useCallback(async (item: any) => {
    await toggleWishlistItem(item);
  }, []);

  const handleEndReached = useCallback(() => {
    if (paginated && hasMore && !loadingMore && !loading) {
      loadMore?.();
    }
  }, [paginated, hasMore, loadingMore, loading, loadMore]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id ?? item?.id ?? '');
      const cartQty = variantQuantities[variantId] ?? 0;

      return (
        <View style={styles.cardWrap}>
          <ProductCard
            item={item}
            variant="horizontal"
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() => {
              if (variantId) {
                navigateToProductDetails(navigation, variantId);
              }
            }}
            onAdd={() => handleCartUpdate(item, cartQty + 1)}
            onIncrement={() => handleCartUpdate(item, cartQty + 1)}
            onDecrement={() =>
              handleCartUpdate(item, Math.max(0, cartQty - 1))
            }
            onWishlist={() => handleWishlist(item)}
          />
        </View>
      );
    },
    [
      variantQuantities,
      addingVariantId,
      navigation,
      handleCartUpdate,
      handleWishlist,
    ],
  );

  const keyExtractor = useCallback(
    (item: any, index: number) =>
      String(item?.variant_id ?? item?.id ?? `${section}-${index}`),
    [section],
  );

  const ListFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerSkeleton}>
        <HorizontalProductCardSkeleton count={2} />
      </View>
    );
  }, [loadingMore]);

  if (!enabled) return null;

  if (loading && visibleProducts.length === 0) {
    return (
      <View style={styles.wrap}>
        <SectionHeader title={titleOverride || title} />
        <TopSellingListSkeleton />
      </View>
    );
  }

  if (!visibleProducts.length && initialLoadDone) {
    return null;
  }

  if (!visibleProducts.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <SectionHeader title={titleOverride || title} />
      <FlatList
        data={visibleProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.35}
        ListFooterComponent={ListFooter}
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </View>
  );
};

export default memo(ProductDetailDiscoverySection);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,

    paddingHorizontal: H_PAD,
    paddingBottom: 4,
  },
  listContent: {
    // paddingHorizontal: H_PAD,
    paddingBottom: 8,
    gap: RAIL_GAP,
  },
  cardWrap: {
    marginRight: RAIL_GAP,
    width: HORIZONTAL_CARD_WIDTH,
  },
  footerSkeleton: {
    flexDirection: 'row',
    paddingRight: H_PAD,
  },
});
