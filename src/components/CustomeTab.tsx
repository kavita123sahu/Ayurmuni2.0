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
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';


const { width } = Dimensions.get("window");

const CustomeTab = (props: any) => {
    const { state, navigation } = props;

    const visibleRoutes = state.routes.filter(
        (route: any) => route.name !== "Consult"
    );
    const isConsultActive =
        state.routes[state.index].name === "Consult";



    const getIcon = (name: string) => {
        switch (name) {
            case "Home":
                return Images.home;
            case "Cart":
                return Images.orders;
            case "History":
                return Images.History;
            case "Profile":
                return Images.Profile;
            default:
                return;
        }
    };

    return (
        <View style={styles.wrapper}>

            <View style={styles.container}>

                {/* 
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={18}
                /> */}

                {Platform.OS === 'ios' ? (
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType="light"
                        blurAmount={18}
                    />
                ) : (
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: 'rgba(255,255,255,0.9)' }
                        ]}
                    />
                )}

                {visibleRoutes.map((route: any, index: number) => {
                    // const isFocused = state.index === index;

                    const isFocused =
                        state.index === state.routes.findIndex((r: any) => r.name === route.name);

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconWrapper,
                                isFocused && styles.activeWrapper
                            ]}>
                                <Image
                                    source={getIcon(route.name)}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        tintColor: isFocused
                                            ? Colors.primaryColor
                                            : '#A0AAB3',
                                    }}
                                />

                                <Text style={{
                                    fontSize: 11,
                                    fontFamily: isFocused ? Fonts.PoppinsSemiBold : Fonts.PoppinsMedium,
                                    marginTop: 2,
                                    color: isFocused
                                        ? Colors.primaryColor
                                        : '#A0AAB3',
                                }}>
                                    {route.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                onPress={() => navigation.jumpTo("Consult")}
                style={[
                    styles.consultBtn,
                    isConsultActive && { backgroundColor: "#0D614E" } // darker active
                ]}
                activeOpacity={0.85}
            >
                <Image source={Images.TabConsult} style={styles.consultIcon} />
                <Text style={styles.consultLabel}>Consult</Text>
            </TouchableOpacity>

        </View>
    );
};

export default CustomeTab;

const CONSULT_SIZE = 68;

const styles = StyleSheet.create({
    // wrapper: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    //     paddingHorizontal: 16,
    //     paddingVertical: Platform.OS === 'ios' ? 24 : 15,
    //     backgroundColor: "transparent"
    // },

    wrapper: {
        position: 'absolute', // ✅ ADD THIS
        bottom: 30,
        left: 0,
        right: 0,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",


        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 24 : 20,
        backgroundColor: "#FFFFFF1A",
    },

    container: {
        flexDirection: "row",
        flex: 1,
        height: 72,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 16,

        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.25)",

        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },

    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    iconWrapper: {
        minWidth: 60,  // ✅ dynamic width
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },

    activeWrapper: {
        backgroundColor: "#0D614E1A",
        paddingHorizontal: 10,
        borderRadius: 30,

    },

    consultBtn: {
        width: CONSULT_SIZE,
        height: CONSULT_SIZE,
        borderRadius: CONSULT_SIZE / 2,
        marginLeft: 12,
        backgroundColor: Colors.primaryColor,
        alignItems: "center",
        justifyContent: "center",
        elevation: 10,
        shadowColor: Colors.primaryColor,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    consultIcon: {
        width: 26,
        height: 26,
        tintColor: "#fff",
        marginBottom: 2,
    },

    consultLabel: {
        color: "#fff",
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,

    },
});