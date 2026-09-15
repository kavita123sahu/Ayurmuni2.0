import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import DoctorAvatar from './DoctorAvatar';
import { RupeeAmount } from '../utils/currencyUtils';
import {
  formatAppointmentDateFull,
  formatAppointmentTimeLabel,
} from '../utils/appointmentUtils';
import type { RecentVisitedDoctor } from '../hooks/useRecentVisitedDoctors';
import { resolveConsultationFee } from '../utils/doctorUtils';

type Props = {
  item: RecentVisitedDoctor;
  onPress?: () => void;
};

const VisitedDoctorHomeCard = ({
  item,
  onPress,
}: Props) => {
  const available = item.has_availability === true;

  const rating = Number(item.average_rating);
  const hasRating = Number.isFinite(rating);
  const ratingLabel = hasRating ? rating.toFixed(1) : '';

  const specialty =
    item.qualification ||
    item.doctor_designation ||
    '';

  const experience =
    item.experience_display ||
    (item.experience_years != null
      ? `${item.experience_years}+ yrs`
      : '');

  const reviewCount =
    (item as any).review_count ??
    (item as any).reviews_count ??
    (item as any).total_reviews ??
    null;

  const lastDate = formatAppointmentDateFull(
    item.last_consulted_date || '',
  );

  const lastTime = formatAppointmentTimeLabel(
    item.last_start_time || '',
  );

  const lastVisit = [lastDate, lastTime]
    .filter(Boolean)
    .join(' · ');

  const feeValue = resolveConsultationFee(item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* TOP: IMAGE + DOCTOR INFO */}
      <View style={styles.topSection}>
        <View style={styles.avatarRing}>
          <DoctorAvatar
            uri={item.doctor_image}
            name={item.doctor_name}
            doctor={item}
            size={48}
            shape="circle"
            emptyMode="icon"
          />
          {available ? <View style={styles.availableDot} /> : null}
        </View>
        <View style={styles.doctorInfo}>
          {/* NAME + AVAILABLE */}
          <View style={styles.nameRow}>
            {!!item.doctor_name && (
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {item.doctor_name}
              </Text>
            )}


          </View>


          {/* SPECIALTY */}
          {!!specialty && (
            <Text
              style={styles.specialty}
              numberOfLines={1}
            >
              {specialty}
            </Text>
          )}

          {/* RATING + REVIEWS + EXPERIENCE SAME LINE */}
          {(hasRating ||
            reviewCount != null ||
            !!experience) && (
              <View style={styles.metaRow}>
                {hasRating && (
                  <>
                    <TablerIcon
                      name="star-filled"
                      size={11}
                      color="#F59E0B"
                    />

                    <Text style={styles.ratingText}>
                      {ratingLabel}
                    </Text>
                  </>
                )}

                {reviewCount != null && (
                  <Text style={styles.reviewText}>
                    ({reviewCount})
                  </Text>
                )}

                {hasRating && !!experience && (
                  <Text style={styles.separator}>
                    ·
                  </Text>
                )}

                {!!experience && (
                  <Text
                    style={styles.experience}
                    numberOfLines={1}
                  >
                    {experience} {''}
                    <Text style={styles.experienceText}>
                      yrs exp
                    </Text>
                  </Text>
                )}
              </View>
            )}
        </View>
      </View>

      {/* LAST VISIT */}
      {!!lastVisit && (
        <View style={styles.visitRow}>
          <TablerIcon
            name="calendar"
            size={12}
            color={Colors.primaryColor}
          />

          <Text
            style={styles.lastVisit}
            numberOfLines={1}
          >
            Last visit · {lastVisit}
          </Text>
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* FEE */}
        <View style={styles.feeContainer}>
          {feeValue != null ? (
            <>
              <Text style={styles.feeLabel}>
                Consultation
              </Text>

              <RupeeAmount
                value={feeValue}
                style={styles.fee}
              />
            </>
          ) : (
            <Text style={styles.consultationText}>
              Consultation
            </Text>
          )}
        </View>

        {/* BOOK AGAIN ONLY WHEN AVAILABLE */}

        <Pressable
          style={styles.bookButton}
          onPress={onPress}
        >
          <Text style={styles.bookButtonText}>
            Book Again
          </Text>

          <TablerIcon
            name="arrow-right"
            size={13}
            color="#FFFFFF"
          />
        </Pressable>

      </View>
    </Pressable>
  );
};

export default React.memo(VisitedDoctorHomeCard);

const styles = StyleSheet.create({
  /* CARD */
  card: {
    width: 245,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EFEA',
    padding: 12,
    marginRight: 10,
  },

  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },

  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#D8EBE3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },

  availableDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },

  /* DOCTOR INFO */
  doctorInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  /* NAME + BADGE */
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  /* AVAILABLE BADGE */
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

 
  availableText: {
    fontSize: 8,
    lineHeight: 11,
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  /* SPECIALTY */
  specialty: {
    marginTop: 1,
    fontSize: 10.5,
    lineHeight: 15,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsMedium,
  },

  /* RATING + EXPERIENCE */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    minWidth: 0,
  },

  ratingText: {
    marginLeft: 3,
    fontSize: 10,
    lineHeight: 14,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  reviewText: {
    marginLeft: 3,
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },

  separator: {
    marginHorizontal: 5,
    fontSize: 10,
    color: '#CBD5E1',
    fontFamily: Fonts.PoppinsMedium,
  },

  experience: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  experienceText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,

  },

  /* LAST VISIT */
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    minWidth: 0,
  },

  lastVisit: {
    flex: 1,
    marginLeft: 5,
    fontSize: 10,
    lineHeight: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  /* FOOTER */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
    gap: 7,
  },

  feeContainer: {
    flex: 1,
    minWidth: 0,
  },

  feeLabel: {
    fontSize: 8.5,
    lineHeight: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  fee: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  consultationText: {
    fontSize: 11,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  /* BOOK AGAIN */
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: Colors.primaryColor,
    gap: 3,
  },

  bookButtonText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});