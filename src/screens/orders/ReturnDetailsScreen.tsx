import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/AppHeader';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { SCREEN_THEME } from '../../constants/screenTheme';
import { formatRupee } from '../../utils/currencyUtils';
import { formatOrderId } from '../../utils/formatDisplayId';
import { formatOrderDateTime } from '../../utils/orderDetailUtils';
import { resolveProductImageUri } from '../../utils/imageUtils';
import {
  RETURN_STEPS,
  ReturnRequest,
  getReasonLabel,
  getReturnById,
  getReturnStatusMeta,
  getReturnStepIndex,
  maskAccount,
  normalizeReturnRequest,
} from '../../services/ReturnService';

type RefundStage = 0 | 1 | 2;

const REFUND_STAGES = ['Return approved', 'Refund initiated', 'Credited'] as const;

const statusIcon = (status: string): TablerIconName => {
  if (status === 'rejected' || status === 'cancelled') return 'x';
  if (status === 'refunded' || status === 'completed') return 'circle-check';
  if (status === 'picked_up' || status === 'pickup_scheduled') return 'truck';
  if (status === 'approved' || status === 'received') return 'check';
  return 'clock';
};

/** Where the refund currently is, from `refund_request.status` and the return status. */
const getRefundStage = (returnStatus: string, refundStatus: string): RefundStage => {
  const rs = refundStatus.toLowerCase();
  if (['success', 'processed', 'completed', 'refunded', 'credited'].includes(rs)) return 2;
  if (rs) return 1;
  if (returnStatus === 'refunded' || returnStatus === 'completed') return 2;
  if (returnStatus === 'refund_initiated') return 1;
  return 0;
};

const ReturnDetailsScreen = ({ route, navigation }: any) => {
  const returnId = String(route?.params?.returnId ?? route?.params?.returnRequest?.id ?? '');
  const [data, setData] = useState<ReturnRequest | null>(
    route?.params?.returnRequest ? normalizeReturnRequest(route.params.returnRequest) : null,
  );
  const [loading, setLoading] = useState(!data);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!returnId) return;
      if (mode === 'refresh') setRefreshing(true);
      setError('');
      try {
        const next = await getReturnById(returnId);
        if (next) setData(next);
        else setError('Return request not found.');
      } catch (e: any) {
        setError(e?.message || 'Could not load return request.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [returnId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const status = data?.status ?? '';
  const meta = getReturnStatusMeta(status);
  const terminalBad = status === 'rejected' || status === 'cancelled';
  const stepIndex = getReturnStepIndex(status);

  const refundRequest = data?.refundRequest ?? null;
  const refundStatus = String(refundRequest?.status ?? '');
  const refundStage = getRefundStage(status, refundStatus);

  const itemsTotal = useMemo(
    () => (data?.items ?? []).reduce((s, i) => s + i.sellingPrice * i.quantity, 0),
    [data],
  );
  const refundAmount = Number(refundRequest?.amount ?? refundRequest?.refund_amount ?? 0) || itemsTotal;
  const refundReference = String(
    refundRequest?.utr ??
    
      refundRequest?.reference_id ??
      refundRequest?.gateway_refund_id ??
      refundRequest?.transaction_id ??
      '',
  );
  const refundedAt = String(refundRequest?.processed_at ?? refundRequest?.refunded_at ?? '');

  const refund = data?.refundDetails ?? {};
  const refundTo: { icon: TablerIconName; title: string; lines: string[] } = refund.upi_id
    ? { icon: 'wallet', title: 'UPI', lines: [refund.upi_id] }
    : refund.account_number
      ? {
          icon: 'building',
          title: 'Bank account',
          lines: [
            refund.account_holder_name || '',
            `A/C ${maskAccount(refund.account_number)}`,
            refund.ifsc_code ? `IFSC ${refund.ifsc_code}` : '',
          ].filter(Boolean),
        }
      : {
          icon: 'credit-card',
          title: 'Original payment method',
          lines: ['Card / UPI / wallet used to pay for this order'],
        };

  const orderLines: any[] = route?.params?.order?.items ?? [];
  const findLine = (orderItemId: string, variantId: string) =>
    orderLines.find(l => String(l?.id) === orderItemId) ??
    orderLines.find(l => String(l?.variant_id ?? l?.variant?.id ?? '') === variantId);

  const refundHeadline = terminalBad
    ? 'No refund for this request'
    : refundStage === 2
      ? 'Refund credited'
      : refundStage === 1
        ? 'Refund on the way'
        : 'Refund after pickup & quality check';

  const refundHint = terminalBad
    ? data?.reviewNote || meta.hint
    : refundStage === 2
      ? refundedAt
        ? `Credited on ${formatOrderDateTime(refundedAt)}`
        : 'The amount has been credited to you.'
      : refundStage === 1
        ? refund.upi_id || refund.account_number
          ? 'Usually reflects in 1–3 business days.'
          : 'Usually reflects in 5–7 business days.'
        : 'We start the refund once the returned items are checked.';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={SCREEN_THEME.statusBarStyle} backgroundColor={SCREEN_THEME.statusBarBackground} />
      <AppHeader title="Return details" onLeftPress={() => navigation.goBack()} />

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primaryColor} />
        </View>
      ) : !data ? (
        <View style={styles.center}>
          <TablerIcon name="alert-circle" size={26} color="#DC2626" />
          <Text style={styles.muted}>{error || 'Return request not found.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} colors={[Colors.primaryColor]} />
          }
        >
          {/* ── Status banner ── */}
          <View style={[styles.banner, { backgroundColor: meta.bg }]}>
            <View style={[styles.bannerIcon, { backgroundColor: meta.color }]}>
              <TablerIcon name={statusIcon(status)} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.bannerTitle, { color: meta.color }]}>{meta.label}</Text>
              {meta.hint ? (
                <Text style={[styles.bannerHint, { color: meta.color }]}>{meta.hint}</Text>
              ) : null}
            </View>
          </View>

          {/* ── Order strip ── */}
          <TouchableOpacity
            style={styles.orderStrip}
            activeOpacity={0.85}
            disabled={!data.orderId}
            onPress={() =>
              navigation.navigate('OrderDetailsScreen', {
                order: route?.params?.order ?? { id: data.orderId, order_code: data.orderCode },
              })
            }
          >
            <View style={styles.orderStripIcon}>
              <TablerIcon name="receipt" size={16} color={Colors.primaryColor} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.orderCode}>Order #{formatOrderId(data.orderCode || data.orderId)}</Text>
              <Text style={styles.orderDate}>Return requested {formatOrderDateTime(data.createdAt)}</Text>
            </View>
            <TablerIcon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* ── Refund highlight ── */}
          <LinearGradient
            colors={terminalBad ? ['#64748B', '#475569'] : ['#0F766E', Colors.primaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.refundCard}
          >
            <View style={styles.refundTop}>
              <View style={styles.flex1}>
                <Text style={styles.refundLabel}>REFUND AMOUNT</Text>
                <Text style={[styles.refundAmount, terminalBad && styles.refundAmountStruck]}>
                  {formatRupee(refundAmount, { decimals: 2 })}
                </Text>
              </View>
              <View style={styles.refundBadge}>
                <TablerIcon
                  name={terminalBad ? 'x' : refundStage === 2 ? 'circle-check' : 'clock'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.refundBadgeText}>
                  {terminalBad ? 'Not applicable' : refundStage === 2 ? 'Credited' : refundStage === 1 ? 'Processing' : 'Pending'}
                </Text>
              </View>
            </View>

            <Text style={styles.refundHeadline}>{refundHeadline}</Text>
            <Text style={styles.refundHint}>{refundHint}</Text>

            {!terminalBad ? (
              <View style={styles.refundProgress}>
                {REFUND_STAGES.map((label, idx) => {
                  const reached = idx === 0 ? stepIndex >= 1 || refundStage > 0 : refundStage >= idx;
                  return (
                    <React.Fragment key={label}>
                      <View style={styles.refundStage}>
                        <View style={[styles.refundDot, reached && styles.refundDotOn]}>
                          {reached ? <TablerIcon name="check" size={9} color={Colors.primaryColor} /> : null}
                        </View>
                        <Text style={[styles.refundStageText, reached && styles.refundStageTextOn]} numberOfLines={1}>
                          {label}
                        </Text>
                      </View>
                      {idx < REFUND_STAGES.length - 1 ? (
                        <View style={[styles.refundBar, refundStage > idx && styles.refundBarOn]} />
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </View>
            ) : null}

            {/* Refund destination */}
            <View style={styles.refundTo}>
              <View style={styles.refundToIcon}>
                <TablerIcon name={refundTo.icon} size={18} color={Colors.primaryColor} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.refundToLabel}>Refund to</Text>
                <Text style={styles.refundToTitle}>{refundTo.title}</Text>
                {refundTo.lines.map(line => (
                  <Text key={line} style={styles.refundToLine} numberOfLines={1}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>

            {refundReference ? (
              <View style={styles.refundRef}>
                <Text style={styles.refundRefLabel}>Reference / UTR</Text>
                <Text style={styles.refundRefValue} selectable>
                  {refundReference}
                </Text>
              </View>
            ) : null}
          </LinearGradient>

          {/* ── Return progress ── */}
          <Text style={styles.sectionTitle}>Return progress</Text>
          <View style={styles.card}>
            {terminalBad ? (
              <View style={styles.badBox}>
                <TablerIcon name="alert-circle" size={16} color="#B91C1C" />
                <View style={styles.flex1}>
                  <Text style={styles.badTitle}>Request {meta.label.toLowerCase()}</Text>
                  {data.reviewNote ? <Text style={styles.badNote}>{data.reviewNote}</Text> : null}
                </View>
              </View>
            ) : (
              RETURN_STEPS.map((step, idx) => {
                const done = idx <= stepIndex;
                const current = idx === stepIndex;
                const last = idx === RETURN_STEPS.length - 1;
                const sub =
                  idx === 0
                    ? formatOrderDateTime(data.createdAt)
                    : idx === 1 && done && data.reviewedAt
                      ? formatOrderDateTime(data.reviewedAt)
                      : '';
                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                        {done ? <TablerIcon name="check" size={9} color="#FFFFFF" /> : null}
                      </View>
                      {!last ? <View style={[styles.line, idx < stepIndex && styles.lineDone]} /> : null}
                    </View>
                    <View style={[styles.stepBody, last && styles.stepBodyLast]}>
                      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
                      {sub ? <Text style={styles.stepSub}>{sub}</Text> : null}
                      {idx === 1 && done && data.reviewNote ? (
                        <Text style={styles.stepNote}>{data.reviewNote}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}

            {data.reversePickupCode ? (
              <View style={styles.pickupBox}>
                <TablerIcon name="truck" size={16} color={Colors.primaryColor} />
                <View style={styles.flex1}>
                  <Text style={styles.pickupLabel}>Reverse pickup ID</Text>
                  <Text style={styles.pickupValue} selectable>
                    {data.reversePickupCode}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* ── Items ── */}
          <Text style={styles.sectionTitle}>
            Returned items ({data.items.reduce((s, i) => s + i.quantity, 0)})
          </Text>
          <View style={styles.card}>
            {data.items.map((item, idx) => {
              const line = findLine(item.orderItemId, item.variantId);
              const img = line ? resolveProductImageUri(line) : '';
              const name = line?.variant?.variant_title || line?.product_name || item.skuCode || 'Item';
              return (
                <View key={item.id} style={[styles.itemRow, idx > 0 && styles.itemRowBorder]}>
                  <View style={styles.thumb}>
                    {img ? (
                      <Image source={{ uri: img }} style={styles.thumbImg} />
                    ) : (
                      <TablerIcon name="package" size={18} color="#94A3B8" />
                    )}
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      Qty {item.quantity} × {formatRupee(item.sellingPrice, { decimals: 2 })}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatRupee(item.sellingPrice * item.quantity, { decimals: 2 })}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ── Reason ── */}
          <Text style={styles.sectionTitle}>Reason for return</Text>
          <View style={styles.card}>
            {data.reasonCode ? (
              <View style={styles.reasonTag}>
                <TablerIcon name="alert-circle" size={12} color="#B45309" />
                <Text style={styles.reasonTagText}>{getReasonLabel(data.reasonCode, data.reasonCode)}</Text>
              </View>
            ) : null}
            {data.reason ? <Text style={styles.reasonText}>{data.reason}</Text> : null}
            {data.media.length ? (
              <View style={styles.mediaRow}>
                {data.media.map(m => (
                  <Image key={m.media_url} source={{ uri: m.media_url }} style={styles.mediaImg} />
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ReturnDetailsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1, minWidth: 0 },
  scroll: { padding: 14, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  muted: { fontSize: 12.5, color: '#64748B', fontFamily: Fonts.PoppinsRegular, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: Colors.primaryColor },
  retryText: { fontSize: 12, color: Colors.primaryColor, fontFamily: Fonts.PoppinsSemiBold },

  // Status banner
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14 },
  bannerIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold },
  bannerHint: { marginTop: 1, fontSize: 12, fontFamily: Fonts.PoppinsMedium, opacity: 0.85 },

  // Order strip
  orderStrip: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  orderStripIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ECF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCode: { fontSize: 13, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  orderDate: { marginTop: 1, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsRegular },

  // Refund highlight
  refundCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  refundTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  refundLabel: { fontSize: 10.5, letterSpacing: 1, color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.PoppinsSemiBold },
  refundAmount: { marginTop: 2, fontSize: 28, lineHeight: 36, color: '#FFFFFF', fontFamily: Fonts.PoppinsBold },
  refundAmountStruck: { textDecorationLine: 'line-through', opacity: 0.8 },
  refundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  refundBadgeText: { fontSize: 11, color: '#FFFFFF', fontFamily: Fonts.PoppinsSemiBold },
  refundHeadline: { marginTop: 6, fontSize: 14, color: '#FFFFFF', fontFamily: Fonts.PoppinsSemiBold },
  refundHint: { marginTop: 2, fontSize: 12, color: 'rgba(255,255,255,0.82)', fontFamily: Fonts.PoppinsRegular, lineHeight: 17 },

  refundProgress: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-start' },
  refundStage: { alignItems: 'center', width: 72 },
  refundDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refundDotOn: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  refundStageText: { marginTop: 4, fontSize: 9.5, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.PoppinsMedium, textAlign: 'center' },
  refundStageTextOn: { color: '#FFFFFF', fontFamily: Fonts.PoppinsSemiBold },
  refundBar: { flex: 1, height: 2, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 },
  refundBarOn: { backgroundColor: '#FFFFFF' },

  refundTo: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  refundToIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refundToLabel: { fontSize: 10.5, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
  refundToTitle: { fontSize: 13.5, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  refundToLine: { marginTop: 1, fontSize: 11.5, color: '#475569', fontFamily: Fonts.PoppinsRegular },
  refundRef: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  refundRefLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.PoppinsMedium },
  refundRefValue: { flexShrink: 1, fontSize: 12, color: '#FFFFFF', fontFamily: Fonts.PoppinsSemiBold },

  // Sections
  sectionTitle: { marginTop: 20, marginBottom: 8, fontSize: 14, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E8EEF0', padding: 14 },

  // Timeline
  stepRow: { flexDirection: 'row' },
  stepLeft: { width: 22, alignItems: 'center' },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.primaryColor, borderColor: Colors.primaryColor },
  dotCurrent: { shadowColor: Colors.primaryColor, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3 },
  line: { flex: 1, width: 2, minHeight: 18, backgroundColor: '#E2E8F0', marginVertical: 2 },
  lineDone: { backgroundColor: Colors.primaryColor },
  stepBody: { flex: 1, paddingLeft: 12, paddingBottom: 14 },
  stepBodyLast: { paddingBottom: 0 },
  stepLabel: { fontSize: 13, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
  stepLabelDone: { color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },
  stepSub: { marginTop: 1, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsRegular },
  stepNote: { marginTop: 3, fontSize: 11.5, color: '#475569', fontFamily: Fonts.PoppinsMedium },

  badBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12 },
  badTitle: { fontSize: 13, color: '#B91C1C', fontFamily: Fonts.PoppinsSemiBold },
  badNote: { marginTop: 2, fontSize: 12, color: '#7F1D1D', fontFamily: Fonts.PoppinsRegular },

  pickupBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3FAF8',
    borderRadius: 12,
    padding: 10,
  },
  pickupLabel: { fontSize: 10.5, color: '#64748B', fontFamily: Fonts.PoppinsMedium },
  pickupValue: { fontSize: 12.5, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },

  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  itemRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  itemName: { fontSize: 13, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold, lineHeight: 17 },
  itemMeta: { marginTop: 2, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsRegular },
  itemPrice: { fontSize: 13, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold },

  // Reason
  reasonTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  reasonTagText: { fontSize: 11, color: '#92400E', fontFamily: Fonts.PoppinsSemiBold },
  reasonText: { fontSize: 12.5, color: '#334155', fontFamily: Fonts.PoppinsRegular, lineHeight: 18 },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mediaImg: { width: 68, height: 68, borderRadius: 12, backgroundColor: '#F1F5F9' },
});
