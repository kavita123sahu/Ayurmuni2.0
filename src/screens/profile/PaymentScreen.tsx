// screens/PaymentsScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import PaymentMethodCard from '../../components/PaymentCard';
import TransactionCard from '../../components/TransactionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '../../components/SectionHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { TablerIconName } from '../../components/TablerIcon';
import Header from '../../components/Header';
import { useTransactions } from '../../hooks/useTransactions';

const PaymentsScreen = (props: any) => {
    const [activeId, setActiveId] = useState('1');
    const { transactions, loading, refreshing, error, refresh } = useTransactions();

    const paymentMethods: {
        id: string;
        title: string;
        subtitle: string;
        iconName: TablerIconName;
        isActive: boolean;
    }[] = [
        {
            id: '1',
            title: 'HDFC Bank Debit Card',
            subtitle: '**** **** **** 4290',
            iconName: 'credit-card',
            isActive: true,
        },
        {
            id: '2',
            title: 'Google Pay / PhonePe',
            subtitle: 'arjun.06@okaxis',
            iconName: 'wallet',
            isActive: false,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <Header
                title="Payments"
                subtitle="Manage Your Transaction"
                onBack={() => props.navigation.goBack()}
            />

            <ScrollView
                style={styles.scrollview}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        colors={[Colors.primaryColor]}
                        tintColor={Colors.primaryColor}
                    />
                }
            >
                {/* <SectionHeader title="Saved Methods" actionText="Add New" />

                {paymentMethods.map(item => (
                    <PaymentMethodCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        iconName={item.iconName}
                        isActive={activeId === item.id}
                        onPress={() => setActiveId(item.id)}
                    />
                ))} */}

                <SectionHeader title="Transaction History" />

                {loading && transactions.length === 0 ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="small" color={Colors.primaryColor} />
                    </View>
                ) : null}

                {!loading && transactions.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptySubtitle}>
                            {error || 'Your payment history will appear here.'}
                        </Text>
                    </View>
                ) : null}

                {transactions.map(item => (
                    <TransactionCard
                        key={item.id}
                        name={item.name}
                        subtitle={item.paymentMethod}
                        date={item.date}
                        amount={item.amount}
                        iconName={item.iconName}
                        status={item.status}
                        onPress={() =>
                            props.navigation.navigate('TransactionDetailsScreen', {
                                transaction: item.raw,
                            })
                        }
                    />
                ))}

                {/* <View style={{ marginTop: 24 }}>
                    <PrimaryButton
                        title="Pay Now"
                        iconName="approved"
                        backgroundColor={Colors.primaryColor}
                        textColor={Colors.white}
                        TextFont={Fonts.PoppinsMedium}
                    />

                    <Text style={styles.secureText}>ENCRYPTED & SECURE PAYMENTS</Text>
                </View> */}
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
        backgroundColor: '#FDFDFB',
    },
    loaderWrap: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyWrap: {
        paddingVertical: 24,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 15,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    emptySubtitle: {
        marginTop: 6,
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        textAlign: 'center',
    },
    secureText: {
        textAlign: 'center',
        color: '#94A3B8',
        marginTop: 12,
        fontFamily: Fonts.PoppinsRegular,
    },
});
