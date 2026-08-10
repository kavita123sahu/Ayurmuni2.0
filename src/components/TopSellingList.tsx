import React, { useCallback, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import PromoCard from './PromoCard';
import SectionHeader from './SectionHeader';
import { Colors } from '../common/Colors';
import ProductCard from './ProductCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { syncCartQuantity } from '../store/slices/cartSlice';
import { showSuccessToast } from '../config/Key';
import { useScrollHide } from '../context/ScrollHideContext';
import { requireAuth } from '../services/guestAuth';
import { navigateToProductDetails, navigateToSearchScreen } from '../navigation/productNavigation';
import {
  toggleWishlistItem,
  useWishlistSync,
} from '../hooks/useWishlistSync';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../utils/productStockUtils';
import { resolveProductImageUri } from '../utils/imageUtils';

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
const { width: SCREEN_W } = Dimensions.get('window');
/** 2-col width inside TopSellingList grid (12px side pad + 12 gap) */
const LIST_GRID_CARD_WIDTH = (SCREEN_W - SPACING * 2 - SPACING) / 2;

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

  const resolveVariantId = useCallback((item: any) => {
    return (
      item?.variant_id ??
      item?.variant?.variant_id ??
      item?.variant?.id ??
      item?.id ??
      null
    );
  }, []);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(resolveVariantId(item) ?? '');
      if (!variantId || variantId === 'undefined' || variantId === 'null') return;

      if (newQty > 0 && isProductOutOfStock(item)) {
        showSuccessToast('This product is out of stock', 'error');
        return;
      }
      if (!canAddProductQty(item, newQty)) {
        showSuccessToast('Not enough stock available', 'error');
        return;
      }

      // Seed variant image cache so cart/checkout can show cover after add
      resolveProductImageUri(item);

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
    [dispatch, resolveVariantId],
  );

  useWishlistSync(setProductData, {
    removeWhenUnwishlisted: isWishlistScreen,
  });

  const handleWishlist = useCallback(async (item: any) => {
    await toggleWishlistItem(item);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.empty) {
        return <View style={styles.emptyCard} />;
      }

      const variantId = String(resolveVariantId(item) ?? '');
      const cartQty = variantQuantities[variantId] ?? 0;

      return (
        <View
          style={
            isGrid
              ? styles.gridWrap
              : [styles.horizontalWrap, home && styles.horizontalWrapHome]
          }
        >
          <ProductCard
            item={item}
            variant={isGrid ? 'grid' : 'horizontal'}
            gridWidth={isGrid ? LIST_GRID_CARD_WIDTH : undefined}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            showWishlist={fav}
            onPress={() => {
              const id = resolveVariantId(item);
              if (id == null || id === '') {
                return;
              }
              navigateToProductDetails(navigation, id);
            }}
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
      resolveVariantId,
      isGrid,
      fav,
      variantQuantities,
      addingVariantId,
      handleCartUpdate,
      handleWishlist,
      home,
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
          ? {
              justifyContent: 'space-between',
              paddingHorizontal: SPACING,
              gap: SPACING,
            }
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
    paddingHorizontal: 0,
  },
  horizontalWrap: {
    marginLeft: 8,
  },
  horizontalWrapHome: {
    marginLeft: 0,
  },
  gridWrap: {
    width: LIST_GRID_CARD_WIDTH,
    marginBottom: SPACING,
  },
  emptyCard: {
    width: LIST_GRID_CARD_WIDTH,
    marginBottom: SPACING,
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
