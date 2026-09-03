import React, { memo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import SectionHeader from './SectionHeader';
import TopSellingList from './TopSellingList';
import { Colors } from '../common/Colors';
import { useProductSection } from '../hooks/useProductSection';
import type { ProductSectionType } from '../services/ProductServices';

type Props = {
  section: ProductSectionType | string;
  productId?: string | number | null;
  navigation: any;
  /** Compact home spacing */
  home?: boolean;
  enabled?: boolean;
  titleOverride?: string;
  onViewAllPress?: () => void;
};

/**
 * Ecommerce discovery rail — hides itself when empty.
 */
const ProductDiscoverySection = ({
  section,
  productId,
  navigation,
  home = false,
  enabled = true,
  titleOverride,
  onViewAllPress,
}: Props) => {
  const { title, products, setProducts, loading } = useProductSection({
    section,
    productId,
    enabled,
  });

  if (!enabled) return null;

  if (loading && products.length === 0) {
    return (
      <View style={[styles.wrap, home && styles.homeWrap]}>
        <SectionHeader home={home} title={titleOverride || title} />
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primaryColor} />
        </View>
      </View>
    );
  }

  if (!products.length) return null;

  return (
    <View style={[styles.wrap, home && styles.homeWrap]}>
      <SectionHeader
        home={home}
        title={titleOverride || title}
        actionText={onViewAllPress && products.length > 1 ? 'View all' : ''}
        onPress={onViewAllPress}
      />
      <TopSellingList
        data={products}
        navigation={navigation}
        setProductData={setProducts}
        nested
        home={home}
      />
    </View>
  );
};

export default memo(ProductDiscoverySection);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  homeWrap: {
    width: '100%',
  },
  loader: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
