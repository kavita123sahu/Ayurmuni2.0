import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { CARD_SURFACE } from '../constants/cardStyles';
import TablerIcon from './TablerIcon';
import BlinkitAddButton from './BlinkitAddButton';
import WishlistButton from './WishlistButton';

const { width: SCREEN_W } = Dimensions.get('window');

export const GRID_CARD_WIDTH = (SCREEN_W - 52) / 2;
export const HORIZONTAL_CARD_WIDTH = 158;
const IMAGE_HEIGHT_GRID = 136;
const IMAGE_HEIGHT_HORIZONTAL = 124;
const INFO_HEIGHT = 94;
export const GRID_CARD_HEIGHT = IMAGE_HEIGHT_GRID + INFO_HEIGHT;
export const HORIZONTAL_CARD_HEIGHT = IMAGE_HEIGHT_HORIZONTAL + INFO_HEIGHT;

type Props = {
  item: any;
  variant: 'grid' | 'horizontal';
  cartQty: number;
  isAdding: boolean;
  showWishlist?: boolean;
  actionsLocked?: boolean;
  gridWidth?: number;
  onPress: () => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onWishlist?: () => void;
};

const ProductCard: React.FC<Props> = ({
  item,
  variant,
  cartQty,
  isAdding,
  showWishlist = true,
  actionsLocked = false,
  gridWidth,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  onWishlist,
}) => {
  const isGrid = variant === 'grid';
  const cardWidth = isGrid ? (gridWidth ?? GRID_CARD_WIDTH) : HORIZONTAL_CARD_WIDTH;
  const scale = isGrid && gridWidth ? gridWidth / GRID_CARD_WIDTH : 1;
  const cardHeight = isGrid ? GRID_CARD_HEIGHT * scale : HORIZONTAL_CARD_HEIGHT;
  const imageHeight = isGrid ? IMAGE_HEIGHT_GRID * scale : IMAGE_HEIGHT_HORIZONTAL;

  const discount =
    item?.mrp > item?.selling_price
      ? Math.round(((item.mrp - item.selling_price) / item.mrp) * 100)
      : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          marginRight: gridWidth ? 0 : 12,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.imageZone, { height: imageHeight }]}>
        {item?.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <TablerIcon name="package" size={36} color="#CBD5E1" />
          </View>
        )}

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        {showWishlist && onWishlist && !actionsLocked && (
          <WishlistButton
            isWishlisted={item?.is_wishlist_item}
            onPress={onWishlist}
          />
        )}

        <View style={styles.addOverlay} pointerEvents="box-none">
          <BlinkitAddButton
            quantity={cartQty}
            isAdding={isAdding}
            locked={actionsLocked}
            compact
            onAdd={onAdd}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </View>
      </View>

      <View style={styles.infoZone}>
        <Text numberOfLines={2} style={styles.title}>
          {item.product_name || 'Product'}
        </Text>

        <Text numberOfLines={1} style={styles.subtitle}>
          {item.brand_name || item.variant_title || ' '}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>
              ₹{Math.floor(Number(item?.selling_price || 0))}
            </Text>
            {item?.mrp > item?.selling_price && (
              <Text style={styles.oldPrice}>₹{item.mrp}</Text>
            )}
          </View>

          <View style={styles.ratingRow}>
            <TablerIcon name="star" size={11} color="#FBBF24" strokeWidth={2} />
            <Text style={styles.ratingText}>{item?.avg_rating || '0'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    ...CARD_SURFACE,
    borderRadius: 14,
    marginBottom: 12,
    marginRight: 12,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  imageZone: {
    width: '100%',
    backgroundColor: '#F8FAFB',
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2563EB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomRightRadius: 10,
    zIndex: 5,
  },
  discountText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  addOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 20,
  },
  infoZone: {
    height: INFO_HEIGHT,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    // height: 32,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    fontSize: 10,
    height: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  oldPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontFamily: Fonts.PoppinsRegular,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
});
