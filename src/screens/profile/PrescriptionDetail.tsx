import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';

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

const PrescriptionDetail = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.backBtn}
                    >
                        <Text style={styles.backText}>
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        Prescription History
                    </Text>

                    <View style={styles.emptyView} />
                </View>

                {/* MAIN CARD */}

                <View style={styles.card}>
                    {/* PATIENT INFO */}

                    <View style={styles.patientRow}>
                        <Image
                            source={{
                                uri: 'https://i.pravatar.cc/150?img=32',
                            }}
                            style={styles.avatar}
                        />

                        <View style={styles.patientContent}>
                            <Text
                                numberOfLines={1}
                                style={styles.patientName}
                            >
                                Katherine Sterling
                            </Text>

                            <Text
                                style={styles.patientSubText}
                            >
                                Gastro Specialist
                            </Text>

                            <Text
                                style={styles.patientSubText}
                            >
                                Oct 12, 2025
                            </Text>
                        </View>
                    </View>

                    {/* MEDICATION */}

                    <Text style={styles.sectionTitle}>
                        Primary Medications
                    </Text>

                    <View style={styles.separator} />

                    <View>
                        <Text style={styles.medicineName}>
                            Amoxicillin 500mg
                        </Text>

                        <Text
                            style={styles.medicineDesc}
                        >
                            Broad-spectrum penicillin
                            antibiotic
                        </Text>
                    </View>

                    {/* SCHEDULE */}

                    <View style={styles.scheduleCard}>
                        <Text
                            style={styles.scheduleTitle}
                        >
                            Treatment Schedule
                        </Text>

                        <View
                            style={styles.scheduleRow}
                        >
                            <View style={styles.scheduleItem}>
                                <Text
                                    style={styles.scheduleIcon}
                                >
                                    🕒
                                </Text>

                                <Text
                                    style={styles.scheduleText}
                                >
                                    1 capsule, 3x daily
                                </Text>
                            </View>

                            <View
                                style={styles.scheduleItem}
                            >
                                <Text
                                    style={styles.scheduleIcon}
                                >
                                    📅
                                </Text>

                                <Text
                                    style={styles.scheduleText}
                                >
                                    7 Days course
                                </Text>
                            </View>
                        </View>
                    </View>

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
                            Take after food with
                            plenty of water.
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View
                            style={styles.bulletCircle}
                        />

                        <Text
                            style={styles.instructionText}
                        >
                            Finish the full course
                            even if symptoms improve.
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
                            Avoid alcohol during
                            treatment. Important:
                            if rash develops,
                            emergency services.
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
                                uri: 'https://i.pravatar.cc/150?img=12',
                            }}
                            style={styles.doctorImage}
                        />

                        <View style={{ flex: 1 }}>
                            <Text
                                numberOfLines={1}
                                style={styles.doctorName}
                            >
                                Dr. Emily Stone
                            </Text>

                            <Text
                                style={styles.doctorSpeciality}
                            >
                                General Practitioner
                            </Text>
                        </View>
                    </View>

                    <View style={styles.doctorInfo}>
                        <Text style={styles.infoText}>
                            📍 City General Hospital
                        </Text>

                        <Text style={styles.infoText}>
                            📞 +1 (555) 123-456
                        </Text>

                        <Text style={styles.infoText}>
                            ✉ support@hospital.med
                        </Text>
                    </View>

                    {/* PRESCRIPTION STATUS */}

                    <Text style={styles.sectionTitle}>
                        Prescription Status
                    </Text>

                    <View style={styles.separator} />

                    <View style={styles.statusRow}>
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
                    </View>

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
                            style={styles.contactBtn}
                        >
                            <Text
                                style={styles.contactText}
                            >
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

            <View style={styles.bottomContainer}>
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
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor:
            COLORS.white,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 24,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor:
            COLORS.border,
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