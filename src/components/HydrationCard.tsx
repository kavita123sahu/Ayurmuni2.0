import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import WaterIntakeModal from './WaterIntakeModal';
import WaterGlass from './WaterGlass';
import {
  WATER_GLASS_ML,
  formatWaterLiters,
  getWaterGlassCount,
} from '../utils/dietPlanUtils';
import { RADIUS, SPACING, TYPO } from '../constants/responsive';

type Props = {
  waterMl: number;
  waterGoalMl: number;
  dayLabel?: string;
  updating?: boolean;
  onSetIntake: (intakeMl: number) => void;
};

const HydrationCard = ({
  waterMl,
  waterGoalMl,
  dayLabel,
  updating = false,
  onSetIntake,
}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);

  const totalGlasses = getWaterGlassCount(waterGoalMl);
  const filledGlasses = Math.floor(waterMl / WATER_GLASS_ML);
  const progressPct = Math.min(
    100,
    waterGoalMl > 0 ? Math.round((waterMl / waterGoalMl) * 100) : 0,
  );
  const goalReached = waterMl >= waterGoalMl && waterGoalMl > 0;
  const fillRatio = waterGoalMl > 0 ? Math.min(1, waterMl / waterGoalMl) : 0;

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <View style={styles.iconWrap}>
          <WaterGlass filled={fillRatio > 0} fillRatio={fillRatio} size="xs" />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Hydration</Text>
            <Text style={styles.amount}>
              {formatWaterLiters(waterMl)}
              <Text style={styles.amountMuted}>
                {' '}
                / {formatWaterLiters(waterGoalMl)}
              </Text>
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {dayLabel ? `${dayLabel}  ·  ` : ''}
            {filledGlasses}/{totalGlasses} glasses
            {goalReached ? '  ·  Goal reached' : `  ·  ${progressPct}%`}
          </Text>
        </View>

        <View style={[styles.action, goalReached && styles.actionDone]}>
          <Text style={[styles.actionText, goalReached && styles.actionTextDone]}>
            {goalReached ? 'Done' : 'Log'}
          </Text>
        </View>
      </TouchableOpacity>

      <WaterIntakeModal
        visible={modalVisible}
        waterMl={waterMl}
        waterGoalMl={waterGoalMl}
        dayLabel={dayLabel}
        updating={updating}
        onClose={() => setModalVisible(false)}
        onSetIntake={onSetIntake}
      />
    </>
  );
};

export default React.memo(HydrationCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgcolor,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: TYPO.md,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  amount: {
    fontSize: TYPO.sm,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  amountMuted: {
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D7E5E0',
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primaryColor,
  },
  meta: {
    marginTop: 4,
    fontSize: TYPO.caption,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  action: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDone: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionText: {
    fontSize: TYPO.caption,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  actionTextDone: {
    color: '#047857',
  },
});
