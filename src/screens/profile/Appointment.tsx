import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import Header from '../../components/Header';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppointmentHistory } from '../../hooks/useConsultData';
import { PAST_STATUS, UPCOMING_STATUS } from '../../common/DataInterface';
import EmptyState from '../../components/EmptyState';
import RenderAppoint from '../../components/RenderAppoint';
import { AppointmentSkeletonList } from '../../simmerScreen/ShimmerHook';
import RescheduleModal from '../../components/RescheduleModal';
import CancelAppointmentModal from '../../components/CancelAppointModal';
import { showSuccessToast } from '../../config/Key';
import { handleAppointmentAction } from '../../hooks/AppointmentData';
import { normalizeAppointmentListItem } from '../../utils/appointmentUtils';
import SegmentTabs from '../../components/SegmentTabs';
import { getListBottomPadding } from '../../constants/responsive';

const APPOINTMENT_TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
] as const;

const FOLLOW_UP_FILTERS = [
  { key: 'all', label: 'All visits' },
  { key: 'true', label: 'Follow-up' },
  { key: 'false', label: 'Regular' },
] as const;

const UPCOMING_STATUS_FILTERS = [
  { key: 'all', label: 'Any status' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'reschedule', label: 'Reschedule' },
] as const;

const PAST_STATUS_FILTERS = [
  { key: 'all', label: 'Any status' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'missed', label: 'Missed' },
] as const;

type Chip = { key: string; label: string };

const FilterChips = ({
  items,
  activeKey,
  onChange,
}: {
  items: readonly Chip[] | Chip[];
  activeKey: string;
  onChange: (key: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.chipRow}
  >
    {items.map(item => {
      const active = activeKey === item.key;
      return (
        <TouchableOpacity
          key={item.key}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onChange(item.key)}
          activeOpacity={0.85}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

/**
 * My Appointments — same screen, conditional:
 * - Home "View all" → mode: 'upcoming' (no Past tab)
 * - Profile → full Upcoming / Past tabs
 * Filters: Follow-up + Status (API-backed)
 */
const AppointmentScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const mode = props?.route?.params?.mode;
  const upcomingOnly = mode === 'upcoming';

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const listScope = upcomingOnly ? 'upcoming' : activeTab;

  const handleTabChange = useCallback((tab: 'upcoming' | 'past') => {
    setActiveTab(tab);
    setStatusFilter('all');
  }, []);

  const apiFilters = useMemo(() => {
    const filters: { appointment_status?: string; follow_up?: string } = {};

    if (statusFilter !== 'all') {
      filters.appointment_status = statusFilter;
    } else {
      filters.appointment_status = listScope;
    }

    if (followUpFilter !== 'all') {
      filters.follow_up = followUpFilter;
    }

    return filters;
  }, [listScope, statusFilter, followUpFilter]);

  const {
    AppointData,
    refreshUpcoming,
    loading,
    loadMore,
    hasMore,
    loadingMore,
    refreshing,
  } = useAppointmentHistory(apiFilters);

  const statusChips =
    listScope === 'upcoming' ? UPCOMING_STATUS_FILTERS : PAST_STATUS_FILTERS;

  const normalizedData = useMemo(() => {
    if (loading && (!AppointData || AppointData.length === 0)) return [];
    return (AppointData ?? []).map((item: any) =>
      normalizeAppointmentListItem(item),
    );
  }, [AppointData, loading]);

  const appointmentData = useMemo(() => {
    return normalizedData.filter(item => {
      const status = String(item.status ?? '').toLowerCase();

      if (statusFilter === 'all') {
        const inScope =
          listScope === 'upcoming'
            ? UPCOMING_STATUS.includes(status) ||
              status === 'upcoming' ||
              !PAST_STATUS.includes(status)
            : PAST_STATUS.includes(status) || status === 'past';
        if (!inScope && listScope === 'past') return false;
        if (
          listScope === 'upcoming' &&
          PAST_STATUS.includes(status) &&
          statusFilter === 'all'
        ) {
          return false;
        }
      } else if (status !== statusFilter && status !== `${statusFilter}d`) {
        if (
          !(
            statusFilter === 'reschedule' &&
            (status === 'reschedule' || status === 'rescheduled')
          )
        ) {
          return false;
        }
      }

      if (followUpFilter !== 'all') {
        const raw = item?.rawData as any;
        const fu = raw?.follow_up;
        const hasFollowUp = Boolean(
          fu?.date || fu?.schedule || raw?.follow_up_active,
        );
        if (followUpFilter === 'true' && !hasFollowUp) return false;
        if (followUpFilter === 'false' && hasFollowUp) return false;
      }

      return true;
    });
  }, [normalizedData, listScope, statusFilter, followUpFilter]);

  const listData = loading ? [{ id: 'appointment-skeleton' }] : appointmentData;

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadMore();
  }, [loading, loadingMore, hasMore, loadMore]);

  const openReschedule = useCallback((item: any) => {
    setSelectedAppointment(item);
    setShowRescheduleModal(true);
  }, []);

  const openCancel = useCallback((item: any) => {
    setSelectedAppointment(item);
    setShowCancelModal(true);
  }, []);

  const handleReschedule = useCallback(
    async (
      appointmentId: string,
      payload: {
        action?: string;
        availability: number;
        reschedule_reason?: string;
        cancellation_reason?: string;
      },
    ) => {
      const action = payload.action || 'reschedule';
      let payloadSend: any = { action };

      switch (action) {
        case 'reschedule':
        case 'confirm_reschedule':
          payloadSend.availability = payload.availability;
          payloadSend.reschedule_reason = payload.reschedule_reason;
          break;
        case 'cancel':
          payloadSend.cancellation_reason = payload.cancellation_reason;
          break;
      }

      const res = await handleAppointmentAction({
        appointmentId,
        payload: payloadSend,
      });

      if (res?.success) {
        refreshUpcoming?.();
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        showSuccessToast(res.message, 'success');
        return;
      }
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      showSuccessToast(
        res?.message || 'You cannot reschedule multiple times',
        'error',
      );
    },
    [refreshUpcoming],
  );

  const handleCancel = useCallback(
    async (
      appointmentId: string,
      payload: { action: string; cancellation_reason: string },
    ) => {
      const res = await handleAppointmentAction({
        appointmentId,
        payload: {
          action: 'cancel',
          cancellation_reason: payload.cancellation_reason,
        },
      });

      if (res?.success) {
        refreshUpcoming?.();
        setShowCancelModal(false);
        setSelectedAppointment(null);
        showSuccessToast(res?.message, 'success');
        return;
      }
      showSuccessToast(res?.message || 'Something went wrong', 'error');
    },
    [refreshUpcoming],
  );

  const keyExtractor = useCallback(
    (item: any, index: number) =>
      loading ? item.id : item.consultation_id || String(index),
    [loading],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) =>
      loading ? (
        <AppointmentSkeletonList />
      ) : (
        <RenderAppoint
          item={item}
          navigation={props.navigation}
          isHorizontal={false}
          onReschedule={() => openReschedule(item)}
          onCancel={() => openCancel(item)}
        />
      ),
    [loading, props.navigation, openReschedule, openCancel],
  );

  const ListEmpty = useMemo(() => {
    if (loading || appointmentData.length > 0) return null;
    return (
      <EmptyState
        iconName="calendar"
        title={
          listScope === 'upcoming'
            ? 'No upcoming appointments'
            : 'No past appointments'
        }
        subtitle={
          listScope === 'upcoming'
            ? 'Book a doctor to schedule your next consultation.'
            : 'Your completed and missed visits will appear here.'
        }
      />
    );
  }, [loading, appointmentData.length, listScope]);

  const handleBookNew = useCallback(() => {
    props?.navigation.navigate('AllDoctors');
  }, [props?.navigation]);

  const resultLabel = loading
    ? 'Loading…'
    : `${appointmentData.length} ${
        appointmentData.length === 1 ? 'appointment' : 'appointments'
      }`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.topChrome}>
        <Header
          title={upcomingOnly ? 'Upcoming' : 'My Appointments'}
          subtitle={
            upcomingOnly ? 'Your next consultations' : 'Manage your visits'
          }
          onBack={() => props?.navigation.goBack()}
          rightIconName="plus"
          onRightPress={handleBookNew}
          onRefreshPress={refreshUpcoming}
          refreshing={refreshing}
        />

        {!upcomingOnly ? (
          <SegmentTabs
            tabs={[...APPOINTMENT_TABS]}
            activeKey={activeTab}
            onChange={key => handleTabChange(key as 'upcoming' | 'past')}
            variant="underline"
            style={styles.tabs}
          />
        ) : null}
      </View>

      <View style={styles.filtersBlock}>
        <FilterChips
          items={FOLLOW_UP_FILTERS}
          activeKey={followUpFilter}
          onChange={setFollowUpFilter}
        />
        <FilterChips
          items={statusChips}
          activeKey={statusFilter}
          onChange={setStatusFilter}
        />
        {!loading ? (
          <Text style={styles.resultLabel}>{resultLabel}</Text>
        ) : null}
      </View>

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        updateCellsBatchingPeriod={30}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: getListBottomPadding(insets) },
        ]}
        ListEmptyComponent={ListEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshUpcoming}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            </View>
          ) : null
        }
      />

      <RescheduleModal
        visible={showRescheduleModal}
        appointment={selectedAppointment}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
        isRescheduleRequest={
          selectedAppointment?.status?.toLowerCase() === 'reschedule'
        }
        onSubmit={payload => {
          handleReschedule(selectedAppointment?.consultation_id, {
            ...payload,
            action: (payload as any)?.action || 'reschedule',
          });
        }}
      />

      <CancelAppointmentModal
        visible={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedAppointment(null);
        }}
        onSubmit={(payload: any) => {
          handleCancel(selectedAppointment?.consultation_id, payload);
        }}
      />
    </SafeAreaView>
  );
};

export default AppointmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topChrome: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EEF0',
  },
  tabs: {
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    borderWidth: 0,
    borderRadius: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F6',
  },
  filtersBlock: {
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EBE8',
  },
  chipActive: {
    backgroundColor: Colors.onfillColor,
    borderColor: Colors.primaryColor,
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resultLabel: {
    marginTop: 2,
    paddingHorizontal: 16,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
