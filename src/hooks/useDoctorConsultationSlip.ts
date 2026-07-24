import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPrescriptionDetail } from '../services/ConsultServce';

export function useDoctorConsultationSlip(doctorId?: string | null) {
  const [loading, setLoading] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSlip = useCallback(async () => {
    if (!doctorId) {
      setSlipData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getPrescriptionDetail(String(doctorId));
      setSlipData(res?.data ?? null);
    } catch {
      setError('Unable to load consultation history');
      setSlipData(null);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchSlip();
  }, [fetchSlip]);

  const consultations = useMemo(
    () => (Array.isArray(slipData?.consultations) ? slipData.consultations : []),
    [slipData],
  );

  const regimenData = useMemo(
    () =>
      consultations.flatMap(
        (item: any) => item?.prescription?.items || [],
      ),
    [consultations],
  );

  const doctor = slipData?.doctor ?? null;

  return {
    loading,
    error,
    slipData,
    consultations,
    regimenData,
    doctor,
    refresh: fetchSlip,
  };
}
