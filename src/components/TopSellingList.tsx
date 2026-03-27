import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface Props {
  data: any[];
  isGrid?: boolean;
}

const TopSellingList: React.FC<Props> = ({ data, isGrid = false }) => {
  const [showAll, setShowAll] = useState(false);

  // ✅ Show only 6 initially
  const displayData = showAll ? data : data.slice(0, 6);

  // ✅ Add dummy item if odd (for grid balance)
  const formattedData =
    isGrid && displayData.length % 2 !== 0
      ? [...displayData, { id: 'empty', empty: true }]
      : displayData;

  return (
    <FlatList
      key={isGrid ? 'grid' : 'list'}
      data={formattedData}
      keyExtractor={(item, index) => item.id || index.toString()}
      horizontal={!isGrid}
      numColumns={isGrid ? 2 : 1}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingLeft: isGrid ? 0 : 16,
        paddingHorizontal: isGrid ? 16 : 0,
        paddingBottom: 20,
      }}
      columnWrapperStyle={
        isGrid
          ? {
              justifyContent: 'space-between',
              marginBottom: 14,
            }
          : undefined
      }
      renderItem={({ item }) => {
        // ✅ Empty placeholder
        if (item.empty) {
          return (
            <View
              style={[styles.card, styles.gridCard, styles.emptyCard]}
            />
          );
        }

        return (
          <View style={[styles.card, isGrid && styles.gridCard]}>
            {/* BADGE */}
            {item.tag && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.tag}</Text>
              </View>
            )}

            {/* IMAGE */}
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} />
            </View>

            {/* CONTENT */}
            <View style={styles.subContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {item.name}
              </Text>

              {item.subtitle && (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              )}

              {/* PRICE */}
              <View style={styles.priceContainer}>
                {item.oldPrice && (
                  <Text style={styles.oldPrice}>Rs. {item.oldPrice}</Text>
                )}
                <Text style={styles.price}>Rs. {item.price}</Text>
              </View>

              {/* CART BUTTON */}
              <TouchableOpacity style={styles.cartBtn}>
                <Image
                  source={require('../assets/images/CartFrame.png')}
                  style={styles.cartFrame}
                />
                <Image
                  source={require('../assets/images/Cart.png')}
                  style={styles.cartIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}

      // ✅ Discover More Button
      ListFooterComponent={
  isGrid && data.length > 6 ? (
    <View style={styles.footerContainer}>

      {/* BUTTON */}
      {!showAll && (
        <TouchableOpacity
          style={styles.discoverBtn}
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.discoverText}>Discover More</Text>
        </TouchableOpacity>
      )}

      {/* COUNT TEXT */}
      <Text style={styles.countText}>
        Showing {showAll ? data.length : 6} of {data.length} items
      </Text>

    </View>
  ) : null
}
    />
  );
};

export default TopSellingList;

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 240,
  },

  gridCard: {
    width: '48%',
    marginRight: 0,
  },

  emptyCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  imageContainer: {
    backgroundColor: '#EEF3F2',
    height: 135,
    paddingTop: 28,
    paddingBottom: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },

  image: {
    width: 95,
    height: 95,
    resizeMode: 'contain',
  },

  subContainer: {
    margin: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  priceContainer: {
    marginTop: 6,
  },

  oldPrice: {
    fontWeight: '500',
    fontSize: 10,
    color: '#64748B',
    textDecorationLine: 'line-through',
  },

  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D614E',
    marginTop: 2,
  },

  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#F0BE27',
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },

  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  cartBtn: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartFrame: {
    position: 'absolute',
    width: 36,
    height: 36,
  },

  cartIcon: {
    width: 18,
    height: 18,
  },

  footerContainer: {
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 10,
},

discoverBtn: {
  backgroundColor: '#0D614E',
  paddingVertical: 12,
  paddingHorizontal: 28,
  borderRadius: 12,
},

discoverText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},

countText: {
  marginTop: 8,
  fontSize: 12,
  color: '#94A3B8',
  marginBottom:40
},
});