import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SectionHeader from '../../components/SectionHeader';
import Header from '../../components/Header';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import MealCard from '../../components/MealCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDietPlans } from '../../hooks/useDietPlans';
import TablerIcon from '../../components/TablerIcon';
import { resolveDietImage } from '../../utils/dietPlanUtils';
import {
  DietActiveSkeleton,
  DietDetailSkeleton,
  DietListSkeleton,
} from '../../simmerScreen/ShimmerHook';

const MACRO_COLORS = {
  Carbs: '#1FA77A',
  Protein: '#2F6BDE',
  Fat: '#F4B400',
};

const formatKcal = (n: number) =>
  Math.round(Number(n) || 0).toLocaleString('en-IN');

const litersLabel = (ml: number) => `${((Number(ml) || 0) / 1000).toFixed(1)}L`;

const DietScreen = (props: any) => {
  const routeItem = props?.route?.params?.item;
  const initialPlanId = routeItem?.id ? String(routeItem.id) : null;
  /** View-all / search → type=all; home default list still uses no type elsewhere */
  const listType = 'all' as const;

  const {
    plans,
    selectedPlanId,
    selectPlan,
    clearSelection,
    selectedSummary,
    planDetail,
    meals,
    mealsByDay,
    nutrition,
    waterMl,
    currentDayKey,
    todayDayKey,
    planDays,
    showAllDays,
    selectDay,
    selectAllDays,
    isStarted,
    loadingList,
    loadingDetail,
    starting,
    refreshing,
    refresh,
    startPlan,
    logMeal,
    adjustWater,
    switchPlan,
    updateStatus,
    updatingStatus,
    patientDietPlanId,
  } = useDietPlans({ initialPlanId, listType });

  // Soft refresh on focus — keep selected day (handled in hook)
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useFocusEffect(
    useCallback(() => {
      if (selectedPlanId && isStarted) {
        refreshRef.current();
      }
    }, [selectedPlanId, isStarted]),
  );

  const assignmentStatus = String(
    planDetail?.patient_assignment_status ||
    selectedSummary?.patient_assignment_status ||
    '',
  ).toLowerCase();
  const isPaused = assignmentStatus.includes('pause');

  const onSwitchPlan = () => {
    Alert.alert(
      'Switch diet plan',
      'Pause or stop your current plan before starting another.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause & switch',
          onPress: () => switchPlan('pause'),
        },
        {
          text: 'Stop & switch',
          style: 'destructive',
          onPress: () =>
            switchPlan('stop', 'Switched to another plan'),
        },
      ],
    );
  };

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    [],
  );

  const dayLabel = currentDayKey
    ? `Day ${currentDayKey.replace(/\D/g, '') || '1'}`
    : todayLabel;
  const isViewingToday =
    String(currentDayKey || '').toLowerCase() ===
    String(todayDayKey || '').toLowerCase();
  const selectedDayChip = planDays.find(
    d => d.dayKey.toLowerCase() === String(currentDayKey || '').toLowerCase(),
  );

  const macrosData = [
    { id: 1, label: 'Carbs', value: nutrition.carbsPct, color: MACRO_COLORS.Carbs },
    { id: 2, label: 'Protein', value: nutrition.proteinPct, color: MACRO_COLORS.Protein },
    { id: 3, label: 'Fat', value: nutrition.fatPct, color: MACRO_COLORS.Fat },
  ];

  const diseaseText = useMemo(() => {
    const diseases = selectedSummary?.health_diseases || planDetail?.health_diseases;
    if (Array.isArray(diseases) && diseases.length) {
      return diseases.map((d: any) => d?.name).filter(Boolean).join(', ');
    }
    return selectedSummary?.short_description || '—';
  }, [selectedSummary, planDetail]);

  const priceLabel =
    selectedSummary?.is_paid === false || Number(selectedSummary?.price) === 0
      ? 'Free'
      : `₹${selectedSummary?.price ?? 0}`;

  const Macro = ({
    label = '',
    value = 0,
    color = '#000',
  }: {
    label?: string;
    value?: number;
    color?: string;
  }) => {
    const safeValue = Math.min(Math.max(value, 0), 100);
    return (
      <View style={styles.macroItem}>
        <View style={styles.macroTop}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={[styles.macroPercent, { color }]}>{safeValue}%</Text>
        </View>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${safeValue}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  const DailyVitalityCard = () => (
    <View style={styles.DailyCard}>
      <View style={styles.content}>
        <View style={styles.circle}>
          <Text style={styles.calories}>{formatKcal(nutrition.leftKcal)}</Text>
          <Text style={styles.kcalText}>KCAL LEFT</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>Eaten</Text>
            <Text style={styles.value}>{formatKcal(nutrition.eatenKcal)} kcal</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Burned</Text>
            <Text style={[styles.value, styles.green]}>
              {formatKcal(nutrition.burnedKcal)} kcal
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.goalLabel}>Goal</Text>
            <Text style={styles.goalValue}>
              {formatKcal(nutrition.goalKcal)} kcal
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.macroRow}>
        {macrosData.map(item => (
          <Macro
            key={item.id}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
      </View>
    </View>
  );

  const HydrationCard = () => (
    <View style={styles.Hydrationcard}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Image
            source={require('../../assets/images/WaterDrop.png')}
            style={{ height: 20, width: 16 }}
          />
        </View>
        <View>
          <Text style={styles.Hydrationtitle}>Hydration</Text>
          <Text style={styles.subtitle}>
            {litersLabel(waterMl)} of {litersLabel(nutrition.waterGoalMl)} reached
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.minus} onPress={() => adjustWater(-250)}>
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plus} onPress={() => adjustWater(250)}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlanCard = ({ item }: { item: any }) => {
    const diseases =
      item.health_diseases?.map((d: any) => d.name).filter(Boolean).join(', ') ||
      '';
    const price =
      item.is_paid === false || Number(item.price) === 0
        ? 'Free'
        : `₹${item.price}`;
    const active = String(item.patient_assignment_status || '').toLowerCase() === 'active';

    return (
      <TouchableOpacity
        style={styles.planCard}
        activeOpacity={0.85}
        onPress={() => selectPlan(item.id)}
      >
        <Image source={resolveDietImage(item)} style={styles.planThumb} />
        <View style={styles.planBody}>
          <View style={styles.planTitleRow}>
            <Text style={styles.planTitle} numberOfLines={2}>
              {item.name}
            </Text>
            {active && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            )}
          </View>
          {!!diseases && (
            <Text style={styles.planMeta} numberOfLines={1}>
              {diseases}
            </Text>
          )}
          <View style={styles.planTags}>
            {!!item.prakriti && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.prakriti}</Text>
              </View>
            )}
            {!!item.season && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.season}</Text>
              </View>
            )}
            <View style={[styles.tag, styles.priceTag]}>
              <Text style={[styles.tagText, styles.priceTagText]}>{price}</Text>
            </View>
          </View>
        </View>
        <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
      </TouchableOpacity>
    );
  };

  // —— LIST ——
  if (!selectedPlanId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <Header
          title="Diet Plans"
          subtitle="Personalized nutrition plans"
          onBack={() => props.navigation.goBack()}
        />

        {loadingList ? (
          <DietListSkeleton />
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={renderPlanCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={Colors.primaryColor}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No diet plans</Text>
                <Text style={styles.emptySub}>
                  Plans suggested for you will appear here.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // —— DETAIL (not started) ——
  if (!isStarted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <Header
          title="Diet Plan"
          subtitle={selectedSummary?.name || 'Details'}
          onBack={() => {
            if (initialPlanId && plans.length <= 1) {
              props.navigation.goBack();
              return;
            }
            clearSelection();
          }}
        />

        {loadingDetail ? (
          <DietDetailSkeleton />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={Colors.primaryColor}
              />
            }
          >
            <View style={styles.detailHeroWrap}>
              <Image
                source={resolveDietImage(planDetail || selectedSummary)}
                style={styles.detailImage}
              />
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailTagRow}>
                {!!(selectedSummary?.prakriti || planDetail?.prakriti) && (
                  <View style={styles.detailTag}>
                    <Text style={styles.detailTagText}>
                      {selectedSummary?.prakriti || planDetail?.prakriti}
                    </Text>
                  </View>
                )}
                {!!(selectedSummary?.season || planDetail?.season) && (
                  <View style={styles.detailTag}>
                    <Text style={styles.detailTagText}>
                      {selectedSummary?.season || planDetail?.season}
                    </Text>
                  </View>
                )}
                <View style={[styles.detailTag, styles.detailPriceTag]}>
                  <Text style={[styles.detailTagText, styles.detailPriceText]}>
                    {priceLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailTitle}>
                {selectedSummary?.name || planDetail?.name}
              </Text>

              {!!diseaseText && diseaseText !== '—' && (
                <Text style={styles.detailFocus}>Focus: {diseaseText}</Text>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prakriti</Text>
                <Text style={styles.detailValue}>
                  {selectedSummary?.prakriti || planDetail?.prakriti || '—'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Season</Text>
                <Text style={styles.detailValue}>
                  {selectedSummary?.season || planDetail?.season || '—'}
                </Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Health focus</Text>
                <Text style={styles.detailValue}>{diseaseText}</Text>
              </View>
            </View>

            {isPaused && patientDietPlanId ? (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => updateStatus('resume')}
                disabled={updatingStatus}
                activeOpacity={0.9}
              >
                {updatingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startBtnText}>Resume plan</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => startPlan(selectedPlanId)}
                disabled={starting}
                activeOpacity={0.9}
              >
                {starting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startBtnText}>Start plan</Text>
                )}
              </TouchableOpacity>
            )}
            <Text style={styles.startHint}>
              {isPaused
                ? 'This plan is paused. Resume to continue tracking meals.'
                : 'After starting, you’ll track today’s meals and nutrition from this plan.'}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // —— ACTIVE TRACKING (original Daily Vitality UI) ——
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Diet"
        subtitle={selectedSummary?.name || 'Track your nutrition'}
        onBack={() => {
          if (initialPlanId && !plans.length) {
            props.navigation.goBack();
            return;
          }
          clearSelection();
        }}
      />

      {loadingDetail && meals.length === 0 && mealsByDay.length === 0 ? (
        <DietActiveSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.primaryColor}
            />
          }
        >
          <View style={styles.activeTopRow}>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>
                Active · {planDays.length || mealsByDay.length} days
              </Text>
            </View>
            <TouchableOpacity
              onPress={onSwitchPlan}
              disabled={updatingStatus}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color={Colors.primaryColor} />
              ) : (
                <Text style={styles.switchLink}>Switch plan</Text>
              )}
            </TouchableOpacity>
          </View>

          {(planDays.length > 0 || mealsByDay.length > 0) && (
            <>
              <SectionHeader
                title="All plan days"
                actionText={
                  showAllDays
                    ? 'All days'
                    : isViewingToday
                      ? `Today · ${todayLabel}`
                      : dayLabel
                }
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayChipRow}
                style={{ marginBottom: 12 }}
              >
                <TouchableOpacity
                  style={[
                    styles.dayChip,
                    showAllDays && styles.dayChipSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={selectAllDays}
                >
                  <Text
                    style={[
                      styles.dayChipLabel,
                      showAllDays && styles.dayChipLabelSelected,
                    ]}
                  >
                    All
                  </Text>
                  <Text
                    style={[
                      styles.dayChipMeta,
                      showAllDays && styles.dayChipMetaSelected,
                    ]}
                  >
                    {planDays.length || mealsByDay.length} days
                  </Text>
                  <View style={styles.dayChipTrack}>
                    <View
                      style={[
                        styles.dayChipFill,
                        {
                          width: '100%',
                          backgroundColor: showAllDays
                            ? '#FFFFFF'
                            : Colors.primaryColor,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {planDays.map(item => {
                  const selected =
                    !showAllDays &&
                    item.dayKey.toLowerCase() ===
                    String(currentDayKey || '').toLowerCase();
                  return (
                    <TouchableOpacity
                      key={item.dayKey}
                      style={[
                        styles.dayChip,
                        selected && styles.dayChipSelected,
                        item.isToday && !selected && styles.dayChipToday,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => selectDay(item.dayKey)}
                    >
                      <Text
                        style={[
                          styles.dayChipLabel,
                          selected && styles.dayChipLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.dayChipMeta,
                          selected && styles.dayChipMetaSelected,
                        ]}
                      >
                        {item.isToday
                          ? 'Today'
                          : `${item.mealsDone}/${item.mealsTotal || 0}`}
                      </Text>
                      <View style={styles.dayChipTrack}>
                        <View
                          style={[
                            styles.dayChipFill,
                            {
                              width: `${item.progressPct}%`,
                              backgroundColor: selected
                                ? '#FFFFFF'
                                : Colors.primaryColor,
                            },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {!showAllDays && (
            <>
              <SectionHeader
                title="Daily Vitality"
                actionText={isViewingToday ? todayLabel : dayLabel}
              />
              <DailyVitalityCard />
              <HydrationCard />
            </>
          )}

          <SectionHeader
            title={
              showAllDays
                ? 'All days meals'
                : isViewingToday
                  ? "Today's Meals"
                  : `${dayLabel} Meals`
            }
            actionText={
              showAllDays
                ? `${mealsByDay.reduce(
                  (n, d) => n + d.meals.filter(m => m.status === 'done').length,
                  0,
                )}/${mealsByDay.reduce((n, d) => n + d.meals.length, 0)}`
                : `${selectedDayChip?.mealsDone ?? nutrition.mealsDone}/${selectedDayChip?.mealsTotal ?? nutrition.mealsTotal ?? 0
                }`
            }
          />

          {showAllDays ? (
            mealsByDay.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No meals in this plan</Text>
                <Text style={styles.emptySub}>
                  Pull to refresh or check back once the plan is updated.
                </Text>
              </View>
            ) : (
              mealsByDay.map(dayBlock => (
                <View key={dayBlock.dayKey} style={styles.daySection}>
                  <View style={styles.daySectionHeader}>
                    <Text style={styles.daySectionTitle}>{dayBlock.label}</Text>
                    <Text style={styles.daySectionMeta}>
                      {dayBlock.meals.filter(m => m.status === 'done').length}/
                      {dayBlock.meals.length} logged
                    </Text>
                  </View>
                  {dayBlock.meals.map(item => (
                    <MealCard
                      key={item.id}
                      data={item}
                      navigation={props.navigation}
                      onLog={() => logMeal(item)}
                    />
                  ))}
                </View>
              ))
            )
          ) : meals.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No meals for {dayLabel}</Text>
              <Text style={styles.emptySub}>
                Pull to refresh or check back once the plan is updated.
              </Text>
            </View>
          ) : (
            meals.map(item => (
              <MealCard
                key={item.id}
                data={item}
                navigation={props.navigation}
                onLog={() => logMeal(item)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DietScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FDFDFB' },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingBottom: 40,
    paddingTop: 8,
    gap: 12,
  },

  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },

  planThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    marginRight: 12,
  },

  planBody: { flex: 1 },

  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  planTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },

  activePill: {
    backgroundColor: '#E6F4F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  activePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  planMeta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 2,
  },

  planTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  tagText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#475569',
    textTransform: 'capitalize',
  },

  priceTag: { backgroundColor: '#E6F4F0' },
  priceTagText: { color: Colors.primaryColor },

  detailHeroWrap: {
    marginTop: 8,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },

  detailImage: {
    width: '100%',
    height: 200,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    marginTop: -28,
    marginHorizontal: 4,
  },

  detailTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  detailTag: {
    backgroundColor: '#E6F2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  detailTagText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textTransform: 'capitalize',
  },

  detailPriceTag: {
    backgroundColor: '#F1F5F9',
  },

  detailPriceText: {
    color: '#475569',
  },

  detailTitle: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 6,
  },

  detailFocus: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginBottom: 14,
    textTransform: 'capitalize',
  },

  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
  },

  activeBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  switchLink: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    textDecorationLine: 'underline',
  },

  dayChipRow: {
    gap: 10,
    paddingRight: 8,
    paddingBottom: 4,
  },

  dayChip: {
    width: 88,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },

  dayChipSelected: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },

  dayChipToday: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#E6F4F0',
  },

  dayChipLabel: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  dayChipLabelSelected: {
    color: '#FFFFFF',
  },

  dayChipMeta: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
    marginTop: 2,
  },

  dayChipMetaSelected: {
    color: 'rgba(255,255,255,0.85)',
  },

  dayChipTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(15,23,42,0.08)',
    overflow: 'hidden',
    marginTop: 10,
  },

  dayChipFill: {
    height: 4,
    borderRadius: 4,
  },

  daySection: {
    marginBottom: 18,
  },

  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  daySectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  daySectionMeta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    textTransform: 'capitalize',
  },

  startBtn: {
    marginTop: 20,
    backgroundColor: Colors.primaryColor,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  startBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  startHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    paddingHorizontal: 12,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    textAlign: 'center',
  },

  DailyCard: {
    backgroundColor: '#0D614E0D',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 25,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: '#0F5D4A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  calories: {
    fontSize: 26,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    marginBottom: -10,
  },

  kcalText: {
    fontSize: 12,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },

  info: {
    flex: 1,
    marginLeft: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    color: Colors.subTextColor,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },

  green: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 10,
  },

  goalLabel: {
    fontSize: 16,
    color: Colors.subTextColor,
  },

  goalValue: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  macroItem: { width: '30%' },

  macroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  macroLabel: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
  },

  macroPercent: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  progressBg: {
    height: 6,
    backgroundColor: '#E0E3E2',
    borderRadius: 11,
    overflow: 'hidden',
  },

  progressFill: {
    height: 6,
    borderRadius: 10,
  },

  Hydrationcard: {
    backgroundColor: '#0D614E0D',
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  Hydrationtitle: {
    fontSize: 16,
    marginBottom: -5,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  subtitle: {
    color: Colors.subTextColor,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  minus: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginRight: 10,
  },

  plus: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#0F5D4A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnText: {
    fontSize: 25,
    color: '#374151',
  },

  plusText: {
    fontSize: 25,
    color: '#fff',
  },
});
