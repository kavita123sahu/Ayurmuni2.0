import { API_BASE } from './api';
import { Message, SendMessagePayload, MessagesResponse, ChatAccess, ChatApiError } from '../types/chat';
import { Utils } from '../../common/Utils';
import { parseApiError } from '../utils/apiError';

const MESSAGE_KEYS = ['messages', 'results', 'items', 'message_list', 'history'] as const;

const looksLikeMessage = (value: unknown): value is Message =>
  !!value &&
  typeof value === 'object' &&
  ('id' in value || 'text' in value || 'sender_role' in value);

const findMessagesInPayload = (value: unknown, depth = 0): Message[] | null => {
  if (!value || typeof value !== 'object' || depth > 5) {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of MESSAGE_KEYS) {
    const candidate = record[key];
    if (!Array.isArray(candidate)) {
      continue;
    }
    if (candidate.length === 0 || looksLikeMessage(candidate[0])) {
      return candidate as Message[];
    }
  }

  if (record.data) {
    return findMessagesInPayload(record.data, depth + 1);
  }

  return null;
};

const findChatAccessInPayload = (value: unknown, depth = 0): ChatAccess | null => {
  if (!value || typeof value !== 'object' || depth > 5) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record.chat_access && typeof record.chat_access === 'object') {
    return record.chat_access as ChatAccess;
  }

  if (record.data) {
    return findChatAccessInPayload(record.data, depth + 1);
  }

  return null;
};

const normalizeMessagesResponse = (
  body: unknown,
  sendBlocked = false,
): MessagesResponse => {
  const messages = findMessagesInPayload(body) ?? [];
  const chatAccess = findChatAccessInPayload(body);

  return {
    messages,
    chat_access: chatAccess,
    sendBlocked,
  };
};

export const chatService = {
  /** Always fetch full history — never throws on 403 when read is allowed. */
  getMessages: async (
    appointmentId: string,
    markRead?: boolean | string | 'all',
  ): Promise<MessagesResponse> => {
    const token = await Utils.getData('_TOKEN');
    let url = `${API_BASE}/communication/appointments/${appointmentId}/messages/`;
    if (markRead !== undefined) {
      const value = markRead === true ? 'true' : markRead;
      url += `?mark_read=${value}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    let body: unknown = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (response.ok) {
      return normalizeMessagesResponse(body, false);
    }

    if (response.status === 403) {
      const partial = normalizeMessagesResponse(body, true);

      if (partial.messages.length > 0 || partial.chat_access) {
        return {
          ...partial,
          chat_access: partial.chat_access
            ? {
                ...partial.chat_access,
                can_send: false,
                can_read: partial.chat_access.can_read ?? true,
              }
            : ({ can_send: false, can_read: true } as ChatAccess),
          sendBlocked: true,
        };
      }

      // mark_read can fail on closed chat — retry plain history fetch.
      if (markRead !== undefined) {
        return chatService.getMessages(appointmentId);
      }

      return {
        messages: [],
        chat_access: { can_send: false, can_read: true } as ChatAccess,
        sendBlocked: true,
      };
    }

    const record =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : {};
    const message =
      (typeof record.message === 'string' && record.message) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message) as ChatApiError;
    error.httpStatus = response.status;
    error.code = typeof record.code === 'string' ? record.code : undefined;
    throw error;
  },

  sendMessage: async (
    appointmentId: string,
    payload: SendMessagePayload,
  ): Promise<{ message: Message }> => {
    const token = await Utils.getData('_TOKEN');
    const response = await fetch(
      `${API_BASE}/communication/appointments/${appointmentId}/messages/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const data = await response.json();
    return data.data;
  },

  uploadAttachment: async (
    fileUri: string,
    fileName: string,
    dir: string = 'consultation-chat',
  ): Promise<string> => {
    const token = await Utils.getData('_TOKEN');
    const formData = new FormData();

    const file = {
      uri: fileUri,
      type: getMimeType(fileName),
      name: fileName,
    };

    formData.append('image', file as any);
    formData.append('dir', dir);

    const response = await fetch(`${API_BASE}/user/upload/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data.url;
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await fetch(`${API_BASE}/user/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    const data = await response.json();
    return data;
  },
};

const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};
