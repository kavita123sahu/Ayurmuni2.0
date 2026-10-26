import React, { memo } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import type { PackagePlan } from '../../services/PackageServices';
import {
  getDiscountPercent,
  getPlanCtaLabel,
  getPlanDurationLabel,
  getPlanTheme,
  isCarePlan,
  toAmount,
} from './packageUi';

type Props = {
  plan: PackagePlan;
  onPress: (plan: PackagePlan) => void;
  onPressCta: (plan: PackagePlan) => void;
  /** `rail` = fixed width horizontal card, `full` = list card on Packages screen */
  variant?: 'rail' | 'full';
  width?: number;
  processing?: boolean;
  /** User already has this package active → "Buy again". */
  owned?: boolean;
};

const PackagePlanCard = ({
  plan,
  onPress,
  onPressCta,
  variant = 'full',
  width,
  processing = false,
  owned = false,
}: Props) => {
  const theme = getPlanTheme(plan);
  const discount = getDiscountPercent(plan);
  const carePlan = isCarePlan(plan);
  const benefits = plan.benefits?.includes ?? [];
  const maxBenefits = variant === 'rail' ? 3 : 5;
  const shownBenefits = benefits.slice(0, maxBenefits);
  const extraBenefits = benefits.length - shownBenefits.length;
  const showOriginal = toAmount(plan.original_price) > toAmount(plan.selling_price);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(plan)}
      style={[
        styles.card,
        variant === 'rail' && styles.railCard,
        width ? { width } : null,
        carePlan && { borderColor: theme.soft },
      ]}
    >
      <View style={[styles.top, { backgroundColor: theme.tint }]}>
        <View style={styles.topRow}>
          <View style={[styles.categoryChip, { backgroundColor: '#FFFFFF' }]}>
            <TablerIcon name={theme.icon} size={12} color={theme.accent} />
            <Text style={[styles.categoryText, { color: theme.accent }]} numberOfLines={1}>
              {plan.category_name || 'Plan'}
            </Text>
          </View>
          {carePlan ? (
            <View style={[styles.ribbon, { backgroundColor: theme.accent }]}>
              <TablerIcon name="star-filled" size={10} color="#FFFFFF" />
              <Text style={styles.ribbonText}>CARE PLAN</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.name} numberOfLines={2}>
              {plan.name}
            </Text>
            <View style={styles.durationRow}>
              <TablerIcon name="calendar" size={12} color={theme.accent} />
              <Text style={[styles.duration, { color: theme.accent }]} numberOfLines={1}>
                {getPlanDurationLabel(plan)}
              </Text>
            </View>
          </View>
          {plan.image_url ? (
            <Image source={{ uri: plan.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.iconBubble, { backgroundColor: theme.soft }]}>
              <TablerIcon name={theme.icon} size={22} color={theme.accent} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        {plan.description ? (
          <Text style={styles.description} numberOfLines={variant === 'rail' ? 2 : 3}>
            {plan.description}
          </Text>
        ) : null}

        {shownBenefits.length > 0 ? (
          <View style={styles.benefits}>
            {shownBenefits.map((benefit, index) => (
              <View key={`${plan.id}-b-${index}`} style={styles.benefitRow}>
                <View style={[styles.checkDot, { backgroundColor: theme.tint }]}>
                  <TablerIcon name="check" size={10} color={theme.accent} strokeWidth={3} />
                </View>
                <Text style={styles.benefitText} numberOfLines={1}>
                  {benefit}
                </Text>
              </View>
            ))}
            {extraBenefits > 0 ? (
              <Text style={[styles.moreText, { color: theme.accent }]}>
                +{extraBenefits} more benefit{extraBenefits > 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.spacer} />

        <View style={styles.priceRow}>
          <RupeeAmount value={plan.selling_price} style={styles.price} decimals={false} />
          {showOriginal ? (
            <RupeeAmount
              value={plan.original_price}
              style={styles.original}
              decimals={false}
            />
          ) : null}
          {discount > 0 ? (
            <View style={styles.discount}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={processing}
          onPress={() => onPressCta(plan)}
          style={[
            styles.cta,
            carePlan
              ? { backgroundColor: theme.accent }
              : { backgroundColor: '#FFFFFF', borderWidth: 1.2, borderColor: theme.accent },
          ]}
        >
          {processing ? (
            <ActivityIndicator size="small" color={carePlan ? '#FFFFFF' : theme.accent} />
          ) : (
            <>
              <Text style={[styles.ctaText, { color: carePlan ? '#FFFFFF' : theme.accent }]}>
                {getPlanCtaLabel(plan, owned)}
              </Text>
              <TablerIcon
                name="arrow-right"
                size={14}
                color={carePlan ? '#FFFFFF' : theme.accent}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default memo(PackagePlanCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EEEA',
    overflow: 'hidden',
    shadowColor: '#0D614E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  railCard: {
    height: 318,
  },
  top: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    maxWidth: '60%',
  },
  categoryText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10.5,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  ribbonText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: '#1F2A27',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  duration: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
  },
  image: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  description: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#5F6B67',
  },
  benefits: {
    marginTop: 10,
    gap: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11.5,
    color: '#34403C',
  },
  moreText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    marginLeft: 23,
  },
  spacer: {
    flex: 1,
    minHeight: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  price: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 18,
    color: '#1F2A27',
  },
  original: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    color: '#8A9591',
    textDecorationLine: 'line-through',
  },
  discount: {
    backgroundColor: '#E7F7EE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
    color: '#15803D',
  },
  cta: {
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
  },
});
