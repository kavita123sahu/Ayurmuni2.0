// screens/PaymentsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import PaymentMethodCard from '../../components/PaymentCard';
import TransactionCard from '../../components/TransactionCard';
import AppHeader from '../../components/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '../../components/SectionHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { TablerIconName } from '../../components/TablerIcon';
import Header from '../../components/Header';
import { AntDesign } from '../../common/Vector';


const PaymentsScreen = (props: any) => {
    const [activeId, setActiveId] = useState("1");

    const paymentMethods: {
        id: string;
        title: string;
        subtitle: string;
        iconName: TablerIconName;
        isActive: boolean;
    }[] = [
            {
                id: "1",
                title: "HDFC Bank Debit Card",
                subtitle: "**** **** **** 4290",
                iconName: 'credit-card',
                isActive: true,
            },
            {
                id: "2",
                title: "Google Pay / PhonePe",
                subtitle: "arjun.06@okaxis",
                iconName: 'wallet',
                isActive: false,
            },
        ];

    const transactionData: {
        id: string;
        name: string;
        date: string;
        amount: string;
        status: string;
        iconName: TablerIconName;
    }[] = [
            {
                id: "1",
                name: "Dr. Sarah Johnson",
                date: "12 Oct 2023 · 10:30 AM",
                amount: "800",
                status: "PAID",
                iconName: 'user',
            },
            {
                id: "2",
                name: "Apollo Pharmacy",
                date: "08 Oct 2023 · 06:15 PM",
                amount: "1,250",
                status: "PAID",
                iconName: 'shopping-cart',
            },
            {
                id: "3",
                name: "Thyrocare Lab Test",
                date: "05 Oct 2023 · 09:00 AM",
                amount: "2,400",
                status: "REFUNDED",
                iconName: 'upload',
            },
        ];

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFF'} />

            <Header
                title="Payments"
                subtitle="Manage Your Transaction"
                onBack={() => { props.navigation.goBack() }}
            />


            <ScrollView style={styles.scrollview}>

                <SectionHeader title="Saved Methods" actionText='Add New' />


                {paymentMethods.map((item) => (
                    <PaymentMethodCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        iconName={item.iconName}
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
                        iconName={item.iconName}
                        status={item.status}
                    />
                ))}

                <View style={{ marginTop: 30 }}>

                    <PrimaryButton
                        title="Pay Now"
                        iconName="approved"
                        backgroundColor={Colors.primaryColor}
                        textColor={Colors.white}
                        TextFont={Fonts.PoppinsMedium}
                    />

                    <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 12, fontFamily: Fonts.PoppinsRegular }}> ENCRYPTED & SECURE PAYMENTS</Text>
                </View>



            </ScrollView>


        </SafeAreaView>
    );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    scrollview: {

        backgroundColor: '#FDFDFB'
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