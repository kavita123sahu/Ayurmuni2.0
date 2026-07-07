import React from 'react';

import {
    View,
    Text,
    Image,
    StyleSheet,
    ViewStyle,
    ImageSourcePropType,
} from 'react-native';

import Animated, {
    FadeInDown,
    FadeIn,
} from 'react-native-reanimated';

import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon, { TablerIconName } from './TablerIcon';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    image?: ImageSourcePropType;
    iconName?: TablerIconName;
    style?: ViewStyle;
    imageSize?: number;
}

const EmptyState = ({
    title = 'No Results Found',
    subtitle = 'Try searching with another keyword.',
    image,
    iconName = 'search',
    style,
    imageSize = 64,
}: EmptyStateProps) => {
    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            style={[
                styles.container,
                style,
            ]}>

            <Animated.View
                entering={FadeInDown.delay(150)}
            >
                {image ? (
                    <Image
                        source={image}
                        style={[styles.image, { width: imageSize * 2, height: imageSize * 2 }]}
                    />
                ) : iconName ? (
                    <TablerIcon name={iconName} size={imageSize || 64} color={Colors.primaryColor} />
                ) : null}
            </Animated.View>

            <Animated.Text
                entering={FadeInDown.delay(250)}
                style={styles.title}
            >
                {title}
            </Animated.Text>

            <Animated.Text
                entering={FadeInDown.delay(350)}
                style={styles.subtitle}
            >
                {subtitle}
            </Animated.Text>

        </Animated.View>
    );
};

export default EmptyState;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: 70,
    },
    image: {
        borderRadius: 20,
        padding: 20,
        resizeMode: 'cover',
    },
    title: {
        marginTop: 20,
        fontSize: 20,
        color: '#0F172A',
        textAlign: 'center',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 22,
        color: '#64748B',
        textAlign: 'center',
        fontFamily: Fonts.PoppinsRegular,
    },
});
