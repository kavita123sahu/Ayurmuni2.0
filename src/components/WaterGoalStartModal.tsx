import React, { useEffect, useState } from 'react';
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
import WaterGlass, { WaterGoalGlassPreview } from './WaterGlass';
import {
  WATER_GLASS_ML,
  WATER_GOAL_OPTIONS,
  formatWaterLiters,
  getWaterGlassCount,
} from '../utils/dietPlanUtils';
import { BUTTON, RADIUS, SPACING, TYPO } from '../constants/responsive';

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
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setSelected(null);
  }, [visible]);

  const selectedOption = WATER_GOAL_OPTIONS.find(o => o.value === selected);
  const previewGlasses = selectedOption
    ? getWaterGlassCount(selectedOption.value)
    : 0;

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
          <Text style={styles.eyebrow}>Before you start</Text>
          <Text style={styles.title}>What's your daily water goal?</Text>
          <Text style={styles.subtitle}>
            {planName
              ? `We'll track hydration every day of "${planName}".`
              : 'Choose how much water you want to drink each day.'}
          </Text>

          <View style={styles.heroGlass}>
            <WaterGlass
              filled={!!selectedOption}
              size="lg"
              mlLabel={selectedOption ? formatWaterLiters(selectedOption.value) : 'Goal'}
            />
            {selectedOption ? (
              <View style={styles.heroMeta}>
                <Text style={styles.heroValue}>{selectedOption.label}</Text>
                <Text style={styles.heroDetail}>
                  {previewGlasses} glasses × {WATER_GLASS_ML} ml
                </Text>
              </View>
            ) : (
              <Text style={styles.heroPlaceholder}>Pick a goal below</Text>
            )}
          </View>

          {selectedOption ? (
            <WaterGoalGlassPreview
              glassCount={previewGlasses}
              selected
            />
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsRow}
          >
            {WATER_GOAL_OPTIONS.map(option => {
              const isSelected = selected === option.value;
              const glasses = getWaterGlassCount(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionCard, isSelected && styles.optionCardOn]}
                  onPress={() => setSelected(option.value)}
                  activeOpacity={0.88}
                  disabled={loading}
                >
                  <WaterGlass filled={isSelected} size="sm" />
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelOn,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionMeta}>{glasses} glasses</Text>
                  {option.recommended ? (
                    <View style={styles.recBadge}>
                      <Text style={styles.recText}>Popular</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.pickHint}>
            {selectedOption
              ? `Daily target: ${selectedOption.label} (${previewGlasses} glasses)`
              : 'Select your hydration goal to start the diet'}
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
                <Text style={styles.confirmText}>Start diet plan</Text>
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
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    maxHeight: '90%',
  },
  eyebrow: {
    fontSize: TYPO.caption,
    color: '#0369A1',
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  title: {
    marginTop: SPACING.xs,
    fontSize: TYPO.xl,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: TYPO.sm,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  heroGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: '#F0F9FF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: SPACING.md,
  },
  heroMeta: {
    alignItems: 'flex-start',
  },
  heroValue: {
    fontSize: TYPO.xxl,
    color: '#0C4A6E',
    fontFamily: Fonts.PoppinsBold,
  },
  heroDetail: {
    marginTop: 2,
    fontSize: TYPO.sm,
    color: '#0369A1',
    fontFamily: Fonts.PoppinsMedium,
  },
  heroPlaceholder: {
    fontSize: TYPO.sm,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  optionsRow: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  optionCard: {
    width: 88,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  optionCardOn: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FDFA',
  },
  optionLabel: {
    marginTop: SPACING.sm,
    fontSize: TYPO.md,
    color: '#334155',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  optionLabelOn: {
    color: Colors.primaryColor,
  },
  optionMeta: {
    fontSize: TYPO.xs,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  recBadge: {
    marginTop: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recText: {
    fontSize: 9,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  pickHint: {
    marginTop: SPACING.sm,
    fontSize: TYPO.caption,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    height: BUTTON.height,
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
    flex: 1.5,
    height: BUTTON.height,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnOff: {
    opacity: 0.45,
  },
  confirmText: {
    fontSize: TYPO.button,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
