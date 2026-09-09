import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import {
  collectReviewImageUrls,
  getAverageRating,
  isReviewVideoUrl,
  normalizeReviewsForDisplay,
} from '../utils/reviewUtils';
import TablerIcon from './TablerIcon';

const StarRow = ({
  rating,
  size = 12,
}: {
  rating: number;
  size?: number;
}) => {
  const value = Math.round(Number(rating) || 0);
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <TablerIcon
          key={i}
          name={i <= value ? 'star-filled' : 'star'}
          size={size}
          color={i <= value ? '#F59E0B' : '#E2E8F0'}
        />
      ))}
    </View>
  );
};

const ratingTone = (rating: number) => {
  if (rating >= 4) return { bg: '#15803D', track: '#86EFAC' };
  if (rating >= 3) return { bg: '#D97706', track: '#FCD34D' };
  return { bg: '#DC2626', track: '#FCA5A5' };
};

const formatReviewDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ReviewSection = ({
  reviews = [],
  navigation,
  entityType,
  doctorId,
  variantId,
  title = 'Ratings & reviews',
}: {
  reviews?: any[];
  navigation: any;
  entityType?: 'doctor' | 'product';
  doctorId?: string;
  variantId?: string;
  title?: string;
}) => {
  const normalizedReviews = useMemo(
    () => normalizeReviewsForDisplay(reviews),
    [reviews],
  );
  const visibleReviews = normalizedReviews?.slice(0, 3);
  const isProduct = entityType === 'product';

  const getInitials = (name: string) =>
    name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.slice(0, 2)
      ?.toUpperCase() || 'U';

  const ratingData = useMemo(() => {
    const total = reviews?.length || 0;
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews?.forEach((r: any) => {
      const rating = Math.round(Number(r.rating));
      if (rating >= 1 && rating <= 5) {
        counts[rating] += 1;
      }
    });

    const breakdown = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: counts[star],
      percent: total ? Math.round((counts[star] / total) * 100) : 0,
    }));

    return {
      average: getAverageRating(reviews),
      totalReviews: total,
      breakdown,
    };
  }, [reviews]);

  const MAX_VISIBLE_IMAGES = 5;
  const allImages = useMemo(
    () => collectReviewImageUrls(normalizedReviews),
    [normalizedReviews],
  );

  const openAll = () =>
    navigation.navigate('ReviewPage', {
      reviews: normalizedReviews,
      entityType,
      doctorId,
      variantId,
    });

  const emptyCopy = isProduct
    ? 'No reviews yet for this product'
    : 'No reviews yet';

  return (
    <View>
      <TouchableOpacity style={styles.reviewHeader} onPress={openAll} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {ratingData.totalReviews > 0 ? (
            <Text style={styles.headerSub}>
              {ratingData.totalReviews}{' '}
              {ratingData.totalReviews === 1 ? 'rating' : 'ratings'}
            </Text>
          ) : null}
        </View>
        {ratingData.totalReviews > 0 ? (
          <View style={styles.viewAllWrap}>
            <Text style={styles.viewAll}>View all</Text>
            <TablerIcon name="chevron-right" size={14} color={Colors.primaryColor} />
          </View>
        ) : null}
      </TouchableOpacity>

      {ratingData.totalReviews > 0 ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View
              style={[
                styles.scorePill,
                { backgroundColor: ratingTone(ratingData.average).bg },
              ]}
            >
              <Text style={styles.scoreText}>
                {ratingData.average.toFixed(1)}
              </Text>
              <TablerIcon name="star-filled" size={12} color="#FFFFFF" />
            </View>
            <StarRow rating={ratingData.average} size={13} />
            <Text style={styles.totalReviews}>
              {ratingData.totalReviews.toLocaleString()} verified{' '}
              {isProduct ? 'buyers' : 'patients'}
            </Text>
          </View>

          <View style={styles.bars}>
            {ratingData.breakdown.map(row => (
              <View key={row.star} style={styles.barRow}>
                <Text style={styles.barLabel}>{row.star}</Text>
                <TablerIcon name="star-filled" size={8} color="#F59E0B" />
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${row.percent}%`,
                        backgroundColor:
                          row.star >= 4
                            ? '#16A34A'
                            : row.star === 3
                              ? '#F59E0B'
                              : '#F97316',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <TablerIcon name="star" size={18} color={Colors.primaryColor} />
          </View>
          <Text style={styles.emptyTitle}>{emptyCopy}</Text>
          <Text style={styles.emptySub}>
            {isProduct
              ? 'Ratings from buyers will show here'
              : 'Ratings from patients will show here'}
          </Text>
        </View>
      )}

      {allImages.length > 0 ? (
        <View>
          <Text style={styles.photosLabel}>
            {isProduct ? 'Customer photos' : 'Patient photos'}
          </Text>
          <View style={styles.imageRow}>
            {allImages.slice(0, MAX_VISIBLE_IMAGES).map((item, index) => {
              const remaining = allImages.length - MAX_VISIBLE_IMAGES;
              const isLastVisible =
                index === MAX_VISIBLE_IMAGES - 1 && remaining > 0;

              return (
                <TouchableOpacity
                  key={`${item}-${index}`}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ReviewGalleryScreen', {
                      images: allImages,
                      selectedIndex: index,
                    })
                  }
                  style={styles.imageWrapper}
                >
                  <Image source={{ uri: item }} style={styles.reviewImage} />
                  {isReviewVideoUrl(item) ? (
                    <View style={styles.videoBadge}>
                      <TablerIcon name="video" size={11} color="#FFFFFF" />
                    </View>
                  ) : null}
                  {isLastVisible ? (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>+{remaining}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      {visibleReviews?.map((item, index) => {
        const rating = Number(item?.rating) || 0;
        const dateLabel = formatReviewDate(item?.created_at);
        return (
          <View
            key={item.id || `rev-${index}`}
            style={[
              styles.reviewCard,
              index === visibleReviews.length - 1 && styles.reviewCardLast,
            ]}
          >
            <View style={styles.reviewTop}>
              <View style={styles.avatar}>
                {item?.reviewer_profile_image ? (
                  <Image
                    source={{ uri: item.reviewer_profile_image }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {getInitials(item?.reviewer_name || item?.patient_name || '')}
                  </Text>
                )}
              </View>

              <View style={styles.reviewMeta}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item?.reviewer_name || item?.patient_name || 'Customer'}
                  </Text>
                  <View
                    style={[
                      styles.miniRating,
                      { backgroundColor: ratingTone(rating).bg },
                    ]}
                  >
                    <Text style={styles.miniRatingText}>{rating}</Text>
                    <TablerIcon name="star-filled" size={8} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.metaLine}>
                  <Text style={styles.verified}>
                    {isProduct ? 'Certified buyer' : 'Verified'}
                  </Text>
                  {!!dateLabel && (
                    <Text style={styles.reviewDate}> · {dateLabel}</Text>
                  )}
                </View>
              </View>
            </View>

            {!!item?.review?.trim?.() ? (
              <Text style={styles.reviewText} numberOfLines={3}>
                {item.review}
              </Text>
            ) : null}

            {!!item?.image_urls?.length && (
              <View style={styles.cardImageRow}>
                {item.image_urls.slice(0, 4).map((uri: string, idx: number) => (
                  <TouchableOpacity
                    key={`${item.id}-${idx}`}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('ReviewGalleryScreen', {
                        images: item.image_urls,
                        selectedIndex: idx,
                      })
                    }
                  >
                    <Image source={{ uri }} style={styles.cardImage} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!!item?.doctor_reply?.trim?.() && (
              <View style={styles.doctorReplyBox}>
                <Text style={styles.doctorReplyLabel}>Doctor replied</Text>
                <Text style={styles.doctorReplyText}>{item.doctor_reply}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    includeFontPadding: false,
  },
  headerSub: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  viewAllWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAll: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEF2F0',
  },
  summaryLeft: {
    width: 92,
    alignItems: 'flex-start',
    gap: 4,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  totalReviews: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
    lineHeight: 14,
  },
  bars: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barLabel: {
    width: 8,
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#475569',
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barCount: {
    width: 16,
    fontSize: 9,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
    textAlign: 'right',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F0',
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  emptySub: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  photosLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  imageRow: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 8,
  },
  reviewImage: {
    width: 56,
    height: 56,
    backgroundColor: '#EAF8F4',
    borderRadius: 10,
  },
  videoBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  reviewCard: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F0',
  },
  reviewCardLast: {
    paddingBottom: 0,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF8F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniRatingText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  verified: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#16A34A',
  },
  reviewDate: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
  },
  reviewText: {
    marginTop: 8,
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 18,
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  cardImageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  doctorReplyBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E8F2EE',
  },
  doctorReplyLabel: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 2,
  },
  doctorReplyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
  },
});