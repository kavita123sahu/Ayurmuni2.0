import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import TablerIcon from './TablerIcon';
import {
  buildAppointmentDetailsParams,
  buildVideoCallNavParams,
  formatAppointmentDayLabel,
  formatAppointmentTimeLabel,
  formatDoctorDisplayName,
  getMinutesUntilAppointment,
  JoinableAppointment,
} from '../utils/appointmentUtils';
import { navigateToStackScreen } from '../navigation/navigationUtils';

type Props = {
  joinable: JoinableAppointment;
  navigation: any;
};

const JoinCallBanner = ({ joinable, navigation }: Props) => {
  const { item, minutesLeft: initialMinutes, isLive } = joinable;
  const [minutesLeft, setMinutesLeft] = useState(initialMinutes);

  const doctorName = formatDoctorDisplayName(item.doctorName);
  const specialty = item.specialty || item.therapies || '';
  const dayLabel = formatAppointmentDayLabel(item.date);
  const timeLabel = formatAppointmentTimeLabel(item.time);
  const imageUri = item.image?.trim?.() ? item.image : null;

  useEffect(() => {
    setMinutesLeft(initialMinutes);
  }, [initialMinutes]);

  useEffect(() => {
    if (isLive) {
      return;
    }

    const refreshMinutes = () => {
      const next = getMinutesUntilAppointment(item.date, item.time);
      if (next != null) {
        setMinutesLeft(next);
      }
    };

    refreshMinutes();
    const timer = setInterval(refreshMinutes, 30000);
    return () => clearInterval(timer);
  }, [isLive, item.date, item.time]);

  const countdownLabel = useMemo(() => {
    if (isLive) {
      return 'Live now';
    }
    if (minutesLeft <= 0) {
      return 'Starting now';
    }
    return `${String(minutesLeft).padStart(2, '0')} min left`;
  }, [isLive, minutesLeft]);

  const handleJoin = useCallback(() => {
    const isCallLive =
      isLive || String(item.call_status || '').toLowerCase() === 'in_progress';

    if (!isCallLive) {
      navigateToStackScreen(
        navigation,
        'AppointmentDetails',
        buildAppointmentDetailsParams(item.rawData ?? item),
      );
      return;
    }

    navigateToStackScreen(
      navigation,
      'PatientVideoCallScreen',
      buildVideoCallNavParams(item.rawData ?? item, {
        role: 'patient',
        otherPartyName: doctorName,
        otherPartyImage: item.image,
      }),
    );
  }, [navigation, item, doctorName, isLive]);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handleJoin}
      style={styles.wrap}
    >
      <LinearGradient
        colors={['#0B5A47', '#12856A', '#1A9B7D']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.card}
      >
        <View style={styles.avatarRing}>
          <Image
            source={imageUri ? { uri: imageUri } : Images.doctorImage}
            style={styles.avatar}
          />
          {isLive ? (
            <View style={styles.liveDot}>
              <View style={styles.liveDotInner} />
            </View>
          ) : null}
        </View>

        <View style={styles.meta}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {doctorName}
          </Text>

          {/* {specialty ? (
            <Text style={styles.speciality} numberOfLines={1}>
              {specialty}
            </Text>
          ) : null} */}

          <View style={styles.timingRow}>
            {dayLabel ? (
              <View style={styles.timingItem}>
                <TablerIcon name="calendar" size={12} color="rgba(255,255,255,0.9)" />
                <Text style={styles.timingText}>{dayLabel}</Text>
              </View>
            ) : null}

            {timeLabel ? (
              <View style={styles.timingItem}>
                <TablerIcon name="clock" size={12} color="rgba(255,255,255,0.9)" />
                <Text style={styles.timingText}>{timeLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.countdownPill}>
            <TablerIcon name="video" size={12} color="#FFFFFF" />
            <Text style={styles.countdownText}>{countdownLabel}</Text>
          </View>
        </View>

        <View style={styles.joinBtn}>
          <Text style={styles.joinText}>Join Now</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(JoinCallBanner);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: { elevation: 5 },
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#E8F5F1',
  },
  liveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 20,
  },
  speciality: {
    marginTop: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 14,
  },
  timingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timingText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: Fonts.PoppinsMedium,
  },
  countdownPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  countdownText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  joinBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
