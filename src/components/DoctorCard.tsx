import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Images } from "../common/Images";
import { Colors } from "../common/Colors";
import { Fonts } from "../common/Fonts";


type DoctorCardProps = {
    data: {
        name: string;
        speciality: string;
        exp: number;
        rating: number;
        image: string;
        available?: boolean;
    };

    showConsultBtn?: boolean;
    showChatBtn?: boolean;
    showFav?: boolean;

    onConsult?: () => void;
    onChat?: () => void;
    onFav?: (val: boolean) => void;
};

export default function DoctorCard({
    data,
    showConsultBtn = false,
    showChatBtn = false,
    showFav = false,
    onConsult,
    onChat,
    onFav,
}: DoctorCardProps) {
    const [fav, setFav] = useState(false);

    const handleFav = () => {
        setFav(!fav);
        onFav && onFav(!fav);
    };

    return (
        <View style={styles.card}>

            {/* TOP */}
            <View style={styles.row}>
                <Image source={Images.doctorImage} style={styles.avatar} />
                <View style={{ borderWidth: 4, borderColor: '#10B981', borderRadius: 20, position: 'absolute', bottom: 5, left: 50 }}> </View>

                <View style={{ flex: 1 }}>

                    {/* {data.available && ( */}
                    <Text style={styles.available}>Oct 24 • 10:00 AM</Text>
                    {/* )} */}

                    <Text style={styles.name}>{data.name}</Text>
                    <Text style={styles.speciality}>{data.speciality}</Text>

                    <View style={{ flexDirection: 'row' }}>
                        <Image source={Images.clock} style={{ height: 15, tintColor: '#10B981', width: 15, marginTop: 2, marginRight: 5 }} />
                        <Text style={styles.meta}>
                            {data.exp} Yrs • ⭐ {data.rating}
                        </Text>

                        <Text style={styles.meta1}>
                            (978)
                        </Text>

                    </View>
                </View>

                {/* Fav (optional) */}
                {showFav && (
                <TouchableOpacity onPress={handleFav} style={{ bottom: 40 }}>
                    <Text style={{ fontSize: 18 }}>
                        {fav ? "❤️" : "🤍"}
                    </Text>
                </TouchableOpacity>
                )}
            </View>

            {/* BOTTOM (only render if needed) */}
            {(showConsultBtn || showChatBtn) && (
                <View style={styles.bottom}>

                    {showChatBtn && (
                        <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
                            <Text>💬</Text>
                        </TouchableOpacity>
                    )}

                    {showConsultBtn && (
                        <TouchableOpacity
                            style={styles.consultBtn}
                            onPress={onConsult}
                        >
                            <Text style={styles.btnText}>Consult Now</Text>
                        </TouchableOpacity>
                    )}

                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 25,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 12,

    },

    row: {
        position: 'relative',
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    avatar: {
        width: 60,
        height: 60,
        backgroundColor: Colors.bgcolor,
        borderRadius: 12,
    },

    available: {
        // backgroundColor: "#e6f4f1",
        color: "#0f6d5c",
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        // paddingHorizontal: 6,
        borderRadius: 6,
        alignSelf: "flex-start",
    },

    name: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 16,
        marginBottom: -5
    },

    speciality: {
        fontSize: 12,
        color: "#94A3B8",
        fontFamily: Fonts.PoppinsMedium,
    },

    meta: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        // marginTop: 2,
    },
    meta1: {
        fontSize: 10,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 4
    },

    bottom: {
        flexDirection: "row",
        marginTop: 12,
        gap: 10,
    },

    chatBtn: {
        backgroundColor: "#eef3f1",
        padding: 12,
        borderRadius: 10,
    },

    consultBtn: {
        flex: 1,
        backgroundColor: "#0f6d5c",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
});