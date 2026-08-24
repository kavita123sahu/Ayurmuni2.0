import { useCallback, useState } from 'react';
import * as ConsultServices from '../services/ConsultServce';
import { isAuthenticated } from '../services/guestAuth';

export type RecentVisitedDoctor = {
  id: string;
  doctor_id: string;
  doctor_name: string;
  doctor_image?: string | null;
  doctor_designation?: string | null;
  qualification?: string | null;
  experience_years?: number | string | null;
  experience_display?: string | null;
  average_rating?: number | string | null;
  total_reviews?: number | string | null;
  city?: string | null;
  state?: string | null;
  consultation_fee?: number | string | null;
  is_active?: boolean;
  is_verified?: boolean;
  approval_status?: string | null;
  is_favorite?: boolean;
  consultation_count?: number | string | null;
  total_patients?: number | string | null;
  last_consultation_id?: string | null;
  last_consulted_date?: string | null;
  last_start_time?: string | null;
  last_appointment_status?: string | null;
  health_diseases?: Array<{ id?: string; name?: string }>;
};

const normalizeRecentDoctor = (item: any): RecentVisitedDoctor | null => {
  const doctorId = String(item?.doctor_id || item?.id || '').trim();
  if (!doctorId) return null;

  return {
    ...item,
    id: doctorId,
    doctor_id: doctorId,
    doctor_name: String(item?.doctor_name || item?.full_name || 'Doctor'),
    doctor_image: item?.doctor_image || item?.profile_image || null,
  };
};

export const mapRecentDoctorToNavPayload = (item: RecentVisitedDoctor) => ({
  ...item,
  id: item.doctor_id || item.id,
  doctor_id: item.doctor_id || item.id,
  full_name: item.doctor_name,
  name: item.doctor_name,
  profile_image: item.doctor_image,
  designation: item.doctor_designation || item.qualification,
  qualification: item.qualification || item.doctor_designation,
  experience_years: item.experience_years,
  consultation_fee: item.consultation_fee,
  is_favorite: item.is_favorite,
  total_patients: item.total_patients,
  average_rating: item.average_rating,
  total_reviews: item.total_reviews,
});

export const useRecentVisitedDoctors = () => {
  const [doctors, setDoctors] = useState<RecentVisitedDoctor[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!(await isAuthenticated())) {
      setDoctors([]);
      return;
    }

    setLoading(true);
    try {
      const response = await ConsultServices.getRecentVisitedDoctors();
      const results = Array.isArray(response?.data?.results)
        ? response.data.results
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setDoctors(
        results
          .map(normalizeRecentDoctor)
          .filter(Boolean) as RecentVisitedDoctor[],
      );
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { doctors, loading, refresh };
};
