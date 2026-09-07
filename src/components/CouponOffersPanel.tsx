import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  ViewStyle,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import CouponTicket from './CouponTicket';
import {
  couponSourceLabel,
  type Coupon,
} from '../utils/couponUtils';
import { showSuccessToast } from '../config/Key';

export type CouponFilterKey = string;

type Props = {
  coupons: Coupon[];
  loading?: boolean;
  appliedCode?: string | null;
  applyLabel?: string;
  showApplyBar?: boolean;
  initialCode?: string;
  /** When set, hide the opposite Orders/Consult chip — list is already scoped */
  checkoutScope?: 'product' | 'consultation' | 'all';
  filter?: CouponFilterKey;
  onFilterChange?: (key: CouponFilterKey) => void;
  onApply: (code: string) => void | Promise<void>;
  applying?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptySubtitle?: string;
  contentContainerStyle?: ViewStyle;
  notchColor?: string;
};

/**
 * Shared Flipkart-style coupons list used by checkout View all
 * and aligned with My Rewards filters.
 */
const CouponOffersPanel = ({
  coupons,
  loading,
  appliedCode,
  applyLabel = 'APPLY',
  showApplyBar = true,
  initialCode = '',
  checkoutScope,
  filter: controlledFilter,
  onFilterChange,
  onApply,
  applying,
  error,
  emptyTitle = 'No coupons available',
  emptySubtitle = 'You can still enter a code above if you have one.',
  contentContainerStyle,
  notchColor = '#F1F5F3',
}: Props) => {
  const [code, setCode] = useState(initialCode);
  const [localFilter, setLocalFilter] = useState<CouponFilterKey>('all');
  const filter = controlledFilter ?? localFilter;

  const chips = useMemo(() => {
    // Shared category chips — list is already scoped by checkout type
    const base: Array<{ key: string; label: string }> = [
      { key: 'all', label: 'All' },
      { key: 'private', label: 'For you' },
      { key: 'general', label: 'General' },
    ];

    if (checkoutScope === 'product') {
      // Order View all: order coupons + rewards
      base.push({ key: 'rewards', label: 'Rewards' });
    } else if (checkoutScope === 'consultation') {
      // Consult View all: consult coupons only — For you / General already in base
    } else {
      base.push(
        { key: 'source:referral', label: 'Referral' },
        { key: 'order', label: 'Orders' },
        { key: 'consultation', label: 'Consult' },
      );
    }

    const sources = Array.from(
      new Set(coupons.map(c => String(c.source || '')).filter(Boolean)),
    )
      .filter(
        source =>
          source !== 'referral' &&
          source !== 'reward' &&
          source !== 'loyalty',
      )
      .map(source => ({
        key: `source:${source}`,
        label: couponSourceLabel(source),
      }));
    const brands = Array.from(
      new Set(coupons.map(c => c.brand_id).filter(Boolean) as string[]),
    ).map(brand => ({
      key: `brand:${brand}`,
      label: 'Brand',
    }));
    return [...base, ...sources, ...brands];
  }, [checkoutScope, coupons]);

  const setFilter = (key: CouponFilterKey) => {
    if (onFilterChange) onFilterChange(key);
    else setLocalFilter(key);
  };

  const filtered = useMemo(() => {
    const q = code.trim().toUpperCase();
    return coupons.filter(item => {
      // Hard scope gate for checkout View all
      if (checkoutScope === 'product') {
        if (item.applies_to !== 'order' && item.applies_to !== 'both') {
          return false;
        }
      }
      if (checkoutScope === 'consultation') {
        if (
          item.applies_to !== 'consultation' &&
          item.applies_to !== 'both'
        ) {
          return false;
        }
      }

      if (filter === 'private' && item.visibility !== 'private') return false;
      if (filter === 'general' && item.visibility !== 'general') return false;
      if (
        filter === 'order' &&
        item.applies_to !== 'order' &&
        item.applies_to !== 'both'
      ) {
        return false;
      }
      if (
        filter === 'consultation' &&
        item.applies_to !== 'consultation' &&
        item.applies_to !== 'both'
      ) {
        return false;
      }
      if (filter === 'rewards') {
        const source = String(item.source || '').toLowerCase();
        if (
          source !== 'referral' &&
          source !== 'reward' &&
          source !== 'loyalty'
        ) {
          return false;
        }
      }
      if (filter.startsWith('source:')) {
        const source = filter.replace('source:', '');
        if (String(item.source) !== source) return false;
      }
      if (filter.startsWith('brand:')) {
        const brand = filter.replace('brand:', '');
        if (item.brand_id !== brand) return false;
      }
      if (!q) return true;
      return (
        item.code.includes(q) ||
        item.title.toUpperCase().includes(q) ||
        item.description.toUpperCase().includes(q)
      );
    });
  }, [code, coupons, filter, checkoutScope]);

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
      showSuccessToast('Could not paste code', 'error');
    }
  };

  const copyCode = async (value: string) => {
    try {
      await Clipboard.setString(value);
      showSuccessToast('Code copied', 'success');
    } catch {
      showSuccessToast('Could not copy code', 'error');
    }
  };

  const submit = async (raw?: string) => {
    Keyboard.dismiss();
    const next = String(raw ?? code).trim().toUpperCase();
    if (!next) {
      showSuccessToast('Enter a coupon code', 'error');
      return;
    }
    await onApply(next);
  };

  return (
    <View style={styles.root}>
      {showApplyBar ? (
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <TablerIcon name="receipt" size={18} color={Colors.primaryColor} />
            <TextInput
              value={code}
              onChangeText={text => setCode(text.toUpperCase())}
              placeholder="Enter coupon code"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={() => submit()}
            />
            {/* <TouchableOpacity style={styles.pasteBtn} onPress={pasteCode}>
              <Text style={styles.pasteText}>Paste</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => submit()}
              disabled={applying}
            >
              {applying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        {chips.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, filter === item.key && styles.chipOn]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[styles.chipText, filter === item.key && styles.chipTextOn]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>
        Available coupons{filtered.length ? ` (${filtered.length})` : ''}
      </Text>

      {loading ? (
        <ActivityIndicator
          color={Colors.primaryColor}
          style={{ marginTop: 28 }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map(item => (
            <CouponTicket
              key={item.id}
              coupon={item}
              applied={appliedCode === item.code}
              applyLabel={applyLabel}
              onApply={submit}
              onCopy={copyCode}
              notchColor={notchColor}
            />
          ))}
          {!filtered.length ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <TablerIcon name="receipt" size={28} color={Colors.primaryColor} />
              </View>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptySub}>{emptySubtitle}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

export default CouponOffersPanel;

const styles = StyleSheet.create({
  root: { flex: 1 },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    paddingVertical: 0,
  },
  pasteBtn: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
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
  applyBtn: {
    height: 36,
    minWidth: 64,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  error: {
    marginTop: 8,
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsMedium,
  },
  chipsScroll: { flexGrow: 0 },
  chips: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipOn: {
    backgroundColor: '#E8F3EF',
    borderColor: Colors.primaryColor,
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  chipTextOn: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  list: {
    gap: 12,
    paddingBottom: 28,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
});
