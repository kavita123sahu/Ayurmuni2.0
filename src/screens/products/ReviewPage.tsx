import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'
import Detailimages from '../../components/Detailimages'
import { Fonts } from '../../common/Fonts'
import { Colors } from '../../common/Colors'

const ReviewPage = (props: any) => {

    const { reviews } = props.route.params;

    console.log("reviessssss", reviews);

    const [activeFilter, setActiveFilter] = useState('All Reviews');

    const filteredReviews = useMemo(() => {
        switch (activeFilter) {
            case 'With Photos':
                return reviews.filter((item: any) => item.image_urls?.length > 0);

            case '5 Star':
                return reviews.filter((item: any) => Number(item.rating) === 5);

            case 'Recent':
                return [...reviews].sort(
                    (a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
            const rating = Number(r.rating);
            counts[rating] = (counts[rating] || 0) + 1;
        });

        const breakdown = [5, 4, 3, 2, 1].map((star) => ({
            star,
            percent: total ? Math.round((counts[star] / total) * 100) : 0,
        }));

        const average =
            total > 0
                ? Number(
                    (
                        reviews.reduce((sum: any, r: any) => sum + Number(r.rating), 0) / total
                    ).toFixed(1)
                )
                : 0;

        return {
            average,
            totalReviews: total,
            breakdown,
        };
    }, [reviews]);



    const allImages = useMemo(() => {
        const reviewImages = reviews.flatMap((item: any) => item.image_urls || []);

        const mediaImages = reviews
            .map((item: any) => item.media_url)
            .filter(Boolean);

        return [...mediaImages, ...reviewImages];
    }, [reviews]);


    const MAX_VISIBLE_IMAGES = 4;

    const visibleImages =
        allImages.slice(0, MAX_VISIBLE_IMAGES);

    const remainingCount =
        allImages.length - MAX_VISIBLE_IMAGES;


    const getInitials = (name = '') => {
        if (!name?.trim()) return '';

        return name
            .trim()
            .split(' ')
            .map(word => word?.[0] || '')
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFFCC'} />


            <AppHeader
                // title="Foxtail millet (Kangni)"
                title={"Reviews"}
                onLeftPress={() => props.navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 15 }}
            >

                <View style={styles.ratingContainer}>

                    <View>
                        <Text style={styles.avgRating}>{ratingData.average}</Text>
                        <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                        <Text style={styles.totalReviews}>
                            {ratingData.totalReviews.toLocaleString()} reviews
                        </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 20 }}>
                        {ratingData.breakdown.map((item) => (
                            <View key={item.star} style={styles.progressRow}>

                                <Text style={styles.starLabel}>{item.star}</Text>

                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${item.percent}%` },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.percentText}>{item.percent}%</Text>

                            </View>
                        ))}
                    </View>

                </View>


                {allImages.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            User Photos
                        </Text>

                        <View style={styles.imageRow}>
                            {visibleImages.map(
                                (item, index) => {

                                    const isLastVisible =
                                        index ===
                                        MAX_VISIBLE_IMAGES - 1 &&
                                        allImages.length >
                                        MAX_VISIBLE_IMAGES;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.8}
                                            onPress={() =>
                                                props?.navigation.navigate(
                                                    'ReviewGalleryScreen',
                                                    {
                                                        images: allImages,
                                                        selectedIndex:
                                                            index,
                                                    },
                                                )
                                            }
                                        >
                                            <Image
                                                source={{ uri: item }}
                                                style={
                                                    styles.reviewImage
                                                }
                                            />

                                            {isLastVisible && (
                                                <View
                                                    style={
                                                        styles.overlay
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.overlayText
                                                        }
                                                    >
                                                        +{remainingCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                },
                            )}
                        </View>
                    </>
                )}

                <View style={styles.filterRow}>
                    {['All Reviews', 'With Photos', '5 Star', 'Recent'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.filterBtn,
                                activeFilter === item && styles.activeFilterBtn
                            ]}
                            onPress={() => setActiveFilter(item)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    activeFilter === item && styles.activeFilterText
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>


                <FlatList
                    data={filteredReviews}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (

                        <View style={styles.reviewCard}>
                            <View style={styles.reviewHeaderRow}>


                                <View style={styles.avatar}>
                                    {item?.reviewer_profile_image  ? (
                                         <Image
    source={{ uri: item.reviewer_profile_image }}
    style={styles.userImage}
  />
                                 
                                    ):(
                                    <Text style={styles.avatarText}>
                                        {getInitials(item?.patient_name ||
                                            item?.reviewer_name)}
                                    </Text>)}
                                </View>

                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.name}>{item?.patient_name || item?.reviewer_name}</Text>
                                    <Text style={styles.verified}>VERIFIED PURCHASE</Text>
                                </View>

                                <Text style={styles.time}>
                                    {item?.created_at
                                        ? new Date(item.created_at).toLocaleDateString()
                                        : ''}
                                </Text>
                            </View>

                            <Text style={styles.stars}>
                                {/* {"⭐".repeat(item.rating)} */}
                                {"⭐".repeat(Number(item?.rating || 0))}
                            </Text>

                            <Text style={styles.reviewText}>
                                {/* {item.review} */}
                                {item?.review || 'No review available'}
                            </Text>
                        </View>
                    )}
                />

            </ScrollView>
        </SafeAreaView>
    )
}

export default ReviewPage

const { width } = Dimensions.get("window");
const scale = width / 375; // base width for scaling (iPhone 11 Pro)

const styles = StyleSheet.create({

    ratingContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 20,
    },

    avgRating: {
        fontSize: 48,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
        lineHeight: 60
    },

    stars: {
        color: '#FACC15',
        marginTop: 4,

    },

    totalReviews: {
        marginTop: 4,
        color: '#64748B',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 20
    },

    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },

    starLabel: {
        width: 10,
        fontSize: 14,
    },

    progressBar: {
        flex: 1,
        height: 10,
        backgroundColor: '#0D614E1A',
        borderRadius: 4,
        marginHorizontal: 6,
    },

    progressFill: {
        height: 10,
        backgroundColor: '#0D614E',
        borderRadius: 4,
    },

    percentText: {
        fontSize: 12,
        color: '#64748B',
        width: 30,
        fontFamily: Fonts.PoppinsMedium
    },

    sectionTitle: {
        marginTop: 20,
        // paddingHorizontal: ,
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 12,
        left: 6
    },

    filterRow: {
        flexDirection: 'row',
        // flexWrap: 'wrap', // 🔥 small screen fix
        justifyContent: 'center', // 🔥 center align
        alignItems: 'center',

        paddingHorizontal: 30 * scale,
        marginTop: 10,
        // gap: 8, // clean spacing
    },

    filterBtn: {
        paddingVertical: 8 * scale,
        paddingHorizontal: 10 * scale,

        borderRadius: 10,

        backgroundColor: '#0D614E1A',

        margin: 4, // fallback spacing (gap support issue fix)
    },

    activeFilterBtn: {
        backgroundColor: Colors.primaryColor,
    },

    filterText: {
        fontSize: 12 * scale,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    activeFilterText: {
        color: Colors.white,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    reviewCard: {
        backgroundColor: '#f8f6f6',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 10,
        marginTop: 10,
    },

    reviewHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0D614E1A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    userImage: {
  width: 48,
  height: 48,
  borderRadius: 24,
},
    avatarText: {
        color: '#0D614E',
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    name: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
        lineHeight: 20,
        color: '#0F172A'
    },

    verified: {
        fontSize: 10,
        color: '#64748B',
        lineHeight: 15,
        fontFamily: Fonts.PoppinsMedium
    },

    time: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium
    },

    reviewText: {
        marginTop: 8,
        color: '#475569',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        lineHeight: 22,
    },

    imageRow: {
        flexDirection: 'row',
        marginTop: 12,
    },

    reviewImage: {
        width: 90,
        height: 90,
        backgroundColor: Colors.bgcolor,
        borderRadius: 12,
        marginRight: 8,
    },

    overlay: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor:
            'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    overlayText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});