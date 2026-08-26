import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import WaterGlass from './WaterGlass';
import {
  WATER_GLASS_ML,
  WATER_GOAL_OPTIONS,
  formatWaterLiters,
  getWaterGlassCount,
} from '../utils/dietPlanUtils';
import { BUTTON, RADIUS, TYPO } from '../constants/responsive';

type WaterUnit = 'glasses' | 'liters';

type Props = {
  visible: boolean;
  planName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (goalMl: number) => void;
};

const WaterGoalStartModal = ({
  visible,
  planName,
  loading = false,
  onClose,
  onConfirm,
}: Props) => {
  const [unit, setUnit] = useState<WaterUnit>('glasses');
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setSelected(null);
      setUnit('glasses');
    }
  }, [visible]);

  const glasses = selected ? getWaterGlassCount(selected) : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Daily water goal</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {planName
              ? `How do you want to drink water for ${planName}?`
              : 'How do you want to drink water for this diet?'}
          </Text>

          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segmentBtn, unit === 'glasses' && styles.segmentBtnOn]}
              onPress={() => setUnit('glasses')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentText,
                  unit === 'glasses' && styles.segmentTextOn,
                ]}
              >
                Glasses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, unit === 'liters' && styles.segmentBtnOn]}
              onPress={() => setUnit('liters')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentText,
                  unit === 'liters' && styles.segmentTextOn,
                ]}
              >
                Liters
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.stepHint}>
            {unit === 'glasses'
              ? `Tap how many glasses a day  ·  1 glass = ${WATER_GLASS_ML} ml`
              : 'Tap how many liters a day'}
          </Text>

          <View style={styles.grid}>
            {WATER_GOAL_OPTIONS.map(option => {
              const isOn = selected === option.value;
              const glassCount = getWaterGlassCount(option.value);
              const primary =
                unit === 'glasses' ? `${glassCount}` : option.label;
              const secondary =
                unit === 'glasses'
                  ? `glasses · ${formatWaterLiters(option.value)}`
                  : `${glassCount} glasses`;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.goalCard, isOn && styles.goalCardOn]}
                  onPress={() => setSelected(option.value)}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <WaterGlass filled={isOn} size="sm" />
                  <Text style={[styles.goalPrimary, isOn && styles.goalPrimaryOn]}>
                    {primary}
                  </Text>
                  <Text style={styles.goalSecondary} numberOfLines={1}>
                    {secondary}
                  </Text>
                  {option.recommended ? (
                    <Text style={[styles.popular, isOn && styles.popularOn]}>
                      Popular
                    </Text>
                  ) : (
                    <View style={styles.popularSpacer} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.selectedLine}>
            {selected
              ? `Selected  ·  ${glasses} glasses  ·  ${formatWaterLiters(selected)} / day`
              : 'Pick one amount to continue'}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (!selected || loading) && styles.confirmBtnOff,
              ]}
              onPress={() => selected && onConfirm(selected)}
              disabled={!selected || loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>Start diet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(WaterGoalStartModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: {
    fontSize: TYPO.xl,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPO.sm,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 18,
  },
  segment: {
    marginTop: 10,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnOn: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: TYPO.sm,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  segmentTextOn: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stepHint: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  goalCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  goalCardOn: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FDFA',
  },
  goalPrimary: {
    marginTop: 4,
    fontSize: TYPO.lg,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsBold,
    lineHeight: 20,
  },
  goalPrimaryOn: {
    color: Colors.primaryColor,
  },
  goalSecondary: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
  popular: {
    marginTop: 2,
    fontSize: 9,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  popularOn: {
    color: Colors.primaryColor,
  },
  popularSpacer: {
    height: 13,
  },
  selectedLine: {
    marginTop: 10,
    fontSize: TYPO.caption,
    color: '#0369A1',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: BUTTON.heightSm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: TYPO.button,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  confirmBtn: {
    flex: 1.4,
    height: BUTTON.heightSm,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnOff: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: TYPO.button,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
