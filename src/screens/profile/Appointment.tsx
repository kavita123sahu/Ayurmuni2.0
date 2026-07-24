import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../common/Colors';
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
import { normalizeAppointmentListItem,  } from '../../utils/appointmentUtils';
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

const AppointmentScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { AppointData, refreshUpcoming, loading, loadMore, hasMore, loadingMore, refreshing } =
    useAppointmentHistory();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const prefetchAttemptsRef = useRef(0);
  const MAX_TAB_PREFETCH = 10;

  // ---- Normalize karo sirf ek baar jab AppointData change ho ----
  const normalizedData = useMemo(() => {
    if (loading) return [];
    return (AppointData ?? []).map((item: any) => normalizeAppointmentListItem(item));
  }, [AppointData, loading]);

  // ---- Tab switch pe API call NAHI hoti, sirf client-side filter ----
  const appointmentData = useMemo(() => {
    return normalizedData.filter((item) =>
      activeTab === 'upcoming'
        ? UPCOMING_STATUS.includes(item.status)
        : PAST_STATUS.includes(item.status)
    );
  }, [normalizedData, activeTab]);

  const listData = loading ? [{ id: 'appointment-skeleton' }] : appointmentData;

  // Load more when the active tab has no matches yet (e.g. upcoming on page 2+).
  useEffect(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    if (appointmentData.length > 0) {
      prefetchAttemptsRef.current = 0;
      return;
    }

    if ((AppointData ?? []).length === 0) {
      return;
    }

    if (prefetchAttemptsRef.current >= MAX_TAB_PREFETCH) {
      return;
    }

    prefetchAttemptsRef.current += 1;
    loadMore();
  }, [
    loading,
    loadingMore,
    hasMore,
    appointmentData.length,
    AppointData,
    activeTab,
    loadMore,
  ]);

  useEffect(() => {
    prefetchAttemptsRef.current = 0;
  }, [activeTab]);

  // ---- Tab change ka stable callback ----
  const handleTabChange = useCallback((tab: 'upcoming' | 'past') => {
    setActiveTab(tab);
  }, []);

  // ---- Modal open handlers stable rakho ----
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
      }
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

      const res = await handleAppointmentAction({ appointmentId, payload: payloadSend });

      if (res?.success) {
        refreshUpcoming?.();
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        showSuccessToast(res.message, 'success');
        return;
      }
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      showSuccessToast(res?.message || 'You cannot reschedule multiple times', 'error');
    },
    [refreshUpcoming]
  );

  const handleCancel = useCallback(
    async (appointmentId: string, payload: { action: string; cancellation_reason: string }) => {
      const payloadSend: any = {
        action: payload.action,
        cancellation_reason: payload.cancellation_reason,
      };

      const res = await handleAppointmentAction({ appointmentId, payload: payloadSend });

      if (res?.success) {
        refreshUpcoming?.();
        setShowCancelModal(false);
        setSelectedAppointment(null);
        showSuccessToast(res?.message, 'success');
        return;
      }
      showSuccessToast(res?.message || 'Something went wrong', 'error');
    },
    [refreshUpcoming]
  );

  // ---- keyExtractor + renderItem ab stable hain, FlatList unnecessarily re-render nahi karegi ----
  const keyExtractor = useCallback(
    (item: any, index: number) => (loading ? item.id : item.consultation_id || String(index)),
    [loading]
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
    [loading, props.navigation, openReschedule, openCancel]
  );

  const ListEmpty = useMemo(() => {
    if (loading || appointmentData.length > 0) return null;
    return (
      <EmptyState
        iconName="star"
        title={activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Past Appointments'}
        subtitle={
          activeTab === 'upcoming'
            ? 'You have no upcoming appointments.'
            : 'You have no past appointments.'
        }
      />
    );
  }, [loading, appointmentData.length, activeTab]);

  const handleBookNew = useCallback(() => {
    props?.navigation.navigate('AllDoctors');
  }, [props?.navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Appointments"
        subtitle="Manage your visits "
        onBack={() => props?.navigation.goBack()}
        rightIconName="plus"
        onRightPress={handleBookNew}
        onRefreshPress={refreshUpcoming}
      />

      <SegmentTabs
        tabs={[...APPOINTMENT_TABS]}
        activeKey={activeTab}
        onChange={key => handleTabChange(key as 'upcoming' | 'past')}
        variant="underline"
      />

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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshUpcoming}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#0D614E" /> : null}
      />

      <RescheduleModal
        visible={showRescheduleModal}
        appointment={selectedAppointment}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
        isRescheduleRequest={selectedAppointment?.status?.toLowerCase() === 'reschedule'}
        onSubmit={(payload) => {
          handleReschedule(selectedAppointment?.consultation_id, payload);
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
  listContent: {
    paddingTop: SPACING.lg,
    flexGrow: 1,
  },
});