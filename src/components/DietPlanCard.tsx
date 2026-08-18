import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TablerIcon from './TablerIcon';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { formatRupee } from '../utils/currencyUtils';
import {
  getDietListStatus,
  getDietRepeatCount,
  getDietRunLabel,
  formatDietPlanRatingBadgeText,
  resolveDietImage,
} from '../utils/dietPlanUtils';
import { RADIUS, SPACING, TYPO } from '../constants/responsive';

type Props = {
  item: any;
  onPress: (item: any) => void;
};

const PlanStatusPill = memo(({ item }: { item: any }) => {
  const cardStatus = getDietListStatus(item);

  if (cardStatus === 'active') {
    return (
      <View style={styles.activePill}>
        <View style={styles.activePillDot} />
        <Text style={styles.activePillText}>Active</Text>
      </View>
    );
  }
  if (cardStatus === 'paused') {
    return (
      <View style={styles.resumePill}>
        <Text style={styles.resumePillText}>Paused</Text>
      </View>
    );
  }
  if (cardStatus === 'completed') {
    return (
      <View style={styles.completedPill}>
        <Text style={styles.completedPillText} numberOfLines={1}>
          {getDietRepeatCount(item) > 0
            ? `Done · ${getDietRunLabel(item)}`
            : 'Completed'}
        </Text>
      </View>
    );
  }
  if (cardStatus === 'stopped') {
    return (
      <View style={styles.stoppedPill}>
        <Text style={styles.stoppedPillText}>Stopped</Text>
      </View>
    );
  }
  return (
    <View style={styles.notStartedPill}>
      <Text style={styles.notStartedPillText}>Not started</Text>
    </View>
  );
});

const DietPlanCard = ({ item, onPress }: Props) => {
  const diseases = useMemo(
    () =>
      item.health_diseases?.map((d: any) => d.name).filter(Boolean).join(', ') ||
      '',
    [item.health_diseases],
  );
  const isFree = item.is_paid === false || Number(item.price) === 0;
  const prakriti = String(item?.prakriti || '').trim();
  const ratingText = formatDietPlanRatingBadgeText(item);
  const isPopular = Number(item?.popularity_count) >= 3;

  return (
    <TouchableOpacity
      style={styles.planCard}
      activeOpacity={0.88}
      onPress={() => onPress(item)}
    >
      <View style={styles.planCardHeader}>
        {isPopular ? (
          <View style={styles.planPopularBadge}>
            <TablerIcon name="flame" size={12} color="#EA580C" />
            <Text style={styles.planPopularText}>Popular</Text>
          </View>
        ) : (
          <View />
        )}
        <View style={styles.planStatusSlot}>
          <PlanStatusPill item={item} />
        </View>
      </View>

      <View style={styles.planCardMain}>
        <View style={styles.planThumbWrap}>
          <Image source={resolveDietImage(item)} style={styles.planThumb} />
          {!isFree && (
            <LinearGradient
              colors={['#C9A227', '#E8C77B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planPremiumBadge}
            >
              <TablerIcon name="star" size={9} color="#5E4200" />
              <Text style={styles.planPremiumBadgeText}>PRO</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.planBody}>
          <Text style={styles.planTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {!!diseases && (
            <Text style={styles.planSubtitle} numberOfLines={1}>
              {diseases}
            </Text>
          )}
          {!!prakriti && (
            <View style={styles.planPrakritiBadge}>
              <Text style={styles.planPrakritiBadgeText} numberOfLines={1}>
                {prakriti}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.planCardFooter}>
        <View style={styles.planFooterMeta}>
          {!!item.total_days && (
            <View style={styles.planFooterItem}>
              <TablerIcon name="calendar" size={14} color="#94A3B8" />
              <Text style={styles.planFooterText}>
                {item.total_days}{' '}
                {Number(item.total_days) === 1 ? 'Day' : 'Days'}
              </Text>
            </View>
          )}
          <View style={styles.planFooterItem}>
            <TablerIcon name="receipt" size={14} color="#94A3B8" />
            <Text style={styles.planFooterText}>
              {isFree ? 'Free Plan' : formatRupee(item.price)}
            </Text>
          </View>
          {!!ratingText && (
            <View style={styles.planFooterItem}>
              <TablerIcon name="star" size={14} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.planFooterRatingText}>{ratingText}</Text>
            </View>
          )}
        </View>
        <View style={styles.planChevron}>
          <TablerIcon name="chevron-right" size={16} color="#64748B" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(DietPlanCard, (prev, next) => {
  const a = prev.item;
  const b = next.item;
  return (
    prev.onPress === next.onPress &&
    a?.id === b?.id &&
    a?.name === b?.name &&
    a?.patient_assignment_status === b?.patient_assignment_status &&
    a?.patient_diet_plan_id === b?.patient_diet_plan_id &&
    a?.repeat_count === b?.repeat_count &&
    a?.price === b?.price &&
    a?.popularity_count === b?.popularity_count
  );
});

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    minHeight: 22,
  },
  planPopularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  planPopularText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#EA580C',
  },
  planCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F6',
  },
  planFooterMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    minWidth: 0,
  },
  planFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planFooterText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  planFooterRatingText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },
  planThumbWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  planThumb: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.cardBackground,
  },
  planPremiumBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  planPremiumBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#5E4200',
    letterSpacing: 0.4,
  },
  planBody: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  planTitle: {
    fontSize: TYPO.md,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  planSubtitle: {
    fontSize: TYPO.sm,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 3,
  },
  planStatusSlot: {
    flexShrink: 0,
    marginLeft: SPACING.sm,
  },
  planPrakritiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.xs + 2,
  },
  planPrakritiBadgeText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#047857',
    textTransform: 'capitalize',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryColor,
  },
  activePillText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  resumePill: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resumePillText: {
    fontSize: 10,
    color: '#92400E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  completedPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedPillText: {
    fontSize: 10,
    color: '#4338CA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stoppedPill: {
    backgroundColor: '#FEF2F2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stoppedPillText: {
    fontSize: 10,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  notStartedPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notStartedPillText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  planChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});
