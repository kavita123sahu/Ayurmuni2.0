import { useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { Images } from "../../common/Images";
import { Fonts } from "../../common/Fonts";
import { Colors } from "../../common/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentPlan = ({ onClose, navigation }: any) => {
    const [selected, setSelected] = useState("3");

    const plans = [
        { id: "3", title: "3 Months", price: "Rs. 566/mo", sub: "No Cost EMI", recommended: true },
        { id: "6", title: "6 Months", price: "Rs. 295/mo", sub: "12% p.a.", recommended: true },
        { id: "9", title: "9 Months", price: "Rs. 205/mo", sub: "15% p.a.", recommended: false },
    ];



    return (
        <SafeAreaView style={{ flex: 1 , backgroundColor :"#FFFFFF"}}>

            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <AppHeader title="Payment Plan" leftIcon={Images.backIcon} onLeftPress={onClose} />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1, backgroundColor: '#FDFDFB', paddingBottom: 30 }}>

                <Text style={styles.label}>AMOUNT TO PAY</Text>
                <Text style={styles.amount}>Rs. 1699.00</Text>

                <View style={styles.badgeContainer}>
                    <Image source={Images.approved} style={{ tintColor: Colors.primaryColor, height: 15, width: 15 }} />
                    <Text style={styles.badgeText}>SECURE MEDICAL TRANSACTION</Text>
                </View>

                <Text style={styles.heading}>Select EMI Tenure</Text>
                <Text style={styles.subheading}>Choose a plan that fits your recovery journey.</Text>


                {plans.map((item) => {
                    const active = selected === item.id;

                    return (


                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setSelected(item.id)}
                            style={[styles.card, active && styles.activeCard]}
                        >
                            {/* Recommended */}
                            {item?.recommended && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText1}>RECOMMENDED</Text>
                                </View>
                            )}

                            {/* Top Row */}
                            <View style={styles.row}>
                                <View>
                                    <Text style={styles.title}>{item?.title}</Text>
                                    <Text style={[styles.subtitle, active && styles.greenText]}>
                                        {item?.sub}
                                    </Text>
                                </View>

                                <View>
                                    <Text style={[styles.price, active && styles.greenText]}>
                                        {item?.price}
                                    </Text>
                                    <Text style={styles.total}>{item?.price}</Text>
                                </View>
                            </View>

                            {/* Divider only if active */}
                            {active && <View style={styles.divider} />}

                            {active && (
                                <View style={styles.bottomRow}>
                                    <View style={styles.processing}>
                                        <Text style={styles.infoIcon}>ⓘ</Text>
                                        <Text style={styles.processingText}>
                                            Zero processing fee
                                        </Text>
                                    </View>

                                    <View style={styles.tick}>
                                        <Image source={Images.tick} style={{ tintColor: '#FFFFFF', height: 12, width: 12 }} />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity style={styles.conversion}>
                    <Image source={Images.lock} style={{ marginBottom: 25, height: 20, width: 20 }} />
                    <Text style={{ color: "#0D614E", fontSize: 12, fontFamily: Fonts.PoppinsMedium }}>Your payment plan is encrypted. EMI conversion
                        might take up to 3-4 working days depending on
                        your bank's policy.</Text>
                </TouchableOpacity>


                <View style={styles.footer} >
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => { navigation.navigate('MentorOrder') }}>
                        <Text style={{ color: "#fff", padding: 5, fontSize: 16, fontFamily: Fonts.PoppinsSemiBold }}>Confirm Plan</Text>
                    </TouchableOpacity>

                    <Text style={{ color: '#3E4946', textAlign: 'center', paddingVertical: 5, fontSize: 12, fontFamily: Fonts.PoppinsMedium }}> PROCEED TO SECURE CHECKOUT</Text>
                </View>
            </ScrollView>


        </SafeAreaView>
    );
};

export default PaymentPlan;


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F4F6F8",
    },

    // 🔹 Header
    emiHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
    },



    // 🔹 Amount Section
    label: {
        textAlign: "center",
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: "#8A8A8A",
        marginTop: 10,
    },

    amount: {
        textAlign: "center",
        fontSize: 28,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#0B6E4F",
        // marginVertical: 6,
    },


    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center', // 👈 IMPORTANT (center karega)

        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#0D614E1A',

        gap: 6,
    },
    badgeText: {
        //   marginVertical:6,
        fontSize: 10,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,

    },

    badgeText1: {
        //   marginVertical:6,
        fontSize: 9,
        color: "#ffff",
        fontFamily: Fonts.PoppinsSemiBold,

    },

    heading: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        marginTop: 20,
        marginBottom: -5,
    },

    subheading: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 10,
    },

    // 🔹 EMI Card
    card: {
        backgroundColor: "#F1F3F2",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
    },

    activeCard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#0B6E4F",
    },

    badge: {
        position: "absolute",
        top: -10,
        right: 12,
        backgroundColor: "#0B6E4F",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },


    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    title: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#1E293B",
    },

    price: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#1E293B",
    },

    subtitle: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    total: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 4,
        fontFamily: Fonts.PoppinsMedium,
        textAlign: "right",
    },

    greenText: {
        color: "#0B6E4F",
    },

    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 12,
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    processing: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    infoIcon: {
        fontSize: 12,
        color: "#64748B",
    },

    processingText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: "#64748B",
    },

    tick: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: "#0B6E4F",
        justifyContent: "center",
        alignItems: "center",
    },

    // 🔹 Footer
    footer: {
        // position: "absolute",
        // bottom: 0,
        // left: 0,
        // right: 0,
        // padding: 16,

        marginTop: 25,
        backgroundColor: "#fff",
    },


    conversion: {
        backgroundColor: "#9FF2E14D",
        // padding: 10,
        gap: 8,
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#0051471A',
        flexDirection: 'row',
        borderRadius: 16,
        alignItems: "center",
    },

    confirmBtn: {
        backgroundColor: "#0B6E4F",
        padding: 10,
        borderRadius: 16,
        alignItems: "center",
    },

});