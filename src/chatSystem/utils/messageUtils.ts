import { Attachment, Message } from '../types/chat';

const TEMP_ID_PREFIX = 'temp-';
const NEAR_DUPLICATE_MS = 8000;

export function isTempMessage(message: Message): boolean {
  return Boolean(message._pending) || message.id.startsWith(TEMP_ID_PREFIX);
}

export function createOptimisticMessage(
  appointmentId: string,
  text: string,
  attachments: Attachment[] = [],
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

const attachmentKey = (attachments?: Attachment[]) =>
  (attachments || [])
    .map(a => `${a.file_type}:${a.file_url}`)
    .sort()
    .join('|');

const isNearDuplicate = (a: Message, b: Message): boolean => {
  if (a.id && b.id && a.id === b.id) return true;
  if (a.sender_role !== b.sender_role) return false;
  if ((a.text || '').trim() !== (b.text || '').trim()) return false;
  if (attachmentKey(a.attachments) !== attachmentKey(b.attachments)) return false;

  const ta = new Date(a.created_at).getTime();
  const tb = new Date(b.created_at).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return true;
  return Math.abs(ta - tb) < NEAR_DUPLICATE_MS;
};

const preferMessage = (a: Message, b: Message): Message => {
  // Prefer real server ids over temps; prefer seen/read receipts.
  const aTemp = isTempMessage(a);
  const bTemp = isTempMessage(b);
  if (aTemp && !bTemp) return b;
  if (!aTemp && bTemp) return a;
  if (a.is_seen && !b.is_seen) return a;
  if (!a.is_seen && b.is_seen) return b;
  return a;
};

/** Collapse same-text echoes created by double POST / WS+HTTP races. */
export function dedupeMessages(messages: Message[]): Message[] {
  const result: Message[] = [];

  for (const msg of messages) {
    const idx = result.findIndex(existing => isNearDuplicate(existing, msg));
    if (idx === -1) {
      result.push(msg);
      continue;
    }
    result[idx] = preferMessage(result[idx], msg);
  }

  return result.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

/** Merge an incoming server message, replacing matching optimistic patient messages. */
export function upsertIncomingMessage(
  messages: Message[],
  incoming: Message,
): Message[] {
  return dedupeMessages(appendOrReplace(messages, incoming));
}

function appendOrReplace(prevMessages: Message[], incoming: Message): Message[] {
  const exists = prevMessages.some(m => m.id === incoming.id);
  if (exists) {
    return prevMessages.map(m => (m.id === incoming.id ? incoming : m));
  }
  const withoutMatchingTemp = prevMessages.filter(m => {
    if (!m.id.startsWith(TEMP_ID_PREFIX)) return true;
    return !(
      m.sender_role === incoming.sender_role &&
      (m.text || '') === (incoming.text || '')
    );
  });
  return [...withoutMatchingTemp, incoming];
}

/** Drop all optimistic messages — used after reconnect reload. */
export function stripOptimisticMessages(messages: Message[]): Message[] {
  return messages.filter(m => !isTempMessage(m));
}

/** Apply chat.seen payload to message list for patient viewer. */
export function applySeenReceipt(
  messages: Message[],
  messageIds: string[],
  readerRole: 'doctor' | 'patient',
  readAt: string,
): Message[] {
  const idSet = new Set(messageIds);
  return messages.map(msg => {
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
