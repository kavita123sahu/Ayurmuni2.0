import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { Colors } from '../../common/Colors';
import SectionHeader from '../../components/SectionHeader';
import { PatientDetails } from './DoctorSlip';
import {
    ConsultationTimeline,
    StitchedRegimenList,
} from '../../components/consult/ConsultationTimeline';

const PREVIEW_LIMIT = 3;

const MultipleDoctorSlip = ({
    consultation,
    navigation,
}: any) => {
    const consultations = consultation?.consultations ?? [];
    const doctor = consultation?.doctor;
    const previewList = consultations.slice(0, PREVIEW_LIMIT);
    const showViewAll = consultations.length > PREVIEW_LIMIT;

    const regimenData =
        consultations.flatMap(
            (item: any) => item?.prescription?.items || [],
        ) || [];

    const openViewAll = () => {
        navigation.navigate('DoctorConsultationHistory', {
            doctorID: doctor?.doctor_id ?? doctor?.id,
            doctorName: doctor?.doctor_name,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            <Header
                title="Doctor Slip"
                subtitle={doctor?.doctor_name || 'Consultation history'}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <PatientDetails
                    data={consultations[0]}
                    doctor={doctor}
                />

                <View style={styles.successCard}>
                    <Text style={styles.successTitle}>YOUR VISITS</Text>
                    <Text style={styles.successText}>
                        {consultations.length} consultation
                        {consultations.length > 1 ? 's' : ''} with this doctor
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(
                                        100,
                                        Math.round(
                                            (consultations.filter(
                                                (c: any) =>
                                                    c.appointment_status ===
                                                    'completed',
                                            ).length /
                                                Math.max(consultations.length, 1)) *
                                                100,
                                        ),
                                    )}%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                <SectionHeader
                    title="Recent consultations"
                    actionText={showViewAll ? 'View all' : undefined}
                    onPress={showViewAll ? openViewAll : undefined}
                />

                <ConsultationTimeline
                    consultations={previewList}
                    doctor={doctor}
                    navigation={navigation}
                />

                {regimenData.length > 0 && (
                    <>
                        <SectionHeader title="Medicines from visits" />
                        <StitchedRegimenList items={regimenData} />
                    </>
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
    successCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    successTitle: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 0.6,
    },
    successText: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.primaryColor,
        fontFamily: 'Poppins-Medium',
        marginTop: 6,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 14,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0D614E',
        borderRadius: 12,
    },
});
