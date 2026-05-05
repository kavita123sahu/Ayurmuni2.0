import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image, StatusBar } from "react-native";
import SectionHeader from "../../components/SectionHeader";
import Header from "../../components/Header";
import { Images } from "../../common/Images";
import { Fonts } from "../../common/Fonts";
import { Colors } from "../../common/Colors";
import MealCard from "../../components/MealCard";
import { SafeAreaView } from "react-native-safe-area-context";



const macrosData = [
    { id: 1, label: "Carbs", value: 45, color: "#1FA77A" },
    { id: 2, label: "Protein", value: 30, color: "#2F6BDE" },
    { id: 3, label: "Fat", value: 25, color: "#F4B400" },
];

const mealsData = [
    {
        id: "1",
        type: "BREAKFAST",
        time: "08:30 AM",
        title: "Avocado & Poached Egg Toast",
        subtitle: "Whole grain sourdough...",
        kcal: 340,
        image: Images.Breakfast,
        status: "log",
    },
    {
        id: "2",
        type: "LUNCH",
        time: "01:15 PM",
        title: "Mediterranean Quinoa Bowl",
        subtitle: "Quinoa, chickpeas...",
        kcal: 520,
        image: Images.Breakfast,
        status: "done",
    },
    {
        id: "3",
        type: "DINNER",
        time: "07:45 PM",
        title: "Lemon Garlic Glazed Salmon",
        subtitle: "Wild salmon, asparagus...",
        kcal: 410,
        image: Images.Breakfast,
        status: "log",
    },
    {
        id: "4",
        type: "SNACKS",
        time: "Afternoon",
        title: "Mixed Nuts & Berries",
        subtitle: "Almonds, walnuts...",
        kcal: 185,
        image: Images.Breakfast,
        status: "log",
    },
    {
        id: "5",
        type: "SNACKS",
        time: "Afternoon",
        title: "Mixed Nuts & Berries",
        subtitle: "Almonds, walnuts...",
        kcal: 185,
        image: Images.Breakfast,
        status: "log",
    },
];

const DietScreen = (props: any) => {


    const Macro = ({ label = "", value = 0, color = "#000" }) => {
        const safeValue = Math.min(Math.max(value, 0), 100);
        return (
            <View style={styles.macroItem}>
                <View style={styles.macroTop}>
                    <Text style={styles.macroLabel}>{label}</Text>
                    <Text style={[styles.macroPercent, { color }]}>
                        {safeValue}%
                    </Text>
                </View>

                <View style={styles.progressBg}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${safeValue}%`,
                                backgroundColor: color,
                            },
                        ]}
                    />
                </View>
            </View>
        );
    };

    const DailyVitalityCard = () => {
        return (
            <View style={styles.DailyCard}>

                <View style={styles.content}>

                    <View style={styles.circle}>
                        <Text style={styles.calories}>1,420</Text>
                        <Text style={styles.kcalText}>KCAL LEFT</Text>
                    </View>

                    <View style={styles.info}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Eaten</Text>
                            <Text style={styles.value}>780 kcal</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Burned</Text>
                            <Text style={[styles.value, styles.green]}>320 kcal</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.goalLabel}>Goal</Text>
                            <Text style={styles.goalValue}>2,200 kcal</Text>
                        </View>
                    </View>
                </View>


                <View style={styles.macroRow}>
                    {macrosData.map((item) => (
                        <Macro
                            key={item.id}
                            label={item.label}
                            value={item.value}
                            color={item.color}
                        />
                    ))}
                </View>


            </View>
        );
    };


    const HydrationCard = () => {
        return (
            <View style={styles.Hydrationcard}>
                <View style={styles.left}>
                    <View style={styles.iconBox}>
                        <Image source={require('../../assets/images/WaterDrop.png')} style={{ height: 20, width: 16 }} />
                    </View>

                    <View>
                        <Text style={styles.Hydrationtitle}>Hydration</Text>
                        <Text style={styles.subtitle}>1.2L of 2.5L reached</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.minus}>
                        <Text style={styles.btnText}>−</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.plus}>
                        <Text style={styles.plusText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

            <Header
                title="Diet"
                subtitle="Track your medical journey"
                backIcon={Images.backIcon}
                onBack={() => { props.navigation.goBack() }}
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 100 }} >

                <View style={{ flex: 1, justifyContent: "space-between" }}>

                    <SectionHeader title="Daily Vitality" actionText="Tuesday, Oct 24" />

                    <DailyVitalityCard />

                    <HydrationCard />

                    <SectionHeader title="Today's Meals" actionText="Weekly Plan" />

                    <FlatList
                        data={mealsData}
                        scrollEnabled={false} // 👈 IMPORTANT
                        keyExtractor={(item) => item.id}

                        renderItem={({ item }) => <MealCard data={item} navigation={props.navigation} />}
                    />

                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default DietScreen;

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#FDFDFB" },

    card: {
        backgroundColor: "#fff",
        margin: 12,
        padding: 16,
        borderRadius: 12,
    },
    DailyCard: {
        backgroundColor: "#0D614E0D",
        borderRadius: 20,
        paddingVertical: 25,
        paddingHorizontal: 25
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1D1F",
    },

    date: {
        color: "#1FA77A",
        fontWeight: "600",
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
    },

    circle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 10,
        borderColor: "#0F5D4A",
        justifyContent: "center",
        alignItems: "center",
    },

    calories: {
        fontSize: 26,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        marginBottom: -10
    },

    kcalText: {
        fontSize: 12,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular
    },

    info: {
        flex: 1,
        marginLeft: 20,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    label: {
        color: Colors.subTextColor,
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium

    },

    value: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },

    green: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14
    },

    divider: {
        height: 1,
        backgroundColor: "#D1D5DB",
        marginVertical: 10,
    },

    goalLabel: {
        fontSize: 16,
        color: Colors.subTextColor,
    },

    goalValue: {
        fontSize: 16,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold
    },


    macroRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    macroItem: {
        width: "30%",
    },

    macroTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },

    macroLabel: {
        fontSize: 12,
        color: Colors.black,
        fontFamily: Fonts.PoppinsMedium
    },

    macroPercent: {
        fontSize: 12,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold
    },

    progressBg: {
        height: 6,
        backgroundColor: "#E0E3E2", // light gray
        borderRadius: 11,
        overflow: "hidden",
    },

    progressFill: {
        height: 6,
        borderRadius: 10,
    },

    Hydrationcard: {
        backgroundColor: "#0D614E0D",
        marginTop: 20,
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    left: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconBox: {
        width: 50,
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    Hydrationtitle: {
        fontSize: 16,
        marginBottom: -5,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold
    },

    subtitle: {
        color: Colors.subTextColor,
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium

    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
    },

    minus: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.borderColor,
        marginRight: 10,
    },

    plus: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: "#0F5D4A",
        justifyContent: "center",
        alignItems: "center",
    },

    btnText: {
        fontSize: 25,
        color: "#374151",
    },

    plusText: {
        fontSize: 25,
        color: "#fff",
    },

});