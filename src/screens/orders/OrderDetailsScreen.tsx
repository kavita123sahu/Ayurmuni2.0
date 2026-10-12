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
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '../../store/hooks';
import { fetchCart } from '../../store/slices/cartSlice';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import FeedbackModal from '../../components/FeedbackModal';
import {
  buildOrderTrackingSteps,
  formatDeliveryAddress,
  formatOrderDateTime,
  getOrderItemReview,
  isOrderItemRated,
  isTruthyReviewFlag,
  resolveOrderItemVariantId,
} from '../../utils/orderDetailUtils';
import { getReviewsAll } from '../../services/ProductServices';
import { getScreenBottomPadding } from '../../constants/layout';
import { resolveProductImageUri } from '../../utils/imageUtils';
import { extractReviewsList } from '../../utils/reviewUtils';
import { consumePendingProductReview } from '../../utils/pendingProductReview';
import { cancelOrder, downloadInvoiceFile, extractOrderDetail, getOrderById, getOrders, normalizeOrdersList, pollOrderTracking } from '../../services/OrderService';
import { downloadPdfToDevice } from '../../utils/fileDownloadUtils';
import { formatOrderId } from '../../utils/formatDisplayId';
import Toast from 'react-native-toast-message';
import { formatRupee, RUPEE_SYMBOL } from '../../utils/currencyUtils';
import { SCREEN_THEME } from '../../constants/screenTheme';
import {
  ReturnRequest,
  getOrderReturns,
  getReturnStatusMeta,
  normalizeReturnList,
} from '../../services/ReturnService';
import { navigateToProductDetails } from '../../navigation/productNavigation';
import { styles } from './OrderDetailsScreen.styles';

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
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
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
  ORDER_STATUS.IN_TRANSIT,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.RETURNED,
];

const RETURN_ALLOWED: OrderStatus[] = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETED,
];

/** Statuses whose order may already have return requests to list. */
const RETURN_LIST_STATUSES: OrderStatus[] = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.RETURNED,
];

const CANCELLATION_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found a better price',
  'Product is no longer required',
  'Other',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value?: string | number) =>
  formatRupee(value, { decimals: 2, fallback: `${RUPEE_SYMBOL}0.00` });

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
      variantId: resolveOrderItemVariantId(item),
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
  in_transit: { label: 'In Transit', bg: '#FEF3C7', text: '#92400E' },
  out_for_delivery: { label: 'Out for Delivery', bg: '#FFEDD5', text: '#9A3412' },
  delivered: { label: 'Delivered', bg: '#DCFCE7', text: '#166534' },
  completed: { label: 'Completed', bg: '#DCFCE7', text: '#166534' },
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
  const initialOrder =
    route?.params?.order ??
    (route?.params?.orderId || route?.params?.order_id
      ? {
        id: String(route.params.orderId ?? route.params.order_id),
        order_id: String(route.params.orderId ?? route.params.order_id),
        order_code: route.params.order_code,
        order_status: route.params.order_status,
      }
      : undefined);
  const fromOrderSuccess = Boolean(route?.params?.fromOrderSuccess);
  const dispatch = useAppDispatch();
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
  const autoReviewPromptedRef = useRef(false);

  const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

  // ── Derived state ──────────────────────────────────────────────────────────

  const status = String(order?.order_status ?? '').toLowerCase() as OrderStatus;
  const statusMeta = getStatusMeta(status);
  const canCancel = CANCEL_ALLOWED.includes(status);
  const canInvoice = INVOICE_ALLOWED.includes(status);
  // Delivered / completed orders can rate products (one time per item)
  const canReview =
    status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETED;
  const [orderReturns, setOrderReturns] = useState<ReturnRequest[]>([]);
  const [returnsChecked, setReturnsChecked] = useState(false);
  const canListReturns = RETURN_LIST_STATUSES.includes(status);
  // One return request per order: once raised, show its status instead of "Return".
  const latestReturn = orderReturns[0] ?? null;
  const canReturn =
    RETURN_ALLOWED.includes(status) && returnsChecked && orderReturns.length === 0;

  useFocusEffect(
    useCallback(() => {
      if (!order?.id || !canListReturns) return;
      let active = true;
      getOrderReturns(order.id)
        .then(res => {
          if (!active) return;
          const list = normalizeReturnList(res).sort((a, b) =>
            String(b.createdAt).localeCompare(String(a.createdAt)),
          );
          setOrderReturns(list);
        })
        .catch(() => { })
        .finally(() => {
          if (active) setReturnsChecked(true);
        });
      return () => {
        active = false;
      };
    }, [order?.id, canListReturns]),
  );

  const items = useMemo(
    () => mapOrderItems(order, fetchedReviewsByVariant),
    [order, fetchedReviewsByVariant],
  );

  const trackingSteps = useMemo(() => buildOrderTrackingSteps(order), [order]);
  const address = formatDeliveryAddress(order?.delivery_address);

  const paymentRows = useMemo(() => {
    const num = (...keys: string[]) => {
      for (const key of keys) {
        const n = Number(order?.[key]);
        if (Number.isFinite(n) && n !== 0) return n;
      }
      return 0;
    };

    const itemsTotal = resolveOrderItemsTotal(order);
    const discount = Math.abs(
      num(
        'total_discount',
        'discount',
        'coupon_discount',
        'promo_discount',
        'discount_amount',
      ),
    );
    const giftWrap = num(
      'gift_wrap_charges',
      'gift_wrap_amount',
      'gift_wrap_fee',
      'gift_wrap',
    );
    const platformFee = num(
      'platform_fee',
      'platform_charges',
      'convenience_fee',
      'service_fee',
    );
    const gstDirect = num(
      'gst',
      'gst_amount',
      'tax',
      'tax_amount',
      'igst',
    );
    const gstSplit =
      (Number(order?.cgst) || 0) +
      (Number(order?.sgst) || 0) +
      (Number(order?.ugst) || 0);
    const gst = gstDirect > 0 ? gstDirect : gstSplit > 0 ? gstSplit : 0;
    const shipping = num('shipping_charges', 'shipping', 'delivery_charges');
    const cod = num('cod_charges', 'cod_fee', 'cod_amount');

    return [
      { label: 'Items total', value: formatCurrency(itemsTotal) },
      discount > 0
        ? { label: 'Discount', value: `- ${formatCurrency(discount)}` }
        : null,
      giftWrap > 0
        ? { label: 'Gift wrap', value: formatCurrency(giftWrap) }
        : null,
      platformFee > 0
        ? { label: 'Platform fee', value: formatCurrency(platformFee) }
        : null,
      gst > 0 ? { label: 'GST / Tax', value: formatCurrency(gst) } : null,
      {
        label: 'Shipping',
        value: shipping > 0 ? formatCurrency(shipping) : 'Free',
      },
      cod > 0 ? { label: 'COD charges', value: formatCurrency(cod) } : null,
    ].filter(Boolean) as { label: string; value: string }[];
  }, [order]);

  const deliveryAgent =
    order?.delivery_partner ?? order?.delivery_agent ?? order?.delivery_person ?? null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const goBack = useCallback(() => {
    if (fromOrderSuccess) {
      dispatch(fetchCart({ force: true, silent: false }));
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: 'TabStack',
              state: {
                routes: [
                  { name: 'Home' },
                  { name: 'Products' },
                  { name: 'MyCart' },
                  { name: 'Consult' },
                  { name: 'Profile' },
                ],
                index: 0,
              },
            },
            { name: 'OrderHistory' },
          ],
        }),
      );
      return;
    }
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate('OrderHistory');
    }
  }, [navigation, fromOrderSuccess, dispatch]);

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
            const itemVid = resolveOrderItemVariantId(item);
            if (itemVid !== vid) return item;
            return {
              ...item,
              is_reviewed: true,
              is_rated: true,
              variant: {
                ...(item?.variant ?? {}),
                is_reviewed: true,
                is_rated: true,
              },
            };
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

      // 1) Reload full order detail (status, items, totals, tracking fields)
      let detail: any = null;
      try {
        const detailRes = await getOrderById(order.id);
        detail = extractOrderDetail(detailRes);
      } catch {
        // Fallback: find this order in the list if detail endpoint is unavailable
        try {
          const listRes = await getOrders({ page: 1, page_size: 50 });
          const list = normalizeOrdersList(listRes);
          detail =
            list.find(
              (o: any) =>
                String(o?.id) === String(order.id) ||
                String(o?.order_code) === String(order?.order_code ?? ''),
            ) ?? null;
        } catch {
          detail = null;
        }
      }

      // 2) Poll live shipment tracking and merge on top
      let pollPayload: any = null;
      try {
        const pollRes = await pollOrderTracking(order.id);
        pollPayload = pollRes?.data?.data ?? pollRes?.data ?? pollRes ?? null;
      } catch {
        pollPayload = null;
      }

      if (detail || pollPayload) {
        setOrder((prev: any) => {
          const merged = {
            ...prev,
            ...(detail || {}),
            ...(pollPayload && typeof pollPayload === 'object' ? pollPayload : {}),
          };
          // Never wipe line items with an empty poll/detail payload
          const nextItems = Array.isArray(merged.items) ? merged.items : [];
          const prevItems = Array.isArray(prev?.items) ? prev.items : [];
          if (!nextItems.length && prevItems.length) {
            merged.items = prevItems;
          }
          return merged;
        });
      }
    } catch {
      // silent — spinner still clears in finally
    } finally {
      setTrackingLoading(false);
    }
  }, [order?.id, order?.order_code]);

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

      const fileName = `Invoice_${formatOrderId(order?.order_code ?? order.id).replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
      await downloadPdfToDevice({
        fileName,
        arrayBuffer: response.data as ArrayBuffer,
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
    if (!order?.id) return;
    navigation.navigate('ReturnRequestScreen', { order });
  }, [navigation, order]);

  const openProductReview = useCallback(
    (rating: number) => {
      if (!reviewTarget?.variantId) return;
      if (
        reviewTarget.rated ||
        isTruthyReviewFlag(reviewTarget.raw?.variant?.is_reviewed) ||
        isTruthyReviewFlag(reviewTarget.raw?.variant?.is_rated) ||
        isTruthyReviewFlag(reviewTarget.raw?.is_reviewed) ||
        isTruthyReviewFlag(reviewTarget.raw?.is_rated)
      ) {
        setReviewTarget(null);
        return;
      }
      const target = reviewTarget;
      setReviewTarget(null);
      navigation.navigate('ShareExperienceScreen', {
        entityType: 'product',
        entityName: target.name,
        entitySubtitle: `Order ${formatOrderId(order?.order_code ?? order?.id)}`,
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

  // Load full order detail so is_reviewed / items / status are accurate from history
  useEffect(() => {
    const orderId = String(initialOrder?.id ?? initialOrder?.order_id ?? '');
    if (!orderId) return;

    let cancelled = false;
    (async () => {
      try {
        const detailRes = await getOrderById(orderId);
        const detail = extractOrderDetail(detailRes);
        if (!cancelled && detail) {
          setOrder((prev: any) => ({
            ...(prev || {}),
            ...detail,
          }));
        }
      } catch {
        // Keep list payload if detail endpoint fails
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialOrder?.id, initialOrder?.order_id]);

  useEffect(() => {
    if (!initialOrder) return;
    reviewFetchAttemptedRef.current = new Set();
    autoReviewPromptedRef.current = false;
    setFetchedReviewsByVariant({});
    setOrder(initialOrder);
  }, [initialOrder?.id, initialOrder?.order_code]);

  // Auto-open rating once for the first unreviewed delivered item (same idea as consultation)
  useEffect(() => {
    if (!canReview || autoReviewPromptedRef.current || reviewTarget) return;
    const firstUnreviewed = items.find(
      item => item.variantId && !item.rated && !fetchedReviewsByVariant[item.variantId],
    );
    if (!firstUnreviewed) return;
    autoReviewPromptedRef.current = true;
    const timer = setTimeout(() => {
      setReviewTarget(firstUnreviewed);
    }, 800);
    return () => clearTimeout(timer);
  }, [canReview, items, reviewTarget, fetchedReviewsByVariant]);

  useEffect(() => {
    const orderId = String(order?.id ?? '');
    const lineItems = Array.isArray(order?.items) ? order.items : [];
    if (!orderId || !lineItems.length) return;

    const targets = lineItems
      .map((item: any) => ({
        variantId: resolveOrderItemVariantId(item),
        isReviewed:
          isTruthyReviewFlag(item?.variant?.is_reviewed) ||
          isTruthyReviewFlag(item?.variant?.is_rated) ||
          isTruthyReviewFlag(item?.is_reviewed) ||
          isTruthyReviewFlag(item?.is_rated),
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
    const terminal = ['delivered', 'completed', 'cancelled', 'returned'].includes(
      String(order?.order_status ?? '').toLowerCase(),
    );
    refreshTracking();
    // Stop background polling once the order is finished
    if (terminal) return undefined;
    const interval = setInterval(refreshTracking, 60_000);
    return () => clearInterval(interval);
  }, [order?.id, order?.order_status, refreshTracking]);

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
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />
      <AppHeader title="Order Details" onLeftPress={goBack} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={['#E8F8F2', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>ORDER ID</Text>
              <Text style={styles.heroOrderId}>
                #{formatOrderId(order?.order_code ?? order?.id)}
              </Text>
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
            {latestReturn && (
              <TouchableOpacity
                style={styles.heroAction}
                onPress={() =>
                  navigation.navigate('ReturnDetailsScreen', {
                    returnId: latestReturn.id,
                    returnRequest: latestReturn.raw,
                    order,
                  })
                }
                activeOpacity={0.8}
              >
                <TablerIcon name="refresh" size={16} color="#7C3AED" />
                <Text style={[styles.heroActionText, { color: '#7C3AED' }]} numberOfLines={1}>
                  Return · {getReturnStatusMeta(latestReturn.status).label}
                </Text>
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
        </LinearGradient>

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
                      (step.key === 'cancelled' || step.key === 'returned') && styles.trackDotCancelled,
                    ]}
                  >
                    {(step.completed || step.active) && (
                      <TablerIcon
                        name={
                          step.key === 'cancelled' || step.key === 'returned'
                            ? 'x'
                            : 'check'
                        }
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
                      (step.key === 'cancelled' || step.key === 'returned') &&
                      styles.trackLabelCancelled,
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
          // Already reviewed once — show stars, never Rate again
          const isReviewed =
            item.rated ||
            isTruthyReviewFlag(item?.raw?.variant?.is_reviewed) ||
            isTruthyReviewFlag(item?.raw?.variant?.is_rated) ||
            isTruthyReviewFlag(item?.raw?.is_reviewed) ||
            isTruthyReviewFlag(item?.raw?.is_rated) ||
            Boolean(fetchedReviewsByVariant[item.variantId]);

          return (
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() =>
              navigateToProductDetails(navigation, item.variantId)}>
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

              {/* Rating / review row — Rate only when not reviewed yet */}
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
            </TouchableOpacity>
          );
        })}

        {/* ── Return requests ── */}
        {orderReturns.length > 0 && (
          <>
            <SectionTitle title={`Return requests (${orderReturns.length})`} />
            {orderReturns.map(ret => {
              const retMeta = getReturnStatusMeta(ret.status);
              const qty = ret.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <TouchableOpacity
                  key={ret.id}
                  style={[styles.card, styles.returnRow]}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('ReturnDetailsScreen', {
                      returnId: ret.id,
                      returnRequest: ret.raw,
                      order,
                    })
                  }
                >
                  <View style={styles.returnIcon}>
                    <TablerIcon name="refresh" size={16} color="#7C3AED" />
                  </View>
                  <View style={styles.returnInfo}>
                    <Text style={styles.returnTitle} numberOfLines={1}>
                      {qty} item{qty === 1 ? '' : 's'} · {formatOrderDateTime(ret.createdAt)}
                    </Text>
                    <Text style={styles.returnSub} numberOfLines={1}>
                      {ret.reason || 'Return request'}
                    </Text>
                  </View>
                  <View style={[styles.returnPill, { backgroundColor: retMeta.bg }]}>
                    <Text style={[styles.returnPillText, { color: retMeta.color }]}>
                      {retMeta.label}
                    </Text>
                  </View>
                  <TablerIcon name="chevron-right" size={16} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}
          </>
        )}

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

// // ─── Types ──────────────────────────────────────────────────────────────────

// // ─── Status enums ────────────────────────────────────────────────────────────

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// // ─── Status label / color map ────────────────────────────────────────────────

// // ─── Small sub-components ─────────────────────────────────────────────────────

// // ─── Main screen ──────────────────────────────────────────────────────────────

//   // ── Derived state ──────────────────────────────────────────────────────────

//   // ── Handlers ──────────────────────────────────────────────────────────────

//       const preferredDir =
//         Platform.OS === 'android'
//           ? // Visible in Android “Downloads”/Files app on most devices
//             (RNFS.DownloadDirectoryPath ||
//               // fallback for some RNFS builds
//               (RNFS.ExternalDirectoryPath as unknown as string) ||
//               RNFS.DocumentDirectoryPath)
//           : RNFS.DocumentDirectoryPath;

//   // ── Effects ───────────────────────────────────────────────────────────────

//   // ── Empty state ───────────────────────────────────────────────────────────

//   // ── Render ────────────────────────────────────────────────────────────────

//         {/* ── Items ── */}
//         <SectionTitle title={`Items (${items.length})`} />
//         {items.map(item => {
//           // Check all possible is_reviewed flags — any truthy means already rated
//           const isReviewed =
//             item.rated ||
//             item?.raw?.variant?.is_reviewed === true ||
//             item?.raw?.is_reviewed === true ||
//             Boolean(fetchedReviewsByVariant[item.variantId]);

// // ─── Styles ───────────────────────────────────────────────────────────────────

//   scroll: { padding: 16 },

//   // ── Section title ─────────────────────────────────────────────────────────

//   // ── Refresh ───────────────────────────────────────────────────────────────

//   // ── Hero card ─────────────────────────────────────────────────────────────

//   heroLeft: { flex: 1 },

//   // ── Card (generic) ────────────────────────────────────────────────────────

//   // ── Tracking ──────────────────────────────────────────────────────────────

//   trackRow: { flexDirection: 'row', minHeight: 52 },

//   trackLeft: { width: 28, alignItems: 'center' },

//   trackLineDone: { backgroundColor: '#B7D8CE' },

//   // ── Delivery agent ────────────────────────────────────────────────────────

//   agentInfo: { flex: 1, marginLeft: 12 },

//   // ── ETA / location ────────────────────────────────────────────────────────

//   etaInfo: { flex: 1, marginLeft: 12 },

//   // ── Live Tracking ────────────────────────────────────────────────────────

//   liveAgentInfo: { flex: 1 },

//   // ── Address ───────────────────────────────────────────────────────────────

//   addressCard: { flexDirection: 'row', alignItems: 'flex-start' },

//   addrContent: { flex: 1, marginLeft: 12 },

//   // ── Detail rows ───────────────────────────────────────────────────────────

//   // ── Items ─────────────────────────────────────────────────────────────────

//   itemRow: { flexDirection: 'row', alignItems: 'center' },

//   itemImg: { width: '100%', height: '100%', resizeMode: 'cover' },

//   itemInfo: { flex: 1 },

//   // ── Summary ───────────────────────────────────────────────────────────────

//   // ── Cancel modal ──────────────────────────────────────────────────────────

//   reasonsList: { marginBottom: 4 },

//   radioSelected: { borderColor: Colors.primaryColor },

//   customReasonWrap: { marginTop: 4, marginBottom: 4 },

//   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },

//   confirmCancelBtnDisabled: { backgroundColor: '#CBD5E1' },
