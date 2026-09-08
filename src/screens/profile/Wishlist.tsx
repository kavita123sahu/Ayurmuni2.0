import { View, StyleSheet, StatusBar } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import TopSellingList from '../../components/TopSellingList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WishlistSkeleton } from '../../simmerScreen/ShimmerHook';
import EmptyState from '../../components/EmptyState';
import * as _PRODUCT_SERVICES from '../../services/ProductServices';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { Colors } from '../../common/Colors';

const Wishlist = (props: any) => {
  const [wishlistData, setWishlistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  useWishlistSync(setWishlistData, { removeWhenUnwishlisted: true });

  const fetchWishlist = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh on every focus (including back from product details)
      fetchWishlist(hasLoadedRef.current);
      hasLoadedRef.current = true;
    }, [fetchWishlist]),
  );

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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 20,
    // paddingHorizontal: 15,
    backgroundColor: '#FDFDFB',
  },
});
