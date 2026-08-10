import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SectionHeader from '../../components/SectionHeader';
import Header from '../../components/Header';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import MealCard from '../../components/MealCard';
import Detailimages from '../../components/Detailimages';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDietPlans } from '../../hooks/useDietPlans';
import TablerIcon from '../../components/TablerIcon';
import {
  getDietListStatus,
  getDietPlanGallery,
  resolveDietImage,
} from '../../utils/dietPlanUtils';
import {
  DietActiveSkeleton,
  DietDetailSkeleton,
  DietListSkeleton,
} from '../../simmerScreen/ShimmerHook';
import CommonModal from '../../components/LogoutModal';
import LinearGradient from 'react-native-linear-gradient';

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
  const routeWantsAll =
    props?.route?.params?.listType === 'all' ||
    props?.route?.params?.viewAll === true;
  // Prefer catalog diet_plan_id; never open detail with patient assignment id
  const initialPlanId = (() => {
    const catalog =
      routeItem?.diet_plan_id ||
      (routeItem?.id &&
      routeItem?.id !== routeItem?.patient_diet_plan_id
        ? routeItem.id
        : null) ||
      routeItem?.id;
    return catalog ? String(catalog) : null;
  })();
  const [searchQuery, setSearchQuery] = useState('');
  const [prakritiFilter, setPrakritiFilter] = useState<string>('all');
  /**
   * GET /patients/diet-plans/ — suggested (common + doctor-suggested)
   * GET ?type=all — View all / search catalog
   */
  const listType =
    routeWantsAll || searchQuery.trim() ? ('all' as const) : null;

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
    completePlan,
    prepareResume,
    prepareStart,
    pauseActiveAndResume,
    pauseActiveAndStart,
    updatingStatus,
    patientDietPlanId,
    activePlan,
    isPlanFullyComplete,
    listStatus,
    loadingMore,
    hasMore,
    loadMore,
  } = useDietPlans({ initialPlanId, listType });

  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [switchConflict, setSwitchConflict] = useState<{
    mode: 'resume' | 'start';
    activeName: string;
    activeId: string;
    targetId: string;
  } | null>(null);

  const prakritiOptions = useMemo(() => {
    const set = new Set<string>();
    plans.forEach(p => {
      const value = String(p?.prakriti || '').trim();
      if (value) set.add(value);
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return plans.filter(plan => {
      const prakriti = String(plan?.prakriti || '').trim().toLowerCase();
      if (prakritiFilter !== 'all' && prakriti !== prakritiFilter.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        plan?.name,
        plan?.title,
        plan?.prakriti,
        plan?.season,
        plan?.short_description,
        ...(Array.isArray(plan?.health_diseases)
          ? plan.health_diseases.map((d: any) => d?.name)
          : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [plans, searchQuery, prakritiFilter]);

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

  // Prefer list status so a stale detail payload can't hide Resume for paused plans
  const assignmentStatus = String(
    selectedSummary?.patient_assignment_status ||
    planDetail?.patient_assignment_status ||
    '',
  ).toLowerCase();
  const isPaused = listStatus === 'paused' || assignmentStatus.includes('pause');
  const isCompletedPlan =
    listStatus === 'completed' || assignmentStatus.includes('complete');

  const onResumePress = useCallback(async () => {
    const prep = prepareResume();
    if (!prep.canResume) {
      return;
    }
    if (prep.needsConfirm && prep.activePlan?.patient_diet_plan_id) {
      setSwitchConflict({
        mode: 'resume',
        activeName: prep.activePlan.name || 'your active plan',
        activeId: String(prep.activePlan.patient_diet_plan_id),
        targetId: prep.resumeId,
      });
      setSwitchModalVisible(true);
      return;
    }
    await updateStatus('resume');
  }, [prepareResume, updateStatus]);

  const onStartPress = useCallback(async () => {
    const prep = prepareStart();
    if (!prep.canStart) {
      return;
    }
    if (prep.needsConfirm && prep.activePlan?.patient_diet_plan_id) {
      setSwitchConflict({
        mode: 'start',
        activeName: prep.activePlan.name || 'your active plan',
        activeId: String(prep.activePlan.patient_diet_plan_id),
        targetId: prep.startPlanId,
      });
      setSwitchModalVisible(true);
      return;
    }
    const catalogId = String(
      selectedPlanId ||
        planDetail?.diet_plan_id ||
        planDetail?.id ||
        '',
    );
    await startPlan(catalogId);
  }, [prepareStart, startPlan, selectedPlanId, planDetail]);

  const onConfirmSwitchPlan = useCallback(async () => {
    if (!switchConflict) return;
    const ok =
      switchConflict.mode === 'resume'
        ? await pauseActiveAndResume(
          switchConflict.activeId,
          switchConflict.targetId,
        )
        : await pauseActiveAndStart(
          switchConflict.activeId,
          switchConflict.targetId,
        );
    if (ok) {
      setSwitchModalVisible(false);
      setSwitchConflict(null);
    }
  }, [switchConflict, pauseActiveAndResume, pauseActiveAndStart]);

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

  const onCompletePlan = useCallback(async () => {
    const ok = await completePlan();
    if (ok) {
      setCongratsVisible(true);
    }
  }, [completePlan]);

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
    const isFree = item.is_paid === false || Number(item.price) === 0;
    const cardStatus = getDietListStatus(item);

    return (
      <TouchableOpacity
        style={[styles.planCard, isFree ? styles.planCardFree : styles.planCardPaid]}
        activeOpacity={0.88}
        onPress={() => selectPlan(item.id)}
      >
        <View style={styles.planThumbWrap}>
          <Image source={resolveDietImage(item)} style={styles.planThumb} />
          {!isFree && (
            <LinearGradient
              colors={['#C9A227', '#E8C77B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planPremiumBadge}
            >
              <TablerIcon name="star" size={10} color="#5E4200" />
              <Text style={styles.planPremiumBadgeText}>PRO</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.planBody}>
          <View style={styles.planTitleRow}>
            <Text style={styles.planTitle} numberOfLines={2}>
              {item.name}
            </Text>
            {cardStatus === 'active' ? (
              <View style={styles.activePill}>
                <View style={styles.activePillDot} />
                <Text style={styles.activePillText}>Active</Text>
              </View>
            ) : cardStatus === 'paused' ? (
              <View style={styles.resumePill}>
                <Text style={styles.resumePillText}>Resume</Text>
              </View>
            ) : cardStatus === 'completed' ? (
              <View style={styles.completedPill}>
                <Text style={styles.completedPillText}>Completed</Text>
              </View>
            ) : cardStatus === 'stopped' ? (
              <View style={styles.stoppedPill}>
                <Text style={styles.stoppedPillText}>Stopped</Text>
              </View>
            ) : (
              <View style={styles.notStartedPill}>
                <Text style={styles.notStartedPillText}>Not started</Text>
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
            <View style={[styles.tag, isFree ? styles.freeTag : styles.paidTag]}>
              <Text style={[styles.tagText, isFree ? styles.freeTagText : styles.paidTagText]}>
                {isFree ? 'Free plan' : `₹${item.price}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.planChevron, isFree ? styles.planChevronFree : styles.planChevronPaid]}>
          <TablerIcon
            name="chevron-right"
            size={16}
            color={isFree ? Colors.primaryColor : '#8B6914'}
          />
        </View>
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
          subtitle={
            listType === 'all'
              ? 'All diet plans'
              : 'Suggested for you'
          }
          onBack={() => props.navigation.goBack()}
        />

        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <TablerIcon name="search" size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search diet plans..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                <TablerIcon name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prakritiRow}
          >
            {prakritiOptions.map(option => {
              const selected = prakritiFilter === option;
              const label = option === 'all' ? 'All Prakriti' : option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.prakritiChip,
                    selected && styles.prakritiChipActive,
                  ]}
                  onPress={() => setPrakritiFilter(option)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.prakritiChipText,
                      selected && styles.prakritiChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loadingList ? (
          <DietListSkeleton />
        ) : (
          <FlatList
            data={filteredPlans}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={renderPlanCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => {
              if (hasMore && !loadingMore && !loadingList) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator color={Colors.primaryColor} />
                  <Text style={styles.listFooterText}>
                    {listType === 'all'
                      ? 'Loading all diet plans…'
                      : 'Loading more…'}
                  </Text>
                </View>
              ) : !hasMore && filteredPlans.length > 0 ? (
                <Text style={styles.listEndText}>
                  All diet plans loaded ({filteredPlans.length})
                </Text>
              ) : null
            }
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
                  {searchQuery || prakritiFilter !== 'all'
                    ? 'Try another search or prakriti filter.'
                    : listType === 'all'
                      ? 'No diet plans in the catalog yet.'
                      : 'Plans suggested for you will appear here.'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // —— DETAIL (not started / paused / completed) ——
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
              {(() => {
                const gallery = getDietPlanGallery(
                  planDetail || selectedSummary,
                );
                if (gallery.length > 0) {
                  return (
                    <Detailimages
                      images={gallery}
                      itemHeight={200}
                      DynamicResize="cover"
                      mode="product"
                      enablePreview
                    />
                  );
                }
                return (
                  <Image
                    source={resolveDietImage(planDetail || selectedSummary)}
                    style={styles.detailImage}
                  />
                );
              })()}
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

            {isCompletedPlan ? (
              <View style={styles.congratsCard}>
                <Text style={styles.congratsEmoji}>🎉</Text>
                <Text style={styles.congratsTitle}>Congratulations!</Text>
                <Text style={styles.congratsSub}>
                  You completed "{selectedSummary?.name || planDetail?.name}".
                  Keep up the healthy habits.
                </Text>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={clearSelection}
                  activeOpacity={0.9}
                >
                  <Text style={styles.startBtnText}>Browse other plans</Text>
                </TouchableOpacity>
              </View>
            ) : isPaused && patientDietPlanId ? (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={onResumePress}
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
                onPress={onStartPress}
                disabled={starting || updatingStatus}
                activeOpacity={0.9}
              >
                {starting || updatingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startBtnText}>Start plan</Text>
                )}
              </TouchableOpacity>
            )}
            {!isCompletedPlan ? (
              <Text style={styles.startHint}>
                {isPaused
                  ? activePlan &&
                    String(activePlan.patient_diet_plan_id) !==
                      String(patientDietPlanId)
                    ? `"${activePlan.name}" is active. Resume will ask which plan to pause first.`
                    : 'This plan is paused. Resume to continue tracking meals.'
                  : activePlan && String(activePlan.id) !== String(selectedPlanId)
                    ? `"${activePlan.name}" is active. Start will ask to pause it first.`
                    : 'After starting, you’ll track today’s meals and nutrition from this plan.'}
              </Text>
            ) : null}
          </ScrollView>
        )}

        <CommonModal
          visible={switchModalVisible}
          icon="⏸️"
          title={
            switchConflict?.mode === 'resume'
              ? 'Pause active plan to resume?'
              : 'Pause active plan to start?'
          }
          subtitle={
            switchConflict
              ? switchConflict.mode === 'resume'
                ? `"${switchConflict.activeName}" is currently active. Pause it to resume this plan? Only one diet can be active.`
                : `"${switchConflict.activeName}" is currently active. Pause it to start this new plan? Only one diet can be active.`
              : 'Only one diet can be active at a time.'
          }
          cancelText="Keep current"
          confirmText={
            switchConflict?.mode === 'start' ? 'Pause & start' : 'Pause & resume'
          }
          loading={updatingStatus || starting}
          onClose={() => {
            if (updatingStatus || starting) return;
            setSwitchModalVisible(false);
            setSwitchConflict(null);
          }}
          onConfirm={onConfirmSwitchPlan}
        />

        <CommonModal
          visible={congratsVisible}
          icon="🎉"
          title="Congratulations!"
          subtitle={`You completed "${
            selectedSummary?.name || planDetail?.name || 'this diet plan'
          }". Keep building healthy habits.`}
          cancelText="Stay here"
          confirmText="Browse plans"
          loading={false}
          onClose={() => setCongratsVisible(false)}
          onConfirm={() => {
            setCongratsVisible(false);
            clearSelection();
          }}
        />
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
                  <View style={styles.dayChipTop}>
                    <Text
                      style={[
                        styles.dayChipLabel,
                        showAllDays && styles.dayChipLabelSelected,
                      ]}
                    >
                      All
                    </Text>
                    {showAllDays ? <View style={styles.dayChipDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.dayChipMeta,
                      showAllDays && styles.dayChipMetaSelected,
                    ]}
                  >
                    {planDays.length || mealsByDay.length}d
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
                  const shortLabel = String(item.label || '')
                    .replace(/day\s*/i, 'D')
                    .trim();
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
                      <View style={styles.dayChipTop}>
                        <Text
                          style={[
                            styles.dayChipLabel,
                            selected && styles.dayChipLabelSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {shortLabel}
                        </Text>
                        {item.isToday ? (
                          <View
                            style={[
                              styles.dayChipTodayPill,
                              selected && styles.dayChipTodayPillOn,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayChipTodayText,
                                selected && styles.dayChipTodayTextOn,
                              ]}
                            >
                              Now
                            </Text>
                          </View>
                        ) : null}
                      </View>
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

          {isPlanFullyComplete ? (
            <View style={styles.completeBanner}>
              <Text style={styles.completeBannerEmoji}>🏆</Text>
              <Text style={styles.completeBannerTitle}>
                All meals tracked — amazing!
              </Text>
              <Text style={styles.completeBannerSub}>
                You’ve finished every meal in this plan. Complete it to save your
                achievement.
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={onCompletePlan}
                disabled={updatingStatus}
                activeOpacity={0.9}
              >
                {updatingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startBtnText}>Complete diet plan</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}

      <CommonModal
        visible={congratsVisible}
        icon="🎉"
        title="Congratulations!"
        subtitle={`You completed "${
          selectedSummary?.name || planDetail?.name || 'this diet plan'
        }". Keep building healthy habits.`}
        cancelText="Stay here"
        confirmText="Browse plans"
        loading={false}
        onClose={() => setCongratsVisible(false)}
        onConfirm={() => {
          setCongratsVisible(false);
          clearSelection();
        }}
      />
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
    gap: 14,
  },

  searchWrap: {
    marginTop: 4,
    marginBottom: 8,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
    paddingVertical: 0,
  },
  prakritiRow: {
    gap: 8,
    paddingRight: 4,
  },
  prakritiChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prakritiChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primaryColor,
  },
  prakritiChipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  prakritiChipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: '#0B3D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  planCardFree: {
    backgroundColor: '#F7FBFA',
    borderColor: '#C6E7DF',
  },

  planCardPaid: {
    backgroundColor: '#FFFCF5',
    borderColor: '#E8D5A3',
  },

  planThumbWrap: {
    marginRight: 12,
    position: 'relative',
  },

  planThumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
  },

  planPremiumBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  planPremiumBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#5E4200',
    letterSpacing: 0.4,
  },

  planBody: { flex: 1 },

  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  planTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#14231F',
  },

  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },

  activePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  listFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  listFooterText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listEndText: {
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  completedPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedPillText: {
    fontSize: 10,
    color: '#4338CA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stoppedPill: {
    backgroundColor: '#FEF2F2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stoppedPillText: {
    fontSize: 10,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  notStartedPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notStartedPillText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  congratsCard: {
    marginTop: 8,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  congratsEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  congratsTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#065F46',
    marginBottom: 6,
  },
  congratsSub: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  completeBanner: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  completeBannerEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  completeBannerTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#92400E',
    marginBottom: 4,
    textAlign: 'center',
  },
  completeBannerSub: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#B45309',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  resumePill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resumePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#4338CA',
  },
  pausedPill: {
    backgroundColor: '#FFF4E5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  pausedPillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },

  planMeta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#6B7C76',
    marginTop: 3,
  },

  planTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
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

  freeTag: {
    backgroundColor: '#E6F4F0',
  },

  freeTagText: {
    color: Colors.primaryColor,
  },

  paidTag: {
    backgroundColor: '#F8EBC4',
  },

  paidTagText: {
    color: '#8B6914',
  },

  planChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  planChevronFree: {
    backgroundColor: '#E8F3EF',
  },

  planChevronPaid: {
    backgroundColor: '#F8EBC4',
  },

  detailHeroWrap: {
    marginTop: 8,
    borderRadius: 22,
    overflow: 'hidden',
    // backgroundColor: Colors.cardBackground,
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
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
  },

  dayChip: {
    width: 76,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EDE9',
    shadowColor: '#0E4B3A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  dayChipSelected: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
    shadowOpacity: 0.16,
  },

  dayChipToday: {
    borderColor: '#9DD4C4',
    backgroundColor: '#F1FAF6',
  },

  dayChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    minHeight: 18,
  },

  dayChipLabel: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#16352C',
    flexShrink: 1,
  },

  dayChipLabelSelected: {
    color: '#FFFFFF',
  },

  dayChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4A84B',
  },

  dayChipTodayPill: {
    backgroundColor: '#D4A84B',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  dayChipTodayPillOn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  dayChipTodayText: {
    fontSize: 8,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1A2E28',
  },

  dayChipTodayTextOn: {
    color: '#FFFFFF',
  },

  dayChipMeta: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#6B7C76',
    marginTop: 3,
  },

  dayChipMetaSelected: {
    color: 'rgba(255,255,255,0.88)',
  },

  dayChipTrack: {
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(14,75,58,0.1)',
    overflow: 'hidden',
    marginTop: 7,
  },

  dayChipFill: {
    height: 3,
    borderRadius: 3,
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
