import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../TablerIcon';

type Props = {
  onMyPlansPress: () => void;
};

const TAGS: { icon: TablerIconName; label: string }[] = [
  { icon: 'stethoscope', label: 'Doctor-led' },
  { icon: 'leaf', label: 'Diet guidance' },
  { icon: 'credit-card', label: 'Save up to 40%' },
];

/** Hero promo on View All Care Plans — matches marketing card design. */
const CarePlansPromoCard = ({ onMyPlansPress }: Props) => (
  <View style={styles.card}>
    <Text style={styles.kicker}>AYURVEDIC CARE PLANS</Text>
    <Text style={styles.title}>Care that continues{'\n'}beyond one consult</Text>

    <View style={styles.tags}>
      {TAGS.map(tag => (
        <View key={tag.label} style={styles.tag}>
          <TablerIcon name={tag.icon} size={13} color="#FFFFFF" />
          <Text style={styles.tagText}>{tag.label}</Text>
        </View>
      ))}
    </View>

    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onMyPlansPress}
      style={styles.cta}
    >
      <TablerIcon name="certificate" size={15} color={Colors.primaryColor} />
      <Text style={styles.ctaText}>My Plans</Text>
      <TablerIcon name="chevron-right" size={15} color={Colors.primaryColor} />
    </TouchableOpacity>
  </View>
);

export default memo(CarePlansPromoCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'left',
  },
  title: {
    marginTop: 8,
    fontFamily: Fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  tags: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tagText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  ctaText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: Colors.primaryColor,
  },
});
