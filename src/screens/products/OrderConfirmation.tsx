import React, { useEffect, useRef, useState } from 'react';
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
    BackHandler,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import OrderItem from '../../components/OrderItem';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';

type DeliveryAddress = {
    id: string;
    address_type: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
};

type OrderItemType = {
    id?: string;
    product_name?: string;
    name?: string;
    title?: string;
    quantity?: number;
    variant: any;
    qty?: number;
    unit?: string;
    price?: string | number;
    total_price?: string | number;
    image?: string;
    product?: { name?: string; image?: string };
};

type OrderResult = {
    id: string;
    order_code: string;
    order_status: string;
    payment_method: string;
    payment_type: string;
    cod_charges: string;
    shipping_charges: string;
    total_discount: string;
    prepaid_amount: string;
    total_amount: string;
    created_at: string;
    updated_at: string;
    delivery_address: DeliveryAddress;
    items: OrderItemType[];
};

const formatCurrency = (val?: string | number) => {
    const num = Number(val ?? 0);
    return `Rs. ${num.toFixed(2)}`;
};

const formatDate = (dateStr?: string, addDays = 0) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (addDays) d.setDate(d.getDate() + addDays);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getItemTitle = (item: OrderItemType) =>
    item?.variant?.variant_title || '';

const getItemQty = (item: OrderItemType) => item.quantity ?? item.qty ?? 1;

const getItemImage = (item: OrderItemType) =>
    item?.variant?.image_url || item.product?.image;

const getItemPrice = (item: OrderItemType) =>
    formatCurrency(item.total_price ?? item.price);

const OrderConfirmation: React.FC = (props: any) => {
    const [showModal, setShowModal] = useState(false);

    const orderResult: OrderResult | undefined = props.route?.params?.orderResult;

    // ---- Animations ----
    const tickScale = useRef(new Animated.Value(0)).current;
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardTranslate = useRef(new Animated.Value(24)).current;
    const detailsFade = useRef(new Animated.Value(0)).current;
    const detailsTranslate = useRef(new Animated.Value(24)).current;
    const summaryFade = useRef(new Animated.Value(0)).current;
    const summaryTranslate = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(tickScale, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(cardFade, {
                    toValue: 1,
                    duration: 350,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(cardTranslate, {
                    toValue: 0,
                    duration: 350,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(detailsFade, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(detailsTranslate, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(summaryFade, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(summaryTranslate, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

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
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const items = orderResult?.items ?? [];

    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.total_price ?? item.price ?? 0);
        return sum + price;
    }, 0);

    const shipping = Number(orderResult?.shipping_charges ?? 0);
    const codCharges = Number(orderResult?.cod_charges ?? 0);
    const discount = Number(orderResult?.total_discount ?? 0);

    const renderItem: ListRenderItem<OrderItemType> = ({ item }) => (
        <OrderItem
            image={getItemImage(item)}
            title={getItemTitle(item)}
            subtitle={`${item.unit ?? ''}`.trim() || `Qty: ${getItemQty(item)}`}
            price={getItemPrice(item)}
            qty={getItemQty(item)}
        />
    );

    const address = orderResult?.delivery_address;
    const addressLine = address
        ? `${address.address_line_1}, ${address.address_line_2}, ${address.city}, ${address.state} - ${address.zipcode}`
        : '';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={'#FFFFFFCC'} />

            <AppHeader
                title="Order Confirmation"
                onLeftPress={() => props.navigation.goBack()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View
                    style={[
                        styles.successCard,
                        { opacity: cardFade, transform: [{ translateY: cardTranslate }] },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.tickContainer,
                            { transform: [{ scale: tickScale }] },
                        ]}
                    >
                        <TablerIcon name="tick-icon" size={20} color={Colors.primaryColor} />
                    </Animated.View>

                    <Text style={styles.successTitle}>Order Placed Successfully!</Text>

                    <Text style={styles.successDesc}>
                        Thank you for your purchase. Your organic goodies are being prepared and
                        will be on their way soon!
                    </Text>

                    <TouchableOpacity style={styles.trackBtn} activeOpacity={0.8}>
                        <Text style={styles.trackText}>Track Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.continueBtn}
                        activeOpacity={0.8}
                        onPress={() => props.navigation.navigate('Home')}
                    >
                        <Text style={styles.continueText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.orderDetailsContainer,
                        { opacity: detailsFade, transform: [{ translateY: detailsTranslate }] },
                    ]}
                >
                    <Text style={styles.orderDetailsTitle}>Order Details</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Order ID</Text>
                        <Text style={styles.orderId}>#{orderResult?.order_code ?? '—'}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Estimated Delivery</Text>
                        <Text style={styles.value}>
                            {formatDate(orderResult?.created_at, 4)}
                        </Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Payment Method</Text>
                        <Text style={styles.value}>
                            {orderResult?.payment_type === 'cod'
                                ? 'Cash on Delivery'
                                : orderResult?.payment_method ?? '—'}
                        </Text>
                    </View>

                    {!!address && (
                        <View style={{ marginTop: 6 }}>
                            <Text style={styles.label}>Delivery Address</Text>
                            <Text style={[styles.value, { marginTop: 4, lineHeight: 20 }]}>
                                {addressLine}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                <Text style={styles.sectionTitle}>Order Summary</Text>

                <Animated.View
                    style={[
                        styles.card,
                        { opacity: summaryFade, transform: [{ translateY: summaryTranslate }] },
                    ]}
                >
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item.id ?? String(index)}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        ListEmptyComponent={
                            <Text style={styles.label}>No items found</Text>
                        }
                    />

                    <View style={styles.divider} />

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Shipping</Text>
                        <Text style={styles.value}>
                            {shipping > 0 ? formatCurrency(shipping) : 'Free'}
                        </Text>
                    </View>

                    {codCharges > 0 && (
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>COD Charges</Text>
                            <Text style={styles.value}>{formatCurrency(codCharges)}</Text>
                        </View>
                    )}

                    {discount > 0 && (
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Discount</Text>
                            <Text style={[styles.value, { color: '#0D614E' }]}>
                                -{formatCurrency(discount)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.rowBetween}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(orderResult?.total_amount)}
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* <FeedbackModal
                visible={showModal}
                appointmentId={props.route.params?.appointmentId}
                onClose={() => setShowModal(false)}
                onSubmit={() => {
                    setShowModal(false);
                }}
            /> */}
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
        alignItems: 'center',
        marginBottom: 20,
    },
    tickContainer: {
        backgroundColor: '#ffff',
        height: 80,
        width: 80,
        marginTop: 30,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    tick: {
        height: 80,
        width: 80,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 30,
    },
    successDesc: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 21,
        fontFamily: Fonts.PoppinsMedium,
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
        borderWidth: 1,
    },
    trackText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    continueText: {
        color: '#0D614E',
        alignItems: 'center',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
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
        fontFamily: Fonts.PoppinsMedium,
    },
    value: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    orderId: {
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
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