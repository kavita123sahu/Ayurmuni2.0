import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { Styles } from '../../common/Styles';
import { Fonts } from '../../common/Fonts';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import * as _CONSULT_SERVICE from '../../services/ConsultServce';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentDetailSkeleton } from '../../simmerScreen/ShimmerHook';
import RescheduleModal from '../../components/RescheduleModal';
import CancelAppointmentModal from '../../components/CancelAppointModal';
import { handleAppointmentAction } from '../../hooks/AppointmentData';
import { showSuccessToast } from '../../config/Key';
import { Utils } from '../../common/Utils';
import { doctorsData } from '../../common/DataInterface';



const PrimaryButton = ({
  title,
  onPress,
  page
}: {
  title: string;
  page: string
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: page == 'appoint' ? Colors.primaryColor : Colors.errorColor }]} onPress={onPress}>
      <View style={styles.content}>
        <Ionicons name="videocam" size={18} color="#fff" />
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

type Props = {
  data: any;
  navigation: any;
  token: any;
}

const DoctorDetail = ({ data, navigation, token }: Props) => {

  const appointmentData = {
    doctorName:
      data?.doctor?.doctor_name || "",

    consultationId:
      data?.appointment?.consultation_id,
  };


  console.log("appointmentData--->", appointmentData);


  return (
    <View style={styles.card}>
      <View style={styles.row}>

        <Image source={data?.doctor?.doctor_image ? { uri: data?.doctor?.doctor_image } : Images.doctorImage} style={styles.avatar} />

        <View>
          <Text style={Styles.name}>{data?.doctor?.doctor_name}</Text>
          <Text style={[Styles.specialty, { color: Colors.primaryColor }]}>{data?.doctor?.doctor_specialization}</Text>
        </View>
      </View>


      <View style={styles.dateTimeBox}>

        <View style={styles.dtItem}>
          <View style={styles.iconCircle}>
            <Image source={Images.calender} style={Styles.IconSize} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{data?.appointment?.appointment_date}</Text>
          </View>
        </View>
        {/* TIME */}
        <View style={styles.dtItem}>
          <View style={styles.iconCircle}>
            <Image source={Images.clock} style={Styles.IconSize} />
          </View>



          <View style={styles.textContainer}>
            <Text style={styles.label}>TIME</Text>
            <Text style={styles.value}>{data?.appointment?.start_time}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 10 }}>



        <PrimaryButton title="Join Video Call" page='appoint' onPress={() => navigation.navigate('PatientVideoCallScreen', {
          consultationId: appointmentData?.consultationId,
          doctorName: appointmentData?.doctorName,
        })}
        />

        {/* <PrimaryButton title="Join Video Call" page='appoint' onPress={async () => {
          const url = `https://3twgj6xg-3000.inc1.devtunnels.ms/patvideocall/${token}/${appointmentData?.consultationId}`;

          if (url) {
            const supported =
              await Linking.canOpenURL(url);

            if (supported) {
              await Linking.openURL(url);
            }
          }
        }} /> */}

        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Chat with Doctor</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.techText}>
        Technical Check: Test Audio & Video
      </Text>
    </View>
  )
}


const AppointmentDetailScreen = ({ route, navigation }: any) => {
  const { consultation_id } = route.params;

  const [loading, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] =
    useState(false);
  const [token, setToken] = useState('');

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const res = await _CONSULT_SERVICE.getAppointmentDetail(consultation_id);

      console.log("DETAILRES", res);

      setDetail(res?.data);

    } catch (error) {
      console.log("DETAIL ERROR", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const init = async () => {
      const userToken =
        await Utils.getData('_TOKEN');
      console.log("tokennn", userToken)

      setToken(userToken);

    };

    init();
    fetchDetail();
  }, [])




  const normalizedAppointment = useMemo(() => {
    if (!detail?.appointment) return null;

    const item = detail;

    return {
      consultation_id: consultation_id,
      doctorName: item.doctor?.doctor_name || "",
      specialty:
        item.doctor?.doctor_specialization ||
        "General Physician",
      date: item.appointment?.appointment_date,
      time: item?.appointment?.start_time,
      status: item?.appointment?.appointment_status,
      image: item.doctor?.doctor_image,
      availability: item.availability || [],
      rawData: item,
    };
  }, [detail]);


  const STATUS = normalizedAppointment?.status === 'cancelled';

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
      action: "reschedule",
      availability: payload.availability,
      reschedule_reason:
        payload.reschedule_reason,
    });
    console.log("res--->>", res);


    if (res?.success) {
      fetchDetail?.();
      showSuccessToast(res?.message, 'success');
    }

    setShowRescheduleModal(false);
    showSuccessToast(res.message || "You cannot reschedule multiple times", 'error')
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
      // fetchDetail?.();
      navigation.navigate('Appointments')
      showSuccessToast(res?.message, "success");
    }
    setShowCancelModal(false);
    showSuccessToast(res?.message, 'error')
  };

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle={'dark-content'} backgroundColor={"#FFFFFF"} />

      <AppHeader
        title="Appointment Details"
        leftIcon={Images.backIcon}
        onLeftPress={() => navigation.goBack()}
        rightIcon="search"
        onRightPress={() => console.log('Search clicked')}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#FDFDFB' }}>


        {loading ? <AppointmentDetailSkeleton />
          :
          <>
            <DoctorDetail data={detail} token={token} navigation={navigation} />

            <Text style={styles.sectionTitle}>Patient Information</Text>

            <View style={styles.card}>

              <View style={styles.infoRow}>
                <Text style={Styles.label}>Name</Text>
                <Text style={Styles.value}>{detail?.appointment?.patient?.patient_name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={Styles.label}>Age</Text>
                <Text style={Styles.value}>{detail?.appointment?.patient?.age}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={Styles.label}>Gender</Text>
                <Text style={Styles.value}>{detail?.appointment?.patient?.gender}</Text>
              </View>

            </View>

            <Text style={styles.sectionTitle}>Reason for Visit</Text>

            <View style={styles.card}>
              <Text style={styles.reason}>{detail?.appointment?.concern}</Text>
            </View>


            {!STATUS && (<View style={{ paddingHorizontal: 10 }}>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => {
                console.log("Reschedule Clicked");
                setShowRescheduleModal(true);
              }} >
                <Text style={Styles.outlineText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                console.log("Cancel Clicked");
                setShowCancelModal(true);
              }}>
                <Text style={Styles.cancelText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </View>
            )}

          </>}

        <RescheduleModal
          visible={showRescheduleModal}
          appointment={normalizedAppointment}
          // slots={normalizedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            // navigation.goback();
            // setSelectedAppointment(null);
          }}
          onSubmit={(payload) => {
            handleReschedule(
              normalizedAppointment?.consultation_id,
              payload
            );
            setShowRescheduleModal(false);
          }}
        />

        <CancelAppointmentModal
          visible={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            // navigation.goBack()

          }}
          onSubmit={(payload: any) => {
            handleCancel(
              normalizedAppointment?.consultation_id,
              payload
            );

            setShowCancelModal(false);
          }}
        />



      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 80,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 6,
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderColor

  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginRight: 12,
  },

  dateTimeBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  dtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.bgcolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  icon: {
    fontSize: 18,
    marginRight: 10,
  },

  textContainer: {
    flexDirection: 'column',
  },

  label: {
    marginBottom: 2,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  value: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    color: '#0F172A',
  },

  primaryBtn: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },

  secondaryBtn: {
    backgroundColor: '#E6F4EE',
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#0A8F5A',
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },

  techText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#0A8F5A',
    textAlign: 'center',
  },



  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },



  reason: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: Fonts.PoppinsMedium,
    fontStyle: 'italic'
  },

  outlineBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0D614E99',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 30,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },


});