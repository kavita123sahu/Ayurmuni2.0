import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions,
  Share,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import FeedbackModal from '../../components/FeedbackModal';
import {
  buildOrderTrackingSteps,
  formatDeliveryAddress,
  formatOrderDateTime,
  getOrderItemReview,
  isOrderItemRated,
} from '../../utils/orderDetailUtils';
import { getReviewsAll } from '../../services/ProductServices';
import { getScreenBottomPadding } from '../../constants/layout';
import { resolveProductImageUri } from '../../utils/imageUtils';
import { extractReviewsList } from '../../utils/reviewUtils';
import { consumePendingProductReview } from '../../utils/pendingProductReview';
import { getStatusColor } from '../../common/DataInterface';
import { cancelOrder, downloadInvoiceFile, pollOrderTracking } from '../../services/OrderService';
import { Buffer } from 'buffer';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ──────────────────────────────────────────────────────────────────

type OrderItemRow = {
  id: string;
  variantId: string;
  name: string;
  subtitle: string;
  price: string;
  image?: string;
  raw: any;
  rated: boolean;
  review: {
    rating: number;
    review: string;
    images: string[];
    isRated: boolean;
  } | null;
};

// ─── Status enums ────────────────────────────────────────────────────────────

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

const CANCEL_ALLOWED: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.PACKED,
];

const INVOICE_ALLOWED: OrderStatus[] = [
  ORDER_STATUS.PACKED,
  ORDER_STATUS.DISPATCHED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.RETURNED,
];

const RETURN_ALLOWED: OrderStatus[] = [
  ORDER_STATUS.DELIVERED,
];

const CANCELLATION_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found a better price',
  'Product is no longer required',
  'Other',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value?: string | number) => {
  const num = Number(value ?? 0);
  return `₹${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
};

const resolveOrderItemsTotal = (order: any): number => {
  const candidates = [
    order?.items_total,
    order?.item_total,
    order?.items_subtotal,
    order?.products_total,
    order?.subtotal,
    order?.cart_subtotal,
    order?.amount_items,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const items = Array.isArray(order?.items) ? order.items : [];
  const sum = items.reduce((acc: number, item: any) => {
    const qty = Number(item?.quantity ?? 1) || 1;
    const unit = Number(
      item?.selling_price ?? item?.variant?.selling_price ?? item?.price ?? item?.unit_price ?? 0,
    );
    const line = Number(
      item?.item_total ?? item?.line_total ?? item?.total ?? item?.subtotal ?? unit * qty,
    );
    return acc + (Number.isFinite(line) ? line : 0);
  }, 0);
  if (sum > 0) return sum;
  const grand = Number(order?.total_amount ?? order?.grand_total ?? 0);
  if (!Number.isFinite(grand) || grand <= 0) return 0;
  const shipping = Number(order?.shipping_charges ?? 0) || 0;
  const cod = Number(order?.cod_charges ?? 0) || 0;
  const discount = Number(order?.total_discount ?? order?.discount ?? 0) || 0;
  const derived = grand - shipping - cod + discount;
  return derived > 0 ? derived : grand;
};

const mapOrderItems = (
  order: any,
  fetchedByVariant?: Record<string, any> | null,
): OrderItemRow[] => {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.map((item: any, index: number) => {
    const review = getOrderItemReview(item, order, fetchedByVariant);
    const qty = Number(item?.quantity ?? 1) || 1;
    const unit = Number(
      item?.selling_price ?? item?.variant?.selling_price ?? item?.price ?? item?.unit_price ?? 0,
    );
    const lineTotal = Number(
      item?.item_total ?? item?.line_total ?? item?.total ?? unit * qty,
    );
    return {
      id: String(item?.id ?? index),
      variantId: String(item?.variant?.variant_id ?? item?.variant_id ?? ''),
      name: String(item?.variant?.variant_title ?? item?.product_name ?? 'Product'),
      subtitle: `Qty: ${qty}`,
      price: formatCurrency(lineTotal > 0 ? lineTotal : unit),
      image: resolveProductImageUri(item),
      raw: item,
      review,
      rated: isOrderItemRated(item, order) || Boolean(review?.isRated),
    };
  });
};

// ─── Status label / color map ────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: '#FEF9C3', text: '#854D0E' },
  confirmed: { label: 'Confirmed', bg: '#DCFCE7', text: '#166534' },
  processing: { label: 'Processing', bg: '#DBEAFE', text: '#1E40AF' },
  packed: { label: 'Packed', bg: '#E0F2FE', text: '#0369A1' },
  dispatched: { label: 'Dispatched', bg: '#EDE9FE', text: '#5B21B6' },
  shipped: { label: 'Shipped', bg: '#FEF3C7', text: '#92400E' },
  delivered: { label: 'Delivered', bg: '#DCFCE7', text: '#166534' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B' },
  returned: { label: 'Returned', bg: '#F1F5F9', text: '#475569' },
};

const getStatusMeta = (status: string) =>
  STATUS_META[status] ?? { label: status?.toUpperCase(), bg: '#F1F5F9', text: '#475569' };

// ─── Small sub-components ─────────────────────────────────────────────────────

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const initialOrder = route?.params?.order;
  const fromOrderSuccess = Boolean(route?.params?.fromOrderSuccess);
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);

  const [order, setOrder] = useState<any>(initialOrder);
  const [reviewTarget, setReviewTarget] = useState<OrderItemRow | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [fetchedReviewsByVariant, setFetchedReviewsByVariant] = useState<Record<string, any>>({});
  const reviewFetchAttemptedRef = useRef<Set<string>>(new Set());

  const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

  // ── Derived state ──────────────────────────────────────────────────────────

  const status = String(order?.order_status ?? '').toLowerCase() as OrderStatus;
  const statusMeta = getStatusMeta(status);
  const canCancel = CANCEL_ALLOWED.includes(status);
  const canInvoice = INVOICE_ALLOWED.includes(status);
  const canReturn = RETURN_ALLOWED.includes(status);
  const canReview = status === ORDER_STATUS.DELIVERED;

  const items = useMemo(
    () => mapOrderItems(order, fetchedReviewsByVariant),
    [order, fetchedReviewsByVariant],
  );

  const trackingSteps = useMemo(() => buildOrderTrackingSteps(order), [order]);
  const address = formatDeliveryAddress(order?.delivery_address);

  const paymentRows = useMemo(() => [
    { label: 'Items total', value: formatCurrency(resolveOrderItemsTotal(order)) },
    {
      label: 'Shipping',
      value: Number(order?.shipping_charges ?? 0) > 0
        ? formatCurrency(order?.shipping_charges)
        : 'Free',
    },
    {
      label: 'Discount',
      value: Number(order?.total_discount ?? 0) > 0
        ? `- ${formatCurrency(order?.total_discount)}`
        : undefined,
    },
    {
      label: 'COD charges',
      value: Number(order?.cod_charges ?? 0) > 0 ? formatCurrency(order?.cod_charges) : undefined,
    },
  ].filter(r => r.value != null), [order]);

  const deliveryAgent =
    order?.delivery_partner ?? order?.delivery_agent ?? order?.delivery_person ?? null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const goBack = useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate('OrderHistory');
    }
  }, [navigation]);

  const applyLocalReview = useCallback(
    (payload: {
      variantId: string;
      orderId?: string;
      rating: number;
      review?: string;
      image_urls?: string[];
    }) => {
      const vid = String(payload.variantId);
      if (!vid) return;
      reviewFetchAttemptedRef.current.add(vid);
      setFetchedReviewsByVariant(prev => ({
        ...prev,
        [vid]: {
          order_id: String(payload.orderId ?? order?.id ?? ''),
          variant_id: vid,
          rating: Number(payload.rating ?? 0),
          review: String(payload.review ?? ''),
          image_urls: Array.isArray(payload.image_urls) ? payload.image_urls : [],
          is_reviewed: true,
        },
      }));
      setOrder((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: (Array.isArray(prev.items) ? prev.items : []).map((item: any) => {
            const itemVid = String(item?.variant?.variant_id ?? item?.variant_id ?? '');
            if (itemVid !== vid) return item;
            return { ...item, is_reviewed: true, variant: { ...(item?.variant ?? {}), is_reviewed: true } };
          }),
        };
      });
    },
    [order?.id],
  );

  const refreshTracking = useCallback(async () => {
    if (!order?.id) return;
    try {
      setTrackingLoading(true);
      const res = await pollOrderTracking(order.id);
      const updated = res?.data?.data ?? res?.data ?? res;
      if (updated) setOrder((prev: any) => ({ ...prev, ...updated }));
    } catch {
      // silent
    } finally {
      setTrackingLoading(false);
    }
  }, [order?.id]);

  const handleCancel = useCallback(async () => {
    if (!order?.id || cancelLoading || !finalReason || !canCancel) return;
    try {
      setCancelLoading(true);
      const res = await cancelOrder(order.id, { cancellation_reason: finalReason });
      const updated = res?.data?.data ?? res?.data ?? res;
      setOrder((prev: any) => ({
        ...prev,
        ...(updated || {}),
        order_status: updated?.order_status ?? ORDER_STATUS.CANCELLED,
      }));
      setShowCancelModal(false);
      setSelectedReason('');
      setCustomReason('');
      Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
    } catch (error: any) {
      Alert.alert(
        'Unable to Cancel',
        error?.response?.data?.message ?? 'Unable to cancel this order. Please try again.',
      );
    } finally {
      setCancelLoading(false);
    }
  }, [order?.id, cancelLoading, finalReason, canCancel]);

  const handleInvoice = useCallback(async () => {
    if (!order?.id || invoiceLoading) return;
    try {
      setInvoiceLoading(true);
      const response = await downloadInvoiceFile(order.id);
      if (!response?.success || response.status !== 200 || !response.data) {
        throw new Error('Invoice PDF data not found');
      }

      const base64 = Buffer.from(new Uint8Array(response.data)).toString('base64');
      const fileName = `Invoice_${order?.order_code ?? order.id}.pdf`;

      // Save to a persistent, user-accessible location
      const saveDir =
        Platform.OS === 'android'
          ? RNFS.DownloadDirectoryPath          // /sdcard/Download — visible in Files app
          : RNFS.DocumentDirectoryPath;          // iOS Documents — accessible via Files

      const filePath = `${saveDir}/${fileName}`;

      await RNFS.writeFile(filePath, base64, 'base64');

      const exists = await RNFS.exists(filePath);
      if (!exists) throw new Error('Invoice file was not saved');

      // Try to open directly; fall back to Share sheet
      try {
        await FileViewer.open(filePath, { showOpenWithDialog: true });
      } catch {
        await Share.share({
          title: fileName,
          url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
          message: `Invoice for order #${order?.order_code ?? order.id}`,
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Invoice saved',
        text2: `Saved to ${Platform.OS === 'android' ? 'Downloads' : 'Files'}`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Invoice download failed',
        text2: err?.message ?? 'Please try again',
      });
    } finally {
      setInvoiceLoading(false);
    }
  }, [order?.id, order?.order_code, invoiceLoading]);

  const handleReturn = useCallback(() => {
    Alert.alert(
      'Return Order',
      'Return/exchange requests are handled by our support team. Would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          onPress: () => Linking.openURL('mailto:support@ayurmuni.com'),
        },
      ],
    );
  }, []);

  const openProductReview = useCallback(
    (rating: number) => {
      if (!reviewTarget?.variantId) return;
      if (reviewTarget.rated || reviewTarget.raw?.variant?.is_reviewed === true) {
        setReviewTarget(null);
        return;
      }
      const target = reviewTarget;
      setReviewTarget(null);
      navigation.navigate('ShareExperienceScreen', {
        entityType: 'product',
        entityName: target.name,
        entitySubtitle: `Order #${order?.order_code ?? order?.id ?? ''}`,
        variantId: target.variantId,
        orderId: String(order?.id ?? ''),
        initialRating: rating,
        initialReview: '',
        initialImages: [],
        isEdit: false,
      });
    },
    [reviewTarget, order, navigation],
  );

  // ── Effects ───────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingProductReview();
      if (
        pending?.variantId &&
        (!pending.orderId || String(pending.orderId) === String(order?.id ?? initialOrder?.id ?? ''))
      ) {
        applyLocalReview(pending);
      }
      if (!fromOrderSuccess) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true;
      });
      return () => sub.remove();
    }, [applyLocalReview, fromOrderSuccess, goBack, initialOrder?.id, order?.id]),
  );

  useEffect(() => {
    if (!initialOrder) return;
    reviewFetchAttemptedRef.current = new Set();
    setFetchedReviewsByVariant({});
    setOrder(initialOrder);
  }, [initialOrder?.id, initialOrder?.order_code]);

  useEffect(() => {
    const orderId = String(order?.id ?? '');
    const lineItems = Array.isArray(order?.items) ? order.items : [];
    if (!orderId || !lineItems.length) return;

    const targets = lineItems
      .map((item: any) => ({
        variantId: String(item?.variant?.variant_id ?? item?.variant_id ?? ''),
        isReviewed: item?.variant?.is_reviewed === true || item?.is_reviewed === true,
      }))
      .filter(
        (row: { variantId: string; isReviewed: boolean }) =>
          row.variantId && row.isReviewed && !reviewFetchAttemptedRef.current.has(row.variantId),
      );

    if (!targets.length) return;
    targets.forEach(({ variantId }: { variantId: string }) =>
      reviewFetchAttemptedRef.current.add(variantId),
    );

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        targets.map(async ({ variantId }: { variantId: string }) => {
          try {
            const res = await getReviewsAll({ entity_type: 'product', variant_id: variantId });
            const list = extractReviewsList(res);
            const forOrder = list.find((r: any) => String(r?.order_id ?? '') === orderId);
            return forOrder ? ([variantId, forOrder] as const) : null;
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      setFetchedReviewsByVariant(prev => {
        const next = { ...prev };
        entries.forEach(e => { if (e) next[e[0]] = e[1]; });
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [order?.id, order?.items]);

  useEffect(() => {
    if (!order?.id) return;
    refreshTracking();
    const interval = setInterval(refreshTracking, 30000);
    return () => clearInterval(interval);
  }, [order?.id, refreshTracking]);

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Order Details" onLeftPress={goBack} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Order details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Order Details" onLeftPress={goBack} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>ORDER ID</Text>
              <Text style={styles.heroOrderId}>#{order?.order_code ?? order?.id}</Text>
              <Text style={styles.heroDate}>
                {formatOrderDateTime(order?.created_at)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
              <Text style={[styles.statusText, { color: statusMeta.text }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          {/* Quick action strip */}
          <View style={styles.heroActions}>
            {canInvoice && (
              <TouchableOpacity
                style={styles.heroAction}
                onPress={handleInvoice}
                disabled={invoiceLoading}
                activeOpacity={0.8}
              >
                {invoiceLoading ? (
                  <ActivityIndicator size={16} color={Colors.primaryColor} />
                ) : (
                  <TablerIcon name="download" size={16} color={Colors.primaryColor} />
                )}
                <Text style={styles.heroActionText}>Invoice</Text>
              </TouchableOpacity>
            )}
            {canReturn && (
              <TouchableOpacity
                style={styles.heroAction}
                onPress={handleReturn}
                activeOpacity={0.8}
              >
                <TablerIcon name="refresh" size={16} color="#7C3AED" />
                <Text style={[styles.heroActionText, { color: '#7C3AED' }]}>Return</Text>
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity
                style={[styles.heroAction, styles.heroActionDanger]}
                onPress={() => setShowCancelModal(true)}
                disabled={cancelLoading}
                activeOpacity={0.8}
              >
                <TablerIcon name="x" size={16} color="#DC2626" />
                <Text style={[styles.heroActionText, { color: '#DC2626' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Tracking ── */}
        <View style={styles.sectionRow}>
          <SectionTitle title="Track Order" />
          <TouchableOpacity
            onPress={refreshTracking}
            disabled={trackingLoading}
            style={styles.refreshBtn}
          >
            {trackingLoading ? (
              <ActivityIndicator size={14} color={Colors.primaryColor} />
            ) : (
              <TablerIcon name="refresh" size={14} color={Colors.primaryColor} />
            )}
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {trackingSteps.map((step, idx) => {
            const isLastStep = idx === trackingSteps.length - 1;
            const isDelivered = step.key === 'delivered';
            // Only show yellow "in-progress" dot for intermediate active steps
            const showInProgress = step.active && !isDelivered && !isLastStep;
            return (
              <View key={step.key} style={styles.trackRow}>
                <View style={styles.trackLeft}>
                  <View
                    style={[
                      styles.trackDot,
                      step.completed && styles.trackDotDone,
                      showInProgress && styles.trackDotActive,
                      (step.key === 'cancelled') && styles.trackDotCancelled,
                    ]}
                  >
                    {(step.completed || step.active) && (
                      <TablerIcon
                        name={step.key === 'cancelled' ? 'x' : 'check'}
                        size={8}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  {idx < trackingSteps.length - 1 && (
                    <View
                      style={[styles.trackLine, step.completed && styles.trackLineDone]}
                    />
                  )}
                </View>
                <View style={styles.trackContent}>
                  <Text
                    style={[
                      styles.trackLabel,
                      (step.completed || step.active) && styles.trackLabelActive,
                      step.key === 'cancelled' && styles.trackLabelCancelled,
                      (step.key === 'delivered' && step.completed) && styles.trackLabelDelivered,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {!!step.subtitle && (
                    <Text style={styles.trackSub}>{step.subtitle}</Text>
                  )}
                  {!!step.date && <Text style={styles.trackDate}>{step.date}</Text>}
                </View>
              </View>
            );
          })}

          {/* Delivery partner */}
          {!!deliveryAgent && (
            <View style={styles.agentCard}>
              <View style={styles.agentIcon}>
                <TablerIcon name="truck" size={20} color={Colors.primaryColor} />
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentLabel}>Delivery Partner</Text>
                <Text style={styles.agentName}>
                  {deliveryAgent?.name ?? 'Delivery Partner'}
                </Text>
                {!!deliveryAgent?.phone && (
                  <Text style={styles.agentPhone}>{deliveryAgent.phone}</Text>
                )}
              </View>
              {!!deliveryAgent?.phone && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${deliveryAgent.phone}`)}
                >
                  <TablerIcon name="phone" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ETA / live location card */}
        {!!(
          order?.estimated_delivery_time ??
          order?.delivery_eta ??
          order?.current_location ??
          order?.tracking_location
        ) && (
            <View style={styles.etaCard}>
              <View style={styles.etaIconWrap}>
                <TablerIcon name="map-pin" size={18} color={Colors.primaryColor} />
              </View>
              <View style={styles.etaInfo}>
                {!!(order?.estimated_delivery_time ?? order?.delivery_eta) && (
                  <Text style={styles.etaText}>
                    Arriving by{' '}
                    {order?.estimated_delivery_time ?? order?.delivery_eta}
                  </Text>
                )}
                {!!(order?.current_location ?? order?.tracking_location) && (
                  <Text style={styles.etaLocation}>
                    {order?.current_location ?? order?.tracking_location}
                  </Text>
                )}
              </View>
            </View>
          )}

        {/* ── Delivery address ── */}
        {!!address && (
          <>
            <SectionTitle title="Delivery Address" />
            <View style={[styles.card, styles.addressCard]}>
              <View style={styles.addrIcon}>
                <TablerIcon name="map-pin" size={18} color={Colors.primaryColor} />
              </View>
              <View style={styles.addrContent}>
                <Text style={styles.addrTitle}>Delivering to</Text>
                <Text style={styles.addrText}>{address}</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Order info ── */}
        <SectionTitle title="Order Information" />
        <View style={styles.card}>
          <DetailRow label="Placed on" value={formatOrderDateTime(order?.created_at)} />
          <DetailRow label="Updated" value={formatOrderDateTime(order?.updated_at)} />
          <DetailRow label="Payment method" value={order?.payment_method ?? order?.payment_type} />
          <DetailRow label="Payment status" value={order?.payment_status} />
          <DetailRow label="Shipping method" value={order?.shipping_method} />
        </View>

        {/* ── Items ── */}
        <SectionTitle title={`Items (${items.length})`} />
        {items.map(item => {
          // Check all possible is_reviewed flags — any truthy means already rated
          const isReviewed =
            item.rated ||
            item?.raw?.variant?.is_reviewed === true ||
            item?.raw?.is_reviewed === true ||
            Boolean(fetchedReviewsByVariant[item.variantId]);

          return (
            <View key={item.id} style={styles.itemCard}>
              {/* Image + info row */}
              <View style={styles.itemRow}>
                <View style={styles.itemImgBox}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImg} />
                  ) : (
                    <View style={styles.itemImgFallback}>
                      <TablerIcon name="package" size={22} color={Colors.primaryColor} />
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.itemMeta}>
                    <View style={styles.itemQtyBadge}>
                      <Text style={styles.itemQtyText}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              </View>

              {/* Rating / review row */}
              {isReviewed ? (
                <View style={styles.ratedRow}>
                  <TablerIcon name="star-filled" size={13} color="#F59E0B" />
                  <Text style={styles.ratedText}>
                    {Number(item.review?.rating) > 0
                      ? `You rated ${item.review?.rating} ★`
                      : 'Review submitted'}
                  </Text>
                </View>
              ) : item.variantId && canReview ? (
                <TouchableOpacity
                  style={styles.rateBtn}
                  onPress={() => setReviewTarget(item)}
                  activeOpacity={0.85}
                >
                  <TablerIcon name="star" size={15} color={Colors.primaryColor} />
                  <Text style={styles.rateBtnText}>Rate & Review</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}

        {/* ── Payment summary ── */}
        <SectionTitle title="Payment Summary" />
        <View style={styles.card}>
          {paymentRows.map(row => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>{formatCurrency(order?.total_amount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Cancel modal ── */}
      {showCancelModal && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          {/* Dismiss on backdrop tap */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => {
              setShowCancelModal(false);
              setSelectedReason('');
              setCustomReason('');
            }}
          />

          <View style={styles.modalCard}>
            {/* Header row */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <TablerIcon name="alert-circle" size={22} color="#DC2626" />
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => {
                  setShowCancelModal(false);
                  setSelectedReason('');
                  setCustomReason('');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <TablerIcon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Cancel your order?</Text>
            <Text style={styles.modalSubtitle}>
              Please tell us why you want to cancel.
            </Text>

            {/* Scrollable reasons + text input */}
            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.reasonsList}>
                {CANCELLATION_REASONS.map(reason => {
                  const selected = selectedReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      style={[styles.reasonOption, selected && styles.reasonSelected]}
                      onPress={() => {
                        setSelectedReason(reason);
                        if (reason !== 'Other') setCustomReason('');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedReason === 'Other' && (
                <View style={styles.customReasonWrap}>
                  <TextInput
                    value={customReason}
                    onChangeText={setCustomReason}
                    placeholder="Enter your reason..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    maxLength={250}
                    style={styles.customReasonInput}
                    returnKeyType="done"
                    blurOnSubmit
                    textAlignVertical="top"
                    scrollEnabled={false}
                  />
                  <Text style={styles.charCount}>{customReason.length}/250</Text>
                </View>
              )}
            </ScrollView>

            {/* Pinned action buttons — always visible above keyboard */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.keepBtn}
                onPress={() => {
                  setShowCancelModal(false);
                  setSelectedReason('');
                  setCustomReason('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.keepBtnText}>Keep Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmCancelBtn,
                  (!finalReason || cancelLoading) && styles.confirmCancelBtnDisabled,
                ]}
                onPress={handleCancel}
                disabled={!finalReason || cancelLoading}
                activeOpacity={0.85}
              >
                {cancelLoading ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <>
                    <TablerIcon name="x" size={15} color="#FFFFFF" />
                    <Text style={styles.confirmCancelText}>Cancel Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      <FeedbackModal
        visible={!!reviewTarget && !reviewTarget.rated}
        isEdit={false}
        initialRating={0}
        onClose={() => setReviewTarget(null)}
        onContinue={openProductReview}
      />
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7F6' },

  scroll: { padding: 16 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748B', fontFamily: Fonts.PoppinsMedium },

  // ── Section title ─────────────────────────────────────────────────────────

  sectionTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 10,
    marginTop: 6,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  // ── Refresh ───────────────────────────────────────────────────────────────

  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  refreshBtnText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Hero card ─────────────────────────────────────────────────────────────

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4ECE8',
    marginBottom: 16,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  heroLeft: { flex: 1 },

  heroLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.8,
  },

  heroOrderId: {
    fontSize: 20,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 2,
  },

  heroDate: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  heroActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  heroAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E5E0',
    backgroundColor: '#F8FBFA',
  },

  heroActionDanger: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FECACA',
  },

  heroActionText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Card (generic) ────────────────────────────────────────────────────────

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4ECE8',
  },

  // ── Tracking ──────────────────────────────────────────────────────────────

  trackRow: { flexDirection: 'row', minHeight: 52 },

  trackLeft: { width: 28, alignItems: 'center' },

  trackDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  trackDotDone: { backgroundColor: Colors.primaryColor },
  trackDotActive: { backgroundColor: '#F59E0B' },
  trackDotCancelled: { backgroundColor: '#DC2626' },

  trackLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
    marginBottom: -2,
  },

  trackLineDone: { backgroundColor: '#B7D8CE' },

  trackContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 10,
  },

  trackLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  trackLabelActive: { color: '#0F172A' },
  trackLabelCancelled: { color: '#DC2626' },
  trackLabelDelivered: { color: '#166534' },

  trackSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },

  trackDate: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 3,
  },

  // ── Delivery agent ────────────────────────────────────────────────────────

  agentCard: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  agentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  agentInfo: { flex: 1, marginLeft: 12 },

  agentLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  agentName: {
    marginTop: 2,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  agentPhone: {
    marginTop: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── ETA / location ────────────────────────────────────────────────────────

  etaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4ECE8',
    flexDirection: 'row',
    alignItems: 'center',
  },

  etaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  etaInfo: { flex: 1, marginLeft: 12 },

  etaText: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  etaLocation: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  // ── Address ───────────────────────────────────────────────────────────────

  addressCard: { flexDirection: 'row', alignItems: 'flex-start' },

  addrIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addrContent: { flex: 1, marginLeft: 12 },

  addrTitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  addrText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },

  // ── Detail rows ───────────────────────────────────────────────────────────

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  detailValue: {
    flex: 1.2,
    fontSize: 13,
    color: '#0F172A',
    textAlign: 'right',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Items ─────────────────────────────────────────────────────────────────

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4ECE8',
  },

  itemRow: { flexDirection: 'row', alignItems: 'center' },

  itemImgBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginRight: 12,
  },

  itemImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  itemImgFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F2EF',
  },

  itemInfo: { flex: 1 },

  itemName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 20,
  },

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },

  itemQtyBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  itemQtyText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  itemSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 3,
  },

  itemPrice: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 6,
  },

  rateBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
    borderRadius: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FAF7',
  },

  rateBtnText: {
    color: Colors.primaryColor,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  ratedRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  ratedText: {
    color: '#92400E',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ── Summary ───────────────────────────────────────────────────────────────

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  summaryValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 5,
  },

  totalLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  totalValue: {
    fontSize: 17,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
  },

  // ── Cancel modal ──────────────────────────────────────────────────────────

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
    zIndex: 999,
    elevation: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
  },

  modalScroll: {
    flexGrow: 0,
    maxHeight: 340,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 19,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  modalSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 4,
    marginBottom: 18,
  },

  reasonsList: { marginBottom: 4 },

  reasonOption: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },

  reasonSelected: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F1F8F5',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  radioSelected: { borderColor: Colors.primaryColor },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryColor,
  },

  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },

  reasonTextSelected: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  customReasonWrap: { marginTop: 4, marginBottom: 4 },

  customReasonInput: {
    minHeight: 88,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#D8E2DE',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
    textAlignVertical: 'top',
  },

  charCount: {
    textAlign: 'right',
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 4,
  },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },

  keepBtn: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D8E2DE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  keepBtnText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  confirmCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  confirmCancelBtnDisabled: { backgroundColor: '#CBD5E1' },

  confirmCancelText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});




// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   StatusBar,
//   BackHandler,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Linking,
//   Platform,
//   PermissionsAndroid,
//   Dimensions,
//   Share,
//   KeyboardAvoidingView,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';
// import AppHeader from '../../components/AppHeader';
// import { Fonts } from '../../common/Fonts';
// import { Colors } from '../../common/Colors';
// import TablerIcon from '../../components/TablerIcon';
// import FeedbackModal from '../../components/FeedbackModal';
// import {
//   buildOrderTrackingSteps,
//   formatDeliveryAddress,
//   formatOrderDateTime,
//   getOrderItemReview,
//   isOrderItemRated,
// } from '../../utils/orderDetailUtils';
// import { getReviewsAll } from '../../services/ProductServices';
// import { getScreenBottomPadding } from '../../constants/layout';
// import { resolveProductImageUri } from '../../utils/imageUtils';
// import { extractReviewsList } from '../../utils/reviewUtils';
// import { consumePendingProductReview } from '../../utils/pendingProductReview';
// import { getStatusColor } from '../../common/DataInterface';
// import {
//   cancelOrder,
//   downloadInvoiceFile,
//   pollOrderTracking,
//   extractLiveTracking,
//   LiveTrackingInfo,
// } from '../../services/OrderService';
// import { Buffer } from 'buffer';
// import Toast from 'react-native-toast-message';
// import RNFS from 'react-native-fs';
// import FileViewer from 'react-native-file-viewer';

// const { width: SCREEN_W } = Dimensions.get('window');

// // ─── Types ──────────────────────────────────────────────────────────────────

// type OrderItemRow = {
//   id: string;
//   variantId: string;
//   name: string;
//   subtitle: string;
//   price: string;
//   image?: string;
//   raw: any;
//   rated: boolean;
//   review: {
//     rating: number;
//     review: string;
//     images: string[];
//     isRated: boolean;
//   } | null;
// };

// // ─── Status enums ────────────────────────────────────────────────────────────

// const ORDER_STATUS = {
//   PENDING: 'pending',
//   CONFIRMED: 'confirmed',
//   PROCESSING: 'processing',
//   PACKED: 'packed',
//   DISPATCHED: 'dispatched',
//   SHIPPED: 'shipped',
//   DELIVERED: 'delivered',
//   CANCELLED: 'cancelled',
//   RETURNED: 'returned',
// } as const;

// type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// const CANCEL_ALLOWED: OrderStatus[] = [
//   ORDER_STATUS.PENDING,
//   ORDER_STATUS.CONFIRMED,
//   ORDER_STATUS.PROCESSING,
//   ORDER_STATUS.PACKED,
// ];

// const INVOICE_ALLOWED: OrderStatus[] = [
//   ORDER_STATUS.PACKED,
//   ORDER_STATUS.DISPATCHED,
//   ORDER_STATUS.SHIPPED,
//   ORDER_STATUS.DELIVERED,
//   ORDER_STATUS.RETURNED,
// ];

// const RETURN_ALLOWED: OrderStatus[] = [
//   ORDER_STATUS.DELIVERED,
// ];

// const CANCELLATION_REASONS = [
//   'Changed my mind',
//   'Ordered by mistake',
//   'Found a better price',
//   'Product is no longer required',
//   'Other',
// ];

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const formatCurrency = (value?: string | number) => {
//   const num = Number(value ?? 0);
//   return `₹${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
// };

// const resolveOrderItemsTotal = (order: any): number => {
//   const candidates = [
//     order?.items_total,
//     order?.item_total,
//     order?.items_subtotal,
//     order?.products_total,
//     order?.subtotal,
//     order?.cart_subtotal,
//     order?.amount_items,
//   ];
//   for (const c of candidates) {
//     const n = Number(c);
//     if (Number.isFinite(n) && n > 0) return n;
//   }
//   const items = Array.isArray(order?.items) ? order.items : [];
//   const sum = items.reduce((acc: number, item: any) => {
//     const qty = Number(item?.quantity ?? 1) || 1;
//     const unit = Number(
//       item?.selling_price ?? item?.variant?.selling_price ?? item?.price ?? item?.unit_price ?? 0,
//     );
//     const line = Number(
//       item?.item_total ?? item?.line_total ?? item?.total ?? item?.subtotal ?? unit * qty,
//     );
//     return acc + (Number.isFinite(line) ? line : 0);
//   }, 0);
//   if (sum > 0) return sum;
//   const grand = Number(order?.total_amount ?? order?.grand_total ?? 0);
//   if (!Number.isFinite(grand) || grand <= 0) return 0;
//   const shipping = Number(order?.shipping_charges ?? 0) || 0;
//   const cod = Number(order?.cod_charges ?? 0) || 0;
//   const discount = Number(order?.total_discount ?? order?.discount ?? 0) || 0;
//   const derived = grand - shipping - cod + discount;
//   return derived > 0 ? derived : grand;
// };

// const mapOrderItems = (
//   order: any,
//   fetchedByVariant?: Record<string, any> | null,
// ): OrderItemRow[] => {
//   const items = Array.isArray(order?.items) ? order.items : [];
//   return items.map((item: any, index: number) => {
//     const review = getOrderItemReview(item, order, fetchedByVariant);
//     const qty = Number(item?.quantity ?? 1) || 1;
//     const unit = Number(
//       item?.selling_price ?? item?.variant?.selling_price ?? item?.price ?? item?.unit_price ?? 0,
//     );
//     const lineTotal = Number(
//       item?.item_total ?? item?.line_total ?? item?.total ?? unit * qty,
//     );
//     return {
//       id: String(item?.id ?? index),
//       variantId: String(item?.variant?.variant_id ?? item?.variant_id ?? ''),
//       name: String(item?.variant?.variant_title ?? item?.product_name ?? 'Product'),
//       subtitle: `Qty: ${qty}`,
//       price: formatCurrency(lineTotal > 0 ? lineTotal : unit),
//       image: resolveProductImageUri(item),
//       raw: item,
//       review,
//       rated: isOrderItemRated(item, order) || Boolean(review?.isRated),
//     };
//   });
// };

// // ─── Status label / color map ────────────────────────────────────────────────

// const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
//   pending:    { label: 'Pending',    bg: '#FEF9C3', text: '#854D0E' },
//   confirmed:  { label: 'Confirmed',  bg: '#DCFCE7', text: '#166534' },
//   processing: { label: 'Processing', bg: '#DBEAFE', text: '#1E40AF' },
//   packed:     { label: 'Packed',     bg: '#E0F2FE', text: '#0369A1' },
//   dispatched: { label: 'Dispatched', bg: '#EDE9FE', text: '#5B21B6' },
//   shipped:    { label: 'Shipped',    bg: '#FEF3C7', text: '#92400E' },
//   delivered:  { label: 'Delivered',  bg: '#DCFCE7', text: '#166534' },
//   cancelled:  { label: 'Cancelled',  bg: '#FEE2E2', text: '#991B1B' },
//   returned:   { label: 'Returned',   bg: '#F1F5F9', text: '#475569' },
// };

// const getStatusMeta = (status: string) =>
//   STATUS_META[status] ?? { label: status?.toUpperCase(), bg: '#F1F5F9', text: '#475569' };

// // ─── Small sub-components ─────────────────────────────────────────────────────

// const SectionTitle = ({ title }: { title: string }) => (
//   <Text style={styles.sectionTitle}>{title}</Text>
// );

// const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
//   if (value === undefined || value === null || value === '') return null;
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{String(value)}</Text>
//     </View>
//   );
// };

// // ─── Main screen ──────────────────────────────────────────────────────────────

// const OrderDetailsScreen = ({ route, navigation }: any) => {
//   const initialOrder = route?.params?.order;
//   const fromOrderSuccess = Boolean(route?.params?.fromOrderSuccess);
//   const insets = useSafeAreaInsets();
//   const bottomPadding = getScreenBottomPadding(insets);

//   const [order, setOrder] = useState<any>(initialOrder);
//   const [reviewTarget, setReviewTarget] = useState<OrderItemRow | null>(null);
//   const [trackingLoading, setTrackingLoading] = useState(false);
//   const [cancelLoading, setCancelLoading] = useState(false);
//   const [invoiceLoading, setInvoiceLoading] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [selectedReason, setSelectedReason] = useState('');
//   const [customReason, setCustomReason] = useState('');
//   const [liveTracking, setLiveTracking] = useState<LiveTrackingInfo | null>(null);
//   const liveTrackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const [fetchedReviewsByVariant, setFetchedReviewsByVariant] = useState<Record<string, any>>({});
//   const reviewFetchAttemptedRef = useRef<Set<string>>(new Set());

//   const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

//   // ── Derived state ──────────────────────────────────────────────────────────

//   const status = String(order?.order_status ?? '').toLowerCase() as OrderStatus;
//   const statusMeta = getStatusMeta(status);
//   const canCancel = CANCEL_ALLOWED.includes(status);
//   const canInvoice = INVOICE_ALLOWED.includes(status);
//   const canReturn = RETURN_ALLOWED.includes(status);
//   const canReview = status === ORDER_STATUS.DELIVERED;

//   const items = useMemo(
//     () => mapOrderItems(order, fetchedReviewsByVariant),
//     [order, fetchedReviewsByVariant],
//   );

//   const trackingSteps = useMemo(() => buildOrderTrackingSteps(order), [order]);
//   const address = formatDeliveryAddress(order?.delivery_address);

//   const paymentRows = useMemo(() => [
//     { label: 'Items total', value: formatCurrency(resolveOrderItemsTotal(order)) },
//     {
//       label: 'Shipping',
//       value: Number(order?.shipping_charges ?? 0) > 0
//         ? formatCurrency(order?.shipping_charges)
//         : 'Free',
//     },
//     {
//       label: 'Discount',
//       value: Number(order?.total_discount ?? 0) > 0
//         ? `- ${formatCurrency(order?.total_discount)}`
//         : undefined,
//     },
//     {
//       label: 'COD charges',
//       value: Number(order?.cod_charges ?? 0) > 0 ? formatCurrency(order?.cod_charges) : undefined,
//     },
//   ].filter(r => r.value != null), [order]);

//   const deliveryAgent =
//     order?.delivery_partner ?? order?.delivery_agent ?? order?.delivery_person ?? null;

//   // ── Handlers ──────────────────────────────────────────────────────────────

//   const goBack = useCallback(() => {
//     if (navigation.canGoBack?.()) {
//       navigation.goBack();
//     } else {
//       navigation.navigate('OrderHistory');
//     }
//   }, [navigation]);

//   const applyLocalReview = useCallback(
//     (payload: {
//       variantId: string;
//       orderId?: string;
//       rating: number;
//       review?: string;
//       image_urls?: string[];
//     }) => {
//       const vid = String(payload.variantId);
//       if (!vid) return;
//       reviewFetchAttemptedRef.current.add(vid);
//       setFetchedReviewsByVariant(prev => ({
//         ...prev,
//         [vid]: {
//           order_id: String(payload.orderId ?? order?.id ?? ''),
//           variant_id: vid,
//           rating: Number(payload.rating ?? 0),
//           review: String(payload.review ?? ''),
//           image_urls: Array.isArray(payload.image_urls) ? payload.image_urls : [],
//           is_reviewed: true,
//         },
//       }));
//       setOrder((prev: any) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           items: (Array.isArray(prev.items) ? prev.items : []).map((item: any) => {
//             const itemVid = String(item?.variant?.variant_id ?? item?.variant_id ?? '');
//             if (itemVid !== vid) return item;
//             return { ...item, is_reviewed: true, variant: { ...(item?.variant ?? {}), is_reviewed: true } };
//           }),
//         };
//       });
//     },
//     [order?.id],
//   );

//   const refreshTracking = useCallback(async (silent = false) => {
//     if (!order?.id) return;
//     try {
//       if (!silent) setTrackingLoading(true);
//       const res = await pollOrderTracking(order.id);
//       const updated = res?.data?.data ?? res?.data ?? res;
//       if (updated) setOrder((prev: any) => ({ ...prev, ...updated }));
//       // Extract live tracking info (tracking_number + carrier details)
//       const tracking = extractLiveTracking(res);
//       if (tracking) setLiveTracking(tracking);
//     } catch {
//       // silent
//     } finally {
//       if (!silent) setTrackingLoading(false);
//     }
//   }, [order?.id]);

//   // Auto-poll every 30s when order is in-transit / out-for-delivery
//   useEffect(() => {
//     const liveStatuses = ['shipped', 'dispatched', 'out_for_delivery', 'in_transit'];
//     const isLive = liveStatuses.includes(String(order?.order_status ?? '').toLowerCase());
//     if (isLive) {
//       // Initial fetch
//       refreshTracking(true);
//       liveTrackingIntervalRef.current = setInterval(() => {
//         refreshTracking(true);
//       }, 30_000);
//     }
//     return () => {
//       if (liveTrackingIntervalRef.current) {
//         clearInterval(liveTrackingIntervalRef.current);
//         liveTrackingIntervalRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [order?.order_status]);

//   const handleCancel = useCallback(async () => {
//     if (!order?.id || cancelLoading || !finalReason || !canCancel) return;
//     try {
//       setCancelLoading(true);
//       const res = await cancelOrder(order.id, { cancellation_reason: finalReason });
//       const updated = res?.data?.data ?? res?.data ?? res;
//       setOrder((prev: any) => ({
//         ...prev,
//         ...(updated || {}),
//         order_status: updated?.order_status ?? ORDER_STATUS.CANCELLED,
//       }));
//       setShowCancelModal(false);
//       setSelectedReason('');
//       setCustomReason('');
//       Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
//     } catch (error: any) {
//       Alert.alert(
//         'Unable to Cancel',
//         error?.response?.data?.message ?? 'Unable to cancel this order. Please try again.',
//       );
//     } finally {
//       setCancelLoading(false);
//     }
//   }, [order?.id, cancelLoading, finalReason, canCancel]);

//   const handleInvoice = useCallback(async () => {
//     if (!order?.id || invoiceLoading) return;
//     try {
//       setInvoiceLoading(true);
//       const response = await downloadInvoiceFile(order.id);
//       if (!response?.success || response.status !== 200 || !response.data) {
//         throw new Error('Invoice PDF data not found');
//       }

//       const base64 = Buffer.from(new Uint8Array(response.data)).toString('base64');
//       const fileName = `Invoice_${order?.order_code ?? order.id}.pdf`;

//       // Save to a persistent, user-accessible location
//       // (Android often needs runtime permission and also may vary by RNFS version.)
//       if (Platform.OS === 'android') {
//         try {
//           const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//             {
//               title: 'Storage permission',
//               message: 'We need storage access to save your invoice PDF.',
//               buttonNeutral: 'Ask Me Later',
//               buttonNegative: 'Cancel',
//               buttonPositive: 'OK',
//             },
//           );
//           if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//             // Continue; we'll still try DocumentDirectoryPath as fallback.
//           }
//         } catch {
//           // ignore permission errors; we'll use fallback directories
//         }
//       }

//       const preferredDir =
//         Platform.OS === 'android'
//           ? // Visible in Android “Downloads”/Files app on most devices
//             (RNFS.DownloadDirectoryPath ||
//               // fallback for some RNFS builds
//               (RNFS.ExternalDirectoryPath as unknown as string) ||
//               RNFS.DocumentDirectoryPath)
//           : RNFS.DocumentDirectoryPath;

//       const fallbackDir = RNFS.DocumentDirectoryPath;

//       const saveToDir = async (dir: string) => {
//         if (!dir) throw new Error('No save directory found');
//         if (!(await RNFS.exists(dir))) {
//           await RNFS.mkdir(dir);
//         }
//         const filePath = `${dir}/${fileName}`;
//         await RNFS.writeFile(filePath, base64, 'base64');
//         const exists = await RNFS.exists(filePath);
//         if (!exists) throw new Error('Invoice file was not saved');
//         return filePath;
//       };

//       let filePath = '';
//       let savedLabel = '';
//       try {
//         filePath = await saveToDir(String(preferredDir));
//         savedLabel = Platform.OS === 'android' ? 'Downloads' : 'Files';
//       } catch {
//         filePath = await saveToDir(String(fallbackDir));
//         savedLabel = 'Files';
//       }

//       // Open directly (UX) — file is already saved to device storage.
//       try {
//         await FileViewer.open(filePath, { showOpenWithDialog: true });
//       } catch {
//         await Share.share({
//           title: fileName,
//           url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
//           message: `Invoice for order #${order?.order_code ?? order.id}`,
//         });
//       }

//       Toast.show({
//         type: 'success',
//         text1: 'Invoice saved',
//         text2: `Saved to ${savedLabel}`,
//       });
//     } catch (err: any) {
//       Toast.show({
//         type: 'error',
//         text1: 'Invoice download failed',
//         text2: err?.message ?? 'Please try again',
//       });
//     } finally {
//       setInvoiceLoading(false);
//     }
//   }, [order?.id, order?.order_code, invoiceLoading]);

//   const handleReturn = useCallback(() => {
//     Alert.alert(
//       'Return Order',
//       'Return/exchange requests are handled by our support team. Would you like to contact us?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Contact Support',
//           onPress: () => Linking.openURL('mailto:support@ayurmuni.com'),
//         },
//       ],
//     );
//   }, []);

//   const openProductReview = useCallback(
//     (rating: number) => {
//       if (!reviewTarget?.variantId) return;
//       if (reviewTarget.rated || reviewTarget.raw?.variant?.is_reviewed === true) {
//         setReviewTarget(null);
//         return;
//       }
//       const target = reviewTarget;
//       setReviewTarget(null);
//       navigation.navigate('ShareExperienceScreen', {
//         entityType: 'product',
//         entityName: target.name,
//         entitySubtitle: `Order #${order?.order_code ?? order?.id ?? ''}`,
//         variantId: target.variantId,
//         orderId: String(order?.id ?? ''),
//         initialRating: rating,
//         initialReview: '',
//         initialImages: [],
//         isEdit: false,
//       });
//     },
//     [reviewTarget, order, navigation],
//   );

//   // ── Effects ───────────────────────────────────────────────────────────────

//   useFocusEffect(
//     useCallback(() => {
//       const pending = consumePendingProductReview();
//       if (
//         pending?.variantId &&
//         (!pending.orderId || String(pending.orderId) === String(order?.id ?? initialOrder?.id ?? ''))
//       ) {
//         applyLocalReview(pending);
//       }
//       if (!fromOrderSuccess) return undefined;
//       const sub = BackHandler.addEventListener('hardwareBackPress', () => {
//         goBack();
//         return true;
//       });
//       return () => sub.remove();
//     }, [applyLocalReview, fromOrderSuccess, goBack, initialOrder?.id, order?.id]),
//   );

//   useEffect(() => {
//     if (!initialOrder) return;
//     reviewFetchAttemptedRef.current = new Set();
//     setFetchedReviewsByVariant({});
//     setOrder(initialOrder);
//   }, [initialOrder?.id, initialOrder?.order_code]);

//   useEffect(() => {
//     const orderId = String(order?.id ?? '');
//     const lineItems = Array.isArray(order?.items) ? order.items : [];
//     if (!orderId || !lineItems.length) return;

//     const targets = lineItems
//       .map((item: any) => ({
//         variantId: String(item?.variant?.variant_id ?? item?.variant_id ?? ''),
//         isReviewed: item?.variant?.is_reviewed === true || item?.is_reviewed === true,
//       }))
//       .filter(
//         (row: { variantId: string; isReviewed: boolean }) =>
//           row.variantId && row.isReviewed && !reviewFetchAttemptedRef.current.has(row.variantId),
//       );

//     if (!targets.length) return;
//     targets.forEach(({ variantId }: { variantId: string }) =>
//       reviewFetchAttemptedRef.current.add(variantId),
//     );

//     let cancelled = false;
//     (async () => {
//       const entries = await Promise.all(
//         targets.map(async ({ variantId }: { variantId: string }) => {
//           try {
//             const res = await getReviewsAll({ entity_type: 'product', variant_id: variantId });
//             const list = extractReviewsList(res);
//             const forOrder = list.find((r: any) => String(r?.order_id ?? '') === orderId);
//             return forOrder ? ([variantId, forOrder] as const) : null;
//           } catch {
//             return null;
//           }
//         }),
//       );
//       if (cancelled) return;
//       setFetchedReviewsByVariant(prev => {
//         const next = { ...prev };
//         entries.forEach(e => { if (e) next[e[0]] = e[1]; });
//         return next;
//       });
//     })();
//     return () => { cancelled = true; };
//   }, [order?.id, order?.items]);

//   useEffect(() => {
//     if (!order?.id) return;
//     refreshTracking();
//     const interval = setInterval(refreshTracking, 30000);
//     return () => clearInterval(interval);
//   }, [order?.id, refreshTracking]);

//   // ── Empty state ───────────────────────────────────────────────────────────

//   if (!order) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <AppHeader title="Order Details" onLeftPress={goBack} />
//         <View style={styles.emptyWrap}>
//           <Text style={styles.emptyText}>Order details not found.</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ── Render ────────────────────────────────────────────────────────────────

//   return (
//     <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//       <AppHeader title="Order Details" onLeftPress={goBack} />

//       <ScrollView
//         contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── Hero ── */}
//         <View style={styles.heroCard}>
//           <View style={styles.heroTop}>
//             <View style={styles.heroLeft}>
//               <Text style={styles.heroLabel}>ORDER ID</Text>
//               <Text style={styles.heroOrderId}>#{order?.order_code ?? order?.id}</Text>
//               <Text style={styles.heroDate}>
//                 {formatOrderDateTime(order?.created_at)}
//               </Text>
//             </View>
//             <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
//               <Text style={[styles.statusText, { color: statusMeta.text }]}>
//                 {statusMeta.label}
//               </Text>
//             </View>
//           </View>

//           {/* Quick action strip */}
//           <View style={styles.heroActions}>
//             {canInvoice && (
//               <TouchableOpacity
//                 style={styles.heroAction}
//                 onPress={handleInvoice}
//                 disabled={invoiceLoading}
//                 activeOpacity={0.8}
//               >
//                 {invoiceLoading ? (
//                   <ActivityIndicator size={16} color={Colors.primaryColor} />
//                 ) : (
//                   <TablerIcon name="download" size={16} color={Colors.primaryColor} />
//                 )}
//                 <Text style={styles.heroActionText}>Invoice</Text>
//               </TouchableOpacity>
//             )}
//             {canReturn && (
//               <TouchableOpacity
//                 style={styles.heroAction}
//                 onPress={handleReturn}
//                 activeOpacity={0.8}
//               >
//                 <TablerIcon name="refresh" size={16} color="#7C3AED" />
//                 <Text style={[styles.heroActionText, { color: '#7C3AED' }]}>Return</Text>
//               </TouchableOpacity>
//             )}
//             {canCancel && (
//               <TouchableOpacity
//                 style={[styles.heroAction, styles.heroActionDanger]}
//                 onPress={() => setShowCancelModal(true)}
//                 disabled={cancelLoading}
//                 activeOpacity={0.8}
//               >
//                 <TablerIcon name="x" size={16} color="#DC2626" />
//                 <Text style={[styles.heroActionText, { color: '#DC2626' }]}>Cancel</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         {/* ── Tracking ── */}
//         <View style={styles.sectionRow}>
//           <SectionTitle title="Track Order" />
//           <TouchableOpacity
//             onPress={refreshTracking}
//             disabled={trackingLoading}
//             style={styles.refreshBtn}
//           >
//             {trackingLoading ? (
//               <ActivityIndicator size={14} color={Colors.primaryColor} />
//             ) : (
//               <TablerIcon name="refresh" size={14} color={Colors.primaryColor} />
//             )}
//             <Text style={styles.refreshBtnText}>Refresh</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.card}>
//           {trackingSteps.map((step, idx) => {
//             const isLastStep = idx === trackingSteps.length - 1;
//             const isDelivered = step.key === 'delivered';
//             // Only show yellow "in-progress" dot for intermediate active steps
//             const showInProgress = step.active && !isDelivered && !isLastStep;
//             return (
//             <View key={step.key} style={styles.trackRow}>
//               <View style={styles.trackLeft}>
//                 <View
//                   style={[
//                     styles.trackDot,
//                     step.completed && styles.trackDotDone,
//                     showInProgress && styles.trackDotActive,
//                     (step.key === 'cancelled') && styles.trackDotCancelled,
//                   ]}
//                 >
//                   {(step.completed || step.active) && (
//                     <TablerIcon
//                       name={step.key === 'cancelled' ? 'x' : 'check'}
//                       size={8}
//                       color="#FFFFFF"
//                     />
//                   )}
//                 </View>
//                 {idx < trackingSteps.length - 1 && (
//                   <View
//                     style={[styles.trackLine, step.completed && styles.trackLineDone]}
//                   />
//                 )}
//               </View>
//               <View style={styles.trackContent}>
//                 <Text
//                   style={[
//                     styles.trackLabel,
//                     (step.completed || step.active) && styles.trackLabelActive,
//                     step.key === 'cancelled' && styles.trackLabelCancelled,
//                     (step.key === 'delivered' && step.completed) && styles.trackLabelDelivered,
//                   ]}
//                 >
//                   {step.label}
//                 </Text>
//                 {!!step.subtitle && (
//                   <Text style={styles.trackSub}>{step.subtitle}</Text>
//                 )}
//                 {!!step.date && <Text style={styles.trackDate}>{step.date}</Text>}
//               </View>
//             </View>
//             );
//           })}

//           {/* Delivery partner */}
//           {!!deliveryAgent && (
//             <View style={styles.agentCard}>
//               <View style={styles.agentIcon}>
//                 <TablerIcon name="truck" size={20} color={Colors.primaryColor} />
//               </View>
//               <View style={styles.agentInfo}>
//                 <Text style={styles.agentLabel}>Delivery Partner</Text>
//                 <Text style={styles.agentName}>
//                   {deliveryAgent?.name ?? 'Delivery Partner'}
//                 </Text>
//                 {!!deliveryAgent?.phone && (
//                   <Text style={styles.agentPhone}>{deliveryAgent.phone}</Text>
//                 )}
//               </View>
//               {!!deliveryAgent?.phone && (
//                 <TouchableOpacity
//                   style={styles.callBtn}
//                   onPress={() => Linking.openURL(`tel:${deliveryAgent.phone}`)}
//                 >
//                   <TablerIcon name="phone" size={18} color="#FFFFFF" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
//         </View>

//         {/* ── Live Tracking Card (shown when shipment is on the way) ── */}
//         {!!liveTracking && (
//           <View style={styles.liveTrackCard}>
//             {/* Header */}
//             <View style={styles.liveTrackHeader}>
//               <View style={styles.livePulseDot} />
//               <Text style={styles.liveTrackTitle}>Live Tracking</Text>
//               {!!liveTracking.carrier && (
//                 <View style={styles.carrierBadge}>
//                   <Text style={styles.carrierBadgeText}>{liveTracking.carrier}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Tracking number */}
//             <View style={styles.trackNumRow}>
//               <TablerIcon name="barcode" size={15} color="#64748B" />
//               <Text style={styles.trackNumLabel}>Tracking No.</Text>
//               <Text style={styles.trackNumValue} numberOfLines={1}>
//                 {liveTracking.trackingNumber}
//               </Text>
//             </View>

//             {/* ETA row */}
//             {!!liveTracking.eta && (
//               <View style={styles.liveEtaRow}>
//                 <TablerIcon name="clock" size={15} color={Colors.primaryColor} />
//                 <Text style={styles.liveEtaText}>
//                   Expected by <Text style={styles.liveEtaBold}>{liveTracking.eta}</Text>
//                 </Text>
//               </View>
//             )}

//             {/* Current location */}
//             {!!liveTracking.currentLocation && (
//               <View style={styles.liveLocRow}>
//                 <TablerIcon name="map-pin" size={15} color="#10B981" />
//                 <Text style={styles.liveLocText}>{liveTracking.currentLocation}</Text>
//               </View>
//             )}

//             {/* Location history mini-timeline */}
//             {liveTracking.locationHistory.length > 0 && (
//               <View style={styles.liveHistoryWrap}>
//                 <Text style={styles.liveHistoryTitle}>Shipment Updates</Text>
//                 {liveTracking.locationHistory.map((event, idx) => (
//                   <View key={idx} style={styles.liveHistoryRow}>
//                     <View style={styles.liveHistoryLeft}>
//                       <View
//                         style={[
//                           styles.liveHistoryDot,
//                           event.active && styles.liveHistoryDotActive,
//                         ]}
//                       />
//                       {idx < liveTracking.locationHistory.length - 1 && (
//                         <View style={styles.liveHistoryLine} />
//                       )}
//                     </View>
//                     <View style={styles.liveHistoryContent}>
//                       <Text
//                         style={[
//                           styles.liveHistoryLabel,
//                           event.active && styles.liveHistoryLabelActive,
//                         ]}
//                         numberOfLines={2}
//                       >
//                         {event.label}
//                       </Text>
//                       {!!event.time && (
//                         <Text style={styles.liveHistoryTime}>{event.time}</Text>
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             )}

//             {/* Delivery agent */}
//             {!!liveTracking.agentName && (
//               <View style={styles.liveAgentRow}>
//                 <View style={styles.liveAgentAvatar}>
//                   <TablerIcon name="user" size={16} color={Colors.primaryColor} />
//                 </View>
//                 <View style={styles.liveAgentInfo}>
//                   <Text style={styles.liveAgentName}>{liveTracking.agentName}</Text>
//                   <Text style={styles.liveAgentRole}>Delivery Partner</Text>
//                 </View>
//                 {!!liveTracking.agentPhone && (
//                   <TouchableOpacity
//                     style={styles.liveCallBtn}
//                     onPress={() => Linking.openURL(`tel:${liveTracking.agentPhone}`)}
//                     activeOpacity={0.8}
//                   >
//                     <TablerIcon name="phone" size={16} color="#FFFFFF" />
//                     <Text style={styles.liveCallText}>Call</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             )}

//             {/* Last updated */}
//             {!!liveTracking.lastUpdated && (
//               <Text style={styles.liveUpdatedText}>
//                 Updated {liveTracking.lastUpdated}
//               </Text>
//             )}
//           </View>
//         )}

//         {/* ── Delivery address ── */}
//         {!!address && (
//           <>
//             <SectionTitle title="Delivery Address" />
//             <View style={[styles.card, styles.addressCard]}>
//               <View style={styles.addrIcon}>
//                 <TablerIcon name="map-pin" size={18} color={Colors.primaryColor} />
//               </View>
//               <View style={styles.addrContent}>
//                 <Text style={styles.addrTitle}>Delivering to</Text>
//                 <Text style={styles.addrText}>{address}</Text>
//               </View>
//             </View>
//           </>
//         )}

//         {/* ── Order info ── */}
//         <SectionTitle title="Order Information" />
//         <View style={styles.card}>
//           <DetailRow label="Placed on" value={formatOrderDateTime(order?.created_at)} />
//           <DetailRow label="Updated" value={formatOrderDateTime(order?.updated_at)} />
//           <DetailRow label="Payment method" value={order?.payment_method ?? order?.payment_type} />
//           <DetailRow label="Payment status" value={order?.payment_status} />
//           <DetailRow label="Shipping method" value={order?.shipping_method} />
//         </View>

//         {/* ── Items ── */}
//         <SectionTitle title={`Items (${items.length})`} />
//         {items.map(item => {
//           // Check all possible is_reviewed flags — any truthy means already rated
//           const isReviewed =
//             item.rated ||
//             item?.raw?.variant?.is_reviewed === true ||
//             item?.raw?.is_reviewed === true ||
//             Boolean(fetchedReviewsByVariant[item.variantId]);

//           return (
//           <View key={item.id} style={styles.itemCard}>
//             {/* Image + info row */}
//             <View style={styles.itemRow}>
//               <View style={styles.itemImgBox}>
//                 {item.image ? (
//                   <Image source={{ uri: item.image }} style={styles.itemImg} />
//                 ) : (
//                   <View style={styles.itemImgFallback}>
//                     <TablerIcon name="package" size={22} color={Colors.primaryColor} />
//                   </View>
//                 )}
//               </View>
//               <View style={styles.itemInfo}>
//                 <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
//                 <View style={styles.itemMeta}>
//                   <View style={styles.itemQtyBadge}>
//                     <Text style={styles.itemQtyText}>{item.subtitle}</Text>
//                   </View>
//                 </View>
//                 <Text style={styles.itemPrice}>{item.price}</Text>
//               </View>
//             </View>

//             {/* Rating / review row */}
//             {isReviewed ? (
//               <View style={styles.ratedRow}>
//                 <TablerIcon name="star-filled" size={13} color="#F59E0B" />
//                 <Text style={styles.ratedText}>
//                   {Number(item.review?.rating) > 0
//                     ? `You rated ${item.review?.rating} ★`
//                     : 'Review submitted'}
//                 </Text>
//               </View>
//             ) : item.variantId && canReview ? (
//               <TouchableOpacity
//                 style={styles.rateBtn}
//                 onPress={() => setReviewTarget(item)}
//                 activeOpacity={0.85}
//               >
//                 <TablerIcon name="star" size={15} color={Colors.primaryColor} />
//                 <Text style={styles.rateBtnText}>Rate & Review</Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//           );
//         })}

//         {/* ── Payment summary ── */}
//         <SectionTitle title="Payment Summary" />
//         <View style={styles.card}>
//           {paymentRows.map(row => (
//             <View key={row.label} style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>{row.label}</Text>
//               <Text style={styles.summaryValue}>{row.value}</Text>
//             </View>
//           ))}
//           <View style={styles.summaryDivider} />
//           <View style={styles.summaryRow}>
//             <Text style={styles.totalLabel}>Total paid</Text>
//             <Text style={styles.totalValue}>{formatCurrency(order?.total_amount)}</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* ── Cancel modal ── */}
//       {showCancelModal && (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.modalOverlay}
//         >
//           {/* Dismiss on backdrop tap */}
//           <TouchableOpacity
//             style={StyleSheet.absoluteFillObject}
//             activeOpacity={1}
//             onPress={() => {
//               setShowCancelModal(false);
//               setSelectedReason('');
//               setCustomReason('');
//             }}
//           />

//           <View style={styles.modalCard}>
//             {/* Header row */}
//             <View style={styles.modalHeader}>
//               <View style={styles.modalIconCircle}>
//                 <TablerIcon name="alert-circle" size={22} color="#DC2626" />
//               </View>
//               <TouchableOpacity
//                 style={styles.modalClose}
//                 onPress={() => {
//                   setShowCancelModal(false);
//                   setSelectedReason('');
//                   setCustomReason('');
//                 }}
//                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//               >
//                 <TablerIcon name="x" size={20} color="#64748B" />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.modalTitle}>Cancel your order?</Text>
//             <Text style={styles.modalSubtitle}>
//               Please tell us why you want to cancel.
//             </Text>

//             {/* Scrollable reasons + text input */}
//             <ScrollView
//               style={styles.modalScroll}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.reasonsList}>
//                 {CANCELLATION_REASONS.map(reason => {
//                   const selected = selectedReason === reason;
//                   return (
//                     <TouchableOpacity
//                       key={reason}
//                       style={[styles.reasonOption, selected && styles.reasonSelected]}
//                       onPress={() => {
//                         setSelectedReason(reason);
//                         if (reason !== 'Other') setCustomReason('');
//                       }}
//                       activeOpacity={0.8}
//                     >
//                       <View style={[styles.radio, selected && styles.radioSelected]}>
//                         {selected && <View style={styles.radioInner} />}
//                       </View>
//                       <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>
//                         {reason}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>

//               {selectedReason === 'Other' && (
//                 <View style={styles.customReasonWrap}>
//                   <TextInput
//                     value={customReason}
//                     onChangeText={setCustomReason}
//                     placeholder="Enter your reason..."
//                     placeholderTextColor="#94A3B8"
//                     multiline
//                     maxLength={250}
//                     style={styles.customReasonInput}
//                     returnKeyType="done"
//                     blurOnSubmit
//                     textAlignVertical="top"
//                     scrollEnabled={false}
//                   />
//                   <Text style={styles.charCount}>{customReason.length}/250</Text>
//                 </View>
//               )}
//             </ScrollView>

//             {/* Pinned action buttons — always visible above keyboard */}
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.keepBtn}
//                 onPress={() => {
//                   setShowCancelModal(false);
//                   setSelectedReason('');
//                   setCustomReason('');
//                 }}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.keepBtnText}>Keep Order</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.confirmCancelBtn,
//                   (!finalReason || cancelLoading) && styles.confirmCancelBtnDisabled,
//                 ]}
//                 onPress={handleCancel}
//                 disabled={!finalReason || cancelLoading}
//                 activeOpacity={0.85}
//               >
//                 {cancelLoading ? (
//                   <ActivityIndicator size={16} color="#FFFFFF" />
//                 ) : (
//                   <>
//                     <TablerIcon name="x" size={15} color="#FFFFFF" />
//                     <Text style={styles.confirmCancelText}>Cancel Order</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       )}

//       <FeedbackModal
//         visible={!!reviewTarget && !reviewTarget.rated}
//         isEdit={false}
//         initialRating={0}
//         onClose={() => setReviewTarget(null)}
//         onContinue={openProductReview}
//       />
//     </SafeAreaView>
//   );
// };

// export default OrderDetailsScreen;

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#F4F7F6' },

//   scroll: { padding: 16 },

//   emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   emptyText: { color: '#64748B', fontFamily: Fonts.PoppinsMedium },

//   // ── Section title ─────────────────────────────────────────────────────────

//   sectionTitle: {
//     fontSize: 15,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//     marginBottom: 10,
//     marginTop: 6,
//   },

//   sectionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },

//   // ── Refresh ───────────────────────────────────────────────────────────────

//   refreshBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//   },

//   refreshBtnText: {
//     fontSize: 12,
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   // ── Hero card ─────────────────────────────────────────────────────────────

//   heroCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#E4ECE8',
//     marginBottom: 16,
//   },

//   heroTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },

//   heroLeft: { flex: 1 },

//   heroLabel: {
//     fontSize: 10,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//     letterSpacing: 0.8,
//   },

//   heroOrderId: {
//     fontSize: 20,
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//     marginTop: 2,
//   },

//   heroDate: {
//     fontSize: 11,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//     marginTop: 3,
//   },

//   statusBadge: {
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     alignSelf: 'flex-start',
//   },

//   statusText: {
//     fontSize: 11,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   heroActions: {
//     flexDirection: 'row',
//     gap: 8,
//     marginTop: 14,
//   },

//   heroAction: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 9,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#D7E5E0',
//     backgroundColor: '#F8FBFA',
//   },

//   heroActionDanger: {
//     backgroundColor: '#FFF7F7',
//     borderColor: '#FECACA',
//   },

//   heroActionText: {
//     fontSize: 12,
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   // ── Card (generic) ────────────────────────────────────────────────────────

//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E4ECE8',
//   },

//   // ── Tracking ──────────────────────────────────────────────────────────────

//   trackRow: { flexDirection: 'row', minHeight: 52 },

//   trackLeft: { width: 28, alignItems: 'center' },

//   trackDot: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#CBD5E1',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 2,
//   },

//   trackDotDone: { backgroundColor: Colors.primaryColor },
//   trackDotActive: { backgroundColor: '#F59E0B' },
//   trackDotCancelled: { backgroundColor: '#DC2626' },

//   trackLine: {
//     width: 2,
//     flex: 1,
//     backgroundColor: '#E2E8F0',
//     marginTop: 2,
//     marginBottom: -2,
//   },

//   trackLineDone: { backgroundColor: '#B7D8CE' },

//   trackContent: {
//     flex: 1,
//     paddingLeft: 10,
//     paddingBottom: 10,
//   },

//   trackLabel: {
//     fontSize: 14,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   trackLabelActive: { color: '#0F172A' },
//   trackLabelCancelled: { color: '#DC2626' },
//   trackLabelDelivered: { color: '#166534' },

//   trackSub: {
//     fontSize: 12,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//     marginTop: 2,
//   },

//   trackDate: {
//     fontSize: 11,
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsMedium,
//     marginTop: 3,
//   },

//   // ── Delivery agent ────────────────────────────────────────────────────────

//   agentCard: {
//     marginTop: 10,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#EEF2F0',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   agentIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#E8F4F0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   agentInfo: { flex: 1, marginLeft: 12 },

//   agentLabel: {
//     fontSize: 11,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   agentName: {
//     marginTop: 2,
//     fontSize: 14,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   agentPhone: {
//     marginTop: 1,
//     fontSize: 12,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   callBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: Colors.primaryColor,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   // ── ETA / location ────────────────────────────────────────────────────────

//   etaCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E4ECE8',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   etaIconWrap: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: '#E8F4F0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   etaInfo: { flex: 1, marginLeft: 12 },

//   etaText: {
//     fontSize: 14,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   etaLocation: {
//     marginTop: 2,
//     fontSize: 12,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   // ── Live Tracking ────────────────────────────────────────────────────────

//   liveTrackCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1.5,
//     borderColor: Colors.primaryColor + '33',
//   },

//   liveTrackHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },

//   livePulseDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#10B981',
//     marginRight: 8,
//   },

//   liveTrackTitle: {
//     fontSize: 14,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//     flex: 1,
//   },

//   carrierBadge: {
//     backgroundColor: '#EDE9FE',
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },

//   carrierBadgeText: {
//     fontSize: 11,
//     color: '#5B21B6',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   trackNumRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 10,
//     gap: 6,
//   },

//   trackNumLabel: {
//     fontSize: 12,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   trackNumValue: {
//     flex: 1,
//     fontSize: 12,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//     textAlign: 'right',
//   },

//   liveEtaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 8,
//   },

//   liveEtaText: {
//     fontSize: 13,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsRegular,
//   },

//   liveEtaBold: {
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.primaryColor,
//   },

//   liveLocRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 12,
//   },

//   liveLocText: {
//     flex: 1,
//     fontSize: 13,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   liveHistoryWrap: {
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F9',
//     paddingTop: 12,
//     marginBottom: 12,
//   },

//   liveHistoryTitle: {
//     fontSize: 12,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//     marginBottom: 10,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },

//   liveHistoryRow: {
//     flexDirection: 'row',
//     minHeight: 36,
//   },

//   liveHistoryLeft: {
//     width: 20,
//     alignItems: 'center',
//   },

//   liveHistoryDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#CBD5E1',
//     marginTop: 4,
//   },

//   liveHistoryDotActive: {
//     backgroundColor: '#10B981',
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//   },

//   liveHistoryLine: {
//     flex: 1,
//     width: 1.5,
//     backgroundColor: '#E2E8F0',
//     marginTop: 2,
//   },

//   liveHistoryContent: {
//     flex: 1,
//     paddingLeft: 10,
//     paddingBottom: 10,
//   },

//   liveHistoryLabel: {
//     fontSize: 12,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsRegular,
//   },

//   liveHistoryLabelActive: {
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   liveHistoryTime: {
//     fontSize: 11,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsRegular,
//     marginTop: 1,
//   },

//   liveAgentRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0FDF4',
//     borderRadius: 10,
//     padding: 10,
//     gap: 10,
//     marginBottom: 10,
//   },

//   liveAgentAvatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#DCFCE7',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   liveAgentInfo: { flex: 1 },

//   liveAgentName: {
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: '#0F172A',
//   },

//   liveAgentRole: {
//     fontSize: 11,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsRegular,
//   },

//   liveCallBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#10B981',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     gap: 4,
//   },

//   liveCallText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   liveUpdatedText: {
//     fontSize: 11,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsRegular,
//     textAlign: 'right',
//     marginTop: 4,
//   },

//   // ── Address ───────────────────────────────────────────────────────────────

//   addressCard: { flexDirection: 'row', alignItems: 'flex-start' },

//   addrIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#E8F4F0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   addrContent: { flex: 1, marginLeft: 12 },

//   addrTitle: {
//     fontSize: 11,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   addrText: {
//     marginTop: 3,
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   // ── Detail rows ───────────────────────────────────────────────────────────

//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },

//   detailLabel: {
//     flex: 1,
//     fontSize: 13,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   detailValue: {
//     flex: 1.2,
//     fontSize: 13,
//     color: '#0F172A',
//     textAlign: 'right',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   // ── Items ─────────────────────────────────────────────────────────────────

//   itemCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#E4ECE8',
//   },

//   itemRow: { flexDirection: 'row', alignItems: 'center' },

//   itemImgBox: {
//     width: 72,
//     height: 72,
//     borderRadius: 12,
//     backgroundColor: '#F1F5F9',
//     overflow: 'hidden',
//     marginRight: 12,
//   },

//   itemImg: { width: '100%', height: '100%', resizeMode: 'cover' },

//   itemImgFallback: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E6F2EF',
//   },

//   itemInfo: { flex: 1 },

//   itemName: {
//     fontSize: 14,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//     lineHeight: 20,
//   },

//   itemMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//     gap: 6,
//   },

//   itemQtyBadge: {
//     backgroundColor: '#F1F5F9',
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },

//   itemQtyText: {
//     fontSize: 11,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   itemSub: {
//     fontSize: 12,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//     marginTop: 3,
//   },

//   itemPrice: {
//     fontSize: 15,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//     marginTop: 6,
//   },

//   rateBtn: {
//     marginTop: 12,
//     borderWidth: 1.5,
//     borderColor: Colors.primaryColor,
//     borderRadius: 12,
//     height: 40,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     backgroundColor: '#F0FAF7',
//   },

//   rateBtnText: {
//     color: Colors.primaryColor,
//     fontSize: 13,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   ratedRow: {
//     marginTop: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#FFFBEB',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//   },

//   ratedText: {
//     color: '#92400E',
//     fontSize: 12,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   // ── Summary ───────────────────────────────────────────────────────────────

//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 7,
//   },

//   summaryLabel: {
//     fontSize: 13,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   summaryValue: {
//     fontSize: 13,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   summaryDivider: {
//     height: 1,
//     backgroundColor: '#E2E8F0',
//     marginVertical: 5,
//   },

//   totalLabel: {
//     fontSize: 14,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   totalValue: {
//     fontSize: 17,
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsBold,
//   },

//   // ── Cancel modal ──────────────────────────────────────────────────────────

//   modalOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(15,23,42,0.55)',
//     justifyContent: 'flex-end',
//     zIndex: 999,
//     elevation: 20,
//   },

//   modalCard: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 26,
//     borderTopRightRadius: 26,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 20,
//     maxHeight: '88%',
//   },

//   modalScroll: {
//     flexGrow: 0,
//     maxHeight: 340,
//   },

//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 14,
//   },

//   modalIconCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#FEF2F2',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   modalClose: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   modalTitle: {
//     fontSize: 19,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   modalSubtitle: {
//     fontSize: 13,
//     lineHeight: 20,
//     color: '#64748B',
//     fontFamily: Fonts.PoppinsMedium,
//     marginTop: 4,
//     marginBottom: 18,
//   },

//   reasonsList: { marginBottom: 4 },

//   reasonOption: {
//     minHeight: 50,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     marginBottom: 8,
//     backgroundColor: '#FFFFFF',
//   },

//   reasonSelected: {
//     borderColor: Colors.primaryColor,
//     backgroundColor: '#F1F8F5',
//   },

//   radio: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#CBD5E1',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   radioSelected: { borderColor: Colors.primaryColor },

//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: Colors.primaryColor,
//   },

//   reasonText: {
//     flex: 1,
//     fontSize: 13,
//     color: '#334155',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   reasonTextSelected: {
//     color: Colors.primaryColor,
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   customReasonWrap: { marginTop: 4, marginBottom: 4 },

//   customReasonInput: {
//     minHeight: 88,
//     maxHeight: 120,
//     borderWidth: 1,
//     borderColor: '#D8E2DE',
//     borderRadius: 14,
//     backgroundColor: '#F8FAFC',
//     paddingHorizontal: 13,
//     paddingVertical: 11,
//     fontSize: 13,
//     lineHeight: 19,
//     color: '#0F172A',
//     fontFamily: Fonts.PoppinsMedium,
//     textAlignVertical: 'top',
//   },

//   charCount: {
//     textAlign: 'right',
//     fontSize: 10,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//     marginTop: 4,
//   },

//   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },

//   keepBtn: {
//     flex: 1,
//     height: 48,
//     borderRadius: 13,
//     borderWidth: 1,
//     borderColor: '#D8E2DE',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFFFFF',
//   },

//   keepBtnText: {
//     fontSize: 13,
//     color: '#334155',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },

//   confirmCancelBtn: {
//     flex: 1,
//     height: 48,
//     borderRadius: 13,
//     backgroundColor: '#DC2626',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//   },

//   confirmCancelBtnDisabled: { backgroundColor: '#CBD5E1' },

//   confirmCancelText: {
//     fontSize: 13,
//     color: '#FFFFFF',
//     fontFamily: Fonts.PoppinsSemiBold,
//   },
// });
