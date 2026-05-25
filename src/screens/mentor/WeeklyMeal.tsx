import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { CalenderCard } from '../../components/CalenderCard';
import { generateDates } from '../../common/DataInterface';
import SectionHeader from '../../components/SectionHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const days = [
    { day: 'Mon', date: 12 },
    { day: 'Tue', date: 13 },
    { day: 'Wed', date: 14, active: true },
    { day: 'Thu', date: 15 },
];

const meals = [
    {
        type: 'Breakfast',
        name: 'Berry Acai Bowl',
        kcal: 420,
        image: Images.Breakfastbowl
    },
    {
        type: 'Lunch',
        name: 'Berry Acai Bowl',
        kcal: 420,
        image: Images.Breakfastbowl
    },
    {
        type: 'Snacks',
        name: 'Almond & Apple',
        kcal: 420,
        image: Images.Breakfastbowl
    },
];

const macros = [
    { label: 'Protein', value: '124g', total: '150g' },
    { label: 'Carbs', value: '210g', total: '250g' },
    // { label: 'Fats', value: '60g', total: '80g' }, // 🔥 future ready
];

type MealProps = {
    item: any;
};



const WeeklyMeal = (props: any) => {

    const dates = generateDates();
    const [selected, setSelected] = useState(
        dates.find(d => d.isToday)?.fullDate
    );

    const MealCard: React.FC<MealProps> = ({ item }) => {
        return (
            <View style={styles.mealCard}>
                <Image source={item.image} style={styles.mealImage} />

                <View style={{ flex: 1 }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.mealType}>{item.type}</Text>
                        <Text style={styles.kcal}>{item.kcal} kcal</Text>
                    </View>
                    <Text style={styles.mealName}>{item.name}</Text>



                    <View style={styles.tagRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>High Fiber</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Plant-based</Text>
                        </View>
                    </View>
                </View>


            </View>
        );
    };


    const WeeklyPlanner = () => {
        return (
            <View style={styles.card}>

                <View style={styles.topRow}>
                    <View style={styles.leftBox}>
                        <Text style={styles.subTitle}>Daily Energy</Text>

                        <View style={styles.energyRow}>
                            <Text style={styles.energyValue}>1,840</Text>
                            <Text style={styles.energyTotal}> / 2,200 kcal</Text>
                        </View>
                    </View>

                    <View style={styles.circle}>
                        <Text style={styles.calories}>85%</Text>
                    </View>

                </View>

                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: '85%' }]} />
                </View>

            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container} >

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFF'} />

            <AppHeader
                title="Meal Details"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
            />


            <ScrollView style={styles.maincontainer} showsHorizontalScrollIndicator={false}>
                <Text style={styles.title}>Weekly Planner</Text>

                <WeeklyPlanner />

                <View style={styles.macroRow}>
                    {macros.map((item, index) => (
                        <View key={index} style={styles.macroBox}>

                            <Text style={styles.macroLabel}>{item.label}</Text>

                            <View style={styles.macroInner}>
                                <Text style={styles.macroValue}>{item.value}</Text>
                                <Text style={styles.macroSub}>of {item.total}</Text>
                            </View>

                        </View>
                    ))}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }} style={styles.daysRow}>
                    {dates.map((item: any) => (
                        <CalenderCard
                            key={item.fullDate}
                            label={item.day}
                            value={item.date}
                            isActive={selected === item.fullDate}
                            onPress={() => setSelected(item.fullDate)}
                        />
                    ))}

                </ScrollView>

                <SectionHeader title={`Today's Meals`} />

                {meals.map((item, index) => (
                    <MealCard item={item} key={index} />
                ))}

                <View style={styles.planCard}>
                    <View style={{
                        backgroundColor: "#ffff",
                        justifyContent: 'center', alignItems: 'center', height: 50, width: 50,
                        borderRadius: 50
                    }}>
                        <Text style={styles.plus}>+</Text>
                    </View>
                    <Text style={styles.planText}>Plan Dinner</Text>
                </View>

            </ScrollView>


            <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('YogaSession')}>
                <Image source={Images.Spoon} style={{ height: 16, width: 16, tintColor: '#ffff', marginRight: 10 }} />
                <Text style={styles.buttonText}>Smart Auto-Fill Week</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default WeeklyMeal;


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.white

    },

    maincontainer: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 25,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 16,
        color: Colors.textColor,
        marginTop: 5,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        marginBottom: 15
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // ✅ vertical center fix
    },

    leftBox: {
        flex: 1, // ✅ responsive width
        justifyContent: 'space-between',
    },

    subTitle: {
        color: '#64748B',
        fontSize: 14,
        marginBottom: -8,
        fontFamily: Fonts.PoppinsMedium,
    },

    energyRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },

    energyValue: {
        fontSize: 30,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },

    energyTotal: {
        color: '#64748B',
        marginLeft: 4,

        fontFamily: Fonts.PoppinsMedium,

    },

    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    calories: {
        fontSize: 12,

        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
    },

    progressBg: {
        height: 8,
        backgroundColor: '#E6E9E8',
        borderRadius: 10,
        marginTop: 16, // ✅ always below
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#FFC107',
        borderRadius: 10,
    },
    macroRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // 🔥 grid magic
        justifyContent: 'space-between',
    },

    macroBox: {
        width: '48%', // 🔥 2 column responsive
        backgroundColor: '#0D614E0D',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },

    macroInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },

    macroLabel: {
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },

    macroValue: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsBold,
        color: '#0F172A',
    },

    macroSub: {
        color: '#94A3B8',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
    },
    daysRow: {
        marginVertical: 20,


    },




    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },

    mealCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1, borderColor: Colors.borderColor,
        marginBottom: 15,
        alignItems: 'center',
    },

    mealImage: {
        width: 70,
        height: 70,
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        marginRight: 10,
    },

    mealType: {
        color: Colors.primaryColor,
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },

    mealName: {
        fontSize: 16,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold
    },

    tagRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 5,
    },

    tag: {
        backgroundColor: '#94A3B833',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    tagText: {
        fontSize: 10,
        color: '#3E4946',
        fontFamily: Fonts.PoppinsMedium
    },

    kcal: {
        color: '#64748B',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium
    },

    planCard: {
        // height: 120,
        padding: 25,
        borderRadius: 16,
        backgroundColor: '#F1F4F3',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#BEC9C54D',
        marginVertical: 10,
    },

    plus: {
        fontSize: 30,
        color: Colors.primaryColor

    },

    planText: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
        marginTop: 10
    },

    button: {
        backgroundColor: Colors.primaryColor,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        marginHorizontal: 20
    },

    buttonText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },
});