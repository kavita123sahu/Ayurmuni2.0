import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import SectionHeader from '../SectionHeader';
import { useDoctorConsultationSlip } from '../../hooks/useDoctorConsultationSlip';
import {
  ConsultationTimeline,
  StitchedRegimenList,
} from './ConsultationTimeline';

const PREVIEW_LIMIT = 3;

type DoctorConsultationSectionProps = {
  doctorId?: string | null;
  navigation: any;
  slipData?: any;
  previewLimit?: number;
  showRegimen?: boolean;
  containerStyle?: object;
};

const DoctorConsultationSection = ({
  doctorId,
  navigation,
  slipData: slipDataProp,
  previewLimit = PREVIEW_LIMIT,
  showRegimen = true,
  containerStyle,
}: DoctorConsultationSectionProps) => {
  const fetched = useDoctorConsultationSlip(slipDataProp ? null : doctorId);

  const slipData = slipDataProp ?? fetched.slipData;
  const loading = slipDataProp ? false : fetched.loading;
  const consultations = useMemo(
    () => (Array.isArray(slipData?.consultations) ? slipData.consultations : []),
    [slipData],
  );
  const doctor = slipData?.doctor ?? null;

  const regimenData = useMemo(
    () =>
      consultations.flatMap(
        (item: any) => item?.prescription?.items || [],
      ),
    [consultations],
  );

  const previewConsultations = consultations.slice(0, previewLimit);
  const showViewAll = consultations.length > previewLimit;

  const openViewAll = () => {
    navigation.navigate('DoctorConsultationHistory', {
      doctorID: doctorId ?? doctor?.doctor_id ?? doctor?.id,
      doctorName: doctor?.doctor_name,
    });
  };

  if (!doctorId && !slipDataProp) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.loadingWrap, containerStyle]}>
        <ActivityIndicator size="small" color="#0D614E" />
        <Text style={styles.loadingText}>Loading consultation history...</Text>
      </View>
    );
  }

  if (!consultations.length) {
    return null;
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      <SectionHeader
        title="Consultation History"
        actionText={showViewAll ? 'View all' : undefined}
        onPress={showViewAll ? openViewAll : undefined}
      />

      <ConsultationTimeline
        consultations={previewConsultations}
        doctor={doctor}
        navigation={navigation}
      />

      {showRegimen && regimenData.length > 0 && (
        <>
          <SectionHeader title="Current Stitched Regimen" />
          <StitchedRegimenList items={regimenData} />
        </>
      )}
    </View>
  );
};

export default DoctorConsultationSection;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    paddingHorizontal: 10
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
