// screens/PaymentsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import PaymentMethodCard from '../../components/PaymentCard';
import TransactionCard from '../../components/TransactionCard';
import { Images } from '../../common/Images';
import Header from '../../components/Header';
import AppHeader from '../../components/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '../../components/SectionHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Ionicons } from '../../common/Vector';


const PaymentsScreen = (props: any) => {
    const [activeId, setActiveId] = useState("1");

    const paymentMethods = [
        {
            id: "1",
            title: "HDFC Bank Debit Card",
            subtitle: "**** **** **** 4290",
            icon: Images.DebitCard,
            isActive: true,
        },
        {
            id: "2",
            title: "Google Pay / PhonePe",
            subtitle: "arjun.06@okaxis",
            icon: Images.UPIMethod,
            isActive: false,
        },
    ];

    const transactionData = [
        {
            id: "1",
            name: "Dr. Sarah Johnson",
            date: "12 Oct 2023 · 10:30 AM",
            amount: "800",
            status: "PAID",
            icon: Images.userprofile,
        },
        {
            id: "2",
            name: "Apollo Pharmacy",
            date: "08 Oct 2023 · 06:15 PM",
            amount: "1,250",
            status: "PAID",
            icon: Images.shop,
        },
        {
            id: "3",
            name: "Thyrocare Lab Test",
            date: "05 Oct 2023 · 09:00 AM",
            amount: "2,400",
            status: "REFUNDED",
            icon: Images.upload,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>

            <AppHeader
                title="Settings"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
                rightIcon="search"
                onRightPress={() => console.log('Search clicked')}
            />

            <ScrollView style={styles.scrollview}>

                <SectionHeader title="Popular Questions" actionText='Add New' />


                {paymentMethods.map((item) => (
                    <PaymentMethodCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        isActive={activeId === item.id}
                        onPress={() => setActiveId(item.id)}
                    />
                ))}

                <SectionHeader title="Transaction History" actionText='View All' />


                {transactionData.map((item) => (
                    <TransactionCard
                        key={item.id}
                        name={item.name}
                        date={item.date}
                        amount={item.amount}
                        icon={item.icon}
                        status={item.status}
                    />
                ))}



            </ScrollView>

            <View style={{ paddingHorizontal: 20 }}>
                <PrimaryButton
                    title="Pay Now"
                    icon={Images.approved}
                    backgroundColor={Colors.primaryColor}
                    textColor={Colors.white}
                    TextFont={Fonts.PoppinsMedium}
                />

            </View>
        </SafeAreaView>
    );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: '#FFFFFF',
    },
    scrollview: {
        paddingHorizontal: 20,
    },
    heading: {
        fontSize: 16,
        fontWeight: '700',
        marginVertical: 12,
    },
    button: {
        backgroundColor: '#065F46',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
});