import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import SectionHeader from '../../components/SectionHeader';
import { AppText, PatientDetails } from './DoctorSlip';
import { Ionicons } from '../../common/Vector';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#0D614E',
    secondary: '#6B7280',
    background: '#F6F8F7',
    white: '#FFFFFF',
    border: '#E5E7EB',
    greenBg: '#E8F7EF',
    green: Colors.primaryColor,
    blueBg: '#EEF4FF',
    blue: '#3B82F6',
    text: '#111827',
    lightText: '#94A3B8',
};

const Fonts = {
    semiBold: 'Poppins-SemiBold',
    medium: 'Poppins-Medium',
    regular: 'Poppins-Regular',
};

const consultationData = [
    {
        id: '1',
        date: 'Oct 24, 2024',
        isCurrent: true,
        progress: '80%',
        title: 'Consultation #4',
        desc: `"Notices in maintaining sleep and Triphala. Current regimen balanced better Triphala + Ashwagandha."`,
        type: 'green',
    },
    {
        id: '2',
        date: 'Sep 24, 2024',
        progress: '40%',
        isCurrent: false,
        title: 'Consultation #5',
        desc: `Refined regimen to include Ashwagandha for sleep. Triphala dosage continued. Reported better sleep, less nausea.`,
        type: 'blue',
    },
    {
        id: '3',
        date: 'Aug 12, 2024',
        progress: '15%',
        isCurrent: false,
        title: 'Consultation #6',
        desc: `Initial consult for acute stomach pain and insomnia. Recommended full dietary overhaul and start Triphala.`,
        type: 'gray',
    },
];



const MultipleDoctorSlip = ({
    consultation,
    navigation,
}: any) => {

    const regimenData =
        consultation?.consultations?.flatMap(
            (item: any) =>
                item?.prescription?.items || []
        ) || [];
    console.log("consultation----?", navigation, consultation);

    const renderConsultationCard = (item: any) => {
        const isGreen = item.type === 'green';
        const isBlue = item.type === 'blue';

        return (
            <View style={styles.consultationCard}>
                <View style={styles.consultationTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.consultDate}>{item.date}</Text>

                        <Text style={styles.consultTitle}>
                            {item.title}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.progressBox,
                            {
                                backgroundColor: isGreen
                                    ? COLORS.greenBg
                                    : isBlue
                                        ? COLORS.blueBg
                                        : '#F3F4F6',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.progressText,
                                {
                                    color: isGreen
                                        ? COLORS.green
                                        : isBlue
                                            ? COLORS.blue
                                            : '#9CA3AF',
                                },
                            ]}
                        >
                            {item.progress}
                        </Text>

                        <Text
                            style={[
                                styles.improvementText,
                                {
                                    color: isGreen
                                        ? COLORS.green
                                        : isBlue
                                            ? COLORS.blue
                                            : '#9CA3AF',
                                },
                            ]}
                        >
                            Improvement
                        </Text>
                    </View>
                </View>

                <Text style={styles.consultDesc}>
                    {item.desc}
                </Text>
            </View>
        );
    };

    const renderRegimenCard = (item: any) => {
        console.log("itemmmmmmmmmm", item);
        return (
            <View style={styles.medicineCard}>
                <View style={styles.medicineTopRow}>
                    <View style={styles.medicineLeft}>
                        <View style={styles.iconWrapper}>
                            <Image source={{ uri: item?.medicine_image }} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                            <Ionicons
                                name={Images.Medicines}
                                size={18}
                                color={Colors.primaryColor}
                            />
                        </View>

                        <View style={styles.medicineInfo}>
                            <AppText
                                text={item?.medicine_name}
                                style={styles.medicineName}
                            />

                            <AppText
                                text={item?.instruction}
                                style={styles.medicineDesc}
                            />
                        </View>
                    </View>

                    <View style={styles.timeWrapper}>
                        <AppText
                            text={item?.frequency}
                            style={styles.timeText}
                        />
                        <AppText
                            text={item?.dosage}
                            style={styles.timeText}
                        />
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <AppText
                        text={item?.duration}
                        style={styles.daysText}
                    />
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle={'dark-content'} backgroundColor={'#F9FAFB'} />

            <Header
                title="Doctor Slip"
                subtitle="Find best advice for your health"
                backIcon={Images.backIcon}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                <PatientDetails data={consultation?.consultations} doctor={consultation?.doctor} />

                <View style={styles.successCard}>
                    <Text style={styles.successTitle}>
                        JOURNEY PROGRESSION
                    </Text>

                    <Text style={styles.successText}>
                        3 of 6 Months Completed. 50%
                        through phase 1 treatment.
                    </Text>

                    <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                    </View>
                </View>

                {/* CONSULTATION */}

                <SectionHeader title='Consultation History' actionText='View All' />


                <View style={styles.timelineWrapper}>

                    <View style={styles.trackLine} />

                    {consultationData.map((item, index) => (
                        <View key={index} style={styles.timelineItem}>

                            <View style={[styles.dot, item.isCurrent && styles.dotActive]} />

                            {renderConsultationCard(item)}

                        </View>
                    ))}
                </View>


                {/* REGIMEN */}
                <SectionHeader title='Current Stitched Regimen' />

                {regimenData?.map((item: any) =>
                    renderRegimenCard(item),
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MultipleDoctorSlip;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#F9FAFB',
    },

    scrollContent: {
        paddingBottom: 40,
    },

    /* HEADER */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 22,
    },

    backBtn: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backText: {
        fontSize: 24,
        color: COLORS.text,
    },

    headerTitle: {
        fontSize: 18,
        color: COLORS.text,
        fontFamily: Fonts.semiBold,
    },

    headerSub: {
        fontSize: 11,
        color: COLORS.lightText,
        fontFamily: Fonts.medium,
    },

    /* CARD */


    subText: {
        fontSize: 12,
        color: COLORS.secondary,
        fontFamily: Fonts.medium,
    },

    valueText: {
        fontSize: 13,
        color: COLORS.text,
        fontFamily: Fonts.semiBold,
    },

    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },

    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 18,
    },

    infoItem: {
        width: '50%',
        paddingRight: 10,
    },

    infoValue: {
        fontSize: 13,
        color: COLORS.text,
        fontFamily: Fonts.semiBold,
    },

    /* SUCCESS */

    successCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    successTitle: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: Fonts.semiBold,
    },

    successText: {

        fontSize: 13,
        lineHeight: 21,
        color: Colors.primaryColor,
        fontFamily: Fonts.medium,
    },

    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 16,
        overflow: 'hidden',
    },

    progressFill: {
        width: '50%',
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
    },


    timelineWrapper: {
        position: 'relative',
        paddingLeft: 28,
    },

    trackLine: {
        position: 'absolute',
        left: 7,
        top: 10,
        bottom: 10,
        width: 1.5,
        borderStyle: 'dashed',
        borderLeftWidth: 1.5,
        borderColor: COLORS.border,   // ya jo bhi tera border color hai
    },

    timelineItem: {
        position: 'relative',
        marginBottom: 14,
    },

    dot: {
        position: 'absolute',
        left: -28,
        top: 16,
        width: 15,
        height: 15,
        borderRadius: 12,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: '#D1D5DB',
        zIndex: 1,
    },

    dotActive: {
        backgroundColor: Colors.primaryColor,   // tera green color
        borderColor: Colors.secondaryColor,
    },
    //Medcine*/

    listGap: {
        paddingTop: 6,
    },

    medicineCard: {
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#94A3B833',
        padding: 15,
    },

    medicineTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    medicineLeft: {
        flex: 1,
        flexDirection: 'row',
        paddingRight: 10,
    },

    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0051470D',
        marginRight: 12,
    },

    medicineInfo: {
        flex: 1,
    },

    medicineName: {
        fontSize: 15,
        lineHeight: 24,
        color: '#0F172A',
        fontFamily: Fonts.semiBold,
    },

    medicineDesc: {
        marginTop: 2,
        fontSize: 13,
        lineHeight: 22,
        color: '#64748B',
        fontFamily: Fonts.medium,
    },

    timeWrapper: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFBA2033',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    timeText: {
        fontSize: 10,
        color: '#5E4200',
        fontFamily: Fonts.semiBold,
    },

    bottomRow: {
        alignItems: 'flex-end',
        marginTop: 12,
    },

    daysText: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.medium,
    },


    /* SECTION */

    sectionRow: {
        marginTop: 26,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    sectionTitle: {
        fontSize: 17,
        color: COLORS.text,
        fontFamily: Fonts.semiBold,
        marginTop: 26,
        marginBottom: 14,
    },

    viewAll: {
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: Fonts.semiBold,
    },

    /* CONSULTATION */

    consultationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    consultationTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },

    consultDate: {
        fontSize: 12,
        // backgroundColor: '#0D614E1A',
        // paddingHorizontal
        //     : 8,
        // borderRadius: 6,
        color: COLORS.secondary,
        fontFamily: Fonts.medium,
    },

    consultTitle: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily: Fonts.semiBold,
        marginTop: 4,
    },

    progressBox: {
        minWidth: 74,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
    },

    progressText: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
    },

    improvementText: {
        fontSize: 10,
        fontFamily: Fonts.medium,
        marginTop: 2,
    },

    consultDesc: {
        marginTop: 14,
        fontSize: 13,
        lineHeight: 22,
        color: COLORS.secondary,
        fontFamily: Fonts.regular,
    },

    /* REGIMEN */

    regimenCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
    },

    regimenIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#EAF8F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    regimenContent: {
        flex: 1,
        minWidth: 0,
    },

    regimenTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    regimenName: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        fontFamily: Fonts.semiBold,
    },

    doseBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },

    doseText: {
        fontSize: 10,
        color: '#B45309',
        fontFamily: Fonts.semiBold,
    },

    regimenDesc: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 21,
        color: COLORS.secondary,
        fontFamily: Fonts.medium,
    },
});