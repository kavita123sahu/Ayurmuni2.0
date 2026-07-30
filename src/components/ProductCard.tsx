import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { CARD_SURFACE } from '../constants/cardStyles';
import TablerIcon from './TablerIcon';
import BlinkitAddButton from './BlinkitAddButton';
import WishlistButton from './WishlistButton';
import {
  getProductStockQty,
  isProductOutOfStock,
} from '../utils/productStockUtils';

const { width: SCREEN_W } = Dimensions.get('window');

/** Default 2-col grid width for full-width screens (16px pad + 10 gap) */
export const GRID_CARD_WIDTH = (SCREEN_W - 42) / 2;
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
  /** Required for proper grid fit — parent should pass measured column width */
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
  const cardWidth = isGrid
    ? gridWidth ?? GRID_CARD_WIDTH
    : HORIZONTAL_CARD_WIDTH;
  const scale = isGrid && gridWidth ? gridWidth / GRID_CARD_WIDTH : 1;
  const cardHeight = isGrid
    ? GRID_CARD_HEIGHT * Math.min(Math.max(scale, 0.85), 1.15)
    : HORIZONTAL_CARD_HEIGHT;
  const imageHeight = isGrid
    ? IMAGE_HEIGHT_GRID * Math.min(Math.max(scale, 0.85), 1.15)
    : IMAGE_HEIGHT_HORIZONTAL;

  const discount =
    item?.mrp > item?.selling_price
      ? Math.round(((item.mrp - item.selling_price) / item.mrp) * 100)
      : 0;

  const stockQty = getProductStockQty(item);
  const isOutOfStock = isProductOutOfStock(item);
  const maxQuantity =
    stockQty == null || !Number.isFinite(stockQty) ? null : stockQty;

  const handleAdd = () => {
    if (isOutOfStock || actionsLocked) return;
    onAdd();
  };

  const handleIncrement = () => {
    if (isOutOfStock || actionsLocked) return;
    if (maxQuantity != null && cartQty >= maxQuantity) return;
    onIncrement();
  };

  const handleDecrement = () => {
    if (isOutOfStock || actionsLocked) return;
    onDecrement();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isGrid ? styles.cardGrid : styles.cardHorizontal,
        {
          width: cardWidth,
          height: cardHeight,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.imageZone, { height: imageHeight }]}>
        {item?.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={[styles.productImage, isOutOfStock && styles.imageDimmed]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <TablerIcon name="package" size={36} color="#CBD5E1" />
          </View>
        )}

        {isOutOfStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        ) : null}

        {showWishlist && onWishlist && !actionsLocked && (
          <WishlistButton
            isWishlisted={item?.is_wishlist_item}
            onPress={onWishlist}
          />
        )}

        <View style={styles.addOverlay} pointerEvents="box-none">
          <BlinkitAddButton
            quantity={isOutOfStock ? 0 : cartQty}
            isAdding={isAdding}
            locked={actionsLocked}
            outOfStock={isOutOfStock}
            maxQuantity={maxQuantity}
            compact
            onAdd={handleAdd}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </View>
      </View>

      <View style={styles.infoZone}>
        <Text numberOfLines={2} style={styles.title}>
          {item.product_name || item.name || 'Product'}
        </Text>

        <Text numberOfLines={1} style={styles.subtitle}>
          {item.brand_name || item.variant_title || ' '}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>
              ₹{Math.floor(Number(item?.selling_price || item?.price || 0))}
            </Text>
            {Number(item?.mrp) > Number(item?.selling_price || 0) && (
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
    overflow: 'hidden',
  },
  /** Spacing handled by parent FlatList / cardWrap */
  cardGrid: {
    marginRight: 0,
    marginBottom: 0,
  },
  cardHorizontal: {
    marginRight: 10,
    marginBottom: 0,
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
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageDimmed: {
    opacity: 0.55,
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
  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomRightRadius: 10,
    zIndex: 5,
  },
  outOfStockText: {
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
    flexShrink: 1,
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
