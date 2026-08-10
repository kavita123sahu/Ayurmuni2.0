// components/TransactionCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';

interface Props {
    name: string;
    date: string;
    amount: string;
    status: string;
    subtitle?: string;
    iconName?: TablerIconName;
    onPress?: () => void;
}

const TransactionCard: React.FC<Props> = ({
    name,
    date,
    amount,
    status,
    subtitle,
    iconName = 'receipt',
    onPress,
}) => {
    const getStatusColor = (value: string) => {
        switch (value.toUpperCase()) {
            case 'PAID':
            case 'SUCCESS':
                return '#16A34A';
            case 'REFUNDED':
            case 'FAILED':
                return '#DC2626';
            case 'PENDING':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    const content = (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <TablerIcon name={iconName} size={18} color={Colors.primaryColor} />
                </View>

                <View style={styles.textWrap}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    {subtitle ? (
                        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                    ) : null}
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>

            <View style={styles.right}>
                <Text style={styles.amount}>₹{amount}</Text>
                <Text style={[styles.status, { color: getStatusColor(status) }]}>
                    {status}
                </Text>
            </View>

            {onPress ? (
                <TablerIcon name="chevron-right" size={16} color="#CBD5E1" />
            ) : null}
        </View>
    );

    if (!onPress) {
        return content;
    }

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            {content}
        </TouchableOpacity>
    );
};

export default TransactionCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffff',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    textWrap: {
        flex: 1,
        minWidth: 0,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    name: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    subtitle: {
        fontSize: 11,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 1,
    },
    date: {
        fontSize: 11,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    amount: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    status: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 2,
    },
});
