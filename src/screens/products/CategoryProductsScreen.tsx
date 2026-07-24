import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import ProductSearchFilterBar from '../../components/ProductSearchFilterBar';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import { getScreenBottomPadding } from '../../constants/layout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncCartQuantity } from '../../store/slices/cartSlice';
import { TogglewishlistProduct } from '../../services/ProductServices';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { requireAuth } from '../../services/guestAuth';
import { Images } from '../../common/Images';
import { safeGoBack } from '../../navigation/navigationUtils';
import { navigateToProductDetails } from '../../navigation/productNavigation';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import {
  ProductCategoryItem,
  useProductCategories,
} from '../../hooks/useProductCategories';
import { useHealthCategories } from '../../hooks/useHealthCategories';
import {
  applyProductFilters,
  ProductSortKey,
  PriceRangeKey,
} from '../../utils/productSearchUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const CATEGORY_PANEL_WIDTH = 78;
const CONTENT_PADDING = 14;
const GRID_GAP = 8;
const PRODUCT_PANEL_WIDTH = SCREEN_W - CATEGORY_PANEL_WIDTH;
const GRID_CARD_WIDTH = (PRODUCT_PANEL_WIDTH - CONTENT_PADDING - GRID_GAP) / 2;

type CategoryItem = ProductCategoryItem & { isAll?: boolean };

const ALL_CATEGORY: CategoryItem = {
  id: 'all',
  name: 'All',
  image_url: '',
  isAll: true,
};

const CategoryProductsScreen = (props: any) => {
  const routeParams = props?.route?.params ?? {};
  const categoryMode: 'health' | 'product' =
    routeParams.categoryMode ??
    (routeParams.healthCategoryId && !routeParams.categoryId ? 'health' : 'product');

  const initialCategoryId = routeParams.categoryId
    ? String(routeParams.categoryId)
    : routeParams.healthCategoryId
      ? String(routeParams.healthCategoryId)
      : 'all';
  const initialSubcategoryId = routeParams.productSubcategoryId
    ? String(routeParams.productSubcategoryId)
    : null;

  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const { productData, setProductData } = useHomeData();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [sortBy, setSortBy] = useState<ProductSortKey>('relevance');
  const [brandName, setBrandName] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRangeKey>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(
    initialSubcategoryId,
  );

  const activeCategoryId =
    selectedCategoryId === 'all' ? null : selectedCategoryId;

  const { categories: productTopCategories, loading: productTopLoading, refresh: refreshProductTop } =
    useProductCategories(null);

  const { categories: healthTopCategories, loading: healthTopLoading, refresh: refreshHealthTop } =
    useHealthCategories(null);

  const topCategories =
    categoryMode === 'health' ? healthTopCategories : productTopCategories;
  const topCategoriesLoading =
    categoryMode === 'health' ? healthTopLoading : productTopLoading;
  const refreshTopCategories =
    categoryMode === 'health' ? refreshHealthTop : refreshProductTop;

  const { categories: productSubcategories, loading: productSubLoading, refresh: refreshProductSub } =
    useProductCategories(categoryMode === 'product' ? activeCategoryId : null);

  const { categories: healthSubcategories, loading: healthSubLoading, refresh: refreshHealthSub } =
    useHealthCategories(categoryMode === 'health' ? activeCategoryId : null);

  const subcategories =
    categoryMode === 'health' ? healthSubcategories : productSubcategories;
  const subcategoriesLoading =
    categoryMode === 'health' ? healthSubLoading : productSubLoading;
  const refreshSubcategories =
    categoryMode === 'health' ? refreshHealthSub : refreshProductSub;

  const productFilter = useMemo(() => {
    if (categoryMode === 'health') {
      const healthId =
        selectedSubcategoryId ??
        activeCategoryId ??
        routeParams.healthCategoryId ??
        null;

      return {
        health_category_id: healthId,
        health_disease_id: routeParams.healthDiseaseId ?? null,
      };
    }

    return {
      id: activeCategoryId,
      product_subcategory_id: selectedSubcategoryId,
      health_category_id: routeParams.healthCategoryId ?? null,
      health_disease_id: routeParams.healthDiseaseId ?? null,
    };
  }, [
    categoryMode,
    activeCategoryId,
    selectedSubcategoryId,
    routeParams.healthCategoryId,
    routeParams.healthDiseaseId,
  ]);

  const { products, loading, refreshing, refresh } = useCategoryProducts(
    productFilter,
    productData,
  );

  const prevCategoryRef = useRef(selectedCategoryId);

  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategoryId) {
      setSelectedSubcategoryId(null);
      prevCategoryRef.current = selectedCategoryId;
    }
  }, [selectedCategoryId]);

  const categoryList = useMemo(() => {
    return [ALL_CATEGORY, ...topCategories].filter(item => item.id);
  }, [topCategories]);

  const brandOptions = useMemo(() => {
    const names = products
      .map(item => String(item?.brand_name ?? item?.brand?.name ?? '').trim())
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      applyProductFilters({
        products,
        sortBy,
        brandName,
        priceRange,
      }),
    [products, sortBy, brandName, priceRange],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'relevance') count += 1;
    if (brandName) count += 1;
    if (priceRange !== 'all') count += 1;
    return count;
  }, [sortBy, brandName, priceRange]);

  const clearFilters = useCallback(() => {
    setSortBy('relevance');
    setBrandName(null);
    setPriceRange('all');
  }, []);

  const handleRefresh = useCallback(async () => {
    refreshTopCategories();
    if (activeCategoryId) {
      refreshSubcategories();
    }
    refresh();
  }, [refreshTopCategories, refreshSubcategories, refresh, activeCategoryId]);

  const handleCartUpdate = useCallback(
    async (item: any, newQty: number) => {
      if (!(await requireAuth('Please login to add items to cart'))) return;
      const variantId = String(item?.variant_id);
      if (!variantId) return;
      const result = await dispatch(syncCartQuantity({ variantId, quantity: newQty }));
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
      setProductData(prev =>
        prev.map(p =>
          p.variant_id === item.variant_id
            ? { ...p, is_wishlist_item: !old }
            : p,
        ),
      );
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setProductData(prev =>
          prev.map(p =>
            p.variant_id === item.variant_id
              ? { ...p, is_wishlist_item: old }
              : p,
          ),
        );
      }
    },
    [setProductData],
  );

  const renderProductItem = useCallback(
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
              navigateToProductDetails(props.navigation, item?.variant_id)
            }
            onAdd={() => handleCartUpdate(item, cartQty + 1)}
            onIncrement={() => handleCartUpdate(item, cartQty + 1)}
            onDecrement={() => handleCartUpdate(item, Math.max(0, cartQty - 1))}
            onWishlist={() => handleWishlist(item)}
          />
        </View>
      );
    },
    [variantQuantities, addingVariantId, props.navigation, handleCartUpdate, handleWishlist],
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryItem }) => {
      const active = item.id === selectedCategoryId;
      return (
        <TouchableOpacity
          style={[styles.categoryItem, active && styles.categoryItemActive]}
          onPress={() => setSelectedCategoryId(item.id)}
          activeOpacity={0.85}
        >
          <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>
            <Image
              source={
                item.isAll
                  ? Images.cardiology
                  : item.image_url
                    ? { uri: item.image_url }
                    : Images.cardiology
              }
              style={styles.categoryIcon}
            />
          </View>
          <Text
            style={[styles.categoryLabel, active && styles.categoryLabelActive]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCategoryId],
  );

  const selectedCategoryName =
    categoryList.find(item => item.id === selectedCategoryId)?.name ?? 'All';

  const selectedSubcategoryName =
    subcategories.find(item => item.id === selectedSubcategoryId)?.name ?? '';

  const subtitle = selectedSubcategoryName || selectedCategoryName;

  const showSubcategories =
    activeCategoryId && subcategories.length > 0 && !subcategoriesLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.headerWrap}>
        <Header
          title={routeParams.categoryName ?? (categoryMode === 'health' ? 'Health Concerns' : 'Categories')}
          backIcon={Images.backIcon}
          onBack={() => safeGoBack(props.navigation)}
          subtitle={subtitle}
          onRefreshPress={handleRefresh}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.categoryPanel}>
          {topCategoriesLoading && topCategories.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={Colors.primaryColor}
              style={styles.categoryLoader}
            />
          ) : (
            <FlatList
              data={categoryList}
              keyExtractor={item => item.id}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryListContent}
            />
          )}
        </View>

        <View style={styles.productPanel}>
          {showSubcategories && (
            <View style={styles.subcategorySection}>
              <Text style={styles.subcategoryTitle}>Subcategories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subcategoryRow}
              >
                <TouchableOpacity
                  style={[
                    styles.subcategoryChip,
                    !selectedSubcategoryId && styles.subcategoryChipActive,
                  ]}
                  onPress={() => setSelectedSubcategoryId(null)}
                >
                  <Text
                    style={[
                      styles.subcategoryChipText,
                      !selectedSubcategoryId && styles.subcategoryChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {subcategories.map(item => {
                  const active = selectedSubcategoryId === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.subcategoryChip,
                        active && styles.subcategoryChipActive,
                      ]}
                      onPress={() => setSelectedSubcategoryId(item.id)}
                    >
                      <Text
                        style={[
                          styles.subcategoryChipText,
                          active && styles.subcategoryChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <ProductSearchFilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            brandName={brandName}
            onBrandChange={setBrandName}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            brands={brandOptions}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          />

          {!loading && (
            <Text style={styles.resultCount}>
              {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
            </Text>
          )}

          {loading && products.length === 0 ? (
            <TopSellingListSkeleton />
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item, i) => String(item.variant_id || i)}
              numColumns={2}
              renderItem={renderProductItem}
              contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
              columnWrapperStyle={styles.columnWrap}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[Colors.primaryColor]}
                  tintColor={Colors.primaryColor}
                />
              }
              ListEmptyComponent={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.primaryColor}
                    style={styles.loader}
                  />
                ) : (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No products in this category</Text>
                    <Text style={styles.emptyText}>
                      Try another category or adjust filters.
                    </Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  headerWrap: {
    paddingHorizontal: CONTENT_PADDING,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  productPanel: {
    flex: 1,
    paddingLeft: 6,
    paddingRight: CONTENT_PADDING,
  },
  categoryPanel: {
    width: CATEGORY_PANEL_WIDTH,
    backgroundColor: '#F8FAFB',
    borderRightWidth: 1,
    borderRightColor: '#EEF2F6',
  },
  categoryLoader: {
    marginTop: 24,
  },
  categoryListContent: {
    paddingVertical: 4,
    paddingBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 3,
    borderRightWidth: 3,
    borderRightColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#FFFFFF',
    borderRightColor: Colors.primaryColor,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconWrapActive: {
    backgroundColor: '#EAF8F4',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  categoryLabel: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    paddingHorizontal: 2,
  },
  categoryLabelActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subcategorySection: {
    marginBottom: 6,
  },
  subcategoryTitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 6,
  },
  subcategoryRow: {
    gap: 6,
    paddingRight: 4,
  },
  subcategoryChip: {
    minWidth: 64,
    maxWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryChipActive: {
    backgroundColor: '#EAF8F4',
    borderColor: Colors.primaryColor,
  },
  subcategoryChipText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  subcategoryChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resultCount: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 6,
  },
  listContent: {
    paddingTop: 2,
  },
  columnWrap: {
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    marginBottom: GRID_GAP,
  },
  loader: {
    marginTop: 40,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
