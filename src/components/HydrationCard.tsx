import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import WaterIntakeModal from './WaterIntakeModal';
import WaterGlass, { WaterGlassRow } from './WaterGlass';
import {
  WATER_GLASS_ML,
  WATER_LITER_ML,
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
  const litersDone = Math.floor(waterMl / WATER_LITER_ML);
  const litersGoal = Math.ceil(waterGoalMl / WATER_LITER_ML);

  const visibleGlasses = useMemo(
    () => Math.min(totalGlasses, 8),
    [totalGlasses],
  );

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.92}
      >
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Water intake</Text>
            <Text style={styles.subtitle}>
              {dayLabel ? `${dayLabel} · ` : ''}
              {formatWaterLiters(waterMl)} / {formatWaterLiters(waterGoalMl)}
            </Text>
          </View>
          {goalReached ? (
            <View style={styles.doneBadge}>
              <TablerIcon name="circle-check" size={14} color="#047857" />
              <Text style={styles.doneBadgeText}>Goal met</Text>
            </View>
          ) : (
            <View style={styles.logChip}>
              <Text style={styles.logChipText}>+ Log</Text>
            </View>
          )}
        </View>

        <View style={styles.heroRow}>
          <WaterGlass filled={filledGlasses > 0} size="md" />
          <View style={styles.stats}>
            <Text style={styles.statMain}>
              {filledGlasses}
              <Text style={styles.statMuted}>/{totalGlasses}</Text>
            </Text>
            <Text style={styles.statLabel}>glasses today</Text>
            <Text style={styles.statSub}>
              {litersDone}/{litersGoal} L · {WATER_GLASS_ML} ml each
            </Text>
          </View>
          <View style={styles.ring}>
            <Text style={styles.ringPct}>{progressPct}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.glassScroll}
        >
          <WaterGlassRow
            totalGlasses={totalGlasses}
            filledGlasses={filledGlasses}
            size="sm"
            maxVisible={visibleGlasses}
          />
        </ScrollView>

        <Text style={styles.tapHint}>Tap to open glasses and update intake</Text>
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
    backgroundColor: '#F0F9FF',
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: TYPO.lg,
    color: '#0C4A6E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPO.sm,
    color: '#0369A1',
    fontFamily: Fonts.PoppinsMedium,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  doneBadgeText: {
    fontSize: TYPO.caption,
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  logChip: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  logChipText: {
    fontSize: TYPO.caption,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stats: {
    flex: 1,
    minWidth: 0,
  },
  statMain: {
    fontSize: TYPO.xxl + 4,
    color: '#0C4A6E',
    fontFamily: Fonts.PoppinsBold,
    lineHeight: 28,
  },
  statMuted: {
    fontSize: TYPO.lg,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  statLabel: {
    fontSize: TYPO.sm,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  statSub: {
    marginTop: 2,
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  ring: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: TYPO.sm,
    color: '#0369A1',
    fontFamily: Fonts.PoppinsBold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0EA5E9',
  },
  glassScroll: {
    paddingVertical: SPACING.xs,
    gap: 4,
  },
  tapHint: {
    marginTop: SPACING.sm,
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
});
