import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
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

// ---- TabButton bahar nikala + memo lagaya ----
// Ab yeh sirf apne props (activeTab) change hone pe hi re-render hoga,
// aur parent ke har render pe "naya component" ban ke remount NAHI hoga.
const TabButton = React.memo(
  ({
    activeTab,
    onChange,
  }: {
    activeTab: 'upcoming' | 'past';
    onChange: (tab: 'upcoming' | 'past') => void;
  }) => {
    return (
      <View style={styles.tabWrapper}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onChange('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
          {activeTab === 'upcoming' && <View style={styles.indicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onChange('past')}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
          {activeTab === 'past' && <View style={styles.indicator} />}
        </TouchableOpacity>
      </View>
    );
  }
);

const AppointmentScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { AppointData, refreshUpcoming, loading, loadMore, hasMore, loadingMore } =
    useAppointmentHistory();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // ---- Normalize karo sirf ek baar jab AppointData change ho ----
  const normalizedData = useMemo(() => {
    if (loading) return [];
    return (AppointData ?? []).map((item: any) => ({
      consultation_id: item.consultation_id,
      doctorName: item.doctor?.doctor_name || '',
      therapies: Array.isArray(item?.doctor?.health_diseases)
        ? item.doctor.health_diseases.map((i: any) => i.name).join(', ')
        : '',
      date: item.appointment_date,
      time: item.start_time,
      status: item.appointment_status,
      call_status: item.call_status,
      image: item.doctor?.doctor_image,
      rawData: item,
    }));
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

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Appointments"
        subtitle="Manage your visits "
        onBack={() => props?.navigation.goBack()}
      />

      <TabButton activeTab={activeTab} onChange={handleTabChange} />

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
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={ListEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
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

      <TouchableOpacity
        style={[styles.bookBtn, { bottom: insets.bottom + 16 }]}
        onPress={() => props?.navigation.navigate('AllDoctors')}
      >
        <Text style={styles.bookText}>+ Book New Appointment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AppointmentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#F7F8FA' },
  header: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    marginVertical: 16,
    color: Colors.textColor || '#000',
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginTop: 4,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 14, color: '#999', fontFamily: Fonts.PoppinsMedium },
  activeTabText: { color: Colors.primaryColor, fontFamily: Fonts.PoppinsSemiBold },
  indicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.primaryColor, borderRadius: 2 },
  listContent: {
    paddingTop: 16,
    paddingBottom: 96,
    flexGrow: 1,
  },
  bookBtn: {
    position: 'absolute',
    backgroundColor: Colors.primaryColor,
    left: 0,
    right: 0,
    paddingVertical: 16,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  bookText: { color: '#fff', fontFamily: Fonts.PoppinsSemiBold, fontSize: 16 },
});