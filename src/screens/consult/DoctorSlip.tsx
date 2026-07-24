import React, { memo, useCallback, useEffect } from 'react';
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

import *as _CONSULT_SERVICE from '../../services/ConsultServce';

import Header from '../../components/Header';
import SectionHeader from '../../components/SectionHeader';

import { Feather, Ionicons } from '../../common/Vector';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import MultipleDoctorSlip from './MultipleDoctorSlip';
import { DoctorCardSkeleton, DoctorSlipSkeleton } from '../../simmerScreen/ShimmerHook';

const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface MedicineItem {
    id: number;
    icon: string;
    description: string;
    days: string;
    timing: string;
    instruction: string
    medicine_name: string;
    dosage: string;
    duration: string;
    frequency: string

}

interface GuidelineItemType {
    id: number;
    text: string;
}

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */



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

export const AppText = memo(
    ({
        text,
        style,
        numberOfLines,
        subtext
    }: {
        text: string;
        style?: any;
        subtext?: string
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

export type Props = {
    data: any;
    doctor: any;
};

export const PatientDetails = ({
    data,
    doctor,
}: Props) => {
    console.log("doctordoctordoctor", doctor);
    return (
        <View style={styles.patientCard}>
            <View style={styles.rowBetween}>
                <InfoBlock
                    label="DEGREE"
                    value={doctor?.qualification ?? 'NA'}
                    subValue="ID: Sanctuary-882910"
                />

                <InfoBlock
                    label="DATE"
                    value={data?.appointment_date ?? 'NA'}
                    alignRight
                />
            </View>

            <Divider />

            <View style={styles.rowBetween}>
                <InfoBlock
                    label="PHYSICIAN"
                    value={doctor?.doctor_name ?? 'NA'}
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
                    value={data?.prescription?.symptom_description ?? 'NA'}
                />

                <InfoBlock
                    label="Follow-up date"
                    value={data?.prescription?.follow_up?.date ?? 'NA'}
                    alignRight
                />
            </View>
        </View>
    );
};


/* -------------------------------------------------------------------------- */
/*                              MEDICINE CARD                                 */
/* -------------------------------------------------------------------------- */

export const MedicineCard = memo(
    ({
        icon,
        medicine_name,
        dosage,
        duration,
        frequency,
        instruction
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
                                text={medicine_name}
                                style={styles.medicineName}
                            />

                            <AppText
                                text={instruction}
                                style={styles.medicineDesc}
                            />
                        </View>
                    </View>

                    <View style={styles.timeWrapper}>
                        {/* <AppText
                            text={frequency}
                            subtext={'frequency'}
                            style={styles.timeText}
                        /> */}
                        <Text style={styles.timeText}> {frequency} frequency </Text>
                        <Text style={styles.timeText}> {dosage} dosage </Text>
                        {/* <AppText
                            text={dosage}
                            style={styles.timeText}
                        /> */}
                    </View>
                </View>

                <View style={styles.bottomRow}>
                        <Text style={styles.daysText}> {dosage} dosage </Text>
                    {/* <AppText
                        text={duration}
                        subtext='duration'
                        style={styles.daysText}
                    /> */}
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
        icon?: string;
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
)


const DoctorSlipScreen = (props: any) => {

    const { doctorID } = props?.route.params;
    console.log("DoctorIDDoctorID", doctorID);

    const [loading, setLoading] = React.useState(true);
    const [slipData, setSlipData] = React.useState<any>(null);
    const MEDICINES =
        slipData?.consultations?.[0]?.prescription?.items || [];

    const slips = slipData?.consultations || [];

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await _CONSULT_SERVICE.getPrescriptionDetail(doctorID);
                console.log("doctorIDrespprescription", res?.data);
                setSlipData(res?.data);
            } catch (err) {
                console.log("ERROR", err);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [doctorID]);


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


        slips.length > 1 ? (

            <MultipleDoctorSlip
                consultation={slipData}
                navigation={props.navigation}

            />
        ) : (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    backgroundColor="#FFFFFF"
                    barStyle="dark-content"
                />

                <Header
                    title="Doctor Slip"
                    subtitle="Find best advice for your health"
                    onBack={() => props?.navigation.goBack()}
                />

                {loading ? <DoctorSlipSkeleton /> :
                    <>

                        <ScrollView
                            bounces={false}
                            contentContainerStyle={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}>

                            {/* PATIENT DETAILS */}

                            <PatientDetails data={slipData?.consultations[0]} doctor={slipData} />

                            {/* NOTES */}

                            <SectionHeader title="Doctor’s Notes" />

                            <View style={styles.noteCard}>
                                <AppText
                                    text={slipData?.prescription?.diagnosis_advice || `"Focus on maintaining a consistent sleep schedule this week. The Triphala will aid detoxification while the Ashwagandha supports your nervous system through the quarterly transition. Avoid iced beverages and favor lukewarm water. If you experience mild lethargy in the first 48 hours, it's a normal part of the adjustment phase."`}
                                    style={styles.noteText}
                                />

                                <Divider />

                                <View style={styles.signRow}>
                                    <Image
                                        /* icon:approved */
                                        resizeMode="contain"
                                    />

                                    <AppText
                                        text={`Digitally signed by ${slipData?.doctor?.doctor_name}`}
                                        style={styles.signText}
                                    />
                                </View>
                            </View>

                            {/* MEDICINES */}

                            {MEDICINES.length > 0 && (
                                <>
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
                                </>
                            )}

                            {/* GUIDELINES */}

                            <View style={styles.guidelineCard}>
                                <View style={styles.guidelineHeader}>
                                    <Image
                                        /* icon:bell */
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
                                    text={slipData?.doctor?.doctor_name}
                                    style={styles.footerDoctor}
                                />

                                <View style={styles.authenticatedRow}>
                                    <Image
                                        /* icon:approved */
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
                                onPress={() => props?.navigation.navigate('DoctorConsultationHistory', {
                                    doctorID,
                                    doctorName: slipData?.doctor?.doctor_name,
                                })}
                                isPrimary
                            />
                        </View>
                    </>

                }

            </SafeAreaView>
        )

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