import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Fonts } from '../common/Fonts';

type Props = {
  image?: ImageSourcePropType | string;
  title: string;
  subtitle: string; // e.g. "500g · Qty: 2"
  price: string;
  qty?: number;
};

const PLACEHOLDER = 'https://cdn-icons-png.flaticon.com/512/1178/1178479.png';

const resolveImage = (image?: ImageSourcePropType | string): ImageSourcePropType => {
  if (!image) return { uri: PLACEHOLDER };
  if (typeof image === 'string') return { uri: image };
  return image;
};

const OrderItem: React.FC<Props> = ({ image, title, subtitle, price, qty }) => {
  const [failed, setFailed] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.imageWrap}>
        <Image
          source={failed ? { uri: PLACEHOLDER } : resolveImage(image)}
          style={styles.image}
          onError={() => setFailed(true)}
        />
        {!!qty && qty > 1 && (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{qty}</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.price}>{price}</Text>
    </View>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
  },
  imageWrap: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#006B591A',
  },
  qtyBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#0D614E',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  qtyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 14,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    flexShrink: 1,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
    fontFamily: Fonts.PoppinsRegular,
  },
  price: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
    marginLeft: 8,
    marginTop: 2, // top-aligned with title's first line
  },
});