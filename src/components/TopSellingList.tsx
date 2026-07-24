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
import { syncCartQuantity } from '../store/slices/cartSlice';
import { updateProductItem } from '../store/slices/homeSlice';
import { showSuccessToast } from '../config/Key';
import { useScrollHide } from '../context/ScrollHideContext';
import { requireAuth } from '../services/guestAuth';
import { navigateToProductDetails, navigateToSearchScreen } from '../navigation/productNavigation';

interface Props {
  data: any[];
  isGrid?: boolean;
  fav?: boolean;
  isWishlistScreen?: boolean;
  setProductData: React.Dispatch<React.SetStateAction<any[]>>;
  header?: boolean;
  navigation: any;
  nested?: boolean;
  onExternalScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  home?: boolean;
  onViewAllPress?: () => void;
}

const SPACING = 12;

const TopSellingList: React.FC<Props> = ({
  data,
  fav = true,
  isWishlistScreen = false,
  setProductData,
  isGrid = false,
  header = false,
  navigation,
  nested = false,
  onExternalScroll,
  home = false,
  onViewAllPress,
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

      const result = await dispatch(
        syncCartQuantity({ variantId, quantity: newQty }),
      );

      if (syncCartQuantity.rejected.match(result)) {
        showSuccessToast(
          (result.payload as string) || 'Failed to update cart',
          'error',
        );
      }
    },
    [dispatch],
  );

  const handleWishlist = useCallback(
    async (item: any) => {
      if (!(await requireAuth('Please login to save wishlist items'))) return;

      const oldValue = item?.is_wishlist_item;
      const variantId = String(item?.variant_id);

      if (isWishlistScreen) {
        setProductData(prev =>
          prev.filter(product => product.variant_id !== item.variant_id),
        );
      } else {
        setProductData(prev =>
          prev.map(product =>
            product.variant_id === item.variant_id
              ? { ...product, is_wishlist_item: !oldValue }
              : product,
          ),
        );
      }

      dispatch(
        updateProductItem({
          variantId,
          updates: { is_wishlist_item: !oldValue },
        }),
      );

      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        if (isWishlistScreen) {
          setProductData(prev => {
            const exists = prev.some(p => p.variant_id === item.variant_id);
            if (exists) return prev;
            return [{ ...item, is_wishlist_item: true }, ...prev];
          });
        } else {
          setProductData(prev =>
            prev.map(product =>
              product.variant_id === item.variant_id
                ? { ...product, is_wishlist_item: oldValue }
                : product,
            ),
          );
        }

        dispatch(
          updateProductItem({
            variantId,
            updates: { is_wishlist_item: oldValue },
          }),
        );
      }
    },
    [setProductData, isWishlistScreen, dispatch],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.empty) {
        return <View style={styles.emptyCard} />;
      }

      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;

      return (
        <View style={!isGrid ? [styles.horizontalWrap, home && styles.horizontalWrapHome] : undefined}>
          <ProductCard
            item={item}
            variant={isGrid ? 'grid' : 'horizontal'}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            showWishlist={fav}
            onPress={() =>
              navigateToProductDetails(stackNav, item?.variant_id)
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
      home,
      isWishlistScreen,
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
      <SectionHeader
        title="Top Selling Products"
        actionText="View all"
        onPress={onViewAllPress ?? (() => navigateToSearchScreen(stackNav))}
      />
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
        home && styles.listContentHome,
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
  listContentHome: {
    paddingBottom: 0,
  },
  gridContent: {
    paddingHorizontal: 4,
  },
  horizontalWrap: {
    marginLeft: 8,
  },
  horizontalWrapHome: {
    marginLeft: 0,
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
