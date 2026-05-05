import React, { useState, memo } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../common/Colors';
import SectionHeader from '../../components/SectionHeader';
import { CalenderCard } from '../../components/CalenderCard';
import { generateDates } from '../../common/DataInterface';
import TimeSlot from '../../components/TimeSlot';


// ✅ TYPES
type Service = {
    id: number;
    title: string;
    price: number;
    desc: string;
    image?: any;
};

type Props = {
    navigation: any;
};

// ✅ SERVICE CARD
const ServiceCard = memo(
    ({
        data,
        selected,
        onSelect,
    }: {
        data: Service[];
        selected: number;
        onSelect: (i: number) => void;
    }) => {
        return (
            <View>
                {data.map((item, index) => {
                    const active = selected === index;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => onSelect(index)}
                            style={[styles.card, active && styles.activeCard]}
                        >
                            <View style={{ flex: 1 }}>
                                <Image source={Images.video} style={styles.icon} />
                                <Text style={styles.title}>{item.title}</Text>
                            </View>

                            <Text style={styles.desc}>{item.desc}</Text>

                            {!!item.image && (
                                <Image source={item.image} style={styles.serviceImage} />
                            )}

                            <Text style={styles.price}>Rs. {item.price}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
);

// ✅ HEADER
const MentorHeader = memo(() => (
    <View style={styles.mentorcontainer}>
        <View style={styles.row}>
            <Image source={Images.MentorImage} style={styles.image} />

            <View style={{ flex: 1 }}>
                <Text style={styles.name}>Elena Vance</Text>
                <Text style={styles.role}>Holistic Wellness Lead</Text>

                <View style={styles.ratingRow}>
                    <Text style={styles.stars}>★★★★★</Text>
                    <Text style={styles.ratingText}>4.9 (128 reviews)</Text>
                </View>
            </View>
        </View>
    </View>
));

// ✅ MAIN SCREEN
export default function ConsultMentor({ navigation }: Props) {
    const [selectedService, setSelectedService] = useState(0);
    const [selectedTime, setSelectedTime] = useState('');

    const dates = generateDates();
    const [selectedDate, setSelectedDate] = useState(
        dates.find(d => d.isToday)?.fullDate
    );

    const SLOT_DATA = [{ title: 'MORNING SLOTS', slots: [{ time: '09:00 AM', available: true }, { time: '10:30 AM', available: true }, { time: '11:15 AM', available: true },], }, { title: 'AFTERNOON SLOTS', slots: [{ time: '02:00 PM', available: true }, { time: '03:30 PM', available: true }, { time: '04:45 PM', available: true },], }, { title: 'EVENING SLOTS', slots: [{ time: '06:00 PM', available: false }, { time: '07:30 PM', available: true }, { time: '08:15 PM', available: false },], },];

    const services: Service[] = [
        { id: 1, title: 'Video Call', price: 1599, desc: '40-minute session', image: Images.FAQImage },
        { id: 2, title: 'Sanctuary Visit', price: 1999, desc: 'In-person session', image: Images.FAQImage },
        { id: 3, title: 'Text Consultation', price: 999, desc: 'Async support' },
    ];

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFFCC'} />

            <AppHeader
                title="Consult Mentor"
                leftIcon={Images.backIcon}
                onLeftPress={() => navigation.goBack()}
            />

            <FlatList
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                data={[]} // ❗ important (no warning)
                renderItem={null}
                ListHeaderComponent={
                    <View>
                        <MentorHeader />

                        <SectionHeader title="Select Services" />

                        <ServiceCard
                            data={services}
                            selected={selectedService}
                            onSelect={setSelectedService}
                        />

                        <SectionHeader title="Availability" actionText="October 2023" />

                        {/* ✅ FIXED HORIZONTAL LIST */}
                        <FlatList
                            horizontal
                            data={dates}
                            contentContainerStyle={{ paddingVertical: 10 }}
                            keyExtractor={(item) => item.fullDate}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <CalenderCard
                                    label={item.day}
                                    value={item.date}
                                    isActive={selectedDate === item.fullDate}
                                    onPress={() => setSelectedDate(item.fullDate)}
                                />
                            )}
                        />

                        <TimeSlot
                            data={SLOT_DATA}
                            selected={selectedTime}
                            onSelect={setSelectedTime}
                        />
                    </View>


                }
                ListFooterComponent={
                    <SafeAreaView edges={['bottom']} style={styles.footer} >
                        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MentorCheckout')}>
                            <Text style={styles.btnText}>Confirm and Pay</Text>
                        </TouchableOpacity>

                        <View style={styles.termsContainer}>
                            <Text style={styles.termText}>
                                By booking, you agree to the Consult Sanctuary{' '}

                                <Text style={styles.highlightText}>
                                    Terms of Clinical Conduct
                                </Text>

                                {' '}and cancellation policy.
                            </Text>
                        </View>


                    </SafeAreaView>
                }
            />



        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        // paddingBottom:40,
    },
    daysRow: {
        marginVertical: 10,
        // marginBottom:-10


    },

    /* SERVICE CSS  */

    card: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    activeCard: {
        borderColor: '#006B5F',
        backgroundColor: '#0D614E0D',
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: Colors.primaryColor,
    },

    serviceImage: {
        marginTop: 10,
        height: 100,
        width: '100%',
        borderRadius: 16,
    },

    title: {
        fontSize: 16,
        marginBottom: -5,
        marginTop: 5,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    desc: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#6B7280',

    },

    price: {
        position: 'absolute',
        right: 16,
        top: 16,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold
    },

    /*FOOTER CSS  */

    footer: {
        marginTop: 20,

        // position: 'absolute',
        // bottom: 0,
        // width: '100%',
        // padding: 16,
        // backgroundColor: '#fff',
    },

    btn: {
        backgroundColor: Colors.primaryColor,
        padding: 20,
        flexDirection: 'row',
        // gap: 5,
        justifyContent: 'center',
        borderRadius: 24,
        alignItems: 'center',
    },


    btnText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    termsContainer: {
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },

    termText: {
        fontSize: 12,
        color: Colors.subTextColor,
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
    },

    highlightText: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /*  MENTOR HEADER */


    mentorcontainer: {
        backgroundColor: '#F7FAF9',
        borderRadius: 16,
        padding: 20,
        // borderColor: '#E5E7EB',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    imageBadge: {
        position: 'absolute',
        right: 5,
        bottom: -5,
        width: 30,
        height: 30,
    },

    image: {
        width: 100,
        height: 100,
        backgroundColor: Colors.BGIcon,
        borderRadius: 28,
        marginRight: 12,
    },

    name: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
        marginBottom: -4,

    },

    role: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#6B7280',

    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 3,
    },

    stars: {
        color: '#F59E0B',
        fontSize: 18,
        marginRight: 6,
    },

    ratingText: {
        fontSize: 12,
        color: '#3E4946',
        marginTop: 3,
        fontFamily: Fonts.PoppinsMedium,
    },
});