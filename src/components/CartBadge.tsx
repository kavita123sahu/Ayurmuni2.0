import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';

type Props = {
  count: number;
  size?: 'sm' | 'md';
};

const CartBadge: React.FC<Props> = ({ count, size = 'md' }) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : String(count);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, isSmall && styles.textSm]}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F04438',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeSm: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    top: -2,
    right: -2,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 12,
  },
  textSm: {
    fontSize: 9,
    lineHeight: 11,
  },
});

export default CartBadge;
