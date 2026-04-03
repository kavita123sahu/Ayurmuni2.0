import React, { useRef, useEffect } from 'react';
import {
    TouchableOpacity,
    Animated,
    StyleSheet,
    View
} from 'react-native';

interface Props {
    value: boolean;
    onToggle: () => void;
}

const CustomToggle: React.FC<Props> = ({ value, onToggle }) => {

    const translateX = useRef(new Animated.Value(value ? 20 : 2)).current;
    const bgColor = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: value ? 20 : 2,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(bgColor, {
                toValue: value ? 1 : 0,
                duration: 250,
                useNativeDriver: false,
            })
        ]).start();
    }, [value]);

    const backgroundColor = bgColor.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E2E8F0', '#0D614E'] // off → on
    });

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onToggle}>
            <Animated.View style={[styles.container, { backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.circle,
                        { transform: [{ translateX }] }
                    ]}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

export default CustomToggle;

const styles = StyleSheet.create({
    container: {
        width: 50,
        height: 28,
        borderRadius: 20,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
});