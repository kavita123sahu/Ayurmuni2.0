import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import TablerIcon from '../../components/TablerIcon';
import { requireAuth } from '../../services/guestAuth';
import { getMyDietPlans } from '../../services/DietPurchaseService';
import {
  getDietListStatus,
  normalizeDietPlanList,
  resolveDietImage,
  type DietPlanSummary,
} from '../../utils/dietPlanUtils';
import { formatRupee } from '../../utils/currencyUtils';
import { SCREEN_PADDING_H } from '../../constants/layout';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'purchased', label: 'Purchased' },
  { id: 'paused', label: 'Paused' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'stopped', label: 'Stopped' },
] as const;

const EMPTY_COPY: Record<string, [string, string]> = {
  all: ['No diet plans yet', 'Start a plan and it will show up here.'],
  active: ['No diet is active right now', 'Start a plan and it will show up here.'],
  purchased: ['No purchased diet plans yet', 'Paid plans you buy will be listed here.'],
  paused: ['No paused diets', 'Plans you pause will be listed here.'],
  in_progress: ['No diets in progress', 'A plan you have started will be listed here.'],
  completed: ['No completed diets', 'Finished plans will be listed here.'],
  stopped: ['No stopped diets', 'Plans you stop will be listed here.'],
};

const durationLabel = (plan: DietPlanSummary) => {
  if ((plan as any)?.duration) return String((plan as any).duration);
  const days = Number((plan as any)?.duration_days ?? (plan as any)?.total_days);
  return Number.isFinite(days) && days > 0 ? `${days} days` : '';
};

const priceLabel = (plan: DietPlanSummary) =>
  plan?.is_paid === false || Number(plan?.price) === 0
    ? 'Free'
    : formatRupee(plan?.price);

const statusStyle = (status: string) => {
  if (status === 'active' || status === 'in_progress') {
    return { bg: '#DCFCE7', text: '#166534' };
  }
  if (status === 'paused') return { bg: '#FEF3C7', text: '#92400E' };
  if (status === 'completed') return { bg: '#E0E7FF', text: '#3730A3' };
  return { bg: '#F1F5F9', text: '#475569' };
};

export default function MyDietsScreen(props: any) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<string>('active');
  const [plans, setPlans] = useState<DietPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!(await requireAuth('Please login to view your diets'))) return;
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      try {
        const params: {
          page: number;
          page_size: number;
          patient_assignment_status?: string;
          is_purchased?: string;
        } = { page: 1, page_size: 40 };
        if (status === 'purchased') params.is_purchased = 'true';
        else if (status !== 'all') params.patient_assignment_status = status;
        const res = await getMyDietPlans(params);
        setPlans(res?.success === false ? [] : normalizeDietPlanList(res));
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Your diets" onLeftPress={() => navigation.goBack()} />

      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          data={STATUS_FILTERS as unknown as { id: string; label: string }[]}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          renderItem={({ item }) => {
            const active = item.id === status;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setStatus(item.id)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={loading ? [] : plans}
        keyExtractor={item =>
          String(item.patient_diet_plan_id || item.id)
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load('refresh')}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        renderItem={({ item }) => {
          const planStatus = getDietListStatus(item);
          const tone = statusStyle(planStatus);
          const cover = resolveDietImage(item);
          const routeId = String(
            (item as any).diet_plan_id || item.id || '',
          ).trim();
          const meta = [durationLabel(item), item.prakriti, priceLabel(item)]
            .filter(Boolean)
            .join(' · ');
          return (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.row}
              onPress={() =>
                routeId &&
                navigation.navigate('DietPlanDetail', {
                  planId: routeId,
                  item,
                })
              }
            >
              <View style={styles.thumb}>
                {cover ? (
                  <Image source={cover} style={styles.thumbImg} />
                ) : (
                  <TablerIcon
                    name="salad-filled"
                    size={22}
                    color={Colors.primaryColor}
                  />
                )}
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title || item.name}
                </Text>
                {meta ? (
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {meta}
                  </Text>
                ) : null}
                <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                  <Text style={[styles.badgeText, { color: tone.text }]}>
                    {planStatus.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
              <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primaryColor} />
            </View>
          ) : (
            <View style={styles.center}>
              <View style={styles.emptyIcon}>
                <TablerIcon
                  name="salad-filled"
                  size={34}
                  color={Colors.primaryColor}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {EMPTY_COPY[status]?.[0] || 'No diets'}
              </Text>
              <Text style={styles.emptySub}>
                {EMPTY_COPY[status]?.[1] || 'Browse plans to get started.'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('DietScreen')}
              >
                <Text style={styles.exploreText}>Browse diet plans</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  tabsWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  tabs: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: Colors.primaryColor,
  },
  tabText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#4B5753',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 14,
    flexGrow: 1,
  },
  separator: { height: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  rowBody: { flex: 1 },
  rowTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#1F2A27',
  },
  rowMeta: {
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#64748B',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
    color: '#1F2A27',
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 6,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  exploreBtn: {
    marginTop: 18,
    backgroundColor: Colors.primaryColor,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  exploreText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
