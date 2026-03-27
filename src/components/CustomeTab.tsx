import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';

const { width } = Dimensions.get("window");

const CustomeTab = (props: any) => {
    const { state, navigation } = props;

    const getIcon = (name: string) => {
        switch (name) {
            case "Home":
                return Images.home;
            case "Cart":
                return Images.shop;
            case "Centers":
                return Images.centers;
            case "Profile":
                return Images.profile;
            default:
                return Images.home;
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>

                {/* NORMAL TABS */}
                {state.routes.map((route: any, index: number) => {
                    const isFocused = state.index === index;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tab}
                        >
                            <Image
                                source={getIcon(route.name)}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: isFocused
                                        ? Colors.primaryColor
                                        : Colors.tabtrasparent,
                                }}
                            />

                            <Text
                                style={{
                                    fontSize: 11,
                                    marginTop: 2,
                                    color: isFocused
                                        ? Colors.primaryColor
                                        : Colors.tabtrasparent,
                                }}
                            >
                                {route.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* 🔥 RIGHT FLOATING CONSULT BUTTON */}
                {/* <TouchableOpacity
                    onPress={() => navigation.navigate("Consult")}
                    style={styles.consultBtn}
                    activeOpacity={0.8}
                >
                    <Image source={Images.consult} style={styles.consultIcon} />
                </TouchableOpacity> */}

            </View>
        </View>
    );
};

export default CustomeTab;

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 15,
        width: "100%",
        alignItems: "center",
    },

    container: {
        flexDirection: "row",
        backgroundColor: "#fff",
        width: width * 0.92,
        borderRadius: 40,
        height: 70,
        justifyContent: "space-around",
        alignItems: "center",

        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,

        overflow: "visible",
    },

    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    // 🔥 RIGHT FLOATING BUTTON
    consultBtn: {
        position: "absolute",
        top: 25,
        right: 25, // ⭐ MAGIC (right side shift)

        width: 60,
        height: 60,
        borderRadius: 30,

        backgroundColor: Colors.primaryColor,
        justifyContent: "center",
        alignItems: "center",

        elevation: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },

//CENTER FLOTING
    //  consultBtn: {
    //     position: "absolute",
    //     top: -30,
    //     alignSelf: "center",

    //     width: 65,
    //     height: 65,
    //     borderRadius: 35,

    //     backgroundColor: Colors.primaryColor,
    //     justifyContent: "center",
    //     alignItems: "center",

    //     elevation: 12,
    //     shadowColor: "#000",
    //     shadowOpacity: 0.2,
    //     shadowRadius: 10,
    // },
    consultIcon: {
        width: 24,
        height: 24,
        tintColor: "#fff",
    },
});