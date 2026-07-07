// import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Linking,
//   BackHandler,
// } from 'react-native';
// import AppHeader from '../../components/AppHeader';
// import { useNavigation } from '@react-navigation/native';
// import { Styles } from '../../common/Styles';
// import { Fonts } from '../../common/Fonts';
// import { Ionicons } from '../../common/Vector';
// import { Colors } from '../../common/Colors';
// import { Images } from '../../common/Images';
// import * as _CONSULT_SERVICE from '../../services/ConsultServce';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AppointmentDetailSkeleton } from '../../simmerScreen/ShimmerHook';
// import RescheduleModal from '../../components/RescheduleModal';
// import CancelAppointmentModal from '../../components/CancelAppointModal';
// import { handleAppointmentAction } from '../../hooks/AppointmentData';
// import { showSuccessToast } from '../../config/Key';
// import { Utils } from '../../common/Utils';
// import { doctorsData } from '../../common/DataInterface';
// import FeedbackModal from '../FeedbackModal';
// import { useCreateReview } from '../../hooks/useCreateReview';



// const PrimaryButton = ({
//   title,
//   onPress,
//   page
// }: {
//   title: string;
//   page: string
//   onPress?: () => void;
// }) => {
//   return (
//     <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: page == 'appoint' ? Colors.primaryColor : Colors.errorColor }]} onPress={onPress}>
//       <View style={styles.content}>
//         <Ionicons name="videocam" size={18} color="#fff" />
//         <Text style={styles.primaryText}>{title}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// type Props = {
//   data: any;
//   refreshData: () => void;
//   navigation: any;
//   token: any;
// }


// const DoctorDetail = ({ data, refreshData, navigation, token }: Props) => {
//   console.log("data?.appointment?.call_status", data)
//   const appointmentData = {
//     doctorName:
//       data?.doctor?.doctor_name || "",

//     doctor_image: data?.doctor?.doctor_image || "",

//     consultationId:
//       data?.appointment?.consultation_id,

//   };

//   const [showModal, setShowModal] = useState(false);
//   const { loading, submitReview } = useCreateReview();


//   const shouldShowReviewModal =
//     data?.appointment?.appointment_status?.toLowerCase() === "completed" &&
//     data?.appointment?.review?.is_rated === false;

//   useEffect(() => {
//     if (!shouldShowReviewModal) return;

//     const timer = setTimeout(() => {
//       setShowModal(true);
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [shouldShowReviewModal]);

//   useEffect(() => {
//     if (!showModal) return;

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       () => true // back disable
//     );

//     return () => backHandler.remove();
//   }, [showModal]);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       gestureEnabled: !showModal,
//     });
//   }, [navigation, showModal]);

//   const handleReviewSubmit = async ({
//     rating,
//     review,
//   }: {
//     rating: number;
//     review: string;
//   }) => {
//     const response = await submitReview({
//       entityType: "doctor",
//       appointmentId: appointmentData?.consultationId,
//       reviewData: {
//         rating,
//         review,
//         image_urls: [], // optional
//       },
//     });

//     console.log("responseeeeeee--->>", response);

//     if (response?.success) {
//       showSuccessToast(response?.message, "success");

//       setShowModal(false);

//       refreshData();

//       return;
//     }

//     showSuccessToast(
//       response?.message || "Unable to submit review",
//       "error"
//     );
//   };
//   console.log("appointmentDatacallsrtsst--->", data?.appointment);


//   return (
//     <View style={styles.card}>
//       <View style={styles.row}>

//         <Image source={data?.doctor?.doctor_image ? { uri: data?.doctor?.doctor_image } : Images.doctorImage} style={styles.avatar} />

//         <View>
//           <Text style={Styles.name}>{data?.doctor?.doctor_name}</Text>
//           <Text style={[Styles.specialty, { color: Colors.primaryColor }]}>{data?.doctor?.doctor_specialization}</Text>
//         </View>
//       </View>


//       <View style={styles.dateTimeBox}>

//         <View style={styles.dtItem}>
//           <View style={styles.iconCircle}>
//             <Image source={Images.calender} style={Styles.IconSize} />
//           </View>

//           <View style={styles.textContainer}>
//             <Text style={styles.label}>DATE</Text>
//             <Text style={styles.value}>{data?.appointment?.appointment_date}</Text>
//           </View>
//         </View>
//         {/* TIME */}
//         <View style={styles.dtItem}>
//           <View style={styles.iconCircle}>
//             <Image source={Images.clock} style={Styles.IconSize} />
//           </View>



//           <View style={styles.textContainer}>
//             <Text style={styles.label}>TIME</Text>
//             <Text style={styles.value}>{data?.appointment?.start_time}</Text>
//           </View>
//         </View>
//       </View>



//       {data?.appointment?.call_status === 'in_progress' && (

//         <View style={{ paddingHorizontal: 10 }}>

//           <PrimaryButton title="Join Video Call" page='appoint' onPress={() => {
//             console.log("appointmentData?.consultationId", appointmentData?.consultationId)
//             navigation.navigate('PatientVideoCallScreen', {
//               appointmentId: appointmentData?.consultationId,
//               // call_status: data?.appointment?.call_status,
//               role: "patient",
//               otherPartyImage: appointmentData?.doctor_image,
//               // doctorID: data?.doctor?.doctor_id,
//               otherPartyName: appointmentData?.doctorName,
//               // onExit: () => navigation.goBack()
//             })
//           }} />

//           {/* <PrimaryButton title="Join Video Call" page='appoint' onPress={async () => {
//             const url = `https://3twgj6xg-3000.inc1.devtunnels.ms/patvideocall/${token}/${appointmentData?.consultationId}`;

//             if (url) {
//               const supported =
//                 await Linking.canOpenURL(url);

//               if (supported) {
//                 await Linking.openURL(url);
//               }
//             }
//           }} /> */}

//           <TouchableOpacity style={styles.secondaryBtn} onPress={() => {
//             navigation.navigate('ChatScreen', {
//               // doctorId: data?.doctor?.doctor_id,
//               otherPartyName: data?.doctor?.doctor_name,
//               otherPartyAvatarUrl: data?.doctor?.doctor_image,
//               appointment_id: data?.appointment?.consultation_id,
//             })
//           }}>


//             <Text style={styles.secondaryText}>Chat with Doctor</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <FeedbackModal
//         visible={showModal}
//         loading={loading}
//         onClose={() => setShowModal(false)}
//         onSubmit={handleReviewSubmit}
//       />

//     </View>
//   )
// }


// const AppointmentDetailScreen = ({ route, navigation }: any) => {
//   const { consultation_id } = route.params;

//   console.log("consultation_idconsultation_idconsultation_id", consultation_id)

//   const [loading, setLoading] = React.useState(true);
//   const [detail, setDetail] = React.useState<any>(null);
//   const [showRescheduleModal, setShowRescheduleModal] =
//     useState(false);
//   const [token, setToken] = useState('');

//   const [showCancelModal, setShowCancelModal] =
//     useState(false);

//   const fetchDetail = async () => {
//     try {
//       setLoading(true);

//       const res = await _CONSULT_SERVICE.getAppointmentDetail(consultation_id);

//       console.log("DETAILRES", res);

//       setDetail(res?.data);

//     } catch (error) {
//       showSuccessToast("Something went wrong", "error");
//       console.log("DETAIL ERROR", error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     const init = async () => {
//       const userToken =
//         await Utils.getData('_TOKEN');
//       console.log("tokennn", userToken)

//       setToken(userToken);

//     };

//     init();
//     fetchDetail();
//   }, [])




//   const normalizedAppointment = useMemo(() => {
//     if (!detail?.appointment) return null;

//     const item = detail;

//     return {
//       consultation_id: consultation_id,
//       doctorName: item.doctor?.doctor_name || "",
//       specialty:
//         item.doctor?.doctor_specialization ||
//         "General Physician",
//       date: item.appointment?.appointment_date,
//       time: item?.appointment?.start_time,
//       status: item?.appointment?.appointment_status,
//       call_status: item?.appointment?.call_status,
//       image: item.doctor?.doctor_image,
//       availability: item.availability || [],
//       rawData: item,
//     };
//   }, [detail]);


//   const appointmentStatus = normalizedAppointment?.status?.toLowerCase();

//   const showButtons = ![
//     'cancelled',
//     'completed',
//     'rescheduled',
//   ].includes(appointmentStatus);

//   const isRescheduleRequest =
//     appointmentStatus === 'reschedule';


//   const handleReschedule = async (
//     appointmentId: string,
//     payload: {
//       action: string;
//       availability: number;
//       reschedule_reason: string;
//       cancellation_reason?: string;
//     }
//   ) => {
//     console.log("appointmentIdpayload", appointmentId);
//     console.log("payload--->>", payload);

//     let payloadSend: any = {
//       action: payload.action,
//     };

//     switch (payload.action) {
//       case "reschedule":
//         payloadSend.availability = payload.availability;
//         payloadSend.reschedule_reason = payload.reschedule_reason;
//         break;

//       case "confirm_reschedule":
//         payloadSend.availability = payload.availability;
//         payloadSend.reschedule_reason = payload.reschedule_reason;
//         break;

//       case "cancel":
//         payloadSend.cancellation_reason = payload.cancellation_reason;
//         break;
//     }
//     console.log("payloadSend--->>", payloadSend);

//     const res = await handleAppointmentAction({
//       appointmentId,
//       payload: payloadSend,
//     });
//     console.log("res--->>", res);

//     if (res?.success) {
//       fetchDetail?.();
//       setShowRescheduleModal(false);
//       showSuccessToast(res.message, "success");
//       return;
//     }

//     showSuccessToast(
//       res?.message || "You cannot reschedule multiple times",
//       "error"
//     );
//   };



//   const handleCancel = async (
//     appointmentId: string,
//     payload: {
//       action: string;
//       cancellation_reason: string;
//     }
//   ) => {
//     console.log("appointmentId", appointmentId);
//     console.log("payloadcanclee", payload);

//     let payloadSend: any = {
//       action: payload.action,
//       cancellation_reason: payload.cancellation_reason,
//     };

//     console.log("payloadSendcancel--->>", payloadSend);

//     const res = await handleAppointmentAction({
//       appointmentId,
//       payload: payloadSend
//     });

//     console.log("rescancel---->>", res);

//     if (res?.success) {
//       navigation.navigate('Appointments')
//       setShowCancelModal(false);
//       showSuccessToast(res?.message, "success");
//       return;
//     }

//     setShowCancelModal(false);
//     showSuccessToast(res?.message || "Something went wrong", "error");
//   };


//   return (
//     <SafeAreaView style={styles.container}>

//       <StatusBar barStyle={'dark-content'} backgroundColor={"#FFFFFF"} />

//       <AppHeader
//         title="Appointment Details"
//
//         onLeftPress={() => navigation.goBack()}
//         rightIconName="search"
//         onRightPress={() => console.log('Search clicked')}
//       />

//       <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#FDFDFB' }}>


//         {loading ? <AppointmentDetailSkeleton />
//           :
//           <>
//             <DoctorDetail refreshData={() => fetchDetail?.()} data={detail} token={token} navigation={navigation} />

//             <Text style={styles.sectionTitle}>Patient Information</Text>

//             <View style={styles.card}>

//               <View style={styles.infoRow}>
//                 <Text style={Styles.label}>Name</Text>
//                 <Text style={Styles.value}>{detail?.appointment?.patient?.patient_name}</Text>
//               </View>

//               <View style={styles.infoRow}>
//                 <Text style={Styles.label}>Age</Text>
//                 <Text style={Styles.value}>{detail?.appointment?.patient?.age}</Text>
//               </View>

//               <View style={styles.infoRow}>
//                 <Text style={Styles.label}>Gender</Text>
//                 <Text style={Styles.value}>{detail?.appointment?.patient?.gender}</Text>
//               </View>

//             </View>

//             <Text style={styles.sectionTitle}>Reason for Visit</Text>

//             <View style={styles.card}>
//               <Text style={styles.reason}>{detail?.appointment?.concern}</Text>
//             </View>

//                  <Text style={styles.sectionTitle}>Your Review</Text>
//             <View style={styles.card}>
//               {detail?.appointment?.review?.is_rated ? (
//                 <View>
//                   <Text style={Styles.label}>Rating</Text>
//                   <Text style={Styles.value}>{detail?.appointment?.review?.rating}</Text>

//                   <Text style={Styles.label}>Review</Text>
//                   <Text style={Styles.value}>{detail?.appointment?.review?.review}</Text>
//                 </View>

//               ) : (
//                 <Text style={Styles.value}>You have not submitted a review yet.</Text>
//               )}
//             </View>

//             {showButtons && (
//               <View style={{ paddingHorizontal: 10 }}>

//                 <TouchableOpacity
//                   style={styles.outlineBtn}
//                   onPress={() => {
//                     setShowRescheduleModal(true);
//                   }}
//                 >
//                   <Text style={Styles.outlineText}>
//                     {isRescheduleRequest
//                       ? 'Request To Change'
//                       : 'Reschedule'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.cancelBtn}
//                   onPress={() => {
//                     setShowCancelModal(true);
//                   }}
//                 >
//                   <Text style={Styles.cancelText}>
//                     Cancel Appointment
//                   </Text>
//                 </TouchableOpacity>

//               </View>
//             )}
//           </>}

//         <RescheduleModal
//           visible={showRescheduleModal}
//           appointment={normalizedAppointment}
//           // slots={normalizedAppointment}
//           isRescheduleRequest={isRescheduleRequest}
//           onClose={() => {
//             setShowRescheduleModal(false);
//             // navigation.goback();
//             // setSelectedAppointment(null);
//           }}
//           onSubmit={(payload) => {
//             console.log("payload--->>>", payload);

//             handleReschedule(
//               normalizedAppointment?.consultation_id,
//               payload
//             );
//             setShowRescheduleModal(false);
//           }}
//         />

//         <CancelAppointmentModal
//           visible={showCancelModal}
//           onClose={() => {
//             setShowCancelModal(false);
//             // navigation.goBack()

//           }}
//           onSubmit={(payload: any) => {
//             handleCancel(
//               normalizedAppointment?.consultation_id,
//               payload
//             );

//             setShowCancelModal(false);
//           }}
//         />



//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default AppointmentDetailScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // paddingBottom: 80,
//     backgroundColor: '#FFFFFF',
//   },

//   sectionTitle: {
//     marginTop: 15,
//     marginHorizontal: 20,
//     marginBottom: 6,
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: Colors.black,
//   },

//   card: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: Colors.borderColor

//   },

//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   avatar: {
//     width: 55,
//     height: 55,
//     borderWidth: 1,
//     borderColor: Colors.borderColor,
//     backgroundColor: Colors.cardBackground,
//     borderRadius: 16,
//     marginRight: 12,
//   },

//   dateTimeBox: {
//     flex: 1,
//     borderRadius: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//   },

//   dtItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10
//   },

//   iconCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 8,
//     backgroundColor: Colors.bgcolor,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },

//   icon: {
//     fontSize: 18,
//     marginRight: 10,
//   },

//   textContainer: {
//     flexDirection: 'column',
//   },

//   label: {
//     marginBottom: 2,
//     fontSize: 12,
//     color: '#94A3B8',
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   value: {
//     fontFamily: Fonts.PoppinsMedium,
//     fontSize: 14,
//     color: '#0F172A',
//   },

//   primaryBtn: {
//     backgroundColor: Colors.primaryColor,
//     borderRadius: 12,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   content: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   primaryText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   secondaryBtn: {
//     backgroundColor: '#E6F4EE',
//     marginTop: 10,
//     paddingVertical: 13,
//     borderRadius: 12,
//     alignItems: 'center',
//   },

//   secondaryText: {
//     color: '#0A8F5A',
//     fontSize: 16,
//     fontFamily: Fonts.PoppinsMedium,
//   },

//   techText: {
//     marginTop: 10,
//     fontSize: 14,
//     fontFamily: Fonts.PoppinsMedium,
//     color: '#0A8F5A',
//     textAlign: 'center',
//   },



//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 6,
//   },



//   reason: {
//     fontSize: 14,
//     color: '#374151',
//     lineHeight: 20,
//     fontFamily: Fonts.PoppinsMedium,
//     fontStyle: 'italic'
//   },

//   outlineBtn: {
//     marginHorizontal: 16,
//     marginTop: 12,
//     borderWidth: 1,
//     borderColor: '#0D614E99',
//     padding: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },

//   cancelBtn: {
//     marginHorizontal: 16,
//     marginTop: 15,
//     marginBottom: 30,
//     padding: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },


// });




import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  BackHandler,
  Platform,
  Pressable,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { Styles } from '../../common/Styles';
import { Fonts } from '../../common/Fonts';
import { AntDesign, Foundation, Ionicons } from '../../common/Vector';
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
import FeedbackModal from '../FeedbackModal';
import { useCreateReview } from '../../hooks/useCreateReview';
import TablerIcon from '../../components/TablerIcon';

// ---------------------------------------------------------------------
// LUXURY THEME TOKENS
// Agar tere Colors.ts me already yeh values hain toh unhi ko use kar lena,
// warna yeh fallback palette use karle — warm cream + deep emerald + gold.
// ---------------------------------------------------------------------
const Theme = {
  bg: '#FAF8F3',
  cardBg: '#FFFFFF',
  cardBorder: '#EFE6D8',
  gold: '#B8933F',
  goldSoft: '#F4E9D3',
  emerald: Colors?.primaryColor || '#0A8F5A',
  emeraldSoft: '#E8F3EC',
  danger: Colors?.errorColor || '#D64545',
  dangerSoft: '#FBEAEA',
  ink: '#1F2A24',
  subInk: '#8A8578',
  divider: '#F0EBE0',
};

// Layered, premium-feeling elevation. `strength` roughly maps to how
// "floated" a card should feel — use higher values for hero/primary cards.
const shadow = (strength: 'sm' | 'md' | 'lg' = 'md') => {
  const map = {
    sm: { h: 4, opacity: 0.06, radius: 8, elevation: 3 },
    md: { h: 8, opacity: 0.1, radius: 16, elevation: 6 },
    lg: { h: 14, opacity: 0.14, radius: 26, elevation: 12 },
  } as const;
  const cfg = map[strength];
  return {
    shadowColor: '#1F2A24',
    shadowOffset: { width: 0, height: cfg.h },
    shadowOpacity: cfg.opacity,
    shadowRadius: cfg.radius,
    elevation: Platform.OS === 'android' ? cfg.elevation : 0,
  };
};

const PrimaryButton = ({
  title,
  onPress,
  page,
}: {
  title: string;
  page: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.primaryBtn,
        { backgroundColor: page === 'appoint' ? Theme.emerald : Theme.danger },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name="videocam" size={18} color="#fff" />
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

type Props = {
  data: any;
  refreshData: () => void;
  navigation: any;
  token: any;
};

const DoctorDetail = ({ data, refreshData, navigation, token }: Props) => {
  const appointmentData = {
    doctorName: data?.doctor?.doctor_name || '',
    doctor_image: data?.doctor?.doctor_image || '',
    consultationId: data?.appointment?.consultation_id,
  };

  const [showModal, setShowModal] = useState(false);
  const { loading, submitReview } = useCreateReview();

  const shouldShowReviewModal =
    data?.appointment?.appointment_status?.toLowerCase() === 'completed' &&
    data?.appointment?.review?.is_rated === false;

  useEffect(() => {
    if (!shouldShowReviewModal) return;
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [shouldShowReviewModal]);

  useEffect(() => {
    if (!showModal) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, [showModal]);

  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: !showModal });
  }, [navigation, showModal]);

  const handleReviewSubmit = async ({
    rating,
    review,
  }: {
    rating: number;
    review: string;
  }) => {
    const response = await submitReview({
      entityType: 'doctor',
      appointmentId: appointmentData?.consultationId,
      reviewData: { rating, review, appointment: appointmentData?.consultationId ?? '' },
    });

    if (response?.success) {
      showSuccessToast(response?.message, 'success');
      setShowModal(false);
      refreshData();
      return;
    }

    showSuccessToast(response?.message || 'Unable to submit review', 'error');
  };

  const isLive = data?.appointment?.call_status === 'in_progress';

  return (
    <View style={styles.heroCard}>
      {/* ---------- Banner ---------- */}
      <View style={styles.banner}>
        <Image
          source={data?.doctor?.doctor_image ? { uri: data?.doctor?.doctor_image } : Images.doctorImage}
          style={styles.bannerImage}
        />
        {/* scrim layers to fake a gradient without extra deps */}
        <View style={styles.scrimTop} />
        <View style={styles.scrimBottom} />

        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveBadgeDot} />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>
        )}

        <View style={styles.bannerTextWrap}>
          <Text style={styles.doctorName}>{data?.doctor?.doctor_name}</Text>
          <View style={styles.specialtyPill}>
            <Ionicons name="medkit-outline" size={12} color={Theme.gold} />
            <Text style={styles.specialtyText}>{data?.doctor?.doctor_specialization}</Text>
          </View>
        </View>
      </View>

      {/* ---------- Content ---------- */}
      <View style={styles.heroBody}>
        <View style={styles.dateTimeBox}>
          <View style={styles.dtItem}>
            <View style={styles.iconCircle}>
              <TablerIcon name="calendar" size={18} color={Colors.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>DATE</Text>
              <Text style={styles.value}>{data?.appointment?.appointment_date}</Text>
            </View>
          </View>

          <View style={styles.dtDividerVertical} />

          <View style={styles.dtItem}>
            <View style={styles.iconCircle}>
              <TablerIcon name="clock" size={18} color={Colors.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>TIME</Text>
              <Text style={styles.value}>{data?.appointment?.start_time}</Text>
            </View>
          </View>
        </View>

        {isLive && (
          <View style={{ marginTop: 4 }}>
            <PrimaryButton
              title="Join Video Call"
              page="appoint"
              onPress={() => {
                navigation.navigate('PatientVideoCallScreen', {
                  appointmentId: appointmentData?.consultationId,
                  role: 'patient',
                  otherPartyImage: appointmentData?.doctor_image,
                  otherPartyName: appointmentData?.doctorName,
                });
              }}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryBtn}
              onPress={() => {
                navigation.navigate('ChatScreen', {
                  doctorName: data?.doctor?.doctor_name,
                  doctorAvatar: data?.doctor?.doctor_image,
                  appointmentId: data?.appointment?.consultation_id,
                  patientName: data?.appointment?.patient?.patient_name,
                  role: 'patient',
                  patientAvatar: data?.appointment?.patient?.patient_image,
                });
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={Theme.emerald} />
              <Text style={styles.secondaryText}>Chat with Doctor</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FeedbackModal
        visible={showModal}
        loading={loading}
        onClose={() => setShowModal(false)}
        onSubmit={handleReviewSubmit}
      />
    </View>
  );
};

const AppointmentDetailScreen = ({ route, navigation }: any) => {
  const { consultation_id } = route.params;

  const [loading, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [token, setToken] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await _CONSULT_SERVICE.getAppointmentDetail(consultation_id);
      setDetail(res?.data);
    } catch (error) {
      showSuccessToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userToken = await Utils.getData('_TOKEN');
      setToken(userToken);
    };
    init();
    fetchDetail();
  }, []);

  const normalizedAppointment = useMemo(() => {
    if (!detail?.appointment) return null;
    const item = detail;
    return {
      consultation_id: consultation_id,
      doctorName: item.doctor?.doctor_name || '',
      specialty: item.doctor?.doctor_specialization || 'General Physician',
      date: item.appointment?.appointment_date,
      time: item?.appointment?.start_time,
      status: item?.appointment?.appointment_status,
      call_status: item?.appointment?.call_status,
      image: item.doctor?.doctor_image,
      availability: item.availability || [],
      rawData: item,
    };
  }, [detail]);

  const appointmentStatus = normalizedAppointment?.status?.toLowerCase();

  const showButtons = !['cancelled', 'completed', 'rescheduled'].includes(appointmentStatus);
  const isRescheduleRequest = appointmentStatus === 'reschedule';

  // status pill color mapping — luxury muted tones instead of loud flat colors
  const statusStyleMap: Record<string, { bg: string; text: string }> = {
    completed: { bg: Theme.emeraldSoft, text: Theme.emerald },
    cancelled: { bg: Theme.dangerSoft, text: Theme.danger },
    rescheduled: { bg: Theme.goldSoft, text: Theme.gold },
    reschedule: { bg: Theme.goldSoft, text: Theme.gold },
    confirmed: { bg: Theme.emeraldSoft, text: Theme.emerald },
    pending: { bg: '#F1EEE7', text: Theme.subInk },
  };
  const statusStyle = statusStyleMap[appointmentStatus || ''] || statusStyleMap.pending;

  const handleReschedule = async (
    appointmentId: string,
    payload: {
      action: string;
      availability: number;
      reschedule_reason?: string;
      cancellation_reason?: string;
    }
  ) => {
    let payloadSend: any = { action: payload.action };

    switch (payload.action) {
      case 'reschedule':
        payloadSend.availability = payload.availability;
        payloadSend.reschedule_reason = payload.reschedule_reason;
        break;
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
      fetchDetail?.();
      setShowRescheduleModal(false);
      showSuccessToast(res.message, 'success');
      return;
    }

    showSuccessToast(res?.message || 'You cannot reschedule multiple times', 'error');
  };

  const handleCancel = async (
    appointmentId: string,
    payload: { action: string; cancellation_reason: string }
  ) => {
    let payloadSend: any = {
      action: payload.action,
      cancellation_reason: payload.cancellation_reason,
    };

    const res = await handleAppointmentAction({ appointmentId, payload: payloadSend });

    if (res?.success) {
      navigation.navigate('Appointments');
      setShowCancelModal(false);
      showSuccessToast(res?.message, 'success');
      return;
    }

    setShowCancelModal(false);
    showSuccessToast(res?.message || 'Something went wrong', 'error');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      <AppHeader
        title="Appointment Details"
        onLeftPress={() => navigation.goBack()}
        rightIconName="search"
        onRightPress={() => console.log('Search clicked')}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: Theme.bg }}>
        {loading ? (
          <AppointmentDetailSkeleton />
        ) : (
          <>
            {normalizedAppointment?.status && (
              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                  <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                    {normalizedAppointment.status}
                  </Text>
                </View>
              </View>
            )}

            <DoctorDetail
              refreshData={() => fetchDetail?.()}
              data={detail}
              token={token}
              navigation={navigation}
            />

            <View style={styles.sectionHeaderRow}>
              <Ionicons name="person-outline" size={15} color={Theme.gold} />
              <Text style={styles.sectionTitle}>Patient Information</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelWrap}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="person-outline" size={14} color={Theme.emerald} />
                  </View>
                  <Text style={styles.infoLabel}>Name</Text>
                </View>
                <Text style={styles.infoValue}>{detail?.appointment?.patient?.patient_name}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoLabelWrap}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="calendar-outline" size={14} color={Theme.emerald} />
                  </View>
                  <Text style={styles.infoLabel}>Age</Text>
                </View>
                <Text style={styles.infoValue}>{detail?.appointment?.patient?.age}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoLabelWrap}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="body-outline" size={14} color={Theme.emerald} />
                  </View>
                  <Text style={styles.infoLabel}>Gender</Text>
                </View>
                <Text style={styles.infoValue}>{detail?.appointment?.patient?.gender}</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={15} color={Theme.gold} />
              <Text style={styles.sectionTitle}>Reason for Visit</Text>
            </View>
            <View style={styles.card}>
              <Foundation name="quote" size={20} color={Theme.goldSoft} style={{ marginBottom: 4 }} />
              <Text style={styles.reason}>{detail?.appointment?.concern}</Text>
            </View>

            {appointmentStatus === 'completed' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="star-outline" size={15} color={Theme.gold} />
                  <Text style={styles.sectionTitle}>Your Review</Text>
                </View>


                <View style={styles.card}>
                  {detail?.appointment?.review?.is_rated ? (
                    <View>
                      <View style={styles.ratingRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < (detail?.appointment?.review?.rating || 0) ? 'star' : 'star-outline'}
                            size={18}
                            color={Theme.gold}
                            style={{ marginRight: 3 }}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewText}>{detail?.appointment?.review?.review}</Text>
                    </View>
                  ) : (
                    <Pressable style={styles.emptyReviewWrap} >
                      <Ionicons name="star-outline" size={26} color={Theme.divider} />
                      <Text style={styles.emptyReview}>You have not submitted a review yet.</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}

            {showButtons && (
              <View style={{ paddingHorizontal: 16 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.outlineBtn}
                  onPress={() => setShowRescheduleModal(true)}
                >
                  <Ionicons name="calendar-outline" size={17} color={Theme.emerald} />
                  <Text style={styles.outlineBtnText}>
                    {isRescheduleRequest ? 'Request To Change' : 'Reschedule'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cancelBtn}
                  onPress={() => setShowCancelModal(true)}
                >
                  <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <RescheduleModal
          visible={showRescheduleModal}
          appointment={normalizedAppointment}
          isRescheduleRequest={isRescheduleRequest}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={(payload) => {
            handleReschedule(normalizedAppointment?.consultation_id, payload);
            setShowRescheduleModal(false);
          }}
        />

        <CancelAppointmentModal
          visible={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSubmit={(payload: any) => {
            handleCancel(normalizedAppointment?.consultation_id, payload);
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
    backgroundColor: Theme.bg,
  },

  // ---------- Status pill (top) ----------
  statusRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  sectionTitle: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.ink,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: Theme.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    // ...shadow('md'),
  },

  // ---------- Hero (Doctor) card ----------
  heroCard: {
    backgroundColor: Theme.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    overflow: 'hidden',
    ...shadow('lg'),
  },

  banner: {
    width: '100%',
    height: 168,
    backgroundColor: '#EFE9DC',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 92,
    backgroundColor: 'rgba(15,20,17,0.55)',
  },

  bannerTextWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
  },

  heroBody: {
    padding: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorName: {
    fontSize: 19,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#fff',
    marginBottom: 8,
  },

  specialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,233,211,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  specialtyText: {
    marginLeft: 5,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#F4E9D3',
  },

  liveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 5,
  },

  liveBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#fff',
    letterSpacing: 0.6,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.divider,
    marginVertical: 16,
  },

  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF9F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.divider,
    paddingVertical: 4,
  },

  dtItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dtDividerVertical: {
    width: 1,
    height: 34,
    backgroundColor: Theme.divider,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Theme.goldSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  textContainer: {
    flexDirection: 'column',
  },

  label: {
    marginBottom: 2,
    fontSize: 11,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.4,
  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: Theme.ink,
  },

  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...shadow('md'),
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },

  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: Theme.emeraldSoft,
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    color: Theme.emerald,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Theme.emeraldSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  infoDivider: {
    height: 1,
    backgroundColor: Theme.divider,
  },

  infoLabel: {
    fontSize: 13,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
  },

  infoValue: {
    fontSize: 14,
    color: Theme.ink,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  reason: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    fontFamily: Fonts.PoppinsMedium,
    fontStyle: 'italic',
  },

  ratingRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  reviewText: {
    fontSize: 14,
    color: Theme.ink,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsMedium,
  },

  emptyReviewWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  emptyReview: {
    marginTop: 6,
    fontSize: 13,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
    fontStyle: 'italic',
  },

  outlineBtn: {
    flexDirection: 'row',
    marginTop: 14,
    borderWidth: 1.4,
    borderColor: Theme.emerald,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  outlineBtnText: {
    marginLeft: 8,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.emerald,
  },

  cancelBtn: {
    marginTop: 12,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Theme.dangerSoft,
  },

  cancelBtnText: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.danger,
  },
});