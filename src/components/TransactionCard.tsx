// components/TransactionCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

interface Props {
    name: string;
    date: string;
    amount: string;
    status: string;
    icon: any;
}

const TransactionCard: React.FC<Props> = ({
    name,
    date,
    amount,
    status,
    icon,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID":
                return "#16A34A"; // green
            case "REFUNDED":
                return "#DC2626"; // red
            case "PENDING":
                return "#F59E0B"; // yellow
            default:
                return "#6B7280";
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <Image source={icon} style={styles.icon} />
                </View>

                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>Rs. {amount}</Text>
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
        backgroundColor: '#ffffff',
        padding: 14,
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
    icon: {
        width: 20,
        height: 20,
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
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    status: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,

    },
});