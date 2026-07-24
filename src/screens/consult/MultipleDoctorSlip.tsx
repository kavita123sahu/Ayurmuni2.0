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
    const previewList = consultations.slice(0, PREVIEW_LIMIT);
    const showViewAll = consultations.length > PREVIEW_LIMIT;

    const regimenData =
        consultations.flatMap(
            (item: any) => item?.prescription?.items || [],
        ) || [];

        console.log('consultationsconsultations',consultations)

    const openViewAll = () => {
        navigation.navigate('DoctorConsultationHistory', {
            doctorID: consultation?.doctor?.doctor_id ?? consultation?.doctor?.id,
            doctorName: consultation?.doctor?.doctor_name,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={'dark-content'} backgroundColor={'#F9FAFB'} />

            <Header
                title="Doctor Slip"
                subtitle="Find best advice for your health"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <PatientDetails
                    data={consultations[0]}
                    doctor={consultation?.doctor}
                />

                {consultations.length > 1 && (
                    <View style={styles.successCard}>
                        <Text style={styles.successTitle}>
                            JOURNEY PROGRESSION
                        </Text>
                        <Text style={styles.successText}>
                            {consultations.length} consultation{consultations.length > 1 ? 's' : ''} recorded with this doctor.
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(
                                            100,
                                            Math.round((consultations.filter((c: any) => c.appointment_status === 'completed').length / consultations.length) * 100),
                                        )}%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                <SectionHeader
                    title="Consultation History"
                    actionText={showViewAll ? 'View all' : undefined}
                    onPress={showViewAll ? openViewAll : undefined}
                />

                <ConsultationTimeline
                    consultations={previewList}
                    doctor={consultation?.doctor}
                    navigation={navigation}
                />

                {regimenData.length > 0 && (
                    <>
                        <SectionHeader title="Current Stitched Regimen" />
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
        padding: 24,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    successTitle: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: 'Poppins-SemiBold',
    },
    successText: {
        fontSize: 13,
        lineHeight: 21,
        color: Colors.primaryColor,
        fontFamily: 'Poppins-Medium',
        marginTop: 6,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        marginTop: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0D614E',
        borderRadius: 12,
    },
});
