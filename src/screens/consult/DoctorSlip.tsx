import React, { memo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    FlatList,
    Dimensions,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import * as _CONSULT_SERVICE from '../../services/ConsultServce';

import Header from '../../components/Header';
import SectionHeader from '../../components/SectionHeader';

import { Feather, Ionicons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import MultipleDoctorSlip from './MultipleDoctorSlip';
import { DoctorSlipSkeleton } from '../../simmerScreen/ShimmerHook';
import {
    formatSlipDate,
    formatSlipTimeRange,
    getDoctorLocationLine,
    getPatientMeta,
    hasPrescribedData,
} from '../../utils/doctorSlipUtils';

const { width } = Dimensions.get('window');

interface MedicineItem {
    id: number | string;
    icon?: string;
    description?: string;
    days?: string;
    timing?: string;
    instruction?: string;
    medicine_name: string;
    dosage?: string;
    duration?: string;
    frequency?: string;
}

export const AppText = memo(
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
            <View style={alignRight ? styles.alignEnd : undefined}>
                <AppText text={label} style={styles.label} />
                <AppText
                    text={value || '—'}
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

/** Compact doctor summary for the first slip screen (single / multi preview). */
export const PatientDetails = ({ data, doctor }: Props) => {
    const location = getDoctorLocationLine(doctor);
    const patient = data?.patient;
    const patientMeta = getPatientMeta(patient);
    const timeRange = formatSlipTimeRange(data?.start_time, data?.end_time);

    return (
        <View style={styles.patientCard}>
            <View style={styles.rowBetween}>
                <InfoBlock
                    label="PHYSICIAN"
                    value={doctor?.doctor_name ?? '—'}
                    subValue={
                        [
                            doctor?.qualification,
                            doctor?.experience_display
                                ? `${doctor.experience_display} yrs exp`
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' · ') || undefined
                    }
                />
                <InfoBlock
                    label="DATE"
                    value={formatSlipDate(data?.appointment_date || data?.date)}
                    subValue={timeRange !== '—' ? timeRange : undefined}
                    alignRight
                />
            </View>

            <Divider />

            <View style={styles.rowBetween}>
                <InfoBlock
                    label="PATIENT"
                    value={patient?.patient_name ?? '—'}
                    subValue={patientMeta || undefined}
                />
                <InfoBlock
                    label="REF NO."
                    value={
                        doctor?.registration_number ||
                        String(data?.consultation_id || '').slice(0, 8) ||
                        '—'
                    }
                    alignRight
                />
            </View>

            {!!location && (
                <>
                    <Divider />
                    <InfoBlock label="CITY / LOCATION" value={location} />
                </>
            )}

            {!!data?.concern && (
                <>
                    <Divider />
                    <InfoBlock label="CONCERN" value={data.concern} />
                </>
            )}
        </View>
    );
};

/** Light header used on View-all history — doctor name + city only. */
export const DoctorCityHeader = ({ doctor }: { doctor?: any }) => {
    if (!doctor) return null;
    const location = getDoctorLocationLine(doctor);
    return (
        <View style={styles.cityHeaderCard}>
            <Text style={styles.cityHeaderName}>{doctor?.doctor_name || 'Doctor'}</Text>
            {!!location && <Text style={styles.cityHeaderLocation}>{location}</Text>}
            {!!doctor?.qualification && (
                <Text style={styles.cityHeaderMeta}>{doctor.qualification}</Text>
            )}
        </View>
    );
};

export const MedicineCard = memo(
    ({
        medicine_name,
        dosage,
        duration,
        frequency,
        instruction,
    }: MedicineItem) => {
        return (
            <View style={styles.medicineCard}>
                <View style={styles.medicineTopRow}>
                    <View style={styles.medicineLeft}>
                        <View style={styles.iconWrapper}>
                            <Ionicons
                                name="medkit-outline"
                                size={18}
                                color={Colors.primaryColor}
                            />
                        </View>
                        <View style={styles.medicineInfo}>
                            <AppText
                                text={medicine_name}
                                style={styles.medicineName}
                            />
                            {!!instruction && (
                                <AppText
                                    text={instruction}
                                    style={styles.medicineDesc}
                                />
                            )}
                        </View>
                    </View>
                    <View style={styles.timeWrapper}>
                        {!!frequency && (
                            <Text style={styles.timeText}>{frequency} frequency</Text>
                        )}
                        {!!dosage && (
                            <Text style={styles.timeText}>{dosage} dosage</Text>
                        )}
                    </View>
                </View>
                {!!duration && (
                    <View style={styles.bottomRow}>
                        <Text style={styles.daysText}>{duration} duration</Text>
                    </View>
                )}
            </View>
        );
    },
);

const NoteBlock = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value?.trim?.()) return null;
    return (
        <View style={styles.noteBlock}>
            <Text style={styles.noteLabel}>{label}</Text>
            <Text style={styles.noteValue}>{value}</Text>
        </View>
    );
};

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
);

const DoctorSlipScreen = (props: any) => {
    const { doctorID } = props?.route?.params || {};
    const [loading, setLoading] = React.useState(true);
    const [slipData, setSlipData] = React.useState<any>(null);
    const insets = useSafeAreaInsets();

    const consultations = slipData?.consultations || [];
    const doctor = slipData?.doctor;
    const activeConsultation = consultations[0];
    const medicines = activeConsultation?.prescription?.items || [];
    const prescription = activeConsultation?.prescription;
    const canViewPrescription = hasPrescribedData(activeConsultation);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await _CONSULT_SERVICE.getPrescriptionDetail(doctorID);
                setSlipData(res?.data);
            } catch (err) {
                console.log('Doctor slip error', err);
            } finally {
                setLoading(false);
            }
        };
        if (doctorID) fetch();
    }, [doctorID]);

    const renderMedicine = useCallback(
        ({ item }: { item: MedicineItem }) => {
            return <MedicineCard {...item} />;
        },
        [],
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
                <Header
                    title="Doctor Slip"
                    subtitle="Your consultation summary"
                    onBack={() => props?.navigation.goBack()}
                />
                <DoctorSlipSkeleton />
            </SafeAreaView>
        );
    }

    if (consultations.length > 1) {
        return (
            <MultipleDoctorSlip
                consultation={slipData}
                navigation={props.navigation}
            />
        );
    }

    const fee =
        activeConsultation?.payment?.consultation_fee ??
        activeConsultation?.payment?.amount;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            <Header
                title="Doctor Slip"
                subtitle={doctor?.doctor_name || 'Consultation summary'}
                onBack={() => props?.navigation.goBack()}
            />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>
                <PatientDetails data={activeConsultation} doctor={doctor} />

                {(prescription?.clinical_notes ||
                    prescription?.diagnosis_advice ||
                    prescription?.symptom_description ||
                    prescription?.allergies ||
                    prescription?.history_of_past_illness ||
                    prescription?.family_history) && (
                    <>
                        <SectionHeader title="Doctor’s Notes" />
                        <View style={styles.noteCard}>
                            <NoteBlock
                                label="Symptoms"
                                value={prescription?.symptom_description}
                            />
                            <NoteBlock
                                label="Past illness"
                                value={prescription?.history_of_past_illness}
                            />
                            <NoteBlock
                                label="Allergies"
                                value={prescription?.allergies}
                            />
                            <NoteBlock
                                label="Family history"
                                value={prescription?.family_history}
                            />
                            <NoteBlock
                                label="Clinical notes"
                                value={prescription?.clinical_notes}
                            />
                            <NoteBlock
                                label="Diagnosis & advice"
                                value={prescription?.diagnosis_advice}
                            />
                            {!!prescription?.follow_up?.date && (
                                <NoteBlock
                                    label="Follow-up"
                                    value={`${formatSlipDate(prescription.follow_up.date)}${
                                        prescription.follow_up.reason
                                            ? ` · ${prescription.follow_up.reason}`
                                            : ''
                                    }`}
                                />
                            )}
                            <Divider />
                            <AppText
                                text={`Digitally signed by ${doctor?.doctor_name || 'Doctor'}`}
                                style={styles.signText}
                            />
                        </View>
                    </>
                )}

                {medicines.length > 0 && (
                    <>
                        <SectionHeader title="Current Regimen" />
                        <FlatList
                            data={medicines}
                            scrollEnabled={false}
                            keyExtractor={(item, index) =>
                                String(item?.id ?? `${item?.medicine_name}-${index}`)
                            }
                            renderItem={renderMedicine}
                            contentContainerStyle={styles.listGap}
                        />
                    </>
                )}

                {(fee != null || activeConsultation?.appointment_notes) && (
                    <View style={styles.summaryCard}>
                        {fee != null && (
                            <Text style={styles.summaryLine}>
                                Consultation fee · ₹{Number(fee).toLocaleString('en-IN')}
                            </Text>
                        )}
                        {!!activeConsultation?.appointment_notes && (
                            <Text style={styles.summarySub}>
                                {activeConsultation.appointment_notes}
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.doctorFooter}>
                    <AppText
                        text={doctor?.doctor_name || 'Doctor'}
                        style={styles.footerDoctor}
                    />
                    {!!doctor?.qualification && (
                        <AppText
                            text={doctor.qualification}
                            style={styles.footerSpeciality}
                        />
                    )}
                    {!!getDoctorLocationLine(doctor) && (
                        <AppText
                            text={getDoctorLocationLine(doctor)}
                            style={styles.footerClinic}
                        />
                    )}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {canViewPrescription && (
                <View
                    style={[
                        styles.footer,
                        {
                            paddingBottom: insets.bottom > 0 ? insets.bottom : 18,
                        },
                    ]}>
                    <FooterButton
                        title="View Prescription"
                        onPress={() =>
                            props?.navigation.navigate('PrescriptionDetail', {
                                PrisData: activeConsultation,
                                doctorData: doctor,
                            })
                        }
                        isPrimary
                        icon="file-text"
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

export default memo(DoctorSlipScreen);

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
        maxWidth: width * 0.42,
    },
    subText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 18,
        textTransform: 'capitalize',
        maxWidth: width * 0.42,
    },
    patientCard: {
        marginTop: 12,
        backgroundColor: '#00514708',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#0051470D',
        padding: 18,
    },
    patientName: {
        fontSize: 16,
        lineHeight: 24,
        maxWidth: width * 0.45,
    },
    cityHeaderCard: {
        marginTop: 12,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    cityHeaderName: {
        fontSize: 18,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    cityHeaderLocation: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 20,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    cityHeaderMeta: {
        marginTop: 2,
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },
    noteCard: {
        marginTop: 12,
        backgroundColor: '#FFDEA84D',
        borderRadius: 20,
        padding: 20,
    },
    noteBlock: {
        marginBottom: 12,
    },
    noteLabel: {
        fontSize: 11,
        color: '#92630A',
        textTransform: 'uppercase',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 4,
    },
    noteValue: {
        fontSize: 14,
        lineHeight: 22,
        color: '#5E4200',
        fontFamily: Fonts.PoppinsMedium,
    },
    signText: {
        fontSize: 12,
        lineHeight: 20,
        letterSpacing: 0.5,
        color: '#5E4200',
        textTransform: 'uppercase',
        fontFamily: Fonts.PoppinsMedium,
    },
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
        gap: 2,
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
    summaryCard: {
        marginTop: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F8FAF9',
        padding: 16,
    },
    summaryLine: {
        fontSize: 14,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    summarySub: {
        marginTop: 6,
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },
    doctorFooter: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerDoctor: {
        fontSize: 20,
        lineHeight: 30,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
    },
    footerSpeciality: {
        marginTop: 6,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsMedium,
    },
    footerClinic: {
        marginTop: 4,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        paddingHorizontal: 12,
    },
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
