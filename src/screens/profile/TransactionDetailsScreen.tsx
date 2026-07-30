import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';

type Props = {
    route: any;
    navigation: any;
};

const DetailRow = ({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{String(value)}</Text>
        </View>
    );
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusColor = (status?: string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'success' || normalized === 'paid') return '#16A34A';
    if (normalized === 'failed' || normalized === 'refunded') return '#DC2626';
    if (normalized === 'pending') return '#F59E0B';
    return '#64748B';
};

const getStatusLabel = (status?: string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'success') return 'Paid';
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const TransactionDetailsScreen = ({ route, navigation }: Props) => {
    const transaction = route?.params?.transaction;

    const iconName: TablerIconName = useMemo(() => {
        const method = String(transaction?.payment_method ?? '').toLowerCase();
        if (method.includes('upi') || method.includes('wallet')) return 'wallet';
        if (method.includes('card')) return 'credit-card';
        if (transaction?.order?.order_code) return 'shopping-cart';
        return 'receipt';
    }, [transaction]);

    if (!transaction) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader title="Transaction Details" onLeftPress={() => navigation.goBack()} />
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>Transaction not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = getStatusColor(transaction.status);
    const amount = Number(transaction.amount ?? 0).toLocaleString('en-IN');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader
                title="Transaction Details"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <TablerIcon name={iconName} size={22} color={Colors.primaryColor} />
                    </View>
                    <Text style={styles.heroAmount}>₹{amount}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusLabel(transaction.status)}
                        </Text>
                    </View>
                    <Text style={styles.heroRef}>
                        {transaction.reference_code || transaction.id}
                    </Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Payment Info</Text>
                    <DetailRow label="Reference" value={transaction.reference_code} />
                    <DetailRow
                        label="Type"
                        value={String(transaction.transaction_type ?? '').replace(/_/g, ' ')}
                    />
                    <DetailRow
                        label="Payment Type"
                        value={String(transaction.payment_type ?? '').replace(/_/g, ' ')}
                    />
                    <DetailRow
                        label="Method"
                        value={String(transaction.payment_method ?? '').toUpperCase()}
                    />
                    <DetailRow label="Gateway" value={transaction.gateway} />
                    <DetailRow label="Gateway Ref" value={transaction.gateway_reference} />
                    <DetailRow label="Currency" value={transaction.currency} />
                    <DetailRow label="Paid At" value={formatDateTime(transaction.paid_at)} />
                    <DetailRow label="Created At" value={formatDateTime(transaction.created_at)} />
                    {transaction.failure_reason ? (
                        <DetailRow label="Failure Reason" value={transaction.failure_reason} />
                    ) : null}
                </View>

                {transaction.order ? (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Order</Text>
                        <DetailRow label="Order Code" value={transaction.order.order_code} />
                        <DetailRow
                            label="Order Status"
                            value={String(transaction.order.order_status ?? '').replace(/_/g, ' ')}
                        />
                        <DetailRow
                            label="Order Amount"
                            value={`₹${Number(transaction.order.total_amount ?? 0).toLocaleString('en-IN')}`}
                        />
                        <TouchableOpacity
                            style={styles.linkBtn}
                            onPress={() =>
                                navigation.navigate('OrderDetailsScreen', {
                                    order: transaction.order,
                                })
                            }
                        >
                            <Text style={styles.linkBtnText}>View Order Details</Text>
                            <TablerIcon name="chevron-right" size={16} color={Colors.primaryColor} />
                        </TouchableOpacity>
                    </View>
                ) : null}

                {transaction.order_payment ? (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Payment Record</Text>
                        <DetailRow
                            label="Razorpay Order"
                            value={transaction.order_payment.razorpay_order_id}
                        />
                        <DetailRow
                            label="Razorpay Payment"
                            value={transaction.order_payment.razorpay_payment_id}
                        />
                        <DetailRow label="Status" value={transaction.order_payment.status} />
                        <DetailRow
                            label="Paid At"
                            value={formatDateTime(transaction.order_payment.paid_at)}
                        />
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: 16,
        paddingBottom: 28,
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    heroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    heroIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EAF8F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    heroAmount: {
        fontSize: 28,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    heroRef: {
        marginTop: 8,
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        padding: 14,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailLabel: {
        flex: 1,
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },
    detailValue: {
        flex: 1.2,
        fontSize: 12,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
        textAlign: 'right',
    },
    linkBtn: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#EAF8F4',
    },
    linkBtnText: {
        fontSize: 13,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});
