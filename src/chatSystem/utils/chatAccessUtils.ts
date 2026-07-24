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

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const d = new Date(value);
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

/** Client-side rules for whether the user can send messages. */
export function isChatSendEnabled(
  access: ChatAccessLike | null | undefined,
  appointmentDate?: string | null,
  fallback?: AppointmentChatLike | null,
): boolean {
  if (access && typeof access.can_send === 'boolean') {
    return access.can_send;
  }

  const merged: ChatAccessLike = {
    call_status: access?.call_status ?? fallback?.call_status,
    appointment_status: access?.appointment_status ?? fallback?.appointment_status,
    follow_up_active: access?.follow_up_active,
    follow_up: access?.follow_up ?? fallback?.follow_up,
  };

  if (!access && !fallback) {
    return false;
  }

  const callStatus = normalize(merged.call_status);
  const appointmentStatus = normalize(merged.appointment_status);
  const today = startOfDay(new Date());

  if (callStatus === 'in_progress') {
    return true;
  }

  if (appointmentStatus === 'confirmed') {
    return true;
  }

  if (merged.follow_up_active) {
    return true;
  }

  if (appointmentStatus === 'in_progress') {
    return true;
  }

  const isCompleted =
    appointmentStatus === 'completed' || callStatus === 'ended';

  if (isCompleted) {
    const followUp = merged.follow_up;

    if (access?.follow_up_active === false && followUp?.schedule) {
      return false;
    }

    if (followUp?.schedule && followUp.date) {
      const followUpDay = parseDate(followUp.date);
      return !!followUpDay && followUpDay >= today;
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

  if (access?.follow_up_active === false) {
    return 'Follow-up chat is inactive — you can read previous messages but cannot send new ones';
  }

  const followUp = access?.follow_up ?? fallback?.follow_up;
  if (followUp?.schedule && followUp.date) {
    return 'Follow-up chat period has ended — you can still read previous messages';
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
