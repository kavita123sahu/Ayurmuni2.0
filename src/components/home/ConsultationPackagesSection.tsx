import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
  DUMMY_CONSULT_PACKAGES,
  type ConsultPackageDummy,
} from '../../data/homeDummySections';
import { HORIZONTAL_SCROLL_CONTENT, SCREEN_PADDING_H } from '../../constants/layout';
import { HORIZONTAL_CARD_WIDTH } from '../ProductCard';

/** Tata 1mg–style package cards — same width as product rail. */
const CARD_W = HORIZONTAL_CARD_WIDTH;

type Props = {
  onPressPackage?: (item: ConsultPackageDummy) => void;
};

const PackageCard = ({
  item,
  onPress,
}: {
  item: ConsultPackageDummy;
  onPress?: () => void;
}) => {
  const off =
    item.mrp && item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {item.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.group} numberOfLines={1}>
          {item.group}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.includeHint} numberOfLines={1}>
          {item.includes[0]}
          {item.includes.length > 1 ? ` +${item.includes.length - 1}` : ''}
        </Text>

        <View style={styles.priceRow}>
          <RupeeAmount
            value={item.price}
            style={styles.price}
            iconColor="#111827"
          />
          {off > 0 ? (
            <Text style={styles.off}>{off}% OFF</Text>
          ) : null}
        </View>
        {item.mrp && item.mrp > item.price ? (
          <RupeeAmount
            value={item.mrp}
            style={styles.mrp}
            iconColor="#94A3B8"
          />
        ) : (
          <View style={styles.mrpSpacer} />
        )}

        <Pressable style={styles.bookBtn} onPress={onPress}>
          <Text style={styles.bookText}>BOOK</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

/** Horizontal 1mg-style packages — SectionHeader on HomeScreen. */
const ConsultationPackagesSection = ({ onPressPackage }: Props) => {
  const renderItem = useCallback(
    ({ item }: { item: ConsultPackageDummy }) => (
      <PackageCard item={item} onPress={() => onPressPackage?.(item)} />
    ),
    [onPressPackage],
  );

  return (
    <View style={styles.highlight}>
      <FlatList
        horizontal
        data={DUMMY_CONSULT_PACKAGES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default React.memo(ConsultationPackagesSection);

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 2,
  },
  list: {
    ...HORIZONTAL_SCROLL_CONTENT,
    paddingRight: SCREEN_PADDING_H,
    gap: 10,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: '100%',
    height: 100,
    backgroundColor: '#ECFDF5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.2,
  },
  body: {
    padding: 10,
  },
  group: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    lineHeight: 17,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    minHeight: 34,
  },
  includeHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  off: {
    fontSize: 11,
    color: '#15803D',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  mrp: {
    marginTop: 2,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textDecorationLine: 'line-through',
  },
  mrpSpacer: {
    height: 15,
  },
  bookBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bookText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.4,
  },
});
