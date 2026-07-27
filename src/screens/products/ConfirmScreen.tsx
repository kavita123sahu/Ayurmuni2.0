// screens/CheckoutScreen.tsx
// Swiggy/Zomato style — Payment method select → Order place
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, StatusBar, ActivityIndicator, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlaceOrder } from '../../hooks/UsePlaceOrder';
import { useHomeData } from '../../hooks/UseHomeData';
import { Fonts } from '../../common/Fonts';
import AppHeader from '../../components/AppHeader';
import TablerIcon from '../../components/TablerIcon';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';

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
    const { customerData } = useHomeData();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cod');

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
    const shippingFee = Number(charges.shipping_charges ?? 50);
    const codChargeDefault = Number(charges.cod_charges ?? 30);

    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum: number, item: any) =>
                    sum + Number(item.price) * Number(item.quantity),
                0,
            ),
        [cartItems],
    );

    const codFee = selectedMethod === 'cod' ? codChargeDefault : 0;
    const total = subtotal + shippingFee + codFee;
    const isFreeShip = shippingFee === 0;

    // ── COD order ─────────────────────────────────────────────────────────────
    const handleCOD = async () => {
        if (!address?.id) {
            showSuccessToast('Please select a delivery address', 'error');
            return;
        }

        const result = await placeOrder(cartItems, {
            delivery_address_id: address.id,
            shipping_charges: 0,
            cod_charges: 0,
            payment_type: 'cod',
            payment_method: 'cash',
            shipping_method: 'STD',
            prepaid_amount: 0,
        });

        if (result?.success) {
            navigation.replace('OrderConfirmation', {
                orderResult: result?.data,
                orderedCartItems: cartItems.map((item: any) => ({
                    variant_id: String(item.variant_id),
                    quantity: Number(item.quantity),
                })),
            });
            return;
        }

        showSuccessToast(result?.message ?? orderError ?? 'Order failed', 'error');
    };

    const handleOnline = () => {
        if (!address?.id) {
            showSuccessToast('Please select a delivery address', 'error');
            return;
        }

        navigation.navigate('ProductRazorpayScreen', {
            cartItems: cartItems.map((item: any) => ({
                id: item.id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                discount: item.discount ?? 0,
            })),
            address,
            charges: {
                shipping_charges: shippingFee,
                cod_charges: 0,
            },
            customerInfo: customerData ?? {},
            totalAmount: subtotal + shippingFee,
        });
    };

    const handlePlaceOrder = () => {
        if (selectedMethod === 'cod') handleCOD();
        else handleOnline();
    };

    const isLoading = isPlacing;

    const slideY = slideAnim.interpolate({
        inputRange: [0, 1], outputRange: [40, 0],
    });

    return (
        <SafeAreaView style={styles.safe}>

            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Header */}

            <AppHeader title='Checkout' onLeftPress={() => navigation.goBack()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideY }] }}>

                    {/* ── Delivery Address ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            {/* <Text style={styles.cardIcon}>📍</Text> */}
                            <TablerIcon name='location' size={20} />
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
                            <TablerIcon name="shopping-cart" size={20} />
                            {/* <Text style={styles.cardIcon}>🛒</Text> */}
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
                            <TablerIcon name="payment" size={20} />
                            {/* <Text style={styles.cardIcon}>💳</Text> */}
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
                                    <Text style={styles.methodDesc}>Pay ₹{codChargeDefault} extra as COD charges</Text>
                                </View>
                            </View>
                            <TablerIcon name="cash" size={20} />
                            {/* <Text style={styles.methodEmoji}>💵</Text> */}
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
                                {['No COD charges — save ₹0', 'Instant payment confirmation', 'UPI, cards, netbanking & wallets'].map((t) => (
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
            {/* ── Sticky Place Order Bar ── */}

        </SafeAreaView>
    );
};

export default ConfirmScreen;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
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
        borderWidth: 1, borderColor: Colors.borderColor,
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
        position: 'absolute', bottom: 50, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E2E8F0',

        gap: 12,
    },
    stickyLeft: { flex: 0 },
    stickyLabel: { fontSize: 11, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8' },
    stickyTotal: { fontSize: 20, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    placeBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: '#0D614E', justifyContent: 'center', alignItems: 'center', shadowColor: '#0D614E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    placeBtnDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
    placeBtnText: { fontSize: 15, fontFamily: Fonts.PoppinsSemiBold, color: '#FFFFFF' },
});