import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import TablerIcon from '../../components/TablerIcon';
import * as _PATIENT from '../../services/PatientServices';
import {
  nowIso,
  normalizeDietFoodItem,
  resolveMealImage,
} from '../../utils/dietPlanUtils';
import { showSuccessToast } from '../../config/Key';
import { requireAuth } from '../../services/guestAuth';
import { resolveImageSource } from '../../utils/imageUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductImagePreviewModal from '../../components/ProductImagePreviewModal';
import {
  BUTTON,
  DIET_UI,
  RADIUS,
  SPACING,
  TYPO,
} from '../../constants/responsive';
const FALLBACK_IMAGE = require('../../assets/images/login/7.jpg');

const MealDetails = (props: any) => {


  const insets = useSafeAreaInsets();
  const item = props?.route?.params?.item;
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(item?.status === 'done');
  const [previewVisible, setPreviewVisible] = useState(false);

  const mealTitle =
    typeof item?.title === 'string'
      ? item.title
      : normalizeDietFoodItem(item?.title)?.label || 'Meal';
  const mealType = String(item?.type || 'Meal');
  const imageSource =
    resolveImageSource(item?.image) ||
    resolveMealImage(item?.raw) ||
    FALLBACK_IMAGE;

  const stats = [
    { label: 'Calories', value: String(item?.kcal ?? '—') },
    { label: 'Carbs', value: item ? `${item.carbs ?? 0}g` : '—' },
    { label: 'Protein', value: item ? `${item.protein ?? 0}g` : '—' },
    { label: 'Fat', value: item ? `${item.fat ?? 0}g` : '—' },
  ];

  const ingredients =
    Array.isArray(item?.dietItemDetails) && item.dietItemDetails.length
      ? item.dietItemDetails.map((food: any, index: number) => ({
          id: String(index),
          title: String(food?.name || food?.label || ''),
          quantity: String(food?.quantity || '').trim(),
          notes: String(food?.notes || '').trim(),
        }))
      : Array.isArray(item?.dietItems) && item.dietItems.length
        ? item.dietItems
            .map((entry: any, index: number) => {
              const normalized = normalizeDietFoodItem(entry);
              if (!normalized) return null;
              return {
                id: String(index),
                title: normalized.name || normalized.label,
                quantity: normalized.quantity,
                notes: normalized.notes,
              };
            })
            .filter(Boolean)
        : [];

  const steps =
    Array.isArray(item?.preparationSteps) && item.preparationSteps.length
      ? item.preparationSteps
          .map((step: any) =>
            typeof step === 'string'
              ? step
              : normalizeDietFoodItem(step)?.label || String(step?.name ?? ''),
          )
          .filter(Boolean)
      : [];

  const onLogMeal = async () => {
    if (!item?.dayKey || !item?.mealKey) {
      showSuccessToast('Meal details unavailable', 'error');
      return;
    }
    if (!(await requireAuth('Please login to log meals'))) return;

    try {
      setLogging(true);
      const markingDone = !logged;
      const completedAt = markingDone ? nowIso() : null;
      const res = await _PATIENT.updateDietPlanProgress({
        day: item.dayKey,
        meal: item.mealKey,
        status: markingDone ? 'completed' : 'pending',
        completed_at: completedAt,
      });
      if (res?.success === false) {
        showSuccessToast(res?.message || 'Unable to update meal', 'error');
        return;
      }
      setLogged(markingDone);
      showSuccessToast(
        markingDone ? 'Meal logged' : 'Meal unmarked',
        'success',
      );
      // Go back so Diet list reloads progress and shows the check
      props.navigation.goBack();
    } catch (e: any) {
      showSuccessToast(e?.message || 'Unable to update meal', 'error');
    } finally {
      setLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="Meal Details"
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.heroWrap}>
          <Image source={imageSource} style={styles.image} />
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => setPreviewVisible(true)}
            activeOpacity={0.85}
          >
            <TablerIcon name="eye" size={14} color="#FFFFFF" />
            <Text style={styles.previewBtnText}>Preview</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{mealType}</Text>
            </View>
            {!!item?.time && (
              <View style={styles.timeRow}>
                <TablerIcon name="clock" size={14} color="#6B7280" />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{mealTitle}</Text>

          <View style={styles.statsRow}>
            {stats.map(stat => (
              <View style={styles.statBox} key={stat.label}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Image
                source={Images.Ingredient}
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>

            {ingredients.length === 0 ? (
              <Text style={styles.emptySection}>No ingredients listed</Text>
            ) : (
              ingredients.map((ing: any) => (
                <View style={styles.itemRow} key={ing.id}>
                  <View style={styles.itemLeftWrap}>
                    <Text style={styles.itemLeft} numberOfLines={2}>
                      {ing.title}
                    </Text>
                    {!!ing.notes && (
                      <Text style={styles.itemNotes} numberOfLines={1}>
                        {ing.notes}
                      </Text>
                    )}
                  </View>
                  {!!ing.quantity && (
                    <View style={styles.qtyPill}>
                      <Text style={styles.qtyPillText}>{ing.quantity}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <TablerIcon
                name="prescription"
                size={14}
                color={Colors.primaryColor}
              />
              <Text style={styles.sectionTitle}>Preparation Steps</Text>
            </View>

            {steps.length === 0 ? (
              <Text style={styles.emptySection}>No preparation steps</Text>
            ) : (
              steps.map((text: string, index: number) => (
                <View style={styles.stepRow} key={`${index}-${text}`}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{text}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={[styles.btn, styles.primaryBtn]}
          onPress={onLogMeal}
          disabled={logging}
          activeOpacity={0.9}
        >
          {logging ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {logged ? 'Undo Log' : 'Log Meal'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.secondaryBtn]}
          onPress={() => props.navigation.goBack()}
        >
          <Text style={[styles.btnText, { color: Colors.primaryColor }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ProductImagePreviewModal
        images={[{ source: imageSource }]}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
      />
    </SafeAreaView>
  );
};

export default MealDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    paddingBottom: 24,
    backgroundColor: '#FDFDFB',
  },

  heroWrap: {
    width: '100%',
    height: DIET_UI.mealDetailHeroHeight,
    backgroundColor: '#E5E7EB',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  previewBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  previewBtnText: {
    color: '#FFFFFF',
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: -DIET_UI.detailCardOverlap,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    zIndex: 2,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  tag: {
    backgroundColor: '#E6F2F2',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },

  tagText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: TYPO.sm,
    textTransform: 'capitalize',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },

  timeText: {
    fontSize: TYPO.sm,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsMedium,
  },

  title: {
    fontSize: TYPO.xl + 2,
    fontFamily: Fonts.PoppinsBold,
    color: '#1F2937',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    lineHeight: 26,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  statBox: {
    backgroundColor: '#EDEFF1',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },

  statLabel: {
    fontSize: TYPO.xs,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  statValue: {
    fontSize: TYPO.md + 1,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
    marginTop: 2,
  },

  sectionContainer: {
    marginTop: SPACING.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },

  sectionIcon: {
    height: 14,
    width: 14,
  },

  sectionTitle: {
    fontSize: TYPO.lg,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1F2937',
  },

  emptySection: {
    fontSize: TYPO.subtitle,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEED80',
    gap: SPACING.sm,
  },

  itemLeftWrap: {
    flex: 1,
    minWidth: 0,
  },

  itemLeft: {
    fontSize: TYPO.body,
    color: '#1F2937',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  itemNotes: {
    marginTop: 2,
    fontSize: TYPO.sm,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsRegular,
  },

  qtyPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    maxWidth: 100,
    flexShrink: 0,
  },

  qtyPillText: {
    fontSize: TYPO.sm,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  itemRight: {
    fontSize: TYPO.body,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsRegular,
    marginLeft: SPACING.sm,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg - 2,
  },

  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4D9A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    flexShrink: 0,
  },

  stepNumber: {
    fontSize: TYPO.sm,
    color: '#1A1D1F',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  stepText: {
    flex: 1,
    minWidth: 0,
    fontSize: TYPO.body,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 20,
    paddingTop: 2,
  },


  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm + 2,
    gap: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    zIndex: 8,
    elevation: 8,
  },

  btn: {
    height: BUTTON.height,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryBtn: {
    flex: 4,
    backgroundColor: Colors.primaryColor,
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.bgcolor,
  },

  btnText: {
    color: '#fff',
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
