import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
  DUMMY_LAB_TESTS,
  type LabTestDummy,
} from '../../data/homeDummySections';
import { HORIZONTAL_SCROLL_CONTENT, SCREEN_PADDING_H } from '../../constants/layout';
import { HORIZONTAL_CARD_WIDTH } from '../ProductCard';

/** Slightly tighter than product cards for denser 1mg lab rail */
const CARD_W = Math.min(HORIZONTAL_CARD_WIDTH, Dimensions.get('window').width * 0.38);

type Props = {
  /** Compact rail for Consult home */
  compact?: boolean;
  onPressBanner?: () => void;
  onPressTest?: (item: LabTestDummy) => void;
};

const LabTestCard = ({
  item,
  onPress,
}: {
  item: LabTestDummy;
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
      <View style={styles.thumbWrap}>
        <Image source={{ uri: item.image }} style={styles.thumb} />
        {item.tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.tests} numberOfLines={1}>
        {item.tests}
      </Text>
      <View style={styles.priceRow}>
        <RupeeAmount
          value={item.price}
          style={styles.price}
          iconColor="#111827"
        />
        {off > 0 ? <Text style={styles.off}>{off}% OFF</Text> : null}
      </View>
      <Pressable style={styles.bookBtn} onPress={onPress}>
        <Text style={styles.bookText}>BOOK</Text>
      </Pressable>
    </Pressable>
  );
};

/**
 * Tata 1mg–style Health Lab: highlight strip + horizontal test cards.
 * SectionHeader lives on the parent screen.
 */
const OrangeLabHomeSection = ({
  compact,
  onPressBanner,
  onPressTest,
}: Props) => {
  const renderItem = useCallback(
    ({ item }: { item: LabTestDummy }) => (
      <LabTestCard item={item} onPress={() => onPressTest?.(item)} />
    ),
    [onPressTest],
  );

  return (
    <View style={styles.wrap}>
      {!compact ? (
        <Pressable onPress={onPressBanner} style={styles.bannerPress}>
          <LinearGradient
            colors={['#FFF7ED', '#FFEDD5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View style={styles.bannerIcon}>
              <TablerIcon name="flask" size={20} color="#EA580C" />
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>Book lab tests at home</Text>
              <Text style={styles.bannerSub} numberOfLines={1}>
                Safe collection · Doctor-ready reports
              </Text>
            </View>
            <TablerIcon name="chevron-right" size={18} color="#C2410C" />
          </LinearGradient>
        </Pressable>
      ) : null}

      <FlatList
        horizontal
        data={DUMMY_LAB_TESTS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default React.memo(OrangeLabHomeSection);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  bannerPress: {
    marginBottom: 10,
    paddingHorizontal: SCREEN_PADDING_H,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
  },
  bannerTitle: {
    fontSize: 13,
    color: '#9A3412',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bannerSub: {
    marginTop: 1,
    fontSize: 11,
    color: '#C2410C',
    fontFamily: Fonts.PoppinsRegular,
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
    padding: 10,
  },
  pressed: {
    opacity: 0.94,
  },
  thumbWrap: {
    width: '100%',
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF7ED',
    marginBottom: 8,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  tag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  name: {
    fontSize: 12,
    lineHeight: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    height: 32,
    includeFontPadding: false,
  },
  tests: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  price: {
    fontSize: 13,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  off: {
    fontSize: 10,
    color: '#15803D',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bookBtn: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 7,
  },
  bookText: {
    fontSize: 11,
    color: '#EA580C',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },
});
