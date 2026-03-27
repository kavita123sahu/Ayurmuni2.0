import { View, Text, ScrollView, StyleSheet, Image } from 'react-native'
import React from 'react'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'
import { SafeAreaView } from 'react-native-safe-area-context'
import Detailimages from '../../components/Detailimages'
import { Fonts } from '../../common/Fonts'

const ProductDetails = () => {
    const product = {
        id: 1,
        name: "Fresh Apple",
        images: [
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
            Images.detailimage,
        ],
    };

    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <AppHeader
                    title="Product Details"
                    leftIcon={Images.backIcon}
                    rightIcon={Images.share}
                    //   onLeftPress={() => navigation.goBack()}
                    onRightPress={() => console.log("Share clicked")}
                />

                <Detailimages images={product.images} />

                <View style={styles.infoContainer}>

                    <View style={styles.topRow}>
                        <Text style={styles.tag}>PREMIUM QUALITY</Text>

                        <View style={styles.ratingBox}>
                            <Image source={Images.star} style={styles.starIcon} />
                            <Text style={styles.ratingText}>4.8</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>
                        Foxtail Millet {"\n"}(Kangni)
                    </Text>

                    <Text style={styles.desc}>
                        Nutritious, gluten-free ancient grain, rich in fiber and minerals.
                        Perfect for healthy meals and daily nutrition.
                    </Text>

                    <View style={styles.bottomRow}>
                        <View>
                            <Text style={styles.price}>Rs. 649.00</Text>
                            <Text style={styles.oldPrice}>Rs. 799.00</Text>
                        </View>

                        <View style={styles.qtyContainer}>
                            <Text style={styles.qtyBtn}>−</Text>
                            <Text style={styles.qtyText}>1</Text>
                            <Text style={styles.qtyBtn}>+</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionContainer}>

                    <View style={styles.card}>

                        <View style={styles.titleRow}>
                            <Image source={Images.nutritionIcon} style={styles.titleIcon} />
                            <Text style={styles.sectionTitle}>Nutritional Facts</Text>
                        </View>

                        {[
                            { label: 'Energy', value: '331 kcal' },
                            { label: 'Protein', value: '12.3 g' },
                            { label: 'Dietary Fiber', value: '8 g' },
                            { label: 'Iron', value: '2.8 mg' },
                        ].map((item, index) => (
                            <View key={index}>

                                <View style={styles.row}>
                                    <Text style={styles.label}>{item.label}</Text>
                                    <Text style={styles.value}>{item.value}</Text>
                                </View>

                                {index !== 3 && <View style={styles.divider} />}

                            </View>
                        ))}

                    </View>

                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>Customer Reviews</Text>

                        <Text
                            style={styles.viewAll}
                            onPress={() => console.log('View All clicked')}
                        >
                            View All
                        </Text>
                    </View>

                    <View style={styles.reviewCard}>

                        <View style={styles.reviewTop}>

                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>RS</Text>
                            </View>

                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.name}>Rohan Sharma</Text>
                                    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                                </View>
                            </View>

                        </View>

                        <Text style={styles.reviewText}>
                            Excellent quality! The grains are clean and cook perfectly.
                            I use it for making upma and it tastes amazing. Highly
                            recommended for fitness enthusiasts.
                        </Text>

                    </View>

                </View>


            </ScrollView>
        </SafeAreaView>



    )
}

export default ProductDetails


const styles = StyleSheet.create({
    infoContainer: {
        paddingHorizontal: 24,
        marginTop: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tag: {
        backgroundColor: '#0D614E1A',
        color: '#0D614E',
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        fontFamily: Fonts.PoppinsSemiBold
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D614E1A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    star: {
        fontSize: 14,
    },
    starIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: '600',
        color: '#0D614E',

    },
    title: {
        fontSize: 30,
        marginTop: 10,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold
    },
    desc: {
        marginTop: 2,
        color: '#475569',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 400
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0D614E',
    },
    oldPrice: {
        textDecorationLine: 'line-through',
        color: '#A0A0A0',
        fontSize: 12,
        fontWeight: 400
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 6,
        height: 36,
        borderWidth: 1,
        borderColor: '#0D614E1A'
    },
    qtyBtn: {
        width: 32,
        height: 32,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 18,
        color: '#0D614E',
    },
    qtyText: {
        minWidth: 30,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionContainer: {
        paddingHorizontal: 24,
        marginTop: 20,
    },
    card: {
        backgroundColor: '#F6F6F6',
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 28,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleIcon: {
        width: 16,
        height: 16,
        marginRight: 6,
        resizeMode: 'contain',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#ECECEC',
    },
    label: {
        color: '#475569',
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
        color: '#0F172A',
        lineHeight: 20
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    viewAll: {
        color: '#0D614E',
        fontWeight: '600',
        fontSize: 14
    },
    reviewCard: {
        backgroundColor: '#F6F6F6',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
    },
    reviewTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
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
        lineHeight: 20,
        color: '#0F172A'
    },
    stars: {
        color: '#FFD700',
        fontSize: 12,
    },
    reviewText: {
        marginTop: 10,
        color: '#475569',
        fontSize: 12,
        lineHeight: 18,
        fontWeight: 400
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
});