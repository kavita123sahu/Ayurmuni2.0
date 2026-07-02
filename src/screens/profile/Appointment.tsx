import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { Styles } from '../../common/Styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../type';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointmentHistory, useConsultData } from '../../hooks/useConsultData';
import { Appointment, getStatusStyle, PAST_STATUS, UPCOMING_STATUS } from '../../common/DataInterface';
import EmptyState from '../../components/EmptyState';
import RenderAppoint from '../../components/RenderAppoint';
import { AppointmentSkeletonList } from '../../simmerScreen/ShimmerHook';
import RescheduleModal from '../../components/RescheduleModal';
import CancelAppointmentModal from '../../components/CancelAppointModal';
import { appointmentActionAPI } from '../../services/ConsultServce';
import { showSuccessToast } from '../../config/Key';
import { handleAppointmentAction } from '../../hooks/AppointmentData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


const AppointmentScreen = (props: any) => {

  const { AppointData, refreshUpcoming, loading } = useAppointmentHistory();
  // ✅ FIX
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showRescheduleModal, setShowRescheduleModal] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<any>(null);
  const normalizedData = useMemo(() => {
    if (loading) return [];

    return (AppointData ?? []).map(item => ({
      consultation_id: item.consultation_id,
      doctorName: item.doctor?.doctor_name || "",
      therapies: Array.isArray(item?.doctor?.health_diseases)
        ? item.doctor.health_diseases.map(i => i.name).join(", ")
        : "",
      date: item.appointment_date,
      time: item.start_time,
      status: item.appointment_status,
      call_status: item.call_status,
      image: item.doctor?.doctor_image,
      rawData: item,
    }));
  }, [AppointData, loading]);

  const appointmentData = useMemo(() => {
    return normalizedData.filter(item =>
      activeTab === "upcoming"
        ? UPCOMING_STATUS.includes(item.status)
        : PAST_STATUS.includes(item.status)
    );
  }, [normalizedData, activeTab]);

  const skeletonData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: `skeleton-${index}`,
      })),
    [],
  );


  const listData = loading ? skeletonData : appointmentData;

  const TabButton = () => {
    return (
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
          {activeTab === 'upcoming' && <View style={styles.indicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.activeTabText,
            ]}
          >
            Past
          </Text>
          {activeTab === 'past' && <View style={styles.indicator} />}
        </TouchableOpacity>
      </View>
    )
  }




  const handleReschedule = async (
    appointmentId: string,
    payload: {
      action: string;
      availability: number;
      reschedule_reason: string;
      cancellation_reason?: string;
    }
  ) => {
    console.log("appointmentIdpayload", appointmentId);
    console.log("payload--->>", payload);

    let payloadSend: any = {
      action: payload.action,
    };

    switch (payload.action) {
      case "reschedule":
        payloadSend.availability = payload.availability;
        payloadSend.reschedule_reason = payload.reschedule_reason;
        break;

      case "confirm_reschedule":
        payloadSend.availability = payload.availability;
        payloadSend.reschedule_reason = payload.reschedule_reason;
        break;

      case "cancel":
        payloadSend.cancellation_reason = payload.cancellation_reason;
        break;
    }
    console.log("payloadSend--->>", payloadSend);

    const res = await handleAppointmentAction({
      appointmentId,
      payload: payloadSend,
    });
    console.log("res--->>", res);

    if (res?.success) {
      refreshUpcoming?.();
      setShowRescheduleModal(false);
      showSuccessToast(res.message, "success");
      return;
    }
    setShowRescheduleModal(false);
    showSuccessToast(res.message, 'error')
    setSelectedAppointment(null);
    showSuccessToast(
      res?.message || "You cannot reschedule multiple times",
      "error"
    );
  };

  const handleCancel = async (
    appointmentId: string,
    payload: {
      action: string;
      cancellation_reason: string;
    }
  ) => {
    console.log("appointmentId", appointmentId);
    console.log("payloadcanclee", payload);

    let payloadSend: any = {
      action: payload.action,
      cancellation_reason: payload.cancellation_reason,
    };

    console.log("payloadSendcancel--->>", payloadSend);

    const res = await handleAppointmentAction({
      appointmentId,
      payload: payloadSend
    });

    console.log("rescancel---->>", res);

    if (res?.success) {
      refreshUpcoming?.();
      setShowCancelModal(false);
      setSelectedAppointment(null);
      showSuccessToast(res?.message, "success");
      return;
    }

    showSuccessToast(res?.message || "Something went wrong", "error");
  };


  useEffect(() => {
    console.log("showRescheduleModal", showRescheduleModal);
  }, [showRescheduleModal]);


  return (
    <SafeAreaView style={styles.container}>

      <Header
        title="My Appointments"
        subtitle="Manage your visits "
        backIcon={Images.backIcon}
        onBack={() => { props?.navigation.goBack() }}
      />

      <TabButton />

      <FlatList
        data={listData}
        keyExtractor={(item, index) =>
          loading
            ? `skeleton-${index}`
            : item.consultation_id
        }
        renderItem={({ item }) =>
          loading ? (
            <AppointmentSkeletonList />
          ) : (
            <RenderAppoint
              item={item}
              navigation={props.navigation}
              isHorizontal={false}
              onReschedule={() => {
                setSelectedAppointment(item);
                setShowRescheduleModal(true);
              }}
              onCancel={() => {
                setSelectedAppointment(item);
                setShowCancelModal(true);
              }}
            />
          )
        }
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        updateCellsBatchingPeriod={30}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          !loading && appointmentData.length === 0 ? (
            <EmptyState
              image={Images.starEmpty}
              title={
                activeTab === "upcoming"
                  ? "No Upcoming Appointments"
                  : "No Past Appointments"
              }
              subtitle={
                activeTab === "upcoming"
                  ? "You have no upcoming appointments."
                  : "You have no past appointments."
              }
            />
          ) : null
        }
      />

      <RescheduleModal
        visible={showRescheduleModal}
        appointment={selectedAppointment}
        // slots={selectedAppointment}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
        isRescheduleRequest={selectedAppointment?.status.toLowerCase() === 'reschedule'}
        onSubmit={(payload) => {
          handleReschedule(
            selectedAppointment?.consultation_id,
            payload
          );
          setShowRescheduleModal(false);
        }}
      />

      <CancelAppointmentModal
        visible={showCancelModal}
        onClose={() => {

          setShowCancelModal(false);
          setSelectedAppointment(null);
        }}
        onSubmit={(payload: any) => {
          handleCancel(
            selectedAppointment?.consultation_id,
            payload
          );

          setShowCancelModal(false);
        }}
      />



      <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('AllDoctors')}>
        <Text style={styles.bookText}>+ Book New Appointment</Text>
      </TouchableOpacity>




    </SafeAreaView>
  );
};

export default AppointmentScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F7F8FA',
  },

  header: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    marginVertical: 16,
    color: Colors.textColor || '#000',
  },

  /* Tabs */
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },

  tabItem: {
    flex: 1, // 🔥 equal width dono tabs ka
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative', // 🔥 important for indicator
  },

  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: Fonts.PoppinsMedium,
  },

  activeTabText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  indicator: {
    position: 'absolute',
    bottom: 0, // 🔥 always bottom pe chipka rahega
    left: 0,
    right: 0, // 🔥 full width of tab
    height: 3,
    backgroundColor: Colors.primaryColor,
    borderRadius: 2,
  },
  icon: {
    fontSize: 14,
  },




  btnRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  outlineBtn: {
    flex: 1,
    height: 47,
    borderWidth: 1,
    borderColor: '#0F5B4D4D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    height: 47,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },

  cancelBtn: {
    marginTop: 14,
    height: 47,
    backgroundColor: '#F43F5E0D',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },

  bookBtn: {
    position: 'absolute',

    backgroundColor: Colors.primaryColor,
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  bookText: {
    color: '#fff',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
  },
});