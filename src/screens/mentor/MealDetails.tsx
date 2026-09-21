import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TablerIcon from '../../components/TablerIcon';
import * as _PATIENT from '../../services/PatientServices';
import {
  nowIso,
  normalizeDietFoodItem,
  normalizeDietFoodItems,
  getDietPlanGallery,
  type DietFoodItem,
} from '../../utils/dietPlanUtils';
import { showSuccessToast } from '../../config/Key';
import { requireAuth } from '../../services/guestAuth';
import ProductImagePreviewModal from '../../components/ProductImagePreviewModal';
import { BUTTON, RADIUS, SPACING, TYPO } from '../../constants/responsive';

const FALLBACK_IMAGE = require('../../assets/images/login/7.jpg');
const IMG = 76;

const formatMacro = (value: number, unit = 'g') => {
  if (!Number.isFinite(value) || value <= 0) return `0${unit}`;
  return `${value}${unit}`;
};

const openUrl = async (url: string) => {
  let safeUrl = String(url || '').trim();
  if (!safeUrl) {
    showSuccessToast('Link unavailable', 'error');
    return;
  }
  if (!/^https?:\/\//i.test(safeUrl)) {
    safeUrl = `https://${safeUrl.replace(/^\/\//, '')}`;
  }
  try {
    await Linking.openURL(safeUrl);
  } catch {
    showSuccessToast('Unable to open link', 'error');
  }
};

const NutriGrid = ({
  kcal,
  carbs,
  protein,
  fat,
}: {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
}) => (
  <View style={styles.nutriGrid}>
    <View style={[styles.nutriCell, styles.nutriKcal]}>
      <Text style={[styles.nutriValue, styles.nutriValueOnDark]}>
        {kcal || 0}
      </Text>
      <Text style={[styles.nutriLabel, styles.nutriLabelOnDark]}>kcal</Text>
    </View>
    <View style={styles.nutriCell}>
      <Text style={styles.nutriValue}>{formatMacro(carbs)}</Text>
      <Text style={styles.nutriLabel}>carbs</Text>
    </View>
    <View style={styles.nutriCell}>
      <Text style={styles.nutriValue}>{formatMacro(protein)}</Text>
      <Text style={styles.nutriLabel}>protein</Text>
    </View>
    <View style={styles.nutriCell}>
      <Text style={styles.nutriValue}>{formatMacro(fat)}</Text>
      <Text style={styles.nutriLabel}>fat</Text>
    </View>
  </View>
);

const DishCard = ({
  dish,
  index,
  total,
  onPreview,
}: {
  dish: DietFoodItem;
  index: number;
  total: number;
  onPreview: (images: Array<{ source: any }>, startIndex?: number) => void;
}) => {
  const gallery = Array.isArray(dish.gallery) ? dish.gallery : [];
  const cover = gallery[0]?.image_url || gallery[0]?.media_url || '';
  const recipes = Array.isArray(dish.recipe) ? dish.recipe.filter(Boolean) : [];
  const steps = Array.isArray(dish.preparationSteps)
    ? dish.preparationSteps.filter(Boolean)
    : [];
  const n = dish.nutrition || { kcal: 0, carbs: 0, protein: 0, fat: 0 };
  const hasNutrition =
    n.kcal > 0 || n.carbs > 0 || n.protein > 0 || n.fat > 0;

  const previewImages = (gallery.length
    ? gallery
    : cover
      ? [{ image_url: cover }]
      : []
  ).map((g: any) => ({
    source: { uri: String(g.image_url || g.media_url || '') },
  }));

  return (
    <View style={styles.dishCard}>
      <View style={styles.dishAccent} />

      <View style={styles.dishInner}>
        <View style={styles.dishTop}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (previewImages.length) onPreview(previewImages, 0);
            }}
            style={styles.dishImgWrap}
          >
            <Image
              source={cover ? { uri: cover } : FALLBACK_IMAGE}
              style={styles.dishImg}
            />
            {total > 1 ? (
              <View style={styles.dishBadge}>
                <Text style={styles.dishBadgeText}>
                  {index + 1}/{total}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <View style={styles.dishMeta}>
            <Text style={styles.dishName}>{dish.name}</Text>

            {!!dish.quantity && (
              <View style={styles.qtyChip}>
                <TablerIcon
                  name="package"
                  size={12}
                  color={Colors.primaryColor}
                />
                <Text style={styles.qtyChipText}>{dish.quantity}</Text>
              </View>
            )}
          </View>
        </View>

        {!!dish.notes && (
          <View style={styles.notesRow}>
            <TablerIcon
              name="leaf"
              size={14}
              color={Colors.secondaryColor}
            />
            <Text style={styles.notesText}>{dish.notes}</Text>
          </View>
        )}

        {hasNutrition ? (
          <NutriGrid
            kcal={n.kcal}
            carbs={n.carbs}
            protein={n.protein}
            fat={n.fat}
          />
        ) : null}

        {steps.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>How to prepare</Text>
            </View>
            {steps.map((step, si) => (
              <View style={styles.stepRow} key={`s-${index}-${si}`}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{si + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {recipes.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View
                style={[
                  styles.sectionDot,
                  { backgroundColor: Colors.errorColor },
                ]}
              />
              <Text style={styles.sectionTitle}>Recipe video</Text>
            </View>
            {recipes.map((url, ri) => (
              <TouchableOpacity
                key={`r-${index}-${ri}`}
                style={styles.recipeBtn}
                activeOpacity={0.85}
                onPress={() => openUrl(url)}
              >
                <TablerIcon name="youtube" size={16} color={Colors.errorColor} />
                <Text style={styles.recipeBtnText}>
                  Watch recipe{recipes.length > 1 ? ` ${ri + 1}` : ''}
                </Text>
                <TablerIcon
                  name="chevron-right"
                  size={14}
                  color={Colors.headercolor}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const MealDetails = (props: any) => {
  const insets = useSafeAreaInsets();
  const item = props?.route?.params?.item;
  const plan = props?.route?.params?.plan;
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(item?.status === 'done');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<Array<{ source: any }>>(
    [],
  );

  const mealType = String(item?.type || 'Meal');
  const mealTime = String(item?.time || '').trim();
  const mealGuidance = String(
    item?.guidance || item?.raw?.guidance || item?.raw?.guide || '',
  ).trim();

  const dishes: DietFoodItem[] = useMemo(() => {
    if (Array.isArray(item?.dietItemDetails) && item.dietItemDetails.length) {
      return item.dietItemDetails.map((d: any) =>
        d?.nutrition ? d : normalizeDietFoodItem(d?.raw || d) || d,
      );
    }
    return normalizeDietFoodItems(item?.raw?.diet);
  }, [item]);

  const totals = useMemo(() => {
    const mealKcal = Number(item?.kcal) || 0;
    const mealCarbs = Number(item?.carbs) || 0;
    const mealProtein = Number(item?.protein) || 0;
    const mealFat = Number(item?.fat) || 0;
    if (mealKcal || mealCarbs || mealProtein || mealFat) {
      return {
        kcal: mealKcal,
        carbs: mealCarbs,
        protein: mealProtein,
        fat: mealFat,
      };
    }
    return dishes.reduce(
      (acc, d) => ({
        kcal: acc.kcal + (d.nutrition?.kcal || 0),
        carbs: acc.carbs + (d.nutrition?.carbs || 0),
        protein: acc.protein + (d.nutrition?.protein || 0),
        fat: acc.fat + (d.nutrition?.fat || 0),
      }),
      { kcal: 0, carbs: 0, protein: 0, fat: 0 },
    );
  }, [item, dishes]);

  const planGallery = useMemo(() => getDietPlanGallery(plan), [plan]);

  const openPreview = (images: Array<{ source: any }>, startIndex = 0) => {
    if (!images.length) return;
    setPreviewImages(images);
    setPreviewIndex(startIndex);
    setPreviewVisible(true);
  };

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
      props.navigation.goBack();
    } catch (e: any) {
      showSuccessToast(e?.message || 'Unable to update meal', 'error');
    } finally {
      setLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.headerBackground}
      />

      <AppHeader
        title="Meal Details"
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{mealType}</Text>
            </View>
            {!!mealTime && (
              <View style={styles.timeRow}>
                <TablerIcon name="clock" size={13} color={Colors.headercolor} />
                <Text style={styles.timeText}>{mealTime}</Text>
              </View>
            )}
          </View>

          <Text style={styles.summaryTitle}>
            {dishes.length > 1
              ? `${dishes.length} foods in this meal`
              : dishes[0]?.name ||
              (typeof item?.title === 'string' ? item.title : 'Meal')}
          </Text>

          {!!mealGuidance && (
            <Text style={styles.guidance} numberOfLines={3}>
              {mealGuidance}
            </Text>
          )}

          <NutriGrid
            kcal={totals.kcal}
            carbs={totals.carbs}
            protein={totals.protein}
            fat={totals.fat}
          />
        </View>

        {dishes.length > 1 ? (
          <Text style={styles.listLabel}>Foods to eat</Text>
        ) : null}

        {dishes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No food items for this meal</Text>
          </View>
        ) : (
          dishes.map((dish, index) => (
            <DishCard
              key={`dish-${index}-${dish.name}`}
              dish={dish}
              index={index}
              total={dishes.length}
              onPreview={openPreview}
            />
          ))
        )}


      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}
      >
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
          <Text style={[styles.btnText, { color: Colors.primaryColor }]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <ProductImagePreviewModal
        images={previewImages}
        visible={previewVisible}
        initialIndex={previewIndex}
        onClose={() => setPreviewVisible(false)}
      />
    </SafeAreaView>
  );
};

export default MealDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.bgborderColor,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typePill: {
    backgroundColor: Colors.onfillColor,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  typePillText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsMedium,
  },
  summaryTitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  guidance: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsRegular,
  },

  nutriGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 6,
  },
  nutriCell: {
    flex: 1,
    backgroundColor: Colors.onfillColor,
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  nutriKcal: {
    backgroundColor: Colors.primaryColor,
  },
  nutriValue: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  nutriValueOnDark: {
    color: '#FFFFFF',
  },
  nutriLabel: {
    marginTop: 1,
    fontSize: 9,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'uppercase',
  },
  nutriLabelOnDark: {
    color: 'rgba(255,255,255,0.85)',
  },

  listLabel: {
    marginBottom: 8,
    fontSize: 12,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  dishCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  dishAccent: {
    width: 3,
    backgroundColor: Colors.primaryColor,
  },
  dishInner: {
    flex: 1,
    padding: SPACING.md,
  },
  dishTop: {
    flexDirection: 'row',
    gap: 10,
  },
  dishImgWrap: {
    width: IMG,
    height: IMG,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.onfillColor,
  },
  dishImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dishBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(13,97,78,0.88)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dishBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  dishMeta: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  dishName: {
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  qtyChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.onfillColor,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyChipText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  notesRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F7FAF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },

  section: {
    marginTop: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },
  sectionTitle: {
    fontSize: 12,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.onfillColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  recipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.onfillColor,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 4,
  },
  recipeBtnText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsMedium,
  },

  planCard: {
    backgroundColor: Colors.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    padding: SPACING.md,
    marginTop: 4,
  },
  planRow: {
    marginTop: 8,
    gap: 8,
  },
  planThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.onfillColor,
  },
  planThumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  btn: {
    height: BUTTON.height,
    borderRadius: RADIUS.md,
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
    backgroundColor: Colors.onfillColor,
  },
  btnText: {
    color: '#fff',
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
