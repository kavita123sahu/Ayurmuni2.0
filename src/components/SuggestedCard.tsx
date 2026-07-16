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
}

const SuggestedCard: React.FC<Props> = ({ data, price = false, isGrid = false, header = false, navigation }) => {
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
            contentContainerStyle={{
                paddingBottom: 20,
            }}

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
                                        numberOfLines={3}
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

                                    <View style={styles.badge}>
                                        <TablerIcon
                                            name="clock"
                                            size={14}
                                            color="#0D614E"
                                        />
                                        <Text style={styles.badgeText}>
                                            {item?.duration_minutes} min
                                        </Text>
                                    </View>
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
const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        // height: 240,
        marginBottom: 20,
        // minHeight: 200,

    },

    gridCard: {
        // width: '48%',
        width: CARD_WIDTH,
        marginRight: 0,
    },

    emptyCard: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },

    imageContainer: {
        // width: "100%",
        // height: 180,
        // marginTop: 12,
        // borderRadius: 16,
        // overflow: "hidden",
        backgroundColor: "#F1F5F9",
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },

    image: {
        width: "100%",
        height: "100%",
    },

    subContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    title: {
        fontSize: 16,
        lineHeight: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#1E293B",
    },

    subtitle: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18,

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
        marginTop: 8,
        gap: 8, // RN 0.71+ supported
    },

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 18,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    badgeText: {
        marginLeft: 4,
        fontSize: 11,
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