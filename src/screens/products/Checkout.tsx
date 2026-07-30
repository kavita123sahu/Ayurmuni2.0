import React, { useCallback, useMemo, useState } from 'react';

import {

    View,

    Text,

    ScrollView,

    StyleSheet,

    TouchableOpacity,

    Image,

    StatusBar,

    ActivityIndicator,

    Modal,

} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { Ionicons } from '../../common/Vector';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';

import { Fonts } from '../../common/Fonts';

import { Colors } from '../../common/Colors';

import { useHomeData } from '../../hooks/UseHomeData';

import { usePlaceOrder } from '../../hooks/UsePlaceOrder';

import { useProductOnlinePayment } from '../../hooks/useProductOnlinePayment';

import TablerIcon, { TablerIconName } from '../../components/TablerIcon';

import { showSuccessToast } from '../../config/Key';

import { resolveImageUri } from '../../utils/imageUtils';



type PaymentMethod = 'cod' | 'online';



const Option = ({

    selected,

    title,

    sub,

    onPress,

    iconName,

}: {

    selected: boolean;

    title: string;

    sub?: string;

    onPress: () => void;

    iconName?: TablerIconName;

}) => (

    <TouchableOpacity

        style={[styles.option, selected && styles.optionActive]}

        onPress={onPress}

    >

        <View style={styles.row}>

            <View style={styles.radioWrapper}>

                <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>

                    {selected && <View style={styles.radioInner} />}

                </View>

            </View>



            <View style={{ flex: 1 }}>

                <Text style={styles.optionTitle}>{title}</Text>

                {sub ? <Text style={styles.optionSub}>{sub}</Text> : null}

            </View>



            {iconName ? (

                <TablerIcon name={iconName} size={22} color={Colors.primaryColor} />

            ) : null}

        </View>

    </TouchableOpacity>

);



const Row = ({ label, value, isTotal, isFree }: any) => (

    <View style={styles.rowBetween}>

        <Text

            style={[styles.rowLabel, isTotal && styles.totalLabel]}

            numberOfLines={2}

        >

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



const Checkout: React.FC = (props: any) => {

    const { totalSubtotal, selectedProducts = [] } = props.route.params ?? {};



    const [deliveryMethod, setDeliveryMethod] = useState('standard');

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cod');



    const { customerData, refreshHomeData } = useHomeData();

    const { isPlacing, orderError, placeOrder } = usePlaceOrder();

    const { isPaying, isVerifyingPayment, payOnline } = useProductOnlinePayment();



    useFocusEffect(

        useCallback(() => {

            refreshHomeData();

        }, [refreshHomeData]),

    );



    const defaultAddress =

        customerData?.addresses?.find((item: any) => item?.is_default) || null;



    const cartItems = useMemo(

        () =>

            selectedProducts.map((item: any) => ({

                id: item.id,

                cart_item_id: item.id,

                variant_id: item.variant_id,

                quantity: item.quantity,

                price: item.price,

                name: item.name,

                image: resolveImageUri(item.image),

                discount: item.discount ?? 0,

                source: item.source,

                gift_wrap: Boolean(item.gift_wrap),

            })),

        [selectedProducts],

    );



    const shippingFee: number = 50;

    const codChargeDefault = 30;



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

    // const isFreeShip = shippingFee === 0;
    // const shippingFee: number = 50;

    const isFreeShip = shippingFee === 0;

    const isLoading = isPlacing || isPaying;



    const handleCOD = async () => {

        if (!defaultAddress?.id) {

            showSuccessToast('Please select a delivery address', 'error');

            return;

        }



        const result = await placeOrder(cartItems, {

            delivery_address_id: defaultAddress.id,

            shipping_charges: shippingFee,

            cod_charges: codChargeDefault,

            payment_type: 'cod',

            payment_method: 'cash',

            shipping_method: deliveryMethod === 'express' ? 'EXPRESS' : 'STD',

            prepaid_amount: 0,

        });



        if (result?.success) {

            props.navigation.replace('OrderConfirmation', {

                orderResult: result?.data,

                orderedCartItems: cartItems.map((item: any) => ({

                    variant_id: String(item.variant_id),

                    quantity: Number(item.quantity),

                    source: item.source,

                })),

            });

            return;

        }



        showSuccessToast(result?.message ?? orderError ?? 'Order failed', 'error');

    };



    const handleOnline = async () => {

        await payOnline({

            cartItems,

            address: defaultAddress,

            
           payment_method : "upi",

            customerInfo: customerData ?? {},

            shippingFee,

            codCharges: codChargeDefault,

            onSuccess: (orderResult, orderedCartItems) => {

                props.navigation.replace('OrderConfirmation', {

                    orderResult,

                    orderedCartItems,

                });

            },

        });

    };



    const handlePlaceOrder = () => {

        if (!defaultAddress?.id) {

            showSuccessToast('Please add a delivery address before checkout', 'error');

            return;

        }



        if (selectedMethod === 'cod') {

            handleCOD();

        } else {

            handleOnline();

        }

    };



    const openProductDetails = (variantId: string) => {

        if (!variantId) {

            return;

        }

        props.navigation.navigate('ProductDetails', { varientID: variantId });

    };



    return (

        <SafeAreaView style={styles.container}>

            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFFCC" />



            <AppHeader

                title="Checkout"

                onLeftPress={() => props.navigation.goBack()}

            />



            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.sectionTitle}>Shipping Address</Text>



                <View style={styles.addressCard}>

                    {defaultAddress ? (

                        <View style={styles.addressRow}>

                            <View style={styles.iconBox}>

                                <TablerIcon name="location" size={16} color={Colors.primaryColor} />

                            </View>



                            <View style={styles.addressInfo}>

                                <Text style={styles.home}>

                                    {defaultAddress?.address_type || 'Home'}

                                </Text>

                                <Text numberOfLines={2} style={styles.addressText}>

                                    {[

                                        defaultAddress?.address_line_1,

                                        defaultAddress?.address_line_2,

                                        defaultAddress?.city,

                                        defaultAddress?.state,

                                        defaultAddress?.pincode,

                                    ]

                                        .filter(Boolean)

                                        .join(', ')}

                                </Text>

                            </View>



                            <TouchableOpacity

                                style={styles.changeBtn}

                                onPress={() => props.navigation.navigate('ManageAdrees')}

                            >

                                <Text style={styles.changeText}>Change</Text>

                            </TouchableOpacity>

                        </View>

                    ) : (

                        <View style={styles.emptyAddressContainer}>

                            <View style={styles.emptyIconWrapper}>

                                <TablerIcon name="location" size={20} color={Colors.primaryColor} />

                            </View>

                            <Text style={styles.emptyTitle}>Add Delivery Address</Text>

                            <Text style={styles.emptySubTitle}>

                                Please add an address before checkout

                            </Text>

                            <TouchableOpacity

                                style={styles.addAddressBtn}

                                onPress={() => props.navigation.navigate('ManageAdrees')}

                            >

                                <Text style={styles.addAddressText}>Add New Address</Text>

                            </TouchableOpacity>

                        </View>

                    )}

                </View>



                <Text style={styles.sectionTitle}>Delivery Method</Text>


                <Option

                    selected={deliveryMethod === 'standard'}

                    title="Standard Delivery"

                    sub="3-5 business days · Free"

                    iconName="truck"

                    onPress={() => setDeliveryMethod('standard')}

                />

                <Option
                    selected={deliveryMethod === 'express'}

                    title="Express Delivery"

                    sub="Next day delivery · Rs. 50.00"

                    iconName="bolt"

                    onPress={() => setDeliveryMethod('express')}

                />

                <Text style={styles.sectionTitle}>Payment Method</Text>



                <TouchableOpacity

                    style={[styles.methodCard, selectedMethod === 'cod' && styles.methodCardSelected]}

                    onPress={() => setSelectedMethod('cod')}

                    activeOpacity={0.8}

                >

                    <View style={styles.methodLeft}>

                        <View

                            style={[

                                styles.methodRadioOuter,

                                selectedMethod === 'cod' && styles.methodRadioOuterSelected,

                            ]}

                        >

                            {selectedMethod === 'cod' ? <View style={styles.methodRadioInner} /> : null}

                        </View>

                        <View>

                            <Text style={styles.methodTitle}>Cash on delivery</Text>

                            <Text style={styles.methodDesc}>

                                Pay ₹{codChargeDefault} extra as COD charges

                            </Text>

                        </View>

                    </View>

                    <TablerIcon name="cash" size={20} />

                </TouchableOpacity>



                <TouchableOpacity

                    style={[

                        styles.methodCard,

                        selectedMethod === 'online' && styles.methodCardSelected,

                    ]}

                    onPress={() => setSelectedMethod('online')}

                    activeOpacity={0.8}

                >

                    <View style={styles.methodLeft}>

                        <View

                            style={[

                                styles.methodRadioOuter,

                                selectedMethod === 'online' && styles.methodRadioOuterSelected,

                            ]}

                        >

                            {selectedMethod === 'online' ? (

                                <View style={styles.methodRadioInner} />

                            ) : null}

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



                {selectedMethod === 'online' ? (

                    <View style={styles.benefitBox}>

                        {[

                            'No COD charges — save ₹0',

                            'Instant payment confirmation',

                            'UPI, cards, netbanking & wallets',

                        ].map(text => (

                            <View key={text} style={styles.benefitRow}>

                                <Text style={styles.benefitDot}>✓</Text>

                                <Text style={styles.benefitText}>{text}</Text>

                            </View>

                        ))}

                    </View>

                ) : null}



                <View style={styles.summaryCard}>

                    <Text style={styles.summaryTitle}>Order Summary</Text>



                    {cartItems.map((item: any) => (

                        <TouchableOpacity

                            key={item.id ?? item.variant_id}

                            style={styles.orderItemRow}

                            activeOpacity={0.85}

                            onPress={() => openProductDetails(String(item.variant_id))}

                        >

                            {resolveImageUri(item.image) ? (
                                <Image source={{ uri: resolveImageUri(item.image) }} style={styles.itemImage} />

                            ) : (

                                <View style={styles.itemImagePlaceholder}>

                                    <TablerIcon name="package" size={20} color="#94A3B8" />

                                </View>

                            )}



                            <View style={styles.itemInfo}>

                                <Text style={styles.itemName} numberOfLines={2}>

                                    {item.name}

                                </Text>

                                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>

                                <Text style={styles.itemTapHint}>Tap to view product details</Text>

                            </View>



                            <Text style={styles.itemPrice}>

                                ₹{Math.round(Number(item.price) * Number(item.quantity))}

                            </Text>

                        </TouchableOpacity>

                    ))}



                    <View style={styles.divider} />



                    <Row label="Subtotal" value={`₹${Math.round(subtotal)}`} />

                    <Row

                        label="Shipping"

                        value={isFreeShip ? 'Free' : `₹${shippingFee}`}

                        isFree={isFreeShip}

                    />

                    {selectedMethod === 'cod' ? (

                        <Row label="COD charges" value={`₹${codFee}`} />

                    ) : null}



                    <View style={styles.divider} />



                    <Row label="Total payable" value={`₹${Math.round(total)}`} isTotal />

                </View>



                {!!orderError ? (

                    <View style={styles.errorBox}>

                        <Text style={styles.errorText}>⚠️ {orderError}</Text>

                    </View>

                ) : null}



                <View style={{ height: 110 }} />

            </ScrollView>



            <View style={styles.stickyBar}>

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

            </View>



            <Modal

                visible={isVerifyingPayment}

                transparent={false}

                animationType="fade"

                onRequestClose={() => { }}

            >

                <SafeAreaView style={styles.verificationScreen}>

                    <View style={styles.verificationContent}>

                        <ActivityIndicator size="large" color={Colors.primaryColor} />

                        <Text style={styles.verificationTitle}>Verifying Payment</Text>

                        <Text style={styles.verificationSubtitle}>

                            Payment is being verified.{'\n'}

                            Please do not press back or close the app.{'\n'}

                            This may take a few seconds.

                        </Text>

                        <View style={styles.verificationInfo}>

                            <Ionicons

                                name="shield-checkmark"

                                size={18}

                                color={Colors.primaryColor}

                            />

                            <Text style={styles.verificationInfoText}>

                                Do not press back or close the app

                            </Text>

                        </View>

                    </View>

                </SafeAreaView>

            </Modal>

        </SafeAreaView>

    );

};



export default Checkout;



const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: '#F8FAF9',

    },

    content: {

        paddingBottom: 20,

        paddingHorizontal: 20,

    },

    sectionTitle: {

        fontSize: 18,

        fontFamily: Fonts.PoppinsSemiBold,

        marginBottom: 12,

        color: '#0F172A',

    },

    addressCard: {

        borderRadius: 14,

        padding: 12,

        borderWidth: 1,

        borderColor: '#EEF2F6',

        marginBottom: 16,

        backgroundColor: '#FFFFFF',

    },

    addressRow: {

        flexDirection: 'row',

        alignItems: 'center',

        gap: 10,

    },

    iconBox: {

        backgroundColor: '#EAF8F4',

        width: 36,

        height: 36,

        borderRadius: 10,

        alignItems: 'center',

        justifyContent: 'center',

    },

    addressInfo: {

        flex: 1,

        minWidth: 0,

    },

    home: {

        fontFamily: Fonts.PoppinsSemiBold,

        fontSize: 13,

        color: '#0F172A',

    },

    addressText: {

        fontSize: 12,

        color: '#64748B',

        fontFamily: Fonts.PoppinsRegular,

        lineHeight: 17,

        marginTop: 2,

    },

    emptyAddressContainer: {

        alignItems: 'center',

        justifyContent: 'center',

        paddingVertical: 12,

    },

    emptyIconWrapper: {

        width: 44,

        height: 44,

        borderRadius: 22,

        backgroundColor: '#0D614E12',

        justifyContent: 'center',

        alignItems: 'center',

        marginBottom: 8,

    },

    emptyTitle: {

        fontSize: 14,

        color: '#0F172A',

        fontFamily: Fonts.PoppinsSemiBold,

    },

    emptySubTitle: {

        fontSize: 12,

        color: '#64748B',

        textAlign: 'center',

        marginTop: 4,

        marginBottom: 10,

        fontFamily: Fonts.PoppinsRegular,

    },

    addAddressBtn: {

        backgroundColor: '#0D614E',

        paddingHorizontal: 18,

        paddingVertical: 10,

        borderRadius: 12,

    },

    addAddressText: {

        color: '#FFFFFF',

        fontSize: 14,

        fontFamily: Fonts.PoppinsMedium,

    },

    changeBtn: {

        backgroundColor: '#0D614E1A',

        paddingHorizontal: 16,

        paddingVertical: 6,

        borderRadius: 10,

    },

    changeText: {

        color: '#0D614E',

        fontSize: 12,

        fontFamily: Fonts.PoppinsMedium,

    },

    option: {

        borderWidth: 1,

        borderColor: '#E2E8F0',

        borderRadius: 16,

        padding: 14,

        marginBottom: 12,

        backgroundColor: '#fff',

    },

    row: {

        flexDirection: 'row',

        alignItems: 'center',

    },

    radioWrapper: {

        marginRight: 12,

    },

    optionTitle: {

        fontSize: 14,

        fontFamily: Fonts.PoppinsMedium,

        color: '#0F172A',

    },

    optionSub: {

        fontSize: 12,

        color: '#64748B',

        fontFamily: Fonts.PoppinsRegular,

        top: -4,

    },

    optionActive: {

        borderColor: '#0D614E',

        backgroundColor: '#F8FAF9',

    },

    radioOuter: {

        width: 22,

        height: 22,

        borderRadius: 20,

        borderWidth: 2,

        borderColor: '#CBD5E1',

        justifyContent: 'center',

        alignItems: 'center',

        backgroundColor: '#fff',

    },

    radioOuterActive: {

        borderColor: '#0D614E',

    },

    radioInner: {

        width: 10,

        height: 10,

        borderRadius: 10,

        backgroundColor: '#0D614E',

    },

    methodCard: {

        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',

        borderWidth: 1.5,

        borderColor: '#E2E8F0',

        borderRadius: 14,

        padding: 14,

        marginBottom: 10,

        backgroundColor: '#FFFFFF',

    },

    methodCardSelected: {

        borderColor: '#0D614E',

        backgroundColor: '#F0FAF6',

    },

    methodLeft: {

        flexDirection: 'row',

        alignItems: 'center',

        gap: 12,

        flex: 1,

    },

    methodTitle: {

        fontSize: 14,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0F172A',

    },

    methodDesc: {

        fontSize: 12,

        fontFamily: Fonts.PoppinsMedium,

        color: '#94A3B8',

        marginTop: 2,

    },

    methodRadioOuter: {

        width: 22,

        height: 22,

        borderRadius: 11,

        borderWidth: 2,

        borderColor: '#CBD5E1',

        alignItems: 'center',

        justifyContent: 'center',

    },

    methodRadioOuterSelected: {

        borderColor: '#0D614E',

    },

    methodRadioInner: {

        width: 11,

        height: 11,

        borderRadius: 6,

        backgroundColor: '#0D614E',

    },

    razorpayBadge: {

        backgroundColor: '#072654',

        paddingHorizontal: 8,

        paddingVertical: 3,

        borderRadius: 6,

    },

    razorpayText: {

        fontSize: 10,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#FFFFFF',

        letterSpacing: 0.3,

    },

    benefitBox: {

        backgroundColor: '#F0FAF6',

        borderRadius: 10,

        padding: 12,

        marginBottom: 12,

        gap: 6,

    },

    benefitRow: {

        flexDirection: 'row',

        alignItems: 'center',

        gap: 8,

    },

    benefitDot: {

        fontSize: 13,

        color: '#1D9E75',

        fontFamily: Fonts.PoppinsSemiBold,

    },

    benefitText: {

        fontSize: 12,

        fontFamily: Fonts.PoppinsMedium,

        color: '#0F172A',

    },

    summaryCard: {

        backgroundColor: '#0D614E0D',

        borderRadius: 20,

        padding: 20,

        marginTop: 10,

        borderWidth: 1,

        borderColor: '#0D614E1A',

    },

    summaryTitle: {

        fontSize: 18,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0F172A',

        marginBottom: 12,

    },

    orderItemRow: {

        flexDirection: 'row',

        alignItems: 'center',

        gap: 12,

        paddingVertical: 10,

        borderBottomWidth: 1,

        borderBottomColor: '#E2E8F0',

    },

    itemImage: {

        width: 56,

        height: 56,

        borderRadius: 12,

        backgroundColor: '#FFFFFF',

    },

    itemImagePlaceholder: {

        width: 56,

        height: 56,

        borderRadius: 12,

        backgroundColor: '#FFFFFF',

        alignItems: 'center',

        justifyContent: 'center',

    },

    itemInfo: {

        flex: 1,

    },

    itemName: {

        fontSize: 14,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0F172A',

    },

    itemQty: {

        fontSize: 12,

        fontFamily: Fonts.PoppinsMedium,

        color: '#64748B',

        marginTop: 2,

    },

    itemTapHint: {

        fontSize: 11,

        fontFamily: Fonts.PoppinsRegular,

        color: '#0D614E',

        marginTop: 2,

    },

    itemPrice: {

        fontSize: 14,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0F172A',

    },

    divider: {

        height: 1,

        backgroundColor: '#E2E8F0',

        marginVertical: 12,

    },

    rowBetween: {

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'flex-start',

        gap: 8,

        paddingVertical: 6,

    },

    rowLabel: {

        flex: 1,

        flexShrink: 1,

        fontSize: 14,

        color: '#475569',

        fontFamily: Fonts.PoppinsMedium,

        lineHeight: 20,

    },

    rowValue: {

        flexShrink: 0,

        fontSize: 14,

        color: '#0F172A',

        fontFamily: Fonts.PoppinsSemiBold,

        textAlign: 'right',

        maxWidth: '40%',

    },

    freeText: {

        color: '#0D614E',

    },

    totalLabel: {

        fontSize: 15,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0F172A',

    },

    totalValue: {

        fontSize: 15,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0D614E',

    },

    errorBox: {

        backgroundColor: '#FEF2F2',

        borderRadius: 12,

        padding: 12,

        marginTop: 12,

        borderWidth: 1,

        borderColor: '#FECACA',

    },

    errorText: {

        fontSize: 13,

        fontFamily: Fonts.PoppinsMedium,

        color: '#DC2626',

    },

    stickyBar: {

        position: 'absolute',

        bottom: 40,

        left: 0,

        right: 0,

        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',

        paddingHorizontal: 20,

        paddingVertical: 14,

        paddingBottom: 24,

        backgroundColor: '#FFFFFF',

        borderTopWidth: 1,

        borderTopColor: '#E2E8F0',

        gap: 12,

    },

    stickyLeft: {

        flexShrink: 0,

    },

    stickyLabel: {

        fontSize: 11,

        fontFamily: Fonts.PoppinsMedium,

        color: '#94A3B8',

    },

    stickyTotal: {

        fontSize: 20,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#0F172A',

    },

    placeBtn: {

        flex: 1,

        height: 52,

        borderRadius: 16,

        backgroundColor: '#0D614E',

        justifyContent: 'center',

        alignItems: 'center',

    },

    placeBtnDisabled: {

        backgroundColor: '#94A3B8',

    },

    placeBtnText: {

        fontSize: 15,

        fontFamily: Fonts.PoppinsSemiBold,

        color: '#FFFFFF',

    },

    verificationScreen: {

        flex: 1,

        backgroundColor: '#FFFFFF',

    },

    verificationContent: {

        flex: 1,

        justifyContent: 'center',

        alignItems: 'center',

        paddingHorizontal: 30,

    },

    verificationTitle: {

        marginTop: 24,

        fontSize: 22,

        color: '#0F172A',

        fontFamily: Fonts.PoppinsSemiBold,

    },

    verificationSubtitle: {

        marginTop: 10,

        fontSize: 14,

        color: '#64748B',

        textAlign: 'center',

        lineHeight: 22,

        fontFamily: Fonts.PoppinsRegular,

    },

    verificationInfo: {

        flexDirection: 'row',

        alignItems: 'center',

        marginTop: 30,

        paddingHorizontal: 16,

        paddingVertical: 12,

        borderRadius: 12,

        backgroundColor: '#F8FAFC',

    },

    verificationInfoText: {

        marginLeft: 8,

        color: '#475569',

        fontSize: 13,

        fontFamily: Fonts.PoppinsMedium,

    },

});

