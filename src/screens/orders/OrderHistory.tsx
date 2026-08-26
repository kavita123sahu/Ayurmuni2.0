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

// ─── Status filter config ─────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_FILTERS: { key: StatusFilter; label: string; color: string; bg: string }[] = [
  { key: 'all',        label: 'All',        color: '#475569', bg: '#F1F5F9' },
  { key: 'pending',    label: 'Pending',    color: '#854D0E', bg: '#FEF9C3' },
  { key: 'processing', label: 'Processing', color: '#1E40AF', bg: '#DBEAFE' },
  { key: 'shipped',    label: 'Shipped',    color: '#92400E', bg: '#FEF3C7' },
  { key: 'delivered',  label: 'Delivered',  color: '#166534', bg: '#DCFCE7' },
  { key: 'cancelled',  label: 'Cancelled',  color: '#991B1B', bg: '#FEE2E2' },
];

// Statuses that map to each filter key
const STATUS_GROUPS: Record<StatusFilter, string[]> = {
  all:        [],
  pending:    ['pending', 'confirmed'],
  processing: ['processing', 'packed', 'dispatched'],
  shipped:    ['shipped', 'in_transit', 'out_for_delivery'],
  delivered:  ['delivered', 'completed'],
  cancelled:  ['cancelled', 'returned'],
};

// ─── Component ────────────────────────────────────────────────────────────────

const OrderHistory = (props: any) => {
  const [searchText, setSearchText] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const debouncedSearch = useDebounce(searchText, 400);

  const {
    orders,
    orderListItems,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useOrders();

  // Smart refresh: only re-fetch when a status actually changed after returning
  const prevSnapshotRef = useRef<string>('');

  useFocusEffect(
    useCallback(() => {
      const snap = orders.map((o: any) => `${o?.id}:${o?.order_status}`).join(',');
      if (prevSnapshotRef.current && prevSnapshotRef.current !== snap) {
        refresh();
      }
      return () => {
        prevSnapshotRef.current = orders
          .map((o: any) => `${o?.id}:${o?.order_status}`)
          .join(',');
      };
    }, [orders, refresh]),
  );

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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Order History"
        subtitle="Track your medicines & labs"
        onBack={() => props.navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}
        onRefreshPress={refresh}
      />

      <ExpandableSearch
        placeholder="Search order id or title..."
        value={searchText}
        onChangeText={setSearchText}
        showTrigger={false}
        expanded={searchExpanded}
        onExpandedChange={setSearchExpanded}
      />

      {/* Status filter chips */}
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

      {loading && orderListItems.length === 0 ? (
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
              onRefresh={refresh}
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
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  chipText: {
    fontSize: 12,
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
    paddingHorizontal: 16,
    paddingBottom: 100,
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
