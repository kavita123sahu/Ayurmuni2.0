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

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate?.('MealDetails', { item: data })}
            activeOpacity={0.9}
        >
            <Image source={imageSource} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.type}>{type}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TablerIcon name="clock" size={20} color="#6B7280" />
                        <Text style={styles.time}>  {time}</Text>
                    </View>
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                {!!subtitle && (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                )}

                <View style={styles.bottomRow}>
                    <Text style={styles.kcal}>
                        {Number(data?.kcal) || 0} <Text style={styles.kcalText}>KCAL</Text>
                    </Text>

                    {data?.status === "log" ? (
                        <TouchableOpacity
                            style={styles.logBtn}
                            onPress={e => {
                                e?.stopPropagation?.();
                                onLog?.();
                            }}
                        >
                            <Text style={styles.logText}>LOG</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.doneBtn}
                            onPress={e => {
                                e?.stopPropagation?.();
                                onLog?.();
                            }}
                        >
                            <TablerIcon name="circle-check" size={28} color={Colors.primaryColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default MealCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#ffff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        marginBottom: 14,
        overflow: "hidden",
    },

    image: {
        width: 110,
        height: "100%",
        backgroundColor: Colors.cardBackground,
        borderWidth: 1,
        borderColor: Colors.borderColor
    },

    content: {
        flex: 1,
        padding: 14,
        justifyContent: "space-between",
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    type: {
        fontSize: 11,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.5,
    },

    time: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsMedium,
    },

    title: {
        fontSize: 14,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: -5
    },

    subtitle: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsRegular,
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },

    kcal: {
        fontSize: 16,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    kcalText: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsMedium,
    },

    logBtn: {
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 25,
        paddingVertical: 8,
        borderRadius: 20,
    },

    logText: {
        color: "#fff",
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    doneBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});
