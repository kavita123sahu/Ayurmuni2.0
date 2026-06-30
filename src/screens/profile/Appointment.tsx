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


const AppointmentScreen = () => {

  const { AppointData, getAllAppointment, loading } = useAppointmentHistory();
  const navigation = useNavigation<NavigationProp>(); // ✅ FIX
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showRescheduleModal, setShowRescheduleModal] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<any>(null);




  const normalizedData = useMemo(() => {
    const data = AppointData || [];

    return data.map(item => ({
      consultation_id: item.consultation_id,
      doctorName: item.doctor?.doctor_name || "",
      therapies: Array.isArray(item?.health_diseases)
        ? item.health_diseases.map(disease => disease.name).join(", ")
        : "",
      // specialty: item.doctor?.doctor_specialization || "General Physician",
      date: item.appointment_date,
      time: item.start_time,
      status: item.appointment_status,
      image: item.doctor?.doctor_image,
      rawData: item,
    }));
  }, [AppointData]);


  const appointmentData = useMemo(() => {
    return normalizedData.filter(item =>
      activeTab === "upcoming"
        ? UPCOMING_STATUS.includes(item.status)
        : PAST_STATUS.includes(item.status)
    );
  }, [normalizedData, activeTab]);


  const listData = loading
    ? Array.from({ length: 5 }, (_, i) => ({ id: i, skeleton: true }))
    : appointmentData;

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
      availability: any;
      reschedule_reason: string;
    }
  ) => {
    console.log("appointmentId", appointmentId);
    console.log("payload", payload);

    const res = await handleAppointmentAction({
      appointmentId,
      action: "confirm_reschedule",
      availability: payload.availability,
      reschedule_reason:
        payload.reschedule_reason,
    });
    console.log("res--->>", res);


    if (res?.success) {
      getAllAppointment?.();
      showSuccessToast(res?.message, 'success');
    }

    setShowRescheduleModal(false);
    showSuccessToast(res.message, 'error')
    setSelectedAppointment(null);
  };


  const handleCancel = async (
    appointmentId: string,
    reason: any
  ) => {
    console.log("appointmentId", appointmentId);
    console.log("reason", reason);
    const res = await handleAppointmentAction({
      appointmentId,
      action: "cancel",
      cancellation_reason: reason?.cancellation_reason || "",
    });

    console.log("rescancel---->>", res);
    if (res?.success) {
      getAllAppointment?.();
      showSuccessToast(res?.message, 'success');
    }
    setShowCancelModal(false);
    showSuccessToast(res?.message, 'error')
    setSelectedAppointment(null);
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
        onBack={() => { navigation.goBack() }}
      />

      <TabButton />

      <FlatList
        data={listData}
        renderItem={({ item }) =>
          loading ? (
            <AppointmentSkeletonList />
          ) : (
            <RenderAppoint
              item={item}
              navigation={navigation}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          appointmentData.length === 0 ? (
            <EmptyState
              image={Images.starEmpty} // apni image
              title={
                activeTab === 'upcoming'
                  ? 'No Upcoming Appointments'
                  : 'No Past Appointments'
              }
              subtitle={
                activeTab === 'upcoming'
                  ? 'You have no upcoming appointments.'
                  : 'You have no past appointments.'
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