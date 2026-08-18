import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import TablerIcon from "./TablerIcon";
import { normalizeDietFoodItem, resolveMealImage } from "../utils/dietPlanUtils";
import { resolveImageSource } from "../utils/imageUtils";
import { DIET_UI, RADIUS, SPACING, TYPO } from "../constants/responsive";

interface MealProps {
    data: any;
    navigation?: any;
    onLog?: () => void;
}

const toDisplayText = (value: any, fallback = '') => {
    if (value == null) return fallback;
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }
    return normalizeDietFoodItem(value)?.label || fallback;
};

const MealCard = ({ data, navigation, onLog }: MealProps) => {
    const imageSource =
        resolveImageSource(data?.image) ||
        resolveMealImage(data?.raw) ||
        require('../assets/images/login/7.jpg');
    const title = toDisplayText(data?.title, 'Meal');
    const subtitle = toDisplayText(data?.subtitle);
    const type = toDisplayText(data?.type, 'MEAL');
    const time = toDisplayText(data?.time);
    const canLog = data?.status === 'log';

    const openDetails = () =>
        navigation?.navigate?.('MealDetails', { item: data });

    return (
        <View style={styles.card}>
            <View style={styles.imageWrap}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={openDetails}
                    style={styles.imageHit}
                >
                    <Image source={imageSource} style={styles.image} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logOverlay, !canLog && styles.logOverlayDone]}
                    onPress={onLog}
                    activeOpacity={0.85}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                    {canLog ? (
                        <Text style={styles.logText}>LOG</Text>
                    ) : (
                        <TablerIcon
                            name="circle-check"
                            size={16}
                            color={Colors.primaryColor}
                        />
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.content}
                onPress={openDetails}
                activeOpacity={0.9}
            >
                <View style={styles.topRow}>
                    <Text style={styles.type} numberOfLines={1}>
                        {type}
                    </Text>
                    {!!time && (
                        <View style={styles.timeRow}>
                            <TablerIcon name="clock" size={13} color="#6B7280" />
                            <Text style={styles.time}>{time}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                {!!subtitle ? (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}

                <Text style={styles.kcal}>
                    {Number(data?.kcal) || 0}{' '}
                    <Text style={styles.kcalText}>KCAL</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default MealCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        height: DIET_UI.mealCardHeight,
        backgroundColor: "#FFFFFF",
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        marginBottom: SPACING.md,
        overflow: "hidden",
    },

    imageWrap: {
        width: DIET_UI.mealImageWidth,
        height: DIET_UI.mealImageHeight,
        backgroundColor: Colors.cardBackground,
        borderRightWidth: 1,
        borderRightColor: Colors.borderColor,
    },

    imageHit: {
        width: '100%',
        height: '100%',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    logOverlay: {
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: 8,
        height: 28,
        borderRadius: RADIUS.pill,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
        elevation: 4,
    },

    logOverlayDone: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: Colors.primaryColor,
    },

    logText: {
        color: "#fff",
        fontSize: TYPO.caption,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.4,
    },

    content: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        justifyContent: "space-between",
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: SPACING.sm,
    },

    type: {
        flex: 1,
        minWidth: 0,
        fontSize: TYPO.caption,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
    },

    time: {
        fontSize: TYPO.sm,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsMedium,
    },

    title: {
        fontSize: TYPO.body,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 18,
    },

    subtitle: {
        fontSize: TYPO.sm,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsRegular,
    },

    kcal: {
        fontSize: TYPO.md,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    kcalText: {
        fontSize: TYPO.sm,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsMedium,
    },
});
