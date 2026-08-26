import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import DoctorListCard from '../../components/DoctorListCard';
import HomeDoctorCard from '../../components/HomeDoctorCard';
import {
  HOME_DOCTOR,
  getDoctorGridCardWidth,
  getHomeDoctorCardWidth,
} from '../../constants/doctorGridLayout';

const toLabelList = (value: any): string[] => {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item?.name) return String(item.name).trim();
        if (item?.title) return String(item.title).trim();
        if (item?.label) return String(item.label).trim();
        return '';
      })
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const getDoctorSpecializationLabels = (doctor: any): string[] => {
  const candidates = [
    doctor?.doctor_specialization,
    doctor?.specializations,
    doctor?.specialization,
    doctor?.specialization_name,
    doctor?.speciality,
    doctor?.specialty,
    doctor?.designation,
    doctor?.qualification,
    doctor?.health_diseases,
  ];
  for (const c of candidates) {
    const list = toLabelList(c);
    if (list.length) return list;
  }
  return [];
};

interface Doctor {
  id: string;
  average_rating?: string;
  full_name: string;
  health_diseases?: any[];
  experience: string;
  name: string;
  total_reviews: string;
  total_patients?: string | number;
  patients_display?: string | number;
  ranking_score: string;
  experience_years: string;
  profile_image: any;
  has_availability?: boolean;
  first_name?: string;
  consultation_fee?: string | number;
  doctor_specialization?: any;
  specialization?: any;
  specializations?: any;
  specialization_name?: string;
  designation?: string;
  qualification?: string;
}

type Props = {
  data?: Doctor[];
  navigation: any;
  layout?: 'grid' | 'horizontal';
  limit?: number;
  home?: boolean;
};

const resolveImageUri = (item: Doctor): string => {
  if (typeof item?.profile_image === 'string') return item.profile_image.trim();
  if (item?.profile_image?.url) return String(item.profile_image.url).trim();
  return '';
};

const TopDoctorsCard = ({
  data = [],
  navigation,
  limit,
  home = false,
}: Props) => {
  const cardWidth = useMemo(
    () => (home ? getHomeDoctorCardWidth() : getDoctorGridCardWidth()),
    [home],
  );

  const openDoctorProfile = useCallback(
    (item: Doctor) => {
      navigation?.navigate?.('DoctorProfile', { doctorData: item });
    },
    [navigation],
  );

  const list = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    if (typeof limit === 'number' && limit > 0) {
      return source.slice(0, limit);
    }
    return source;
  }, [data, limit]);

  if (!list.length) {
    return null;
  }

  return (
    <View style={styles.grid}>
      {list.map((item, index) => {
        const labels = getDoctorSpecializationLabels(item);
        const feeRaw = item?.consultation_fee;
        const hasFee =
          feeRaw != null &&
          String(feeRaw).trim() !== '' &&
          Number(feeRaw) >= 0;
        const rating = Number(item?.average_rating ?? item?.ranking_score ?? 0);

        const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : '0.0';
        const cardProps = {
          name: item.full_name || item.name || 'Doctor',
          speciality: labels[0] || 'Ayurveda Specialist',
          ratingLabel,
          reviews: item?.total_reviews,
          totalPatients:
            item?.patients_display ??
            item?.total_patients ??
            item?.total_reviews,
          experience: item?.experience_years || item?.experience || '0',
          feeLabel: hasFee ? String(feeRaw).replace(/\.0+$/, '') : null,
          imageUri: resolveImageUri(item),
          available: item?.has_availability === true,
          onPress: () => openDoctorProfile(item),
        };

        if (home) {
          return (
            <HomeDoctorCard
              key={String(item?.id ?? `top-doc-${index}`)}
              cardWidth={cardWidth}
              qualification={
                String(item?.qualification || item?.designation || '').trim() ||
                undefined
              }
              {...cardProps}
            />
          );
        }

        return (
          <DoctorListCard
            key={String(item?.id ?? `top-doc-${index}`)}
            variant="grid"
            cardWidth={cardWidth}
            {...cardProps}
          />
        );
      })}
    </View>
  );
};

export default React.memo(TopDoctorsCard);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: HOME_DOCTOR.gap,
  },
});
