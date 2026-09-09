const DEFAULT_CHAT_DAYS = 3;

export type ChatAccessLike = {
  can_send?: boolean;
  can_read?: boolean;
  call_status?: string;
  appointment_status?: string;
  follow_up_active?: boolean;
  follow_up?: {
    schedule?: boolean;
    date?: string | null;
    reason?: string | null;
  };
};

export type AppointmentChatLike = {
  call_status?: string;
  appointment_status?: string;
  appointment_date?: string;
  follow_up?: {
    schedule?: boolean;
    date?: string | null;
  };
};

const startOfDay = (value: Date) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Parse YYYY-MM-DD as local calendar day to avoid UTC off-by-one. */
const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    const d = new Date(
      Number(ymd[1]),
      Number(ymd[2]) - 1,
      Number(ymd[3]),
    );
    return startOfDay(d);
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return startOfDay(d);
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? '';

const isWithinDefaultChatWindow = (
  appointmentDate?: string | null,
  fallback?: AppointmentChatLike | null,
): boolean => {
  const resolvedDate = appointmentDate ?? fallback?.appointment_date ?? null;
  const apptDay = parseDate(resolvedDate);
  if (!apptDay) {
    return false;
  }
  const cutoff = new Date(apptDay);
  cutoff.setDate(cutoff.getDate() + DEFAULT_CHAT_DAYS);
  return startOfDay(new Date()) <= cutoff;
};

/** True while follow-up date is today or in the future (inclusive). */
export const isFollowUpChatWindowOpen = (followUp?: {
  schedule?: boolean;
  date?: string | null;
} | null): boolean => {
  if (!followUp) {
    return false;
  }
  if (followUp.date) {
    const followUpDay = parseDate(followUp.date);
    if (!followUpDay) {
      return false;
    }
    return followUpDay >= startOfDay(new Date());
  }
  // Scheduled without a concrete date — keep open until API/date says otherwise
  return followUp.schedule === true;
};

const isFollowUpWindowEnded = (followUp?: {
  schedule?: boolean;
  date?: string | null;
} | null): boolean => {
  if (!followUp?.date) {
    return false;
  }
  const followUpDay = parseDate(followUp.date);
  if (!followUpDay) {
    return false;
  }
  return followUpDay < startOfDay(new Date());
};

/** Client-side rules for whether the user can send messages. */
export function isChatSendEnabled(
  access: ChatAccessLike | null | undefined,
  appointmentDate?: string | null,
  fallback?: AppointmentChatLike | null,
): boolean {
  if (!access && !fallback) {
    return false;
  }

  const mergedFollowUp = {
    schedule:
      access?.follow_up?.schedule ?? fallback?.follow_up?.schedule,
    date: access?.follow_up?.date ?? fallback?.follow_up?.date ?? null,
    reason: access?.follow_up?.reason ?? null,
  };

  const merged: ChatAccessLike = {
    call_status: access?.call_status ?? fallback?.call_status,
    appointment_status:
      access?.appointment_status ?? fallback?.appointment_status,
    follow_up_active: access?.follow_up_active,
    follow_up:
      access?.follow_up || fallback?.follow_up ? mergedFollowUp : undefined,
  };

  const callStatus = normalize(merged.call_status);
  const appointmentStatus = normalize(merged.appointment_status);
  const followUp = merged.follow_up;

  // Explicit allow from API
  if (access?.can_send === true) {
    return true;
  }

  if (callStatus === 'in_progress') {
    return true;
  }

  if (appointmentStatus === 'confirmed' || appointmentStatus === 'in_progress') {
    return true;
  }

  // Follow-up still within date window — do NOT let API can_send:false or
  // follow_up_active:false close chat early (e.g. follow-up on 12 Sep 2026).
  if (
    merged.follow_up_active === true ||
    isFollowUpChatWindowOpen(followUp)
  ) {
    return true;
  }

  const isCompleted =
    appointmentStatus === 'completed' || callStatus === 'ended';

  if (isCompleted) {
    // Follow-up was scheduled/dated but window is no longer open
    if (followUp?.date || followUp?.schedule) {
      return false;
    }
    return isWithinDefaultChatWindow(appointmentDate, fallback);
  }

  return false;
}

/** @deprecated Use isChatSendEnabled — kept for compatibility. */
export function isChatEnabled(
  access: ChatAccessLike | null | undefined,
  appointmentDate?: string | null,
  fallback?: AppointmentChatLike | null,
): boolean {
  return isChatSendEnabled(access, appointmentDate, fallback);
}

/** Chat entry is always available when an appointment exists; read history anytime. */
export function isChatVisibleForAppointment(
  appointment: AppointmentChatLike | null | undefined,
): boolean {
  return !!appointment;
}

export function getChatDisabledReason(
  access: ChatAccessLike | null | undefined,
  appointmentDate?: string | null,
  fallback?: AppointmentChatLike | null,
): string {
  if (isChatSendEnabled(access, appointmentDate, fallback)) {
    return '';
  }

  const followUp = {
    schedule:
      access?.follow_up?.schedule ?? fallback?.follow_up?.schedule,
    date: access?.follow_up?.date ?? fallback?.follow_up?.date ?? null,
  };

  if (isFollowUpWindowEnded(followUp)) {
    return 'Follow-up chat period has ended — you can still read previous messages';
  }

  if (
    access?.follow_up_active === false &&
    !isFollowUpChatWindowOpen(followUp)
  ) {
    return 'Follow-up chat is inactive — you can read previous messages but cannot send new ones';
  }

  if (followUp?.schedule && !followUp.date) {
    return 'Follow-up chat is inactive — you can read previous messages but cannot send new ones';
  }

  return `Chat closed — ${DEFAULT_CHAT_DAYS}-day consultation window has ended. You can still read previous messages`;
}

/** Hide raw API / websocket errors — only show predefined copy in the UI. */
export function shouldSuppressChatError(
  error: string | null | undefined,
  messageCount = 0,
): boolean {
  if (!error) {
    return true;
  }

  if (messageCount > 0) {
    return true;
  }

  const normalized = error.trim().toLowerCase();
  return (
    normalized.includes('connection') ||
    normalized.includes('network') ||
    normalized.includes('unauthorized') ||
    normalized.includes('forbidden') ||
    normalized.includes('request failed') ||
    normalized.includes('failed to load') ||
    normalized.includes('refresh') ||
    normalized.includes('offline') ||
    normalized.includes('not allowed')
  );
}

export { DEFAULT_CHAT_DAYS };
