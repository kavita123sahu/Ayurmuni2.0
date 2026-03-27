import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

const GradientButton = ({ onPress, text, colors, disable, isLoading }: any) => {

    return (

        <TouchableOpacity
            onPress={onPress} >
            <LinearGradient
                colors={[Colors.questionGreen, Colors.questionGreen]}
                style={styles.otpButton}>
                <Text style={[styles.otpButtonText]}>
                    {text}
                </Text>
            </LinearGradient>

        </TouchableOpacity>

    );
};
export default GradientButton

const styles = StyleSheet.create({
    otpButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },

    otpButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },
})