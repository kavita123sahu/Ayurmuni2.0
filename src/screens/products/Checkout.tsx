import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';

const Checkout: React.FC = (props : any) => {
    const [deliveryMethod, setDeliveryMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [upiId, setUpiId] = useState('');

    const Option = ({ selected, title, sub, onPress, icon }: any) => (
        <TouchableOpacity
            style={[
                styles.option,
                selected && styles.optionActive
            ]}
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
                    {sub && <Text style={styles.optionSub}>{sub}</Text>}
                </View>

                {icon && (
                    <Image source={icon} style={styles.rightIcon} />
                )}

            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar   />
            <AppHeader title="Checkout" leftIcon={Images.backIcon} onLeftPress={()=>props.navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.sectionTitle}>Shipping Address</Text>

                <View style={styles.addressCard}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Image source={Images.location} style={styles.icon} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.home}>Home</Text>
                            <Text style={styles.addressText}>
                                123 Organic Lane, Green Valley, CA 902
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.changeBtn}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Delivery Method</Text>

                <Option
                    selected={deliveryMethod === 'standard'}
                    title="Standard Delivery"
                    sub="3-5 business days · Free"
                    icon={Images.truck}
                    onPress={() => setDeliveryMethod('standard')}
                />

                <Option
                    selected={deliveryMethod === 'express'}
                    title="Express Delivery"
                    sub="Next day delivery · Rs. 50.00"
                    icon={Images.flash}
                    onPress={() => setDeliveryMethod('express')}
                />

                {/* PAYMENT */}
                {/* <Text style={styles.sectionTitle}>Payment Method</Text>

        <Option
          selected={paymentMethod === 'card'}
          title="Credit / Debit Card"
          icon={Images.card}
          rightImage={Images.visa}
          onPress={() => setPaymentMethod('card')}
        />

        <Option
          selected={paymentMethod === 'upi'}
          title="UPI Payment"
          icon={Images.upi}
          onPress={() => setPaymentMethod('upi')}
        />

        {paymentMethod === 'upi' && (
          <TextInput
            placeholder="Enter UPI ID"
            value={upiId}
            onChangeText={setUpiId}
            style={styles.upiInput}
          />
        )}

        <Option
          selected={paymentMethod === 'cod'}
          title="Cash on Delivery"
          icon={Images.cash}
          onPress={() => setPaymentMethod('cod')}
        /> */}



                <View style={styles.summaryCard}>

                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <Row label="Organic Avocados (x2)" value="Rs. 129.00" />
                    <Row label="Fresh Kale Bunch" value="Rs. 129.00" />
                    <Row label="Raw Almonds (500g)" value="Rs. 129.00" />

                    <View style={styles.divider} />

                    <Row label="Subtotal" value="Rs. 129.00" />
                    <Row label="Shipping" value="Free" isFree />

                    <View style={styles.divider} />

                    <Row label="Total" value="Rs. 248.00" isTotal />

                </View>

            </ScrollView>

            <TouchableOpacity style={styles.checkout}>
                <View style={styles.checkoutRow}>
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>

                    <Image source={Images.arrowRight} style={styles.checkoutIcon} />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const Row = ({ label, value, isTotal, isFree }: any) => (
    <View style={styles.rowBetween}>

        <Text
            style={[
                styles.rowLabel,
                isTotal && styles.totalLabel
            ]}
        >
            {label}
        </Text>

        <Text
            style={[
                styles.rowValue,
                isTotal && styles.totalValue,
                isFree && styles.freeText
            ]}
        >
            {value}
        </Text>

    </View>
);

export default Checkout;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },

    radioWrapper: {
        marginRight: 12,
    },

    content: {
        padding: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 12,
        color: '#0F172A',
    },

    addressCard: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#0D614E1A',
        marginBottom: 20,

    },

    iconBox: {
        backgroundColor: '#0D614E1A',
        padding: 14,
        borderRadius: 16,
        marginRight: 14,
    },

    icon: {
        width: 24,
        height: 24,
    },

    home: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 16,
        color: '#0F172A'
    },

    addressText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium
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

    optionIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },

    optionTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0F172A'
    },

    optionSub: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        top: -4
    },

    rightImage: {
        width: 36,
        height: 20,
        resizeMode: 'contain',
    },

    upiInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
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

    rightIcon: {
        width: 22,
        height: 22,
        tintColor: '#0D614E',
    },

    optionActive: {
        borderColor: '#0D614E',
        backgroundColor: '#F8FAF9',
    },

    summaryCard: {
        backgroundColor: '#0D614E0D',
        borderRadius: 20,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#0D614E1A'
    },

    summaryTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 12,
    },

    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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

    freeText: {
        color: '#0D614E',
    },

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
    checkout: {
        backgroundColor: '#0D614E',
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal:20
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
        top:-2
    },

});
