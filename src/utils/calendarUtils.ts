import { Linking, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { showSuccessToast } from '../config/Key';

export type CalendarEventInput = {
  title: string;
  description?: string;
  location?: string;
  /** ISO date or parseable date string */
  date: string;
  /** e.g. 10:30 AM / 10:30 / 10:30:00 */
  startTime?: string;
  endTime?: string;
  /** Duration minutes when end time missing (default 30) */
  durationMinutes?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** UTC stamp for Google / ICS: 20260805T050000Z */
const toUtcStamp = (date: Date) => {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
};

/** Local stamp for ICS floating: 20260805T103000 */
const toLocalStamp = (date: Date) => {
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

export const parseAppointmentDateTime = (
  dateStr?: string,
  timeStr?: string,
): Date | null => {
  if (!dateStr) return null;

  const base = new Date(dateStr);
  if (Number.isNaN(base.getTime())) return null;

  if (!timeStr) {
    base.setHours(9, 0, 0, 0);
    return base;
  }

  const match = String(timeStr).match(
    /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i,
  );
  if (!match) return base;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[4]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  base.setHours(hours, minutes, 0, 0);
  return base;
};

export const buildCalendarEventTimes = (input: CalendarEventInput) => {
  const start =
    parseAppointmentDateTime(input.date, input.startTime) || new Date();
  let end = parseAppointmentDateTime(input.date, input.endTime);

  if (!end || end.getTime() <= start.getTime()) {
    end = new Date(
      start.getTime() + (input.durationMinutes || 30) * 60 * 1000,
    );
  }

  return { start, end };
};

const escapeIcsText = (value?: string) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

export const buildIcsContent = (input: CalendarEventInput) => {
  const { start, end } = buildCalendarEventTimes(input);
  const uid = `ayurmuni-${Date.now()}@ayurmuni.app`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ayurmuni//Appointment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toLocalStamp(start)}`,
    `DTEND:${toLocalStamp(end)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
    `DESCRIPTION:${escapeIcsText(input.description)}`,
    `LOCATION:${escapeIcsText(input.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

export const buildGoogleCalendarUrl = (input: CalendarEventInput) => {
  const { start, end } = buildCalendarEventTimes(input);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title || 'Appointment',
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: input.description || '',
    location: input.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const buildOutlookCalendarUrl = (input: CalendarEventInput) => {
  const { start, end } = buildCalendarEventTimes(input);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: input.title || 'Appointment',
    body: input.description || '',
    location: input.location || '',
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const openGoogleCalendar = async (input: CalendarEventInput) => {
  const url = buildGoogleCalendarUrl(input);
  const can = await Linking.canOpenURL(url);
  if (!can) {
    showSuccessToast('Unable to open Google Calendar', 'error');
    return false;
  }
  await Linking.openURL(url);
  return true;
};

export const openOutlookCalendar = async (input: CalendarEventInput) => {
  const url = buildOutlookCalendarUrl(input);
  const can = await Linking.canOpenURL(url);
  if (!can) {
    showSuccessToast('Unable to open Outlook Calendar', 'error');
    return false;
  }
  await Linking.openURL(url);
  return true;
};

/** Write .ics and open share sheet so user can add to any calendar app. */
export const shareCalendarInvite = async (input: CalendarEventInput) => {
  try {
    const content = buildIcsContent(input);
    const fileName = `ayurmuni-appointment-${Date.now()}.ics`;
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await RNFS.writeFile(path, content, 'utf8');

    const fileUrl = Platform.OS === 'android' ? `file://${path}` : path;

    await Share.open({
      title: 'Add to Calendar',
      url: fileUrl,
      type: 'text/calendar',
      failOnCancel: false,
      filename: fileName,
    });

    showSuccessToast('Calendar invite ready', 'success');
    return true;
  } catch (error) {
    console.log('shareCalendarInvite error', error);
    showSuccessToast('Unable to create calendar invite', 'error');
    return false;
  }
};

export const buildAppointmentCalendarEvent = (detail: {
  doctorName?: string;
  specialization?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  concern?: string;
  hospitalName?: string;
  bookingId?: string;
}): CalendarEventInput => {
  const doctor = detail.doctorName || 'Doctor';
  const lines = [
    `Consultation with ${doctor}`,
    detail.specialization ? `Speciality: ${detail.specialization}` : '',
    detail.concern ? `Concern: ${detail.concern}` : '',
    detail.bookingId ? `Booking ID: ${detail.bookingId}` : '',
    'Booked via Ayurmuni',
  ].filter(Boolean);

  return {
    title: `Ayurmuni · ${doctor}`,
    description: lines.join('\n'),
    location: detail.hospitalName || 'Ayurmuni Video Consultation',
    date: detail.date || '',
    startTime: detail.startTime,
    endTime: detail.endTime,
    durationMinutes: 30,
  };
};
