import React from 'react';
import {
  Text,
  TextStyle,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import TablerIcon from '../components/TablerIcon';

export const RUPEE_SYMBOL = '₹';

export type RupeeFormatOptions = {
  fallback?: string;
  /** Decimal places. Default: round to integer (Flipkart-style product prices). */
  decimals?: number | false;
};

/** Format numeric amount only (no symbol). */
export const formatAmountOnly = (
  value?: string | number | null,
  opts?: RupeeFormatOptions,
): string | null => {
  if (value == null || value === '') {
    return null;
  }

  const n = Number(value);
  if (!Number.isFinite(n)) {
    const raw = String(value)
      .trim()
      .replace(/^₹\s?/, '')
      .replace(/^Rs\.?\s?/i, '');
    return raw || null;
  }

  if (opts?.decimals === false || opts?.decimals == null) {
    return Math.round(n).toLocaleString('en-IN');
  }

  const places = typeof opts.decimals === 'number' ? opts.decimals : 2;
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });
};

/** Format as ₹ + amount with no space (Flipkart-style). */
export const formatRupee = (
  value?: string | number | null,
  opts?: RupeeFormatOptions,
): string => {
  const amount = formatAmountOnly(value, opts);
  if (amount == null) {
    return opts?.fallback ?? '—';
  }
  return `${RUPEE_SYMBOL}${amount}`;
};

/**
 * Round product discount % for display (11.00 → 11).
 * Matches ProductCard badge style everywhere.
 */
export const roundDiscountPercent = (
  value?: string | number | null,
): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
};

/** e.g. "11% OFF" or "11% off" — empty string when no discount. */
export const formatDiscountOff = (
  value?: string | number | null,
  style: 'OFF' | 'off' = 'OFF',
): string => {
  const pct = roundDiscountPercent(value);
  return pct > 0 ? `${pct}% ${style}` : '';
};

/** Match Tabler stroke weight to amount font weight. */
const strokeForAmountStyle = (flat: TextStyle): number => {
  const family = String(flat.fontFamily || Fonts.PoppinsMedium);
  const weight = flat.fontWeight;

  if (weight === '700' || weight === 'bold' || /SemiBold|Bold/i.test(family)) {
    return 2.5;
  }
  if (weight === '600' || /Medium/i.test(family)) {
    return 2.25;
  }
  if (weight === '300' || weight === '200' || weight === 'light') {
    return 1.75;
  }
  return 2;
};

type RupeeAmountProps = {
  value?: string | number | null;
  style?: StyleProp<TextStyle>;
  symbolStyle?: StyleProp<TextStyle>;
  /** Optional override; defaults to amount `fontSize` so icon matches text. */
  iconSize?: number;
  iconColor?: string;
  /** When false, renders amount digits only. */
  showIcon?: boolean;
  fallback?: string;
  decimals?: number | false;
  /** Optional prefix such as "MRP " or "You save " */
  prefix?: string;
};

/**
 * Tabler `currency-rupee` + amount — same size & weight as amount text.
 */
export const RupeeAmount = ({
  value,
  style,
  symbolStyle: _symbolStyle,
  iconSize,
  iconColor,
  showIcon = true,
  fallback = '—',
  decimals,
  prefix,
}: RupeeAmountProps) => {
  const amount = formatAmountOnly(value, { decimals });
  if (amount == null) {
    return (
      <Text style={[styles.amount, style]} allowFontScaling={false}>
        {fallback}
      </Text>
    );
  }

  const flat = StyleSheet.flatten(style) || {};
  const fontSize = Number(flat.fontSize ?? 14);
  const color =
    iconColor ?? (flat.color as string | undefined) ?? '#111827';
  // Same pixel size as amount; stroke matches amount font weight
  const rupeeSize = Math.max(10, Math.round(iconSize ?? fontSize));
  const rupeeStroke = strokeForAmountStyle(flat);

  if (!showIcon) {
    return (
      <Text style={[styles.amount, style]} allowFontScaling={false}>
        {prefix}
        {amount}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {prefix ? (
        <Text style={[styles.amount, style]} allowFontScaling={false}>
          {prefix}
        </Text>
      ) : null}
      <TablerIcon
        name="currency-rupee"
        size={rupeeSize}
        color={color}
        strokeWidth={rupeeStroke}
        style={styles.icon}
      />
      <Text style={[styles.amount, style]} allowFontScaling={false}>
        {amount}
      </Text>
    </View>
  );
};

/** Alias for RupeeAmount — same Flipkart-style inline display. */
export const RupeeText = RupeeAmount;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: -3,
  },
  amount: {
    includeFontPadding: false,
    letterSpacing: 0,
    fontFamily: Fonts.PoppinsMedium,
  },
});
