import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../common/Colors';
import TablerIcon from '../TablerIcon';
import {
  formatSlipDate,
  formatSlipTimeRange,
  getConsultationTitle,
  getPatientMeta,
  hasPrescribedData,
} from '../../utils/doctorSlipUtils';

const COLORS = {
  primary: '#0D614E',
  secondary: '#64748B',
  white: '#FFFFFF',
  border: '#E8EEEB',
  text: '#0F172A',
  soft: '#F3F7F5',
  accentSoft: '#E8F3EF',
};

const Fonts = {
  semiBold: 'Poppins-SemiBold',
  medium: 'Poppins-Medium',
  regular: 'Poppins-Regular',
};

type ConsultationTimelineProps = {
  consultations: any[];
  doctor?: any;
  navigation?: any;
  onPressItem?: (item: any) => void;
};

export const ConsultationTimeline = ({
  consultations,
  doctor,
  navigation,
  onPressItem,
}: ConsultationTimelineProps) => {
  const openPrescription = (item: any) => {
    if (onPressItem) {
      onPressItem(item);
      return;
    }
    navigation?.navigate('PrescriptionDetail', {
      PrisData: item,
      doctorData: doctor,
    });
  };

  const renderConsultationCard = (item: any, index: number) => {
    const canViewPrescription = hasPrescribedData(item);
    const patientMeta = getPatientMeta(item?.patient);
    const timeRange = formatSlipTimeRange(item?.start_time, item?.end_time);
    const fee =
      item?.payment?.consultation_fee ?? item?.payment?.amount ?? null;
    const concern = item?.concern?.trim?.() || '';
    const symptom = item?.prescription?.symptom_description?.trim?.() || '';
    const summary = concern || symptom;

    return (
      <View style={styles.consultationCard}>
        <View style={styles.cardAccent} />

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <View style={styles.datePill}>
              <TablerIcon name="calendar" size={13} color={COLORS.primary} />
              <Text style={styles.datePillText}>
                {formatSlipDate(item?.appointment_date || item?.date)}
              </Text>
            </View>
            {!!item?.consultation_type && (
              <Text style={styles.typeChip}>
                {String(item.consultation_type)}
              </Text>
            )}
          </View>

          <Text style={styles.consultTitle} numberOfLines={2}>
            {getConsultationTitle(item)}
          </Text>

          <Text style={styles.consultMeta}>
            {[
              timeRange !== '—' ? timeRange : '',
              item?.duration_minutes ? `${item.duration_minutes} min` : '',
            ]
              .filter(Boolean)
              .join('  ·  ')}
          </Text>

          {!!item?.patient?.patient_name && (
            <View style={styles.patientRow}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>
                  {String(item.patient.patient_name).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName} numberOfLines={1}>
                  {item.patient.patient_name}
                </Text>
                {!!patientMeta && (
                  <Text style={styles.patientMeta} numberOfLines={1}>
                    {patientMeta}
                  </Text>
                )}
              </View>
              {fee != null && (
                <Text style={styles.feeText}>
                  ₹{Number(fee).toLocaleString('en-IN')}
                </Text>
              )}
            </View>
          )}

          {!!summary && (
            <Text style={styles.consultDesc} numberOfLines={2}>
              {summary}
            </Text>
          )}

          {canViewPrescription ? (
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.88}
              onPress={() => openPrescription(item)}
            >
              <TablerIcon name="prescription" size={16} color="#FFFFFF" />
              <Text style={styles.ctaText}>View Prescription</Text>
              <TablerIcon name="chevron-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.noRxHint}>
              Prescription not available for this visit
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (!consultations.length) {
    return null;
  }

  return (
    <View style={styles.listWrap}>
      {consultations.map((item, index) => {
        if (!item) return null;
        return (
          <View
            key={item.consultation_id ?? item.appointment_id ?? index}
          >
            {renderConsultationCard(item, index)}
          </View>
        );
      })}
    </View>
  );
};

export const StitchedRegimenList = ({ items }: { items: any[] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <>
      {items.map((item, index) => (
        <View
          key={item?.id ?? `${item?.medicine_name}-${index}`}
          style={styles.medicineCard}
        >
          <View style={styles.medicineTopRow}>
            <View style={styles.medicineLeft}>
              <View style={styles.iconWrapper}>
                <Text style={styles.medicineIconText}>
                  {(item?.medicine_name || 'M').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{item?.medicine_name}</Text>
                {!!item?.instruction && (
                  <Text style={styles.medicineDesc}>{item.instruction}</Text>
                )}
              </View>
            </View>
            <View style={styles.timeWrapper}>
              {!!item?.frequency && (
                <Text style={styles.timeText}>{item.frequency} frequency</Text>
              )}
              {!!item?.dosage && (
                <Text style={styles.timeText}>{item.dosage} dosage</Text>
              )}
            </View>
          </View>
          {!!item?.duration && (
            <View style={styles.regimenBottomRow}>
              <Text style={styles.durationText}>{item.duration} duration</Text>
            </View>
          )}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  listWrap: {
    gap: 12,
  },
  consultationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  datePillText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: Fonts.medium,
  },
  typeChip: {
    fontSize: 11,
    color: COLORS.secondary,
    fontFamily: Fonts.medium,
    textTransform: 'capitalize',
    backgroundColor: COLORS.soft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  consultTitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    fontFamily: Fonts.semiBold,
  },
  consultMeta: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: Fonts.regular,
  },
  patientRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.soft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: Fonts.semiBold,
  },
  patientName: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: Fonts.semiBold,
  },
  patientMeta: {
    marginTop: 1,
    fontSize: 11,
    color: COLORS.secondary,
    fontFamily: Fonts.regular,
    textTransform: 'capitalize',
  },
  feeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: Fonts.semiBold,
  },
  consultDesc: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondary,
    fontFamily: Fonts.regular,
  },
  ctaBtn: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  ctaText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
  },
  noRxHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.regular,
  },
  medicineCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#94A3B833',
    padding: 15,
  },
  medicineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicineLeft: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 10,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0051470D',
    marginRight: 12,
  },
  medicineIconText: {
    fontSize: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.semiBold,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 15,
    lineHeight: 24,
    color: '#0F172A',
    fontFamily: Fonts.semiBold,
  },
  medicineDesc: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 22,
    color: '#64748B',
    fontFamily: Fonts.medium,
  },
  timeWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFBA2033',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#5E4200',
    fontFamily: Fonts.semiBold,
  },
  regimenBottomRow: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.medium,
  },
});
