import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#0D614E',
    secondary: '#64748B',
    background: '#F5F7F6',
    white: '#FFFFFF',
    border: '#E5E7EB',
    text: '#0F172A',
    success: '#10B981',
    successBg: '#E8F7EF',
    lightGray: '#F3F4F6',
};

const Fonts = {
    semiBold: 'Poppins-SemiBold',
    medium: 'Poppins-Medium',
    regular: 'Poppins-Regular',
};

const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) return;

    Linking.openURL(`tel:${phoneNumber}`).catch(err =>
        console.log('Call Error:', err),
    );
};

const PrescriptionDetail = (props: any) => {

    const insets = useSafeAreaInsets();
    const { PrisData, doctorData } = props.route.params;

    console.log("PrisDataPrisData", props)
    return (
        <SafeAreaView style={styles.container}>
            <AppHeader title='Prescription History' leftIconName='arrow-left' onLeftPress={() => props.navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100
                }}
            >
                <View style={styles.card}>
                    {/* PATIENT INFO */}

                    <View style={styles.patientRow}>
                        {/* <Image
                            source={{
                                uri: 'https://i.pravatar.cc/150?img=32',
                            }}
                            style={styles.avatar}
                        /> */}
                        <View style={styles.initialAvatar}>
                            <Text style={styles.initialText}>
                                {PrisData?.patient?.patient_name?.charAt(0)?.toUpperCase() || ''}
                            </Text>
                        </View>
                        <View style={styles.patientContent}>
                            <Text
                                numberOfLines={1}
                                style={styles.patientName}
                            >
                                {PrisData?.patient?.patient_name ?? ''}
                            </Text>

                            <Text
                                style={styles.patientSubText}
                            >
                                Gender : {PrisData?.patient?.gender ?? ''}
                            </Text>

                            <Text
                                style={styles.patientSubText}
                            >
                                Age : {PrisData?.patient?.age ?? ''}
                            </Text>
                        </View>
                    </View>

                    {/* MEDICATION */}

                    <Text style={styles.sectionTitle}>
                        Primary Medications
                    </Text>

                    {PrisData?.prescription?.items?.map((medicine: any) => (
                        <View key={medicine.id}>
                            <View style={styles.separator} />

                            {/* Medicine */}
                            <View>
                                <Text style={styles.medicineName}>
                                    {medicine?.medicine_name}
                                </Text>

                                <Text style={styles.medicineDesc}>
                                    {medicine?.instruction || 'No instruction available'}
                                </Text>
                            </View>

                            {/* Schedule */}
                            <View style={styles.scheduleCard}>
                                <Text style={styles.scheduleTitle}>
                                    Treatment Schedule
                                </Text>

                                <View style={styles.scheduleRow}>
                                    <View style={styles.scheduleItem}>
                                        <Text style={styles.scheduleIcon}>🕒</Text>

                                        <Text style={styles.scheduleText}>
                                            {medicine?.dosage || '-'} times • {medicine?.frequency || '-'} daily
                                        </Text>
                                    </View>

                                    <View style={styles.scheduleItem}>
                                        <Text style={styles.scheduleIcon}>📅</Text>

                                        <Text style={styles.scheduleText}>
                                            {medicine?.duration || '-'}Days course
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* INSTRUCTIONS */}

                    <Text style={styles.sectionTitle}>
                        Patient Instructions
                    </Text>

                    <View style={styles.separator} />

                    <View style={styles.instructionItem}>
                        <View
                            style={styles.bulletCircle}
                        />

                        <Text
                            style={styles.instructionText}
                        >
                            {PrisData?.prescription?.diagnosis_advice}
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View
                            style={styles.bulletCircle}
                        />

                        <Text
                            style={styles.instructionText}
                        >
                            {PrisData?.prescription?.history_of_past_illness}
                        </Text>
                    </View>

                    {/* SUCCESS BOX */}

                    <View style={styles.successCard}>
                        <View
                            style={styles.successTop}
                        >
                            <Text
                                style={styles.successIcon}
                            >
                                ✓
                            </Text>

                            <Text
                                style={styles.successTitle}
                            >
                                CLINICAL ADVISORY
                            </Text>
                        </View>

                        <Text
                            style={styles.successDesc}
                        >
                            {PrisData?.prescription?.clinical_notes}
                        </Text>
                    </View>

                    {/* DOCTOR */}

                    <Text style={styles.sectionTitle}>
                        Prescribing Physician
                    </Text>

                    <View style={styles.separator} />

                    <View style={styles.doctorRow}>
                        <Image
                            source={{
                                uri: doctorData?.doctor_image,
                            }}
                            style={styles.doctorImage}
                        />

                        <View style={{ flex: 1 }}>
                            <Text
                                numberOfLines={1}
                                style={styles.doctorName}
                            >
                                {doctorData?.doctor_name ?? ''}
                            </Text>

                            <Text
                                style={styles.doctorSpeciality}
                            >
                                {doctorData?.doctor_specialization ?? ''}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.doctorInfo}>
                        <Text style={styles.infoText}>
                            📍 {doctorData?.city} {doctorData?.state}
                        </Text>

                        <Text style={styles.infoText}>
                            📞 {doctorData?.registration_number}
                        </Text>

                        <Text style={styles.infoText}>
                            ✉ {doctorData?.email}
                        </Text>
                    </View>

                    {/* PRESCRIPTION STATUS */}

                    <Text style={styles.sectionTitle}>
                        Prescription Status
                    </Text>

                    <View style={styles.separator} />

                    {/* <View style={styles.statusRow}>
                        <View
                            style={styles.activeBadge}
                        >
                            <View
                                style={styles.activeDot}
                            />

                            <Text
                                style={styles.activeText}
                            >
                                Active Course
                            </Text>
                        </View>

                        <Text style={styles.dateInfo}>
                            Started Oct 12 •
                            Completes Oct 19
                        </Text>
                    </View> */}

                    {/* HELP CARD */}

                    <View style={styles.helpCard}>
                        <Text style={styles.helpTitle}>
                            Need Assistance?
                        </Text>

                        <Text style={styles.helpDesc}>
                            If you experience severe
                            reactions, dizziness, or
                            allergic reactions,
                            contact our 24/7 nursing
                            line immediately.
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleCall(doctorData?.registration_number ?? '')}
                            style={styles.contactBtn}
                        >
                            <Text style={styles.contactText}>
                                Contact Now
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* FOOTER */}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            © 2025 MediSystems •
                            HIPAA Compliant Secure
                            Portal
                        </Text>

                        <Text style={styles.footerLink}>
                            Privacy Policy • Download
                            PDF
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* BOTTOM BUTTONS */}

            <View style={[styles.bottomContainer, {

                paddingBottom: Math.max(insets.bottom, 16)
            }
            ]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.shareBtn}
                >
                    <Text style={styles.shareText}>
                        ↗ Share Record
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.orderBtn}
                >
                    <Text style={styles.orderText}>
                        Order Refill
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PrescriptionDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            COLORS.background,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },

    /* HEADER */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
        marginTop: 10,
        marginBottom: 20,
    },

    backBtn: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor:
            COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backText: {
        fontSize: 24,
        color: COLORS.text,
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        color: COLORS.text,
        fontFamily:
            Fonts.semiBold,
        paddingHorizontal: 10,
    },

    emptyView: {
        width: 34,
    },

    /* MAIN CARD */

    card: {
        backgroundColor:
            COLORS.white,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor:
            COLORS.border,
    },

    /* PATIENT */

    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF3F1',
        borderRadius: 18,
        padding: 14,
    },

    avatar: {
        width: width * 0.16,
        height: width * 0.16,
        minWidth: 58,
        minHeight: 58,
        maxWidth: 64,
        maxHeight: 64,
        borderRadius: 18,
        marginRight: 14,
    },
    initialAvatar: {
        width: 70,
        height: 70,
        marginRight:10,
        borderRadius: 20,
        backgroundColor: '#0D614E',
        justifyContent: 'center',
        alignItems: 'center',
    },

    initialText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    patientContent: {
        flex: 1,
        minWidth: 0,
    },

    patientName: {
        fontSize: 16,
        color: COLORS.text,
        fontFamily:
            Fonts.semiBold,
    },

    patientSubText: {
        marginTop: 2,
        fontSize: 12,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.medium,
    },

    /* SECTION */

    sectionTitle: {
        marginTop: 24,
        fontSize: 15,
        color: COLORS.text,
        fontFamily:
            Fonts.semiBold,
    },

    separator: {
        height: 1,
        backgroundColor:
            COLORS.border,
        marginVertical: 12,
    },

    /* MEDICINE */

    medicineName: {
        fontSize: 16,
        color: COLORS.primary,
        fontFamily:
            Fonts.semiBold,
    },

    medicineDesc: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 20,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.regular,
    },

    /* SCHEDULE */

    scheduleCard: {
        backgroundColor:
            COLORS.lightGray,
        borderRadius: 18,
        padding: 14,
        marginTop: 18,
    },

    scheduleTitle: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily:
            Fonts.semiBold,
        marginBottom: 12,
    },

    scheduleRow: {
        gap: 12,
    },

    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    scheduleIcon: {
        fontSize: 16,
        marginRight: 10,
    },

    scheduleText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.medium,
    },

    /* INSTRUCTIONS */

    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },

    bulletCircle: {
        width: 8,
        height: 8,
        borderRadius: 20,
        backgroundColor:
            COLORS.primary,
        marginTop: 7,
        marginRight: 10,
    },

    instructionText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 22,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.medium,
    },

    /* SUCCESS */

    successCard: {
        backgroundColor:
            COLORS.primary,
        borderRadius: 20,
        padding: 16,
        marginTop: 18,
    },

    successTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    successIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        marginRight: 8,
    },

    successTitle: {
        fontSize: 13,
        color: '#FFFFFF',
        fontFamily:
            Fonts.semiBold,
    },

    successDesc: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 22,
        color: '#E2E8F0',
        fontFamily:
            Fonts.regular,
    },

    /* DOCTOR */

    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    doctorImage: {
        width: 52,
        height: 52,
        borderRadius: 16,
        marginRight: 12,
    },

    doctorName: {
        fontSize: 15,
        color: COLORS.text,
        fontFamily:
            Fonts.semiBold,
    },

    doctorSpeciality: {
        marginTop: 3,
        fontSize: 12,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.medium,
    },

    doctorInfo: {
        marginTop: 16,
        gap: 10,
    },

    infoText: {
        fontSize: 13,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.medium,
    },

    /* STATUS */

    statusRow: {
        gap: 12,
    },

    activeBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:
            COLORS.successBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },

    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 20,
        backgroundColor:
            COLORS.success,
        marginRight: 8,
    },

    activeText: {
        fontSize: 12,
        color:
            COLORS.success,
        fontFamily:
            Fonts.semiBold,
    },

    dateInfo: {
        fontSize: 12,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.medium,
    },

    /* HELP */

    helpCard: {
        marginTop: 22,
        backgroundColor:
            COLORS.primary,
        borderRadius: 22,
        padding: 18,
    },

    helpTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily:
            Fonts.semiBold,
    },

    helpDesc: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 22,
        color: '#DCE7E4',
        fontFamily:
            Fonts.regular,
    },

    contactBtn: {
        marginTop: 18,
        backgroundColor:
            COLORS.white,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    contactText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily:
            Fonts.semiBold,
    },

    /* FOOTER */

    footer: {
        marginTop: 28,
        alignItems: 'center',
    },

    footerText: {
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 18,
        color: '#94A3B8',
        fontFamily:
            Fonts.regular,
    },

    footerLink: {
        marginTop: 6,
        textAlign: 'center',
        fontSize: 11,
        lineHeight: 18,
        color: COLORS.primary,
        fontFamily:
            Fonts.medium,
    },

    /* BOTTOM */

    bottomContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0, // ❌ 20 mat rakho

        flexDirection: 'row',

        backgroundColor: COLORS.white,

        paddingHorizontal: 16,
        paddingTop: 14,

        borderTopWidth: 1,
        borderTopColor: COLORS.border,

        elevation: 8,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },

    shareBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor:
            COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    shareText: {
        fontSize: 13,
        color:
            COLORS.secondary,
        fontFamily:
            Fonts.semiBold,
    },

    orderBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor:
            COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    orderText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily:
            Fonts.semiBold,
    },
});