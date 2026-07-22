import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import SearchBar from "../../components/SearchBar";
import { Ionicons } from "../../common/Vector";
import DynamicGrid from "../../components/DynamicGrid";
import { Colors } from "../../common/Colors";
import SectionHeader from "../../components/SectionHeader";
import { Fonts } from "../../common/Fonts";
import FAQItem from "../../components/FAQItem";
import TablerIcon, { TablerIconName } from "../../components/TablerIcon";
import { useDebounce } from "../../hooks/useDebaunce";

const HelpCenterScreen = (props: any) => {

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 400);

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
        { id: "1", title: "Appointments", iconName: 'calendar' as TablerIconName },
        { id: "2", title: "Orders", iconName: 'receipt' as TablerIconName },
        { id: "3", title: "Records", iconName: 'report' as TablerIconName },
        { id: "4", title: "Payments", iconName: 'credit-card' as TablerIconName },
    ];

    const filteredCategories = useMemo(() => {
        const q = debouncedSearch.trim().toLowerCase();
        if (!q) return categoryData;
        return categoryData.filter((item) =>
            item.title.toLowerCase().includes(q),
        );
    }, [debouncedSearch]);

    const filteredFaqs = useMemo(() => {
        const q = debouncedSearch.trim().toLowerCase();
        if (!q) return faqData;
        return faqData.filter(
            (item) =>
                item.question.toLowerCase().includes(q) ||
                item.answer.toLowerCase().includes(q),
        );
    }, [debouncedSearch]);

    const CategoryCard = ({ title, iconName }: { title: string; iconName: TablerIconName }) => {
        return (
            <View style={styles.card}>
                <View style={{backgroundColor: '#0D614E0D', padding:10, justifyContent:'center',alignItems:'center', borderRadius:10}}>
                    <TablerIcon name={iconName} size={24} color={Colors.primaryColor} />
                </View>
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
                        <TablerIcon name="chat-support" size={18} color={Colors.primaryColor} />
                        <Text style={styles.chatText}>Chat Support</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />

            <AppHeader
                title="Help Center"
                onLeftPress={() => props.navigation.goBack()}
                rightIconName="search"
                onRightPress={() => console.log('Search clicked')}
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor:'#FDFDFB'}}>
                <View style={styles.content}>

                    <SearchBar
                        placeholder="Search for help topics..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />

                    {filteredCategories.length > 0 && (
                        <>
                            <SectionHeader title="Categories" />

                            <DynamicGrid
                                data={filteredCategories}
                                columns={2}
                                renderItem={(item) => (
                                    <CategoryCard title={item.title} iconName={item.iconName} />
                                )}
                            />
                        </>
                    )}

                    {filteredFaqs.length > 0 && (
                        <>
                            <SectionHeader title="Popular Questions" />

                            {filteredFaqs.map((item, index) => (
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
                        </>
                    )}

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
        backgroundColor: "#FFFFFF",
    },
    content: {
        padding: 20,
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
        height: 52,
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
        height: 52,
        borderColor: "#065F46",
        padding: 10,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    chatText: {
        marginLeft: 6,
        color: "#065F46",
        fontFamily: Fonts.PoppinsMedium
    },
    card: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 16,
        borderWidth: 1,
        height:120,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        justifyContent: "center",
    },
    text: {
        fontSize: 13,
        color: "#111827",
        marginTop:10,
        fontFamily: Fonts.PoppinsSemiBold
    },
});
