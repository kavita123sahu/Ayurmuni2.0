import React, { memo } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';
import type { DietPurchaseReview } from '../hooks/useDietPurchase';
import { formatRupee } from '../utils/currencyUtils';

type Props = {
  review: DietPurchaseReview | null;
  onPay: () => void;
  onClose: () => void;
};

const catalogPrice = (item: any) => {
  const price = Number(item?.price ?? item?.selling_price);
  return Number.isFinite(price) && price > 0
    ? formatRupee(price, { decimals: Number.isInteger(price) ? 0 : 2 })
    : '';
};

const planMeta = (item: any) => {
  if (!item) return '';
  const duration =
    item.duration ||
    (item.duration_days ? `${item.duration_days} days` : '');
  return [duration, item.prakriti, item.season].filter(Boolean).join(' · ');
};

/** Diet checkout sheet — Cashfree only; amounts from the server purchase quote. */
const DietPaymentSheet = ({ review, onPay, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  if (!review) return null;

  const quote = review.quote;
  const fees = quote && !quote.error ? quote.fees : null;
  const loading = Boolean(review.loading);
  const paying = Boolean(review.paying);
  const error = review.error || quote?.error || '';
  const ready = Boolean(quote && !quote.error && !loading);
  const item = review.item;
  const total = fees?.total || '';
  const rows =
    fees?.rows?.length
      ? fees.rows
      : total
        ? [{ key: 'price', label: 'Diet plan', value: total }]
        : [];
  const linePrice =
    rows.find(row => row.key === 'price')?.value ||
    catalogPrice(item) ||
    total;

  return (
    <Modal
      visible={Boolean(review)}
      transparent
      animationType="slide"
      onRequestClose={paying ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={paying ? undefined : onClose}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.title}>Checkout</Text>
              <Text style={styles.sub}>
                1 diet plan · Pay with Cashfree, then the plan starts
              </Text>
            </View>
            {!paying ? (
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <TablerIcon name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your plan</Text>
              <View style={styles.line}>
                <View style={styles.lineBody}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {item?.title || item?.name || 'Diet plan'}
                  </Text>
                  {planMeta(item) ? (
                    <Text style={styles.lineMeta}>{planMeta(item)}</Text>
                  ) : null}
                  <Text style={styles.lineQty}>Qty 1</Text>
                </View>
                <Text style={styles.linePrice}>
                  {loading && !linePrice ? '…' : linePrice || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.summaryHead}>
                <Text style={styles.cardTitle}>Order summary</Text>
                <Text style={styles.summaryHint}>
                  {loading ? 'Calculating' : 'To pay'}
                </Text>
              </View>
              {loading && !rows.length ? (
                <Text style={styles.wait}>Preparing your bill…</Text>
              ) : null}
              {rows.map(row => (
                <View key={row.key} style={styles.billRow}>
                  <Text
                    style={[
                      styles.billLabel,
                      row.deduct && styles.billSave,
                    ]}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={[
                      styles.billValue,
                      row.deduct && styles.billSave,
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
              {(total || rows.length > 0) && (
                <View style={[styles.billRow, styles.billTotal]}>
                  <Text style={styles.totalLabel}>To pay</Text>
                  <Text style={styles.totalValue}>{total || '—'}</Text>
                </View>
              )}
              <View style={styles.method}>
                <TablerIcon name="shield" size={16} color={Colors.primaryColor} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Cashfree</Text>
                  <Text style={styles.methodSub}>
                    UPI, cards, net banking and wallets
                  </Text>
                </View>
              </View>
            </View>

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={paying}
              onPress={onClose}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={!ready || paying}
              onPress={onPay}
              style={[styles.payBtn, (!ready || paying) && styles.payDisabled]}
            >
              {paying || loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.payText}>
                    {total ? `Pay ${total}` : 'Pay now'}
                  </Text>
                  <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(DietPaymentSheet);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DEDA',
    marginBottom: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 17,
    color: '#1F2A27',
  },
  sub: {
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#64748B',
  },
  body: {
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    backgroundColor: '#F3F8F6',
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: '#1F2A27',
    marginBottom: 10,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  lineBody: { flex: 1 },
  lineName: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#1F2A27',
  },
  lineMeta: {
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#64748B',
  },
  lineQty: {
    marginTop: 4,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: '#94A3B8',
  },
  linePrice: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 14,
    color: Colors.primaryColor,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryHint: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  wait: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    color: '#64748B',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  billLabel: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    color: '#4B5753',
  },
  billValue: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: '#1F2A27',
  },
  billSave: {
    color: '#15803D',
  },
  billTotal: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D5DEDA',
  },
  totalLabel: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#1F2A27',
  },
  totalValue: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 16,
    color: Colors.primaryColor,
  },
  method: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
  },
  methodTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: '#1F2A27',
  },
  methodSub: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: '#64748B',
  },
  error: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: '#B91C1C',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5DEDA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#4B5753',
  },
  payBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payDisabled: {
    opacity: 0.7,
  },
  payText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
