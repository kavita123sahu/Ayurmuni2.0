import React, { useState } from 'react';
import {
    FlatList,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import PromoCard from './PromoCard';
import SectionHeader from './SectionHeader';
import TablerIcon from './TablerIcon';

interface Props {
    data: any[];
    price?: boolean;
    isGrid?: boolean;
    header?: boolean;
    navigation: any
    ListHeaderComponent?: React.ReactNode;
    home?: boolean;
}

const SuggestedCard: React.FC<Props> = ({ data, price = false, isGrid = false, header = false, navigation, home = false }) => {
    console.log("dataypggaaa-->", data);

    const [showAll, setShowAll] = useState(false);

    const displayData = showAll ? data : data.slice(0, 6);

    const formattedData =
        isGrid && displayData.length % 2 !== 0
            ? [...displayData, { id: 'empty', empty: true }]
            : displayData;



    const ListHeaderComponent = () => (
        <>
            <PromoCard
                title="The Wellness Essentials"
                desc="Discover our loved organic selections, cold-pressed to preserve nature’s power."
                tag="CURATED EXCELLENCE"
                image={require('../assets/images/cosmetic.png')}
                showButton={false}

            />
            <SectionHeader title="Top  Selling Products" actionText="View all" />
        </>
    );

    return (
        <FlatList
            key={isGrid ? 'grid' : 'list'}
            data={formattedData}
            keyExtractor={(item, index) => item.id || index.toString()}
            horizontal={!isGrid}
            numColumns={isGrid ? 2 : 1}
            ListHeaderComponent={header ? <ListHeaderComponent /> : undefined}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
                styles.listContent,
                home && styles.listContentHome,
            ]}

            columnWrapperStyle={
                isGrid
                    ? {
                        justifyContent: 'space-between',
                        marginBottom: 14,
                    }
                    : undefined
            }

            renderItem={({ item }) => {
                if (item.empty) {
                    return <View style={[styles.card, styles.gridCard, styles.emptyCard]} />;
                }

                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('YogaScreen', { item })}
                        style={[styles.card, isGrid && styles.gridCard]}>

                        {/* IMAGE */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: item?.thumbnail_url }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>

                        {/* CONTENT */}
                        <View style={styles.subContainer}>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                                    {item?.title}
                                </Text>

                                {item?.short_description && (
                                    <Text
                                        style={styles.subtitle}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item?.short_description}
                                    </Text>
                                )}


                                <View style={styles.infoRow}>
                                    <View style={styles.badge}>
                                        <TablerIcon
                                            name='approved'
                                            size={14}
                                            color="#0D614E"
                                        />
                                        <Text style={styles.badgeText}>
                                            {item?.difficulty}
                                        </Text>
                                    </View>

                                    {/* <View style={styles.badge}>
                                        <TablerIcon
                                            name="clock"
                                            size={14}
                                            color="#0D614E"
                                        />
                                        <Text style={styles.badgeText}>
                                            {item?.duration_minutes} min
                                        </Text>
                                    </View> */}
                                </View>
                                {price && (
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.price}>Rs. {item.price}</Text>
                                    </View>
                                )}
                            </View>

                            {/* <TouchableOpacity
                                style={styles.cartBtn}
                                onPress={() => navigation.navigate('MyCart')}
                            >
                                <TablerIcon name="shopping-cart" size={22} color="#0D614E" />
                                <TablerIcon name="arrow-right" size={18} color="#0D614E" />
                            </TouchableOpacity> */}

                        </View>
                    </TouchableOpacity>
                );
            }}

            ListFooterComponent={
                isGrid && data.length > 6 ? (
                    <View style={styles.footerContainer}>

                        {/* BUTTON */}
                        {!showAll && (
                            <TouchableOpacity
                                style={styles.discoverBtn}
                                onPress={() => setShowAll(true)}
                            >
                                <Text style={styles.discoverText}>Discover More</Text>
                            </TouchableOpacity>
                        )}

                        {/* COUNT TEXT */}
                        <Text style={styles.countText}>
                            Showing {showAll ? data.length : 6} of {data.length} items
                        </Text>

                    </View>
                ) : null
            }


        />
    );
};

export default React.memo(SuggestedCard);

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 48) / 2;
const LIST_CARD_WIDTH = Math.min(width * 0.42, 156);

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    listContentHome: {
        paddingBottom: 0,
        paddingRight: 4,
    },
    card: {
        width: LIST_CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        overflow: 'hidden',
    },

    gridCard: {
        width: GRID_CARD_WIDTH,
        marginRight: 0,
        marginBottom: 10,
    },

    emptyCard: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },

    imageContainer: {
        backgroundColor: '#F1F5F9',
        width: '100%',
        aspectRatio: 4 / 3,
        overflow: 'hidden',
    },

    image: {
        width: "100%",
        height: "100%",
    },

    subContainer: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },

    title: {
        fontSize: 13,
        lineHeight: 17,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },

    subtitle: {
        fontSize: 11,
        color: '#64748B',
        lineHeight: 15,
        marginTop: 2,
        fontFamily: Fonts.PoppinsMedium,
    },

    priceContainer: {
        marginTop: 15,
    },

    oldPrice: {
        fontFamily: Fonts.PoppinsRegular,
        fontSize: 10,
        color: '#64748B',
        textDecorationLine: 'line-through',
    },

    price: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
        marginTop: 2,
    },

    // badge: {
    //     position: 'absolute',
    //     top: 0,
    //     left: 0,
    //     borderTopLeftRadius: 16,
    //     borderBottomRightRadius: 16,
    //     backgroundColor: '#F0BE27',
    //     paddingHorizontal: 10,
    //     paddingVertical: 4,
    //     zIndex: 10,
    // },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
        gap: 6,
    },

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },

    badgeText: {
        marginLeft: 3,
        fontSize: 10,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
    },


    cartBtn: {
        position: 'absolute',
        right: 8,
        bottom: 15, // 🔥 ALWAYS same position
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',

    },

    cartFrame: {
        position: 'absolute',
        width: 40,
        height: 40,
    },

    cartIcon: {
        width: 20,
        height: 20,
    },

    footerContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    discoverBtn: {
        backgroundColor: '#0D614E',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 12,
    },

    discoverText: {
        color: '#FFFFFF',
        fontSize: 14, fontFamily: Fonts.PoppinsMedium,
    },

    countText: {
        marginTop: 8,
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 40
    },
});