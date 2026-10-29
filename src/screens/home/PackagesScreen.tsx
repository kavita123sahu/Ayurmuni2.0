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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import TablerIcon from '../../components/TablerIcon';
import PackagePlanCard from '../../components/packages/PackagePlanCard';
import PackagePlanDetailSheet from '../../components/packages/PackagePlanDetailSheet';
import { isCarePlan } from '../../components/packages/packageUi';
import { usePackagePlans } from '../../hooks/usePackagePlans';
import { usePackagePurchase } from '../../hooks/usePackagePurchase';
import { useActivePlans } from '../../hooks/useActivePlans';
import PlanTransferConfirmModal from '../../components/packages/PlanTransferConfirmModal';
import type { PackagePlan } from '../../services/PackageServices';
import { SCREEN_PADDING_H } from '../../constants/layout';
import {
  navigateToCompleteDetails,
  requireAuth,
  resolveAccessLikeProfile,
} from '../../services/guestAuth';

const ALL = 'All';
const PROFILE_GATE_MESSAGE =
  'Complete your profile to continue with care plans.';

export default function PackagesScreen(props: any) {
  const { navigation, route } = props;
  const insets = useSafeAreaInsets();
  const { plans, loading, loadingMore, refreshing, error, loadMore, refresh } =
    usePackagePlans();
  const { startPlan, processingId, transferPrompt, confirmTransfer, cancelTransfer } =
    usePackagePurchase(navigation);
  const { ownsPackage } = useActivePlans();

  const [category, setCategory] = useState(ALL);
  const [selected, setSelected] = useState<PackagePlan | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | undefined>(
    route?.params?.planId,
  );
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  const refreshProfileStatus = useCallback(async () => {
    try {
      const { isComplete } = await resolveAccessLikeProfile();
      setProfileComplete(isComplete);
    } catch {
      setProfileComplete(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshProfileStatus();
      refresh();
    }, [refreshProfileStatus, refresh]),
  );

  useEffect(() => {
    if (profileComplete === false) {
      // Incomplete profile: send to Complete Your Profile first
      navigateToCompleteDetails(PROFILE_GATE_MESSAGE);
    }
  }, [profileComplete]);

  useEffect(() => {
    if (profileComplete !== true || !pendingPlanId || plans.length === 0) return;
    const match = plans.find(plan => plan.id === pendingPlanId);
    if (match) setSelected(match);
    setPendingPlanId(undefined);
  }, [pendingPlanId, plans, profileComplete]);

  const categories = useMemo(() => {
    const names = plans.map(plan => plan.category_name).filter(Boolean);
    return [ALL, ...Array.from(new Set(names))];
  }, [plans]);

  const visiblePlans = useMemo(() => {
    const list =
      category === ALL ? plans : plans.filter(p => p.category_name === category);
    return [...list].sort(
      (a, b) => Number(isCarePlan(b)) - Number(isCarePlan(a)),
    );
  }, [plans, category]);

  const openPlan = useCallback(
    async (plan: PackagePlan) => {
      const ok = await requireAuth(PROFILE_GATE_MESSAGE);
      if (!ok) {
        setSelected(null);
        setProfileComplete(false);
        return;
      }
      setProfileComplete(true);
      setSelected(plan);
    },
    [],
  );

  const onCta = useCallback(
    async (plan: PackagePlan) => {
      setSelected(null);
      const ok = await requireAuth(PROFILE_GATE_MESSAGE);
      if (!ok) {
        setProfileComplete(false);
        return;
      }
      setProfileComplete(true);
      startPlan(plan);
    },
    [startPlan],
  );

  const listHeader = (
    <View>
      {profileComplete === false ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.profileGate}
          onPress={() => navigateToCompleteDetails(PROFILE_GATE_MESSAGE)}
        >
          <View style={styles.profileGateIcon}>
            <TablerIcon name="user" size={18} color={Colors.primaryColor} />
          </View>
          <View style={styles.profileGateCopy}>
            <Text style={styles.profileGateTitle}>Complete your profile</Text>
            <Text style={styles.profileGateSub}>
              Finish your details to purchase any care plan.
            </Text>
          </View>
          <TablerIcon name="chevron-right" size={18} color={Colors.primaryColor} />
        </TouchableOpacity>
      ) : null}

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
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {name}
                </Text>
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Care Plans" onLeftPress={() => navigation.goBack()} />

      <FlatList
        data={visiblePlans}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <PackagePlanCard
            plan={item}
            onPress={openPlan}
            onPressCta={openPlan}
            processing={processingId === item.id}
            owned={ownsPackage(item.id)}
          />
        )}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refreshProfileStatus();
              refresh();
            }}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        ListEmptyComponent={
          loading || profileComplete === null ? (
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
                {error
                  ? 'Pull down to try again.'
                  : 'New care plans will appear here soon.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={styles.footerLoader}
              color={Colors.primaryColor}
            />
          ) : null
        }
      />

      <PackagePlanDetailSheet
        plan={selected}
        processing={!!selected && processingId === selected.id}
        owned={!!selected && ownsPackage(selected.id)}
        onClose={() => setSelected(null)}
        onCta={onCta}
      />

      <PlanTransferConfirmModal
        prompt={transferPrompt}
        onYes={confirmTransfer}
        onNo={cancelTransfer}
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
  profileGate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EAF8F4',
    borderWidth: 1,
    borderColor: '#D7E8E1',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  profileGateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileGateCopy: {
    flex: 1,
  },
  profileGateTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  profileGateSub: {
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
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
