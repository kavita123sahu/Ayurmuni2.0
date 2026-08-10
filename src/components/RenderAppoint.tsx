import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { getStatusStyle } from '../common/DataInterface';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { RADIUS, SPACING, TYPO } from '../constants/responsive';
import AppointAction from './AppointAction';
import TablerIcon from './TablerIcon';
import {
  buildAppointmentDetailsParams,
  buildVideoCallNavParams,
} from '../utils/appointmentUtils';
import { showSuccessToast } from '../config/Key';
import { navigateToStackScreen } from '../navigation/navigationUtils';

const DateTimeCard = ({ item, isHorizontal = false }: any) => {
  if (isHorizontal) {
    return (
      <View style={styles.hMetaRow}>
        <View style={styles.hMetaChip}>
          <TablerIcon name="calendar" size={13} color={Colors.primaryColor} />
          <Text style={styles.hMetaText} numberOfLines={1}>
            {item.date}
          </Text>
        </View>
        <View style={styles.hMetaChip}>
          <TablerIcon name="clock" size={13} color={Colors.primaryColor} />
          <Text style={styles.hMetaText} numberOfLines={1}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoItem}>
        <View style={styles.iconCircle}>
          <TablerIcon name="calendar" size={18} color={Colors.primaryColor} />
        </View>
        <View>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <View style={styles.iconCircle}>
          <TablerIcon name="clock" size={18} color={Colors.primaryColor} />
        </View>
        <View>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{item.time}</Text>
        </View>
      </View>
    </View>
  );
};

const RenderAppoint = ({
  item,
  navigation,
  onReschedule,
  isHorizontal = false,
  onCancel,
}: any) => {
  const statusStyle = useMemo(
    () => getStatusStyle(item?.status),
    [item],
  );

  const therapies = Array.isArray(item?.rawData?.doctor?.health_diseases)
    ? item.rawData.doctor.health_diseases
      .map((disease: any) => disease.name)
      .filter(Boolean)
      .join(', ')
    : '';

  const therapyPreview = therapies
    ? therapies.split(',').slice(0, 2).join(', ')
    : item?.specialty || 'Ayurvedic consult';

  const statusLabel =
    item.status === 'cancellation_requested'
      ? 'CONFIRMED'
      : String(item.status).toUpperCase();

  const openAppointmentDetails = () => {
    navigation.navigate(
      'AppointmentDetails',
      buildAppointmentDetailsParams({ rawData: item.rawData, ...item }),
    );
  };

  if (isHorizontal) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.hCard}
        onPress={openAppointmentDetails}
      >
        {/* <LinearGradient
          colors={['#0D614E', '#12856A', '#1A9B7A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hAccent}
        /> */}

        <View style={styles.hInner}>
          <View style={styles.hTopRow}>
            <View
              style={[
                styles.status,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusLabel}
              </Text>
            </View>
            {item?.rawData?.follow_up?.date ? (
              <View style={styles.followUP}>
                <Text style={styles.followUPText}>
                  Follow-up · {item.rawData.follow_up.date}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.hDoctorRow}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.hAvatar} />
            ) : (
              <View style={[styles.hAvatar, styles.avatarFallback]}>
                <TablerIcon name="user" size={20} color={Colors.primaryColor} />
              </View>
            )}
            <View style={styles.hDoctorText}>
              <Text style={styles.hDoctorName} numberOfLines={1}>
                {item.doctorName}
              </Text>
              <Text style={styles.hSpeciality} numberOfLines={1}>
                {therapyPreview}
              </Text>
            </View>
            <View style={styles.hChevron}>
              <TablerIcon name="chevron-right" size={16} color="#94A3B8" />
            </View>
          </View>

          <View style={{ borderWidth: 0.2, borderColor: '#74686800' }} />

          <DateTimeCard item={item} isHorizontal />
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
      {/* <LinearGradient
        colors={['#E8F5E9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.vAccentBar}
      /> */}

      <View style={styles.contentContainer}>
        <View style={styles.vHeader}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <TablerIcon name="user" size={22} color={Colors.primaryColor} />
            </View>
          )}

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
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.vSpeciality} numberOfLines={1}>
              {therapyPreview}
            </Text>

            {item?.name ? (
              <Text style={styles.vPatient} numberOfLines={1}>
                Patient · {item.name}
              </Text>
            ) : null}

            {item?.rawData?.follow_up?.date ? (
              <View style={[styles.followUP, { marginTop: 6 }]}>
                <Text style={styles.followUPText}>
                  Follow-up · {item.rawData.follow_up.date}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <DateTimeCard item={item} />
      </View>

      <AppointAction
        status={item.status}
        call_status={item.call_status}
        onReschedule={onReschedule}
        onCancel={onCancel}
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
        onViewDetails={() =>
          navigation.navigate('DoctorSlipScreen', {
            doctorID: item?.rawData?.doctor?.doctor_id,
          })
        }
      />
    </TouchableOpacity>
  );
};

export default memo(RenderAppoint);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E6EFEA',
    // overflow: 'hidden',
    // shadowColor: '#0D614E',
    // shadowOpacity: 0.06,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 2,
  },
  vAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  contentContainer: {
    flexDirection: 'column',
  },
  vHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vHeaderText: {
    flex: 1,
    marginLeft: 12,
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
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  vSpeciality: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  vPatient: {
    marginTop: 4,
    fontSize: 11,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FAF7',
  },

  followUP: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
  },
  followUPText: {
    fontSize: TYPO.sm,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4FAF7',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E6EFEA',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E6EFEA',
  },
  infoLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  infoValue: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  /* Horizontal (Home) */
  hCard: {
    width: 268,
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EFEA',
    // overflow: 'hidden',
    // shadowColor: '#0D614E',
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: 5 },
    // elevation: 3,
  },
  hAccent: {
    height: 4,
    width: '100%',
  },
  hInner: {
    padding: 12,
  },
  hTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  hDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  hDoctorText: {
    flex: 1,
  },
  hDoctorName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  hSpeciality: {
    marginTop: 1,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  hChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hMetaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    // backgroundColor: '#F4FAF7',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    // borderWidth: 1,
    borderColor: '#E6EFEA',
  },
  hMetaText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
});
