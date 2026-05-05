import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import PromoCard from './PromoCard';
import SectionHeader from './SectionHeader';
import WishlistButton from './WishlistButton';

interface Props {
  data: any[];
  isGrid?: boolean;
  fav?: boolean;
  header?: boolean;
  navigation: any
  ListHeaderComponent?: React.ReactNode;
}



const SCREEN_WIDTH = Dimensions.get('window').width;
const SPACING = 12;
const NUM_COLUMNS = 2; // 👈 change to 3 if needed

const ITEM_WIDTH =
  (SCREEN_WIDTH - SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;


const TopSellingList: React.FC<Props> = ({ data, fav = true, isGrid = false, header = false, navigation }) => {
  console.log("navigationnnnnnnnn", navigation)
  const [showAll, setShowAll] = useState(false);

  const displayData = showAll ? data : data.slice(0, 6);

  const formattedData =
    isGrid && displayData.length % 2 !== 0
      ? [...displayData, { id: 'empty', empty: true }]
      : displayData;





  const ListHeaderComponent = () => (
    <>
      <PromoCard
        title="The Wellness Essentials"
        desc="Discover our loved organic selections, cold-pressed to preserve nature’s power."
        tag="CURATED EXCELLENCE"
        image={require('../assets/images/cosmetic.png')}
        showButton={false}
      />
      <SectionHeader title="Top  Selling Products" actionText="View all" />
    </>
  );

  return (
    <FlatList
      key={isGrid ? 'grid' : 'list'}
      data={formattedData}
      keyExtractor={(item, index) => item.id || index.toString()}
      horizontal={!isGrid}
      numColumns={isGrid ? 2 : 1}
      ListHeaderComponent={header ? <ListHeaderComponent /> : undefined}
      showsHorizontalScrollIndicator={false}

      // ✅ 🔥 REMOVE ALL HORIZONTAL PADDING
      contentContainerStyle={{
        paddingBottom: 20,
        paddingTop: 10,
      }}   

      showsVerticalScrollIndicator={false}
      stickyHeaderHiddenOnScroll={false}
      columnWrapperStyle={
        isGrid
          ? {
            justifyContent: 'space-between',
            // marginBottom: 14,
            paddingHorizontal: SPACING,
            marginBottom: SPACING,
          }
          : undefined
      }

      renderItem={({ item }) => {
        if (item.empty) {
          return <View style={[styles.card, styles.gridCard, styles.emptyCard]} />;
        }

        return (
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetails')} style={[styles.card, isGrid && styles.gridCard]}>


            {fav && <WishlistButton />}


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
              <Text style={styles.title} numberOfLines={2}>
                {item.name}
              </Text>

              {item.subtitle && (
                <Text numberOfLines={2}
                  ellipsizeMode="tail" style={styles.subtitle}>{item.subtitle}</Text>
              )}

              <View style={styles.priceContainer}>
                {item.oldPrice && (
                  <Text style={styles.oldPrice}>Rs. {item.oldPrice}</Text>
                )}
                <Text style={styles.price}>Rs. {item.price}</Text>
              </View>

              {/* CART BUTTON */}
              <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('MyCart')}>
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
          </TouchableOpacity>
        );
      }}

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
    width: ITEM_WIDTH / 1.2,
    position: 'relative',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: '#F1F5F9',
    // height: 240,
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
    height: ITEM_WIDTH * 0.8,
    backgroundColor: '#0D614E1A',

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
    minHeight: 70,
  },

  title: {
    fontSize: 16,
    marginBottom: -5,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    // marginTop: 2,

    fontFamily: Fonts.PoppinsMedium,
  },

  priceContainer: {
    marginTop: 6,
  },

  oldPrice: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 10,
    marginBottom: -5,
    color: '#64748B',
    textDecorationLine: 'line-through',
  },

  price: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
    // marginTop: 2,
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
    fontFamily: Fonts.PoppinsMedium,
  },

  cartBtn: {
    position: 'absolute',
    right: 10,
    bottom: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartFrame: {
    position: 'absolute',
    width: 40,
    height: 40,
  },

  cartIcon: {
    width: 20,
    height: 20,
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
    fontSize: 14, fontFamily: Fonts.PoppinsMedium,
  },

  countText: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 40
  },
});