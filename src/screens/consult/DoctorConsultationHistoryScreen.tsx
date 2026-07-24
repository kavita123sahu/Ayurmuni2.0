import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import SectionHeader from '../../components/SectionHeader';
import { useDoctorConsultationSlip } from '../../hooks/useDoctorConsultationSlip';
import {
  ConsultationTimeline,
  StitchedRegimenList,
} from '../../components/consult/ConsultationTimeline';
import { PatientDetails } from './DoctorSlip';

const DoctorConsultationHistoryScreen = ({ route, navigation }: any) => {
  const doctorID = route?.params?.doctorID;
  const doctorName = route?.params?.doctorName;

  const { loading, consultations, regimenData, doctor, slipData } =
    useDoctorConsultationSlip(doctorID);

  const title = doctorName || doctor?.doctor_name || 'Consultation History';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Header
        title={title}
        subtitle="All consultations with this doctor"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0D614E" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!!consultations.length && (
            <PatientDetails
              data={consultations[0]}
              doctor={doctor ?? slipData}
            />
          )}

          <SectionHeader title="Consultation History" />

          {consultations.length > 0 ? (
            <ConsultationTimeline
              consultations={consultations}
              doctor={doctor}
              navigation={navigation}
            />
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No consultations found for this doctor.</Text>
            </View>
          )}

          {regimenData.length > 0 && (
            <>
              <SectionHeader title="Current Stitched Regimen" />
              <StitchedRegimenList items={regimenData} />
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DoctorConsultationHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
