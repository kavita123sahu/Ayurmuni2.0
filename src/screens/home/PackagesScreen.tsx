import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import TablerIcon from '../../components/TablerIcon';
import PackagePlanCard from '../../components/packages/PackagePlanCard';
import PackagePlanDetailSheet from '../../components/packages/PackagePlanDetailSheet';
import { getDiscountPercent, isCarePlan } from '../../components/packages/packageUi';
import { usePackagePlans } from '../../hooks/usePackagePlans';
import { usePackagePurchase } from '../../hooks/usePackagePurchase';
import type { PackagePlan } from '../../services/PackageServices';
import { SCREEN_PADDING_H } from '../../constants/layout';

const ALL = 'All';

export default function PackagesScreen(props: any) {
  const { navigation, route } = props;
  const insets = useSafeAreaInsets();
  const { plans, loading, loadingMore, refreshing, error, loadMore, refresh } =
    usePackagePlans();
  const { startPlan, processingId } = usePackagePurchase(navigation);

  const [category, setCategory] = useState(ALL);
  const [selected, setSelected] = useState<PackagePlan | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | undefined>(
    route?.params?.planId,
  );

  useEffect(() => {
    if (!pendingPlanId || plans.length === 0) return;
    const match = plans.find(plan => plan.id === pendingPlanId);
    if (match) setSelected(match);
    setPendingPlanId(undefined);
  }, [pendingPlanId, plans]);

  const categories = useMemo(() => {
    const names = plans.map(plan => plan.category_name).filter(Boolean);
    return [ALL, ...Array.from(new Set(names))];
  }, [plans]);

  const visiblePlans = useMemo(() => {
    const list = category === ALL ? plans : plans.filter(p => p.category_name === category);
    // Purchasable care plans first so they get the spotlight.
    return [...list].sort((a, b) => Number(isCarePlan(b)) - Number(isCarePlan(a)));
  }, [plans, category]);

  const maxSaving = useMemo(
    () => plans.reduce((max, plan) => Math.max(max, getDiscountPercent(plan)), 0),
    [plans],
  );

  const onCta = useCallback(
    (plan: PackagePlan) => {
      setSelected(null);
      startPlan(plan);
    },
    [startPlan],
  );

  const header = (
    <View>
      <LinearGradient
        colors={['#0D614E', '#15876C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>AYURVEDIC CARE PLANS</Text>
        <Text style={styles.heroTitle}>Care that continues{'\n'}beyond one consult</Text>
        <View style={styles.heroPoints}>
          {[
            { icon: 'stethoscope' as const, label: 'Doctor-led' },
            { icon: 'salad-filled' as const, label: 'Diet guidance' },
            {
              icon: 'wallet' as const,
              label: maxSaving > 0 ? `Save up to ${maxSaving}%` : 'Best value',
            },
          ].map(point => (
            <View key={point.label} style={styles.heroPoint}>
              <TablerIcon name={point.icon} size={13} color="#FFFFFF" />
              <Text style={styles.heroPointText}>{point.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.myPlansBtn}
          onPress={() => navigation.navigate('MyPlansScreen')}
        >
          <TablerIcon name="certificate" size={14} color={Colors.primaryColor} />
          <Text style={styles.myPlansText}>My Plans</Text>
          <TablerIcon name="chevron-right" size={14} color={Colors.primaryColor} />
        </TouchableOpacity>
      </LinearGradient>

      {categories.length > 2 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map(name => {
            const active = name === category;
            return (
              <TouchableOpacity
                key={name}
                activeOpacity={0.85}
                onPress={() => setCategory(name)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {!loading && visiblePlans.length > 0 ? (
        <Text style={styles.countText}>
          {visiblePlans.length} plan{visiblePlans.length > 1 ? 's' : ''} available
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Care Plans" onLeftPress={() => navigation.goBack()} />

      <FlatList
        data={loading ? [] : visiblePlans}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <PackagePlanCard
            plan={item}
            onPress={setSelected}
            onPressCta={setSelected}
            processing={processingId === item.id}
          />
        )}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primaryColor} />
            </View>
          ) : (
            <View style={styles.center}>
              <TablerIcon name="package" size={36} color="#9AB3AA" />
              <Text style={styles.emptyTitle}>
                {error ? 'Could not load plans' : 'No plans available'}
              </Text>
              <Text style={styles.emptySub}>
                {error ? 'Pull down to try again.' : 'New care plans will appear here soon.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color={Colors.primaryColor} />
          ) : null
        }
      />

      <PackagePlanDetailSheet
        plan={selected}
        processing={!!selected && processingId === selected.id}
        onClose={() => setSelected(null)}
        onCta={onCta}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAF9',
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 8,
  },
  hero: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  heroEyebrow: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#BFE5D8',
  },
  heroTitle: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 27,
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroPoints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  heroPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroPointText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  myPlansBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },
  myPlansText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
    color: Colors.primaryColor,
  },
  chips: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE8E3',
  },
  chipActive: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  chipText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#44524D',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  countText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#6B7874',
    marginBottom: 10,
  },
  separator: {
    height: 14,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    color: '#1F2A27',
    marginTop: 6,
  },
  emptySub: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#6B7874',
  },
  footerLoader: {
    marginVertical: 18,
  },
});
