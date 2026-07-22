import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ProductSortDropdown from '../../components/ProductSortDropdown';
import ProductCard, { GRID_CARD_WIDTH } from '../../components/ProductCard';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import { getScreenBottomPadding } from '../../constants/layout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart, fetchCart } from '../../store/slices/cartSlice';
import { updateProductItem } from '../../store/slices/homeSlice';
import { TogglewishlistProduct } from '../../services/ProductServices';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { requireAuth } from '../../services/guestAuth';
import { Images } from '../../common/Images';
import { safeGoBack } from '../../navigation/navigationUtils';
import { useDebounce } from '../../hooks/useDebaunce';
import {
  applyProductFilters,
  ProductSortKey,
} from '../../utils/productSearchUtils';

const ProductSearchScreen = () => {
  const navigation = useNavigation<any>();
  const stackNav = navigation.getParent?.() || navigation;
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const { productData, setProductData, loadingProducts } = useHomeData();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortKey>('relevance');
  const debouncedSearch = useDebounce(searchText, 300);

  const filteredProducts = useMemo(
    () =>
      applyProductFilters({
        products: productData,
        search: debouncedSearch,
        sortBy,
      }),
    [productData, debouncedSearch, sortBy],
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
          prev.map(p =>
            String(p.variant_id) === variantId ? { ...p, quantity: newQty } : p,
          ),
        );
        dispatch(updateProductItem({ variantId, updates: { quantity: newQty } }));
      }
    },
    [dispatch, setProductData],
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

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const variantId = String(item?.variant_id);
      const cartQty = variantQuantities[variantId] ?? 0;
      return (
        <View style={styles.cardWrap}>
          <ProductCard
            item={item}
            variant="grid"
            cartQty={cartQty}
            isAdding={addingVariantId === variantId}
            onPress={() =>
              stackNav.navigate('ProductDetails', { varientID: item.variant_id })
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
      stackNav,
      handleCartUpdate,
      handleWishlist,
    ],
  );

  const resultLabel = debouncedSearch.trim()
    ? `${filteredProducts.length} result${filteredProducts.length === 1 ? '' : 's'}`
    : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`;

  const listHeader = (
    <View style={styles.searchWrap}>
      <SearchBar
        placeholder="Search seeds, oils, supplements..."
        value={searchText}
        onChangeText={setSearchText}
        autoFocus
      />
      {!loadingProducts && (
        <Text style={styles.resultCount}>{resultLabel}</Text>
      )}
      {!loadingProducts ? (
        <ProductSortDropdown value={sortBy} onChange={setSortBy} />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Search"
        backIcon={Images.backIcon}
        onBack={() => safeGoBack(navigation)}
        subtitle="Find medicines & products"
      />

      {loadingProducts && productData.length === 0 ? (
        <View style={styles.skeletonWrap}>
          {listHeader}
          <TopSellingListSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, i) => String(item.variant_id || i)}
          numColumns={2}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          columnWrapperStyle={styles.columnWrap}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
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
    paddingHorizontal: 20,
  },
  searchWrap: {
    marginBottom: 8,
  },
  resultCount: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listContent: {
    paddingTop: 4,
  },
  columnWrap: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    marginBottom: 4,
  },
  skeletonWrap: {
    flex: 1,
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
