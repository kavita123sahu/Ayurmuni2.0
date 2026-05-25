import React from 'react';

import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

import { Ionicons } from '../../common/Vector';

import {
    styles,
    COLORS,
} from '../../components/MedicalHistory/styles/MedicalHistor'
import { scale } from '../../common/Colors';

const Header = ({
    step,
    total,
    onBack,
}: any) => {

    return (
        <View style={styles.header}>

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.iconBtn}
                onPress={onBack}
            >
                <Ionicons
                    name="chevron-back"
                    size={scale(20)}
                    color={COLORS.primary}
                />
            </TouchableOpacity>

            <View style={styles.headerCenter}>

                <Text style={styles.headerTitle}>
                    Onboarding
                </Text>

                <Text style={styles.headerStep}>
                    Step {step + 1} of {total}
                </Text>
            </View>

            <View style={styles.secureWrapper}>

                <Ionicons
                    name="shield-checkmark"
                    size={scale(18)}
                    color={COLORS.primary}
                />

                <Text style={styles.secureText}>
                    100% Secure
                </Text>
            </View>
        </View>
    );
};

export default Header;