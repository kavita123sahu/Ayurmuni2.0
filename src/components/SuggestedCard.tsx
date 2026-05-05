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
import WishlistButton from './WishlistButton';

interface Props {
    data: any[];
    price?: boolean;
    isGrid?: boolean;
    header?: boolean;
    navigation: any
    ListHeaderComponent?: React.ReactNode;
}

const SuggestedCard: React.FC<Props> = ({ data, price = false, isGrid = false, header = false, navigation }) => {
    console.log("navigationnnnnnnnn", navigation)
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
                    <TouchableOpacity onPress={() => navigation.navigate('ProductDetails')} style={[styles.card, isGrid && styles.gridCard]}>

                        {/* IMAGE */}
                        <View style={styles.imageContainer}>
                            <Image source={item.image} style={styles.image} />
                        </View>

                        {/* CONTENT */}
                        <View style={styles.subContainer}>

                            <View style={{ paddingRight: 40, paddingBottom: 15 }}>
                                <Text style={styles.title}>
                                    {item.name}
                                </Text>

                                {item.subtitle && (
                                    <Text
                                        style={styles.subtitle}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    >
                                        {item.subtitle}
                                    </Text>
                                )}

                                {price && (
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.price}>Rs. {item.price}</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.cartBtn}
                                onPress={() => navigation.navigate('MyCart')}
                            >
                                <Image source={require('../assets/images/CartFrame.png')} style={styles.cartFrame} />
                                <Image source={require('../assets/images/arrowRight.png')} style={styles.cartIcon} />
                            </TouchableOpacity>

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

export default SuggestedCard;

const styles = StyleSheet.create({
    card: {
        width: 160,
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        // height: 240,
        marginBottom:20,
        // minHeight: 200,

    },

    gridCard: {
        width: '48%',
        marginRight: 0,
    },

    emptyCard: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },

    imageContainer: {
        backgroundColor: '#EEF3F2',
        height: 135,
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
    },

    image: {
        width: '100%',
        height: '100%',
        // resizeMode: 'contain',
    },

    subContainer: {
        margin: 6,
        flex: 1,
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },

    subtitle: {
        fontSize: 12,
        color: '#64748B',

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

    badge: {
        position: 'absolute',
        top: 0,
        left: 0,
        borderTopLeftRadius: 16,
        borderBottomRightRadius: 16,
        backgroundColor: '#F0BE27',
        paddingHorizontal: 10,
        paddingVertical: 4,
        zIndex: 10,
    },

    badgeText: {
        fontSize: 10,
        color: '#FFFFFF',
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