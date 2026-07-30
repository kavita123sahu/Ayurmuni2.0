import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import TablerIcon from './TablerIcon';
import { CARD_RADIUS_MD, CARD_SURFACE } from '../constants/cardStyles';

interface Props {
  image: ImageSourcePropType;
  name: string;
  speciality: string;
  date: string;
  status?: string;
  onPressReceipt?: () => void;
  onPressReschedule?: (item?: any) => void;
  onPress?: () => void;
}

const AVATAR = 56;

const RecentDoctors: React.FC<Props> = ({
  image,
  name,
  speciality,
  date,
  status,
  onPressReceipt,
  onPressReschedule,
  onPress,
}) => {
  const hasImage =
    image &&
    typeof image === 'object' &&
    'uri' in image &&
    Boolean((image as { uri?: string }).uri);

  const statusLabel = status?.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.88 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <Image
          source={hasImage ? image : Images.doctorImage}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name || 'Doctor'}
            </Text>
            {statusLabel ? (
              <View style={styles.statusChip}>
                <Text style={styles.statusText} numberOfLines={1}>
                  {statusLabel}
                </Text>
              </View>
            ) : null}
          </View>

          {speciality ? (
            <Text style={styles.speciality} numberOfLines={1}>
              {speciality}
            </Text>
          ) : null}

          {date ? (
            <View style={styles.metaRow}>
              <TablerIcon name="calendar" size={12} color="#64748B" />
              <Text style={styles.date} numberOfLines={1}>
                {date}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onPressReceipt}
          activeOpacity={0.8}
        >
          <TablerIcon name="receipt" size={14} color="#475569" />
          <Text style={styles.secondaryText}>Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onPressReschedule?.()}
          activeOpacity={0.8}
        >
          <TablerIcon name="calendar" size={14} color="#FFFFFF" />
          <Text style={styles.primaryText}>Reschedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default memo(RecentDoctors);

const styles = StyleSheet.create({
  card: {
    ...CARD_SURFACE,
    borderRadius: CARD_RADIUS_MD,
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 14,
    backgroundColor: '#E8F2EE',
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  statusChip: {
    maxWidth: 88,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: Colors.onfillColor,
  },
  statusText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'capitalize',
  },
  speciality: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  date: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    flex: 1.15,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  primaryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
