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
    const foodItems = Array.isArray(data?.dietItemDetails)
        ? data.dietItemDetails.filter(
              (f: any) => f?.name || f?.label || f?.quantity,
          )
        : [];
    const primaryQty = String(foodItems[0]?.quantity || '').trim();

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

                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    {!!primaryQty && (
                        <View style={styles.qtyBadge}>
                            <Text style={styles.qtyBadgeText}>{primaryQty}</Text>
                        </View>
                    )}
                </View>

                {foodItems.length > 1 ? (
                    <View style={styles.qtyChipRow}>
                        {foodItems.slice(1, 4).map((food: any, index: number) => {
                            const name = String(food?.name || food?.label || '').trim();
                            const qty = String(food?.quantity || '').trim();
                            if (!name && !qty) return null;
                            return (
                                <View style={styles.qtyChip} key={`${name}-${index}`}>
                                    <Text style={styles.qtyChipName} numberOfLines={1}>
                                        {name || 'Item'}
                                    </Text>
                                    {!!qty && (
                                        <Text style={styles.qtyChipQty}>{qty}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : !!subtitle ? (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}

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

    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 2,
    },

    title: {
        flex: 1,
        fontSize: 14,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 20,
    },

    qtyBadge: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        maxWidth: 88,
    },

    qtyBadgeText: {
        fontSize: 11,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    qtyChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },

    qtyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        maxWidth: '100%',
    },

    qtyChipName: {
        fontSize: 10,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
        maxWidth: 90,
    },

    qtyChipQty: {
        fontSize: 10,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    subtitle: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsRegular,
        marginTop: 4,
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
