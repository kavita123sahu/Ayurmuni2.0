import { UPCOMING_STATUS } from '../common/DataInterface';

type AppointmentIdSource = {
  consultation_id?: string | null;
  appointment_id?: string | null;
  id?: string | null;
  rawData?: any;
  appointment?: any;
};

/** Pick the id the detail/action APIs accept for any appointment status. */
export function resolveAppointmentLookupId(
  source?: AppointmentIdSource | null,
): string {
  if (!source) {
    return '';
  }

  const candidates = [
    source.consultation_id,
    source.appointment_id,
    source.id,
    source.rawData?.consultation_id,
    source.rawData?.appointment_id,
    source.rawData?.id,
    source.rawData?.appointment?.consultation_id,
    source.rawData?.appointment?.id,
    source.appointment?.consultation_id,
    source.appointment?.id,
  ];

  for (const value of candidates) {
    if (value != null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

export function normalizeAppointmentListItem(item: any) {
  const lookupId = resolveAppointmentLookupId(item);

  return {
    consultation_id: lookupId,
    doctorName: item?.doctor?.doctor_name || '',
    therapies: Array.isArray(item?.doctor?.health_diseases)
      ? item.doctor.health_diseases.map((i: any) => i.name).join(', ')
      : '',
    date: item?.appointment_date,
    time: item?.start_time,
    status: item?.appointment_status,
    call_status: item?.call_status,
    image: item?.doctor?.doctor_image,
    rawData: item,
  };
}

export function filterUpcomingAppointments(items: any[] = [], limit?: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = items
    .map(item => normalizeAppointmentListItem(item))
    .filter(item => {
      const status = String(item.status || '').toLowerCase();
      if (!UPCOMING_STATUS.includes(status)) {
        return false;
      }

      const appointmentDate = new Date(item.date);
      if (Number.isNaN(appointmentDate.getTime())) {
        return false;
      }

      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

  if (typeof limit === 'number') {
    return upcoming.slice(0, limit);
  }

  return upcoming;
}
