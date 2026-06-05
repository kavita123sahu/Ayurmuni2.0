import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import React from 'react';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';

const { width } = Dimensions.get("window");

// 🔥 Responsive scaling
const scale = width / 400;

const TAB_HEIGHT = 72 * scale;
// const INNER_SIZE = 60 * scale;
const INNER_SIZE = TAB_HEIGHT - 14;
const CONSULT_SIZE = 68 * scale;

const CustomeTab = (props: any) => {
    const { state, navigation } = props;

    const insets = useSafeAreaInsets(); // ✅ SAFE AREA FIX

    const visibleRoutes = state.routes.filter(
        (route: any) => route.name !== "Consult"
    );

    const isConsultActive =
        state.routes[state.index].name === "Consult";

    const getIcon = (name: string) => {
        switch (name) {
            case "Home":
                return Images.home;
            case "Products":
                return Images.products;
            case "Medicine":
                return Images.medicine;
            case "Profile":
                return Images.Profile;
            default:
                return;
        }
    };

    return (
        <View style={[styles.wrapper, { bottom: insets.bottom + 10 }]}>
            <View style={styles.container}>

                {/* Blur for iOS */}
                {Platform.OS === 'ios' ? (
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType="light"
                        blurAmount={15}
                    />
                ) : (
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: 'rgba(255,255,255,0.9)' }
                        ]}
                    />
                )}

                {visibleRoutes.map((route: any) => {
                    const isFocused =
                        state.index === state.routes.findIndex(
                            (r: any) => r.name === route.name
                        );

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconWrapper,
                                    isFocused && styles.activeWrapper
                                ]}
                            >
                                <Image
                                    source={getIcon(route.name)}
                                    style={{
                                        width: 22 * scale,
                                        height: 22 * scale,
                                        tintColor: isFocused
                                            ? Colors.primaryColor
                                            : '#A0AAB3',
                                    }}
                                />

                                <Text
                                    style={{
                                        fontSize: 11 * scale,
                                        marginTop: 3,
                                        fontFamily: isFocused
                                            ? Fonts.PoppinsSemiBold
                                            : Fonts.PoppinsMedium,
                                        color: isFocused
                                            ? Colors.primaryColor
                                            : '#A0AAB3',
                                    }}
                                >
                                    {route.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* CONSULT BUTTON */}
            <TouchableOpacity
                onPress={() => navigation.jumpTo("Consult")}
                activeOpacity={0.85}
                style={[
                    styles.consultBtn,
                    isConsultActive && { backgroundColor: "#0D614E" }
                ]}
            >
                <Image source={Images.TabConsult} style={styles.consultIcon} />
                <Text style={styles.consultLabel}>Consult</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CustomeTab;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 20,
    },

    container: {
        flex: 1,

        height: TAB_HEIGHT,

        borderRadius: 999,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 10,

        overflow: 'hidden',

        backgroundColor: 'rgba(255,255,255,0.92)',

        elevation: 10,

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 6,
        },
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconWrapper: {
        width: INNER_SIZE,
        height: INNER_SIZE,

        borderRadius: INNER_SIZE / 2,

        alignItems: 'center',
        justifyContent: 'center',
    },

    activeWrapper: {
        width: INNER_SIZE,
        height: INNER_SIZE,

        borderRadius: INNER_SIZE / 2,

        backgroundColor: '#E7F1EE',

        alignItems: 'center',
        justifyContent: 'center',
    },
    consultBtn: {
        width: CONSULT_SIZE,
        height: CONSULT_SIZE,
        borderRadius: CONSULT_SIZE / 2,

        marginLeft: 10,

        backgroundColor: Colors.primaryColor,
        alignItems: "center",
        justifyContent: "center",

        elevation: 12,
        shadowColor: Colors.primaryColor,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },

    consultIcon: {
        width: 20 * scale,
        height: 20 * scale,
        tintColor: "#fff",
    },

    consultLabel: {
        color: "#fff",
        fontSize: 10 * scale,
        marginTop: 2,
        fontFamily: Fonts.PoppinsMedium,
    },
});