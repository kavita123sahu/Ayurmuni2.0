import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../common/Colors';
import TablerIcon from '../TablerIcon';

const COLORS = {
  primary: '#0D614E',
  secondary: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
  greenBg: '#E8F7EF',
  green: Colors.primaryColor,
  blueBg: '#EEF4FF',
  blue: '#3B82F6',
  text: '#111827',
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
  const handlePress = (item: any) => {
    if (onPressItem) {
      onPressItem(item);
      return;
    }
    navigation?.navigate('PrescriptionDetail', {
      PrisData: item,
      doctorData: doctor,
    });
  };

  const renderConsultationCard = (item: any) => {
    const isGreen = item.appointment_status === 'completed';
    const isBlue = item.appointment_status === 'confirmed';

    return (
      <TouchableOpacity
        style={styles.consultationCard}
        activeOpacity={0.85}
        onPress={() => handlePress(item)}
      >
        <View style={styles.consultationTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.consultDate}>{item?.appointment_date}</Text>
            <Text style={styles.consultTitle} numberOfLines={2}>
              {item?.prescription?.diagnosis_advice || 'Consultation'}
            </Text>
          </View>

          <View
            style={[
              styles.progressBox,
              {
                backgroundColor: isGreen
                  ? COLORS.greenBg
                  : isBlue
                    ? COLORS.blueBg
                    : '#F3F4F6',
              },
            ]}
          >
            {/* <Text
              style={[
                styles.progressText,
                {
                  color: isGreen
                    ? COLORS.green
                    : isBlue
                      ? COLORS.blue
                      : '#9CA3AF',
                },
              ]}
            >
              {item.progress ?? '—'}
            </Text> */}
            <Text
              style={[
                styles.improvementText,
                {
                  color: isGreen
                    ? COLORS.green
                    : isBlue
                      ? COLORS.blue
                      : '#9CA3AF',
                },
              ]}
            >
              {isGreen ? 'completed' : 'in-progress'}
            </Text>
          </View>
        </View>

        {!!item?.prescription?.symptom_description && (
          <Text style={styles.consultDesc} numberOfLines={3}>
            {item.prescription.symptom_description}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.viewText}>View Prescription</Text>
          <View style={styles.arrowButton}>
            <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!consultations.length) {
    return null;
  }

  return (
    <View style={styles.timelineWrapper}>
      <View style={styles.trackLine} />
      {consultations.map((item, index) => {
        if (!item) return null;
        const isLatest = index === 0;

        return (
          <View
            key={item.consultation_id ?? item.appointment_id ?? index}
            style={styles.timelineItem}
          >
            <View style={[styles.dot, isLatest && styles.dotActive]} />
            {renderConsultationCard(item)}
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
  timelineWrapper: {
    position: 'relative',
    paddingLeft: 28,
  },
  trackLine: {
    position: 'absolute',
    left: 7,
    top: 10,
    bottom: 10,
    width: 1.5,
    borderStyle: 'dashed',
    borderLeftWidth: 1.5,
    borderColor: COLORS.border,
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 14,
  },
  dot: {
    position: 'absolute',
    left: -28,
    top: 16,
    width: 15,
    height: 15,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#D1D5DB',
    zIndex: 1,
  },
  dotActive: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.secondaryColor,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  consultationTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consultDate: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: Fonts.medium,
  },
  consultTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: Fonts.semiBold,
    marginTop: 4,
  },
  progressBox: {
    minWidth: 74,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  improvementText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  consultDesc: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 22,
    color: COLORS.secondary,
    fontFamily: Fonts.regular,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: Fonts.semiBold,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
