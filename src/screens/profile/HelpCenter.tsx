import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { Images } from "../../common/Images";
import SearchBar from "../../components/SearchBar";
import { Ionicons } from "../../common/Vector";
import DynamicGrid from "../../components/DynamicGrid";
import { Colors } from "../../common/Colors";
import SectionHeader from "../../components/SectionHeader";
import { Fonts } from "../../common/Fonts";
import { Styles } from "../../common/Styles";
import FAQItem from "../../components/FAQItem";


const HelpCenterScreen = (props: any) => {

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const faqData = [
        {
            id: "1",
            question: "How do I reschedule my appointment?",
            answer:
                "To reschedule, go to ‘Activities’ tab, select your upcoming appointment, and click the ‘Reschedule’ button.",
        },
        {
            id: "2",
            question: "When will my lab results be ready?",
            answer:
                "Lab results are usually available within 24–48 hours after the test.",
        },
        {
            id: "3",
            question: "Can I pay my bill using insurance?",
            answer:
                "Yes, you can select insurance as a payment option during checkout.",
        },
    ];

    const categoryData = [
        {
            id: "1",
            title: "Appointments",
            icon: Images.calender,
        },
        {
            id: "2",
            title: "Orders",
            icon: Images.orders,
        },

        {
            id: "3",
            title: "Payments",
            icon: Images.payment,
        },
        {
            id: "4",
            title: "Reports",
            icon: Images.report,
        },

    ];

    const CategoryCard = ({ title, icon }: any) => {
        return (
            <View style={styles.card}>
                <Image source={icon} style={styles.icon} tintColor={Colors.primaryColor} />
                <Text style={styles.text}>{title}</Text>
            </View>
        );
    };


    const HelpSection = () => {
        return (
            <View style={styles.container1}>
                <Text style={styles.title}>Still need help?</Text>
                <Text style={styles.desc}>
                    Our support team is available 24/7 to assist you
                    with any healthcare-related inquiries.
                </Text>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.callBtn}>
                        <Ionicons name="call" size={16} color="#fff" />
                        <Text style={styles.callText}>Call Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatBtn}>
                        <Image source={Images.ChatSupport} style={Styles.IconSize} tintColor={Colors.primaryColor} />
                        <Text style={styles.chatText}>Chat Support</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            <AppHeader
                title="Help Center"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
                rightIcon="search"
                onRightPress={() => console.log('Search clicked')}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    <SearchBar
                        placeholder="Search for reports, doctors..."
                        icon={require('../../assets/images/search.png')} />



                    <SectionHeader title="Categories" />

                    <DynamicGrid
                        data={categoryData}
                        columns={2}
                        renderItem={(item) => (
                            <CategoryCard title={item.title} icon={item.icon} />
                        )}
                    />

                    <SectionHeader title="Popular Questions" />

                    {faqData.map((item, index) => (
                        <FAQItem
                            key={item.id}
                            question={item.question}
                            answer={item.answer}
                            isOpen={activeIndex === index}
                            onPress={() =>
                                setActiveIndex(activeIndex === index ? null : index)
                            }
                        />
                    ))}



                    <HelpSection />

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HelpCenterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFDFB",
    },
    content: {
        padding: 20,
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: "600",
    },

    container1: {
        backgroundColor: "#F1F5F9",
        padding: 16,
        borderRadius: 14,
        marginTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium
    },
    desc: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
        fontFamily: Fonts.PoppinsMedium
    },
    row: {
        flexDirection: "row",
        marginTop: 12,
    },
    callBtn: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#065F46",
        padding: 10,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    callText: {
        color: "#fff",
        marginLeft: 6,
        fontFamily: Fonts.PoppinsMedium

    },
    chatBtn: {
        flex: 1,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#065F46",
        padding: 10,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    chatText: {
        marginLeft: 6,
        color: "#065F46",

        fontFamily: Fonts.PoppinsMedium
    },
    grid: {
        flexDirection: "row",
    },
    card: {
        flex: 1, // ✅ IMPORTANT
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        height: 24,
        width: 24,
        marginBottom: 8,
    },
    text: {
        fontSize: 13,
        color: "#111827",
        fontFamily: Fonts.PoppinsMedium
    },
});