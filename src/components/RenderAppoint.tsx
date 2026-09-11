import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';

import { getStatusStyle } from '../common/DataInterface';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import AppointAction from './AppointAction';
import TablerIcon from './TablerIcon';
import {
  buildAppointmentDetailsParams,
  buildVideoCallNavParams,
} from '../utils/appointmentUtils';
import { showSuccessToast } from '../config/Key';
import { navigateToStackScreen } from '../navigation/navigationUtils';

const formatStatusLabel = (status?: string) => {
  if (status === 'cancellation_requested') return 'Confirmed';
  const raw = String(status || '')
    .replace(/_/g, ' ')
    .trim();
  if (!raw) return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const ScheduleRow = ({ item }: any) => (
  <View style={styles.scheduleRow}>
    <View style={styles.scheduleCell}>
      <View style={styles.scheduleIcon}>
        <TablerIcon name="calendar" size={15} color={Colors.primaryColor} />
      </View>
      <View style={styles.scheduleTextWrap}>
        <Text style={styles.scheduleLabel}>Date</Text>
        <Text style={styles.scheduleValue} numberOfLines={1}>
          {item.date}
        </Text>
      </View>
    </View>

    <View style={styles.scheduleDivider} />

    <View style={styles.scheduleCell}>
      <View style={styles.scheduleIcon}>
        <TablerIcon name="clock" size={15} color={Colors.primaryColor} />
      </View>
      <View style={styles.scheduleTextWrap}>
        <Text style={styles.scheduleLabel}>Time</Text>
        <Text style={styles.scheduleValue} numberOfLines={1}>
          {item.time}
        </Text>
      </View>
    </View>
  </View>
);

const RenderAppoint = ({
  item,
  navigation,
  onReschedule,
  isHorizontal = false,
  onCancel,
}: any) => {
  const statusStyle = useMemo(() => getStatusStyle(item?.status), [item]);

  const therapies = Array.isArray(item?.rawData?.doctor?.health_diseases)
    ? item.rawData.doctor.health_diseases
      .map((disease: any) => disease.name)
      .filter(Boolean)
      .join(', ')
    : '';

  const therapyPreview = therapies
    ? therapies.split(',').slice(0, 2).join(', ')
    : item?.specialty || 'Ayurvedic consultation';

  const statusLabel = formatStatusLabel(item.status);

  const openAppointmentDetails = () => {
    navigation.navigate(
      'AppointmentDetails',
      buildAppointmentDetailsParams({ rawData: item.rawData, ...item }),
    );
  };

  if (isHorizontal) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.hCard}
        onPress={openAppointmentDetails}
      >
        <View style={styles.hInner}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.hAvatar} />
          ) : (
            <View style={[styles.hAvatar, styles.avatarFallback]}>
              <TablerIcon name="user" size={20} color={Colors.primaryColor} />
            </View>
          )}

          <View style={styles.hBody}>
            <Text style={styles.hDoctorName} numberOfLines={1}>
              {item.doctorName}
            </Text>

            <View style={styles.hMetaRow}>
              <View style={styles.hMetaChip}>
                <TablerIcon
                  name="calendar"
                  size={11}
                  color={Colors.primaryColor}
                />
                <Text style={styles.hMetaText} numberOfLines={1}>
                  {item.date}
                </Text>
              </View>
              <View style={styles.hMetaChip}>
                <TablerIcon
                  name="clock"
                  size={11}
                  color={Colors.primaryColor}
                />
                <Text style={styles.hMetaText} numberOfLines={1}>
                  {item.time}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.status,
                styles.hStatus,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={openAppointmentDetails}
    >
      <View style={styles.vHeader}>
        <View style={styles.avatarRing}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <TablerIcon name="user" size={22} color={Colors.primaryColor} />
            </View>
          )}
        </View>

        <View style={styles.vHeaderText}>
          <View style={styles.headerRow}>
            <Text style={styles.vDoctorName} numberOfLines={1}>
              {item.doctorName}
            </Text>
            <View
              style={[
                styles.status,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusStyle.color }]}
              />
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.vSpeciality} numberOfLines={1}>
            {therapyPreview}
          </Text>

          {item?.name ? (
            <View style={styles.patientRow}>
              <TablerIcon name="user" size={12} color="#64748B" />
              <Text style={styles.vPatient} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScheduleRow item={item} />

      {item?.rawData?.follow_up?.date ? (
        <View style={styles.followUP}>
          <TablerIcon name="refresh" size={12} color={Colors.primaryColor} />
          <Text style={styles.followUPText}>
            Follow-up scheduled · {item.rawData.follow_up.date}
          </Text>
        </View>
      ) : null}

      <View style={styles.actionDivider} />

      <AppointAction
        status={item.status}
        call_status={item.call_status}
        onReschedule={onReschedule}
        onCancel={onCancel}
        // hasPrescription={hasPrescription}
        onJoinCall={() => {
          if (item.call_status !== 'in_progress') {
            showSuccessToast(
              'Video call is not active yet. Please wait for the doctor to start the consultation.',
              'error',
            );
            return;
          }

          navigateToStackScreen(
            navigation,
            'PatientVideoCallScreen',
            buildVideoCallNavParams(
              { rawData: item.rawData, ...item },
              {
                role: 'patient',
                otherPartyName: item?.doctorName,
                otherPartyImage: item?.image,
              },
            ),
          );
        }}
        onViewDetails={() => {
          // if (!hasPrescription) {
          //   showSuccessToast('No prescription available for this appointment', 'error');
          //   return;
          // }
          navigation.navigate('PrescriptionDetail', {
            appointment_id:
              item?.appointment_id ||
              item?.consultation_id ||
              item?.rawData?.appointment?.appointment_id ||
              item?.rawData?.appointment_id,
            consultation_id:
              item?.consultation_id ||
              item?.rawData?.appointment?.consultation_id,
          });
        }}
      />
    </TouchableOpacity>
  );
};

export default memo(RenderAppoint);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF3F1',
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  vHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarRing: {
    padding: 2,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#D8EBE4',
    backgroundColor: '#FFFFFF',
  },
  vHeaderText: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  vDoctorName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  vSpeciality: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  patientRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vPatient: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FAF7',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FAF7',
  },

  followUP: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.onfillColor,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D8EBE4',
  },
  followUPText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
    includeFontPadding: false,
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },

  scheduleRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EEF3F1',
  },
  scheduleCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  scheduleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5EBE8',
  },
  scheduleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  scheduleLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  scheduleValue: {
    marginTop: 1,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  scheduleDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5EBE8',
    marginHorizontal: 8,
  },

  actionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EEF0',
    marginTop: 12,
    marginBottom: 2,
  },

  /* Horizontal (Home) */
  hCard: {
    width: 240,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF3F1',
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  hInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  hBody: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  hAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4FAF7',
  },
  hDoctorName: {
    fontSize: 13,
    lineHeight: 17,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  hMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    maxWidth: '100%',
  },
  hMetaText: {
    fontSize: 10,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
    includeFontPadding: false,
  },
  hStatus: {
    alignSelf: 'flex-start',
    marginTop: 1,
  },
});
