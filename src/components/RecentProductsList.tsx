import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Product } from '../types';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { RupeeAmount } from '../utils/currencyUtils';
import { navigateToProductDetails } from '../navigation/productNavigation';
import { HORIZONTAL_SCROLL_CONTENT } from '../constants/layout';

interface Props {
  data?: Product[];
  navigation?: any;
}

const RecentProductsList: React.FC<Props> = ({ data = [], navigation }) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(168, Math.round(width * 0.42));
  const safeData = Array.isArray(data) ? data : [];

  const handlePress = useCallback(
    (item: Product) => {
      const variantId = String(
        (item as any)?.variantId ?? (item as any)?.variant_id ?? '',
      );
      if (!variantId || !navigation) return;
      navigateToProductDetails(navigation, variantId);
    },
    [navigation],
  );

  if (safeData.length === 0) return null;

  return (
    <FlatList
      data={safeData}
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      keyExtractor={(item, index) => String(item?.id ?? index)}
      contentContainerStyle={[HORIZONTAL_SCROLL_CONTENT, styles.listContent]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, { width: cardWidth }]}
          onPress={() => handlePress(item)}
          activeOpacity={0.88}
        >
          <View style={styles.imageBox}>
            <Image source={item.image} style={styles.img} />
          </View>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.lastOrdered ? `Ordered ${item.lastOrdered}` : 'Recent order'}
          </Text>
          <RupeeAmount value={item.price} style={styles.price} decimals={0} />
        </TouchableOpacity>
      )}
    />
  );
};

export default React.memo(RecentProductsList);

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 2,
  },
  separator: {
    width: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8EEF2',
    padding: 8,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#F3F7F5',
    overflow: 'hidden',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  name: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 16,
    minHeight: 32,
  },
  sub: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  price: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
});
