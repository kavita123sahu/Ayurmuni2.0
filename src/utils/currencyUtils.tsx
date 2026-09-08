import React from 'react';
import { Text, TextStyle, StyleProp, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';

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
    const raw = String(value).trim().replace(/^₹\s?/, '').replace(/^Rs\.?\s?/i, '');
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

type RupeeAmountProps = {
  value?: string | number | null;
  style?: StyleProp<TextStyle>;
  symbolStyle?: StyleProp<TextStyle>;
  /** Legacy prop — sets symbol size when style.fontSize is absent. */
  iconSize?: number;
  iconColor?: string;
  /** When false, renders amount digits only. */
  showIcon?: boolean;
  fallback?: string;
  decimals?: number | false;
  /** Optional prefix such as "MRP " or "You save " */
  prefix?: string;
};

const readFontSize = (style: StyleProp<TextStyle>): number | undefined =>
  StyleSheet.flatten(style)?.fontSize;

/**
 * Flipkart-style inline rupee: semibold ₹ symbol flush against the amount (zero gap).
 */
export const RupeeAmount = ({
  value,
  style,
  symbolStyle,
  iconSize,
  iconColor,
  showIcon = true,
  fallback = '—',
  decimals,
  prefix,
}: RupeeAmountProps) => {
  const amount = formatAmountOnly(value, { decimals });
  if (amount == null) {
    return <Text style={style}>{fallback}</Text>;
  }

  const baseFontSize = iconSize ?? readFontSize(style) ?? 14;
  const flatStyle = StyleSheet.flatten(style);
  const symbolColor =
    iconColor ?? (flatStyle?.color as string | undefined) ?? '#111827';

  const symbolTextStyle: TextStyle = {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: Math.round(baseFontSize * 0.94),
    color: symbolColor,
    includeFontPadding: false,
    letterSpacing: 0,
  };

  if (!showIcon) {
    return (
      <Text style={[styles.inline, style]}>
        {prefix}
        {amount}
      </Text>
    );
  }

  return (
    <Text style={[styles.inline, style]}>
      {prefix ? <Text>{prefix}</Text> : null}
      <Text style={[symbolTextStyle, symbolStyle]}>{RUPEE_SYMBOL}</Text>
      <Text style={style}>{amount}</Text>
    </Text>
  );
};

/** Alias for RupeeAmount — same Flipkart-style inline display. */
export const RupeeText = RupeeAmount;

const styles = StyleSheet.create({
  inline: {
    includeFontPadding: false,
    letterSpacing: 0,
  },
});
