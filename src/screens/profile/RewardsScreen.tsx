import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import RewardGridCard, {
  RewardHighlightCard,
  REWARD_GRID,
} from '../../components/RewardGridCard';
import CouponAppliedModal from '../../components/CouponAppliedModal';
import EmptyState from '../../components/EmptyState';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';
import { fetchRewards } from '../../services/RewardServices';
import { SCREEN_THEME } from '../../constants/screenTheme';
import {
  couponAppliesLabel,
  couponExpiryLabel,
  couponMaxNote,
  couponMinNote,
  couponOfferTitle,
  couponSavingsLabel,
  type Coupon,
} from '../../utils/couponUtils';
import { type Reward } from '../../utils/rewardUtils';
import { useFocusEffect } from '@react-navigation/native';
import { shouldRunThrottled } from '../../utils/fetchThrottle';

type FilterChip = {
  key: string;
  label: string;
  match: (r: Reward) => boolean;
};

type DetailState = {
  coupon: Coupon;
  reward?: Reward | null;
};

const isRewardsScreenItem = (r: Reward) => {
  const source = String(r.source || '').toLowerCase();
  const couponSource = String(r.coupon?.source || '').toLowerCase();
  const trigger = String(r.trigger || '').toLowerCase();
  return (
    source === 'referral' ||
    source === 'reward' ||
    couponSource === 'referral' ||
    couponSource === 'reward' ||
    trigger === 'referral' ||
    trigger === 'reward'
  );
};

const RewardsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filterKey, setFilterKey] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [code, setCode] = useState('');
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [success, setSuccess] = useState<{
    code: string;
    title?: string;
  } | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rewardPayload = await fetchRewards();
      setRewards(rewardPayload.rewards);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (shouldRunThrottled('rewards-focus', 60_000) || rewards.length === 0) {
        load();
      }
    }, [load, rewards.length]),
  );

  /** Profile Rewards: source = referral | reward only */
  const displayRewards = useMemo(
    () => rewards.filter(r => r.coupon && isRewardsScreenItem(r)),
    [rewards],
  );

  const chips: FilterChip[] = useMemo(() => {
    // Only Referral / Reward tabs — no other source chips
    return [
      { key: 'all', label: 'All', match: () => true },
      {
        key: 'referral',
        label: 'Referral',
        match: r => {
          const source = String(r.source || r.coupon?.source || '').toLowerCase();
          const trigger = String(r.trigger || '').toLowerCase();
          return source === 'referral' || trigger === 'referral';
        },
      },
      {
        key: 'reward',
        label: 'Reward',
        match: r => {
          const source = String(r.source || r.coupon?.source || '').toLowerCase();
          const trigger = String(r.trigger || '').toLowerCase();
          return source === 'reward' || trigger === 'reward';
        },
      },
    ];
  }, []);

  const activeFilter = chips.find(c => c.key === filterKey) || chips[0];

  const filtered = useMemo(
    () => displayRewards.filter(activeFilter.match),
    [activeFilter, displayRewards],
  );

  const gridData = useMemo(() => {
    const rows: Array<
      | { type: 'highlight'; id: string; count: number }
      | { type: 'reward'; id: string; reward: Reward }
    > = [];

    if (filterKey === 'all' && displayRewards.length > 0) {
      rows.push({
        type: 'highlight',
        id: 'highlight',
        count: displayRewards.length,
      });
    }

    filtered.forEach(reward => {
      rows.push({
        type: 'reward',
        id: reward.id,
        reward,
      });
    });
    return rows;
  }, [filterKey, filtered, displayRewards.length]);

  const claimCoupon = async (coupon: Coupon, reward?: Reward | null) => {
    try {
      await Clipboard.setString(coupon.code);
      setDetail(null);
      setAddOpen(false);
      setSuccess({
        code: coupon.code,
        title: reward?.title || couponOfferTitle(coupon),
      });
    } catch {
      showSuccessToast('Could not copy coupon', 'error');
    }
  };

  const submitManualCode = async () => {
    Keyboard.dismiss();
    const key = code.trim().toUpperCase();
    if (!key) {
      showSuccessToast('Enter a coupon code', 'error');
      return;
    }
    const found = displayRewards.find(r => r.coupon?.code === key);
    if (found?.coupon) {
      await claimCoupon(found.coupon, found);
      setCode('');
      return;
    }
    try {
      await Clipboard.setString(key);
      setAddOpen(false);
      setSuccess({ code: key, title: 'Coupon saved' });
      setCode('');
    } catch {
      showSuccessToast('Could not save code', 'error');
    }
  };

  const pasteCode = async () => {
    try {
      const text = await Clipboard.getString();
      const next = String(text || '').trim().toUpperCase();
      if (!next) {
        showSuccessToast('Clipboard is empty', 'error');
        return;
      }
      setCode(next);
    } catch {
      showSuccessToast('Could not paste', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />
      <AppHeader
        title="My Rewards"
        onLeftPress={() => navigation.goBack()}
      />

      {chips.length > 1 ? (
      <View style={styles.chipBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {chips.map(chip => {
            const on = chip.key === filterKey;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setFilterKey(chip.key)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={gridData}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            !gridData.length && styles.listEmpty,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(true);
              }}
              tintColor={Colors.primaryColor}
            />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="trophy"
              title="No rewards yet"
              subtitle="Referral coupons you earn will show up here."
              style={{ marginTop: 40 }}
            />
          }
          renderItem={({ item }) => {
            if (item.type === 'highlight') {
              return (
                <RewardHighlightCard
                  count={item.count}
                  onPress={() => setFilterKey('all')}
                />
              );
            }
            return (
              <RewardGridCard
                reward={item.reward}
                onPress={(coupon, reward) => setDetail({ coupon, reward })}
                onTermsPress={(coupon, reward) => setDetail({ coupon, reward })}
              />
            );
          }}
        />
      )}

      <Modal
        visible={addOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setAddOpen(false)}
          />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Coupon</Text>
            <Text style={styles.sheetSub}>
              Enter a code to save it for checkout
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                value={code}
                onChangeText={t => setCode(t.toUpperCase())}
                placeholder="Enter coupon code"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={styles.input}
              />
              <TouchableOpacity style={styles.pasteBtn} onPress={pasteCode}>
                <Text style={styles.pasteText}>Paste</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={submitManualCode}>
              <Text style={styles.primaryBtnText}>Save coupon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!detail}
        transparent
        animationType="slide"
        onRequestClose={() => setDetail(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setDetail(null)}
          />
          {detail ? (
            <View
              style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                {detail.reward?.title || couponOfferTitle(detail.coupon)}
              </Text>
              <Text style={styles.codeLine}>{detail.coupon.code}</Text>
              {!!detail.reward?.trigger && (
                <Text style={styles.detailLine}>
                  Trigger: {detail.reward.trigger}
                </Text>
              )}
              {!!(detail.reward?.description || detail.coupon.description) && (
                <Text style={styles.sheetSub}>
                  {detail.reward?.description || detail.coupon.description}
                </Text>
              )}
              <Text style={styles.detailLine}>
                {couponSavingsLabel(detail.coupon)}
              </Text>
              {!!couponMinNote(detail.coupon) && (
                <Text style={styles.warnLine}>{couponMinNote(detail.coupon)}</Text>
              )}
              {!!couponMaxNote(detail.coupon) && (
                <Text style={styles.detailLine}>
                  {couponMaxNote(detail.coupon)}
                </Text>
              )}
              <Text style={styles.detailLine}>
                {couponExpiryLabel(detail.coupon) || 'Limited period offer'}
              </Text>
              <Text style={styles.detailLine}>
                Applies to: {couponAppliesLabel(detail.coupon)}
              </Text>
              {detail.coupon.remaining_uses != null ? (
                <Text style={styles.detailLine}>
                  Remaining uses: {detail.coupon.remaining_uses}
                </Text>
              ) : null}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => claimCoupon(detail.coupon, detail.reward)}
              >
                <Text style={styles.primaryBtnText}>Apply / Copy code</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>

      <CouponAppliedModal
        visible={!!success}
        code={success?.code}
        title={success?.title || 'Coupon unlocked'}
        subtitle="Code copied. Paste and apply it at checkout."
        onClose={() => setSuccess(null)}
      />
    </SafeAreaView>
  );
};

export default RewardsScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SCREEN_THEME.screenBackground },
  headerSafe: { backgroundColor: SCREEN_THEME.headerBackground },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: SCREEN_THEME.headerBackground,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  addText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  chipBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEEB',
  },
  chips: {
    paddingHorizontal: REWARD_GRID.pad,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F3',
    marginRight: 8,
  },
  chipOn: {
    backgroundColor: Colors.primaryColor,
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  chipTextOn: {
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: REWARD_GRID.pad,
    paddingTop: 14,
  },
  listEmpty: {
    flexGrow: 1,
  },
  row: {
    gap: REWARD_GRID.gap,
    marginBottom: REWARD_GRID.gap,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DEDA',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sheetSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 18,
  },
  codeLine: {
    marginTop: 8,
    fontSize: 15,
    letterSpacing: 1,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  detailLine: {
    marginTop: 8,
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  warnLine: {
    marginTop: 6,
    fontSize: 12,
    color: '#B45309',
    fontFamily: Fonts.PoppinsMedium,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    backgroundColor: '#F8FAFC',
  },
  pasteBtn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  primaryBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
