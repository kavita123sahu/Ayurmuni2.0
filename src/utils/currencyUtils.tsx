import React from 'react';
import { Text, TextStyle, StyleProp, View, ViewStyle } from 'react-native';
import { Fonts } from '../common/Fonts';

/** Format any amount as Indian Rupees (always with ₹). */
export const formatRupee = (
  value?: string | number | null,
  opts?: { fallback?: string },
): string => {
  if (value == null || value === '') {
    return opts?.fallback ?? '—';
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    const raw = String(value).trim();
    if (!raw) return opts?.fallback ?? '—';
    return raw.startsWith('₹') ? raw : `₹${raw}`;
  }
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

type RupeeAmountProps = {
  value?: string | number | null;
  style?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
  /** Show ₹ badge icon beside amount (not a cash/wallet icon). */
  showIcon?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  fallback?: string;
};

/** Amount row with ₹ icon badge + formatted amount text. */
export const RupeeAmount = ({
  value,
  style,
  iconSize = 14,
  iconColor = '#0D614E',
  showIcon = true,
  containerStyle,
  fallback = '—',
}: RupeeAmountProps) => {
  const label = formatRupee(value, { fallback });
  if (label === fallback && (value == null || value === '')) {
    return <Text style={style}>{fallback}</Text>;
  }

  // Avoid double ₹ when badge is shown
  const amountOnly = label.startsWith('₹') ? label.slice(1) : label;

  if (!showIcon) {
    return <Text style={style}>{label}</Text>;
  }

  const badgeSize = Math.max(iconSize + 6, 18);

  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 5 },
        containerStyle,
      ]}
    >
      <View
        style={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: `${iconColor}14`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: iconSize,
            lineHeight: iconSize + 2,
            color: iconColor,
            fontFamily: Fonts.PoppinsSemiBold,
            includeFontPadding: false,
          }}
        >
          ₹
        </Text>
      </View>
      <Text style={style}>{amountOnly}</Text>
    </View>
  );
};
