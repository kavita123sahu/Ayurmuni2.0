import { ChatMessage } from '../types/chat';
import { isSameDay } from './dateUtils';

export type ChatListItem =
  | { type: 'date'; id: string; date: string }
  | { type: 'message'; id: string; message: ChatMessage };

/** Sort ascending by created_at (oldest first — newest at bottom of the list). */
export function sortMessagesAsc(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

/**
 * Merges a new/updated batch of messages into an existing list, de-duping by
 * id or client_id (so optimistic messages get replaced by their server
 * counterpart instead of appearing twice).
 */
export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  existing.forEach((m) => map.set(m.client_id, m));
  incoming.forEach((m) => map.set(m.client_id, { ...map.get(m.client_id), ...m }));
  return sortMessagesAsc(Array.from(map.values()));
}

/** Reconciles an optimistic message with the server's acknowledged version. */
export function reconcileMessage(
  messages: ChatMessage[],
  clientId: string,
  serverMessage: ChatMessage,
): ChatMessage[] {
  return messages.map((m) =>
    m.client_id === clientId ? { ...serverMessage, client_id: clientId } : m,
  );
}

/** Builds a FlatList-ready array interleaving date separators between messages. */
export function buildChatListItems(messages: ChatMessage[]): ChatListItem[] {
  const items: ChatListItem[] = [];
  let lastDate: string | null = null;

  for (const message of messages) {
    if (!lastDate || !isSameDay(lastDate, message.created_at)) {
      items.push({ type: 'date', id: `date_${message.created_at}`, date: message.created_at });
      lastDate = message.created_at;
    }
    items.push({ type: 'message', id: message.client_id, message });
  }
  return items;
}
