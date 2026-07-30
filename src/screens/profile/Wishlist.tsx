import { View, StyleSheet, StatusBar } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import TopSellingList from '../../components/TopSellingList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WishlistSkeleton } from '../../simmerScreen/ShimmerHook';
import EmptyState from '../../components/EmptyState';
import * as _PRODUCT_SERVICES from '../../services/ProductServices';

const Wishlist = (props: any) => {
  const [wishlistData, setWishlistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);

      const res = await _PRODUCT_SERVICES.getProduct();
      const data = res?.data?.results || [];
      const wishlistItems = data
        .filter((item: any) => item?.is_wishlist_item === true)
        .map((item: any) => ({
          ...item,
          is_wishlist_item: true,
          variant_id:
            item?.variant_id ??
            item?.variant?.variant_id ??
            item?.variant?.id ??
            item?.id,
        }));

      setWishlistData(wishlistItems);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const hasItems = wishlistData.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="My Wishlist"
        onLeftPress={() => props.navigation.goBack()}
      />

      <View style={styles.content}>
        {loading ? (
          <WishlistSkeleton />
        ) : hasItems ? (
          <TopSellingList
            data={wishlistData}
            fav
            isGrid
            isWishlistScreen
            navigation={props.navigation}
            setProductData={setWishlistData}
          />
        ) : (
          <EmptyState
            imageSize={15}
            iconName="heart"
            title="Wishlist is Empty"
            subtitle="No products added to wishlist yet."
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    backgroundColor: '#FDFDFB',
  },
});
