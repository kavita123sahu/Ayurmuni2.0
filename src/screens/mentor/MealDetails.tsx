import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import SectionHeader from "../../components/SectionHeader";
import { Fonts } from "../../common/Fonts";
import { Colors } from "../../common/Colors";
import { CalenderCard } from "../../components/CalenderCard";
import AppHeader from "../../components/AppHeader";
import { Images } from "../../common/Images";
import StepCard from "../../components/StepCard";
import { SafeAreaView } from "react-native-safe-area-context";


const stepsData = [
    { id: "1", step: "Toast the sourdough bread until golden and crisp." },
    { id: "2", step: "Mash the avocado with salt, pepper, and lemon juice." },
    { id: "3", step: "Poach the eggs in simmering water for 3-4 minutes." },
    { id: "4", step: "Spread avocado on toast, top with eggs and chili flakes." },
];

const statsData = [
    { label: "Calories", value: "340", bg: "#EDEFF1" },
    { label: "Carbs", value: "24g", bg: "#EDEFF1" },
    { label: "Protein", value: "12g", bg: "#EDEFF1" },
    { label: "Fat", value: "22g", bg: "#EDEFF1" },
];

const ingredientsData = [
    { id: "1", title: "Sourdough Bread", subtitle: "1 thick slice" },
    { id: "2", title: "Ripe Avocado", subtitle: "1/2 large" },
    { id: "3", title: "Large Eggs", subtitle: "2" },
    { id: "4", title: "Olive Oil", subtitle: "1 tsp" },
    { id: "5", title: "Chili Flakes & Salt", subtitle: "to taste" },
];
const MealDetails = (props: any) => {

    const IngredientCard = ({ title = "", isLast = "", subtitle = "" }) => {
        return (
            <>
                <View style={styles.itemRow}>
                    <Text style={styles.itemLeft} numberOfLines={1}>
                        {title}
                    </Text>

                    <Text style={styles.itemRight} numberOfLines={1}>
                        {subtitle}
                    </Text>
                </View>
            </>
        );
    };

    const StepItem = ({ index, text }: any) => {
        return (
            <View style={styles.stepRow}>

                <View style={styles.stepCircle}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>

                <Text style={styles.stepText}>
                    {text}
                </Text>
            </View>
        );
    };
    return (

        <SafeAreaView style={styles.container}>

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFF'} />

            <AppHeader
                title="Meal Details"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{     backgroundColor: '#FDFDFB'}}
                // contentContainerStyle={styles.scroll}
                >

                <Image
                    source={Images.Breakfast}
                    style={styles.image}
                />
                <View style={styles.card}>

                    {/* HEADER */}
                    <View style={styles.rowBetween}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Breakfast</Text>
                        </View>

                        <Image source={Images.favourite} style={{ height: 30, width: 30 }} />
                    </View>


                    <Text style={styles.title}>
                        Avocado & Poached{"\n"}Egg Toast
                    </Text>

                    <View style={styles.statsRow}>
                        {statsData.map((item, index) => (

                            <View style={[styles.statBox]}>
                                <Text style={[styles.statLabel, { color: "#6B7280" }]}>
                                    {item?.label}
                                </Text>

                                <Text style={[styles.statValue, { color: Colors.primaryColor }]}>
                                    {item?.value}
                                </Text>
                            </View>
                        ))}
                    </View>


                    <View style={styles.sectionContainer}>
                        <View style={{
                            flexDirection: 'row',
                            marginBottom: -15
                        }}>
                            <Image source={Images.Ingredient} style={{ justifyContent: 'center', marginRight: 8, height: 15, width: 15 }} />
                            <Text style={styles.sectionTitle}>Ingredient</Text>

                        </View>


                        {ingredientsData.map((item, index) => (
                            <IngredientCard
                                key={item.id}
                                title={item.title}
                                subtitle={item.subtitle}

                            />
                        ))}
                    </View>



                    <View style={styles.sectionContainer}>

                        <View style={{
                            flexDirection: 'row',
                        }}>
                            <Image source={Images.prescriptionIcon} style={{ justifyContent: 'center', marginRight: 8, height: 15, width: 15 }} />
                            <Text style={styles.sectionTitle}>Preparation Steps</Text>

                        </View>
                        {stepsData.map((item, index) => (
                            <StepItem
                                key={item.id}
                                index={index}
                                text={item.step}
                                isLast={index === stepsData.length - 1}
                            />
                        ))}
                    </View>

                </View>


            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={() => props.navigation.navigate('WeeklyMeal')}>
                    <Text style={styles.btnText}>Log Meal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.secondaryBtn]}>
                    <Text style={[styles.btnText, { color: Colors.primaryColor }]}>+</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default MealDetails;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    image: {
        width: "100%",
        height: 300,
        resizeMode: 'stretch'
    },

    scroll: {
        paddingBottom: 120,
        backgroundColor: '#FDFDFB'

    },

    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        borderWidth: 1,

        borderColor: Colors.borderColor,
        marginTop: -40, // 🔥 overlap effect
        borderRadius: 20,
        padding: 20,
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    tag: {
        backgroundColor: Colors.bgcolor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },

    tagText: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 12,
    },

    heart: {
        fontSize: 20,
    },

    title: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsBold,
        color: "#1A1D1F",
        marginVertical: 20,

    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },

    statBox: {
        backgroundColor: "#EDEFF1",
        padding: 10,
        borderRadius: 14,
        width: "22%",
        alignItems: "center",
    },

    statLabel: {
        fontSize: 10,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsSemiBold
    },

    statValue: {
        fontSize: 16,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsBold,
    },
    sectionContainer: {
        marginTop: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 20,
        marginTop: -5
    },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        //  marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#EBEEED80", // light divider
    },
    itemLeft: {
        flex: 1,
        fontSize: 14,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    itemRight: {
        fontSize: 16,
        color: "#6B7280",
        fontFamily: Fonts.PoppinsRegular,
        marginLeft: 10,
    },

    footer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        // paddingBottom: 40,
        gap: 12, // 👈 spacing between buttons
    },

    btn: {
        height: 55,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },

    primaryBtn: {
        flex: 4, // 👈 60%
        backgroundColor: Colors.primaryColor,
    },

    secondaryBtn: {
        flex: 1, // 👈 20%
        borderWidth: 1,
        borderColor: Colors.borderColor,
        backgroundColor: Colors.bgcolor,
    },

    btnText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    // btn: {
    //     backgroundColor: Colors.primaryColor,
    //     padding: 15,
    //     borderRadius: 30,
    //     alignItems: "center",
    // },



    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 25,
    },

    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 14,
        backgroundColor: "#F4D9A4", // same yellow tone
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },

    stepNumber: {
        fontSize: 12,
        color: "#1A1D1F",
        fontFamily: Fonts.PoppinsSemiBold,
    },

    stepText: {
        flex: 1,
        fontSize: 14,
        justifyContent: "center",
        alignItems: "center",
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsMedium,
        lineHeight: 20,
    },
});