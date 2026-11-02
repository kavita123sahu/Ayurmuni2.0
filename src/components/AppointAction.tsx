import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import {
  canOfferCancel,
  canOfferReschedule,
  resolveAppointmentDateTime,
} from '../utils/appointmentUtils';

type Props = {
  status: string;
  date?: string;
  time?: string;
  item?: any;
  onReschedule?: () => void;
  onCancel?: () => void;
  onJoinCall?: () => void;
  onViewDetails?: () => void;
  call_status?: string;
  /** True inside the join window (5 min before → end), or live before end_time. */
  canJoin?: boolean;
  /** Show "View details" only when a prescription exists for this appointment. */
  hasPrescription?: boolean;
  /** Missed appointments with no refund yet can request one via cancel flow. */
  canRequestRefund?: boolean;
};

const AppointmentActions = ({
  status,
  date,
  time,
  item,
  onReschedule,
  onCancel,
  onJoinCall,
  onViewDetails,
  call_status,
  canJoin,
  hasPrescription = false,
  canRequestRefund = false,
}: Props) => {
  const appointmentStatus = status?.toLowerCase();
  const schedule = resolveAppointmentDateTime({ date, time, status, ...item });
  const dateVal = schedule.date || date;
  const timeVal = schedule.time || time;

  const showReschedule = canOfferReschedule(
    status,
    dateVal,
    timeVal,
    item ?? { status, date: dateVal, time: timeVal },
  );
  const showCancel = canOfferCancel(status, dateVal, timeVal);
  const showRequestRefund = Boolean(canRequestRefund && onCancel);

  const showViewDetails =
    hasPrescription &&
    [
      'completed',
      'cancelled',
      'missed',
      'expired',
      'no_show',
      'noshow',
    ].includes(appointmentStatus);

  // Do not OR raw in_progress — that kept Join after end_time / after doctor ended
  const isCallLive =
    Boolean(canJoin) &&
    String(call_status || '').toLowerCase() === 'in_progress';
  const showJoinCall = Boolean(canJoin);

  if (showJoinCall) {
    return (
      <TouchableOpacity
        style={styles.standaloneWrap}
        onPress={onJoinCall}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#0D614E', '#14937A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientBtn, styles.joinBtn]}
        >
          <View style={styles.liveDot} />
          <Text style={styles.primaryText}>
            {isCallLive ? 'Join video call · Live' : 'Join video call'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (showReschedule || showCancel) {
    return (
      <View style={styles.btnRow}>
        {showReschedule && (
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={onReschedule}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineText}>
              {appointmentStatus === 'reschedule'
                ? 'Request change'
                : 'Reschedule'}
            </Text>
          </TouchableOpacity>
        )}

        {showCancel && (
          <TouchableOpacity
            style={[styles.cancelBtn, !showReschedule && styles.fullFlex]}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (showRequestRefund) {
    return (
      <TouchableOpacity
        style={styles.standaloneWrap}
        onPress={onCancel}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#0D614E', '#14937A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          <Text style={styles.primaryText}>Request refund</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (showViewDetails) {
    return (
      <TouchableOpacity
        style={styles.standaloneWrap}
        onPress={onViewDetails}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#0D614E', '#14937A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          <Text style={styles.primaryText}>View details</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return null;
};

export default React.memo(AppointmentActions);

const styles = StyleSheet.create({
  btnRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },

  outlineBtn: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1.2,
    borderColor: Colors.primaryColor,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },

  outlineText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    includeFontPadding: false,
  },

  joinBtn: {
    flexDirection: 'row',
    gap: 8,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },

  fullFlex: {
    flex: 1,
  },

  standaloneWrap: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },

  gradientBtn: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  primaryText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    includeFontPadding: false,
  },

  cancelBtn: {
    backgroundColor: '#FEF2F2',
    flex: 1,
    borderRadius: 12,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  cancelText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
});
