import { FlatList, Image, StatusBar, StyleSheet, Text, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { Images } from "../../common/Images";
import SessionCard from '../../components/SessionCard'
import React from "react";
import { Colors } from "../../common/Colors";
import { Fonts } from "../../common/Fonts";
import MentorCard from "../../components/MentorCard";
import { SafeAreaView } from "react-native-safe-area-context";

export default function YogaSession(props: any) {


    const [activeIndex, setActiveIndex] = React.useState(0);

    const data = [
        { id: '1', title: 'Sun Salutation B', time: '15:00', isActive: true },
        { id: '2', title: 'Warrior I Variation', time: '22:15', isActive: false },
        { id: '3', title: 'Downward Facing Dog', time: '28:40', isActive: false },
        { id: '4', title: 'Triangle Pose (Trikonasana)', time: '34:10', isActive: false },
        { id: '5', title: 'Deep Savasana Recovery', time: '40:00', isActive: false },
    ];

    const Header = React.memo(() => {
        return (
            <View style={{ flex: 1, }}>


                <View style={styles.videoContainer}>
                    <Image
                        source={Images.VideoPlayer}
                        style={styles.video}
                    />
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    <View style={[styles.badge, { backgroundColor: '#0D614E1A' }]}>
                        <Text style={[styles.text, { color: Colors.primaryColor }]}>
                            ADVANCED
                        </Text>
                    </View>

                    <View style={[styles.badge, { backgroundColor: Colors.bgcolor }]}>
                        <Text style={[styles.text, { color: Colors.subTextColor }]}>
                            45 MIN
                        </Text>
                    </View>
                </View>

                <Text style={styles.Header}>Morning Vitality Flow</Text>

                <Text style={styles.SubHeader}>
                    A rigorous sequence designed to awaken
                    your cellular energy, focus the mind, and
                    prepare the body for peak performance.
                </Text>

                <View style={styles.textInput}>
                    <Image source={Images.Notes} style={{ height: 20, width: 20 }} />
                    <Text style={[styles.text, { marginLeft: 10, fontSize: 14, fontFamily: Fonts.PoppinsSemiBold }]}>
                        Notes
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 30, marginBottom: 20, alignItems: 'center' }}>
                    <Image source={Images.BreakDown} style={{ marginRight: 8, height: 18, width: 18 }} />
                    <Text style={styles.Section}>Session Breakdown</Text>
                </View>

            </View>
        );
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB', }}>
            


            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFFCC'} />


            <AppHeader
                title="Yoga Session"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
            />

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}

                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}

                ListHeaderComponent={<Header />}
                ListFooterComponent={<MentorCard
                    name="Guided by Master Elena"
                    subtitle="Clinical Yoga Specialist • 15 Years Experience"
                    description="Elena specializes in bio-mechanical alignment and mindful breathwork to optimize physical and mental resilience."
                    image={Images.MentorImage} // apni image
                    onPress={() => props.navigation.navigate('ConsultMentor')}
                />}
                renderItem={({ item, index }) => (
                    <SessionCard
                        index={index + 1}
                        title={item.title}
                        time={item.time}
                        isActive={index === activeIndex}
                        onPress={() => setActiveIndex(index)}
                    />
                )}
            />




        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Header: { fontSize: 20, color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold, }, badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginRight: 8, padding: 10, }, text: { fontSize: 12, color: Colors.primaryColor, fontFamily: Fonts.PoppinsMedium, }, Section: { fontSize: 18, marginLeft: 5, textAlign: 'center', color: '#0F172A', fontFamily: Fonts.PoppinsSemiBold }, videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,   // 👈 responsive height auto
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 16,
    },
    video: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    textInput: { backgroundColor: "#ffff", marginTop: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 12, borderColor: Colors.borderColor, }, SubHeader: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: '#64748B' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 16,

        marginBottom: 14,
    },

    activeCard: {
        backgroundColor: '#E6F7F1', // softer green (fix)
        borderWidth: 1,
        borderColor: '#B6E3D4',
    },

    inactiveCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EEF1F4',
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    // 🔥 ICON FIX (size + spacing corrected)
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    icon: {
        fontSize: 18,
        color: '#fff',
    },

    // 🔥 INDEX FIX (alignment + weight)
    index: {
        width: 36,
        fontSize: 14,
        color: '#A0A7B0',
        marginRight: 6,
        fontWeight: '500',
    },

    textContainer: {
        flex: 1,
    },

    // 🔥 LABEL FIX (tight + small)
    activeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.primaryColor,
        marginBottom: 4,
        letterSpacing: 0.5,
    },

    // 🔥 TITLE FIX (main issue yahi tha)
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1F23',
    },

    activeTitle: {
        color: '#0F3D2E',
    },

    // 🔥 TIME FIX (alignment + weight)
    time: {
        fontSize: 15,
        fontWeight: '500',
        color: '#8A9199',
    },

    activeTime: {
        color: Colors.primaryColor,
        fontWeight: '700',
    },
});