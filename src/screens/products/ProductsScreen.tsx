import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import SectionHeader from '../../components/SectionHeader';
import Detailimages from '../../components/Detailimages';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { useHomeData } from '../../hooks/UseHomeData';
import {
  ProductGridSkeleton,
  ProductsScreenSkeleton,
  CategoryRowSkeleton,
} from '../../simmerScreen/ShimmerHook';
import { useScrollHide } from '../../context/ScrollHideContext';
import { getScreenBottomPadding } from '../../constants/layout';
import {
  TYPO,
  RADIUS,
  getScreenPaddingH,
} from '../../constants/responsive';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { requireAuth } from '../../services/guestAuth';
import {
  toggleWishlistItem,
  useWishlistSync,
} from '../../hooks/useWishlistSync';
import { Images } from '../../common/Images';
import { goBackToHomeTab } from '../../navigation/navigationUtils';
import {
  navigateToSearchScreen,
  navigateToCategoryProducts,
  navigateToProductDetails,
} from '../../navigation/productNavigation';
import { useProductCategories } from '../../hooks/useProductCategories';
import CategoryList from '../../components/CategoryList';
import RecentProductsList from '../../components/RecentProductsList';
import { useOrders } from '../../hooks/useOrders';
import {
  getAddQtyBlockMessage,
} from '../../utils/productStockUtils';
import {
  canAddProductWithoutPrescription,
  isPrescriptionRequired,
} from '../../utils/prescriptionUtils';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { getServiceCategoryId } from '../../utils/serviceCategoryUtils';
import { useBanners } from '../../hooks/useBanners';

const GRID_GAP = 10;

const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const hPad = getScreenPaddingH(windowWidth);
  const gridCardWidth = useMemo(
    () => (windowWidth - hPad * 2 - GRID_GAP) / 2,
    [windowWidth, hPad],
  );
  const bottomPadding = getScreenBottomPadding(insets);
  const {
    categories: dashboardCategories,
    storeProducts,
    loading: homeLoading,
  } = useHomeData();
  const productsCategoryId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'products'),
    [dashboardCategories],
  );
  const { images: bannerImages } = useBanners('product', productsCategoryId);

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
  } = useCategoryProducts(productFilter, storeProducts, {
    enabled: !homeLoading,
  });

  const { categories: productCategories, loading: categoriesLoading } =
    useProductCategories(null, productsCategoryId);

  const { recentProducts, loading: ordersLoading, refresh: refreshOrders } =
    useOrders({ pageSize: 5 });

  const { onScroll } = useScrollHide();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const handleSearchPress = useCallback(() => {
    // Global search — all products + medicines, not store-scoped
    navigateToSearchScreen(navigation);
  }, [navigation]);

  const handleViewOrderHistory = useCallback(() => {
    navigation.navigate('OrderHistory');
  }, [navigation]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;

      const stockMsg = getAddQtyBlockMessage(item, newQty);
      if (stockMsg) {
        showSuccessToast(stockMsg, 'error');
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
          prescriptionRequired: isPrescriptionRequired(item),
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

  useWishlistSync(setProducts);

  const handleWishlist = useCallback(async (item: any) => {
    await toggleWishlistItem(item);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={[styles.cardWrap, { width: gridCardWidth }]}>
          <ProductCard
            item={item}
            variant="grid"
            gridWidth={gridCardWidth}
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              navigateToProductDetails(navigation, item.variant_id)
            }
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
      gridCardWidth,
    ],
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerContent}>
        {bannerImages.length > 0 ? (
          <View style={styles.bannerWrap}>
            <Detailimages
              images={bannerImages}
              DynamicResize="cover"
              autoSlide
              embedded
              mode="banner"
              enablePreview={false}
            />
          </View>
        ) : null}

        {categoriesLoading && productCategories.length === 0 ? (
          <>
            <SectionHeader title="Shop by Category" />
            <CategoryRowSkeleton />
          </>
        ) : (
          <>
            <SectionHeader
              title="Shop by Category"
              actionText="View all"
              onPress={() =>
                navigateToCategoryProducts(navigation, {
                  categoryMode: 'product',
                  categoryName: 'Shop by Category',
                  serviceCategoryId: productsCategoryId || undefined,
                })
              }
            />
            {productCategories.length > 0 ? (
              <CategoryList
                data={productCategories}
                navigation={navigation}
                mode="product"
                serviceCategoryId={productsCategoryId || undefined}
              />
            ) : !categoriesLoading ? (
              <Text style={styles.emptyCategoryHint}>
                Tap View all to browse categories
              </Text>
            ) : null}
          </>
        )}

        {(ordersLoading || recentProducts.length > 0) && (
          <>
            <SectionHeader
              title="Recent Orders"
              actionText="View History"
              onPress={handleViewOrderHistory}
            />
            {ordersLoading && recentProducts.length === 0 ? (
              <CategoryRowSkeleton />
            ) : (
              <RecentProductsList
                data={recentProducts}
                navigation={navigation}
              />
            )}
          </>
        )}

        <SectionHeader title="All Products"
          actionText={"View All"} onPress={() =>
            navigateToCategoryProducts(navigation, {
              categoryMode: 'product',
              categoryName: 'Shop by Category',
              serviceCategoryId: productsCategoryId || undefined,
            })
          } />
      </View>
    ),
    [
      productCategories,
      categoriesLoading,
      navigation,
      bannerImages,
      productsCategoryId,
      ordersLoading,
      recentProducts,
      handleViewOrderHistory,
    ],
  );

  const showInitialSkeleton = loading && products.length === 0;

  return (
    <SafeAreaView
      style={[styles.safe, { paddingHorizontal: hPad }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />

      <Header
        title="Products Store"
        backIcon={Images.backIcon}
        onBack={() => goBackToHomeTab(navigation)}
        subtitle="Choose best product"
        onSearchPress={handleSearchPress}
        showCart
      />

      {showInitialSkeleton ? (
        <View style={styles.skeletonWrap}>
          <ProductsScreenSkeleton />
        </View>
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
              onRefresh={() => {
                refresh();
                refreshOrders();
              }}
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
                  cardWidth={gridCardWidth}
                  gap={GRID_GAP}
                  count={2}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText} allowFontScaling={false}>
              No products available
            </Text>
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
    backgroundColor: Colors.background,
  },
  headerContent: {},
  bannerWrap: {
    marginBottom: 8,
    marginTop: 20,
    width: '100%',
    overflow: 'hidden',
    borderRadius: RADIUS.md,
  },
  listContent: {},
  columnWrap: {
    justifyContent: 'space-between',
    gap: GRID_GAP,
  },
  cardWrap: {
    marginBottom: GRID_GAP,
  },
  skeletonWrap: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: TYPO.md,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  emptyCategoryHint: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  footerLoader: {
    paddingVertical: 8,
  },
});
