import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Product } from '../types';
import { Fonts } from '../common/Fonts';
import { requireAuth } from '../services/guestAuth';
import { showSuccessToast } from '../config/Key';
import { navigateToCheckoutWithProduct } from '../navigation/productNavigation';
import { Colors } from '../common/Colors';

interface Props {
  data?: Product[];
  navigation?: any;
}

const RecentProductsList: React.FC<Props> = ({ data = [], navigation }) => {
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const safeData = Array.isArray(data) ? data : [];

  const handleReorder = useCallback(
    async (item: Product) => {
      const variantId = String(item?.variantId ?? '');

      if (!variantId) {
        showSuccessToast('Unable to reorder this item', 'error');
        return;
      }

      if (!(await requireAuth('Please login to reorder items'))) {
        return;
      }

      setReorderingId(item.id);

      try {
        navigateToCheckoutWithProduct(navigation, {
          variantId,
          name: item.name,
          price: Number(item.price),
          image: item.image,
        });
      } finally {
        setReorderingId(null);
      }
    },
    [navigation],
  );

  if (safeData.length === 0) return null;

  return (
    <FlatList
      data={safeData}
      scrollEnabled={false}
      nestedScrollEnabled
      keyExtractor={(item, index) => String(item?.id ?? index)}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => {
        const isLoading = reorderingId === item.id;

        return (
          <View style={styles.card}>
            <View style={styles.imageBox}>
              <Image source={item.image} style={styles.img} />
            </View>

            <View style={styles.rightSection}>
              <View>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.sub}>
                  Last Ordered: {item.lastOrdered ?? '—'}
                </Text>
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.price}>
                  Rs. {item.price.toFixed(2)}
                </Text>

                <TouchableOpacity
                  style={styles.btn}
                  disabled={isLoading}
                  onPress={() => handleReorder(item)}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnText}>Reorder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
};

export default React.memo(RecentProductsList);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  separator: {
    height: 8,
  },
  imageBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#0D614E1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  img: {
    width: 52,
    height: 56,
    resizeMode: 'contain',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },
  sub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  btn: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
});
