import React, { useCallback } from 'react';
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
import PromoCard from '../../components/PromoCard';
import ProductCard, { GRID_CARD_WIDTH } from '../../components/ProductCard';
import SectionHeader from '../../components/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { useHomeData } from '../../hooks/UseHomeData';
import { TopSellingListSkeleton } from '../../simmerScreen/ShimmerHook';
import { useScrollHide } from '../../context/ScrollHideContext';
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

const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const stackNav = navigation.getParent?.() || navigation;
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);
  const { productData, setProductData, loadingProducts } = useHomeData();
  const { onScroll } = useScrollHide();
  const dispatch = useAppDispatch();
  const variantQuantities = useAppSelector(s => s.cart.variantQuantities);
  const addingVariantId = useAppSelector(s => s.cart.addingVariantId);

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

  const ListHeader = () => (
    <View style={styles.headerContent}>
      <SearchBar placeholder="Search seeds, oils, supplements..." />
      <PromoCard
        title="Up to 40% OFF on Supplements"
        desc="Keep your immunity strong this season."
        tag="SUMMER SALE"
        buttontext="Shop Now"
        showButton
        onPress={() => { }}
      />
      <SectionHeader title="Top Selling Products" actionText="View all" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Products"
        backIcon={Images.backIcon}
        onBack={() => safeGoBack(navigation)}
        subtitle="Choose best product"
      />

      {loadingProducts && productData.length === 0 ? (
        <View style={styles.skeletonWrap}>
          <TopSellingListSkeleton />
        </View>
      ) : (
        <FlatList
          data={productData}
          keyExtractor={(item, i) => String(item.variant_id || i)}
          numColumns={2}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          columnWrapperStyle={styles.columnWrap}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
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
    paddingHorizontal: 20
  },
  headerContent: {
    // paddingHorizontal: 20,
  },
  listContent: {
    // paddingHorizontal: 14,
  },
  columnWrap: {
    justifyContent: 'space-between',
    // paddingHorizontal: 6,
  },
  cardWrap: {
    width: GRID_CARD_WIDTH,
    marginBottom: 4,
  },
  skeletonWrap: {
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
});
