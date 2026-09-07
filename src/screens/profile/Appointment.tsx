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
import {
  getListBottomPadding,
  getScreenPaddingH,
  SPACING,
} from '../../constants/responsive';

const APPOINTMENT_TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
] as const;

const FOLLOW_UP_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'true', label: 'Follow-up' },
  { key: 'false', label: 'Regular' },
] as const;

const UPCOMING_STATUS_FILTERS = [
  { key: 'all', label: 'All status' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'reschedule', label: 'Reschedule' },
] as const;

const PAST_STATUS_FILTERS = [
  { key: 'all', label: 'All status' },
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

  // Reset status chip when switching upcoming ↔ past
  const handleTabChange = useCallback((tab: 'upcoming' | 'past') => {
    setActiveTab(tab);
    setStatusFilter('all');
  }, []);

  const apiFilters = useMemo(() => {
    const filters: { appointment_status?: string; follow_up?: string } = {};

    if (statusFilter !== 'all') {
      filters.appointment_status = statusFilter;
    } else {
      filters.appointment_status = listScope; // 'upcoming' | 'past'
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

  // Soft client guard (API already filtered by status/follow_up when supported)
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
        // allow reschedule / rescheduled
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
        iconName="star"
        title={
          listScope === 'upcoming'
            ? 'No Upcoming Appointments'
            : 'No Past Appointments'
        }
        subtitle={
          listScope === 'upcoming'
            ? 'You have no upcoming appointments for these filters.'
            : 'You have no past appointments for these filters.'
        }
      />
    );
  }, [loading, appointmentData.length, listScope]);

  const handleBookNew = useCallback(() => {
    props?.navigation.navigate('AllDoctors');
  }, [props?.navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={upcomingOnly ? 'Upcoming Appointments' : 'My Appointments'}
        subtitle={
          upcomingOnly
            ? 'Your next visits'
            : 'Manage your visits'
        }
        onBack={() => props?.navigation.goBack()}
        rightIconName="plus"
        onRightPress={handleBookNew}
        onRefreshPress={refreshUpcoming}
      />

      {!upcomingOnly ? (
        <SegmentTabs
          tabs={[...APPOINTMENT_TABS]}
          activeKey={activeTab}
          onChange={key => handleTabChange(key as 'upcoming' | 'past')}
          variant="underline"
        />
      ) : null}

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
            <ActivityIndicator size="small" color="#0D614E" />
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
    paddingHorizontal: getScreenPaddingH(),
    backgroundColor: '#F7F8FA',
  },
  filtersBlock: {
    marginTop: SPACING.sm,
    marginBottom: 4,
    gap: 10,
  },
  chipRow: {
    paddingVertical: 2,
    gap: 8,
    paddingRight: 5,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: Colors.onfillColor,
    borderColor: Colors.primaryColor,
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  chipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  listContent: {
    paddingTop: SPACING.md,
    flexGrow: 1,
  },
});
