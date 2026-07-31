import { PAST_STATUS, UPCOMING_STATUS } from '../common/DataInterface';

const normalizeStatus = (status?: string | null): string =>
  String(status || '')
    .trim()
    .toLowerCase();

/** Statuses where the patient can still reschedule the same appointment. */
export const RESCHEDULABLE_STATUSES = [
  ...UPCOMING_STATUS,
  'upcoming',
  'booked',
];

/** Terminal / past statuses — never offer Reschedule. */
export const NON_RESCHEDULABLE_STATUSES = [
  ...PAST_STATUS,
  'expired',
  'no_show',
  'noshow',
  'cancellation_requested',
  'rejected',
];

export const canRescheduleAppointment = (status?: string | null): boolean => {
  const value = normalizeStatus(status);
  if (!value) return false;
  if (NON_RESCHEDULABLE_STATUSES.includes(value)) return false;
  return RESCHEDULABLE_STATUSES.includes(value);
};

/** Receipt is available for any consultation that has an id (including past). */
export const canShowConsultationReceipt = (
  status?: string | null,
  consultationId?: string | null,
): boolean => {
  if (consultationId != null && String(consultationId).trim() !== '') {
    return true;
  }
  // Fallback: allow for known past statuses even if id wiring is odd
  return NON_RESCHEDULABLE_STATUSES.includes(normalizeStatus(status));
};

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
  const root = item?.rawData ?? item;
  const doctor = root?.doctor ?? item?.doctor ?? {};
  const appointment = root?.appointment ?? item ?? {};

  const doctorName =
    doctor?.doctor_name ||
    doctor?.full_name ||
    doctor?.name ||
    item?.doctorName ||
    '';

  const image =
    doctor?.doctor_image ||
    doctor?.profile_image ||
    doctor?.image ||
    item?.image ||
    '';

  const specialty =
    doctor?.doctor_specialization ||
    (Array.isArray(doctor?.health_diseases)
      ? doctor.health_diseases.map((i: any) => i?.name).filter(Boolean).join(', ')
      : '') ||
    item?.therapies ||
    '';

  const date =
    appointment?.appointment_date ??
    item?.appointment_date ??
    item?.date ??
    '';

  const time =
    appointment?.start_time ??
    item?.start_time ??
    item?.time ??
    '';

  return {
    consultation_id: ids.consultationId || ids.appointmentId,
    appointment_id: ids.appointmentId || ids.consultationId,
    doctorName,
    specialty,
    therapies: Array.isArray(doctor?.health_diseases)
      ? doctor.health_diseases.map((i: any) => i.name).join(', ')
      : specialty,
    date,
    time,
    status: appointment?.appointment_status ?? item?.appointment_status ?? item?.status,
    call_status:
      appointment?.call_status ??
      item?.call_status ??
      item?.rawData?.call_status,
    image,
    rawData: root,
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

const parseAppointmentStart = (dateStr?: string, timeStr?: string): Date | null => {
  if (!dateStr) {
    return null;
  }

  const base = new Date(dateStr);
  if (Number.isNaN(base.getTime())) {
    return null;
  }

  if (!timeStr) {
    return base;
  }

  const match = String(timeStr).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) {
    return base;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[4]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  base.setHours(hours, minutes, 0, 0);
  return base;
};

export const formatAppointmentDayLabel = (dateStr?: string) => {
  if (!dateStr) {
    return '';
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return 'Today';
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (target.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};

/** Weekday name: Thu / Thursday */
export const formatAppointmentWeekday = (
  dateStr?: string,
  short = true,
): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    weekday: short ? 'short' : 'long',
  });
};

/** Calendar date: 31 Jul 2026 */
export const formatAppointmentDateFull = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatAppointmentTimeLabel = (timeStr?: string) => {
  if (!timeStr) {
    return '';
  }

  const raw = String(timeStr).trim();
  if (/am|pm/i.test(raw)) {
    return raw;
  }

  const match = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    return raw;
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${meridiem}`;
};

/** Normalize history/recent API item into display fields */
export const getConsultationScheduleLabels = (item: any) => {
  const dateRaw =
    item?.date ||
    item?.appointment_date ||
    item?.appointment?.appointment_date ||
    '';
  const timeRaw =
    item?.time ||
    item?.start_time ||
    item?.appointment?.start_time ||
    '';
  const status =
    item?.status ||
    item?.appointment_status ||
    item?.appointment?.appointment_status ||
    '';

  const weekday = formatAppointmentWeekday(dateRaw);
  const dayLabel = formatAppointmentDayLabel(dateRaw);
  const dateLabel = formatAppointmentDateFull(dateRaw);
  const timeLabel = formatAppointmentTimeLabel(timeRaw);

  return {
    dateRaw,
    timeRaw,
    status: String(status || ''),
    weekday,
    dayLabel,
    dateLabel,
    timeLabel,
    /** Compact line: Today · 31 Jul 2026 · 10:30 AM */
    scheduleLine: [dayLabel || weekday, dateLabel, timeLabel]
      .filter(Boolean)
      .join(' · '),
  };
};

export const formatDoctorDisplayName = (name?: string) => {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return 'Doctor';
  }
  return /^dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
};

export const getMinutesUntilAppointment = (
  dateStr?: string,
  timeStr?: string,
): number | null => {
  const start = parseAppointmentStart(dateStr, timeStr);
  if (!start) {
    return null;
  }

  return Math.max(0, Math.ceil((start.getTime() - Date.now()) / 60000));
};

export type JoinableAppointment = {
  item: ReturnType<typeof normalizeAppointmentListItem>;
  minutesLeft: number;
  isLive: boolean;
};

/** Appointment the patient can join now or within the pre-call window. */
export function getJoinableAppointment(
  items: any[] = [],
  windowMinutes = 15,
): JoinableAppointment | null {
  const now = Date.now();

  for (const raw of items) {
    const item = normalizeAppointmentListItem(raw);
    const callStatus = String(item.call_status || '').toLowerCase();

    if (callStatus === 'in_progress') {
      return { item, minutesLeft: 0, isLive: true };
    }

    const start = parseAppointmentStart(item.date, item.time);
    if (!start) {
      continue;
    }

    const diffMin = Math.ceil((start.getTime() - now) / 60000);
    if (diffMin >= 0 && diffMin <= windowMinutes) {
      return { item, minutesLeft: diffMin, isLive: false };
    }
  }

  return null;
}
