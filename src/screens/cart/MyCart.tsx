import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import PromoScreen from '../../components/PromoScreen';
import { Colors } from '../../common/Colors';

type CartItem = {
    id: string;
    name: string;
    weight: string;
    price: number;
    quantity: number;
    image: any;
};

const initialData: CartItem[] = [
    {
        id: '1',
        name: 'Foxtail Millet',
        weight: '500g Pack',
        price: 149,
        quantity: 1,
        image: Images.detailimage,
    },
    {
        id: '2',
        name: 'Foxtail Millet',
        weight: '500g Pack',
        price: 149,
        quantity: 1,
        image: Images.detailimage,
    },
];

const MyCart = ({ navigation }: any) => {

    const [cart, setCart] = useState<CartItem[]>(initialData);
    const [discount, setDiscount] = useState<number>(10);
    const [selectedItems, setSelectedItems] = useState<string[]>([]); // ✅ FIX

    // ✅ optimized handlers
    const increaseQty = useCallback((id: string) => {
        setCart(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    }, []);

    const decreaseQty = useCallback((id: string) => {
        setCart(prev => {
            const item = prev.find(i => i.id === id);

            if (!item) return prev;
            // qty = 1 → delete item
            if (item.quantity === 1) {
                return prev.filter(i => i.id !== id);
            }
            // qty > 1 → normal decrease
            return prev.map(i =>
                i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
        // selected list se bhi hata de
        setSelectedItems(prev => prev.filter(i => i !== id));

    }, []);

    {/*  const decreaseQty = useCallback((id: string) => {
        setCart(prev =>
            prev.map(item =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    }, []);*/}

    const toggleSelect = useCallback((id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    }, []);

    const deleteSelected = useCallback(() => {
        if (selectedItems.length === 0) return;

        setCart(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
    }, [selectedItems]);

    // ✅ memo calculations
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const delivery = 129;
    const total = subtotal + delivery - discount;

    return (
        // <ScreenWrapper>
            <SafeAreaView style={{ flex: 1,  backgroundColor: '#FDFDFB' }}>

                <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFF'} />

                <AppHeader
                    title="My Cart"
                    leftIcon={Images.backIcon}
                    onLeftPress={() => navigation.goBack()}
                    rightIcon={selectedItems.length > 0 ? Images.deleteitem : null}
                    onRightPress={deleteSelected} // ✅ FIX
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30, paddingTop:20, backgroundColor: '#FDFDFB',  paddingHorizontal: 20 }}
                >

                    {cart.map((item) => {
                        const isSelected = selectedItems.includes(item.id);

                        return (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.9}
                                onLongPress={() => toggleSelect(item.id)}
                                onPress={() => {
                                    if (selectedItems.length > 0) toggleSelect(item.id);
                                }}
                                style={styles.card}
                            >

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                    <TouchableOpacity
                                        onPress={() => toggleSelect(item.id)}
                                        style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxActive
                                        ]}
                                    >
                                        {isSelected && <View style={styles.innerDot} />}
                                    </TouchableOpacity>

                                    <Image source={item.image} style={styles.image} />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>{item.name}</Text>
                                    <Text style={styles.weight}>{item.weight}</Text>
                                    <Text style={styles.price}>Rs. {item.price}.00</Text>
                                </View>

                                <View style={styles.qtyBox}>
                                    <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.btn}>
                                        <Text style={styles.plus}>+</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.qty}>{item.quantity}</Text>

                                    <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.btn}>
                                        <Text style={styles.minus}>−</Text>
                                    </TouchableOpacity>
                                </View>

                            </TouchableOpacity>
                        );
                    })}

                    <PromoScreen />

                    <View style={styles.billBox}>
                        <Row label="Subtotal" value={`Rs. ${subtotal.toFixed(2)}`} />
                        <Row label="Delivery Fee" value={`Rs. ${delivery}`} />
                        <Row label="Discount" value={`Rs. -${discount}`} />

                        <View style={styles.divider} />

                        <Row label="Total" value={`Rs. ${total.toFixed(2)}`} isTotal />

                        <Text style={styles.tax}>INCLUSIVE OF TAXES</Text>
                    </View>

                </ScrollView>

                <TouchableOpacity style={styles.checkout} onPress={() => navigation.navigate('Checkout')}>
                    <View style={styles.checkoutRow}>
                        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                        <Image source={Images.arrowRight} style={styles.checkoutIcon} />
                    </View>
                </TouchableOpacity>

            </SafeAreaView>
        // </ScreenWrapper>
    );
};

type RowProps = {
    label: string;
    value: string;
    isTotal?: boolean;
};

const Row: React.FC<RowProps> = ({ label, value, isTotal }) => (
    <View style={styles.row}>
        <Text style={[styles.rowLabel, isTotal && styles.totalLabel]}>
            {label}
        </Text>

        <Text
            style={[
                styles.rowValue,
                isTotal && styles.totalValue,
                label === 'Discount' && styles.discountValue,
            ]}
        >
            {value}
        </Text>
    </View>
);

export default MyCart;

const styles = StyleSheet.create({

    card: {
        flexDirection: 'row',
        backgroundColor: '#0D614E0D',
        borderRadius: 24,
        padding: 16,
        marginTop: 4,
        alignItems: 'center',
        marginBottom: 10
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkboxActive: {
        borderColor: '#0D614E',
        backgroundColor: '#0D614E1A',
    },

    innerDot: {
        width: 10,
        height: 10,
        borderRadius: 3,
        backgroundColor: '#0D614E',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 16,
        marginRight: 12,
    },

    title: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A'
    },

    weight: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium
    },

    price: {
        top: 8,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 18,
    },

    qtyBox: {
        width: 40,
        height: 108,
        backgroundColor: '#DCE7E5',
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 2,
        paddingHorizontal: 3,
    },

    plus: {
        fontSize: 16,
        color: '#0D614E',
        fontWeight: '600',
    },

    minus: {
        fontSize: 16,
        color: '#0D614E',
        fontWeight: '600',
    },

    btn: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: '#F1F5F4',
        justifyContent: 'center',
        alignItems: 'center',
    },

    qty: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },

    promo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0D614E1A',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 10,
        backgroundColor: '#ffff',
    },

    promoIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },

    promoText: {
        color: '#94A3B8',
        fontSize: 16,
    },

    applyBtn: {
        backgroundColor: '#0D614E',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },

    applyText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium
    },

    billBox: {
        backgroundColor: '#ffff',
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
    },

    rowText: {
        color: '#64748B',
    },

    totalText: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 16,
        color: '#0F172A',
    },

    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 14,
    },

    promoInput: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
        flex: 1,
    },

    checkout: {
        backgroundColor: '#0D614E',
        // marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: 20,
        // gap: 12,
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
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    rowLabel: {
        color: '#64748B',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    rowValue: {
        color: '#0F172A',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    discountValue: {
        color: '#0D614E',
    },

    // 🔥 TOTAL FIX
    totalLabel: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    totalValue: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },

    promoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // ✅ IMPORTANT
    },

    tax: {
        fontSize: 10,
        color: '#94A3B8',
        textAlign: 'right',
        fontFamily: Fonts.PoppinsRegular,
        top: -10
    },


});