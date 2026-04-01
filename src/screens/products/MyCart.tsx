import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';

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

const MyCart: React.FC = (props: any) => {
    const [cart, setCart] = useState<CartItem[]>(initialData);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(10.00);

    const increaseQty = (id: string) => {
        setCart(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decreaseQty = (id: string) => {
        setCart(prev =>
            prev.map(item =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const delivery = 129;
    const total = subtotal + delivery - discount;

    const handleApply = () => {
        if (promoCode.toLowerCase() === 'save20') {
            setDiscount(20);
        } else if (promoCode.toLowerCase() === 'save50') {
            setDiscount(50);
        } else {
            setDiscount(10);
            Alert.alert('Invalid Promo Code');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
            <AppHeader
                title="My Cart"
                leftIcon={Images.backIcon}
                onLeftPress={()=>props.navigation.goBack()}
                rightIcon={Images.deleteitem}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 20 }}
            >

                {cart.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Image source={item.image} style={styles.image} />

                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.weight}>{item.weight}</Text>
                            <Text style={styles.price}>Rs. {item.price}</Text>
                        </View>

                        <View style={styles.qtyBox}>
                            <TouchableOpacity onPress={() => increaseQty(item.id)} style={{ padding: 10, borderRadius: 5, }} >
                                <Text style={styles.plus}>+</Text>
                            </TouchableOpacity>

                            <Text style={styles.qty}>{item.quantity}</Text>

                            <TouchableOpacity onPress={() => decreaseQty(item.id)} style={{ padding: 10, borderRadius: 5 }}>
                                <Text style={styles.minus}>−</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.promo}>
                    <View style={styles.promoLeft}>
                        <Image source={Images.promoIcon} style={styles.promoIcon} />

                        <TextInput
                            placeholder="Promo Code"
                            value={promoCode}
                            onChangeText={setPromoCode}
                            placeholderTextColor="#94A3B8"
                            style={styles.promoInput}
                        />
                    </View>

                    <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                        <Text style={styles.applyText}>Apply</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.billBox}>
                    <Row label="Subtotal" value={`Rs. ${subtotal.toFixed(2)}`} />
                    <Row label="Delivery Fee" value={`Rs. ${delivery}`} />
                    <Row label="Discount" value={`Rs. -${discount}`} />

                    <View style={styles.divider} />

                    <Row label="Total" value={`Rs. ${total.toFixed(2)}`} isTotal />

                    <Text style={styles.tax}>INCLUSIVE OF TAXES</Text>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.checkout} onPress={() => props.navigation.navigate('Checkout')}>
                <View style={styles.checkoutRow}>
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>

                    <Image source={Images.arrowRight} style={styles.checkoutIcon} />
                </View>
            </TouchableOpacity>

        </SafeAreaView>
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
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
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

    qty: {
        fontSize: 13,
        fontWeight: '600',
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