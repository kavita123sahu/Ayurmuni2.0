import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Fonts } from '../common/Fonts';

type Props = {
  count: number;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  /** When false, shows exact API count instead of capping at 99+ */
  capAt99?: boolean;
};

/** Simple count badge — top-right corner, same idea as avatar notification dots */
const CartBadge: React.FC<Props> = ({ count, size = 'md', style, capAt99 = true }) => {
  if (count <= 0) return null;

  const displayCount = capAt99 && count > 99 ? '99+' : String(count);
  const isSmall = size === 'sm';
  const isWide = displayCount.length >= 2;

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSm,
        isWide && (isSmall ? styles.badgeWideSm : styles.badgeWide),
        style,
      ]}
    >
      <Text
        style={[styles.text, isSmall && styles.textSm, isWide && styles.textWide]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#F04438',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  badgeSm: {
    minWidth: 16,
    height: 16,
    borderRadius: 9,
    top: -5,
    right: -5,
    paddingHorizontal: 4,
  },
  badgeWide: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 4,
  },
  badgeWideSm: {
    minWidth: 20,
    height: 16,
    paddingHorizontal: 3,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
  textSm: {
    fontSize: 9,
    lineHeight: 11,
  },
  textWide: {
    fontSize: 9,
    lineHeight: 11,
  },
});

export default CartBadge;
