import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { RupeeAmount } from '../utils/currencyUtils';
import {
  PaymentBreakdown,
  formatPaymentStatusLabel,
} from '../utils/paymentHistoryUtils';

type Props = {
  breakdown: PaymentBreakdown;
};

const PaymentBreakdownCard = ({ breakdown }: Props) => {
  if (!breakdown?.lines?.length) return null;

  return (
    <View style={styles.wrap}>
      {breakdown.status ? (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>
            {formatPaymentStatusLabel(breakdown.status)}
          </Text>
        </View>
      ) : null}

      {breakdown.lines.map(line => (
        <View
          key={line.key}
          style={[styles.row, line.emphasize && styles.totalRow]}
        >
          <Text
            style={[
              styles.label,
              line.emphasize && styles.totalLabel,
              line.muted && styles.mutedLabel,
            ]}
            numberOfLines={2}
          >
            {line.label}
          </Text>
          <RupeeAmount
            value={line.amount}
            style={[
              styles.amount,
              line.emphasize && styles.totalAmount,
              line.muted && styles.mutedAmount,
            ]}
            decimals={2}
            iconSize={line.emphasize ? 14 : 12}
            iconColor={
              line.emphasize
                ? Colors.primaryColor
                : line.muted
                  ? '#B45309'
                  : '#0F172A'
            }
          />
        </View>
      ))}
    </View>
  );
};

export default memo(PaymentBreakdownCard);

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  statusValue: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  totalLabel: {
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  mutedLabel: {
    color: '#B45309',
  },
  amount: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  totalAmount: {
    fontSize: 15,
    color: Colors.primaryColor,
  },
  mutedAmount: {
    color: '#B45309',
  },
});
