import { UPCOMING_STATUS } from '../common/DataInterface';

/**
 * Any screen/object that represents an appointment may store ids on different fields.
 * Pass the whole item (or `{ rawData, appointment }`) into the helpers below.
 */
export type AppointmentIdSource = {
  consultation_id?: string | null;
  appointment_id?: string | null;
  id?: string | null;
  rawData?: any;
  appointment?: any;
};

export type AppointmentIds = {
  /** Preferred for video call API (`/appointments/{id}/call/`) */
  appointmentId: string;
  /** Used by chat, detail lookup, and video call fallback */
  consultationId: string;
};

const firstNonEmpty = (values: Array<string | null | undefined>): string => {
  for (const value of values) {
    if (value != null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
};

/** Reads both ids from list items, detail API responses, or route params. */
export function getAppointmentIds(
  source?: AppointmentIdSource | null,
): AppointmentIds {
  if (!source) {
    return { appointmentId: '', consultationId: '' };
  }

  const appointmentId = firstNonEmpty([
    source.appointment_id,
    source.rawData?.appointment_id,
    source.appointment?.appointment_id,
    source.id,
    source.rawData?.id,
    source.appointment?.id,
    source.rawData?.appointment?.id,
  ]);

  const consultationId = firstNonEmpty([
    source.consultation_id,
    source.rawData?.consultation_id,
    source.appointment?.consultation_id,
    source.rawData?.appointment?.consultation_id,
  ]);

  return { appointmentId, consultationId };
}

/** Detail/chat/action APIs — prefers consultation id, then appointment id. */
export function resolveAppointmentLookupId(
  source?: AppointmentIdSource | null,
): string {
  const { appointmentId, consultationId } = getAppointmentIds(source);
  return consultationId || appointmentId;
}

/** Video call API — prefers appointment id, then consultation id. */
export function getVideoCallId(source?: AppointmentIdSource | null): string {
  const { appointmentId, consultationId } = getAppointmentIds(source);
  return appointmentId || consultationId;
}

/** Route params for PatientVideoCallScreen. */
export function buildVideoCallNavParams(
  source?: AppointmentIdSource | null,
  extras?: {
    role?: 'doctor' | 'patient';
    otherPartyName?: string;
    otherPartyImage?: string;
  },
) {
  const ids = getAppointmentIds(source);
  const primaryId = ids.appointmentId || ids.consultationId;

  return {
    appointmentId: primaryId,
    ...(ids.consultationId ? { consultationId: ids.consultationId } : {}),
    ...extras,
  };
}

/** Params for AppointmentDetails screen. */
export function buildAppointmentDetailsParams(
  source?: AppointmentIdSource | null,
) {
  const ids = getAppointmentIds(source);
  const lookupId = ids.consultationId || ids.appointmentId;

  return {
    consultation_id: lookupId,
    appointment_id: ids.appointmentId || lookupId,
  };
}

export function normalizeAppointmentListItem(item: any) {
  const ids = getAppointmentIds({ rawData: item, ...item });

  return {
    consultation_id: ids.consultationId || ids.appointmentId,
    appointment_id: ids.appointmentId || ids.consultationId,
    doctorName: item?.doctor?.doctor_name || '',
    therapies: Array.isArray(item?.doctor?.health_diseases)
      ? item.doctor.health_diseases.map((i: any) => i.name).join(', ')
      : '',
    date: item?.appointment_date,
    time: item?.start_time,
    status: item?.appointment_status,
    call_status:
      item?.call_status ??
      item?.appointment?.call_status ??
      item?.rawData?.call_status,
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
