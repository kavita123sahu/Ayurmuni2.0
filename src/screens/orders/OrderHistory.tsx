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
  shipped: ['shipped' ],
  //'dispatched', 'in_transit', 'out_for_delivery'      on the shipped filter applied 
  delivered: ['delivered', 'completed'],
  cancelled: ['cancelled', 'returned'],
};

// ─── Component ────────────────────────────────────────────────────────────────

type HistoryTab = 'orders' | 'requested';

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
  const openedTab = props.route?.params?.tab === 'requested' ? 'requested' : 'orders';
  const highlightRequestId = String(props.route?.params?.requestId || '');
  const [activeTab, setActiveTab] = useState<HistoryTab>(openedTab);
  const [searchText, setSearchText] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
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
  } = useOrders();

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
      if (props.route?.params?.tab === 'requested') {
        setActiveTab('requested');
      }
      loadRequests();
    }, [loadRequests, props.route?.params?.tab]),
  );

  const handleRefresh = useCallback(() => {
    if (activeTab === 'requested') {
      loadRequests('refresh');
      return;
    }
    refresh();
  }, [activeTab, loadRequests, refresh]);

  // Filter by search + status chip
  const filteredOrders = useMemo(() => {
    const q = debouncedSearch.trim();

    let list = orderListItems;

    // Status filter
    if (statusFilter !== 'all') {
      const allowed = STATUS_GROUPS[statusFilter];
      list = list.filter(item =>
        allowed.includes(String(item.status ?? '').toLowerCase()),
      );
    }

    // Search filter
    if (q) {
      list = list.filter(item =>
        matchesSearch(q, item.title, item.orderCode, item.id, item.status, item.date),
      );
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
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />

      <Header
        title="Order History"
        subtitle="Track your medicines & labs"
        onBack={() => props.navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}

      />

      <SegmentTabs
        tabs={[
          { key: 'orders', label: 'My orders' },
          {
            key: 'requested',
            label: requests.length
              ? `Requested (${requests.length})`
              : 'Requested',
          },
        ]}
        activeKey={activeTab}
        onChange={key => setActiveTab(key as HistoryTab)}
        style={styles.historyTabs}
      />

      {activeTab === 'orders' ? (
        <ExpandableSearch
          placeholder="Search order id or title..."
          value={searchText}
          onChangeText={setSearchText}
          showTrigger={false}
          expanded={searchExpanded}
          onExpandedChange={setSearchExpanded}
        />
      ) : null}

      {/* Status filter chips */}
      {activeTab === 'orders' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f.key;
            const count = countByStatus[f.key];
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setStatusFilter(f.key)}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  active && { backgroundColor: f.bg, borderColor: f.color },
                ]}
              >
                <Text style={[styles.chipText, active && { color: f.color }]}>
                  {f.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.chipBadge, active && { backgroundColor: f.color }]}>
                    <Text style={[styles.chipBadgeText, active && { color: '#FFFFFF' }]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {activeTab === 'requested' ? (
        requestsLoading && requests.length === 0 ? (
          <OrderHistorySkeleton />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item, index) => String(item?.id ?? index)}
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
    backgroundColor: Colors.background,
  },

  historyTabs: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
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
    marginBottom: 6,
  },

  filterBarContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  chipText: {
    fontSize: 12,
    marginVertical: -4,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#64748B',
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
    paddingHorizontal: 12,
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
