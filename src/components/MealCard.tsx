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
import { Images } from "../common/Images";



interface MealProps {
    data: any;
    navigation?: any;
}


const MealCard = ({ data, navigation }: MealProps) => {
    return (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MealDetails')}>

            <Image source={data?.image} style={styles.image} />

            {/* Right Content */}
            <View style={styles.content}>
                {/* Top Row */}
                <View style={styles.topRow}>
                    <Text style={styles.type}>{data.type}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={Images.clock} style={{ height: 20, width: 20 }} />
                        <Text style={styles.time}>  {data.time}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {data?.title}
                </Text>

                {/* Subtitle */}
                <Text style={styles.subtitle} numberOfLines={1}>
                    {data?.subtitle}
                </Text>

                {/* Bottom Row */}
                <View style={styles.bottomRow}>
                    <Text style={styles.kcal}>
                        {data?.kcal} <Text style={styles.kcalText}>KCAL</Text>
                    </Text>

                    {data?.status === "log" ? (
                        <TouchableOpacity style={styles.logBtn} >
                            <Text style={styles.logText}>LOG</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.doneBtn} >
                            <Image source={Images.LogButton} style={{ height: 40, width: 40, marginBottom: 15 }} />
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
        marginBottom: 14, // 👈 spacing between cards
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
        fontSize: 16,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: -5
    },

    subtitle: {
        fontSize: 13,
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

    doneText: {
        color: Colors.primaryColor,
        fontSize: 16,
        fontWeight: "bold",
    },
});