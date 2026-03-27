import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'
import Detailimages from '../../components/Detailimages'
import { Fonts } from '../../common/Fonts'

const ReviewPage = () => {

    const ratingData = {
        average: 4.8,
        totalReviews: 1240,
        breakdown: [
            { star: 5, percent: 75 },
            { star: 4, percent: 15 },
            { star: 3, percent: 5 },
            { star: 2, percent: 3 },
            { star: 1, percent: 2 },
        ],
    };

    const product = {
        images: [
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
        ],
    };
    const reviews = [
        {
            id: '1',
            name: 'Amara Singh',
            time: '2 days ago',
            rating: 5,
            review: 'The quality of this millet is exceptional. It’s very clean and cooks perfectly every time.',
        },
        {
            id: '2',
            name: 'Marcus Chen',
            time: '1 week ago',
            rating: 5,
            review: 'Really good product. Packaging was eco-friendly and quality is great.',
        },
        {
            id: '3',
            name: 'Sarah Jenkins',
            time: '2 weeks ago',
            rating: 4,
            review: 'Perfect for my morning porridge. Will definitely buy again!',
        },
    ];

    const [activeFilter, setActiveFilter] = useState('All Reviews');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >

                <AppHeader
                    title="Foxtail millet (Kangni)"
                    leftIcon={Images.backIcon}
                />

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

                <Text style={styles.sectionTitle}>User Photos</Text>
                <Detailimages
                    images={product.images}
                    itemWidth={128}
                    itemHeight={128}
                    showIndicator={false}
                />

                <View style={styles.filterRow}>
                    {['All Reviews', 'With Photos', '5 Star', 'Recent'].map((item) => (
                        <Text
                            key={item}
                            style={[
                                styles.filterBtn,
                                activeFilter === item && styles.activeFilterBtn
                            ]}
                            onPress={() => setActiveFilter(item)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    activeFilter === item && styles.activeFilterText
                                ]}
                            >
                                {item}
                            </Text>
                        </Text>
                    ))}
                </View>


                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.reviewCard}>

                            <View style={styles.reviewHeaderRow}>

                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {item.name.charAt(0)}
                                    </Text>
                                </View>

                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.verified}>VERIFIED PURCHASE</Text>
                                </View>

                                <Text style={styles.time}>{item.time}</Text>

                            </View>

                            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

                            <Text style={styles.reviewText}>{item.review}</Text>

                        </View>
                    )}
                />

            </ScrollView>
        </SafeAreaView>
    )
}

export default ReviewPage


const styles = StyleSheet.create({

    ratingContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 20,
    },

    avgRating: {
        fontSize: 48,
        fontWeight: '900',
        color: '#0D614E',
        lineHeight:60
    },

    stars: {
        color: '#FACC15',
        marginTop: 4,
        
    },

    totalReviews: {
        marginTop: 4,
        color: '#64748B',
        fontSize: 14,
        fontFamily:Fonts.PoppinsSemiBold,
        lineHeight:20
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
        fontFamily:Fonts.PoppinsMedium
    },

    sectionTitle: {
        marginTop: 20,
        paddingHorizontal: 24,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        left: 6
    },

    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        marginTop: 10,
    },

    filterBtn: {
        backgroundColor: '#E6F4F1',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 10,
        marginTop:12
    },

    filterText: {
        color: '#0D614E',
        fontSize: 12,
    },
    activeFilterBtn: {
        backgroundColor: '#0D614E',
    },

    activeFilterText: {
        color: '#FFFFFF',
    },

    reviewCard: {
        backgroundColor: '#f8f6f6',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 24,
        marginTop: 10,
    },

    reviewHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#0D614E1A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarText: {
        color: '#0D614E',
        fontWeight: '700',
    },

    name: {
        fontWeight: '700',
        fontSize: 14,
        lineHeight:20,
        color:'#0F172A'
    },

    verified: {
        fontSize: 10,
        color: '#64748B',
        lineHeight:15,
        fontFamily:Fonts.PoppinsMedium
    },

    time: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily:Fonts.PoppinsMedium
    },

    reviewText: {
        marginTop: 8,
        color: '#475569',
        fontSize: 14,
        lineHeight: 18,
    },

});