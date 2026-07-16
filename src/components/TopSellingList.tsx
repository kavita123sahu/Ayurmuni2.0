import React, { useCallback, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import PromoCard from './PromoCard';
import SectionHeader from './SectionHeader';
import { Colors } from '../common/Colors';
import { TogglewishlistProduct } from '../services/ProductServices';
import ProductCard from './ProductCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart, fetchCart } from '../store/slices/cartSlice';
import { updateProductItem } from '../store/slices/homeSlice';
import { showSuccessToast } from '../config/Key';
import { useScrollHide } from '../context/ScrollHideContext';
import { requireAuth } from '../services/guestAuth';

interface Props {
  data: any[];
  isGrid?: boolean;
  fav?: boolean;
  setProductData: React.Dispatch<React.SetStateAction<any[]>>;
  header?: boolean;
  navigation: any;
  nested?: boolean;
  onExternalScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const SPACING = 12;

const TopSellingList: React.FC<Props> = ({
  data,
  fav = true,
  setProductData,
  isGrid = false,
  header = false,
  navigation,
  nested = false,
  onExternalScroll,
}) => {
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(state => state.cart.variantQuantities);
  const addingVariantId = useAppSelector(state => state.cart.addingVariantId);
  const { onScroll: hideOnScroll } = useScrollHide();
  const stackNav = navigation?.getParent?.() || navigation;

  const safeData = Array.isArray(data) ? data : [];
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? safeData : safeData.slice(0, isGrid ? safeData.length : 6);

  const formattedData =
    isGrid && displayData.length % 2 !== 0
      ? [...displayData, { id: 'empty', empty: true }]
      : displayData;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      hideOnScroll(e);
      onExternalScroll?.(e);
    },
    [hideOnScroll, onExternalScroll],
  );

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;

      const result = await dispatch(addToCart({ variantId, quantity: newQty }));

      if (addToCart.fulfilled.match(result)) {
        showSuccessToast(result.payload.message || 'Cart updated', 'success');
        dispatch(fetchCart(true));
        setProductData(prev =>
          prev.map(product =>
            String(product.variant_id) === variantId
              ? { ...product, quantity: newQty }
              : product,
          ),
        );
        dispatch(updateProductItem({ variantId, updates: { quantity: newQty } }));
      }
    },
    [dispatch, setProductData],
  );

  const handleWishlist = useCallback(
  async (item: any, isWishlistScreen = false) => {
    if (!(await requireAuth('Please login to save wishlist items'))) return;

    const oldValue = item?.is_wishlist_item;

    if (isWishlistScreen) {
      // Remove from wishlist screen
      setProductData(prev =>
        prev.filter(product => product.variant_id !== item.variant_id),
      );
    } else {
      // Toggle heart on other screens
      setProductData(prev =>
        prev.map(product =>
          product.variant_id === item.variant_id
            ? { ...product, is_wishlist_item: !oldValue }
            : product,
        ),
      );
    }

    try {
      await TogglewishlistProduct(item.variant_id, 'POST');
    } catch (error) {
      if (isWishlistScreen) {
        // Restore removed item
        setProductData(prev => [item, ...prev]);
      } else {
        // Restore previous state
        setProductData(prev =>
          prev.map(product =>
            product.variant_id === item.variant_id
              ? { ...product, is_wishlist_item: oldValue }
              : product,
          ),
        );
      }
    }
  },
  [setProductData],
);
  // const handleWishlist = useCallback(
  //   async (item: any) => {
  //     if (!(await requireAuth('Please login to save wishlist items'))) return;
  //     const oldValue = item?.is_wishlist_item;
  //     setProductData(prev =>
  //       prev.map(product =>
  //         product.variant_id === item.variant_id
  //           ? { ...product, is_wishlist_item: !oldValue }
  //           : product,
  //       ),
  //     );
  //     try {
  //       await TogglewishlistProduct(item.variant_id, 'POST');
  //     } catch {
  //       setProductData(prev =>
  //         prev.map(product =>
  //           product.variant_id === item.variant_id
  //             ? { ...product, is_wishlist_item: oldValue }
  //             : product,
  //         ),
  //       );
  //     }
  //   },
  //   [setProductData],
  // );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.empty) {
        return <View style={styles.emptyCard} />;
      }

      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? item?.quantity ?? 0;

      return (
        <View style={!isGrid ? styles.horizontalWrap : undefined}>
          <ProductCard
            item={item}
            variant={isGrid ? 'grid' : 'horizontal'}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            showWishlist={fav}
            onPress={() =>
              stackNav.navigate('ProductDetails', { varientID: item?.variant_id })
            }
            onAdd={() => handleCartUpdate(item, cartQty + 1)}
            onIncrement={() => handleCartUpdate(item, cartQty + 1)}
            onDecrement={() => handleCartUpdate(item, Math.max(0, cartQty - 1))}
            onWishlist={() => handleWishlist(item)}
          />
        </View>
      );
    },
    [
      navigation,
      stackNav,
      isGrid,
      fav,
      variantQuantities,
      addingVariantId,
      handleCartUpdate,
      handleWishlist,
    ],
  );

  const ListHeader = () => (
    <>
      <PromoCard
        title="The Wellness Essentials"
        desc="Discover organic selections, cold-pressed to preserve nature's power."
        tag="CURATED EXCELLENCE"
        showButton={false}
      />
      <SectionHeader title="Top Selling Products" actionText="View all" />
    </>
  );

  if (safeData.length === 0) {
    return null;
  }

  return (
    <FlatList
      key={isGrid ? 'grid' : 'list'}
      data={formattedData}
      keyExtractor={(item, index) => String(item.variant_id || item.id || index)}
      horizontal={!isGrid}
      numColumns={isGrid ? 2 : 1}
      nestedScrollEnabled
      onScroll={nested ? undefined : handleScroll}
      scrollEventThrottle={16}
      ListHeaderComponent={header ? <ListHeader /> : undefined}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContent,
        isGrid && styles.gridContent,
      ]}
      columnWrapperStyle={
        isGrid
          ? { justifyContent: 'space-between', paddingHorizontal: SPACING }
          : undefined
      }
      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      ListFooterComponent={
        isGrid && safeData.length > 6 && !showAll ? (
          <View style={styles.footerContainer}>
            <TouchableOpacity style={styles.discoverBtn} onPress={() => setShowAll(true)}>
              <Text style={styles.discoverText}>Discover More</Text>
            </TouchableOpacity>
            <Text style={styles.countText}>
              Showing 6 of {safeData.length} items
            </Text>
          </View>
        ) : null
      }
    />
  );
};

export default React.memo(TopSellingList);

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  gridContent: {
    paddingHorizontal: 4,
  },
  horizontalWrap: {
    marginLeft: 8,
  },
  emptyCard: {
    width: '48%',
    marginBottom: 12,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 32,
  },
  discoverBtn: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  discoverText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  countText: {
    marginTop: 10,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
