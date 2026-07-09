// components/TransactionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';

interface Props {
    name: string;
    date: string;
    amount: string;
    status: string;
    iconName?: TablerIconName;
}

const TransactionCard: React.FC<Props> = ({
    name,
    date,
    amount,
    status,
    iconName = 'receipt',
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID":
                return "#16A34A";
            case "REFUNDED":
                return "#DC2626";
            case "PENDING":
                return "#F59E0B";
            default:
                return "#6B7280";
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <TablerIcon name={iconName} size={20} color={Colors.primaryColor} />
                </View>

                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>₹ {amount}</Text>
                <Text style={[styles.status, { color: getStatusColor(status) }]}>
                    {status}
                </Text>
            </View>
        </View>
    );
};

export default TransactionCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffff',
        padding: 16,
        borderRadius: 14,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    name: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    date: {
        fontSize: 12,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
    },
    amount: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    status: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 2,
    },
});
