import React, { useCallback, useEffect, useState } from 'react';
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
import { TogglewishlistProduct } from '../services/ProductServices';
interface Props {
  data: any[];
  isGrid?: boolean;
  fav?: boolean;
  setProductData: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  header?: boolean;
  navigation: any
  ListHeaderComponent?: React.ReactNode;
}



const SCREEN_WIDTH = Dimensions.get('window').width;
const SPACING = 12;
const NUM_COLUMNS = 2; // 👈 change to 3 if needed


const { width } = Dimensions.get('window');

const DEFAULT_WIDTH = width * 0.9;
const DEFAULT_HEIGHT = 240;


const itemWidth = width - 80;
const itemHeight = 100;


const TopSellingList: React.FC<Props> = ({ data, fav = true, setProductData, isGrid = false, header = false, navigation }) => {
 
  const [addingItems, setAddingItems] =
    useState<string[]>([]);


  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, 6);

  const formattedData =
    isGrid && displayData.length % 2 !== 0
      ? [...displayData, { id: 'empty', empty: true }]
      : displayData;


  const handleAddToCart = async (
    item: any,

  ) => {
  
    const variantId =
      item?.variant_id;


    const Quantity = item?.quantity;
    console.log("varintt", variantId, Quantity)
    if (!variantId) {
      return;
    }

    const currentProduct =
      data.find(
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
        showSuccessToast(response?.message || "Product Added Card", 'success');
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


  const handleWishlist = async (
    item: any,
  ) => {
    const oldValue =
      item?.is_wishlist_item;

    // Instant UI Update
    setProductData(prev =>
      prev.map(product =>
        product.variant_id ===
          item.variant_id
          ? {
            ...product,
            is_wishlist_item:
              !oldValue,
          }
          : product,
      ),
    );

    try {
      const res = await TogglewishlistProduct(
        item.variant_id,
        'POST',
      );

      console.log("wishlistresponse", res)
    }
    catch (error) {
      // Rollback
      setProductData(prev =>
        prev.map(product =>
          product.variant_id ===
            item.variant_id
            ? {
              ...product,
              is_wishlist_item:
                oldValue,
            }
            : product,
        ),
      );
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.empty) {
        return (
          <View
            style={[
              styles.card,
              styles.emptyCard,
            ]}
          />
        );
      }
      const isAdding = addingItems.includes(
        item?.variant_id,
      );

      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              'ProductDetails',
              {
                varientID:
                  item?.variant_id,
              },
            )
          }
          style={[
            styles.card,
            isGrid
              ? styles.gridCard
              : styles.horizontalCard,
          ]}
        >
          {item?.mrp >
            item?.selling_price && (
              <View
                style={styles.discountBadge}
              >
                <Text
                  style={
                    styles.discountText
                  }
                >
                  {Math.round(
                    ((item.mrp -
                      item.selling_price) /
                      item.mrp) *
                    100,
                  )}
                  % OFF
                </Text>
              </View>
            )}

          <WishlistButton
            isWishlisted={
              item?.is_wishlist_item
            }
            onPress={() =>
              handleWishlist(item)
            }
          />

          <View
            style={styles.imageContainer}
          >
            <Image
              source={
                item?.image_url
                  ? {
                    uri: item.image_url,
                  }
                  : Images.medicine
              }
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="contain"
            />
          </View>

          <View
            style={styles.contentContainer}
          >
            <Text
              numberOfLines={2}
              style={styles.title}
            >
              {item.product_name}
            </Text>

            <Text
              numberOfLines={1}
              style={styles.subtitle}
            >
              {item.brand_name}
            </Text>

            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <Text
                style={styles.oldPrice}
              >
                ₹{item.mrp}
              </Text>

              <View
                style={styles.ratingRow}
              >
                <Image
                  source={Images.star}
                  style={
                    styles.starIcon
                  }
                />

                <Text
                  style={
                    styles.ratingText
                  }
                >
                  {item?.avg_rating ||
                    '0'}
                </Text>

                <Text
                  style={
                    styles.reviewText
                  }
                >
                  (
                  {item?.total_reviews ||
                    '0'}
                  )
                </Text>
              </View>
            </View>

            <View
              style={styles.bottomRow}
            >
              <Text
                style={styles.price}
              >
                ₹
                {item.selling_price}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  handleAddToCart(item)
                }
                style={
                  styles.cartButton
                }
              >
                {isAdding ? (
                  <ActivityIndicator
                    color="#fff"
                    size="small"
                  />
                ) : (
                  <Image
                    source={
                      Images.shopCart
                    }
                    style={{
                      width: 18,
                      height: 18,
                      tintColor:
                        '#fff',
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      navigation,
      isGrid,
      addingItems,
      handleWishlist,
      handleAddToCart,
    ],
  );


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
    <FlatList key={isGrid ? 'grid' : 'list'}
      data={formattedData}
      keyExtractor={(item, index) => item.id || index.toString()}
      horizontal={!isGrid} numColumns={isGrid ? 2 : 1}
      ListHeaderComponent={header ? <ListHeaderComponent /> : undefined}
      showsHorizontalScrollIndicator={false}
      stickyHeaderHiddenOnScroll={false}
      // contentContainerStyle={{
      //   paddingBottom: 20,
      //   paddingRight: !isGrid ? 14
      //    : 0,
      // }}
      contentContainerStyle={{
        // paddingHorizontal: 5,
        paddingBottom: 20,
      }}
      columnWrapperStyle={isGrid ? {
        justifyContent: 'space-between',
        marginBottom: 14, paddingHorizontal: SPACING,
      } : undefined}

      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}

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

export default React.memo(TopSellingList);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F7',

    // elevation: 3,
  },

  gridCard: {
    width: '48%',
  },

  horizontalCard: {
    width: 190,
    marginLeft: 10,
    marginBottom: 5,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: '#F5F8F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  image: {
    width: '95%',
    height: '95%',
  },
  contentContainer: {
    // padding: 12,
    padding: 12,
    minHeight: 120,
    justifyContent: 'space-between',
  },

  title: {
    // fontSize: 15,
    // color: '#1E293B',
    // fontFamily: Fonts.PoppinsSemiBold,

    fontSize: 14,
    lineHeight: 20,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
    // minHeight: 40,
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    // marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
  },

  oldPrice: {
    marginTop: 6,
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 6,
  },

  price: {
    fontSize: 18,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 10,

    // marginTop: ,
  },

  starIcon: {
    width: 14,
    height: 14,
    marginBottom: 2,
    tintColor: '#FBBF24',
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  reviewText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,

    justifyContent: 'center',
    alignItems: 'center',
  },

  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,

    backgroundColor: '#FBBF24',

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderBottomRightRadius: 14,
    zIndex: 100,
  },

  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  footerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },

  discoverBtn: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },

  discoverText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  countText: {
    marginTop: 10,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});