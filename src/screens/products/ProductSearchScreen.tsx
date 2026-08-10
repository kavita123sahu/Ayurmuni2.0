import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../common/Colors';
import { ProductGridSkeleton } from '../../simmerScreen/ShimmerHook';
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
import { useDebounce } from '../../hooks/useDebaunce';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import {
  canAddProductQty,
  isProductOutOfStock,
} from '../../utils/productStockUtils';
import TablerIcon from '../../components/TablerIcon';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PADDING = 16;
const GRID_GAP = 10;
const GRID_CARD_WIDTH = (SCREEN_W - H_PADDING * 2 - GRID_GAP) / 2;

type RatingFilter = 0 | 2 | 3 | 4;

const RATING_FILTERS: { value: RatingFilter; label: string }[] = [
  { value: 0, label: 'All' },
  { value: 4, label: '4★ & up' },
  { value: 3, label: '3★ & up' },
  { value: 2, label: '2★ & up' },
];

const getProductRating = (item: any) =>
  Number(
    item?.avg_rating ??
    item?.average_rating ??
    item?.rating ??
    item?.variant?.avg_rating ??
    0,
  );

const ProductSearchScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const routeParams = props.route?.params ?? {};
  const [searchText, setSearchText] = useState('');
  const [minRating, setMinRating] = useState<RatingFilter>(0);
  const debouncedSearch = useDebounce(searchText, 350);

  // Search → whole catalog (`?search=` only). No search → optional browse filters from route / all products.
  const productFilter = useMemo(() => {
    const q = debouncedSearch.trim();
    if (q) {
      return { search: q };
    }

    return {
      service_category_id: routeParams.serviceCategoryId
        ? String(routeParams.serviceCategoryId)
        : undefined,
      id: routeParams.categoryId ? String(routeParams.categoryId) : undefined,
      health_category_id: routeParams.healthCategoryId
        ? String(routeParams.healthCategoryId)
        : undefined,
    };
  }, [
    debouncedSearch,
    routeParams.serviceCategoryId,
    routeParams.categoryId,
    routeParams.healthCategoryId,
  ]);

  const {
    products,
    setProducts,
    loading,
    loadingMore,
    refreshing,
    refresh,
    loadMore,
  } = useCategoryProducts(productFilter, [], { enabled: true });

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

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
      setProducts((prev: any[]) =>
        prev.map(p =>
          p.variant_id === item.variant_id
            ? { ...p, is_wishlist_item: !old }
            : p,
        ),
      );
      try {
        await TogglewishlistProduct(item.variant_id, 'POST');
      } catch {
        setProducts((prev: any[]) =>
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

  const filteredProducts = useMemo(() => {
    if (minRating <= 0) return products;
    return products.filter(item => getProductRating(item) >= minRating);
  }, [products, minRating]);

  const resultLabel = debouncedSearch.trim()
    ? `${filteredProducts.length} result${filteredProducts.length === 1 ? '' : 's'}`
    : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.headerWrap}>
        <Header
          title="Search"
          backIcon={Images.backIcon}
          onBack={() => safeGoBack(props.navigation)}
          subtitle="Find medicines & products"
          onRefreshPress={onRefresh}
        />
        <SearchBar
          placeholder="Search products..."
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />

        <View style={styles.filterHeader}>
          <TablerIcon name="star" size={14} color={Colors.primaryColor} />
          <Text style={styles.filterTitle}>Filter by Rating</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ratingFilterRow}
        >
          {RATING_FILTERS.map(option => {
            const active = minRating === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.85}
                onPress={() => setMinRating(option.value)}
                style={[styles.ratingChip, active && styles.ratingChipActive]}
              >
                <Text
                  style={[
                    styles.ratingChipText,
                    active && styles.ratingChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!loading && (
          <Text style={styles.resultCount}>{resultLabel}</Text>
        )}
      </View>

      {loading && products.length === 0 ? (
        <ProductGridSkeleton
          cardWidth={GRID_CARD_WIDTH}
          gap={GRID_GAP}
          count={6}
          paddingHorizontal={H_PADDING}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, i) => String(item.variant_id || i)}
          numColumns={2}
          renderItem={renderProductItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          columnWrapperStyle={styles.columnWrap}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={Colors.primaryColor}
                style={styles.footerLoader}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>
                {debouncedSearch.trim() || minRating > 0
                  ? 'No matching products'
                  : 'No products yet'}
              </Text>
              <Text style={styles.emptyText}>
                {minRating > 0
                  ? `No products with ${minRating}★ or higher. Try another rating filter.`
                  : debouncedSearch.trim()
                    ? `Try another keyword for "${debouncedSearch.trim()}"`
                    : 'Products will appear here once available.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ProductSearchScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  headerWrap: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 4,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ratingFilterRow: {
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
  },
  ratingChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  ratingChipActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#E8F5F1',
  },
  ratingChipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  ratingChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resultCount: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 4,
  },
  columnWrap: {
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    marginBottom: GRID_GAP,
  },
  footerLoader: {
    marginVertical: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
});
