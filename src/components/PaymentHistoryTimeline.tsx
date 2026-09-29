import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';
import { formatRupee } from '../utils/currencyUtils';
import {
  PaymentHistoryEntry,
  formatPaymentReason,
  formatPaymentStatusLabel,
  formatPaymentTimestamp,
  getPaymentStatusTone,
} from '../utils/paymentHistoryUtils';

const TONE_COLORS = {
  success: { dot: '#16A34A', text: '#15803D', bg: '#DCFCE7' },
  warning: { dot: '#D97706', text: '#B45309', bg: '#FEF3C7' },
  danger: { dot: '#DC2626', text: '#B91C1C', bg: '#FEE2E2' },
  neutral: { dot: '#64748B', text: '#475569', bg: '#F1F5F9' },
};

type Props = {
  history: PaymentHistoryEntry[];
};

const PaymentHistoryTimeline = ({ history }: Props) => {
  if (!history.length) return null;

  return (
    <View>
      {history.map((entry, index) => {
        const tone = TONE_COLORS[getPaymentStatusTone(entry.status)];
        const isLast = index === history.length - 1;
        const reason = formatPaymentReason(entry.reason);
        const time = formatPaymentTimestamp(entry.at);

        return (
          <View key={`${entry.status}-${entry.at || index}`} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: tone.dot }]} />
              {!isLast ? <View style={styles.line} /> : null}
            </View>

            <View style={[styles.body, !isLast && styles.bodySpacing]}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: tone.text }]} numberOfLines={1}>
                  {formatPaymentStatusLabel(entry.status)}
                </Text>
                {entry.amount != null ? (
                  <Text style={styles.amount}>{formatRupee(entry.amount)}</Text>
                ) : null}
              </View>
              {time ? <Text style={styles.meta}>{time}</Text> : null}
              {reason ? <Text style={styles.reason}>{reason}</Text> : null}
              {entry.gateway_refund_id ? (
                <View style={[styles.refChip, { backgroundColor: tone.bg }]}>
                  <Text style={[styles.refText, { color: tone.text }]} numberOfLines={1}>
                    Ref: {entry.gateway_refund_id}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default memo(PaymentHistoryTimeline);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rail: {
    width: 18,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
  },
  body: {
    flex: 1,
    marginLeft: 8,
    minWidth: 0,
  },
  bodySpacing: {
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  amount: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  meta: {
    marginTop: 2,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  reason: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
  },
  refChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  refText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
  },
});
