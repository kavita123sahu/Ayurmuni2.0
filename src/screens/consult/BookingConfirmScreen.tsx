import React, { memo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Pressable,
  BackHandler,
} from 'react-native';
import Share, { Social } from 'react-native-share';

import Clipboard
  from '@react-native-clipboard/clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { Styles } from '../../common/Styles';
import { Ionicons } from '../../common/Vector';
import { Animated } from 'react-native';
import { formatDate } from '../../common/DataInterface';
import { getAppointmentShareMessage } from '../../helper/shareMessage';

const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AppointmentStatus =
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'UPCOMING';

interface BadgeProps {
  appointment_status: AppointmentStatus;
}

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */



const { height } = Dimensions.get('window');

const SHEET_HEIGHT = height / 1.9;
const shareOptions = [
  {
    id: 1,
    title: 'WhatsApp',
    type: 'whatsapp',
    icon: require('../../assets/images/whatsappIcon.png'),
    bg: '#0D614E26',
    Color: Colors.primaryColor,
  },

  {
    id: 2,
    title: 'Messages',
    type: 'message',
    icon: require('../../assets/images/chatSupport.png'),
    bg: '#DBEAFE',
    Color: '#2563EB',
  },

  {
    id: 3,
    title: 'Email',
    type: 'email',
    icon: require('../../assets/images/email.png'),
    bg: '#FFEDD5',
    Color: '#EA580C',
  },

  {
    id: 4,
    title: 'Copy Link',
    type: 'copy',
    icon: require('../../assets/images/copyIcon.png'),
    bg: '#F3F4F6',
    Color: '#475569',
  },
];

const BADGE_CONFIG = {
  CONFIRMED: {
    bg: '#DCFCE7',
    color: '#16A34A',
  },



  CANCELLED: {
    bg: '#FEE2E2',
    color: '#DC2626',
  },

  UPCOMING: {
    bg: '#FEF3C7',
    color: '#D97706',
  },
};

/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const Badge = memo(({ appointment_status }: BadgeProps) => {
  const config = BADGE_CONFIG[appointment_status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: config.color,
          },
        ]}
      >
        {appointment_status}
      </Text>
    </View>
  );
});

interface DetailRowProps {
  icon: any;
  label: string;
  value: string;
}

const DetailRow = memo(
  ({ icon, label, value }: DetailRowProps) => {
    return (
      <View style={styles.detailRow}>
        <View style={styles.iconWrapper}>
          <Image
            source={icon}
            style={styles.detailIcon}
          />
        </View>

        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>
            {label}
          </Text>

          <Text
            style={styles.detailValue}
            numberOfLines={2}
          >
            {value}
          </Text>
        </View>
      </View>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const BookingConfrimScreen = ({ navigation, route }: any) => {
  const { SlotsDetail } = route?.params || {};

  console.log("navigationnavigation", navigation)

  const [visible, setVisible] = useState(false);

  // Disable hardware back button and gesture back to prevent leaving this
  // confirmation screen except via explicit buttons (Home or Share).
  useEffect(() => {
    const onHardwareBack = () => true;

    const backHandler =
      BackHandler.addEventListener(
        'hardwareBackPress',
        onHardwareBack,
      );

    return () => backHandler.remove();
  }, []);
  // Hide header back button and disable gestures if using stack navigator
  useLayoutEffect(() => {
    try {
      navigation.setOptions && navigation.setOptions({ headerLeft: () => null, gestureEnabled: false });
    } catch (e) {
      // ignore if navigator doesn't support these options
    }
  }, [navigation]);

  const slideAnim = useRef(
    new Animated.Value(SHEET_HEIGHT),
  ).current;

  const overlayAnim = useRef(
    new Animated.Value(0),
  ).current;


  const shareMessage =
    getAppointmentShareMessage({
      doctorName:
        SlotsDetail?.info?.doctor_name,

      specialization:
        SlotsDetail?.doctor_specialization?.join(', '),

      date: formatDate(
        SlotsDetail?.slot?.date,
      ),

      time:
        SlotsDetail?.slot?.slot_time,

      status:
        SlotsDetail?.status,

      hospitalName:
        SlotsDetail?.hospital_name,
    });


  // =============================
  // SHARE FUNCTIONS
  // =============================
  const handleShare = async (
    type: string,
  ) => {

    try {

      if (type === 'copy') {

        Clipboard.setString(
          shareMessage,
        );

        closeBottomSheet();

        return;
      }

      if (type === 'message') {

        await Share.open({
          message:
            shareMessage,
        });

        closeBottomSheet();

        return;
      }

      const shareOptions: any = {
        message:
          shareMessage,
      };

      if (
        type === 'whatsapp'
      ) {

        shareOptions.social =
          Social.Whatsapp;

      } else if (
        type === 'email'
      ) {

        shareOptions.social =
          Social.Email;

        shareOptions.subject =
          'Appointment Details';
      }

      await Share.shareSingle(
        shareOptions,
      );

      closeBottomSheet();

    } catch (error) {

      console.log(
        `${type} ERROR =>`,
        error,
      );
    }
  };

  // =============================
  // OPTION HANDLE
  // =============================

  const onPressShareOption = (
    type: string,
  ) => {

    handleShare(type);
  };



  const openBottomSheet = () => {
    setVisible(true);


    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const
    closeBottomSheet = () => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),

        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* SUCCESS ICON */}

        <View style={styles.successWrapper}>
          <View style={styles.successCircle}>
            <Image
              source={Images.tickIcon}
              style={styles.successIcon}
            />
          </View>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>
          Booking Confirmed!
        </Text>

        <Text style={styles.subtitle}>
          Your appointment with the specialist
          has been successfully secured.
        </Text>

        {/* CARD */}

        <View style={styles.card}>
          {/* BADGE */}

          <View style={styles.badgeWrapper}>
            <Badge appointment_status={SlotsDetail?.appointment_status?.toUpperCase()} />
          </View>

          {/* DOCTOR INFO */}

          <View style={styles.doctorRow}>
            <Image
              source={SlotsDetail?.doctor_image ? {
                uri: SlotsDetail?.doctor_image
              } : Images.doctorImage}
              style={styles.avatar}
            />

            <View style={styles.doctorInfo}>
              <Text
                style={styles.doctorName}
                numberOfLines={2}
              >
                {SlotsDetail?.info?.doctor_name}
              </Text>

              <Text
                style={styles.speciality}
                numberOfLines={1}
              >
                {SlotsDetail?.doctor_specialization?.join(', ')}
              </Text>
            </View>
          </View>

          {/* DETAILS */}

          <View style={styles.detailsContainer}>
            <DetailRow
              icon={Images.calender}
              label="DATE"
              value={formatDate(SlotsDetail?.slot?.date)}
            />

            <DetailRow
              icon={Images.clock}
              label="TIME"
              value={SlotsDetail?.slot?.slot_time}
            />

            {SlotsDetail?.slot?.concern && (
              <DetailRow
                icon={Images.clock}
                label="CONCERN"
                value={SlotsDetail?.slot?.concern}
              />
            )}

          </View>
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actionRow}>
          {/* <TouchableOpacity
            onPress={() => navigation.navigate('AddCalendar')}
            activeOpacity={0.8}
            style={styles.secondaryBtn}
          >
            <Image
              source={Images.calender}
              style={styles.secondaryIcon}
            />

            <Text
              style={styles.secondaryText}
              numberOfLines={1}
            >
              Add to Calendar
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openBottomSheet}
            style={styles.secondaryBtn}
          >
            <Image
              source={require('../../assets/images/shareIcon.png')}
              style={styles.shareIcon}
            />

            <Text
              style={styles.secondaryText}
              numberOfLines={1}
            >
              Share Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* PRIMARY BUTTON */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={() =>
            navigation.replace('HomeStack', { screen: 'Home' })

          }
        >
          <Text style={styles.primaryText}>
            Go to Home
          </Text>
        </TouchableOpacity>

        {/* LINK */}

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.bottomText}>
            View Appointment Details
          </Text>
        </TouchableOpacity>
      </ScrollView>


      {
        visible && (

          <View
            style={
              styles.absoluteContainer
            }
          >

            {/* OVERLAY */}

            <Pressable
              style={
                StyleSheet.absoluteFill
              }
              onPress={
                closeBottomSheet
              }
            >

              <Animated.View
                style={[
                  styles.overlay,
                  {
                    opacity:
                      overlayAnim,
                  },
                ]}
              />

            </Pressable>

            {/* SHEET */}

            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [
                    {
                      translateY:
                        slideAnim,
                    },
                  ],
                },
              ]}
            >

              {/* HANDLE */}

              <View
                style={styles.handle}
              />

              {/* TITLE */}

              <Text
                style={
                  styles.sheetTitle
                }
              >
                Share Details
              </Text>

              <Text
                style={
                  styles.sheetSubtitle
                }
              >
                Share appointment
                information with
                your contacts.
              </Text>

              {/* CARD */}

              <View
                style={
                  styles.shareCard
                }
              >

                <Image
                  source={
                    SlotsDetail?.doctor_image
                      ? {
                        uri:
                          SlotsDetail?.doctor_image,
                      }
                      : Images.doctorImage
                  }
                  style={
                    styles.doctorImage
                  }
                />

                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.doctorName1
                    }
                  >
                    {
                      SlotsDetail?.info?.doctor_name
                    }
                  </Text>

                  <Text
                    style={
                      styles.speciality
                    }
                  >
                    {
                      SlotsDetail?.doctor_specialization?.join(
                        ', ',
                      )
                    }
                  </Text>

                  <View
                    style={
                      styles.dateRow
                    }
                  >

                    <Image
                      source={
                        Images.calender
                      }
                      style={
                        styles.dateIcon
                      }
                    />

                    <Text
                      style={
                        styles.dateText
                      }
                    >
                      {
                        formatDate(
                          SlotsDetail?.slot?.date,
                        )
                      }

                      {' - '}

                      {
                        SlotsDetail?.slot?.slot_time
                      }
                    </Text>

                  </View>

                </View>

              </View>

              {/* OPTIONS */}

              <View
                style={
                  styles.optionsRow
                }
              >

                {
                  shareOptions.map(
                    item => {

                      return (

                        <TouchableOpacity
                          key={
                            item.id
                          }
                          activeOpacity={
                            0.8
                          }
                          style={
                            styles.optionWrapper
                          }
                          onPress={() =>
                            onPressShareOption(
                              item.type,
                            )
                          }
                        >

                          <View
                            style={[
                              styles.iconBox,
                              {
                                backgroundColor:
                                  item.bg,
                              },
                            ]}
                          >

                            <Image
                              source={
                                item.icon
                              }
                              style={[
                                styles.optionIcon,
                                {
                                  tintColor:
                                    item.Color,
                                },
                              ]}
                            />

                          </View>

                          <Text
                            style={
                              styles.optionText
                            }
                          >
                            {
                              item.title
                            }
                          </Text>

                        </TouchableOpacity>
                      );
                    },
                  )
                }

              </View>

              {/* CANCEL */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.cancelBtn
                }
                onPress={
                  closeBottomSheet
                }
              >

                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>

              </TouchableOpacity>

            </Animated.View>

          </View>
        )
      }
    </SafeAreaView>
  );
};

export default BookingConfrimScreen;

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  /* SUCCESS */

  successWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },

  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 48,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,

    elevation: 4,
  },

  successIcon: {
    width: 74,
    height: 74,
    resizeMode: 'contain',
  },

  /* TEXT */

  title: {
    marginTop: 18,

    fontSize: 28,
    lineHeight: 36,

    textAlign: 'center',

    color: '#0F172A',

    fontFamily: Fonts.PoppinsSemiBold,
  },

  subtitle: {
    marginTop: 8,

    fontSize: 15,
    lineHeight: 24,

    textAlign: 'center',

    color: '#64748B',

    fontFamily: Fonts.PoppinsMedium,

    paddingHorizontal: 10,
  },

  /* CARD */

  card: {
    marginTop: 28,

    backgroundColor: '#FFFFFF',

    borderRadius: 28,

    padding: 18,

    borderWidth: 1,
    borderColor: '#E2E8F0',


  },

  badgeWrapper: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 8,
  },

  badgeText: {
    fontSize: 10,

    textTransform: 'uppercase',

    fontFamily: Fonts.PoppinsSemiBold,
  },

  /* DOCTOR */

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: width * 0.2,
    height: width * 0.2,

    minWidth: 72,
    minHeight: 72,

    maxWidth: 84,
    maxHeight: 84,

    borderRadius: 18,

    marginRight: 14,
  },


  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  /* BOTTOM SHEET */

  bottomSheet: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 25,

    minHeight: height / 2,
  },

  handle: {
    width: 46,
    height: 5,

    borderRadius: 20,

    backgroundColor: '#D1D5DB',

    alignSelf: 'center',

    marginBottom: 20,
  },

  sheetTitle: {
    fontSize: 28,
    marginTop: 8,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  /* CARD */

  // card: {
  //   marginTop: 22,

  //   flexDirection: 'row',
  //   alignItems: 'center',

  //   backgroundColor: '#EEF4F1',

  //   borderRadius: 18,

  //   padding: 14,

  //   borderWidth: 1,
  //   borderColor: '#DCE5E1',
  // },


  shareCard: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D614E1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0D614E33',
  },
  doctorImage: {
    width: 54,
    height: 54,

    borderRadius: 14,

    marginRight: 12,
  },



  speciality: {
    marginTop: 2,

    fontSize: 11,

    color: Colors.primaryColor,

    fontFamily: Fonts.PoppinsSemiBold,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    width: 14,
    height: 14,

    resizeMode: 'contain',

    tintColor: '#64748B',

    marginRight: 6,
  },

  dateText: {
    fontSize: 12,
    flex: 1,

    color: '#64748B',

    fontFamily: Fonts.PoppinsMedium,
  },

  /* OPTIONS */

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',

    marginTop: 28,
  },

  optionWrapper: {
    width: '20%',

    alignItems: 'center',

    marginBottom: 18,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionIcon: {
    width: 24,
    height: 24,

    resizeMode: 'contain',
  },

  optionText: {
    marginTop: 10,

    fontSize: 12,

    color: '#475569',

    textAlign: 'center',

    flexShrink: 1,
    fontFamily: Fonts.PoppinsMedium,
  },

  /* CANCEL */

  cancelBtn: {
    marginTop: 12,

    height: 56,

    borderRadius: 18,

    backgroundColor: '#F1F5F9',

    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16,

    color: '#374151',

    fontFamily: Fonts.PoppinsSemiBold,
  },

  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },

  doctorName: {
    fontSize: 20,
    lineHeight: 28,

    color: '#1E293B',

    fontFamily: Fonts.PoppinsSemiBold,
  },


  doctorName1: {
    fontSize: 18,
    lineHeight: 24,

    color: '#1E293B',

    fontFamily: Fonts.PoppinsSemiBold,

    flexShrink: 1,
  },


  /* DETAILS */

  detailsContainer: {
    marginTop: 18,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    marginBottom: 16,
  },

  iconWrapper: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: Colors.bgcolor,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  detailIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    fontSize: 12,

    color: '#94A3B8',

    marginBottom: 2,

    fontFamily: Fonts.PoppinsMedium,
  },

  detailValue: {
    fontSize: 14,
    lineHeight: 22,

    color: '#0F172A',

    fontFamily: Fonts.PoppinsMedium,
  },

  /* ACTIONS */

  actionRow: {
    flexDirection: 'row',
    gap: 12,

    marginTop: 22,
  },

  secondaryBtn: {
    flex: 1,

    minHeight: 52,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#0D614E33',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  secondaryIcon: {
    width: 18,
    height: 18,

    resizeMode: 'contain',

    tintColor: Colors.primaryColor,

    marginRight: 8,
  },

  shareIcon: {
    width: 14,
    height: 14,

    resizeMode: 'contain',

    marginRight: 8,
  },

  secondaryText: {
    flexShrink: 1,

    fontSize: 13,

    color: Colors.primaryColor,

    fontFamily: Fonts.PoppinsMedium,
  },

  /* PRIMARY */

  primaryBtn: {
    marginTop: 24,

    height: 56,

    borderRadius: 18,

    backgroundColor: Colors.primaryColor,

    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryText: {
    fontSize: 16,

    color: '#FFFFFF',

    fontFamily: Fonts.PoppinsSemiBold,
  },

  /* BOTTOM */

  bottomText: {
    marginTop: 18,

    textAlign: 'center',

    fontSize: 14,

    color: '#94A3B8',

    fontFamily: Fonts.PoppinsMedium,
  },
});