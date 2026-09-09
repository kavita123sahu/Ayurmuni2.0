import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

type Props = {
  status: string;
  onReschedule?: () => void;
  onCancel?: () => void;
  onJoinCall?: () => void;
  onViewDetails?: () => void;
  call_status?: string;
};


const AppointmentActions = ({
  status,
  onReschedule,
  onCancel,
  onJoinCall,
  onViewDetails,
  call_status,
}: Props) => {
  const appointmentStatus = status?.toLowerCase();
  const appointmentStatus = status?.toLowerCase();

  const showReschedule = [
    'pending',
    'confirmed',
    'reschedule',
    'rescheduled',
    'upcoming',
    'booked',
  ].includes(appointmentStatus);
  const showReschedule = [
    'pending',
    'confirmed',
    'reschedule',
    'rescheduled',
    'upcoming',
    'booked',
  ].includes(appointmentStatus);

  const showCancel = [
    'pending',
    'confirmed',
    'reschedule',
    'rescheduled',
    'upcoming',
    'booked',
  ].includes(appointmentStatus);
  const showCancel = [
    'pending',
    'confirmed',
    'reschedule',
    'rescheduled',
    'upcoming',
    'booked',
  ].includes(appointmentStatus);

  const showViewDetails = [
    'completed',
    'cancelled',
    'missed',
    'expired',
    'no_show',
    'noshow',
  ].includes(appointmentStatus);
  const showViewDetails = [
    'completed',
    'cancelled',
    'missed',
    'expired',
    'no_show',
    'noshow',
  ].includes(appointmentStatus);

  const showJoinCall = call_status === 'in_progress';
  const showJoinCall = call_status === 'in_progress';

  if (showReschedule || showCancel) {
    return (
      <View style={styles.btnRow}>
        {!showJoinCall && showReschedule && (
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

        {showJoinCall ? (
          <TouchableOpacity
            style={styles.flexBtn}
            onPress={onJoinCall}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#0D614E', '#14937A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.primaryText}>Join call</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          showCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )
        )}
      </View>
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

  flexBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
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
