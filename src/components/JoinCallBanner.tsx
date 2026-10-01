import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import DoctorAvatar from './DoctorAvatar';
import {
  buildAppointmentDetailsParams,
  buildVideoCallNavParams,
  formatAppointmentTimeLabel,
  formatDoctorDisplayName,
  getAppointmentSlotMs,
  JoinableAppointment,
} from '../utils/appointmentUtils';
import { navigateToStackScreen } from '../navigation/navigationUtils';

type Props = {
  joinable: JoinableAppointment;
  navigation: any;
};

const PRE_WINDOW_MS = 5 * 60 * 1000;
const FALLBACK_SLOT_MS = 15 * 60 * 1000;
const TICK_MS = 15_000;

/** Home "go live" card — same layout language as the active diet card. */
const JoinCallBanner = ({ joinable, navigation }: Props) => {
  const { item, isLive: initialLive } = joinable;
  const [now, setNow] = useState(Date.now());
  const pulse = useRef(new Animated.Value(0)).current;

  const doctorName = formatDoctorDisplayName(item.doctorName);
  const timeLabel = formatAppointmentTimeLabel(item.time);
  const endTimeLabel = item.endTimeLabel || formatAppointmentTimeLabel(item.endTime || '');
  const scheduleLabel =
    timeLabel && endTimeLabel ? `${timeLabel} – ${endTimeLabel}` : timeLabel;

  const { startMs, endMs: rawEndMs } = getAppointmentSlotMs(
    item.date,
    item.time,
    item.endTime || undefined,
  );
  const endMs = rawEndMs ?? (startMs != null ? startMs + FALLBACK_SLOT_MS : null);
  const msUntilStart = startMs != null ? startMs - now : 0;
  const isLive = initialLive || msUntilStart <= 0;
  const minutesToStart = Math.max(0, Math.ceil(msUntilStart / 60000));
  const minutesToEnd =
    endMs != null ? Math.max(0, Math.ceil((endMs - now) / 60000)) : null;

  const progress = useMemo(() => {
    if (startMs == null) return isLive ? 100 : 0;
    if (!isLive) {
      return Math.min(100, Math.max(4, ((PRE_WINDOW_MS - msUntilStart) / PRE_WINDOW_MS) * 100));
    }
    if (endMs == null) return 100;
    const total = endMs - startMs;
    return Math.min(100, Math.max(4, ((now - startMs) / total) * 100));
  }, [startMs, endMs, now, isLive, msUntilStart]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const handleJoin = useCallback(() => {
    if (isLive) {
      navigateToStackScreen(
        navigation,
        'PatientVideoCallScreen',
        buildVideoCallNavParams(item.rawData ?? item, {
          role: 'patient',
          otherPartyName: doctorName,
          otherPartyImage: item.image,
        }),
      );
      return;
    }
    navigateToStackScreen(
      navigation,
      'AppointmentDetails',
      buildAppointmentDetailsParams(item.rawData ?? item),
    );
  }, [navigation, item, doctorName, isLive]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  const rightLabel = isLive
    ? minutesToEnd != null
      ? `${minutesToEnd} min left`
      : 'Live now'
    : `Starts in ${String(minutesToStart).padStart(2, '0')} min`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handleJoin}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.eyebrowRow}>
            <View style={styles.dotWrap}>
              <Animated.View
                style={[
                  styles.dotPulse,
                  { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                ]}
              />
              <View style={styles.dot} />
            </View>
            <Text style={styles.eyebrow}>
              {isLive ? 'Live consultation' : 'Consultation starting'}
            </Text>
          </View>
          <Text style={styles.rightLabel}>{rightLabel}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {doctorName}
        </Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.footerRow}>
          <View style={styles.ctaPill}>
            <TablerIcon name="video" size={13} color={Colors.primaryColor} />
            <Text style={styles.ctaText}>{isLive ? 'Join now' : 'View details'}</Text>
          </View>
          {scheduleLabel ? (
            <Text style={styles.timeText} numberOfLines={1}>
              {scheduleLabel}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.imageWrap}>
        <DoctorAvatar
          uri={item.image?.trim?.() ? item.image : null}
          name={doctorName}
          size={68}
          shape="circle"
          emptyMode="icon"
        />
        {isLive ? (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

export default memo(JoinCallBanner);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryColor,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    minHeight: 108,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.96,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  dotWrap: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotPulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  eyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: Fonts.PoppinsMedium,
  },
  rightLabel: {
    fontSize: 11,
    color: '#F6D365',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  title: {
    marginTop: 3,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#F6D365',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F6D365',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  ctaText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  timeText: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: Fonts.PoppinsMedium,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#EF4444',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
  },
  liveBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.5,
  },
});
