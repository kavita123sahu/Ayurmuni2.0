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
const FALLBACK_IMAGE = require('../../assets/images/login/7.jpg');

const MealDetails = (props: any) => {


  const insets = useSafeAreaInsets();
  const item = props?.route?.params?.item;
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(item?.status === 'done');

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
          subtitle: [food?.quantity, food?.notes].filter(Boolean).join(' · '),
        }))
      : Array.isArray(item?.dietItems) && item.dietItems.length
        ? item.dietItems
            .map((entry: any, index: number) => {
              const normalized = normalizeDietFoodItem(entry);
              if (!normalized) return null;
              return {
                id: String(index),
                title: normalized.name || normalized.label,
                subtitle: [normalized.quantity, normalized.notes]
                  .filter(Boolean)
                  .join(' · '),
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
        <Image source={imageSource} style={styles.image} />

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{mealType}</Text>
            </View>
            <TablerIcon name="heart" size={26} color={Colors.primaryColor} />
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
                  <Text style={styles.itemLeft} numberOfLines={2}>
                    {ing.title}
                  </Text>
                  {!!ing.subtitle && (
                    <Text style={styles.itemRight} numberOfLines={1}>
                      {ing.subtitle}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <TablerIcon
                name="prescription"
                size={16}
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12), }]}>
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
          <Text style={[styles.btnText, { color: Colors.primaryColor }]}>+</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
    backgroundColor: '#FDFDFB',
  },

  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    backgroundColor: '#E5E7EB',
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: -36,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tag: {
    backgroundColor: '#E6F2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  tagText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
    textTransform: 'capitalize',
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.PoppinsBold,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 32,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  statBox: {
    backgroundColor: '#EDEFF1',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  statValue: {
    fontSize: 15,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
    marginTop: 2,
  },

  sectionContainer: {
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },

  sectionIcon: {
    height: 15,
    width: 15,
  },

  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1F2937',
  },

  emptySection: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEEED80',
  },

  itemLeft: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  itemRight: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsRegular,
    marginLeft: 10,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4D9A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  stepNumber: {
    fontSize: 12,
    color: '#1A1D1F',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 21,
    paddingTop: 3,
  },


  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    // Safe area for all devices
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',

  },
  // footer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  //   paddingTop: 10,
  //   paddingBottom: 12,
  //   gap: 12,
  //   backgroundColor: '#FFFFFF',
  //   borderTopWidth: 1,
  //   borderTopColor: '#F1F5F9',
  // },

  btn: {
    height: 55,
    borderRadius: 16,
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
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
