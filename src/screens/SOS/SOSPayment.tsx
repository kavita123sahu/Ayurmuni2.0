import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { Fonts } from "../../common/Fonts";
import { SafeAreaView } from "react-native-safe-area-context";
import SOSHeader from "../../components/SOSHeader";
import { Image } from "react-native-animatable";
import { Images } from "../../common/Images";

type UPIApp = "gpay" | "phonepay" | "paytm";

const SOSPayment: React.FC = () => {
    const [selectedApp, setSelectedApp] = useState<UPIApp>("phonepay");
    const [netbankingOpen, setNetbankingOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState("Select Bank");

    const [timeLeft, setTimeLeft] = useState(119);

    const upiApps: UPIApp[] = ["gpay", "phonepay", "paytm"];

    useEffect(() => {
        if (timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFB" }}>
            <SOSHeader title="SOS Payment" onBackPress={() => console.log("Back")} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 20 }}
            >

                <View style={styles.alertBox}>
                    <View style={styles.alertRow}>
                        <View>
                            <Text style={styles.alertSmall}>LIMITED RESPONSE WINDOW</Text>
                            <Text style={styles.alertTitle}>
                                Doctor available in{" "}
                                <Text style={{ color: "#F43F5E" }}>
                                    {formatTime(timeLeft)} mins
                                </Text>
                            </Text>
                        </View>

                        <View style={styles.timerBox}>
                            <Image source={Images.timer} style={styles.timerIcon} />
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Consultation Fee</Text>
                        <Text style={styles.value}>Rs. 1200.00</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.label}>SOS Priority Charge</Text>
                            <Image source={Images.flashred} style={styles.smallIcon} />
                        </View>
                        <Text style={[styles.value, { color: "#F43F5E" }]}>
                            Rs. 599.00
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.rowBetween}>
                        <Text style={styles.totalText}>Total Amount</Text>
                        <Text style={styles.totalAmount}>Rs. 1799.00</Text>
                    </View>
                </View>

                {/* PAYMENT METHODS */}
                <View style={styles.paymentHeader}>
                    <Text style={styles.sectionTitle}>PAYMENT METHODS</Text>
                    <View style={styles.encryptRow}>
                        <Image source={Images.lock} style={styles.lockIcon} />
                        <Text style={styles.encryptText}>256-BIT ENCRYPTED</Text>
                    </View>
                </View>

                <Text style={styles.subText}>Popular UPI Apps</Text>

                {/* 🔥 UPI SECTION */}
                <View style={styles.upiRow}>
                    {upiApps.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.upiCard,
                                selectedApp === item && styles.selectedUpi,
                            ]}
                            onPress={() => setSelectedApp(item)}
                        >
                            <Image
                                source={Images[item as keyof typeof Images]}
                                style={styles.upiIcon}
                            />

                            <Text style={styles.upiText}>
                                {item === "gpay"
                                    ? "GPay"
                                    : item === "phonepay"
                                        ? "PhonePe"
                                        : "Paytm"}
                            </Text>

                            {selectedApp === item && (
                                <Text style={styles.fastTag}>FASTEST</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* CARD */}
                <View style={styles.cardBox}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Credit / Debit Card</Text>
                        <Image source={Images.card} style={styles.credit} />
                    </View>

                    <TextInput
                        placeholder="0000-0000-0000-0000"
                        style={styles.input}
                        placeholderTextColor="#9CA3AF"
                    />

                    <View style={styles.row}>
                        <TextInput
                            placeholder="DD-MM"
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                            placeholder="CVV"
                            style={[styles.input, { flex: 1 }]}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.netbanking}
                    onPress={() => setNetbankingOpen(!netbankingOpen)}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={Images.net} style={{ width: 20, height: 20, marginRight: 10, top: -1 }} />
                        <Text style={styles.label1}>Netbanking</Text>
                    </View>

                    <Image source={Images.downArrow} style={{ height: 6, width: 11 }} />
                </TouchableOpacity>

                {netbankingOpen && (
                    <View style={{ marginTop: -10, marginBottom: 20 }}>
                        {["Option 1", "Option 2"].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setSelectedBank(item);
                                    setNetbankingOpen(false);
                                }}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* SECURITY */}
                <View style={styles.securityRow}>
                    <Image source={Images.ssl} style={styles.secIcon} />
                    <Text style={styles.secText}>SSL SECURE</Text>

                    <Image source={Images.pci} style={styles.secIcon} />
                    <Text style={styles.secText}>PCI COMPLIANT</Text>
                </View>

                {/* REFUND BOX */}
                <View style={styles.refundBox}>
                    <Text style={styles.refundText}>
                        100% Refund Guarantee: If the emergency consultation doesn't connect
                        within 5 minutes, your full amount will be auto-credited back.
                    </Text>
                </View>

            </ScrollView>

            {/* BUTTON */}
            <TouchableOpacity style={styles.checkout}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.checkoutText}>Secure Pay</Text>
                    <Image source={Images.rightArrow} style={{ height: 24, width: 24, marginLeft: 6 }} />
                </View>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default SOSPayment;

const styles = StyleSheet.create({

    alertBox: {
        borderLeftWidth: 2,
        borderColor: "#F43F5E",
        backgroundColor: "#F43F5E1A",
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
    },

    alertRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    alertSmall: {
        fontSize: 12,
        color: "#F43F5E",
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 1
    },

    alertTitle: {
        fontSize: 18,
        marginTop: 4,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    timerIcon: { width: 24, height: 24 },

    sectionTitle: {
        fontSize: 14,
        marginBottom: 10,
        marginTop: 10,
        color: "#64748B",
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.6
    },

    summaryCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        alignItems: "center",
    },

    label: {
        fontSize: 16,
        color: "#64748B",
        fontFamily: Fonts.PoppinsSemiBold

    },

    label1: {
        fontSize: 14,
        color: "#0F172A",
        fontFamily: Fonts.PoppinsSemiBold

    },

    value: {
        fontSize: 16,
        color: "#0F172A",
        fontFamily: Fonts.PoppinsSemiBold

    },

    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 8,
    },

    totalText: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 20,
        color: "#191C1D",
    },

    totalAmount: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 20,
        color: "#191C1D",
    },

    paymentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    encryptRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    encryptText: {
        fontSize: 12,
        marginLeft: 4,
        fontFamily: 'Gilroy-SemiBold',
        color: "#006B5F"

    },

    subText: {
        fontSize: 12,
        marginVertical: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#64748B"
    },

    upiRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,

    },

    upiCard: {
        width: "30%",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },

    selectedUpi: {
        borderWidth: 2,
        borderColor: "#006B5F",
    },

    upiIcon: { width: 40, height: 40 },

    fastTag: {
        position: "absolute",
        top: -8,
        backgroundColor: "#006B5F",
        color: "#fff",
        fontSize: 8,
        paddingHorizontal: 6,
        borderRadius: 6,
        right: -4,
        fontFamily: Fonts.PoppinsSemiBold
    },

    cardBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9"
    },

    input: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
    },

    row: {
        flexDirection: "row",
    },

    netbanking: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9"
    },

    securityRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,

    },

    secIcon: {
        width: 16,
        height: 16,
        tintColor: "#64748B"
    },

    secText: {
        fontSize: 12,
        color: "#64748B", fontFamily:
            'Gilroy-Bold', marginRight: 20
    },

    refundBox: {
        backgroundColor: "#0D614E0D",
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#0D614E1A"
    },

    refundText: {
        fontSize: 12,
        textAlign: "center",
        color: "#065F46",
        lineHeight: 18,
        fontFamily: Fonts.PoppinsSemiBold
    },

    smallIcon: {
        width: 20,
        height: 20,
        marginLeft: 4,
    },

    credit: {
        width: 26,
        height: 26,
        marginLeft: 4,
        tintColor: "#64748B"
    },

    lockIcon: {
        width: 16,
        height: 16,
    },
    checkout: {
        backgroundColor: "#F43F5E",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 10,
    },

    checkoutText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },
    timerBox: {
        height: 40,
        width: 40,
        backgroundColor: "#F43F5E1A",
        borderWidth: 1,
        borderColor: "#F43F5E33",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },

    upiText: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#0F172A",
    },

    dropdownItem: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginTop: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
});