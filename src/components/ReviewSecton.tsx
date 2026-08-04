import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import { collectReviewImageUrls, getAverageRating, isReviewVideoUrl, normalizeReviewsForDisplay } from "../utils/reviewUtils";
import TablerIcon from "./TablerIcon";

const ReviewSection = ({
  reviews = [],
  navigation,
}: {
  reviews?: any[];
  navigation: any;
}) => {
  const renderStars = (count: number) => {
    return "⭐".repeat(count); // simple star render
  };

  console.log("reviewsalll", reviews);
  const normalizedReviews = useMemo(
    () => normalizeReviewsForDisplay(reviews),
    [reviews],
  );
  const visibleReviews = normalizedReviews?.slice(0, 3);

  const getInitials = (name: string) => {
    return name?.split(" ")?.map((n) => n[0])?.join("").toUpperCase();
  };

  const ratingData = useMemo(() => {
    const total = reviews?.length;

    const counts: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews?.forEach((r: any) => {
      const rating = Number(r.rating);
      counts[rating] = (counts[rating] || 0) + 1;
    });

    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      percent: total ? Math.round((counts[star] / total) * 100) : 0,
    }));

    const average = getAverageRating(reviews);

    return {
      average,
      totalReviews: total,
      breakdown,
    };
  }, [reviews]);

  const MAX_VISIBLE_IMAGES = 4;

  const allImages = useMemo(() => {
    return collectReviewImageUrls(normalizedReviews);
  }, [normalizedReviews]);


  return (
    <View>
      {/* Header */}
      <TouchableOpacity
        style={styles.reviewHeader}
        onPress={() => navigation.navigate("ReviewPage", {
          reviews: normalizedReviews,
        })}
      >
        <Text style={styles.sectionTitle}>Customer Reviews</Text>

        <Text style={styles.viewAll}>View All</Text>
      </TouchableOpacity>



      <View style={styles.ratingBox}>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.avgRating}>
            {ratingData?.average}
          </Text>

          <Text style={styles.stars}>⭐</Text>

        </View>
        <Text style={styles.totalReviews}>
          Based on the {ratingData?.totalReviews.toLocaleString()} ratings by veryfied buyer
        </Text>

      </View>

      <View style={styles.imageRow}>
        {allImages
          .slice(0, MAX_VISIBLE_IMAGES)
          .map((item, index) => {

            const remaining =
              allImages?.length - MAX_VISIBLE_IMAGES;

            const isLastVisible =
              index === MAX_VISIBLE_IMAGES - 1 &&
              allImages?.length > MAX_VISIBLE_IMAGES;

            return (
              <TouchableOpacity
                key={`${item}-${index}`}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(
                    'ReviewGalleryScreen',
                    {
                      images: allImages,
                      selectedIndex: index,
                    },
                  )
                }
                style={styles.imageWrapper}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.reviewImage}
                />

                {isReviewVideoUrl(item) ? (
                  <View style={styles.videoBadge}>
                    <TablerIcon name="video" size={12} color="#FFFFFF" />
                  </View>
                ) : null}

                {isLastVisible && (
                  <View style={styles.overlay}>
                    <Text style={styles.overlayText}>
                      +{remaining}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
      </View>

      {/* Reviews List */}
      {visibleReviews?.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.reviewTop}>

            {/* Avatar */}
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

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {item?.reviewer_name || item?.patient_name || 'Patient'}
                </Text>
                <Text style={styles.stars}>
                  {renderStars(item?.rating ?? '')} ( {item?.rating ?? ''} )
                </Text>
              </View>
            </View>
          </View>

          {!!item?.review?.trim?.() ? (
            <Text style={styles.reviewText}>{item.review}</Text>
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
      ))}

    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginHorizontal: 2,
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: "#111",
  },

  viewAll: {
    fontSize: 14,
    color: "#0B6B57",
    fontFamily: Fonts.PoppinsSemiBold,
  },
  imageRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  imageWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },

  reviewImage: {
    width: 80,
    height: 80,
    backgroundColor: Colors.bgcolor,
    borderRadius: 12,
    marginRight: 8,
  },

  videoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: Colors.bgcolor,
    //   marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 10,

  },

  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6F2EF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: "#0B6B57",
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: "#111",
  },

  ratingBox: {
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingVertical: 10,
    // marginTop: 10,
    // backgroundColor: '#F8F6F6',
    borderRadius: 12,
  },
  avgRating: {
    fontSize: 40,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
    lineHeight: 60,
    marginBottom: -10
  },

  totalReviews: {
    // marginTop: 4,
    color: '#64748B',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 20
  },

  stars: {
    fontSize: 12,
  },

  reviewText: {
    marginTop: 10,
    fontSize: 13,
    color: "#4B5563",
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 18,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardImageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  doctorReplyBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F2EE',
  },
  doctorReplyLabel: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 4,
  },
  doctorReplyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
})