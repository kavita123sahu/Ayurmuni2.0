import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import OrderCard from '../../components/OrderCard';
import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';
import { useOrders } from '../../hooks/useOrders';
import { useFocusEffect } from '@react-navigation/native';
import { Fonts } from '../../common/Fonts';
import { OrderHistorySkeleton } from '../../simmerScreen/ShimmerHook';
import { SCREEN_THEME } from '../../constants/screenTheme';
import SegmentTabs from '../../components/SegmentTabs';
import TablerIcon from '../../components/TablerIcon';
import {
  formatPrescriptionDate,
  getPrescriptionFiles,
  getPrescriptionRequests,
  getRequestedVariants,
  getStatusLabel,
  isPrescriptionApproved,
  isPrescriptionRejected,
  normalizePrescriptionRequestList,
} from '../../services/PrescriptionRequestService';
import { formatRupee } from '../../utils/currencyUtils';
import { PrescriptionFilePreview } from '../../components/PrescriptionFilePreview';
import { formatOrderId } from '../../utils/formatDisplayId';
import { formatOrderDateTime } from '../../utils/orderDetailUtils';
import {
  ReturnRequest,
  getAllReturns,
  getOrderReturns,
  getReasonLabel,
  getReturnStatusMeta,
  normalizeReturnList,
} from '../../services/ReturnService';

type ReturnFilter = 'all' | 'active' | 'refunded' | 'rejected';

const RETURN_FILTERS: { key: ReturnFilter; label: string; color: string; bg: string }[] = [
  { key: 'all', label: 'All', color: '#475569', bg: '#F1F5F9' },
  { key: 'active', label: 'In progress', color: '#1E40AF', bg: '#DBEAFE' },
  { key: 'refunded', label: 'Refunded', color: '#166534', bg: '#DCFCE7' },
  { key: 'rejected', label: 'Rejected', color: '#991B1B', bg: '#FEE2E2' },
];

const RETURN_GROUPS: Record<Exclude<ReturnFilter, 'all'>, string[]> = {
  active: ['requested', 'pending', 'approved', 'pickup_scheduled', 'picked_up', 'received', 'refund_initiated'],
  refunded: ['refunded', 'completed'],
  rejected: ['rejected', 'cancelled'],
};

/** Orders that can carry return requests (used when the all-returns endpoint is unavailable). */
const RETURNABLE_ORDER_STATUSES = ['delivered', 'completed', 'returned'];

// ─── Status filter config ─────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_FILTERS: { key: StatusFilter; label: string; color: string; bg: string }[] = [
  { key: 'all', label: 'All', color: '#475569', bg: '#F1F5F9' },
  { key: 'pending', label: 'Pending', color: '#854D0E', bg: '#FEF9C3' },
  { key: 'processing', label: 'Processing', color: '#1E40AF', bg: '#DBEAFE' },
  { key: 'shipped', label: 'Shipped', color: '#92400E', bg: '#FEF3C7' },
  { key: 'delivered', label: 'Delivered', color: '#166534', bg: '#DCFCE7' },
  { key: 'cancelled', label: 'Cancelled', color: '#991B1B', bg: '#FEE2E2' },
];

// Statuses that map to each filter key (aligned with order_status enum)
const STATUS_GROUPS: Record<StatusFilter, string[]> = {
  all: [],
  pending: ['pending', 'confirmed'],
  processing: ['processing', 'packed'],
  shipped: ['shipped'],
  //'dispatched', 'in_transit', 'out_for_delivery'      on the shipped filter applied 
  delivered: ['delivered', 'completed'],
  cancelled: ['cancelled', 'returned'],
};

// ─── Component ────────────────────────────────────────────────────────────────

type HistoryTab = 'orders' | 'returns' | 'requested';

const requestStatusTone = (item: any) => {
  if (isPrescriptionApproved(item)) {
    return { label: 'Approved', color: '#166534', bg: '#DCFCE7' };
  }
  if (isPrescriptionRejected(item)) {
    return { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2' };
  }
  return { label: getStatusLabel(item) || 'Waiting for approval', color: '#92400E', bg: '#FEF3C7' };
};

const OrderHistory = (props: any) => {
  const routeTab = props.route?.params?.tab;
  const openedTab: HistoryTab =
    routeTab === 'requested' || routeTab === 'returns' ? routeTab : 'orders';
  const highlightRequestId = String(props.route?.params?.requestId || '');
  const [activeTab, setActiveTab] = useState<HistoryTab>(openedTab);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsRefreshing, setRequestsRefreshing] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchText, 400);

  const {
    orderListItems,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useOrders({ search: debouncedSearch });

  // Refresh when returning to this screen (not on first mount — useOrders already loads)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  const loadRequests = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRequestsRefreshing(true);
    else setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await getPrescriptionRequests();
      setRequests(normalizePrescriptionRequestList(response));
    } catch {
      setRequests([]);
      setRequestsError('Could not load requested orders.');
    } finally {
      setRequestsLoading(false);
      setRequestsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const tab = props.route?.params?.tab;
      if (tab === 'requested' || tab === 'returns') {
        setActiveTab(tab);
      }
      loadRequests();
    }, [loadRequests, props.route?.params?.tab]),
  );

  // ── Returns tab ────────────────────────────────────────────────────────────
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnsRefreshing, setReturnsRefreshing] = useState(false);
  const [returnsError, setReturnsError] = useState<string | null>(null);
  const [returnsLoaded, setReturnsLoaded] = useState(false);
  const [returnFilter, setReturnFilter] = useState<ReturnFilter>('all');
  const ordersRef = useRef(orderListItems);
  ordersRef.current = orderListItems;

  const loadReturns = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setReturnsRefreshing(true);
    else setReturnsLoading(true);
    setReturnsError(null);
    try {
      let list: ReturnRequest[] = [];
      let allOk = false;
      try {
        const res = await getAllReturns({ page_size: 50 });
        if (res?.success !== false) {
          list = normalizeReturnList(res);
          allOk = true;
        }
      } catch {
        allOk = false;
      }
      if (!allOk) {
        // Fall back to per-order returns for delivered / returned orders.
        const candidates = ordersRef.current
          .filter(o => RETURNABLE_ORDER_STATUSES.includes(String(o.status ?? '').toLowerCase()))
          .slice(0, 20);
        const results = await Promise.all(
          candidates.map(o =>
            getOrderReturns(o.raw?.id ?? o.id)
              .then(normalizeReturnList)
              .catch(() => [] as ReturnRequest[]),
          ),
        );
        list = results.flat();
      }
      list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setReturns(list);
    } catch {
      setReturnsError('Could not load returns.');
    } finally {
      setReturnsLoaded(true);
      setReturnsLoading(false);
      setReturnsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'returns') loadReturns(returnsLoaded ? 'refresh' : 'initial');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, loadReturns]),
  );

  const filteredReturns = useMemo(() => {
    let list = returns;
    if (returnFilter !== 'all') {
      const allowed = RETURN_GROUPS[returnFilter];
      list = list.filter(r => allowed.includes(r.status));
    }
    const q = debouncedSearch.trim();
    if (q) {
      list = list.filter(r =>
        matchesSearch(
          q,
          r.orderCode,
          r.orderCode.replace(/^ORD-/i, ''),
          r.reason,
          getReasonLabel(r.reasonCode),
          getReturnStatusMeta(r.status).label,
          r.reversePickupCode,
        ),
      );
    }
    return list;
  }, [returns, returnFilter, debouncedSearch]);

  const returnCounts = useMemo(() => {
    const counts: Record<ReturnFilter, number> = { all: returns.length, active: 0, refunded: 0, rejected: 0 };
    returns.forEach(r => {
      (Object.keys(RETURN_GROUPS) as Exclude<ReturnFilter, 'all'>[]).forEach(key => {
        if (RETURN_GROUPS[key].includes(r.status)) counts[key]++;
      });
    });
    return counts;
  }, [returns]);

  const handleRefresh = useCallback(() => {
    if (activeTab === 'requested') {
      loadRequests('refresh');
      return;
    }
    if (activeTab === 'returns') {
      loadReturns('refresh');
      return;
    }
    refresh();
  }, [activeTab, loadRequests, loadReturns, refresh]);

  // Status chip filter (search is server-side via useOrders)
  const filteredOrders = useMemo(() => {
    let list = orderListItems;

    if (statusFilter !== 'all') {
      const allowed = STATUS_GROUPS[statusFilter];
      list = list.filter(item =>
        allowed.includes(String(item.status ?? '').toLowerCase()),
      );
    }

    // Light client fallback while API search is applied (covers display id / titles)
    const q = debouncedSearch.trim();
    if (q) {
      list = list.filter(item => {
        const raw = item.raw || {};
        const itemTitles = Array.isArray(raw?.items)
          ? raw.items
            .map(
              (line: any) =>
                line?.variant?.variant_title ||
                line?.product_name ||
                line?.name ||
                '',
            )
            .join(' ')
          : '';
        const orderCodeRaw = String(
          raw?.order_code ?? raw?.order_number ?? item.id ?? '',
        );
        const displayCode = String(item.orderCode || '').replace(/^#/, '');
        return matchesSearch(
          q,
          item.title,
          item.orderCode,
          displayCode,
          displayCode.replace(/^ORD-/i, ''),
          item.id,
          item.status,
          item.date,
          orderCodeRaw,
          orderCodeRaw.replace(/^ORD-/i, ''),
          raw?.id,
          itemTitles,
        );
      });
    }

    return list;
  }, [debouncedSearch, statusFilter, orderListItems]);

  const searching = debouncedSearch.trim().length > 0;

  // Count per status chip
  const countByStatus = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: orderListItems.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orderListItems.forEach(item => {
      const s = String(item.status ?? '').toLowerCase();
      (Object.keys(STATUS_GROUPS) as StatusFilter[]).forEach(key => {
        if (key !== 'all' && STATUS_GROUPS[key].includes(s)) {
          counts[key]++;
        }
      });
    });
    return counts;
  }, [orderListItems]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />

      <Header
        title="Order History"
        subtitle="Track your medicines & labs"
        onBack={() => props.navigation.goBack()}
        showCart
      />

      <View style={styles.topPanel}>
        <SegmentTabs
          variant="underline"
          tabs={[
            { key: 'orders', label: 'Orders' },
            { key: 'returns', label: returns.length ? `Returns (${returns.length})` : 'Returns' },
            { key: 'requested', label: requests.length ? `Requested (${requests.length})` : 'Requested' },
          ]}
          activeKey={activeTab}
          onChange={key => setActiveTab(key as HistoryTab)}
          style={styles.historyTabs}
        />

        {activeTab !== 'requested' ? (
          <View style={styles.searchBlock}>
            <ExpandableSearch
              placeholder={
                activeTab === 'returns'
                  ? 'Search returns by order id, reason…'
                  : 'Search order id, product, status…'
              }
              value={searchText}
              onChangeText={setSearchText}
              showTrigger={false}
              expanded
            />
          </View>
        ) : null}

        {activeTab !== 'requested' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterBarContent}
            keyboardShouldPersistTaps="handled"
          >
            {(activeTab === 'returns' ? RETURN_FILTERS : STATUS_FILTERS).map(f => {
              const active =
                activeTab === 'returns' ? returnFilter === f.key : statusFilter === f.key;
              const count =
                activeTab === 'returns'
                  ? returnCounts[f.key as ReturnFilter]
                  : countByStatus[f.key as StatusFilter];
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() =>
                    activeTab === 'returns'
                      ? setReturnFilter(f.key as ReturnFilter)
                      : setStatusFilter(f.key as StatusFilter)
                  }
                  activeOpacity={0.8}
                  style={[styles.chip, active && { backgroundColor: f.bg, borderColor: f.color }]}
                >
                  <Text style={[styles.chipText, active && { color: f.color }]}>{f.label}</Text>
                  {count > 0 ? (
                    <Text style={[styles.chipCount, active && { color: f.color }]}>{count}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {activeTab === 'returns' ? (
        returnsLoading && returns.length === 0 ? (
          <OrderHistorySkeleton />
        ) : (
          <FlatList
            data={filteredReturns}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
            renderItem={({ item }) => {
              const meta = getReturnStatusMeta(item.status);
              const qty = item.items.reduce((s, i) => s + i.quantity, 0);
              const amount = item.items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
              return (
                <TouchableOpacity
                  style={styles.returnCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    props.navigation.navigate('ReturnDetailsScreen', {
                      returnId: item.id,
                      returnRequest: item.raw,
                      order: orderListItems.find(o => String(o.raw?.id ?? o.id) === item.orderId)?.raw,
                    })
                  }
                >
                  <View style={styles.returnTop}>
                    <View style={styles.returnIcon}>
                      <TablerIcon name="refresh" size={16} color="#7C3AED" />
                    </View>
                    <View style={styles.requestCopy}>
                      <Text style={styles.requestTitle} numberOfLines={1}>
                        #{formatOrderId(item.orderCode || item.orderId)}
                      </Text>
                      <Text style={styles.requestMeta} numberOfLines={1}>
                        {formatOrderDateTime(item.createdAt)} · {qty} item{qty === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View style={[styles.requestStatus, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.requestStatusText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                  <View style={styles.returnBottom}>
                    <Text style={styles.returnReason} numberOfLines={1}>
                      {getReasonLabel(item.reasonCode, item.reason) || 'Return request'}
                    </Text>
                    {amount > 0 ? (
                      <Text style={styles.returnAmount}>{formatRupee(amount, { decimals: 2 })}</Text>
                    ) : null}
                    <TablerIcon name="chevron-right" size={15} color="#94A3B8" />
                  </View>
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              filteredReturns.length === 0 && styles.listContentEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={returnsRefreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primaryColor]}
              />
            }
            ListEmptyComponent={
              !returnsLoading ? (
                <EmptyState
                  iconName="refresh"
                  title={
                    returnsError
                      ? 'Could not load returns'
                      : returnFilter !== 'all' || searching
                        ? 'No matching returns'
                        : 'No returns yet'
                  }
                  subtitle={
                    returnsError
                      ? 'Pull down to retry.'
                      : 'Return delivered items from the order details page.'
                  }
                />
              ) : null
            }
          />
        )
      ) : activeTab === 'requested' ? (
        requestsLoading && requests.length === 0 ? (
          <OrderHistorySkeleton />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
            renderItem={({ item }) => {
              const variants = getRequestedVariants(item);
              const tone = requestStatusTone(item);
              const highlighted = highlightRequestId && highlightRequestId === String(item?.id);
              const itemCount = variants.reduce((sum, variant) => sum + variant.quantity, 0);
              return (
                <View style={[styles.requestCard, highlighted && styles.requestCardActive]}>
                  <View style={styles.requestTop}>
                    <View style={styles.requestCopy}>
                      <Text style={styles.requestTitle} numberOfLines={1}>
                        {item?.patient_name || 'Prescription request'}
                      </Text>
                      <Text style={styles.requestMeta} numberOfLines={1}>
                        {formatPrescriptionDate(item?.created_at) || 'Submitted'}
                        {itemCount
                          ? ` · ${itemCount} item${itemCount === 1 ? '' : 's'}`
                          : ''}
                      </Text>
                    </View>
                    <View style={[styles.requestStatus, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.requestStatusText, { color: tone.color }]}>
                        {tone.label}
                      </Text>
                    </View>
                  </View>

                  {/* {getPrescriptionFiles(item).length ? (
                    <View style={styles.rxBlock}>
                      {getPrescriptionFiles(item).map(file => (
                        <PrescriptionFilePreview
                          key={file.uri}
                          uri={file.uri}
                          fileType={file.fileType}
                          height={132}
                        />
                      ))}
                    </View>
                  ) : null} */}

                  {variants.length ? (
                    <View style={styles.variantList}>
                      <Text style={styles.sectionLabel}>Requested items</Text>
                      {variants.map(variant => (
                        <View key={variant.id} style={styles.variantRow}>
                          <View style={styles.variantThumb}>
                            {variant.image ? (
                              <Image source={{ uri: variant.image }} style={styles.requestImage} />
                            ) : (
                              <TablerIcon name="package" size={14} color="#94A3B8" />
                            )}
                          </View>
                          <View style={styles.requestCopy}>
                            <Text style={styles.variantName} numberOfLines={1}>
                              {variant.name}
                            </Text>
                            <Text style={styles.variantMeta} numberOfLines={1}>
                              {[variant.brand, variant.size ? `Size ${variant.size}` : null]
                                .filter(Boolean)
                                .join(' · ') || ' '}
                            </Text>
                          </View>
                          <Text style={styles.variantQty}>×{variant.quantity}</Text>
                          <Text style={styles.variantPrice}>
                            {variant.price != null
                              ? formatRupee(variant.price, { decimals: 2 })
                              : '—'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {variants.some(variant => variant.outOfStock) ? (
                    <Text style={styles.stockNote}>Some requested items are out of stock</Text>
                  ) : null}
                  {item?.notes ? (
                    <Text style={styles.requestNote} numberOfLines={2}>
                      Note: {item.notes}
                    </Text>
                  ) : null}
                  {isPrescriptionRejected(item) && item?.rejection_reason ? (
                    <Text style={styles.requestReject} numberOfLines={2}>
                      Rejected: {item.rejection_reason}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() =>
                      props.navigation.navigate('VerifyPresciption', {
                        requestId: item?.prescription_request_id || item?.id,
                        fileUri: getPrescriptionFiles(item)[0]?.uri || item?.file_url,
                        fileName: item?.file_name || 'prescription',
                        fileType: item?.file_type || 'image',
                        existingRequest: item,
                      })
                    }
                  >
                    <Text style={styles.viewBtnText}>View request</Text>
                    <TablerIcon name="chevron-right" size={14} color={Colors.primaryColor} />
                  </TouchableOpacity>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              requests.length === 0 && styles.listContentEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={requestsRefreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primaryColor]}
              />
            }
            ListEmptyComponent={
              !requestsLoading ? (
                <EmptyState
                  iconName="file-medical"
                  title={requestsError ? 'Could not load requests' : 'No requested orders'}
                  subtitle={
                    requestsError
                      ? 'Pull down to retry.'
                      : 'Submitted prescription requests will appear here.'
                  }
                />
              ) : null
            }
          />
        )
      ) : loading && orderListItems.length === 0 ? (
        <OrderHistorySkeleton />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
          renderItem={({ item }) => (
            <OrderCard
              title={item.title}
              id={item.orderCode}
              status={item.status}
              date={item.date}
              amount={item.amount}
              image={item.image}
              moreCount={item.moreCount}
              onPress={() =>
                props.navigation.navigate('OrderDetailsScreen', {
                  order: item.raw,
                })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            filteredOrders.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primaryColor]}
            />
          }
          onEndReached={() => {
            if (!searching && statusFilter === 'all') loadMore();
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            loadingMore && hasMore && !searching ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primaryColor} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                iconName="receipt"
                title={
                  statusFilter !== 'all'
                    ? `No ${statusFilter} orders`
                    : error
                      ? 'Could not load orders'
                      : 'No orders yet'
                }
                subtitle={
                  statusFilter !== 'all'
                    ? 'Try a different filter.'
                    : error
                      ? 'Pull down to retry.'
                      : 'Your medicine orders will appear here.'
                }
              />
            ) : null
          }
        />
      )}

      {error && orderListItems.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </SafeAreaView>
  );
};

export default OrderHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: Colors.background,
  },

  topPanel: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  historyTabs: {
    marginTop: 0,
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  searchBlock: {
    marginTop: 8,
  },
  returnCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  returnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  returnIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  returnReason: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  returnAmount: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  requestCardActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F3FAF8',
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  rxBlock: {
    marginTop: 10,
  },
  requestImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  requestCopy: {
    flex: 1,
    minWidth: 0,
  },
  requestTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  requestMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  requestStatus: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requestStatusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 2,
  },
  variantList: {
    gap: 6,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
  },
  variantThumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantName: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  variantMeta: {
    marginTop: 1,
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  variantQty: {
    width: 28,
    textAlign: 'right',
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  variantPrice: {
    width: 72,
    textAlign: 'right',
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stockNote: {
    marginTop: 8,
    fontSize: 11,
    color: '#B45309',
    fontFamily: Fonts.PoppinsMedium,
  },
  viewBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  viewBtnText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  requestNote: {
    marginTop: 8,
    fontSize: 11,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
  },
  requestReject: {
    marginTop: 6,
    fontSize: 11,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsMedium,
  },
  filterBar: {
    flexGrow: 0,
    marginTop: 8,
  },

  filterBarContent: {
    // paddingHorizontal: 12,
    gap: 6,
    alignItems: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },

  chipText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.PoppinsMedium,
    color: '#475569',
    includeFontPadding: false,
  },

  chipCount: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#94A3B8',
    includeFontPadding: false,
  },

  chipBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  chipBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#64748B',
  },

  listContent: {
    // paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 4,
  },

  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  errorText: {
    textAlign: 'center',
    color: Colors.errorColor ?? '#EF4444',
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    marginBottom: 12,
  },
});
