import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "../common/Vector";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import { Styles } from "../common/Styles";
import CustomToggle from "./CustomToggle";
import TablerIcon, { TablerIconName } from "./TablerIcon";

const SettingItem = ({ item, onToggle, props }: any) => {

    const [enabled, setEnabled] = useState(true);

    const handleNavigation = () => {
        switch (item.title) {
            case "Profile":
                props.navigation.navigate("ProfileScreen");
                break;
            case "Notifications":
                props.navigation.navigate("NotificationScreen");
                break;

            case "Privacy":
                props.navigation.navigate("PrivacyScreen");
                break;
            default:
                console.log("No screen mapped");
        }
    };

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={()=>item.type === "arrow" ? handleNavigation : null}>

            {/* LEFT ICON */}
            <View style={styles.iconBox}>
                {item.icon ? (
                    item.icon
                ) : item.iconName ? (
                    <TablerIcon name={item.iconName as TablerIconName} size={20} color={Colors.primaryColor} />
                ) : null}
            </View>

            {/* TEXT */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            {/* RIGHT SIDE */}
            {item.type === "arrow" && (
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            )}

            {item.type === "toggle" && (
                <CustomToggle
                    value={enabled}
                    onToggle={() => setEnabled(!enabled)}
                />
            )}
        </TouchableOpacity>
    );
};

export default SettingItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,

    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E8F3F1',
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111827",
        marginBottom: -5
    },
    subtitle: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsRegular,
    },
});
