// screens/CheckoutScreen.tsx
// Swiggy/Zomato style — Payment method select → Order place
import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, StatusBar, ActivityIndicator, Image, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import { usePlaceOrder } from '../../hooks/UsePlaceOrder';
import { Fonts } from '../../common/Fonts';
import Header from '../../components/Header';
import { Images } from '../../common/Images';

// ── Types ─────────────────────────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'online';

// ── Small reusable pieces ─────────────────────────────────────────────────────
const Divider = () => <View style={styles.divider} />;

const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

const Row = ({ label, value, isTotal, isFree }: any) => (
    <View style={styles.rowBetween}>
        <Text style={[styles.rowLabel, isTotal && styles.totalLabel]} numberOfLines={2}>
            {label}
        </Text>
        <Text
            style={[styles.rowValue, isTotal && styles.totalValue, isFree && styles.freeText]}
            numberOfLines={1}
            adjustsFontSizeToFit
        >
            {value}
        </Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmScreen = ({ navigation, route }: any) => {
    const { cartItems = [], address = {}, charges = {} } = route?.params ?? {};

    console.log("cariytemmmmmmmmmṁ,", cartItems,)
    console.log("addresssemmmmmmmmmṁ,", address,)
    console.log("chargesemmmmmmmmmṁ,", charges,)



    const { isPlacing, orderError, placeOrder } = usePlaceOrder();

    console.log("orderpalcoimgg", isPlacing, orderError, placeOrder);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cod');
    const [razorpayLoading, setRazorpayLoading] = useState(false);

    // ── Animated values ───────────────────────────────────────────────────────
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleBtn = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start();
    }, []);

    // animate method card switch
    const selectMethod = (method: PaymentMethod) => {
        setSelectedMethod(method);
        Animated.sequence([
            Animated.timing(scaleBtn, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleBtn, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
    };

    // ── Price calculation ─────────────────────────────────────────────────────
    const subtotal = cartItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const shippingFee = charges.shipping_charges ?? 50;
    const codFee = selectedMethod === 'cod' ? (charges.cod_charges ?? 30) : 0;
    const total = subtotal + shippingFee + codFee;
    const isFreeShip = shippingFee === 0;

    // ── COD order ─────────────────────────────────────────────────────────────
    const handleCOD = async () => {
        const result = await placeOrder(cartItems, {
            delivery_address_id: address.id,
            shipping_charges: shippingFee,
            cod_charges: codFee,
            payment_type: 'cod',
            payment_method: 'cash',
            shipping_method: 'STD',

        });
        console.log('orderPAIIII', result);
        if (result?.success) {
            navigation.replace('OrderConfirmation', {
                orderResult: result?.data
            })
            // navigation.replace('OrderSuccess', {
            //     order_id: result.data?.order_id,
            //     total: total.toFixed(0),
            //     item_count: cartItems.length,
            // });
        }
    };

    // ── Online order via Razorpay ─────────────────────────────────────────────
    const handleOnline = async () => {
        setRazorpayLoading(true);
        try {
            // Step 1: Create order on your backend → get razorpay_order_id
            const orderRes = await placeOrder(cartItems, {
                delivery_address_id: address.id,
                shipping_charges: shippingFee,
                cod_charges: 0,
                payment_type: 'prepaid',
                payment_method: 'upi',
                shipping_method: 'STD',
            });

            if (!orderRes?.success) return;

            // Step 2: Open Razorpay checkout
            const options = {
                description: 'Order Payment',
                currency: 'INR',
                key: 'YOUR_RAZORPAY_KEY_ID',  // apna key daal
                amount: String(total * 100),      // paise mein
                order_id: orderRes.data?.razorpay_order_id,
                name: 'AyurMuni',
                prefill: {
                    email: address.email ?? '',
                    contact: address.phone ?? '',
                    name: address.name ?? '',
                },
                theme: { color: '#0D614E' },
            };

            const paymentData = await RazorpayCheckout.open(options);

            // Step 3: Navigate to success
            navigation.replace('OrderSuccess', {
                order_id: orderRes.data?.order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                total: total.toFixed(0),
                item_count: cartItems.length,
            });
        } catch (err: any) {
            // err.code 0 = user cancelled, 2 = failed
            if (err?.code !== 0) {
                console.error('[RAZORPAY ERROR]', err);
            }
        } finally {
            setRazorpayLoading(false);
        }
    };

    const handlePlaceOrder = () => {
        if (selectedMethod === 'cod') handleCOD();
        else handleOnline();
    };

    const isLoading = isPlacing || razorpayLoading;

    const slideY = slideAnim.interpolate({
        inputRange: [0, 1], outputRange: [40, 0],
    });

    return (
        <SafeAreaView style={styles.safe}>

            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            {/* Header */}

            <Header title='Checkout' onBack={() => navigation.goBack()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideY }] }}>

                    {/* ── Delivery Address ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>📍</Text>
                            <SectionTitle title="Delivery address" />
                        </View>
                        <Text style={styles.addressName}>{address?.address_type_name ?? 'Home'}</Text>
                        <Text style={styles.addressLine}>
                            {address.address_line_1 ?? ''} {address.address_line_2 ?? ''}, {address?.city ?? ''},{' '}
                            {address?.zipcode ?? ''}
                        </Text>
                        {/* <Text style={styles.addressPhone}>📞 {address.phone ?? '+91 96914 57891'}</Text> */}
                    </View>

                    {/* ── Order Summary ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>🛒</Text>
                            <SectionTitle title="Order summary" />
                        </View>
                        {cartItems.map((item: any) => (
                            <Row
                                key={item.variant_id}
                                label={`${item.name} (x${item.quantity})`}
                                value={`₹${Math.round(item.price * item.quantity)}`}
                            />
                        ))}
                        <Divider />
                        <Row label="Subtotal" value={`₹${Math.round(subtotal)}`} />
                        <Row label="Shipping" value={isFreeShip ? 'Free' : `₹${shippingFee}`} isFree={isFreeShip} />
                        {selectedMethod === 'cod' && <Row label="COD charges" value={`₹${codFee}`} />}
                        <Divider />
                        <Row label="Total payable" value={`₹${Math.round(total)}`} isTotal />
                    </View>

                    {/* ── Payment Method ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>💳</Text>
                            <SectionTitle title="Payment method" />
                        </View>

                        {/* COD Option */}
                        <TouchableOpacity
                            style={[styles.methodCard, selectedMethod === 'cod' && styles.methodCardSelected]}
                            onPress={() => selectMethod('cod')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.methodLeft}>
                                <View style={[styles.radioOuter, selectedMethod === 'cod' && styles.radioOuterSelected]}>
                                    {selectedMethod === 'cod' && <View style={styles.radioInner} />}
                                </View>
                                <View>
                                    <Text style={styles.methodTitle}>Cash on delivery</Text>
                                    <Text style={styles.methodDesc}>Pay ₹{codFee} extra as COD charges</Text>
                                </View>
                            </View>
                            <Text style={styles.methodEmoji}>💵</Text>
                        </TouchableOpacity>

                        {/* Online Option */}
                        <TouchableOpacity
                            style={[styles.methodCard, styles.methodCardLast, selectedMethod === 'online' && styles.methodCardSelected]}
                            onPress={() => selectMethod('online')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.methodLeft}>
                                <View style={[styles.radioOuter, selectedMethod === 'online' && styles.radioOuterSelected]}>
                                    {selectedMethod === 'online' && <View style={styles.radioInner} />}
                                </View>
                                <View>
                                    <Text style={styles.methodTitle}>Pay online</Text>
                                    <Text style={styles.methodDesc}>UPI · Card · Netbanking · Wallet</Text>
                                </View>
                            </View>
                            <View style={styles.razorpayBadge}>
                                <Text style={styles.razorpayText}>via Razorpay</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Online benefits */}
                        {selectedMethod === 'online' && (
                            <Animated.View style={[styles.benefitBox, { opacity: fadeAnim }]}>
                                {['No COD charges — save ₹30', 'Instant payment confirmation', 'UPI, cards, netbanking & wallets'].map((t) => (
                                    <View key={t} style={styles.benefitRow}>
                                        <Text style={styles.benefitDot}>✓</Text>
                                        <Text style={styles.benefitText}>{t}</Text>
                                    </View>
                                ))}
                            </Animated.View>
                        )}
                    </View>

                    {/* ── Error ── */}
                    {!!orderError && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️ {orderError}</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </Animated.View>
            </ScrollView>

            {/* ── Sticky Place Order Bar ── */}
            <Animated.View style={[styles.stickyBar, { transform: [{ scale: scaleBtn }] }]}>
                <View style={styles.stickyLeft}>
                    <Text style={styles.stickyLabel}>
                        {selectedMethod === 'cod' ? 'Pay on delivery' : 'Pay now'}
                    </Text>
                    <Text style={styles.stickyTotal}>₹{Math.round(total)}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.placeBtn, isLoading && styles.placeBtnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isLoading}
                    activeOpacity={0.85}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.placeBtnText}>
                            {selectedMethod === 'cod' ? 'Place order' : 'Pay & place order'}
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

export default ConfirmScreen;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F1F5F9', paddingHorizontal: 20 },
    scroll: { paddingTop: 12 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#F1F5F9',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backArrow: { fontSize: 22, color: '#0F172A' },
    headerTitle: { fontSize: 17, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },

    // Card
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    cardIcon: { fontSize: 18 },
    sectionTitle: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },

    // Address
    addressName: { fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A', marginBottom: 2 },
    addressLine: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#64748B', lineHeight: 20 },
    addressPhone: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8', marginTop: 4 },

    // Row
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
    rowLabel: { flex: 1, flexShrink: 1, fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#64748B', lineHeight: 20 },
    rowValue: { flexShrink: 0, fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A', textAlign: 'right', maxWidth: '40%' },
    totalLabel: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    totalValue: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#0D614E' },
    freeText: { color: '#1D9E75' },

    // Payment method cards
    methodCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
        padding: 14, marginBottom: 10, backgroundColor: '#F8FAFC',
    },
    methodCardLast: { marginBottom: 0 },
    methodCardSelected: { borderColor: '#0D614E', backgroundColor: '#F0FAF6' },
    methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    methodTitle: { fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    methodDesc: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8', marginTop: 2 },
    methodEmoji: { fontSize: 22 },

    // Radio
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    radioOuterSelected: { borderColor: '#0D614E' },
    radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#0D614E' },

    // Razorpay badge
    razorpayBadge: { backgroundColor: '#072654', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    razorpayText: { fontSize: 10, fontFamily: Fonts.PoppinsSemiBold, color: '#FFFFFF', letterSpacing: 0.3 },

    // Benefits
    benefitBox: {
        backgroundColor: '#F0FAF6', borderRadius: 10, padding: 12,
        marginTop: 10, gap: 6,
    },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    benefitDot: { fontSize: 13, color: '#1D9E75', fontFamily: Fonts.PoppinsSemiBold },
    benefitText: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: '#0F172A' },

    // Error
    errorBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#FECACA' },
    errorText: { fontSize: 13, fontFamily: Fonts.PoppinsMedium, color: '#DC2626' },

    // Sticky bar
    stickyBar: {
        position: 'absolute', bottom: 10, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 12,
        gap: 12,
    },
    stickyLeft: { flex: 0 },
    stickyLabel: { fontSize: 11, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8' },
    stickyTotal: { fontSize: 20, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    placeBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: '#0D614E', justifyContent: 'center', alignItems: 'center', shadowColor: '#0D614E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    placeBtnDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
    placeBtnText: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#FFFFFF' },
});