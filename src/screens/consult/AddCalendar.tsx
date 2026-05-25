import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { Styles } from '../../common/Styles';
import { Ionicons } from '../../common/Vector';

const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AppointmentStatus =
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UPCOMING';

interface BadgeProps {
  status: AppointmentStatus;
}

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const BADGE_CONFIG = {
  COMPLETED: {
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

const Badge = memo(({ status }: BadgeProps) => {
  const config = BADGE_CONFIG[status];

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
        {status}
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

const AddCalendar = ({
  navigation,
}: any) => {
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
          Add to Calendar
        </Text>

        <Text style={styles.subtitle}>
          Sync your appointment with Dr. Arjun R Nair to your preferred calendar to receive timely reminders.
        </Text>

        {/* CARD */}

        <View style={styles.card}>
          {/* BADGE */}

          <View style={styles.badgeWrapper}>
            <Badge status="COMPLETED" />
          </View>

          {/* DOCTOR INFO */}

          <View style={styles.doctorRow}>
            <Image
              source={Images.doctorImage}
              style={styles.avatar}
            />

            <View style={styles.doctorInfo}>
              <Text
                style={styles.doctorName}
                numberOfLines={2}
              >
                Dr. Arjun R Nair
              </Text>

              <Text
                style={styles.speciality}
                numberOfLines={1}
              >
                Cardiology Specialist
              </Text>
            </View>
          </View>

          {/* DETAILS */}

          <View style={styles.detailsContainer}>
            <DetailRow
              icon={Images.calender}
              label="DATE"
              value="Tuesday, Oct 24, 2023"
            />

            <DetailRow
              icon={Images.clock}
              label="TIME"
              value="09:30 AM - 10:00 AM"
            />

            <DetailRow
              icon={Images.clock}
              label="CONCERN"
              value="Related to heart"
            />
          </View>
        </View>

        {/* ACTION BUTTONS */}

       <View style={styles.actionRow}>
  {/* GOOGLE CALENDAR */}

  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.secondaryBtn}
  >
    <View style={styles.leftContent}>
      <Image
        source={Images.calender}
        style={styles.secondaryIcon}
      />

      <Text
        style={styles.secondaryText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        Google Calendar
      </Text>
    </View>

    <Image
      source={Images.arrowRight}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>

  {/* OUTLOOK */}

  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.secondaryBtn}
  >
    <View style={styles.leftContent}>
      <Image
        source={require('../../assets/images/shareIcon.png')}
        style={styles.shareIcon}
      />

      <Text
        style={styles.secondaryText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        Outlook Calendar
      </Text>
    </View>

    <Image
      source={Images.arrowRight}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
</View>

        {/* PRIMARY BUTTON */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('Home')
          }
        >
          <Text style={styles.primaryText}>
            Done
          </Text>
        </TouchableOpacity>

        {/* LINK */}

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.bottomText}>
            I'll do it later
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCalendar;

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */


const isSmallDevice = width < 360;

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

  /* ---------------------------------------------------------------------- */
  /*                               SUCCESS UI                               */
  /* ---------------------------------------------------------------------- */

  successWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },

  successCircle: {
    width: width * 0.3,
    height: width * 0.3,

    minWidth: 110,
    minHeight: 110,

    maxWidth: 130,
    maxHeight: 130,

    borderRadius: 48,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowRadius: 8,
      },

      android: {
        elevation: 4,
      },
    }),
  },

  successIcon: {
    width: '62%',
    height: '62%',
    resizeMode: 'contain',
  },

  /* ---------------------------------------------------------------------- */
  /*                                 TEXT                                   */
  /* ---------------------------------------------------------------------- */

  title: {
    marginTop: 20,

    fontSize: isSmallDevice ? 24 : 28,
    lineHeight: isSmallDevice ? 32 : 38,

    textAlign: 'center',

    color: '#0F172A',

    fontFamily: Fonts.PoppinsSemiBold,
  },

  subtitle: {
    marginTop: 8,

    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,

    textAlign: 'center',

    color: '#64748B',

    paddingHorizontal: 10,

    fontFamily: Fonts.PoppinsMedium,
  },

  /* ---------------------------------------------------------------------- */
  /*                                  CARD                                  */
  /* ---------------------------------------------------------------------- */

  card: {
    marginTop: 28,

    backgroundColor: '#FFFFFF',

    borderRadius: 28,

    padding: 18,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    overflow: 'hidden',
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

  /* ---------------------------------------------------------------------- */
  /*                              DOCTOR SECTION                             */
  /* ---------------------------------------------------------------------- */

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: width * 0.2,
    height: width * 0.2,

    minWidth: 70,
    minHeight: 70,

    maxWidth: 84,
    maxHeight: 84,

    borderRadius: 18,

    marginRight: 14,

    resizeMode: 'cover',
  },

  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },

  doctorName: {
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: 28,

    color: '#1E293B',

    fontFamily: Fonts.PoppinsSemiBold,
  },

  speciality: {
    marginTop: 2,

    fontSize: 14,

    color: Colors.primaryColor,

    fontFamily: Fonts.PoppinsMedium,
  },

  /* ---------------------------------------------------------------------- */
  /*                                DETAILS                                 */
  /* ---------------------------------------------------------------------- */

  detailsContainer: {
    marginTop: 20,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    marginBottom: 18,
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

  /* ---------------------------------------------------------------------- */
  /*                              ACTION BUTTONS                            */
  /* ---------------------------------------------------------------------- */

  actionRow: {
    marginTop: 22,
    gap: 14,
  },

  secondaryBtn: {
    minHeight: 60,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#E5E7EB',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,
    minWidth: 0,

    paddingRight: 12,
  },

  secondaryIcon: {
    width: 24,
    height: 24,

    resizeMode: 'contain',

    tintColor: Colors.primaryColor,

    marginRight: 10,
  },

  shareIcon: {
    width: 24,
    height: 24,

    resizeMode: 'contain',

    marginRight: 10,
  },

  secondaryText: {
    flex: 1,

    fontSize: isSmallDevice ? 14 : 16,

    color: '#334155',

    fontFamily: Fonts.PoppinsMedium,
  },

  arrowIcon: {
    width: 15,
    height: 15,

    resizeMode: 'contain',

    tintColor: '#94A3B8',
  },

  /* ---------------------------------------------------------------------- */
  /*                              PRIMARY BUTTON                            */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /*                               BOTTOM TEXT                              */
  /* ---------------------------------------------------------------------- */

  bottomText: {
    marginTop: 18,

    textAlign: 'center',

    fontSize: 14,

    color: '#94A3B8',

    fontFamily: Fonts.PoppinsMedium,
  },
});