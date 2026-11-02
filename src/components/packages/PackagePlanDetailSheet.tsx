import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import TablerIcon, { TablerIconName } from '../TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import type { PackagePlan } from '../../services/PackageServices';
import {
  PLAN_GOLD,
  getDiscountPercent,
  getPlanCtaLabel,
  getPlanDurationLabel,
  getPlanTheme,
  isCarePlan,
  toAmount,
} from './packageUi';

type Props = {
  plan: PackagePlan | null;
  processing?: boolean;
  /** User already has this package active → "Buy again". */
  owned?: boolean;
  onClose: () => void;
  onCta: (plan: PackagePlan) => void;
};

const humanize = (value: string | null | undefined) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ') : '';

const getBillingLabel = (plan: PackagePlan) => {
  if (!plan.billing_mode || plan.billing_mode === 'one_time') return 'One-time payment';
  const every =
    plan.billing_period &&
    `every ${plan.billing_interval && plan.billing_interval > 1 ? `${plan.billing_interval} ` : ''}${plan.billing_period}`;
  const cycles = plan.billing_cycle_count ? ` · ${plan.billing_cycle_count} cycles` : '';
  return `Autopay${every ? ` ${every}` : ''}${cycles}`;
};

/** Full plan details — every field from `packages/plans/`. */
export default function PackagePlanDetailSheet({
  plan,
  processing = false,
  owned = false,
  onClose,
  onCta,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!plan) return null;

  const theme = getPlanTheme(plan);
  const carePlan = isCarePlan(plan);
  const discount = getDiscountPercent(plan);
  const benefits = plan.benefits?.includes ?? [];
  const original = toAmount(plan.original_price);
  const selling = toAmount(plan.selling_price);
  const saving = original > selling ? original - selling : 0;

  const facts: { icon: TablerIconName; label: string; value: string }[] = [
    {
      icon: 'certificate',
      label: 'Plan type',
      value: plan.purchase_type === 'prepaid_package' ? 'Prepaid package' : 'Open plan',
    },
    {
      icon: 'calendar',
      label: 'Validity',
      value: plan.validity_days ? `${plan.validity_days} days` : getPlanDurationLabel(plan),
    },
    { icon: 'credit-card', label: 'Billing', value: getBillingLabel(plan) },
    {
      icon: 'users',
      label: 'Available for',
      value: plan.available_to_all_users ? 'All users' : 'Selected users',
    },
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.head}
          >
            <View style={styles.headRow}>
              {plan.image_url ? (
                <Image source={{ uri: plan.image_url }} style={styles.headIcon} />
              ) : (
                <View style={styles.headIcon}>
                  <TablerIcon name={theme.icon} size={20} color="#FFFFFF" />
                </View>
              )}
              <Text style={styles.category} numberOfLines={1}>
                {plan.category_name || humanize(plan.category_code)}
              </Text>
              {carePlan ? (
                <View style={styles.ribbon}>
                  <TablerIcon name="star-filled" size={10} color="#3B2A06" />
                  <Text style={styles.ribbonText}>CARE PLAN</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>{plan.name}</Text>
            <Text style={styles.headDuration}>{getPlanDurationLabel(plan)}</Text>
            <View style={styles.goldLine} />
          </LinearGradient>

          {plan.description ? <Text style={styles.desc}>{plan.description}</Text> : null}

          <View style={styles.facts}>
            {facts.map(fact => (
              <View key={fact.label} style={styles.fact}>
                <TablerIcon name={fact.icon} size={15} color={theme.accent} />
                <View style={styles.factText}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {benefits.length > 0 ? (
            <>
              <Text style={styles.section}>What's included ({benefits.length})</Text>
              {benefits.map((benefit, index) => (
                <View key={`${plan.id}-d-${index}`} style={styles.benefit}>
                  <View style={[styles.check, { backgroundColor: theme.tint }]}>
                    <TablerIcon name="check" size={12} color={theme.accent} strokeWidth={3} />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </>
          ) : null}

          <Text style={styles.section}>Price details</Text>
          <View style={styles.priceBox}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Plan price</Text>
              <RupeeAmount value={plan.original_price} style={styles.priceValue} />
            </View>
            {saving > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Discount ({discount}%)</Text>
                <RupeeAmount value={saving} prefix="- " style={[styles.priceValue, styles.green]} />
              </View>
            ) : null}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>You pay</Text>
              <RupeeAmount value={plan.selling_price} style={styles.totalValue} />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <RupeeAmount value={plan.selling_price} style={styles.footerAmount} decimals={false} />
            {saving > 0 ? (
              <Text style={styles.footerSave}>
                You save ₹{Math.round(saving).toLocaleString('en-IN')}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={processing}
            onPress={() => onCta(plan)}
            style={[styles.cta, { backgroundColor: theme.accent }]}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.ctaText}>{getPlanCtaLabel(plan, owned)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5DEDA',
    marginBottom: 12,
  },
  scroll: {
    paddingBottom: 8,
  },
  head: {
    borderRadius: 18,
    padding: 14,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    flex: 1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: PLAN_GOLD,
  },
  ribbonText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 9.5,
    color: '#3B2A06',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    marginTop: 10,
  },
  headDuration: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: PLAN_GOLD,
    marginTop: 2,
  },
  goldLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: PLAN_GOLD,
    opacity: 0.85,
  },
  desc: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5753',
    marginTop: 12,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EEF2F0',
    borderRadius: 14,
    paddingVertical: 6,
  },
  fact: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  factText: {
    flex: 1,
  },
  factLabel: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: '#7A8683',
  },
  factValue: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12.5,
    color: '#1F2A27',
  },
  section: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#1F2A27',
    marginTop: 18,
    marginBottom: 8,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 9,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    lineHeight: 19,
    color: '#34403C',
  },
  priceBox: {
    backgroundColor: '#F7FAF9',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12.5,
    color: '#4B5753',
  },
  priceValue: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: '#1F2A27',
  },
  green: {
    color: '#15803D',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E4ECE8',
    paddingTop: 8,
  },
  totalLabel: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13.5,
    color: '#1F2A27',
  },
  totalValue: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 15,
    color: '#1F2A27',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
    paddingTop: 12,
    marginTop: 4,
    gap: 12,
  },
  footerPrice: {
    flex: 1,
  },
  footerAmount: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 20,
    color: '#1F2A27',
  },
  footerSave: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11.5,
    color: '#15803D',
  },
  cta: {
    minWidth: 150,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  ctaText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
