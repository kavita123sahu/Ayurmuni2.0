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
import { getMedicinePrice, getMedicineScheduleChips } from '../../utils/prescriptionDetailUtils';
import { RupeeAmount } from '../../utils/currencyUtils';

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
    const appointmentId =
      item?.appointment_id ||
      item?.consultation_id ||
      item?.id ||
      '';
    navigation?.navigate('PrescriptionDetail', {
      appointment_id: appointmentId,
      consultation_id: item?.consultation_id,
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
                <RupeeAmount
                  value={fee}
                  style={styles.feeText}
                  iconSize={13}
                  iconColor={COLORS.primary}
                />
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
            key={String(
              item?.consultation_id ??
                item?.appointment_id ??
                item?.id ??
                `consult-${index}`,
            )}
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
    <View style={styles.regimenList}>
      {items.map((item, index) => {
        const price = getMedicinePrice(item);
        const chips = getMedicineScheduleChips(item);

        return (
          <View
            key={item?.id ?? `${item?.medicine_name}-${index}`}
            style={styles.medicineCard}
          >
            <View style={styles.medicineTopRow}>
              <View style={styles.iconWrapper}>
                <Text style={styles.medicineIconText}>
                  {(item?.medicine_name || 'M').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName} numberOfLines={2}>
                  {item?.medicine_name || item?.product_name || 'Medicine'}
                </Text>
                {!!item?.instruction && (
                  <Text style={styles.medicineDesc} numberOfLines={2}>
                    {item.instruction}
                  </Text>
                )}
                {chips.length > 0 ? (
                  <View style={styles.chipRow}>
                    {chips.map(chip => (
                      <View key={chip.key} style={styles.chip}>
                        <Text style={styles.chipText}>
                          {chip.caption}: {chip.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
              {price != null ? (
                <RupeeAmount
                  value={price}
                  style={styles.medicinePrice}
                  iconSize={12}
                  iconColor={COLORS.primary}
                />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEEB',
    padding: 12,
  },
  regimenList: {
    gap: 8,
  },
  medicineTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  medicineLeft: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F3EF',
  },
  medicineIconText: {
    fontSize: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.semiBold,
  },
  medicineInfo: {
    flex: 1,
    minWidth: 0,
  },
  medicineName: {
    fontSize: 14,
    lineHeight: 19,
    color: '#0F172A',
    fontFamily: Fonts.semiBold,
  },
  medicineDesc: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.medium,
  },
  medicinePrice: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: Fonts.semiBold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    color: '#475569',
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
