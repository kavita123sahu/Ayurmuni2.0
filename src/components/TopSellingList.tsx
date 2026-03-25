import React from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const TopSellingList = ({ data }: any) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingLeft: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>

          {/* BADGE */}
          {item.tag && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.tag === '15% OFF' ? '#F0BE27' : '#F0BE27',
                },
              ]}
            >
              <Text style={styles.badgeText}>{item.tag}</Text>
            </View>
          )}

          {/* IMAGE */}
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} />
          </View>

          {/* TITLE */}
          <View style={styles.SubContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>

          {/* SUBTITLE */}
          {item.subtitle && (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          )}

          {/* PRICE SECTION (FIXED) */}
          <View style={styles.priceContainer}>
            {item.oldPrice && (
              <Text style={styles.oldPrice}>Rs. {item.oldPrice}</Text>
            )}
            <Text style={styles.price}>Rs. {item.price}</Text>
          </View>

          {/* CART */}
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
      )}
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
    borderEndWidth:1,
    borderColor:'#F1F5F9',
    height:240
  },

  imageContainer: {
    backgroundColor: '#EEF3F2', 
    height: 135,
    paddingTop: 28, 
    paddingBottom: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderTopRightRadius:16,
    borderTopLeftRadius:16,

  },

  image: {
    width: 95,
    height: 95,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 2,
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 2,
    fontWeight: '400',
  },

  priceContainer: {
    marginTop: 6,
    marginLeft: 2,
  },

  oldPrice: {
    fontWeight: '500',
    fontSize: 10,
    color: '#64748B',
    textDecorationLine: 'line-through',
  },

  price: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0D614E',
    marginTop: 2,
  },

  badge: {
    position: 'absolute',
    borderTopLeftRadius:16,
    borderBottomRightRadius:16,
    backgroundColor: '#F0BE27',
    paddingHorizontal: 12,
    paddingVertical: 5,
    zIndex: 20,
  },

  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '400',
    
  },

  cartBtn: {
    position: 'absolute',
    right: 12,
    bottom: 6, 
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartFrame: {
    position: 'absolute',
    width: 36,
    height: 36,
  },

  cartIcon: {
    width: 20,
    height: 20,
  },

  SubContainer:{
    margin:4
  }
});