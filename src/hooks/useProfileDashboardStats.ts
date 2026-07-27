import { useCallback, useState } from 'react';
import { isAuthenticated } from '../services/guestAuth';
import { getConsultHistory } from '../services/ConsultServce';
import { getOrders } from '../services/OrderService';
import { getAllMedicalRecord } from '../services/PatientServices';

export type ProfileDashboardStat = {
  value: string;
  label: string;
};

const DEFAULT_STATS: ProfileDashboardStat[] = [
  { value: '--', label: 'CONSULTS' },
  { value: '--', label: 'ORDERS' },
  { value: '--', label: 'REPORTS' },
];

const formatCount = (count: number) =>
  String(Math.max(0, count)).padStart(2, '0');

const resolveCount = (payload: any, listKeys: string[] = ['results', 'data']) => {
  if (typeof payload?.count === 'number') {
    return payload.count;
  }

  for (const key of listKeys) {
    const value = payload?.[key];
    if (Array.isArray(value)) {
      return value.length;
    }
  }

  if (Array.isArray(payload)) {
    return payload.length;
  }

  return 0;
};

export function useProfileDashboardStats() {
  const [stats, setStats] = useState<ProfileDashboardStat[]>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!(await isAuthenticated())) {
      setStats([
        { value: '00', label: 'CONSULTS' },
        { value: '00', label: 'ORDERS' },
        { value: '00', label: 'REPORTS' },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [consultRes, ordersRes, recordsRes] = await Promise.allSettled([
        getConsultHistory({ page: 1 }),
        getOrders(),
        getAllMedicalRecord(),
      ]);

      const consultCount =
        consultRes.status === 'fulfilled'
          ? resolveCount(consultRes.value?.data)
          : 0;

      const ordersCount =
        ordersRes.status === 'fulfilled'
          ? resolveCount(ordersRes.value?.data, ['data'])
          : 0;

      const reportsCount =
        recordsRes.status === 'fulfilled'
          ? resolveCount(recordsRes.value?.data, ['data'])
          : 0;

      setStats([
        { value: formatCount(consultCount), label: 'CONSULTS' },
        { value: formatCount(ordersCount), label: 'ORDERS' },
        { value: formatCount(reportsCount), label: 'REPORTS' },
      ]);
    } catch {
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, refresh };
}
