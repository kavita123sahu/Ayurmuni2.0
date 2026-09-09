import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import {
  couponAppliesLabel,
  couponExpiryLabel,
  couponMaxNote,
  couponOfferTitle,
  couponSavingsLabel,
  couponSourceLabel,
  type Coupon,
} from '../utils/couponUtils';
import type { Reward } from '../utils/rewardUtils';

const COL_GAP = 8;
const H_PAD = 12;
const CARD_W = (Dimensions.get('window').width - H_PAD * 2 - COL_GAP) / 2;

type Props = {
  reward?: Reward | null;
  coupon?: Coupon | null;
  onPress?: (coupon: Coupon, reward?: Reward | null) => void;
  onTermsPress?: (coupon: Coupon, reward?: Reward | null) => void;
};

const THEMES = [
  { bg: '#FFFFFF', circle: '#EEF4F2', accent: Colors.primaryColor },
  { bg: '#FFF8EE', circle: '#FFE8C7', accent: '#C27803' },
  { bg: '#FDF2F8', circle: '#FCE7F3', accent: '#BE185D' },
  { bg: '#F0F9FF', circle: '#E0F2FE', accent: '#0369A1' },
];

/** Same coupon code → same theme color (stable across Rewards / checkout) */
export const couponThemeIndex = (codeOrId: string | null | undefined) => {
  const key = String(codeOrId || '').trim().toUpperCase();
  if (!key) return 0;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % THEMES.length;
};

const triggerLabel = (trigger: string) => {
  const key = String(trigger || '').toLowerCase();
  if (key === 'referral') return 'Referral';
  if (key === 'register' || key === 'signup') return 'Welcome';
  if (key === 'order') return 'Order';
  if (key === 'loyalty') return 'Loyalty';
  return couponSourceLabel(key || 'reward');
};

const RewardGridCard = ({
  reward,
  coupon: couponProp,
  onPress,
  onTermsPress,
}: Props) => {
  const coupon = reward?.coupon || couponProp || null;
  if (!coupon) return null;

  const theme =
    THEMES[couponThemeIndex(coupon.code || coupon.id) % THEMES.length];
  const title = reward?.title || couponOfferTitle(coupon);
  const sourceText = reward?.trigger
    ? triggerLabel(reward.trigger)
    : couponSourceLabel(String(coupon.source));

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress?.(coupon, reward)}
      style={[styles.card, { backgroundColor: theme.bg }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.imageWrap, { backgroundColor: theme.circle }]}>
          {reward?.image_url || coupon.image_url ? (
            <Image
              source={{ uri: (reward?.image_url || coupon.image_url) as string }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <TablerIcon name="trophy" size={18} color={theme.accent} />
          )}
        </View>
        <View style={[styles.sourcePill, { backgroundColor: `${theme.accent}18` }]}>
          <Text style={[styles.sourceText, { color: theme.accent }]} numberOfLines={1}>
            {sourceText}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <Text style={styles.savings} numberOfLines={1}>
        {couponSavingsLabel(coupon)}
      </Text>

      <Text style={styles.code} numberOfLines={1}>
        {coupon.code}
      </Text>

      <Text style={styles.meta} numberOfLines={1}>
        {[
          couponMaxNote(coupon),
          couponExpiryLabel(coupon),
          couponAppliesLabel(coupon),
          coupon.remaining_uses != null ? `${coupon.remaining_uses} left` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>

      <TouchableOpacity
        onPress={() => onTermsPress?.(coupon, reward)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.tc, { color: theme.accent }]}>T&C</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const RewardHighlightCard = ({
  count,
  onPress,
}: {
  count: number;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={styles.highlight}
  >
    <View style={styles.highlightArt}>
      <TablerIcon name="trophy" size={28} color="#FFFFFF" />
    </View>
    <View style={styles.highlightBanner}>
      <Text style={styles.highlightText}>
        {count} New Reward{count === 1 ? '' : 's'}
      </Text>
    </View>
  </TouchableOpacity>
);

export default RewardGridCard;

export const REWARD_GRID = {
  cardWidth: CARD_W,
  gap: COL_GAP,
  pad: H_PAD,
};

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEEB',
    minHeight: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  imageWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sourcePill: {
    flexShrink: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    minHeight: 32,
  },
  savings: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  code: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.4,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  meta: {
    marginTop: 4,
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  tc: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  highlight: {
    width: CARD_W,
    minHeight: 148,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8A317',
    justifyContent: 'flex-end',
  },
  highlightArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  highlightBanner: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
