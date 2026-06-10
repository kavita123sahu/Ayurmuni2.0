import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import PromoCard from './PromoCard';
import SectionHeader from './SectionHeader';
import WishlistButton from './WishlistButton';
import { Images } from '../common/Images';
import *as _CART_SERVICES from '../services/CartService';
import { showSuccessToast } from '../config/Key';
import { Colors } from '../common/Colors';
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
  console.log("datadatadata---->>", data)

  const [addingItems, setAddingItems] =
    useState<string[]>([]);

  const [productData, setProductData] =
    useState(data);

  useEffect(() => {
    setProductData(data);
  }, [data]);

  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? productData : productData.slice(0, 6);

  const formattedData =
    isGrid && displayData.length % 2 !== 0
      ? [...displayData, { id: 'empty', empty: true }]
      : displayData;


  const handleAddToCart = async (
    item: any,

  ) => {
    console.log("itemm", item);
    const variantId =
      item?.variant_id;


    const Quantity = item?.quantity;
    console.log("varintt", variantId, Quantity)
    if (!variantId) {
      return;
    }



    // already added hai
    // if (
    //   addingItems.includes(
    //     variantId,
    //   )
    // ) {
    //   return;
    // }

    const currentProduct =
      productData.find(
        p => p.variant_id === variantId,
      );
    setAddingItems(prev => [
      ...prev,
      variantId,
    ]);

    try {

      const response =
        await _CART_SERVICES.AddupdateCart({
          variant_id: variantId,
          quantity: (currentProduct?.quantity || 0) + 1,
        });

      console.log("cartresponse", response);
      if (response?.success) {

        setProductData(prev =>
          prev.map(product =>
            product.variant_id === variantId
              ? {
                ...product,
                quantity: (product.quantity || 0) + 1,
              }
              : product,
          ),
        );

      }

    } catch (error) {

      console.log(
        'ADD CART ERROR',
        error,
      );

    } finally {

      setAddingItems(prev =>
        prev.filter(
          id =>
            id !== variantId,
        ),
      );
    }
  };


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
        const isAdding =
          addingItems.includes(item?.variant_id);

        const isAdded =
          addingItems.includes(
            item?.variant_id,
          );

        if (item.empty) {
          return <View style={[styles.card, styles.gridCard, styles.emptyCard]} />;
        }

        return (
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', {
            varientID: item?.variant_id
          })} style={[styles.card, isGrid && styles.gridCard]}>

            {fav && <WishlistButton />}

            {/* BADGE */}
            {item.tag && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.tag}</Text>
              </View>
            )}

            {/* IMAGE */}
            <View style={styles.imageContainer}>
              <Image source={item?.image_url ? { uri: item?.image_url } : Images.medicine} style={styles.image} />
            </View>

            {/* CONTENT */}
            <View style={styles.subContainer}>
              <Text
                style={styles.title}
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.product_name}
              </Text>

              {item.brand_name && (
                <Text numberOfLines={2}
                  ellipsizeMode="tail" style={styles.subtitle}>{item?.brand_name}</Text>
              )}

              <View style={styles.priceContainer}>
                {/* {item?.variant && ( */}
                <Text style={styles.oldPrice}>Rs. {item.mrp}</Text>
                {/* )} */}
                <Text style={styles.price}>Rs. {item.selling_price}</Text>
              </View>

              {/* CART BUTTON */}
              <TouchableOpacity
                disabled={isAdded}
                onPress={() =>
                  handleAddToCart(item)
                }
                style={styles.cartBtn}
              >
                {isAdding ? (
                  <View style={{
                    backgroundColor: Colors.primaryColor,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 35, width: 35
                  }}>


                    <Image
                      source={Images.tick}
                      style={{
                        width: 16,
                        height: 16, tintColor: Colors.white

                      }}
                    />
                  </View>
                ) : (
                  <>
                    <Image
                      source={require('../assets/images/CartFrame.png')}
                      style={styles.cartFrame}
                    />

                    <Image
                      source={require('../assets/images/Cart.png')}
                      style={styles.cartIcon}
                    />
                  </>
                )}
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
    width: ITEM_WIDTH / 1.1,
    position: 'relative',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: '#F1F5F9',
    height: 340,
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
    margin: 8,
    minHeight: 130,
    paddingBottom: 50, // cart button ke liye space
  },

  title: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 22,
    height: 44, // 2 lines fix
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 18,
    height: 36, // 2 lines
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
    bottom: 60,
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