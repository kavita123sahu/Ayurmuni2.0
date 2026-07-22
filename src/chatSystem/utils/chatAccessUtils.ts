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

/** Client-side rules for whether the user can send messages. */
export function isChatSendEnabled(
  access: ChatAccessLike | null | undefined,
  appointmentDate?: string | null,
  fallback?: AppointmentChatLike | null,
): boolean {
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
  const resolvedDate = appointmentDate ?? fallback?.appointment_date ?? null;

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
    if (followUp?.schedule && followUp.date) {
      const followUpDay = parseDate(followUp.date);
      return !!followUpDay && followUpDay >= today;
    }

    const apptDay = parseDate(resolvedDate);
    if (apptDay) {
      const cutoff = new Date(apptDay);
      cutoff.setDate(cutoff.getDate() + DEFAULT_CHAT_DAYS);
      return today <= cutoff;
    }

    return false;
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
): string {
  if (isChatEnabled(access, appointmentDate)) {
    return '';
  }

  const followUp = access?.follow_up;
  if (followUp?.schedule && followUp.date) {
    return 'Follow-up chat period has ended';
  }

  return 'Chat closed — consultation completed';
}

export { DEFAULT_CHAT_DAYS };
