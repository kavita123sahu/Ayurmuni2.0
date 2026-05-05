import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import Header from "../../components/Header";
import { Images } from "../../common/Images";
import { Fonts } from "../../common/Fonts";
import { Colors } from "../../common/Colors";
import ReviewSection from "../../components/ReviewSecton";
import { reviews } from "../../common/DataInterface";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const sessions = [
    {
        id: 1,
        title: "Sun Salutation",
        time: "Mon, 08:00 AM",
    },
    {
        id: 2,
        title: "Vinyasa Flow",
        time: "Wed, 05:30 PM",
    },
    {
        id: 3,
        title: "Deep Breathwork",
        time: "Fri, 07:00 AM",
    },
]

const MentorProfile = (props: any) => {

    const [activeId, setActiveId] = useState(sessions[0]?.id);


    const ProfileSection = () => (
        <View style={styles.content}>
            <Text style={styles.name}>Elena Vance</Text>
            <Text style={styles.role}>Vinyasa Specialist</Text>

            {/* Chips */}
            <View style={styles.chipsRow}>
                {["Vinyasa", "Hatha", "Breathwork"].map((item) => (
                    <View key={item} style={styles.chip}>
                        <Text style={styles.chipText}>{item}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>4.9</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <Text style={styles.statValue}>12+</Text>
                    <Text style={styles.statLabel}>Years EXP.</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <Text style={styles.statValue}>1.2k</Text>
                    <Text style={styles.statLabel}>Students</Text>
                </View>
            </View>

            <Text style={styles.desc}>
                "Yoga is not just a practice; it’s a dialogue between your body and your spirit."
                Elena focuses on fluid motion and deep rhythmic breathing to unlock mental clarity and physical vitality.
            </Text>
        </View>

    )

    const SectionExp = () => (
        <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
                Philosophy & Experience
            </Text>

            <Text style={styles.sectionDesc}>
                With over a decade of teaching across Asia and Europe, Elena Vance integrates traditional Hatha principles with contemporary Vinyasa flows. Her methodology centers on "Intelligent Sequencing," ensuring each transition serves a physiological purpose while maintaining the meditative quality of the practice.
            </Text>

            {/* Bottom Cards */}
            <View style={styles.infoRow}>

                {/* Card 1 */}
                <View style={styles.infoCard}>
                    <View style={styles.iconBox}>
                        <Text style={{ fontSize: 18 }}>🎓</Text>
                    </View>

                    <Text style={styles.infoTitle}>RYT 500 Certified</Text>
                    <Text style={styles.infoSub}>
                        Yoga Alliance International
                    </Text>
                </View>

                {/* Card 2 */}
                <View style={styles.infoCard}>
                    <View style={styles.iconBox}>
                        <Text style={{ fontSize: 18 }}>🌿</Text>
                    </View>

                    <Text style={styles.infoTitle}>Holistic Health</Text>
                    <Text style={styles.infoSub}>
                        Integrated Wellness Coach
                    </Text>
                </View>

            </View>
        </View>
    );

    const SectionSessions = ({ data }: any) => (

        <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>Next Sessions</Text>

            {data.map((item: any) => {
                const isActive = item.id === activeId;

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.sessionItem,
                            isActive && styles.activeSession, // 🔥 dynamic bg
                        ]}
                        onPress={() => setActiveId(item.id)} // 🔥 change active
                    >
                        <View>
                            <Text style={styles.sessionName}>{item.title}</Text>
                            <Text style={styles.sessionTime}>{item.time}</Text>
                        </View>

                        <Text style={isActive ? styles.arrowActive : styles.arrow}>
                            ›
                        </Text>
                    </TouchableOpacity>
                );
            })}

            {/* Button */}
            <TouchableOpacity style={styles.viewBtn} onPress={() => props.navigation.navigate('YogaScreen')}>
                <Text style={styles.viewText}>View Schedule</Text>
            </TouchableOpacity>
        </View>
    )


    return (
        <SafeAreaView style={styles.card}>

            <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

            <Header
                title="Mentor Profile"
                subtitle="Find best doctor"
                backIcon={Images.backIcon}
                onBack={() => { props.navigation.goBack() }}
            />

            <SafeAreaView style={{ flex: 1, backgroundColor : '' }}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 40 }}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={Images.MentorImage}
                            style={styles.image}
                        />

                        <View style={styles.badge}>
                            <Image source={Images.approved} style={{ height: 14, width: 14, tintColor: "#0B6B57", marginRight: 4 }} />
                            <Text style={styles.badgeText}> Expert Mentor</Text>
                        </View>
                    </View>

                    <ProfileSection />

                    <SectionExp />

                    <SectionSessions data={sessions} />

                    <ReviewSection navigation={props.navigation} reviews={reviews} />

                </ScrollView>
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default MentorProfile;

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        backgroundColor: "#FDFDFB",
        overflow: "hidden",
        paddingBottom: 90,
        flex: 1,
        paddingHorizontal: 20,
    },

    imageWrapper: {
        position: "relative",
        marginTop: 20
    },

    image: {
        width: "100%",
        height: width * 1.1, // 🔥 same tall image look
        borderRadius: 24
    },

    badge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        backgroundColor: "#ffff",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },

    badgeText: {
        fontSize: 10,
        color: "#0B6B57",
        fontFamily: Fonts.PoppinsMedium,
    },

    content: {
        // flex: 1,
        marginTop: 20,
        marginHorizontal: 4,

    },

    name: {
        fontSize: 30,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.black,
        marginBottom: -10,
    },

    role: {
        fontSize: 16,
        color: "#0B6B57",

        fontFamily: Fonts.PoppinsSemiBold
    },

    chipsRow: {
        flexDirection: "row",
        marginTop: 20,
        gap: 8,
    },

    chip: {
        backgroundColor: "#94A3B833",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 6,
    },

    chipText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: "#475569",
    },

    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        gap: 16, // 🔥 space between items
    },

    stat: {

        alignItems: "flex-start", // 👈 LEFT ALIGN
    },

    statValue: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.black,
    },

    statLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontFamily: Fonts.PoppinsMedium,
        marginTop: -5,
    },

    divider: {
        width: 1,
        height: 28,
        backgroundColor: "#E5E7EB",
        marginHorizontal: 16, // 🔥 spacing between items
    },
    desc: {
        marginTop: 14,
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 16,
        color: Colors.subTextColor,
        lineHeight: 25,
        // letterSpacing:18
    },

    sectionCard: {
        backgroundColor: "#F1F4F3",
        gap: 20,
        marginTop: 16,
        paddingBottom: 30,
        borderRadius: 20,
        padding: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111",
        marginBottom: 10,
    },

    sectionDesc: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: "#3E4946",
        lineHeight: 22,
        letterSpacing: 0.5,
    },

    infoRow: {
        flexDirection: "row",
        marginTop: 20,
        gap: 12, // 🔥 spacing between cards
    },

    infoCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
    },

    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#E6F2EF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    infoTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111",
    },

    infoSub: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: "#64748B",

    },

    sessionCard: {
        backgroundColor: "#fff",
        // marginHorizontal: 20,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        marginTop: 16,
        borderRadius: 20,
        padding: 16,
    },

    sessionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111",
        marginBottom: 14,
    },

    /* ACTIVE ITEM */
    activeSession: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#0D614E0D",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#0D614E1A",
        marginBottom: 10,
    },

    /* NORMAL ITEM */
    sessionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        paddingVertical: 12,
    },

    sessionName: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111",
        marginBottom: -4
    },

    sessionTime: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: "#64748B",

    },

    arrowActive: {
        fontSize: 22,
        color: "#0B6B57",
        fontFamily: Fonts.PoppinsSemiBold,
    },

    arrow: {
        fontSize: 22,
        color: "#9CA3AF",
    },

    /* BUTTON */
    viewBtn: {
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: "#0B6B57",
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: "center",
    },

    viewText: {
        color: "#0B6B57",
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },
});