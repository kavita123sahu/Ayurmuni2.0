import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    StatusBar,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { generateDates } from '../../common/DataInterface';


/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type SlotType =
    | 'Morning'
    | 'Afternoon'
    | 'Evening';

interface SlotSection {
    title: SlotType;
    icon: keyof typeof Ionicons.glyphMap;
    slots: string[];
}


const SLOT_DATA: SlotSection[] = [
    {
        title: 'Morning',
        icon: 'sunny-outline',
        slots: [
            '09:00 AM',
            '09:30 AM',
            '10:00 AM',
            '10:30 AM',
        ],
    },

    {
        title: 'Afternoon',
        icon: 'partly-sunny-outline',
        slots: [
            '02:00 PM',
            '02:30 PM',
            '03:00 PM',
        ],
    },

    {
        title: 'Evening',
        icon: 'moon-outline',
        slots: [
            '06:00 PM',
            '06:30 PM',
        ],
    },
];


const DoctorSlot = (props: any) => {

    const DAYS = generateDates();

    const [selectedDay, setSelectedDay] = useState<number>(
        DAYS.find(d => d.isToday)?.date || DAYS[0].date
    );


    const [selectedSlot, setSelectedSlot] =
        useState('09:30 AM');

    const [concern, setConcern] =
        useState('');

    const doctorStats = useMemo(
        () => [
            {
                label: 'PATIENTS',
                value: '1,200+',
            },
            {
                label: 'REVIEWS',
                value: '978',
            },
            {
                label: 'EXPERIENCE',
                value: '12+',
            },
        ],
        [],
    );

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar
                backgroundColor="#0D614E0D"
                barStyle="dark-content"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }
            >

                <View style={styles.headerContainer}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => { props.navigation.goBack() }}
                            style={styles.iconBtn}
                        >
                            <Image source={Images.backIcon} style={{ height: 40, width: 40 }} />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>
                            Doctor Profile
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.iconBtn}
                        >
                            <Ionicons
                                name="heart-outline"
                                size={25}
                                color="#0F172A"
                            />
                        </TouchableOpacity>
                    </View>



                    <View style={styles.profileContainer}>
                        <View style={styles.avatarBgWrapper}>
                            <ImageBackground
                                source={Images.BackgroundImage}
                                style={styles.avatarBg}
                                imageStyle={{ borderRadius: 100 }}
                            >
                                <View style={styles.avatarWrapper}>
                                    <Image source={Images.doctorImage} style={styles.avatar} />


                                </View>
                            </ImageBackground>
                        </View>


                        <Text style={styles.doctorName}>
                            Dr. Arjun R Nair
                        </Text>

                        <Text style={styles.speciality}>
                            Senior Cardiologist
                        </Text>
                    </View>
                </View>



                <View style={styles.statsContainer}>
                    {doctorStats.map(
                        (item, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.statBox,
                                    index !==
                                    doctorStats.length -
                                    1 && styles.borderRight,
                                ]}
                            >
                                <Text
                                    style={styles.statValue}
                                >
                                    {item.value}
                                </Text>

                                <Text
                                    style={styles.statLabel}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        ),
                    )}
                </View>


                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>
                            Schedules
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.monthBtn}
                        >
                            <Text
                                style={styles.monthText}
                            >
                                October 2023
                            </Text>

                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color={Colors.primaryColor}
                            />
                        </TouchableOpacity>
                    </View>


                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.daysContainer
                        }
                    >
                        {DAYS.map(item => {
                            const isActive =
                                selectedDay === item.date;

                            return (
                                <TouchableOpacity
                                    key={item.date}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        setSelectedDay(
                                            item.date,
                                        )
                                    }
                                    style={[
                                        styles.dayCard,
                                        isActive &&
                                        styles.activeDayCard,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isActive &&
                                            styles.activeDayText,
                                        ]}
                                    >
                                        {item.day}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.dateText,
                                            isActive &&
                                            styles.activeDayText,
                                        ]}
                                    >
                                        {item.date}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* SLOT SECTIONS */}

                    {SLOT_DATA.map(section => (
                        <View
                            key={section.title}
                            style={
                                styles.slotSection
                            }
                        >
                            <View
                                style={
                                    styles.slotHeader
                                }
                            >
                                <Ionicons
                                    name={section.icon}
                                    size={16}
                                    color="#94A3B8"
                                />

                                <Text
                                    style={
                                        styles.slotTitle
                                    }
                                >
                                    {section.title}
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.slotGrid
                                }
                            >
                                {section.slots.map(
                                    slot => {
                                        const selected =
                                            selectedSlot ===
                                            slot;

                                        return (
                                            <TouchableOpacity
                                                key={slot}
                                                activeOpacity={
                                                    0.8
                                                }
                                                onPress={() =>
                                                    setSelectedSlot(
                                                        slot,
                                                    )
                                                }
                                                style={[
                                                    styles.slotBtn,
                                                    selected &&
                                                    styles.activeSlotBtn,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.slotText,
                                                        selected &&
                                                        styles.activeSlotText,
                                                    ]}
                                                >
                                                    {slot}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    },
                                )}
                            </View>
                        </View>
                    ))}


                </View>

                {/* CONCERN */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Concern
                    </Text>

                    <TextInput
                        multiline
                        value={concern}
                        onChangeText={setConcern}
                        placeholder="Briefly describe your symptoms..."
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        textAlignVertical="top"
                    />
                </View>

                {/* FOOTER */}

                <View style={styles.footer}>
                    <View>
                        <Text style={styles.feeLabel}>
                            Consult Fee
                        </Text>

                        <Text style={styles.price}>
                            Rs. 1499.00
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.payBtn}
                        onPress={() => props.navigation.navigate('BookingConfrimScreen')}
                    >
                        <Ionicons
                            name="card-outline"
                            size={18}
                            color="#FFFFFF"
                        />

                        <Text style={styles.payText}>
                            Pay
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DoctorSlot;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D614E0D',
    },

    scrollContent: {
        paddingBottom: 40,
        backgroundColor: '#FFFFFF'
    },

    headerContainer: {
        backgroundColor: '#0D614E0D',

        borderBottomLeftRadius: 56,
        borderBottomRightRadius: 56,

        paddingHorizontal: 20,
        paddingBottom: 28,
    },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingTop: 10,

        minHeight: 50,
    },

    iconBtn: {
        width: 36,
        height: 36,

        borderRadius: 10,

        backgroundColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarBgWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -10,
    },

    avatarBg: {
        padding: 30,
        height: 150,
        boxShadow: '#0D614E',
        width: '58%',
        aspectRatio: 1,
        borderRadius: 100,
        overflow: 'hidden',
        shadowOpacity: 4,
        shadowColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarWrapper: {
        width: 105,
        height: 105,
        borderRadius: 24,
        borderWidth: 1,

        overflow: 'hidden',
        borderColor: '#DDEBE8',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        padding: 10,

        // Shadow
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
    },

    bgImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // overflow: 'hidden', // 👈 IMPORTANT
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 16,

        resizeMode: 'cover',
    },

    IconSize: {
        width: 30,
        height: 30

    },
    editText: {
        color: '#fff',
        fontSize: 12,
    },

    headerTitle: {
        fontSize: 22,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold
    },

    profileContainer: {
        alignItems: 'center',
        marginTop: 18,
    },

    profileImage: {
        width: 100,
        height: 98,

        borderRadius: 20,

        resizeMode: 'cover',

        borderWidth: 10,
        borderColor: '#FFFFFF',
    },

    doctorName: {
        marginTop: 10,
        marginBottom: -5,
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },

    speciality: {

        fontSize: 14,

        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    statsContainer: {
        flexDirection: 'row',

        marginTop: 22,
        marginHorizontal: 20,

        backgroundColor: '#FFFFFF',

        borderRadius: 20,

        borderWidth: 1,
        borderColor: '#F1F5F9',

        overflow: 'hidden',
    },

    statBox: {
        flex: 1,

        alignItems: 'center',

        paddingVertical: 18,
    },

    borderRight: {
        borderRightWidth: 1,
        borderRightColor: '#F1F5F9',
    },

    statValue: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsBold,
        color: '#1E293B',
    },

    statLabel: {

        fontSize: 12,

        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium
    },

    section: {

        marginTop: 24,
        paddingHorizontal: 20,
    },

    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    monthBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    monthText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        marginRight: 4,

    },

    daysContainer: {
        paddingTop: 18,
        paddingBottom: 8,
    },

    dayCard: {


        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#E2E8F0',

        width: 72,
        height: 82,

        borderRadius: 18,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 12,

        paddingHorizontal: 6,
    },

    activeDayCard: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.background,
    },

    dayText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },

    dateText: {

        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },

    activeDayText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },

    slotSection: {
        marginTop: 18,
    },

    slotHeader: {
        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 14,
    },

    slotTitle: {
        marginLeft: 6,

        fontSize: 13,
        fontWeight: '700',

        color: '#94A3B8',

        textTransform: 'uppercase',
    },

    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    slotBtn: {
        width: '31%',

        minHeight: 50,

        borderRadius: 14,

        borderWidth: 1,
        borderColor: '#E2E8F0',

        backgroundColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 12,

        paddingHorizontal: 8,
    },

    activeSlotBtn: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.background,
    },

    slotText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#475569',

        textAlign: 'center',

        includeFontPadding: false,
    },

    activeSlotText: {
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
    },

    input: {
        marginTop: 14,

        height: 120,

        borderRadius: 18,

        backgroundColor: '#F8FAFC',

        borderWidth: 1,
        borderColor: '#E2E8F0',

        padding: 16,
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,

        color: '#1E293B',
    },

    footer: {
        marginTop: 28,
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignItems: 'center',

        gap: 12,
    },

    feeLabel: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },

    price: {

        fontSize: 28,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor
    },

    payBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: Colors.primaryColor,

        height: 56,
        paddingHorizontal: 36,
        borderRadius: 18,
        flex: 1,
    },

    payText: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },
    // ==========================================
    // 🔥 EXTRA STYLES
    // ==========================================

    dropdown: {
        marginTop: 8,
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingVertical: 8,

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 6,

        elevation: 4,
    },

    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    dropdownText: {
        fontSize: 14,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsMedium,
    },
});