import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { BUTTON, RADIUS, SPACING, TYPO } from '../constants/responsive';

interface Props {
  image: ImageSourcePropType;
  name: string;
  speciality: string;
  date: string;
  onPressReceipt?: () => void;
  onPressReschedule?: (item: any) => void;
}

const AVATAR_SIZE = 80;

const RecentDoctors: React.FC<Props> = ({
  image,
  name,
  speciality,
  date,
  onPressReceipt,
  onPressReschedule,
}) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />

      <View style={styles.right}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <Text style={styles.sub} numberOfLines={1}>
          <Text style={styles.speciality}>{speciality}</Text>
          <Text style={styles.dot}> • </Text>
          {date}
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.lightBtn} onPress={onPressReceipt} activeOpacity={0.75}>
            <Text style={styles.lightText} numberOfLines={1}>
              View Receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={onPressReschedule} activeOpacity={0.75}>
            <Text style={styles.primaryText} numberOfLines={1}>
              Reschedule
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecentDoctors;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  image: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: RADIUS.xl,
    marginRight: SPACING.lg,
    flexShrink: 0,
  },
  right: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: TYPO.lg,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    marginBottom: 2,
  },
  sub: {
    fontSize: TYPO.subtitle,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  speciality: {
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium,
  },
  dot: {
    color: '#94A3B8',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  lightBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    minHeight: BUTTON.heightSm,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightText: {
    color: '#475569',
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#0D614E',
    minHeight: BUTTON.heightSm,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: TYPO.subtitle,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
