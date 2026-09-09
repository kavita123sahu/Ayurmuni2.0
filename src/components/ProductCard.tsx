import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { CARD_SURFACE } from '../constants/cardStyles';
import { TYPO, RADIUS } from '../constants/responsive';
import TablerIcon from './TablerIcon';
import BlinkitAddButton from './BlinkitAddButton';
import WishlistButton from './WishlistButton';
import {
  getProductStockQty,
  isProductOutOfStock,
} from '../utils/productStockUtils';
import { canAddProductWithoutPrescription } from '../utils/prescriptionUtils';
import { RupeeAmount } from '../utils/currencyUtils';

const GRID_GAP = 10;
const IMAGE_HEIGHT_GRID = 136;
const IMAGE_HEIGHT_HORIZONTAL = 124;
const TITLE_H = 18;
const SUBTITLE_H = 14;
const PRICE_H = 20;
const INFO_PAD_TOP = 8;
const INFO_PAD_BOTTOM = 10;
const INFO_HEIGHT =
  INFO_PAD_TOP + TITLE_H + 4 + SUBTITLE_H + 4 + PRICE_H + INFO_PAD_BOTTOM;
export const GRID_CARD_HEIGHT = IMAGE_HEIGHT_GRID + INFO_HEIGHT;
export const HORIZONTAL_CARD_HEIGHT = IMAGE_HEIGHT_HORIZONTAL + INFO_HEIGHT;
export const HORIZONTAL_CARD_WIDTH = 158;

/** Default 2-col grid width for full-width screens */
export const getGridCardWidth = (screenWidth: number) => {
  const pad = screenWidth < 360 ? 16 : 20;
  return (screenWidth - pad * 2 - GRID_GAP) / 2;
};

/** @deprecated prefer getGridCardWidth(useWindowDimensions().width) */
export const GRID_CARD_WIDTH = getGridCardWidth(
  Dimensions.get('window').width,
);

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
  const { width: screenW } = useWindowDimensions();
  const isGrid = variant === 'grid';
  const cardWidth = isGrid
    ? gridWidth ?? getGridCardWidth(screenW)
    : HORIZONTAL_CARD_WIDTH;
  const cardHeight = isGrid ? GRID_CARD_HEIGHT : HORIZONTAL_CARD_HEIGHT;
  const imageHeight = isGrid ? IMAGE_HEIGHT_GRID : IMAGE_HEIGHT_HORIZONTAL;

  const discount =
    item?.mrp > item?.selling_price
      ? Math.round(((item.mrp - item.selling_price) / item.mrp) * 100)
      : 0;

  const stockQty = getProductStockQty(item);
  const isOutOfStock = isProductOutOfStock(item);
  const maxQuantity =
    stockQty == null || !Number.isFinite(stockQty) ? null : stockQty;
  const productImageUri = item?.image_url || '';

  const handleAdd = () => {
    if (isOutOfStock || actionsLocked) return;
    if (!canAddProductWithoutPrescription(item)) return;
    onAdd();
  };

  const handleIncrement = () => {
    if (isOutOfStock || actionsLocked) return;
    if (!canAddProductWithoutPrescription(item)) return;
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
        {productImageUri ? (
          <Image
            source={{ uri: productImageUri }}
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
            <Text style={styles.outOfStockText} allowFontScaling={false}>
              Out of Stock
            </Text>
          </View>
        ) : discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText} allowFontScaling={false}>
              {discount}% OFF
            </Text>
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
        <Text numberOfLines={1} style={styles.title} allowFontScaling={false}>
          {item.product_name || item.name || 'Product'}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.subtitle}
          allowFontScaling={false}
        >
          {item.brand_name || item.variant_title || ' '}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceBlock}>
            <RupeeAmount
              value={item?.selling_price || item?.price || 0}
              style={styles.price}
            />
            {Number(item?.mrp) > Number(item?.selling_price || 0) && (
              <>
                <Text style={styles.mrpPrefix} allowFontScaling={false}>
                  MRP
                </Text>
                <RupeeAmount value={item.mrp} style={styles.oldPrice} />
              </>
            )}
          </View>

          <View style={styles.ratingRow}>
            <TablerIcon name="star" size={11} color="#FBBF24" strokeWidth={2} />
            <Text
              style={styles.ratingText}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {item?.avg_rating || '0'}
            </Text>
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
    borderRadius: RADIUS.md,
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
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
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
    fontSize: TYPO.xs,
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
    fontSize: TYPO.xs,
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
    paddingTop: INFO_PAD_TOP,
    paddingBottom: INFO_PAD_BOTTOM,
    justifyContent: 'flex-start',
  },
  title: {
    height: TITLE_H,
    fontSize: TYPO.sm,
    lineHeight: TITLE_H,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  subtitle: {
    height: SUBTITLE_H,
    marginTop: 4,
    fontSize: TYPO.xs,
    lineHeight: SUBTITLE_H,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    includeFontPadding: false,
  },
  bottomRow: {
    height: PRICE_H,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  priceBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  mrpPrefix: {
    fontSize: TYPO.xs,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  price: {
    flexShrink: 1,
    fontSize: TYPO.md,
    lineHeight: PRICE_H,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  oldPrice: {
    flexShrink: 1,
    fontSize: TYPO.xs,
    lineHeight: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontFamily: Fonts.PoppinsRegular,
    includeFontPadding: false,
  },
  ratingRow: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: TYPO.xs,
    lineHeight: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
});
