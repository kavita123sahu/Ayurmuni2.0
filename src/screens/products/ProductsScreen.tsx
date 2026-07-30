import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import PromoCard from '../../components/PromoCard';
import ProductCard from '../../components/ProductCard';
import SectionHeader from '../../components/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { ProductGridSkeleton, ProductsScreenSkeleton, CategoryRowSkeleton } from '../../simmerScreen/ShimmerHook';
import { useScrollHide } from '../../context/ScrollHideContext';
import { getScreenBottomPadding } from '../../constants/layout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { TogglewishlistProduct } from '../../services/ProductServices';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { requireAuth } from '../../services/guestAuth';
import { Images } from '../../common/Images';
import { safeGoBack } from '../../navigation/navigationUtils';
import {
  navigateToSearchScreen,
  navigateToCategoryProducts,
  navigateToProductDetails,
} from '../../navigation/productNavigation';
import { useProductCategories } from '../../hooks/useProductCategories';
import CategoryList from '../../components/CategoryList';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../../utils/productStockUtils';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { getServiceCategoryId } from '../../utils/serviceCategoryUtils';

const H_PAD = 20;
const GRID_GAP = 10;
const GRID_CARD_WIDTH =
  (Dimensions.get('window').width - H_PAD * 2 - GRID_GAP) / 2;

const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const { categories: dashboardCategories, loading: homeLoading } = useHomeData();

  const productsCategoryId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'products'),
    [dashboardCategories],
  );

  const productFilter = useMemo(
    () =>
      productsCategoryId
        ? { service_category_id: productsCategoryId }
        : {},
    [productsCategoryId],
  );

  const {
    products,
    setProducts,
    loading,
    loadingMore,
    refreshing,
    refresh,
    loadMore,
  } = useCategoryProducts(productFilter, [], {
    // Full catalog when service id missing; otherwise filter by products service
    enabled: Boolean(productsCategoryId) || !homeLoading,
  });

  const { categories: productCategories, loading: categoriesLoading } =
    useProductCategories(null);
  const { onScroll } = useScrollHide();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const handleSearchPress = useCallback(() => {
    navigateToSearchScreen(navigation);
  }, [navigation]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;

      if (newQty > 0 && isProductOutOfStock(item)) {
        showSuccessToast('This product is out of stock', 'error');
        return;
      }
      if (!canAddProductQty(item, newQty)) {
        showSuccessToast('Not enough stock available', 'error');
        return;
      }

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
      const old = item?.is_wishlist_item;
      setProducts(prev =>
        prev.map(p =>
          p.variant_id === item.variant_id
            ? { ...p, is_wishlist_item: !old }
            : p,
        ),
      );
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setProducts(prev =>
          prev.map(p =>
            p.variant_id === item.variant_id
              ? { ...p, is_wishlist_item: old }
              : p,
          ),
        );
      }
    },
    [setProducts],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={styles.cardWrap}>
          <ProductCard
            item={item}
            variant="grid"
            gridWidth={GRID_CARD_WIDTH}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              navigateToProductDetails(navigation, item.variant_id)
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
      variantQuantities,
      addingVariantId,
      navigation,
      handleCartUpdate,
      handleWishlist,
    ],
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerContent}>
        <PromoCard
          title="Up to 40% OFF on Supplements"
          desc="Keep your immunity strong this season."
          tag="SUMMER SALE"
          buttontext="Shop Now"
          showButton
          onPress={() => {}}
        />

        <SectionHeader
          title="Shop by Category"
          actionText={productCategories.length > 0 ? 'View all' : ''}
          onPress={() =>
            navigateToCategoryProducts(navigation, { categoryMode: 'product' })
          }
        />
        {categoriesLoading && productCategories.length === 0 ? (
          <CategoryRowSkeleton />
        ) : productCategories.length > 0 ? (
          <CategoryList
            data={productCategories}
            navigation={navigation}
            mode="product"
          />
        ) : null}

        <SectionHeader title="All Products" actionText="" />
      </View>
    ),
    [productCategories, categoriesLoading, navigation],
  );

  const showInitialSkeleton = loading && products.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Products"
        backIcon={Images.backIcon}
        onBack={() => safeGoBack(navigation)}
        subtitle="Choose best product"
        onSearchPress={handleSearchPress}
      />

      {showInitialSkeleton ? (
        <ProductsScreenSkeleton />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, i) => String(item.variant_id || i)}
          numColumns={2}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPadding },
          ]}
          columnWrapperStyle={styles.columnWrap}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[Colors.primaryColor]}
              tintColor={Colors.primaryColor}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ProductGridSkeleton
                  cardWidth={GRID_CARD_WIDTH}
                  gap={10}
                  count={2}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products available</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFDFB',
    paddingHorizontal: H_PAD,
  },
  headerContent: {},
  listContent: {},
  columnWrap: {
    justifyContent: 'space-between',
    gap: GRID_GAP,
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    marginBottom: GRID_GAP,
  },
  skeletonWrap: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  footerLoader: {
    paddingVertical: 8,
  },
});
