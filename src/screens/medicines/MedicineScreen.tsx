import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import RecentProductsList from '../../components/RecentProductsList';
import CategoryList from '../../components/CategoryList';
import SectionHeader from '../../components/SectionHeader';
import ActionCards from '../../components/ActionCards';
import BrandList from '../../components/BrandList';
import ProductCard from '../../components/ProductCard';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { useHomeData } from '../../hooks/UseHomeData';
import { useOrders } from '../../hooks/useOrders';
import { getDetailBottomPadding } from '../../constants/layout';
import { RootStackParamList } from '../../../type';
import { TablerIconName } from '../../components/TablerIcon';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { safeGoBack } from '../../navigation/navigationUtils';
import {
  navigateToSearchScreen,
  navigateToCategoryProducts,
  navigateToProductDetails,
} from '../../navigation/productNavigation';
import { useBrands } from '../../hooks/useBrands';
import { useHealthConcernCategories } from '../../hooks/useHealthConcernCategories';
import { mapBrandItem } from '../../utils/orderUtils';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { getServiceCategoryId } from '../../utils/serviceCategoryUtils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import {
  toggleWishlistItem,
  useWishlistSync,
} from '../../hooks/useWishlistSync';
import { showSuccessToast } from '../../config/Key';
import { requireAuth } from '../../services/guestAuth';
import Detailimages from '../../components/Detailimages';
import { useBanners } from '../../hooks/useBanners';
import {
  ProductGridSkeleton,
  MedicineScreenSkeleton,
  CategoryRowSkeleton,
  HorizontalChipSkeleton,
} from '../../simmerScreen/ShimmerHook';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../../utils/prescriptionUtils';

const H_PAD = 20;
const GRID_GAP = 10;
const GRID_CARD_WIDTH =
  (Dimensions.get('window').width - H_PAD * 2 - GRID_GAP) / 2;

type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  iconName: TablerIconName;
  screen: keyof RootStackParamList;
};

const MedicineScreen = (props: any) => {
  const navigation = useNavigation<any>();
  const stackNav = navigation.getParent?.() || navigation;
  const insets = useSafeAreaInsets();
  const bottomPadding = getDetailBottomPadding(insets);
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);
  const {
    categories: dashboardCategories,
    medicineProducts,
    loading: homeLoading,
    refreshHomeData,
  } = useHomeData();

  const medicineCategoryId = useMemo(
    () => getServiceCategoryId(dashboardCategories, 'medicine'),
    [dashboardCategories],
  );
  const { images: bannerImages } = useBanners('medicine', medicineCategoryId);

  const productFilter = useMemo(
    () =>
      medicineCategoryId
        ? { service_category_id: medicineCategoryId }
        : {},
    [medicineCategoryId],
  );

  const {
    products,
    setProducts,
    loading,
    loadingMore,
    refreshing,
    refresh,
    loadMore,
  } = useCategoryProducts(productFilter, medicineProducts, {
    enabled: !homeLoading,
  });

  const {
    categories: healthConcerns,
    loading: healthConcernsLoading,
    refresh: refreshHealthConcerns,
  } = useHealthConcernCategories(medicineCategoryId);

  const { brands, refresh: refreshBrands } = useBrands();
  const { recentProducts, loading: ordersLoading, refresh: refreshOrders } =
    useOrders({ pageSize: 5 });

  const brandListData = useMemo(
    () =>
      (Array.isArray(brands) ? brands : []).map((brand: any) => {
        const mapped = mapBrandItem(brand);
        return {
          ...mapped,
          onPress: () => {
            if (!mapped.id) return;
            navigateToCategoryProducts(navigation, {
              categoryMode: 'product',
              categoryName: mapped.name,
              brand_name_id: mapped.id,
              brandName: mapped.name,
              serviceCategoryId: medicineCategoryId || undefined,
            });
          },
        };
      }),
    [brands, navigation, medicineCategoryId],
  );

  const handleSearchPress = useCallback(() => {
    navigateToSearchScreen(navigation, {
      categoryMode: 'health',
      serviceCategoryId: medicineCategoryId || undefined,
    });
  }, [navigation, medicineCategoryId]);

  const handleViewOrderHistory = useCallback(() => {
    navigation.navigate('OrderHistory');
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refreshHomeData(),
      refresh(),
      refreshOrders(),
      refreshBrands(),
      refreshHealthConcerns(),
    ]);
  }, [
    refreshHomeData,
    refresh,
    refreshOrders,
    refreshBrands,
    refreshHealthConcerns,
  ]);

  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Order With Prescription',
        subtitle: 'Upload & Get Verified',
        iconName: 'upload',
        screen: 'Prescription',
      },
      {
        id: '2',
        title: 'Search & Buy Online',
        subtitle: 'Browse 50k+ Products',
        iconName: 'search',
        screen: 'SearchScreen',
      },
    ],
    [],
  );

  const safeHealthConcerns = Array.isArray(healthConcerns) ? healthConcerns : [];

  const handleActionPress = useCallback(
    (item: { screen?: keyof RootStackParamList }) => {
      if (item?.screen)
        showSuccessToast('This feature is Coming Soon', 'success');
      //  stackNav.navigate(item.screen);
    },
    [stackNav],
  );

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

  useWishlistSync(setProducts);

  const handleWishlist = useCallback(async (item: any) => {
    await toggleWishlistItem(item);
  }, []);

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
      <View>
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

        {/* <ActionCards data={actionItems} onpress={handleActionPress} /> */}

        {(ordersLoading || recentProducts.length > 0) && (
          <>
            <SectionHeader
              title="Recent Orders"
              actionText="View History"
              onPress={handleViewOrderHistory}
            />
            {ordersLoading && recentProducts.length === 0 ? (
              <HorizontalChipSkeleton count={4} width={100} height={72} />
            ) : (
              <RecentProductsList
                data={recentProducts}
                navigation={navigation}
              />
            )}
          </>
        )}

        {healthConcernsLoading && safeHealthConcerns.length === 0 ? (
          <>
            <SectionHeader title="Shop by Concern" />
            <CategoryRowSkeleton />
          </>
        ) : safeHealthConcerns.length > 0 ? (
          <>
            <SectionHeader title="Shop by Concern" />
            <CategoryList
              data={safeHealthConcerns}
              navigation={navigation}
              doctor
              variant="concern"
            />
          </>
        ) : null}

        {brandListData.length > 0 ? (
          <>
            <SectionHeader title="Trusted Brands" />
            <BrandList data={brandListData} />
          </>
        ) : null}

        <SectionHeader title="All Medicines" actionText="" />
      </View>
    ),
    [
      actionItems,
      handleActionPress,
      ordersLoading,
      recentProducts,
      handleViewOrderHistory,
      navigation,
      healthConcernsLoading,
      safeHealthConcerns,
      brandListData,
      bannerImages,
    ],
  );

  const showInitialSkeleton = loading && products.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />

      <Header
        title="Medicine Store"
        backIcon={Images.backIcon}
        onBack={() => safeGoBack(navigation)}
        subtitle="Health & Wellness"
        onSearchPress={handleSearchPress}
        showCart
      />

      {showInitialSkeleton ? (
        <MedicineScreenSkeleton />
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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
            <Text style={styles.emptyText}>No medicines available</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default React.memo(MedicineScreen);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: H_PAD,
    backgroundColor: SCREEN_THEME.screenBackground,
  },
  listContent: {
    paddingTop: 4,
  },
  bannerWrap: {
    marginBottom: 10,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 14,
  },
  columnWrap: {
    justifyContent: 'space-between',
    gap: GRID_GAP,
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    marginBottom: GRID_GAP,
  },
  footerLoader: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
});
