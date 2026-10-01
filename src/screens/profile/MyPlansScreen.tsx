import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import { useMyPackages } from '../../hooks/usePackagePlans';
import { useDebounce } from '../../hooks/useDebaunce';
import type { MyPlan, MyPlanBenefit } from '../../services/PackageServices';
import { SCREEN_PADDING_H } from '../../constants/layout';

const GOLD = '#E8C27A';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Expired', value: 'expired' },
];

const PLAN_STATUS: Record<string, { label: string; dot: string; gradient: string[] }> = {
  active: { label: 'Active', dot: '#4ADE80', gradient: ['#0A4A3C', '#0D614E', '#178A6E'] },
  pending: { label: 'Pending', dot: '#FBBF24', gradient: ['#5B3A0A', '#8A5A12', '#B7791F'] },
  expired: { label: 'Expired', dot: '#CBD5E1', gradient: ['#374151', '#4B5563', '#6B7280'] },
  cancelled: { label: 'Cancelled', dot: '#FCA5A5', gradient: ['#5F1D1D', '#7F2626', '#9B3434'] },
};

const BENEFIT_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  available: { label: 'Available', bg: '#E7F7EE', fg: '#15803D' },
  used: { label: 'Used', bg: '#F1F3F2', fg: '#6B7874' },
  consumed: { label: 'Used', bg: '#F1F3F2', fg: '#6B7874' },
  expired: { label: 'Expired', bg: '#FDECEC', fg: '#B91C1C' },
};

const humanize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ') : '';

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const daysLeft = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.ceil(ms / 86400000);
};

const benefitIcon = (label: string): TablerIconName => {
  const key = label.toLowerCase();
  if (key.includes('consult') || key.includes('doctor')) return 'stethoscope';
  if (key.includes('diet') || key.includes('nutri')) return 'salad-filled';
  if (key.includes('yoga') || key.includes('exercise')) return 'barbell-filled';
  if (key.includes('prakriti') || key.includes('assessment')) return 'clipboard-list';
  if (key.includes('lab') || key.includes('test')) return 'flask';
  return 'leaf';
};

function BenefitRow({ benefit, isLast }: { benefit: MyPlanBenefit; isLast: boolean }) {
  const tone = BENEFIT_STATUS[benefit.status] ?? {
    label: humanize(benefit.status),
    bg: '#F1F3F2',
    fg: '#44524D',
  };
  const hasQuantity = benefit.quantity_total !== null && benefit.quantity_total > 0;
  const remaining = benefit.quantity_remaining ?? 0;
  const progress = hasQuantity ? Math.max(0, Math.min(1, remaining / benefit.quantity_total!)) : 1;

  return (
    <View style={[styles.benefit, !isLast && styles.benefitDivider]}>
      <View style={styles.benefitIcon}>
        <TablerIcon name={benefitIcon(benefit.label)} size={17} color={Colors.primaryColor} />
      </View>
      <View style={styles.benefitBody}>
        <View style={styles.benefitTop}>
          <Text style={styles.benefitLabel} numberOfLines={2}>
            {benefit.label}
          </Text>
          {tone.label ? (
            <View style={[styles.benefitPill, { backgroundColor: tone.bg }]}>
              <Text style={[styles.benefitPillText, { color: tone.fg }]}>{tone.label}</Text>
            </View>
          ) : null}
        </View>
        {hasQuantity ? (
          <>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.benefitMeta}>
              {remaining} of {benefit.quantity_total} remaining
            </Text>
          </>
        ) : (
          <Text style={styles.benefitMeta}>
            {benefit.role === 'grant' ? 'Included in your plan' : humanize(benefit.role)}
          </Text>
        )}
      </View>
    </View>
  );
}

function MyPlanCard({ plan, highlighted }: { plan: MyPlan; highlighted: boolean }) {
  const status = PLAN_STATUS[plan.status] ?? {
    label: humanize(plan.status),
    dot: '#CBD5E1',
    gradient: ['#374151', '#4B5563', '#6B7280'],
  };
  const pending = plan.status === 'pending';
  const autopay = !!plan.billing_mode && plan.billing_mode !== 'one_time';
  const paid = Number(plan.paid_price) || 0;
  const original = Number(plan.original_price) || 0;
  const amount = paid > 0 ? plan.paid_price : plan.original_price;
  const saved = paid > 0 && original > paid ? original - paid : 0;
  const remainingDays = daysLeft(plan.expires_at);
  const startDate = formatDate(plan.starts_at);
  const startTime = formatTime(plan.starts_at);
  const expiryDate = formatDate(plan.expires_at);
  const expiryTime = formatTime(plan.expires_at);
  const benefits = (plan.benefits ?? []).filter(b => !!b?.label);
  const available = benefits.filter(b => b.status === 'available').length;
  const showTimeline = !!startDate || !!expiryDate;
  const showValidity = !!expiryDate && remainingDays !== null && plan.status === 'active';

  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      <LinearGradient
        colors={status.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.orb, styles.orbLarge]} />
        <View style={[styles.orb, styles.orbSmall]} />

        <View style={styles.heroTop}>
          <View style={styles.brandRow}>
            <TablerIcon name="certificate" size={14} color={GOLD} />
            <Text style={styles.brand}>AYURMUNI CARE PLAN</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.planName}>{plan.name}</Text>

        <View style={styles.heroBottom}>
          <View>
            <Text style={styles.heroLabel}>{pending ? 'Plan amount' : 'Amount paid'}</Text>
            <View style={styles.priceRow}>
              <RupeeAmount
                value={amount}
                style={styles.heroPrice}
                iconColor="#FFFFFF"
                decimals={false}
              />
              {plan.currency ? <Text style={styles.currency}>{plan.currency}</Text> : null}
            </View>
            {saved > 0 ? (
              <Text style={styles.saved}>
                Saved ₹{Math.round(saved).toLocaleString('en-IN')} on ₹
                {Math.round(original).toLocaleString('en-IN')}
              </Text>
            ) : null}
          </View>
          {showValidity ? (
            <View style={styles.validityBox}>
              <Text style={styles.validityValue}>{remainingDays}</Text>
              <Text style={styles.validityLabel}>
                day{remainingDays === 1 ? '' : 's'} left
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.goldLine} />
      </LinearGradient>

      <View style={styles.body}>
        {pending ? (
          <View style={styles.pendingNote}>
            <TablerIcon name="clock" size={14} color="#B45309" />
            <Text style={styles.pendingText}>
              Payment confirmation pending. Your plan activates once it's confirmed.
            </Text>
          </View>
        ) : null}

        {showTimeline ? (
          <View style={styles.timeline}>
            {startDate ? (
              <View style={styles.timeCell}>
                <View style={styles.timeHead}>
                  <View style={[styles.timeDot, { backgroundColor: Colors.primaryColor }]} />
                  <Text style={styles.timeLabel}>Started</Text>
                </View>
                <Text style={styles.timeValue}>{startDate}</Text>
                {startTime ? <Text style={styles.timeSub}>{startTime}</Text> : null}
              </View>
            ) : null}
            {startDate && expiryDate ? <View style={styles.timeConnector} /> : null}
            {expiryDate ? (
              <View style={[styles.timeCell, startDate ? styles.timeCellEnd : null]}>
                <View style={styles.timeHead}>
                  <View style={[styles.timeDot, { backgroundColor: GOLD }]} />
                  <Text style={styles.timeLabel}>Valid till</Text>
                </View>
                <Text style={styles.timeValue}>{expiryDate}</Text>
                {expiryTime ? <Text style={styles.timeSub}>{expiryTime}</Text> : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {plan.billing_mode || plan.cancel_at_period_end ? (
        <View style={styles.chips}>
          {plan.billing_mode ? (
            <View style={styles.chip}>
              <TablerIcon name={autopay ? 'refresh' : 'credit-card'} size={12} color="#44524D" />
              <Text style={styles.chipText}>{autopay ? 'Autopay' : 'One-time payment'}</Text>
            </View>
          ) : null}
          {autopay && plan.autopay_status ? (
            <View style={styles.chip}>
              <TablerIcon name="bolt" size={12} color="#44524D" />
              <Text style={styles.chipText}>Autopay {humanize(plan.autopay_status)}</Text>
            </View>
          ) : null}
          {plan.cancel_at_period_end ? (
            <View style={[styles.chip, styles.chipWarn]}>
              <TablerIcon name="alert-circle" size={12} color="#B45309" />
              <Text style={[styles.chipText, { color: '#B45309' }]}>Ends at period end</Text>
            </View>
          ) : null}
        </View>
        ) : null}

        {benefits.length > 0 ? (
          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your benefits</Text>
              <Text style={styles.sectionMeta}>
                {available}/{benefits.length} available
              </Text>
            </View>
            <View style={styles.benefits}>
              {benefits.map((benefit, index) => (
                <BenefitRow
                  key={`${plan.id}-${index}`}
                  benefit={benefit}
                  isLast={index === benefits.length - 1}
                />
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.planId}>Plan ID · {plan.id.slice(0, 8).toUpperCase()}</Text>
      </View>
    </View>
  );
}

export default function MyPlansScreen(props: any) {
  const { navigation, route } = props;
  const insets = useSafeAreaInsets();
  const highlightId: string | undefined = route?.params?.highlightId;

  const [status, setStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const search = useDebounce(searchText.trim(), 400);

  const { purchases, loading, loadingMore, refreshing, error, loadMore, refresh } =
    useMyPackages({ status, search });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="My Plans" onLeftPress={() => navigation.goBack()} />

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <TablerIcon name="search" size={16} color="#8A9591" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search your plans"
            placeholderTextColor="#9AA5A1"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')} hitSlop={8}>
              <TablerIcon name="x" size={16} color="#8A9591" />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.tabs}>
          {STATUS_TABS.map(tab => {
            const active = tab.value === status;
            return (
              <TouchableOpacity
                key={tab.label}
                activeOpacity={0.85}
                onPress={() => setStatus(tab.value)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={loading ? [] : purchases}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <MyPlanCard plan={item} highlighted={item.id === highlightId} />}
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
              <View style={styles.emptyIcon}>
                <TablerIcon name="certificate" size={34} color={Colors.primaryColor} />
              </View>
              <Text style={styles.emptyTitle}>
                {error ? 'Could not load your plans' : 'No plans yet'}
              </Text>
              <Text style={styles.emptySub}>
                {error ? 'Pull down to try again.' : 'Care plans you buy will show up here.'}
              </Text>
              {!error ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.exploreBtn}
                  onPress={() => navigation.navigate('PackagesScreen')}
                >
                  <Text style={styles.exploreText}>Explore care plans</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color={Colors.primaryColor} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  filters: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE8E3',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    color: '#1F2A27',
    paddingVertical: 0,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE8E3',
  },
  tabActive: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  tabText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#44524D',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 10,
  },
  separator: {
    height: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0A3D31',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: GOLD,
  },
  hero: {
    padding: 16,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  orbLarge: {
    width: 180,
    height: 180,
    top: -70,
    right: -50,
  },
  orbSmall: {
    width: 90,
    height: 90,
    bottom: -30,
    right: 70,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brand: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: GOLD,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  planName: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 19,
    lineHeight: 26,
    color: '#FFFFFF',
    marginTop: 12,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  heroLabel: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.72)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  heroPrice: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  currency: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 6,
  },
  saved: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: GOLD,
    marginTop: 2,
  },
  validityBox: {
    alignItems: 'center',
    minWidth: 76,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,194,122,0.55)',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  validityValue: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 24,
    color: GOLD,
  },
  validityLabel: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
  goldLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: GOLD,
    opacity: 0.85,
  },

  body: {
    padding: 14,
    gap: 12,
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 10,
  },
  pendingText: {
    flex: 1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#92400E',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF9',
    borderRadius: 14,
    padding: 12,
  },
  timeCell: {
    flex: 1,
  },
  timeCellEnd: {
    alignItems: 'flex-end',
  },
  timeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeLabel: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: '#7A8683',
  },
  timeValue: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13.5,
    color: '#1F2A27',
    marginTop: 3,
  },
  timeSub: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: '#8A9591',
  },
  timeConnector: {
    width: 40,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B9C9C2',
    marginHorizontal: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F1F5F3',
  },
  chipWarn: {
    backgroundColor: '#FFF4E5',
  },
  chipText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: '#44524D',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14.5,
    color: '#1F2A27',
  },
  sectionMeta: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11.5,
    color: Colors.primaryColor,
  },
  benefits: {
    borderWidth: 1,
    borderColor: '#EAF0ED',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  benefitDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitBody: {
    flex: 1,
  },
  benefitTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  benefitLabel: {
    flex: 1,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: '#1F2A27',
  },
  benefitPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  benefitPillText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E6EEEA',
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },
  benefitMeta: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11.5,
    color: '#6B7874',
    marginTop: 4,
  },
  planId: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: '#9AA5A1',
    textAlign: 'center',
  },

  center: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 6,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    color: '#1F2A27',
    marginTop: 8,
  },
  emptySub: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#6B7874',
  },
  exploreBtn: {
    marginTop: 12,
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  footerLoader: {
    marginVertical: 18,
  },
});
