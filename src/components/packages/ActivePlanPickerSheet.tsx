import React, { memo, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import type { MyPlan } from '../../services/PackageServices';
import {
  getConsultBenefit,
  getPlanConsultState,
  PlanConsultState,
  PlanEligibility,
  PLAN_GOLD,
} from './packageUi';
import { formatRupee } from '../../utils/currencyUtils';

const UNUSABLE_LABEL: Record<Exclude<PlanConsultState, 'usable'>, string> = {
  exhausted: 'Consultation already used',
  expired: 'Plan expired',
  no_consult: 'Consultation not included',
};

type RowStatus = { usable: boolean; loading: boolean; label: string };

type Props = {
  visible: boolean;
  plans: MyPlan[];
  /** Fee-quote package_funding per plan id; when present it decides selectability. */
  eligibility?: Record<string, PlanEligibility>;
  selectedId?: string | null;
  onSelect: (plan: MyPlan) => void;
  onPayNormally: () => void;
  onClose: () => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getRemainingLabel = (plan: MyPlan) => {
  const benefit = getConsultBenefit(plan);
  if (!benefit) return '';
  if (benefit.quantity_remaining == null) return 'Unlimited consultations';
  const total = benefit.quantity_total != null ? ` of ${benefit.quantity_total}` : '';
  return `${benefit.quantity_remaining}${total} consultation${benefit.quantity_remaining === 1 ? '' : 's'} left`;
};

/** "Which plan do you want to use?" sheet on Confirm Booking. */
const ActivePlanPickerSheet = ({
  visible,
  plans,
  eligibility,
  selectedId,
  onSelect,
  onPayNormally,
  onClose,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [pickedId, setPickedId] = useState<string | null>(selectedId ?? null);

  const getRowStatus = (plan: MyPlan): RowStatus => {
    const quote = eligibility?.[plan.id];
    if (quote) {
      if (quote.loading) {
        return { usable: false, loading: true, label: 'Checking plan for this doctor…' };
      }
      if (!quote.canFund) {
        return { usable: false, loading: false, label: quote.reason };
      }
      const left =
        quote.quantityRemaining != null
          ? `${quote.quantityRemaining} consultation${quote.quantityRemaining === 1 ? '' : 's'} left`
          : getRemainingLabel(plan);
      return { usable: true, loading: false, label: left };
    }
    const state = getPlanConsultState(plan);
    return state === 'usable'
      ? { usable: true, loading: false, label: getRemainingLabel(plan) }
      : { usable: false, loading: false, label: UNUSABLE_LABEL[state] };
  };

  const firstUsableId = plans.find(p => getRowStatus(p).usable)?.id ?? null;
  const hasUsable = firstUsableId != null;
  const checking = plans.some(p => getRowStatus(p).loading);

  useEffect(() => {
    if (visible) setPickedId(selectedId ?? firstUsableId);
  }, [visible, selectedId, firstUsableId]);

  const picked = plans.find(p => p.id === pickedId && getRowStatus(p).usable) ?? null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.handle} />

          <LinearGradient
            colors={['#0A4A3C', '#0D614E', '#178A6E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <TablerIcon name="star-filled" size={18} color={PLAN_GOLD} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Your active plans</Text>
              <Text style={styles.heroSub}>
                {checking && !hasUsable
                  ? 'Checking which of your plans can be used for this doctor…'
                  : hasUsable
                    ? 'No payment needed — this consultation is covered by your plan.'
                    : 'Your plans cannot be used for this consultation. You can continue with normal payment.'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <TablerIcon name="x" size={18} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.listTitle}>Which plan do you want to go with?</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {plans.map(plan => {
              const status = getRowStatus(plan);
              const usable = status.usable;
              const selected = usable && plan.id === pickedId;
              // const remaining = status.label;
               const remaining = 'Doctor is not eligible for this plan';
              const expires = formatDate(plan.expires_at);
              const payable = eligibility?.[plan.id]?.payable;
              const planPrice = Number(plan.paid_price || plan.original_price || 0);
              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.85}
                  disabled={!usable}
                  onPress={() => setPickedId(plan.id)}
                  style={[
                    styles.row,
                    selected && styles.rowSelected,
                    !usable && styles.rowDisabled,
                  ]}
                >
                  <View style={[styles.rowIcon, selected && styles.rowIconSelected]}>
                    <TablerIcon
                      name="stethoscope"
                      size={16}
                      color={selected ? '#FFFFFF' : Colors.primaryColor}
                    />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowName} numberOfLines={2}>
                      {plan.name}
                    </Text>
                    {/* {remaining ? ( */}
                      <Text
                        style={[
                          styles.rowRemaining,
                          !usable && (status.loading ? styles.rowRemainingLoading : styles.rowRemainingOff),
                        ]}
                        numberOfLines={2}
                      >
                        {/* {remaining} */}
                        {remaining}
                      </Text>
                    {/* ) : null} */}
                    {expires ? (
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        Valid till {expires}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.priceCol}>
                    {planPrice > 0 ? (
                      <Text style={styles.planPrice}>{formatRupee(planPrice)}</Text>
                    ) : null}
                    {usable && payable != null ? (
                      <Text style={styles.payNow}>Pay {formatRupee(payable)}</Text>
                    ) : null}
                    <View style={[styles.radio, selected && styles.radioOn]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={hasUsable ? !picked : checking}
            onPress={() => {
              if (!hasUsable) {
                onPayNormally();
                return;
              }
              if (picked) onSelect(picked);
            }}
            style={styles.primaryWrap}
          >
            <LinearGradient
              colors={(hasUsable ? picked : !checking) ? ['#0D614E', '#14937A'] : ['#9CB8AE', '#9CB8AE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <TablerIcon
                name={hasUsable ? 'circle-check' : 'credit-card'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.primaryText}>
                {hasUsable ? 'Use this plan' : checking ? 'Checking plans…' : 'Continue with payment'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {hasUsable ? (
            <TouchableOpacity activeOpacity={0.8} onPress={onPayNormally} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Pay normally instead</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.secondaryBtn} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default memo(ActivePlanPickerSheet);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '82%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 12,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  heroSub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.PoppinsMedium,
  },
  listTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E5EBE8',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  rowSelected: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FAF6',
  },
  rowDisabled: {
    opacity: 0.55,
    backgroundColor: '#F8FAFC',
  },
  rowRemainingOff: {
    color: '#B91C1C',
  },
  rowRemainingLoading: {
    color: '#64748B',
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  planPrice: {
    fontSize: 12.5,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  payNow: {
    fontSize: 10.5,
    color: '#15803D',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconSelected: {
    backgroundColor: Colors.primaryColor,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  rowRemaining: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  rowMeta: {
    marginTop: 1,
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: Colors.primaryColor,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryColor,
  },
  primaryWrap: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryBtn: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryText: {
    color: Colors.primaryColor,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
