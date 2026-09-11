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
import { RupeeAmount } from '../utils/currencyUtils';
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
  const subtitleText = useMemo(() => item.short_description || '', [item.short_description]);
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
      {/* ── Full-width cover image ── */}
      <View style={styles.coverWrap}>
        <Image
          source={resolveDietImage(item)}
          style={styles.coverImage}
          resizeMode="cover"
        />
        {/* Dark gradient overlay so badges stay readable */}
        <LinearGradient
          colors={['rgba(0,0,0,0.28)', 'transparent']}
          style={styles.coverGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Top-left: Popular badge */}
        {isPopular && (
          <View style={styles.popularOverlay}>
            <TablerIcon name="flame" size={12} color="#EA580C" />
            <Text style={styles.popularOverlayText}>Popular</Text>
          </View>
        )}

        {/* Top-right: Status pill */}
        <View style={styles.statusOverlay}>
          <PlanStatusPill item={item} />
        </View>

        {/* Bottom-right: PRO badge */}
        {!isFree && (
          <LinearGradient
            colors={['#C9A227', '#E8C77B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proBadge}
          >
            <TablerIcon name="star" size={9} color="#5E4200" />
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>
        )}
      </View>

      {/* ── Card body ── */}
      <View style={styles.cardBody}>
        <Text style={styles.planTitle} numberOfLines={2}>
          {item.name}
        </Text>

        {!!subtitleText && (
          <Text style={styles.planSubtitle} numberOfLines={1}>
            {subtitleText}
          </Text>
        )}

        {!!prakriti && (
          <View style={styles.prakritiBadge}>
            <Text style={styles.prakritiBadgeText} numberOfLines={1}>
              {prakriti}
            </Text>
          </View>
        )}

        {/* Footer row */}
        <View style={styles.footerRow}>
          <View style={styles.footerMeta}>
            {!!item.total_days && (
              <View style={styles.footerItem}>
                <TablerIcon name="calendar" size={13} color="#94A3B8" />
                <Text style={styles.footerText}>
                  {item.total_days}{' '}
                  {Number(item.total_days) === 1 ? 'Day' : 'Days'}
                </Text>
              </View>
            )}
            <View style={styles.footerItem}>
              <TablerIcon name="receipt" size={13} color="#94A3B8" />
              {isFree ? (
                <Text style={styles.footerText}>Free</Text>
              ) : (
                <RupeeAmount value={item.price} style={styles.footerText} />
              )}
            </View>
            {!!ratingText && (
              <View style={styles.footerItem}>
                <TablerIcon name="star" size={13} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.footerRatingText}>{ratingText}</Text>
              </View>
            )}
          </View>
          <View style={styles.chevronBtn}>
            <TablerIcon name="chevron-right" size={16} color="#64748B" />
          </View>
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
    a?.popularity_count === b?.popularity_count &&
    a?.avg_rating === b?.avg_rating
  );
});

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },

  // Cover image — fills top edge-to-edge, no white gap
  coverWrap: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },

  // Badges overlaid on the cover image
  popularOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,247,237,0.92)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  popularOverlayText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#EA580C',
  },
  statusOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  proBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#5E4200',
    letterSpacing: 0.4,
  },

  // Content below the image
  cardBody: {
    padding: SPACING.md,
    paddingTop: SPACING.sm + 2,
  },
  planTitle: {
    fontSize: TYPO.md,
    lineHeight: 21,
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
  prakritiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.xs + 2,
  },
  prakritiBadgeText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#047857',
    textTransform: 'capitalize',
  },

  // Footer row
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm + 2,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F6',
  },
  footerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    minWidth: 0,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  footerRatingText: {
    fontSize: TYPO.caption,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#B45309',
  },
  chevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Status pills
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(230,244,240,0.92)',
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
    backgroundColor: 'rgba(254,243,199,0.92)',
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
    backgroundColor: 'rgba(238,242,255,0.92)',
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
    backgroundColor: 'rgba(254,242,242,0.92)',
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
    backgroundColor: 'rgba(241,245,249,0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notStartedPillText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
