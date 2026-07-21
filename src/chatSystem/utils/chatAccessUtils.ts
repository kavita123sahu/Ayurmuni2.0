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

/** Shared chat window rules for UI + send guard. */
export function isChatEnabled(
  access: ChatAccessLike | null | undefined,
  appointmentDate?: string | null,
): boolean {
  if (!access) {
    return false;
  }

  if (typeof access.can_send === 'boolean') {
    return access.can_send;
  }

  const callStatus = normalize(access.call_status);
  const appointmentStatus = normalize(access.appointment_status);
  const today = startOfDay(new Date());

  if (callStatus === 'in_progress') {
    return true;
  }

  if (appointmentStatus === 'confirmed') {
    return true;
  }

  if (access.follow_up_active) {
    return true;
  }

  if (appointmentStatus === 'in_progress') {
    return true;
  }

  const isCompleted =
    appointmentStatus === 'completed' || callStatus === 'ended';

  if (isCompleted) {
    const followUp = access.follow_up;
    if (followUp?.schedule && followUp.date) {
      const followUpDay = parseDate(followUp.date);
      return !!followUpDay && followUpDay >= today;
    }

    const apptDay = parseDate(appointmentDate);
    if (apptDay) {
      const cutoff = new Date(apptDay);
      cutoff.setDate(cutoff.getDate() + DEFAULT_CHAT_DAYS);
      return today <= cutoff;
    }

    return false;
  }

  return false;
}

export function isChatVisibleForAppointment(
  appointment: AppointmentChatLike | null | undefined,
): boolean {
  if (!appointment) {
    return false;
  }

  return isChatEnabled(
    {
      call_status: appointment.call_status,
      appointment_status: appointment.appointment_status,
      follow_up_active: false,
      follow_up: appointment.follow_up,
    },
    appointment.appointment_date,
  );
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
