import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import FeedbackModal from '../../components/FeedbackModal';
import { formatOrderStatus } from '../../utils/orderUtils';
import {
  buildOrderTrackingSteps,
  formatDeliveryAddress,
  formatOrderDateTime,
  getOrderItemReview,
  isOrderItemRated,
} from '../../utils/orderDetailUtils';
import { getOrders } from '../../services/OrderService';
import { getScreenBottomPadding } from '../../constants/layout';

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

const formatCurrency = (value?: string | number) => {
  const num = Number(value ?? 0);
  return `Rs. ${num.toFixed(2)}`;
};

const mapOrderItems = (order: any): OrderItemRow[] => {
  const items = Array.isArray(order?.items) ? order.items : [];

  return items.map((item: any, index: number) => ({
    id: String(item?.id ?? index),
    variantId: String(item?.variant?.variant_id ?? item?.variant_id ?? ''),
    name: String(item?.variant?.variant_title ?? item?.product_name ?? 'Product'),
    subtitle: `Qty: ${item?.quantity ?? 1}`,
    price: formatCurrency(item?.selling_price ?? item?.variant?.selling_price ?? item?.price),
    image: item?.variant?.image_url ?? item?.image_url ?? '',
    raw: item,
    review: getOrderItemReview(item, order),
    rated: isOrderItemRated(item, order),
  }));
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
};

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const initialOrder = route?.params?.order;
  const insets = useSafeAreaInsets();
  const bottomPadding = getScreenBottomPadding(insets);

  const [order, setOrder] = useState<any>(initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<OrderItemRow | null>(null);

  const refreshOrder = useCallback(async () => {
    if (!initialOrder?.id && !initialOrder?.order_code) {
      return;
    }

    try {
      setRefreshing(true);
      const response = await getOrders();
      const list = Array.isArray(response?.data) ? response.data : [];
      const updated = list.find(
        (entry: any) =>
          String(entry?.id) === String(initialOrder?.id) ||
          String(entry?.order_code) === String(initialOrder?.order_code),
      );
      if (updated) {
        setOrder(updated);
      }
    } catch {
      // keep existing order data
    } finally {
      setRefreshing(false);
    }
  }, [initialOrder?.id, initialOrder?.order_code]);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useFocusEffect(
    useCallback(() => {
      refreshOrder();
    }, [refreshOrder]),
  );

  const items = useMemo(() => mapOrderItems(order), [order]);

  const status = formatOrderStatus(order?.order_status);
  const canReview = status === 'DELIVERED';
  const trackingSteps = useMemo(() => buildOrderTrackingSteps(order), [order]);
  const address = formatDeliveryAddress(order?.delivery_address);

  const paymentRows = [
    { label: 'Items total', value: formatCurrency(order?.items_total ?? order?.subtotal) },
    {
      label: 'Shipping',
      value: Number(order?.shipping_charges ?? 0) > 0 ? formatCurrency(order?.shipping_charges) : 'Free',
    },
    {
      label: 'Discount',
      value: Number(order?.total_discount ?? 0) > 0 ? `- ${formatCurrency(order?.total_discount)}` : undefined,
    },
    {
      label: 'COD charges',
      value: Number(order?.cod_charges ?? 0) > 0 ? formatCurrency(order?.cod_charges) : undefined,
    },
    {
      label: 'Prepaid',
      value: Number(order?.prepaid_amount ?? 0) > 0 ? formatCurrency(order?.prepaid_amount) : undefined,
    },
  ].filter(row => row.value);

  const openProductReview = (rating: number) => {
    if (!reviewTarget?.variantId) {
      return;
    }

    const target = reviewTarget;
    const isEdit = target.rated || target.review?.isRated === true;

    setReviewTarget(null);

    navigation.navigate('ShareExperienceScreen', {
      entityType: 'product',
      entityName: target.name,
      entitySubtitle: `Order #${order?.order_code ?? order?.id ?? ''}`,
      variantId: target.variantId,
      initialRating: target.review?.rating ?? rating,
      initialReview: target.review?.review ?? '',
      initialImages: target.review?.images ?? [],
      isEdit,
    });
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Order Details" onLeftPress={() => navigation.goBack()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Order details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Order Details" onLeftPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.label}>ORDER ID</Text>
              <Text style={styles.orderId}>#{order?.order_code ?? order?.id}</Text>
            </View>
            <View style={[styles.statusBadge, status === 'DELIVERED' ? styles.delivered : styles.progress]}>
              <Text style={[styles.statusText, status === 'DELIVERED' ? styles.deliveredText : styles.progressText]}>
                {status}
              </Text>
            </View>
          </View>
          <Text style={styles.heroHint}>
            {status === 'DELIVERED'
              ? 'Your order has been delivered successfully.'
              : 'Track your order progress below.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tracking</Text>
        <View style={styles.card}>
          {trackingSteps.map((step, index) => (
            <View key={step.key} style={styles.trackRow}>
              <View style={styles.trackLeft}>
                <View
                  style={[
                    styles.trackDot,
                    step.completed && styles.trackDotDone,
                    step.active && styles.trackDotActive,
                  ]}
                />
                {index < trackingSteps.length - 1 ? (
                  <View
                    style={[
                      styles.trackLine,
                      step.completed && styles.trackLineDone,
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.trackContent}>
                <Text
                  style={[
                    styles.trackLabel,
                    (step.completed || step.active) && styles.trackLabelActive,
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
          ))}
        </View>

        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.card}>
          <DetailRow label="Placed on" value={formatOrderDateTime(order?.created_at)} />
          <DetailRow label="Last updated" value={formatOrderDateTime(order?.updated_at)} />
          <DetailRow label="Payment method" value={order?.payment_method ?? order?.payment_type} />
          <DetailRow label="Payment status" value={order?.payment_status} />
          <DetailRow label="Shipping method" value={order?.shipping_method} />
          {!!address && (
            <View style={styles.addressBlock}>
              <Text style={styles.detailLabel}>Delivery address</Text>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Items in this order</Text>
        {items.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.imageBox}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                  <TablerIcon name="package" size={22} color={Colors.primaryColor} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.subtitle}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>

            {/* {item.rated ? ( */}
            <TouchableOpacity
              style={styles.editReviewBtn}
              activeOpacity={0.88}
              onPress={() => setReviewTarget(item)}
            >
              <TablerIcon name="star-filled" size={16} color="#F59E0B" />
              <Text style={styles.editReviewBtnText}>Edit Review</Text>
            </TouchableOpacity>
            {/* // ) :  */}
            {/* // canReview && !!item.variantId ? ( */}
            <TouchableOpacity
              style={styles.reviewBtn}
              activeOpacity={0.88}
              onPress={() => setReviewTarget(item)}
            >
              <TablerIcon name="star" size={16} color="#FFFFFF" />
              <Text style={styles.reviewBtnText}>Rate Product</Text>
            </TouchableOpacity>
            {/* ) 
            // : null} */}
          </View>
        ))}
        
        <Text style={styles.sectionTitle}>Payment Summary</Text>
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

        {refreshing ? (
          <ActivityIndicator
            size="small"
            color={Colors.primaryColor}
            style={styles.refreshLoader}
          />
        ) : null}
      </ScrollView>

      <FeedbackModal
        visible={!!reviewTarget}
        isEdit={!!reviewTarget?.rated}
        initialRating={reviewTarget?.review?.rating ?? 0}
        onClose={() => setReviewTarget(null)}
        onContinue={openProductReview}
      />
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7F6' },
  scroll: { padding: 16 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748B', fontFamily: Fonts.PoppinsMedium },
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
  heroHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  orderId: {
    fontSize: 18,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  delivered: { backgroundColor: '#E6F4EA' },
  progress: { backgroundColor: '#E8F0FE' },
  statusText: { fontSize: 11, fontFamily: Fonts.PoppinsSemiBold },
  deliveredText: { color: '#1B5E54' },
  progressText: { color: '#3366FF' },
  sectionTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4ECE8',
  },
  trackRow: {
    flexDirection: 'row',
    minHeight: 58,
  },
  trackLeft: {
    width: 24,
    alignItems: 'center',
  },
  trackDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  trackDotDone: {
    backgroundColor: Colors.primaryColor,
  },
  trackDotActive: {
    backgroundColor: '#F59E0B',
  },
  trackLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  trackLineDone: {
    backgroundColor: '#B7D8CE',
  },
  trackContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 12,
  },
  trackLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  trackLabelActive: {
    color: '#0F172A',
  },
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
    marginTop: 4,
  },
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
  addressBlock: {
    paddingTop: 10,
  },
  addressText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4ECE8',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  imageBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E6F2EF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  image: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  itemSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 4,
  },
  reviewBtn: {
    marginTop: 12,
    backgroundColor: Colors.primaryColor,
    borderRadius: 12,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  editReviewBtn: {
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  editReviewBtnText: {
    color: '#92400E',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ratedPill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratedText: {
    color: '#92400E',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  totalValue: {
    fontSize: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
  },
  refreshLoader: {
    marginTop: 8,
    marginBottom: 12,
  },
});
