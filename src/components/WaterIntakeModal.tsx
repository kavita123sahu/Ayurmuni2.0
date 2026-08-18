import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import WaterGlass from './WaterGlass';
import {
  WATER_GLASS_ML,
  WATER_LITER_ML,
  formatWaterLiters,
  getWaterGlassCount,
} from '../utils/dietPlanUtils';
import { RADIUS, SPACING, TYPO } from '../constants/responsive';

type Props = {
  visible: boolean;
  waterMl: number;
  waterGoalMl: number;
  dayLabel?: string;
  updating?: boolean;
  onClose: () => void;
  onSetIntake: (intakeMl: number) => void;
};

const WaterIntakeModal = ({
  visible,
  waterMl,
  waterGoalMl,
  dayLabel,
  updating = false,
  onClose,
  onSetIntake,
}: Props) => {
  const [draftMl, setDraftMl] = useState(waterMl);

  useEffect(() => {
    if (visible) setDraftMl(waterMl);
  }, [visible, waterMl]);

  const totalGlasses = getWaterGlassCount(waterGoalMl);
  const filledGlasses = Math.floor(draftMl / WATER_GLASS_ML);
  const progressPct = Math.min(
    100,
    waterGoalMl > 0 ? Math.round((draftMl / waterGoalMl) * 100) : 0,
  );
  const literCount = Math.ceil(waterGoalMl / WATER_LITER_ML);

  const literGroups = useMemo(() => {
    const groups: { liter: number; glasses: number[] }[] = [];
    for (let liter = 1; liter <= literCount; liter += 1) {
      const startIndex = (liter - 1) * 4;
      const endIndex = Math.min(startIndex + 4, totalGlasses);
      const glasses: number[] = [];
      for (let i = startIndex; i < endIndex; i += 1) {
        glasses.push(i);
      }
      if (glasses.length) groups.push({ liter, glasses });
    }
    return groups;
  }, [literCount, totalGlasses]);

  const onGlassPress = (glassIndex: number) => {
    if (updating) return;
    const targetMl = (glassIndex + 1) * WATER_GLASS_ML;
    const next =
      draftMl >= targetMl
        ? Math.max(0, targetMl - WATER_GLASS_ML)
        : Math.min(targetMl, waterGoalMl);
    setDraftMl(next);
    onSetIntake(next);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.hero}>
            <WaterGlass filled={filledGlasses > 0} size="lg" />
            <View style={styles.heroText}>
              <Text style={styles.title}>Log your water</Text>
              <Text style={styles.subtitle}>
                {dayLabel ? `${dayLabel} · ` : ''}
                {formatWaterLiters(draftMl)} of {formatWaterLiters(waterGoalMl)}
              </Text>
              <Text style={styles.heroMeta}>
                {filledGlasses}/{totalGlasses} glasses · {progressPct}% complete
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>

          <Text style={styles.hint}>
            Tap a glass to add {WATER_GLASS_ML} ml. Tap a filled glass to remove it.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {literGroups.map(group => {
              const literMl = group.liter * WATER_LITER_ML;
              const literDone = draftMl >= literMl;
              const literFilled = Math.min(
                4,
                Math.max(
                  0,
                  Math.floor(
                    (draftMl - (group.liter - 1) * WATER_LITER_ML) /
                      WATER_GLASS_ML,
                  ),
                ),
              );

              return (
                <View key={`liter-${group.liter}`} style={styles.literBlock}>
                  <View style={styles.literHeader}>
                    <Text style={styles.literLabel}>{group.liter} litre</Text>
                    {literDone ? (
                      <View style={styles.literDoneBadge}>
                        <TablerIcon name="check" size={12} color="#047857" />
                        <Text style={styles.literDoneText}>Complete</Text>
                      </View>
                    ) : (
                      <Text style={styles.literPending}>
                        {literFilled}/4 glasses
                      </Text>
                    )}
                  </View>
                  <View style={styles.glassRow}>
                    {group.glasses.map(glassIndex => (
                      <WaterGlass
                        key={`glass-${glassIndex}`}
                        size="md"
                        filled={draftMl >= (glassIndex + 1) * WATER_GLASS_ML}
                        mlLabel="250ml"
                        onPress={() => onGlassPress(glassIndex)}
                        disabled={updating}
                        style={styles.glassItem}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            {updating ? (
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            ) : (
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={onClose}
                activeOpacity={0.9}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(WaterIntakeModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: '#F8FCFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    maxHeight: '82%',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: SPACING.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: TYPO.lg + 1,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPO.sm,
    color: '#0369A1',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroMeta: {
    marginTop: 4,
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0EA5E9',
  },
  hint: {
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.sm,
  },
  literBlock: {
    marginBottom: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  literHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  literLabel: {
    fontSize: TYPO.md,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  literDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  literDoneText: {
    fontSize: TYPO.caption,
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  literPending: {
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  glassItem: {
    flex: 1,
    alignItems: 'center',
  },
  footer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
    alignItems: 'center',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: Colors.primaryColor,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
