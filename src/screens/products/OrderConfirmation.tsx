import React, { useEffect, useState } from 'react';
import FeedbackModal from '../FeedbackModal';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ListRenderItem,
    ImageSourcePropType,
    BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import OrderItem from '../../components/OrderItem';
import { Fonts } from '../../common/Fonts';

type OrderItemType = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    subtitle: string;
    price: string;
};

const OrderConfirmation: React.FC = () => {

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowModal(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const backAction = () => {
            setShowModal(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const orderData: OrderItemType[] = [
        {
            id: '1',
            image: Images.apple,
            title: 'Organic Broccoli',
            subtitle: '500g · Qty: 2',
            price: 'Rs. 149.00',
        },
        {
            id: '2',
            image: Images.apple,
            title: 'Red Fuji Apples',
            subtitle: '1kg · Qty: 1',
            price: 'Rs. 149.00',
        },
        {
            id: '3',
            image: Images.apple,
            title: 'Heirloom Carrots',
            subtitle: '400g · Qty: 1',
            price: 'Rs. 149.00',
        },
    ];

    const renderItem: ListRenderItem<OrderItemType> = ({ item }) => (
        <OrderItem
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
        />
    );




    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Order Confirmation"
                leftIcon={Images.backIcon}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >

                <View style={styles.successCard}>
                    <View style={styles.tickContainer}>
                        <Image source={Images.tickIcon} style={styles.tick} />
                    </View>

                    <Text style={styles.successTitle}>
                        Order Placed Successfully!
                    </Text>

                    <Text style={styles.successDesc}>
                        Thank you for your purchase. Your organic goodies are being prepared and will be on their way soon!
                    </Text>

                    <TouchableOpacity style={styles.trackBtn}>
                        <Text style={styles.trackText}>Track Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.continueBtn} onPress={() => setShowModal(true)}>
                        <Text style={styles.continueText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.orderDetailsContainer}>

                    <Text style={styles.orderDetailsTitle}>Order Details</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Order ID</Text>
                        <Text style={styles.orderId}>#ORD-77321</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Estimated Delivery</Text>
                        <Text style={styles.value}>Oct 24, 2023</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Payment Method</Text>
                        <Text style={styles.value}>Cash on Delivery</Text>
                    </View>

                </View>

                <Text style={styles.sectionTitle}>Order Summary</Text>

                <View style={styles.card}>

                    <FlatList
                        data={orderData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />

                    <View style={styles.divider} />

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>Rs. 298.00</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Shipping</Text>
                        <Text style={styles.value}>Free</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>Rs. 599.00</Text>
                    </View>

                </View>

            </ScrollView>

            <FeedbackModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={() => {
                    setShowModal(false);
                    // navigation.navigate('Home'); 
                }}
            />
        </SafeAreaView>
    );
};

export default OrderConfirmation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFB',
    },

    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },

    successCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },

    tickContainer: {
        backgroundColor: '#ffff',
        height: 80,
        width: 80,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },

    tick: {
        height: 80,
        width: 80,
    },

    successTitle: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 6,
        lineHeight: 30
    },

    successDesc: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 21,
        fontFamily: Fonts.PoppinsMedium
    },

    trackBtn: {
        backgroundColor: '#0D614E',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },

    continueBtn: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderColor: '#0D614E1A',
        borderWidth: 1
    },

    trackText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold
    },

    continueText: {
        color: '#0D614E',
        alignItems: 'center',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },

    orderDetailsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#006B590D',
        shadowColor: '#0000000D',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },

    orderDetailsTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',

        marginBottom: 12,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    label: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium
    },

    value: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold
    },

    orderId: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold
    },

    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 10,
    },

    totalLabel: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    totalValue: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },
});