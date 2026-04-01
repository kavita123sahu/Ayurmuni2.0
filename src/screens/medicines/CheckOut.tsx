import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import { Images } from '../../common/Images'
import { Fonts } from '../../common/Fonts';

const CheckOut = () => {

    const [selectedSpeed, setSelectedSpeed] = useState('standard'); // ✅ NEW

    const orderData = [
        {
            id: '1',
            name: 'Amoxicillin',
            desc: '500mg • 20 Capsules',
            price: '$18.50',
            icon: Images.medicine,
        },
        {
            id: '2',
            name: 'Paracetamol',
            desc: '500mg • 10 Tablets',
            price: '$5.25',
            icon: Images.medicine,
        },
        {
            id: '3',
            name: 'Cough Syrup',
            desc: '100ml • Sugar Free',
            price: '$12.90',
            icon: Images.medicine,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>

            <AppHeader
                title="Checkout"
                leftIcon={Images.backIcon}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
            >

                <View style={styles.header}>
                    <Text style={styles.stepText}>Step 3: Finalize Order</Text>
                    <Text style={styles.count}>3 / 3</Text>
                </View>

                <View style={styles.progressBg}>
                    <View style={styles.progressFill} />
                </View>

                {/* DELIVERY ADDRESS */}
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <TouchableOpacity>
                        <Text style={styles.link}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.addressCard}>
                    <View style={styles.iconBox}>
                        <Image source={Images.location} style={styles.icon} />
                    </View>
                    <View>
                        <Text style={styles.addressTitle}>Home</Text>
                        <Text style={styles.addressDesc}>
                            123 Medical Lane, Health City, HC 45678, North Block
                        </Text>
                    </View>
                </View>

                {/* ORDER SUMMARY + ADD MORE */}
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <TouchableOpacity>
                        <Text style={styles.link}>+ Add more items</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.summaryCard}>
                    <FlatList
                        data={orderData}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                        renderItem={({ item }) => (
                            <View style={styles.orderRow}>
                                <View style={styles.orderLeft}>
                                    <View style={styles.smallIconBox}>
                                        <Image source={item.icon} style={styles.smallIcon} />
                                    </View>
                                    <View>
                                        <Text style={styles.medName}>{item.name}</Text>
                                        <Text style={styles.medDesc}>{item.desc}</Text>
                                    </View>
                                </View>
                                <Text style={styles.price}>{item.price}</Text>
                            </View>
                        )}
                    />
                </View>

                <Text style={styles.sectionTitle}>Delivery Speed</Text>

                <View style={styles.speedRow}>

                    <TouchableOpacity
                        style={[
                            styles.speedCard,
                            selectedSpeed === 'standard' && styles.activeSpeed
                        ]}
                        onPress={() => setSelectedSpeed('standard')}
                    >
                        <Text style={selectedSpeed === 'standard' ? styles.speedTitleActive : styles.speedTitle}>
                            Standard
                        </Text>
                        <Text style={styles.speedDesc}>2-3 Business Days</Text>
                        <Text style={styles.free}>Free</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.speedCard,
                            selectedSpeed === 'express' && styles.activeSpeed
                        ]}
                        onPress={() => setSelectedSpeed('express')}
                    >
                        <Text style={selectedSpeed === 'express' ? styles.speedTitleActive : styles.speedTitle}>
                            Express
                        </Text>
                        <Text style={styles.speedDesc}>Within 24 Hours</Text>
                        <Text style={styles.price}>$9.99</Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <TouchableOpacity>
                        <Text style={styles.link}>Change</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.paymentCard}>
                    <Image source={Images.card} style={styles.cardIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.medName}>Visa ending in 4242</Text>
                        <Text style={styles.medDesc}>Expires 12/26</Text>
                    </View>
                    <Image source={Images.arrowRight} style={styles.arrow} />
                </View>

                <View style={styles.billRow}>
                    <Text style={styles.billText}>Subtotal</Text>
                    <Text style={styles.billprize}>$36.65</Text>
                </View>

                <View style={styles.billRow}>
                    <Text style={styles.billText}>Delivery Fee</Text>
                    <Text style={styles.free}>
                        {selectedSpeed === 'standard' ? 'Free' : '$9.99'}
                    </Text>
                </View>

                <View style={styles.billRow}>
                    <Text style={styles.total}>Total Amount</Text>
                    <Text style={styles.totalPrice}>
                        {selectedSpeed === 'standard' ? '$36.65' : '$46.64'}
                    </Text>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.checkout}>
                <View style={styles.checkoutRow}>
                    <Text style={styles.checkoutText}>Place Order</Text>
                    <Image source={Images.arrowRight} style={styles.checkoutIcon} />
                </View>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

export default CheckOut;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFB',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    stepText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    count: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold
    },

    progressBg: {
        height: 8,
        backgroundColor: '#0D614E33',
        borderRadius: 10,
        marginVertical: 10,
    },

    progressFill: {
        width: '100%',
        height: 8,
        backgroundColor: '#0D614E',
        borderRadius: 10,
    },

    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginTop: 16,
        marginBottom: 10,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    link: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    addressCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    iconBox: {
        height: 40,
        width: 40,
        borderRadius: 10,
        backgroundColor: '#0D614E1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    icon: {
        height: 18,
        width: 18,
        tintColor: '#0D614E',
    },

    addressTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    addressDesc: {
        fontSize: 11,
        color: '#64748B',
        width: 220,
    },

    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    orderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    smallIconBox: {
        height: 36,
        width: 36,
        borderRadius: 8,
        backgroundColor: '#F1F5F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    smallIcon: {
        height: 18,
        width: 18,
        tintColor: '#0D614E',
    },

    medName: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A'
    },

    medDesc: {
        fontSize: 12,
        color: '#64748B',
    },

    price: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginTop:8
    },

    speedRow: {
        flexDirection: 'row',
        gap: 10,
    },

    speedCard: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    activeSpeed: {
        backgroundColor: '#0D614E0D',
        borderColor: '#0D614E80',
    },

    speedTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    speedTitleActive: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },

    speedDesc: {
        fontSize: 12,
        color: '#64748B',
        marginVertical: 4,
    },

    free: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
        marginTop:8
    },

    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    cardIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },

    arrow: {
        width: 16,
        height: 16,
        tintColor: '#64748B',
    },

    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    billText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium
    },

    billprize: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold
    },

    total: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A'
    },

    totalPrice: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },



    checkout: {
        backgroundColor: '#0D614E',
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: 20
    },

    checkoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    checkoutText: {
        color: '#ffff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    checkoutIcon: {
        width: 24,
        height: 24,
        marginLeft: 8,
        tintColor: '#fff',
        top: -2
    },
});