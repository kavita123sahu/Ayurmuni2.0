// components/PaymentMethodCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Ionicons } from '../common/Vector';
import TablerIcon, { TablerIconName } from './TablerIcon';

interface Props {
    title: string;
    subtitle: string;
    iconName?: TablerIconName;
    isActive?: boolean;
    onPress?: () => void;
}

const PaymentMethodCard: React.FC<Props> = ({
    title,
    subtitle,
    iconName = 'credit-card',
    isActive,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <TablerIcon name={iconName} size={20} color={Colors.primaryColor} />
                </View>

                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </View>

            {isActive ? <View style={styles.dot} /> : <Ionicons name="chevron-forward"
                size={18}
                color="#6B7280"
            />}
        </TouchableOpacity>
    );
};

export default PaymentMethodCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffff',
        padding: 16,
        borderRadius: 14,
        flexDirection: 'row',
        borderWidth: 1,
        shadowColor: Colors.primaryColor,
        elevation: 2,
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
    title: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'green',
    },
});
