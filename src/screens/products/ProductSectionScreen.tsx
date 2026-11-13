import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import TopSellingList from '../../components/TopSellingList';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { getScreenBottomPadding } from '../../constants/layout';
import { useProductSection } from '../../hooks/useProductSection';
import {
  PRODUCT_SECTION_LABELS,
  ProductSectionType,
} from '../../services/ProductServices';
import { safeGoBack } from '../../navigation/navigationUtils';

/**
 * Full-list "View all" for home discovery rails (Featured / Trending / Recently Viewed).
 */
const ProductSectionScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const section = String(route?.params?.section || 'featured') as ProductSectionType;
  const title =
    route?.params?.title ||
    PRODUCT_SECTION_LABELS[section] ||
    'Products';

  const { products, setProducts, loading, refresh, loadMore, hasMore, loadingMore } =
    useProductSection({
      section,
      enabled: true,
      pageSize: 20,
      paginated: true,
    });

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title={title} onLeftPress={() => safeGoBack(navigation)} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: getScreenBottomPadding(insets) + 16,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading && products.length > 0}
            onRefresh={onRefresh}
            colors={[Colors.primaryColor]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const nearEnd =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
          if (nearEnd && hasMore && !loadingMore) {
            loadMore?.();
          }
        }}
        scrollEventThrottle={200}
      >
        {loading && products.length === 0 ? (
          <View style={styles.empty}>
            <ActivityIndicator color={Colors.primaryColor} />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No products in this section yet.</Text>
          </View>
        ) : (
          <TopSellingList
            data={products}
            setProductData={setProducts}
            navigation={navigation}
            isGrid
            nested
          />
        )}
        {loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color={Colors.primaryColor} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductSectionScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: '#6B7874',
  },
  footer: {
    paddingVertical: 16,
  },
});
