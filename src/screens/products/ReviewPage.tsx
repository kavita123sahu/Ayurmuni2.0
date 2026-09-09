import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import {
    collectReviewImageUrls,
    extractReviewsList,
    getAverageRating,
    isReviewVideoUrl,
    normalizeReviewsForDisplay,
} from '../../utils/reviewUtils';
import TablerIcon from '../../components/TablerIcon';
import { getReviewsAll } from '../../services/ProductServices';

type FilterKey = 'all' | 'photos' | '5' | '4' | '3' | 'recent';

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'photos', label: 'Photos' },
    { key: '5', label: '5★' },
    { key: '4', label: '4★' },
    { key: '3', label: '3★' },
    { key: 'recent', label: 'Recent' },
];

const ratingTone = (rating: number) => {
    if (rating >= 4) return { bg: '#15803D' };
    if (rating >= 3) return { bg: '#D97706' };
    return { bg: '#DC2626' };
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

const StarRow = ({ rating, size = 12 }: { rating: number; size?: number }) => {
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

const ReviewPage = (props: any) => {
    const routeParams = props.route?.params ?? {};
    const rawReviews = routeParams.reviews ?? [];
    const entityType = routeParams.entityType;
    const doctorId = routeParams.doctorId;
    const variantId = routeParams.variantId;
    const isProduct = entityType === 'product';

    const [fetchedReviews, setFetchedReviews] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    useEffect(() => {
        const loadReviews = async () => {
            try {
                if (entityType === 'doctor' && doctorId) {
                    setLoading(true);
                    const res = await getReviewsAll({
                        entity_type: 'doctor',
                        doctor_id: String(doctorId),
                    });
                    setFetchedReviews(extractReviewsList(res));
                    return;
                }

                if (entityType === 'product' && variantId) {
                    setLoading(true);
                    const res = await getReviewsAll({
                        entity_type: 'product',
                        variant_id: String(variantId),
                    });
                    setFetchedReviews(extractReviewsList(res));
                }
            } catch (error) {
                console.log('ReviewPage fetch error', error);
            } finally {
                setLoading(false);
            }
        };
        loadReviews();
    }, [entityType, doctorId, variantId]);

    const reviews = useMemo(
        () =>
            normalizeReviewsForDisplay(
                fetchedReviews !== null ? fetchedReviews : rawReviews,
            ),
        [fetchedReviews, rawReviews],
    );

    const filteredReviews = useMemo(() => {
        switch (activeFilter) {
            case 'photos':
                return reviews.filter(
                    (item: any) => item.image_urls?.length > 0,
                );
            case '5':
            case '4':
            case '3':
                return reviews.filter(
                    (item: any) =>
                        Math.round(Number(item.rating)) === Number(activeFilter),
                );
            case 'recent':
                return [...reviews].sort(
                    (a: any, b: any) =>
                        new Date(b.created_at || 0).getTime() -
                        new Date(a.created_at || 0).getTime(),
                );
            default:
                return reviews;
        }
    }, [reviews, activeFilter]);

    const ratingData = useMemo(() => {
        const total = reviews.length;
        const counts: Record<number, number> = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        reviews.forEach((r: any) => {
            const rating = Math.round(Number(r.rating));
            if (rating >= 1 && rating <= 5) counts[rating] += 1;
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

    const allImages = useMemo(
        () => collectReviewImageUrls(reviews),
        [reviews],
    );

    const MAX_VISIBLE_IMAGES = 5;
    const visibleImages = allImages.slice(0, MAX_VISIBLE_IMAGES);
    const remainingCount = allImages.length - MAX_VISIBLE_IMAGES;

    const getInitials = useCallback((name = '') => {
        if (!name?.trim()) return 'U';
        return name
            .trim()
            .split(' ')
            .map(word => word?.[0] || '')
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }, []);

    const openGallery = useCallback(
        (images: string[], selectedIndex = 0) => {
            if (!images?.length) return;
            props.navigation.navigate('ReviewGalleryScreen', {
                images,
                selectedIndex,
            });
        },
        [props.navigation],
    );

    const renderReview = useCallback(
        ({ item, index }: { item: any; index: number }) => {
            const rating = Number(item?.rating) || 0;
            const dateLabel = formatReviewDate(item?.created_at);
            const name =
                item?.reviewer_name || item?.patient_name || 'Customer';

            return (
                <View
                    style={[
                        styles.reviewCard,
                        index === 0 && styles.reviewCardFirst,
                    ]}
                >
                    <View style={styles.reviewTop}>
                        <View style={styles.avatar}>
                            {item?.reviewer_profile_image ? (
                                <Image
                                    source={{
                                        uri: item.reviewer_profile_image,
                                    }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {getInitials(name)}
                                </Text>
                            )}
                        </View>

                        <View style={styles.reviewMeta}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {name}
                                </Text>
                                <View
                                    style={[
                                        styles.miniRating,
                                        {
                                            backgroundColor:
                                                ratingTone(rating).bg,
                                        },
                                    ]}
                                >
                                    <Text style={styles.miniRatingText}>
                                        {rating}
                                    </Text>
                                    <TablerIcon
                                        name="star-filled"
                                        size={8}
                                        color="#FFFFFF"
                                    />
                                </View>
                            </View>
                            <View style={styles.metaLine}>
                                <Text style={styles.verified}>
                                    {isProduct
                                        ? 'Certified buyer'
                                        : 'Verified patient'}
                                </Text>
                                {!!dateLabel && (
                                    <Text style={styles.reviewDate}>
                                        {' '}
                                        · {dateLabel}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {!!item?.review?.trim?.() ? (
                        <Text style={styles.reviewText}>{item.review}</Text>
                    ) : null}

                    {!!item?.image_urls?.length && (
                        <View style={styles.cardImageRow}>
                            {item.image_urls
                                .slice(0, 4)
                                .map((uri: string, idx: number) => (
                                    <TouchableOpacity
                                        key={`${item.id}-${idx}`}
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            openGallery(item.image_urls, idx)
                                        }
                                    >
                                        <Image
                                            source={{ uri }}
                                            style={styles.cardImage}
                                        />
                                        {isReviewVideoUrl(uri) ? (
                                            <View style={styles.cardVideoBadge}>
                                                <TablerIcon
                                                    name="video"
                                                    size={10}
                                                    color="#FFFFFF"
                                                />
                                            </View>
                                        ) : null}
                                    </TouchableOpacity>
                                ))}
                        </View>
                    )}

                    {!!item?.doctor_reply?.trim?.() && (
                        <View style={styles.doctorReplyBox}>
                            <Text style={styles.doctorReplyLabel}>
                                Doctor replied
                            </Text>
                            <Text style={styles.doctorReplyText}>
                                {item.doctor_reply}
                            </Text>
                        </View>
                    )}
                </View>
            );
        },
        [getInitials, isProduct, openGallery],
    );

    const ListHeader = (
        <View>
            {ratingData.totalReviews > 0 ? (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryLeft}>
                        <View
                            style={[
                                styles.scorePill,
                                {
                                    backgroundColor: ratingTone(
                                        ratingData.average,
                                    ).bg,
                                },
                            ]}
                        >
                            <Text style={styles.scoreText}>
                                {ratingData.average.toFixed(1)}
                            </Text>
                            <TablerIcon
                                name="star-filled"
                                size={12}
                                color="#FFFFFF"
                            />
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
                                <TablerIcon
                                    name="star-filled"
                                    size={8}
                                    color="#F59E0B"
                                />
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
            ) : !loading ? (
                <View style={styles.emptyBox}>
                    <View style={styles.emptyIcon}>
                        <TablerIcon
                            name="star"
                            size={18}
                            color={Colors.primaryColor}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>
                        {isProduct
                            ? 'No reviews yet for this product'
                            : 'No reviews yet'}
                    </Text>
                    <Text style={styles.emptySub}>
                        {isProduct
                            ? 'Ratings from buyers will show here'
                            : 'Ratings from patients will show here'}
                    </Text>
                </View>
            ) : null}

            {allImages.length > 0 ? (
                <View style={styles.photosBlock}>
                    <Text style={styles.photosLabel}>
                        {isProduct ? 'Customer photos' : 'Patient photos'}
                    </Text>
                    <View style={styles.imageRow}>
                        {visibleImages.map((item, index) => {
                            const isLastVisible =
                                index === MAX_VISIBLE_IMAGES - 1 &&
                                remainingCount > 0;
                            return (
                                <TouchableOpacity
                                    key={`${item}-${index}`}
                                    activeOpacity={0.8}
                                    onPress={() => openGallery(allImages, index)}
                                    style={styles.imageWrapper}
                                >
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.reviewImage}
                                    />
                                    {isReviewVideoUrl(item) ? (
                                        <View style={styles.videoBadge}>
                                            <TablerIcon
                                                name="video"
                                                size={11}
                                                color="#FFFFFF"
                                            />
                                        </View>
                                    ) : null}
                                    {isLastVisible ? (
                                        <View style={styles.overlay}>
                                            <Text style={styles.overlayText}>
                                                +{remainingCount}
                                            </Text>
                                        </View>
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            ) : null}

            {ratingData.totalReviews > 0 ? (
                <View style={styles.filterBlock}>
                    <Text style={styles.filterTitle}>
                        {filteredReviews.length}{' '}
                        {filteredReviews.length === 1 ? 'review' : 'reviews'}
                    </Text>
                    <FlatList
                        horizontal
                        data={FILTERS}
                        keyExtractor={item => item.key}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                        renderItem={({ item }) => {
                            const active = activeFilter === item.key;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.filterBtn,
                                        active && styles.activeFilterBtn,
                                    ]}
                                    onPress={() => setActiveFilter(item.key)}
                                    activeOpacity={0.75}
                                >
                                    <Text
                                        style={[
                                            styles.filterText,
                                            active && styles.activeFilterText,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            ) : null}

            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={Colors.primaryColor}
                    style={{ marginVertical: 20 }}
                />
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader
                title="Ratings & reviews"
                onLeftPress={() => props.navigation.goBack()}
            />

            <FlatList
                data={loading ? [] : filteredReviews}
                keyExtractor={(item, index) =>
                    String(item?.id ?? `review-${index}`)
                }
                renderItem={renderReview}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading && ratingData.totalReviews > 0 ? (
                        <View style={styles.filterEmpty}>
                            <Text style={styles.filterEmptyText}>
                                No reviews for this filter
                            </Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

export default ReviewPage;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },
    listContent: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 28,
    },

    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
    },
    summaryLeft: {
        width: 96,
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
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        includeFontPadding: false,
    },
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
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
        width: 18,
        fontSize: 9,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        textAlign: 'right',
    },

    emptyBox: {
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
    },
    emptyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    emptySub: {
        marginTop: 3,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        textAlign: 'center',
    },

    photosBlock: {
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
    },
    photosLabel: {
        marginBottom: 8,
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    imageRow: {
        flexDirection: 'row',
        gap: 8,
    },
    imageWrapper: {
        position: 'relative',
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
        ...StyleSheet.absoluteFillObject,
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

    filterBlock: {
        marginTop: 10,
        marginBottom: 4,
    },
    filterTitle: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#64748B',
        marginBottom: 8,
        marginLeft: 2,
    },
    filterRow: {
        gap: 6,
        paddingRight: 8,
    },
    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeFilterBtn: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    filterText: {
        fontSize: 12,
        color: '#475569',
        fontFamily: Fonts.PoppinsSemiBold,
        includeFontPadding: false,
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    filterEmpty: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    filterEmptyText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },

    reviewCard: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
    },
    reviewCardFirst: {
        marginTop: 6,
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
        overflow: 'hidden',
    },
    avatarImage: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    avatarText: {
        color: Colors.primaryColor,
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    reviewMeta: {
        flex: 1,
        minWidth: 0,
        marginLeft: 8,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    name: {
        flexShrink: 1,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 13,
        color: '#0F172A',
        includeFontPadding: false,
    },
    miniRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    miniRatingText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        includeFontPadding: false,
    },
    metaLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    verified: {
        fontSize: 10,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    reviewDate: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    reviewText: {
        marginTop: 8,
        color: '#475569',
        fontSize: 12,
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 18,
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
    cardVideoBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorReplyBox: {
        marginTop: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F8FAF9',
        borderWidth: StyleSheet.hairlineWidth,
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
        lineHeight: 17,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
    },
});
