import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ProductCard from '../../components/ProductCard';
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
import { useDebounce } from '../../hooks/useDebaunce';
import { applyProductFilters } from '../../utils/productSearchUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PADDING = 16;
const GRID_GAP = 10;
const GRID_CARD_WIDTH = (SCREEN_W - H_PADDING * 2 - GRID_GAP) / 2;

const ProductSearchScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const { productData, setProductData, loadingProducts, refreshHomeData } = useHomeData();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearch = useDebounce(searchText, 300);

  const filteredProducts = useMemo(
    () =>
      applyProductFilters({
        products: productData,
        search: debouncedSearch,
      }),
    [productData, debouncedSearch],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHomeData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHomeData]);

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

  const resultLabel = debouncedSearch.trim()
    ? `${filteredProducts.length} result${filteredProducts.length === 1 ? '' : 's'}`
    : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
        {!loadingProducts && (
          <Text style={styles.resultCount}>{resultLabel}</Text>
        )}
      </View>

      {loadingProducts && productData.length === 0 ? (
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
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primaryColor]}
              tintColor={Colors.primaryColor}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>
                {debouncedSearch.trim() ? 'No matching products' : 'No products yet'}
              </Text>
              <Text style={styles.emptyText}>
                {debouncedSearch.trim()
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
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 20,
  },
});
