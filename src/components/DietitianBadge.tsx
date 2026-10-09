import React, { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import TablerIcon from './TablerIcon';
import { Fonts } from '../common/Fonts';
import { isDietitian } from '../utils/doctorUtils';

type Props = {
  /** Doctor payload; the badge renders only when `is_dietitian` is true. */
  doctor?: any;
  /** Force-show without a payload. */
  visible?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/** "Dietitian" pill shown next to a doctor's name on cards, profile, slots and booking. */
const DietitianBadge = ({ doctor, visible, size = 'sm', style }: Props) => {
  const show = visible ?? isDietitian(doctor);
  if (!show) return null;
  const md = size === 'md';
  return (
    <View style={[styles.badge, md && styles.badgeMd, style]}>
      <TablerIcon name="salad-filled" size={md ? 12 : 10} color="#15803D" />
      <Text style={[styles.text, md && styles.textMd]} numberOfLines={1}>
        Dietitian
      </Text>
    </View>
  );
};

export default memo(DietitianBadge);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 2,
  },
  badgeMd: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 4,
  },
  text: {
    fontSize: 9.5,
    lineHeight: 13,
    color: '#15803D',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  textMd: {
    fontSize: 11,
    lineHeight: 15,
  },
});
