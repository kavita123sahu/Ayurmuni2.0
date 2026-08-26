import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ProductDetailDiscoverySection from './ProductDetailDiscoverySection';
import type { ProductSectionType } from '../services/ProductServices';

/** Product details rails — loaded one section at a time to avoid blocking the page */
const DETAIL_DISCOVERY_SECTIONS: ProductSectionType[] = [
  'trending',
  'best_sellers',
  'related',
  'similar',
  'recently_viewed',
];

type Props = {
  productId: string | null;
  navigation: any;
  excludeVariantId?: string | number | null;
};

const ProductDetailsDiscovery = ({
  productId,
  navigation,
  excludeVariantId,
}: Props) => {
  /** Index of the last section allowed to fetch (sequential waterfall) */
  const [enabledThrough, setEnabledThrough] = useState(0);

  useEffect(() => {
    setEnabledThrough(0);
  }, [productId]);

  const handleSectionReady = useCallback((index: number) => {
    setEnabledThrough(prev => {
      const next = index + 1;
      if (next >= DETAIL_DISCOVERY_SECTIONS.length) {
        return prev;
      }
      return Math.max(prev, next);
    });
  }, []);

  if (!productId) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {DETAIL_DISCOVERY_SECTIONS.map((section, index) => (
        <ProductDetailDiscoverySection
          key={section}
          section={section}
          productId={productId}
          navigation={navigation}
          excludeVariantId={excludeVariantId}
          enabled={index <= enabledThrough}
          discoveryApi
          paginated
          onInitialLoadComplete={() => handleSectionReady(index)}
        />
      ))}
    </View>
  );
};

export default memo(ProductDetailsDiscovery);

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
});
