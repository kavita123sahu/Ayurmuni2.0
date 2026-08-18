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
import WaterGlass from './WaterGlass';
import {
  WATER_GLASS_ML,
  WATER_LITER_ML,
  formatWaterLiters,
  getWaterGlassCount,
} from '../utils/dietPlanUtils';
import { BUTTON, RADIUS, TYPO } from '../constants/responsive';

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
  const fillRatio = waterGoalMl > 0 ? Math.min(1, draftMl / waterGoalMl) : 0;
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

  const applyIntake = (nextMl: number) => {
    const next = Math.max(0, Math.min(nextMl, waterGoalMl));
    setDraftMl(next);
    onSetIntake(next);
  };

  const onGlassPress = (glassIndex: number) => {
    if (updating) return;
    const targetMl = (glassIndex + 1) * WATER_GLASS_ML;
    applyIntake(
      draftMl >= targetMl ? targetMl - WATER_GLASS_ML : targetMl,
    );
  };

  const onStep = (direction: 1 | -1) => {
    if (updating) return;
    applyIntake(draftMl + direction * WATER_GLASS_ML);
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

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Log water</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {dayLabel ? `${dayLabel}  ·  ` : ''}
                1 glass = {WATER_GLASS_ML} ml
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <WaterGlass
              filled={fillRatio > 0}
              fillRatio={Math.max(fillRatio, fillRatio > 0 ? 0.18 : 0)}
              size="md"
            />
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryValue}>
                {formatWaterLiters(draftMl)}
                <Text style={styles.summaryGoal}>
                  {' '}
                  / {formatWaterLiters(waterGoalMl)}
                </Text>
              </Text>
              <Text style={styles.summaryMeta}>
                {filledGlasses}/{totalGlasses} glasses  ·  {progressPct}%
              </Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => onStep(-1)}
                disabled={updating || draftMl <= 0}
                activeOpacity={0.85}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stepBtn, styles.stepBtnPlus]}
                onPress={() => onStep(1)}
                disabled={updating || draftMl >= waterGoalMl}
                activeOpacity={0.85}
              >
                <Text style={[styles.stepBtnText, styles.stepBtnPlusText]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {literGroups.map(group => {
              const literFilled = group.glasses.filter(
                glassIndex => draftMl >= (glassIndex + 1) * WATER_GLASS_ML,
              ).length;

              return (
                <View key={`liter-${group.liter}`} style={styles.literRow}>
                  <View style={styles.literMeta}>
                    <Text style={styles.literLabel}>{group.liter} L</Text>
                    <Text style={styles.literCount}>
                      {literFilled}/{group.glasses.length}
                    </Text>
                  </View>
                  <View style={styles.glassRow}>
                    {group.glasses.map(glassIndex => (
                      <WaterGlass
                        key={`glass-${glassIndex}`}
                        size="sm"
                        filled={draftMl >= (glassIndex + 1) * WATER_GLASS_ML}
                        onPress={() => onGlassPress(glassIndex)}
                        disabled={updating}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.9}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.doneBtnText}>Done</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    maxHeight: '72%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: TYPO.lg,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 1,
    fontSize: TYPO.caption,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeText: {
    fontSize: TYPO.sm,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryValue: {
    fontSize: 22,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 26,
  },
  summaryGoal: {
    fontSize: TYPO.md,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: TYPO.caption,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  stepper: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPlus: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  stepBtnText: {
    fontSize: 18,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: -1,
  },
  stepBtnPlusText: {
    color: '#FFFFFF',
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E8EEEB',
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primaryColor,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 8,
  },
  literRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.bgcolor,
    gap: 12,
  },
  literMeta: {
    width: 42,
  },
  literLabel: {
    fontSize: TYPO.sm,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  literCount: {
    fontSize: 10,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  glassRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doneBtn: {
    marginTop: 12,
    height: BUTTON.heightSm,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
