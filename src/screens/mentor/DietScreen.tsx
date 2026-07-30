import React, { useMemo, useState } from 'react';
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
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SectionHeader from '../../components/SectionHeader';
import Header from '../../components/Header';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import MealCard from '../../components/MealCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDietPlans } from '../../hooks/useDietPlans';
import TablerIcon from '../../components/TablerIcon';
import {
  isDietPlanStarted,
  resolveDietImage,
} from '../../utils/dietPlanUtils';

const { width: SCREEN_W } = Dimensions.get('window');
const PLAN_CARD_W = Math.min(280, SCREEN_W * 0.72);

const MACRO_COLORS = {
  Carbs: '#1FA77A',
  Protein: '#2F6BDE',
  Fat: '#F4B400',
};

const formatKcal = (n: number) =>
  Math.round(Number(n) || 0).toLocaleString('en-IN');

const litersLabel = (ml: number) => {
  const liters = (Number(ml) || 0) / 1000;
  return `${liters.toFixed(1)}L`;
};

const DietScreen = (props: any) => {
  const routeItem = props?.route?.params?.item;
  const initialPlanId = routeItem?.id ? String(routeItem.id) : null;
  const [browseMode, setBrowseMode] = useState(false);

  const {
    plans,
    selectedPlanId,
    setSelectedPlanId,
    selectedSummary,
    planDetail,
    meals,
    nutrition,
    waterMl,
    isStarted,
    loadingList,
    loadingDetail,
    starting,
    refreshing,
    refresh,
    startPlan,
    logMeal,
    adjustWater,
  } = useDietPlans({ initialPlanId, listType: 'all' });

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    [],
  );

  const macrosData = [
    { id: 1, label: 'Carbs', value: nutrition.carbsPct, color: MACRO_COLORS.Carbs },
    { id: 2, label: 'Protein', value: nutrition.proteinPct, color: MACRO_COLORS.Protein },
    { id: 3, label: 'Fat', value: nutrition.fatPct, color: MACRO_COLORS.Fat },
  ];

  const planImage = resolveDietImage(planDetail || selectedSummary || routeItem);
  const dayNumber =
    Number(
      planDetail?.day_number ??
        planDetail?.current_day ??
        selectedSummary?.day_number ??
        1,
    ) || 1;
  const durationDays =
    Number(
      planDetail?.duration_days ??
        planDetail?.days ??
        selectedSummary?.duration_days ??
        21,
    ) || 21;
  const dayPct = Math.min(100, Math.round((dayNumber / durationDays) * 100));

  const showActiveJourney = isStarted && !browseMode;

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
        <TouchableOpacity
          style={styles.minus}
          onPress={() => adjustWater(-250)}
          disabled={!selectedPlanId}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.plus}
          onPress={() => adjustWater(250)}
          disabled={!selectedPlanId}
        >
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlanCard = ({ item }: { item: any }) => {
    const selected = item.id === selectedPlanId;
    const started = isDietPlanStarted(item);
    const priceLabel =
      item.is_paid === false || Number(item.price) === 0
        ? 'Free'
        : `₹${item.price ?? 0}`;

    return (
      <TouchableOpacity
        style={[styles.planCard, selected && styles.planCardSelected]}
        activeOpacity={0.9}
        onPress={() => {
          setSelectedPlanId(item.id);
          setBrowseMode(false);
        }}
      >
        <Image source={resolveDietImage(item)} style={styles.planCardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.planCardGradient}
        />
        <View style={styles.planCardBody}>
          {started ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>In progress</Text>
            </View>
          ) : (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>{priceLabel}</Text>
            </View>
          )}
          <Text style={styles.planCardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {!!item.short_description && (
            <Text style={styles.planCardMeta} numberOfLines={2}>
              {item.short_description}
            </Text>
          )}
          <View style={styles.planCardTags}>
            {!!item.prakriti && (
              <Text style={styles.planTag}>{item.prakriti}</Text>
            )}
            {!!item.season && (
              <Text style={styles.planTag}>{item.season}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ActiveHero = () => (
    <View style={styles.heroWrap}>
      <Image source={planImage} style={styles.heroImage} />
      <LinearGradient
        colors={['rgba(13,97,78,0.15)', 'rgba(13,97,78,0.92)']}
        style={styles.heroGradient}
      />
      <View style={styles.heroContent}>
        <View style={styles.heroTopRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Active plan</Text>
          </View>
          <TouchableOpacity onPress={() => setBrowseMode(true)}>
            <Text style={styles.switchPlan}>Switch plan</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {selectedSummary?.name || 'Your diet plan'}
        </Text>
        <Text style={styles.heroSub}>
          Day {dayNumber} of {durationDays} · Keep logging meals to stay on track
        </Text>

        <View style={styles.dayTrack}>
          <View style={[styles.dayTrackFill, { width: `${dayPct}%` }]} />
        </View>

        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>
              {nutrition.mealsDone}/{nutrition.mealsTotal || '—'}
            </Text>
            <Text style={styles.statLabel}>Meals today</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{formatKcal(nutrition.eatenKcal)}</Text>
            <Text style={styles.statLabel}>Kcal eaten</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{litersLabel(waterMl)}</Text>
            <Text style={styles.statLabel}>Water</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const PreviewHero = () => (
    <View style={styles.heroWrap}>
      <Image source={planImage} style={styles.heroImage} />
      <LinearGradient
        colors={['transparent', 'rgba(15,23,42,0.88)']}
        style={styles.heroGradient}
      />
      <View style={styles.heroContent}>
        <Text style={styles.heroEyebrow}>Ready to begin</Text>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {selectedSummary?.name || 'Choose a diet plan'}
        </Text>
        {!!(selectedSummary?.short_description || selectedSummary?.prakriti) && (
          <Text style={styles.heroSub} numberOfLines={3}>
            {selectedSummary?.short_description ||
              `${selectedSummary?.prakriti || ''} · ${selectedSummary?.season || ''}`}
          </Text>
        )}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => startPlan(selectedPlanId || undefined)}
          disabled={starting || !selectedPlanId}
          activeOpacity={0.9}
        >
          {starting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <TablerIcon name="plus" size={18} color="#fff" />
              <Text style={styles.startBtnText}>Start this plan</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.startHint}>
          After you start, you’ll see today’s meals, calories left, and hydration
          progress here.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Diet"
        subtitle={
          showActiveJourney
            ? 'Your daily nutrition journey'
            : 'Personalized Ayurvedic plans'
        }
        onBack={() => props.navigation.goBack()}
      />

      {loadingList && plans.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.primaryColor}
            />
          }
        >
          {(!showActiveJourney || browseMode) && (
            <>
              <SectionHeader
                title="Explore plans"
                actionText={browseMode ? 'Back' : `${plans.length} plans`}
                onPress={
                  browseMode
                    ? () => setBrowseMode(false)
                    : undefined
                }
              />
              <FlatList
                data={plans}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={renderPlanCard}
                contentContainerStyle={styles.planList}
                ListEmptyComponent={
                  <Text style={styles.emptySub}>No diet plans available yet.</Text>
                }
              />
            </>
          )}

          {loadingDetail && selectedPlanId ? (
            <View style={styles.detailLoader}>
              <ActivityIndicator color={Colors.primaryColor} />
            </View>
          ) : showActiveJourney ? (
            <>
              <ActiveHero />

              <View style={styles.nextUpCard}>
                <TablerIcon name="clock" size={20} color={Colors.primaryColor} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.nextUpTitle}>What’s next</Text>
                  <Text style={styles.nextUpText}>
                    {nutrition.mealsDone < (nutrition.mealsTotal || 0)
                      ? `Log your next meal — ${nutrition.mealsTotal - nutrition.mealsDone} left today`
                      : nutrition.mealsTotal === 0
                        ? 'Meals will appear as your plan loads'
                        : 'All meals logged — stay hydrated and check back tomorrow'}
                  </Text>
                </View>
              </View>

              <SectionHeader title="Daily Vitality" actionText={todayLabel} />
              <DailyVitalityCard />
              <HydrationCard />

              <SectionHeader
                title="Today's Meals"
                actionText={`${nutrition.mealProgressPct}% done`}
              />

              {meals.length === 0 ? (
                <View style={styles.emptyMeals}>
                  <Text style={styles.emptyTitle}>No meals listed yet</Text>
                  <Text style={styles.emptySub}>
                    Pull to refresh, or check back once your doctor updates this
                    plan.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={meals}
                  scrollEnabled={false}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <MealCard
                      data={item}
                      navigation={props.navigation}
                      onLog={() => logMeal(item)}
                    />
                  )}
                />
              )}
            </>
          ) : (
            <>
              {selectedPlanId ? <PreviewHero /> : null}
              {!selectedPlanId && (
                <View style={styles.emptyMeals}>
                  <Text style={styles.emptyTitle}>Pick a plan to begin</Text>
                  <Text style={styles.emptySub}>
                    Browse the cards above, then start to unlock today’s meal
                    tracking.
                  </Text>
                </View>
              )}
            </>
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

  detailLoader: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  planList: {
    gap: 14,
    paddingBottom: 8,
    paddingRight: 8,
  },

  planCard: {
    width: PLAN_CARD_W,
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  planCardSelected: {
    borderColor: Colors.primaryColor,
  },

  planCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  planCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  planCardBody: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },

  planCardTitle: {
    color: '#fff',
    fontSize: 17,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  planCardMeta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
  },

  planCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  planTag: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: '#fff',
    overflow: 'hidden',
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    textTransform: 'capitalize',
  },

  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },

  liveBadgeText: {
    color: '#ECFDF5',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  priceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },

  priceBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  heroWrap: {
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: Colors.primaryColor,
  },

  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  switchPlan: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    textDecorationLine: 'underline',
  },

  heroEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  heroSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 4,
    marginBottom: 12,
  },

  dayTrack: {
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginBottom: 14,
  },

  dayTrackFill: {
    height: 6,
    backgroundColor: '#34D399',
    borderRadius: 8,
  },

  statRow: {
    flexDirection: 'row',
    gap: 8,
  },

  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  statValue: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: Fonts.PoppinsRegular,
    marginTop: 2,
  },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryColor,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },

  startBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  startHint: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },

  nextUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: 8,
  },

  nextUpTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.black,
  },

  nextUpText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.subTextColor,
    marginTop: 2,
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

  macroItem: {
    width: '30%',
  },

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

  emptyMeals: {
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 15,
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
});
