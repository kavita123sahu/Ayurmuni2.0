// components/QuantityControl.tsx
// ── Local +/- counter only — NO API call here ─────────────────────────────

import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Fonts } from '../common/Fonts';

type Props = {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    minQty?: number;
};

const QuantityControl = ({
    quantity,
    onIncrease,
    onDecrease,
    minQty = 1,
}: Props) => {
    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                style={[styles.btn, quantity <= minQty && styles.btnDisabled]}
                onPress={onDecrease}
                activeOpacity={0.75}
                disabled={quantity <= minQty}
            >
                <Text style={[styles.btnText, quantity <= minQty && styles.btnTextDisabled]}>−</Text>
            </TouchableOpacity>

            <Text style={styles.value}>{quantity}</Text>

            <TouchableOpacity
                style={styles.btn}
                onPress={onIncrease}
                activeOpacity={0.75}
            >
                <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

export default QuantityControl;

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        padding: 4,
        alignSelf: 'flex-start',
        gap: 2,
    },
    btn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    btnDisabled: {
        backgroundColor: '#F8FAFC',
        elevation: 0,
        shadowOpacity: 0,
    },
    btnText: {
        fontSize: 20,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 24,
    },
    btnTextDisabled: {
        color: '#CBD5E1',
    },
    value: {
        width: 40,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
});