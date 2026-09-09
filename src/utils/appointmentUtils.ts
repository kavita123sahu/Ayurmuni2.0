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

  const endTime = appointment?.end_time || item?.end_time || null;
  const endTimeLabel = endTime ? formatAppointmentTimeLabel(endTime) : null;

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
    endTime,
    endTimeLabel,
    status: appointment?.appointment_status ?? item?.appointment_status ?? item?.status,
    call_status:
      appointment?.call_status ??
      item?.call_status ??
      item?.rawData?.call_status,
    image,
    rawData: root,
  };
}

/** Local calendar date parts — avoids UTC midnight shift on `YYYY-MM-DD`. */
const parseLocalDateParts = (
  dateStr?: string,
): { year: number; month: number; day: number } | null => {
  if (!dateStr) return null;
  const raw = String(dateStr).trim();

  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  // DD-MM-YYYY / DD/MM/YYYY
  match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (match) {
    return {
      year: Number(match[3]),
      month: Number(match[2]),
      day: Number(match[1]),
    };
  }

  const fallback = new Date(raw);
  if (Number.isNaN(fallback.getTime())) return null;
  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth() + 1,
    day: fallback.getDate(),
  };
};

const parseTimeParts = (
  timeStr?: string,
): { hours: number; minutes: number; seconds: number } | null => {
  if (!timeStr) return null;
  const raw = String(timeStr).trim();

  // Full ISO / datetime → let Date parse (keeps timezone)
  if (/T/.test(raw) || /^\d{4}-\d{2}-\d{2}\s+\d{1,2}:/.test(raw)) {
    const iso = new Date(raw);
    if (!Number.isNaN(iso.getTime())) {
      return {
        hours: iso.getHours(),
        minutes: iso.getMinutes(),
        seconds: iso.getSeconds(),
      };
    }
  }

  const match = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);
  const meridiem = match[4]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return { hours, minutes, seconds };
};

const parseAppointmentStart = (dateStr?: string, timeStr?: string): Date | null => {
  const timeRaw = timeStr != null ? String(timeStr).trim() : '';

  // Prefer full datetime on the time field
  if (timeRaw && (/T/.test(timeRaw) || /^\d{4}-\d{2}-\d{2}/.test(timeRaw))) {
    const iso = new Date(timeRaw);
    if (!Number.isNaN(iso.getTime())) {
      return iso;
    }
  }

  const parts = parseLocalDateParts(dateStr);
  if (!parts) {
    if (timeRaw) {
      const onlyTime = new Date(timeRaw);
      if (!Number.isNaN(onlyTime.getTime())) return onlyTime;
    }
    return null;
  }

  const timeParts = parseTimeParts(timeRaw);
  const hours = timeParts?.hours ?? 0;
  const minutes = timeParts?.minutes ?? 0;
  const seconds = timeParts?.seconds ?? 0;

  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    hours,
    minutes,
    seconds,
    0,
  );
};

/** Soonest upcoming first (date + start time). */
export function sortAppointmentsByDateTime(items: any[] = []): any[] {
  return [...items].sort((a, b) => {
    const aStart =
      parseAppointmentStart(a?.date, a?.time)?.getTime() ??
      new Date(a?.date || 0).getTime();
    const bStart =
      parseAppointmentStart(b?.date, b?.time)?.getTime() ??
      new Date(b?.date || 0).getTime();
    return aStart - bStart;
  });
}

export function filterUpcomingAppointments(items: any[] = [], limit?: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = sortAppointmentsByDateTime(
    items
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
      }),
  );

  if (typeof limit === 'number') {
    return upcoming.slice(0, limit);
  }

  return upcoming;
}

const ENDED_CALL_STATUSES = new Set([
  'ended',
  'left',
  'completed',
  'cancelled',
  'canceled',
  'no_show',
  'missed',
  'rejected',
]);

/** True when appointment should leave Home "Upcoming" (ended call or past end_time). */
export function isAppointmentFinished(raw: any): boolean {
  const item = normalizeAppointmentListItem(raw);
  const callStatus = String(item.call_status || '').toLowerCase().trim();
  if (ENDED_CALL_STATUSES.has(callStatus)) {
    return true;
  }

  const now = Date.now();
  const end = parseAppointmentStart(item.date, item.endTime || undefined);
  if (end && now >= end.getTime()) {
    return true;
  }

  // No end_time: drop ~60 min after start so cards don't linger
  const start = parseAppointmentStart(item.date, item.time);
  if (start && !item.endTime && now >= start.getTime() + 60 * 60 * 1000) {
    return true;
  }

  return false;
}

export function filterActiveHomeAppointments(items: any[] = []): any[] {
  return sortAppointmentsByDateTime(
    items.filter(item => !isAppointmentFinished(item)),
  );
}

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
  const trimmed = String(dateStr).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    const date = new Date(
      Number(ymd[1]),
      Number(ymd[2]) - 1,
      Number(ymd[3]),
    );
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  const date = new Date(trimmed);
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
// export const getConsultationScheduleLabels = (item: any) => {
//   const dateRaw =
//     item?.date ||
//     item?.appointment_date ||
//     item?.appointment?.appointment_date ||
//     '';
//   const timeRaw =
//     item?.time ||
//     item?.start_time ||
//     item?.appointment?.start_time ||
//     '';
//   const status =
//     item?.status ||
//     item?.appointment_status ||
//     item?.appointment?.appointment_status ||
//     '';
// const endTime = item?.end_time || item?.appointment?.end_time || null;

//   const weekday = formatAppointmentWeekday(dateRaw);
//   const dayLabel = formatAppointmentDayLabel(dateRaw);
//   const dateLabel = formatAppointmentDateFull(dateRaw);
//   const timeLabel = formatAppointmentTimeLabel(timeRaw);
//   const endTimeLabel = endTime ? formatAppointmentTimeLabel(endTime) : null;
//   return {
//     dateRaw,
//     timeRaw,
//     status: String(status || ''),
//     weekday,
//     dayLabel,
//     dateLabel,
//     timeLabel,
//     endTimeLabel,
//     /** Compact line: Today · 31 Jul 2026 · 10:30 AM */
//     scheduleLine: [dayLabel || weekday, dateLabel, timeLabel]
//       .filter(Boolean)
//       .join(' · '),
//   };
// };

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

  const endTime =
    item?.end_time ||
    item?.appointment?.end_time ||
    null;

  // Always show weekday: Monday, Tuesday, Wednesday...
  const weekday = formatAppointmentWeekday(dateRaw);

  // Don't use Today/Tomorrow label
  const dayLabel = weekday;

  const dateLabel = formatAppointmentDateFull(dateRaw);

  const timeLabel = formatAppointmentTimeLabel(timeRaw);

  const endTimeLabel = endTime
    ? formatAppointmentTimeLabel(endTime)
    : null;

  return {
    dateRaw,
    timeRaw,
    status: String(status || ''),
    weekday,
    dayLabel,
    dateLabel,
    timeLabel,
    endTimeLabel,

    // Example:
    // Monday · 31 Jul 2026 · 10:30 AM
    scheduleLine: [weekday, dateLabel, timeLabel]
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

const DEFAULT_JOIN_WINDOW_MINUTES = 5;

/**
 * Home "Join Now" banner rules:
 * - Hide ONLY when: end_time has passed, OR call_status is completed/ended
 * - Show when call_status is `in_progress` (and not past end)
 * - Or show within `windowMinutes` (default 5) before start until end_time
 */
export function getJoinableAppointment(
  items: any[] = [],
  windowMinutes = DEFAULT_JOIN_WINDOW_MINUTES,
): JoinableAppointment | null {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;

  for (const raw of items) {
    const item = normalizeAppointmentListItem(raw);
    const callStatus = String(item.call_status || '').toLowerCase().trim();

    // Hide when call is completed / ended (only this call-status condition)
    if (ENDED_CALL_STATUSES.has(callStatus)) {
      continue;
    }

    const start = parseAppointmentStart(item.date, item.time);
    if (!start) {
      continue;
    }

    const end = item.endTime
      ? parseAppointmentStart(item.date, item.endTime)
      : null;
    const validEnd =
      end && end.getTime() > start.getTime() ? end : null;

    // Hide when appointment end_time is reached / matched
    if (validEnd && now >= validEnd.getTime()) {
      continue;
    }

    if (callStatus === 'in_progress') {
      return { item, minutesLeft: 0, isLive: true };
    }

    const msUntilStart = start.getTime() - now;

    // Show from 5 min before start until end_time (or short grace if no end)
    const withinPreWindow =
      msUntilStart >= 0 && msUntilStart <= windowMs;
    const afterStartBeforeEnd =
      msUntilStart < 0 &&
      (validEnd
        ? now < validEnd.getTime()
        : msUntilStart >= -15 * 60 * 1000);

    if (withinPreWindow || afterStartBeforeEnd) {
      return {
        item,
        minutesLeft: Math.max(0, Math.ceil(msUntilStart / 60000)),
        isLive: msUntilStart <= 0 || callStatus === 'in_progress',
      };
    }
  }

  return null;
}
