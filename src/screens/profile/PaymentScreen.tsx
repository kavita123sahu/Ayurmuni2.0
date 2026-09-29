// screens/PaymentsScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import Header from '../../components/Header';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { formatRupee } from '../../utils/currencyUtils';
import {
  PaymentHistoryEntry,
  PaymentHistoryFilters,
  formatEventType,
  getEntryTitle,
  useCustomerPaymentHistory,
} from '../../hooks/useCustomerPaymentHistory';

type SourceFilter = 'all' | 'consultation' | 'order';
type EntryFilter = 'all' | 'debit' | 'credit';
type DatePreset =
  | 'all'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

const SOURCE_TABS: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'consultation', label: 'Consultations' },
  { key: 'order', label: 'Orders' },
];

const ENTRY_CHIPS: { key: EntryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'debit', label: 'Paid' },
  { key: 'credit', label: 'Refunds' },
];

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'last90', label: 'Last 90 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'custom', label: 'Custom range' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const toApiDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const toShortDate = (date: Date) =>
  `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

const resolvePresetRange = (
  preset: DatePreset,
  custom: { from: Date | null; to: Date | null },
): { from: Date | null; to: Date | null } => {
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };
  switch (preset) {
    case 'last7':
      return { from: daysAgo(6), to: today };
    case 'last30':
      return { from: daysAgo(29), to: today };
    case 'last90':
      return { from: daysAgo(89), to: today };
    case 'thisMonth':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    case 'lastMonth':
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      };
    case 'custom':
      return custom;
    default:
      return { from: null, to: null };
  }
};

const formatEntryTime = (at: string) => {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return '';
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${hours}:${minutes} ${meridiem}`;
};

const monthKey = (at: string) => {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return 'Earlier';
  return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
};

const entryIcon = (item: PaymentHistoryEntry): TablerIconName => {
  if (item.entry_type === 'credit') return 'refund';
  return item.type === 'order' ? 'shopping-cart' : 'stethoscope';
};

const statusTone = (status: string) => {
  if (status === 'success') return '#16A34A';
  if (status === 'pending') return '#D97706';
  return '#DC2626';
};

const PaymentsScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<SourceFilter>('all');
  const [entry, setEntry] = useState<EntryFilter>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customRange, setCustomRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const [showDateSheet, setShowDateSheet] = useState(false);
  const [draftPreset, setDraftPreset] = useState<DatePreset>('all');
  const [draftRange, setDraftRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [pickerFor, setPickerFor] = useState<'from' | 'to' | null>(null);

  const range = useMemo(
    () => resolvePresetRange(datePreset, customRange),
    [datePreset, customRange],
  );

  const filters = useMemo<PaymentHistoryFilters>(
    () => ({
      type: source === 'all' ? null : source,
      entry_type: entry === 'all' ? null : entry,
      date_from: range.from ? toApiDate(range.from) : null,
      date_to: range.to ? toApiDate(range.to) : null,
    }),
    [source, entry, range],
  );

  const { items, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh } =
    useCustomerPaymentHistory(filters);

  const sections = useMemo(() => {
    const groups: { title: string; data: PaymentHistoryEntry[] }[] = [];
    items.forEach(item => {
      const key = monthKey(item.created_at);
      const last = groups[groups.length - 1];
      if (last && last.title === key) last.data.push(item);
      else groups.push({ title: key, data: [item] });
    });
    return groups;
  }, [items]);

  const dateChipLabel = useMemo(() => {
    if (datePreset === 'all') return 'Date';
    if (datePreset === 'custom') {
      if (range.from && range.to) {
        return `${toShortDate(range.from)} – ${toShortDate(range.to)}`;
      }
      return range.from ? `From ${toShortDate(range.from)}` : 'Custom range';
    }
    return DATE_PRESETS.find(p => p.key === datePreset)?.label || 'Date';
  }, [datePreset, range]);

  const activeFilterCount =
    (source !== 'all' ? 1 : 0) +
    (entry !== 'all' ? 1 : 0) +
    (datePreset !== 'all' ? 1 : 0);

  const openDateSheet = useCallback(() => {
    setDraftPreset(datePreset);
    setDraftRange(customRange);
    setShowDateSheet(true);
  }, [datePreset, customRange]);

  const applyDateSheet = useCallback(() => {
    if (draftPreset === 'custom' && !draftRange.from && !draftRange.to) {
      setDatePreset('all');
    } else {
      setDatePreset(draftPreset);
      if (draftPreset === 'custom') setCustomRange(draftRange);
    }
    setShowDateSheet(false);
  }, [draftPreset, draftRange]);

  const clearAll = useCallback(() => {
    setSource('all');
    setEntry('all');
    setDatePreset('all');
    setCustomRange({ from: null, to: null });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PaymentHistoryEntry }) => {
      const isCredit = item.entry_type === 'credit';
      const time = formatEntryTime(item.created_at);
      return (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.8}
          onPress={() =>
            props.navigation.navigate('TransactionDetailsScreen', {
              transaction: item,
            })
          }
        >
          <View style={[styles.rowIcon, isCredit && styles.rowIconCredit]}>
            <TablerIcon
              name={entryIcon(item)}
              size={18}
              color={isCredit ? '#15803D' : Colors.primaryColor}
            />
          </View>

          <View style={styles.rowBody}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {getEntryTitle(item)}
            </Text>
            <Text
              style={[styles.rowStatus, { color: statusTone(item.status) }]}
              numberOfLines={1}
            >
              {formatEventType(item.event_type)}
            </Text>
            <Text style={styles.rowMeta} numberOfLines={1}>
              {[time, item.patient?.name].filter(Boolean).join(' · ')}
            </Text>
          </View>

          <View style={styles.rowRight}>
            <Text style={[styles.rowAmount, isCredit && styles.rowAmountCredit]}>
              {isCredit ? '+ ' : ''}
              {formatRupee(item.amount)}
            </Text>
            <Text style={styles.rowDirection}>
              {isCredit ? 'Credited' : 'Debited'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [props.navigation],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <Text style={styles.sectionTitle}>{section.title}</Text>
    ),
    [],
  );

  const onPickerChange = (event: any, date?: Date) => {
    const target = pickerFor;
    setPickerFor(null);
    if (event?.type !== 'set' || !date || !target) return;
    setDraftRange(prev => {
      const next = { ...prev, [target]: date };
      if (next.from && next.to && next.from > next.to) {
        if (target === 'from') next.to = date;
        else next.from = date;
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header
        title="Payments"
        subtitle="Manage Your Transaction"
        onBack={() => props.navigation.goBack()}
      />

      <View style={styles.tabs}>
        {SOURCE_TABS.map(tab => {
          const active = source === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.85}
              onPress={() => setSource(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        <TouchableOpacity
          style={[styles.chip, datePreset !== 'all' && styles.chipActive]}
          activeOpacity={0.85}
          onPress={openDateSheet}
        >
          <TablerIcon
            name="calendar"
            size={13}
            color={datePreset !== 'all' ? Colors.primaryColor : '#475569'}
          />
          <Text
            style={[styles.chipText, datePreset !== 'all' && styles.chipTextActive]}
            numberOfLines={1}
          >
            {dateChipLabel}
          </Text>
          <TablerIcon
            name="chevron-down"
            size={13}
            color={datePreset !== 'all' ? Colors.primaryColor : '#475569'}
          />
        </TouchableOpacity>

        {ENTRY_CHIPS.map(chip => {
          const active = entry === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.85}
              onPress={() => setEntry(chip.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {activeFilterCount > 0 ? (
          <TouchableOpacity
            style={styles.clearChip}
            activeOpacity={0.85}
            onPress={clearAll}
          >
            <TablerIcon name="x" size={12} color="#DC2626" />
            <Text style={styles.clearChipText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore && !loading) loadMore();
        }}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <TablerIcon name="receipt" size={26} color={Colors.primaryColor} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilterCount > 0 ? 'No matching transactions' : 'No transactions yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {error ||
                  (activeFilterCount > 0
                    ? 'Try changing or clearing the filters.'
                    : 'Your consultation and order payments will appear here.')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            </View>
          ) : null
        }
      />

      <Modal
        visible={showDateSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateSheet(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowDateSheet(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            onPress={() => {}}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter by date</Text>

            <View style={styles.presetWrap}>
              {DATE_PRESETS.map(preset => {
                const active = draftPreset === preset.key;
                return (
                  <TouchableOpacity
                    key={preset.key}
                    style={[styles.presetChip, active && styles.chipActive]}
                    activeOpacity={0.85}
                    onPress={() => setDraftPreset(preset.key)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {draftPreset === 'custom' ? (
              <View style={styles.rangeRow}>
                {(['from', 'to'] as const).map(key => (
                  <TouchableOpacity
                    key={key}
                    style={styles.rangeBox}
                    activeOpacity={0.85}
                    onPress={() => setPickerFor(key)}
                  >
                    <Text style={styles.rangeLabel}>{key === 'from' ? 'From' : 'To'}</Text>
                    <View style={styles.rangeValueRow}>
                      <TablerIcon name="calendar" size={14} color={Colors.primaryColor} />
                      <Text style={styles.rangeValue}>
                        {draftRange[key] ? toShortDate(draftRange[key] as Date) : 'Select'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetSecondary}
                activeOpacity={0.85}
                onPress={() => {
                  setDraftPreset('all');
                  setDraftRange({ from: null, to: null });
                }}
              >
                <Text style={styles.sheetSecondaryText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetPrimary}
                activeOpacity={0.85}
                onPress={applyDateSheet}
              >
                <Text style={styles.sheetPrimaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>

        {pickerFor ? (
          <DateTimePicker
            value={draftRange[pickerFor] || new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            minimumDate={pickerFor === 'to' && draftRange.from ? draftRange.from : undefined}
            onChange={onPickerChange}
          />
        ) : null}
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  tabTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  chipScroll: {
    flexGrow: 0,
    marginTop: 10,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#EAF8F4',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  chipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FEF2F2',
  },
  clearChipText: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    backgroundColor: '#FFFFFF',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconCredit: {
    backgroundColor: '#DCFCE7',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  rowTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  rowMeta: {
    marginTop: 1,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  rowStatus: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  rowAmount: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsBold,
    includeFontPadding: false,
  },
  rowAmountCredit: {
    color: '#15803D',
  },
  rowDirection: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  loaderWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 40,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 12,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  rangeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rangeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  rangeValueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  sheetSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  sheetSecondaryText: {
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sheetPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
  },
  sheetPrimaryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
