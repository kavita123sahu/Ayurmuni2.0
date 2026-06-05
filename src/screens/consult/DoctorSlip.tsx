import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    FlatList,
    Dimensions,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../components/Header';
import SectionHeader from '../../components/SectionHeader';

import { Feather, Ionicons } from '../../common/Vector';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface MedicineItem {
    id: number;
    icon: keyof typeof Ionicons.glyphMap;
    medicineName: string;
    timing: string;
    description: string;
    days: string;
}

interface GuidelineItemType {
    id: number;
    text: string;
}

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const MEDICINES: MedicineItem[] = [
    {
        id: 1,
        icon: 'medical',
        medicineName: 'Triphale Churna',
        timing: '2x Daily',
        description:
            'Reduce Triglyceride in blood vessels. Recommended digestive medication.',
        days: 'POST-MEAL',
    },

    {
        id: 2,
        icon: 'leaf',
        medicineName: 'Ashwagandha Tablets',
        timing: '2x Daily',
        description:
            'May reduce stress and improve overall wellness and quality.',
        days: 'BEFORE BED',
    },
];

const GUIDELINES: GuidelineItemType[] = [
    {
        id: 1,
        text: 'Aim for six meals daily.',
    },

    {
        id: 2,
        text: 'Avoid cold water. Consume only lukewarm water.',
    },

    {
        id: 3,
        text: 'Stay hydrated with a cup of warm water daily.',
    },
];

/* -------------------------------------------------------------------------- */
/*                              REUSABLE TEXT                                 */
/* -------------------------------------------------------------------------- */

const AppText = memo(
    ({
        text,
        style,
        numberOfLines,
    }: {
        text: string;
        style?: any;
        numberOfLines?: number;
    }) => {
        return (
            <Text
                allowFontScaling={false}
                numberOfLines={numberOfLines}
                style={style}>
                {text}
            </Text>
        );
    },
);

/* -------------------------------------------------------------------------- */
/*                              PATIENT DETAILS                               */
/* -------------------------------------------------------------------------- */

const InfoBlock = memo(
    ({
        label,
        value,
        subValue,
        alignRight,
    }: {
        label: string;
        value: string;
        subValue?: string;
        alignRight?: boolean;
    }) => {
        return (
            <View style={alignRight && styles.alignEnd}>
                <AppText text={label} style={styles.label} />

                <AppText
                    text={value}
                    style={[
                        styles.infoText,
                        label === 'PATIENT' && styles.patientName,
                    ]}
                />

                {!!subValue && (
                    <AppText text={subValue} style={styles.subText} />
                )}
            </View>
        );
    },
);

export const Divider = memo(() => {
    return <View style={styles.divider} />;
});

export const PatientDetails = memo(() => {
    return (
        <View style={styles.patientCard}>
            <View style={styles.rowBetween}>
                <InfoBlock
                    label="PATIENT"
                    value="Katherine Sterling"
                    subValue="ID: Sanctuary-882910"
                />

                <InfoBlock
                    label="DATE"
                    value="05.25.2024"
                    alignRight
                />
            </View>

            <Divider />

            <View style={styles.rowBetween}>
                <InfoBlock
                    label="PHYSICIAN"
                    value="Dr. Arjun R Nair"
                />

                <InfoBlock
                    label="REF NO."
                    value="891-977-43"
                    alignRight
                />
            </View>

            <Divider />

            <View style={styles.rowBetween}>
                <InfoBlock
                    label="Disease"
                    value="StreamOn Prim"
                />

                <InfoBlock
                    label="Follow-up date"
                    value="10-30 Days"
                    alignRight
                />
            </View>
        </View>
    );
});

/* -------------------------------------------------------------------------- */
/*                              MEDICINE CARD                                 */
/* -------------------------------------------------------------------------- */

export const MedicineCard = memo(
    ({
        icon,
        medicineName,
        timing,
        description,
        days,
    }: MedicineItem) => {
        return (
            <View style={styles.medicineCard}>
                <View style={styles.medicineTopRow}>
                    <View style={styles.medicineLeft}>
                        <View style={styles.iconWrapper}>
                            <Ionicons
                                name={icon}
                                size={18}
                                color={Colors.primaryColor}
                            />
                        </View>

                        <View style={styles.medicineInfo}>
                            <AppText
                                text={medicineName}
                                style={styles.medicineName}
                            />

                            <AppText
                                text={description}
                                style={styles.medicineDesc}
                            />
                        </View>
                    </View>

                    <View style={styles.timeWrapper}>
                        <AppText
                            text={timing}
                            style={styles.timeText}
                        />
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <AppText
                        text={days}
                        style={styles.daysText}
                    />
                </View>
            </View>
        );
    },
);

/* -------------------------------------------------------------------------- */
/*                              GUIDELINE ITEM                                */
/* -------------------------------------------------------------------------- */

const GuidelineItem = memo(
    ({
        index,
        text,
    }: {
        index: number;
        text: string;
    }) => {
        return (
            <View style={styles.guidelineRow}>
                <View style={styles.guidelineDot}>
                    <AppText
                        text={`${index + 1}`}
                        style={styles.guidelineNumber}
                    />
                </View>

                <AppText
                    text={text}
                    style={styles.guidelineText}
                />
            </View>
        );
    },
);

/* -------------------------------------------------------------------------- */
/*                               FOOTER BUTTON                                */
/* -------------------------------------------------------------------------- */

const FooterButton = memo(
    ({
        title,
        onPress,
        isPrimary,
        icon,
    }: {
        title: string;
        onPress?: () => void;
        isPrimary?: boolean;
        icon?: keyof typeof Ionicons.glyphMap;
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                style={[
                    styles.footerButton,
                    isPrimary && styles.primaryButton,
                ]}>

                {!!icon && (
                    <Feather
                        name={icon}
                        size={18}
                        color={isPrimary ? '#FFFFFF' : '#475569'}
                    />
                )}

                <AppText
                    text={title}
                    style={[
                        styles.footerButtonText,
                        isPrimary && styles.primaryButtonText,
                    ]}
                />
            </TouchableOpacity>
        );
    },
);

/* -------------------------------------------------------------------------- */
/*                                  SCREEN                                    */
/* -------------------------------------------------------------------------- */

const DoctorSlipScreen = ({ navigation }: any) => {

    const insets = useSafeAreaInsets();

    const renderMedicine = useCallback(
        ({ item }: { item: MedicineItem }) => {
            return <MedicineCard {...item} />;
        },
        [],
    );

    const renderGuideline = useCallback(
        ({
            item,
            index,
        }: {
            item: GuidelineItemType;
            index: number;
        }) => {
            return (
                <GuidelineItem
                    index={index}
                    text={item.text}
                />
            );
        },
        [],
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor="#FFFFFF"
                barStyle="dark-content"
            />

            <Header
                title="Doctor Slip"
                subtitle="Find best advice for your health"
                backIcon={Images.backIcon}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>

                {/* PATIENT DETAILS */}

                <PatientDetails />

                {/* NOTES */}

                <SectionHeader title="Doctor’s Notes" />

                <View style={styles.noteCard}>
                    <AppText
                        text={`"Focus on maintaining a consistent sleep schedule this week. The Triphala will aid detoxification while the Ashwagandha supports your nervous system through the quarterly transition. Avoid iced beverages and favor lukewarm water. If you experience mild lethargy in the first 48 hours, it's a normal part of the adjustment phase."`}
                        style={styles.noteText}
                    />

                    <Divider />

                    <View style={styles.signRow}>
                        <Image
                            source={Images.approved}
                            style={styles.signIcon}
                            resizeMode="contain"
                        />

                        <AppText
                            text="Digitally signed by Dr. Arjun R Nair"
                            style={styles.signText}
                        />
                    </View>
                </View>

                {/* MEDICINES */}

                <SectionHeader
                    title="Current Regimen"
                    actionText="VERIFIED PROTOCOL"
                />

                <FlatList
                    data={MEDICINES}
                    scrollEnabled={false}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderMedicine}
                    contentContainerStyle={styles.listGap}
                />

                {/* GUIDELINES */}

                <View style={styles.guidelineCard}>
                    <View style={styles.guidelineHeader}>
                        <Image
                            source={Images.notification}
                            style={styles.guidelineIcon}
                            resizeMode="contain"
                        />

                        <AppText
                            text="GUIDELINES FOR SUCCESS"
                            style={styles.guidelineTitle}
                        />
                    </View>

                    <FlatList
                        data={GUIDELINES}
                        scrollEnabled={false}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderGuideline}
                        ItemSeparatorComponent={() => (
                            <View style={styles.guidelineSpacing} />
                        )}
                    />
                </View>

                <Divider />

                {/* FOOTER */}

                <View style={styles.doctorFooter}>
                    <AppText
                        text="Dr. Arjun R Nair"
                        style={styles.footerDoctor}
                    />

                    <View style={styles.authenticatedRow}>
                        <Image
                            source={Images.approved}
                            style={styles.footerApprovedIcon}
                            resizeMode="contain"
                        />

                        <AppText
                            text="ELECTRONICALLY AUTHENTICATED"
                            style={styles.authenticatedText}
                        />
                    </View>

                    <AppText
                        text="The Clinical Sanctuary Holistic Center"
                        style={styles.footerSpeciality}
                    />

                    <AppText
                        text="1200 WELLNESS DRIVE, SUITE 400 • SANCTUARY HEALTH NETWORK"
                        style={styles.footerClinic}
                    />
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* BOTTOM ACTIONS */}

            <View style={[
                styles.footer,
                {
                    paddingBottom:
                        insets.bottom > 0
                            ? insets.bottom
                            : 18,
                },
            ]}>
                <FooterButton
                    title="PDF"
                    icon="download"
                />

                <FooterButton
                    title="Buy Now"
                    onPress={() => navigation.navigate('MultipleDoctorSlip')}
                    isPrimary
                />
            </View>
        </SafeAreaView>
    );
};

export default memo(DoctorSlipScreen);


/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },

    scrollContainer: {

        paddingTop: 10,
        paddingBottom: 120,
    },

    /* COMMON */

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 14,
    },

    alignEnd: {
        alignItems: 'flex-end',
    },

    divider: {
        height: 1,
        backgroundColor: '#BEC9C54D',
        marginVertical: 16,
    },

    label: {
        fontSize: 10,
        color: Colors.primaryColor,
        textTransform: 'uppercase',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    infoText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        maxWidth: width * 0.38,
    },

    subText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 18,
    },

    /* PATIENT */

    patientCard: {
        marginTop: 12,
        backgroundColor: '#00514708',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#0051470D',
        padding: 18,
    },

    patientName: {
        fontSize: 18,
        lineHeight: 28,
        maxWidth: width * 0.45,
    },

    /* NOTE */

    noteCard: {
        marginTop: 12,
        backgroundColor: '#FFDEA84D',
        borderRadius: 20,
        padding: 20,
    },

    noteText: {
        fontSize: 14,
        lineHeight: 24,
        color: '#5E4200',
        fontFamily: Fonts.PoppinsMedium,
    },

    signRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    signIcon: {
        height: 22,
        width: 22,
        tintColor: '#A16207',
    },

    signText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 12,
        lineHeight: 20,
        letterSpacing: 1,
        color: '#5E4200',
        textTransform: 'uppercase',
        fontFamily: Fonts.PoppinsMedium,
    },

    /* MEDICINE */

    listGap: {
        paddingTop: 6,
    },

    medicineCard: {
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#94A3B833',
        padding: 18,
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
        fontFamily: Fonts.PoppinsSemiBold,
    },

    medicineDesc: {
        marginTop: 2,
        fontSize: 13,
        lineHeight: 22,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
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
        fontFamily: Fonts.PoppinsSemiBold,
    },

    bottomRow: {
        alignItems: 'flex-end',
        marginTop: 12,
    },

    daysText: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    /* GUIDELINE */

    guidelineCard: {
        marginTop: 24,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#6E7976',
        backgroundColor: '#F1F4F3',
        padding: 18,
    },

    guidelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },

    guidelineIcon: {
        height: 20,
        width: 20,
        tintColor: Colors.primaryColor,
    },

    guidelineTitle: {
        flex: 1,
        fontSize: 14,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    guidelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    guidelineDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        marginTop: 2,
        marginRight: 12,
    },

    guidelineNumber: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    guidelineText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 22,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    guidelineSpacing: {
        height: 14,
    },

    /* FOOTER INFO */

    doctorFooter: {
        marginTop: 10,
        alignItems: 'center',
    },

    footerDoctor: {
        fontSize: 22,
        lineHeight: 34,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
    },

    authenticatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    footerApprovedIcon: {
        height: 16,
        width: 16,
        tintColor: Colors.primaryColor,
    },

    authenticatedText: {
        marginLeft: 6,
        fontSize: 11,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    footerSpeciality: {
        marginTop: 18,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    footerClinic: {
        marginTop: 4,
        textAlign: 'center',
        fontSize: 10,
        lineHeight: 18,
        color: '#64748B',
        textTransform: 'uppercase',
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ACTION FOOTER */

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        flexDirection: 'row',
        alignItems: 'center',

        gap: 12,

        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 22,

        backgroundColor: '#FFFFFF',

        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },

    footerButton: {
        height: 54,
        minWidth: 90,

        paddingHorizontal: 18,

        borderRadius: 16,
        backgroundColor: '#EBEEED',
        borderWidth: 1,
        borderColor: '#E2E8F0',

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    primaryButton: {
        flex: 1,
        backgroundColor: '#0D614E',
        borderWidth: 0,
    },

    footerButtonText: {
        marginLeft: 6,
        fontSize: 15,
        color: '#475569',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    primaryButtonText: {
        color: '#FFFFFF',
    },

    bottomSpacing: {
        height: 10,
    },
});