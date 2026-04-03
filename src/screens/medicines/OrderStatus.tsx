import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';

interface OrderItem {
    id: string;
    name: string;
    sub: string;
    price: string;
    image: any;
}

const orderData: OrderItem[] = [
    {
        id: '1',
        name: 'Amoxicillin 500mg',
        sub: '10 Capsules',
        price: '149.00',
        image: Images.prItem,
    },
    {
        id: '2',
        name: 'Paracetamol',
        sub: '20 Tablets',
        price: '149.00',
        image: Images.prItem,
    },
];

const OrderStatus: React.FC = () => {

    const renderItem: ListRenderItem<OrderItem> = ({ item }) => {
        return (
            <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                    <View style={styles.imageBox}>
                        <Image source={item.image} style={styles.itemImage} />
                    </View>

                    <View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSub}>{item.sub}</Text>
                    </View>
                </View>

                <Text style={styles.price}>Rs. {item.price}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader title="Order Status" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                <View style={styles.successWrapper}>
                    <View style={styles.successCircle}>
                        <Image source={Images.tickIcon} style={styles.successIcon} />
                    </View>
                </View>

                <Text style={styles.title}>Order Confirmed!</Text>

                <Text style={styles.subtitle}>
                    Your order has been placed successfully. We'll notify you when it's on the way
                </Text>

                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.label}>ORDER ID</Text>
                            <Text style={styles.orderId}>#ORD-123456</Text>
                        </View>

                        <View style={styles.alignEnd}>
                            <Text style={styles.label}>DELIVERY EST.</Text>
                            <Text style={styles.delivery}>Today, 4:30 PM</Text>
                        </View>
                    </View>

                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <FlatList
                        data={orderData}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalText}>Total Paid</Text>
                        <Text style={styles.totalAmount}>Rs. 498.00</Text>
                    </View>
                </View>

                <View style={styles.verifyBox}>
                    <View style={styles.verifyLeft}>
                        <View style={styles.clockBox}>
                            <Image source={Images.waitClock} style={styles.clockIcon} />
                        </View>

                        <View>
                            <Text style={styles.verifyTitle}>
                                Verifying your Prescription
                            </Text>
                            <Text style={styles.verifySub}>
                                Pharmacist is verifying your prescription
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn}>

                    <Text style={styles.primaryText}>Continue Shopping</Text>
                </TouchableOpacity>

                <Text style={styles.support}>
                    Need help? <Text style={styles.contact}>Contact Support</Text>
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderStatus;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFB',
    },

    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },

    successWrapper: {
        alignItems: 'center',
        elevation: 4,
    },

    successCircle: {
        height: 128,
        width: 128,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#0D614E0D",
        backgroundColor: '#ffff',
        elevation: 2,
    },

    successIcon: {
        height: 80,
        width: 80,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
        marginTop: 12,
        color: '#0F172A',
        lineHeight: 32
    },

    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        color: '#64748B',
        marginTop: 6,
        lineHeight: 24,
        fontFamily: Fonts.PoppinsMedium
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 18,
        elevation: 1,
        marginBottom: 10
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    alignEnd: {
        alignItems: 'flex-end',

    },

    label: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium
    },

    orderId: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
        marginTop: 2,
    },

    delivery: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginTop: 2,
    },

    summaryTitle: {
        marginTop: 16,
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        borderTopColor: '#EFEFEF',
        borderTopWidth: 1,
        paddingTop: 14,
    },

    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        alignItems: 'center',
    },

    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    imageBox: {
        height: 40,
        width: 40,
        borderRadius: 8,
        backgroundColor: '#E6F2EF',
        marginRight: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },

    itemImage: {
        height: '100%',
        width: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
    },

    itemName: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    itemSub: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
        fontFamily: Fonts.PoppinsMedium,
    },

    price: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsBold,
        color: '#0D614E',
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        paddingTop: 12,
    },

    totalText: {
        fontSize: 13,
        color: '#7A7A7A',
    },

    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0D614E',
    },

    verifyBox: {
        backgroundColor: '#FFC1070D',
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#FFC10733'
    },

    verifyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },

    clockBox: {
        height: 40,
        width: 40,
        borderRadius: 12,
        backgroundColor: '#FFC107',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    clockIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },

    primaryBtn: {
        backgroundColor: '#0D614E',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    trackIcon: {
        height: 16,
        width: 16,
        marginRight: 6,
        resizeMode: 'contain',
        tintColor: '#fff',
    },

    primaryText: {
        color: '#ffff',
        fontSize: 14,
        fontWeight: '600',
    },

    secondaryBtn: {
        borderWidth: 1,
        borderColor: '##0D614E33',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        fontWeight: '600',
    },

    secondaryText: {
        color: '#0D614E',
        fontSize: 14,
        fontWeight: '500',
    },

    support: {
        textAlign: 'center',
        marginTop: 14,
        fontSize: 14,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium
    },

    contact: {
        color: '#0D614E',
    },

    verifyTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFC107',
    },

    verifySub: {
        fontSize: 12,
        color: '#FFC107',
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 1,
    },
});