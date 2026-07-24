import { Attachment, Message } from '../types/chat';

const TEMP_ID_PREFIX = 'temp-';

export function isTempMessage(message: Message): boolean {
  return Boolean(message._pending) || message.id.startsWith(TEMP_ID_PREFIX);
}

export function createOptimisticMessage(
  appointmentId: string,
  text: string,
  attachments: Attachment[] = []
): Message {
  const hasAttachments = attachments.length > 0;
  return {
    id: `${TEMP_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    appointment_id: appointmentId,
    sender_id: 'pending',
    sender_role: 'patient',
    text: text.trim(),
    attachments,
    phase: 'live',
    message_type: hasAttachments ? 'image' : 'text',
    is_seen: false,
    created_at: new Date().toISOString(),
    _pending: true,
  };
}

/** Merge an incoming server message, replacing matching optimistic patient messages. */
export function upsertIncomingMessage(
  messages: Message[],
  incoming: Message
): Message[] {
  if (incoming.sender_role === 'patient') {
    const withoutPendingPatient = messages.filter(
      (m) => !(m._pending && m.sender_role === 'patient')
    );
    if (withoutPendingPatient.some((m) => m.id === incoming.id)) {
      return withoutPendingPatient;
    }
    return [...withoutPendingPatient, incoming];
  }

  if (messages.some((m) => m.id === incoming.id)) {
    return messages;
  }
  return [...messages, incoming];
}

/** Drop all optimistic messages — used after reconnect reload. */
export function stripOptimisticMessages(messages: Message[]): Message[] {
  return messages.filter((m) => !isTempMessage(m));
}

/** Apply chat.seen payload to message list for patient viewer. */
export function applySeenReceipt(
  messages: Message[],
  messageIds: string[],
  readerRole: 'doctor' | 'patient',
  readAt: string
): Message[] {
  const idSet = new Set(messageIds);
  return messages.map((msg) => {
    if (!idSet.has(msg.id)) {
      return msg;
    }

    const updated: Message = { ...msg };

    if (readerRole === 'doctor') {
      updated.doctor_read_at = readAt;
    } else {
      updated.patient_read_at = readAt;
    }

    if (msg.sender_role === 'patient' && readerRole === 'doctor') {
      updated.is_seen = true;
      updated.seen_at = readAt;
    }

    return updated;
  });
}
