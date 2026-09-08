
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { chatService } from '../services/chatService';
import { WebSocketService } from '../services/websocketService';
import {
  Message,
  ChatState,
  SendMessagePayload,
  WebSocketMessage,
  Attachment,
  ChatApiError,
} from '../types/chat';
import { Utils } from '../../common/Utils';
import {
  isChatSendEnabled,
  getChatDisabledReason,
  AppointmentChatLike,
  shouldSuppressChatError,
} from '../utils/chatAccessUtils';
import { dedupeMessages } from '../utils/messageUtils';

const POLL_INTERVAL_MS = 12_000;
/** Drop identical outbound texts within this window (double tap / double invoke). */
const SEND_DEDUPE_MS = 5000;

type RecentSend = { key: string; at: number };
let recentOutboundSend: RecentSend | null = null;
/** Global sync lock — blocks a second sendMessage enter before any await. */
let sendEnterLocked = false;

export function useChat(
  appointmentId: string,
  role: 'doctor' | 'patient',
  appointmentDate?: string | null,
  appointmentContext?: AppointmentChatLike | null,
) {
  const [state, setState] = useState<ChatState>({
    appointmentId,
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    participantRole: role,
    chatAccess: null,
    followUpActive: false,
    activePhase: 'live',
  });

  const wsRef = useRef<WebSocketService | null>(null);
  const mountedRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const loadMessagesRef = useRef<((markRead?: boolean | string) => Promise<void>) | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Prevents overlapping sends (double tap / enter+button). */
  const sendingLockRef = useRef(false);
  const chatAccessRef = useRef(state.chatAccess);
  chatAccessRef.current = state.chatAccess;
  const appointmentDateRef = useRef(appointmentDate);
  appointmentDateRef.current = appointmentDate;
  const appointmentContextRef = useRef(appointmentContext);
  appointmentContextRef.current = appointmentContext;

  const isChatEnabledFlag = isChatSendEnabled(
    state.chatAccess,
    appointmentDate,
    appointmentContext,
  );

  const appendOrReplaceMessage = useCallback(
    (prevMessages: Message[], incoming: Message): Message[] => {
      const exists = prevMessages.some(m => m.id === incoming.id);
      let next: Message[];
      if (exists) {
        next = prevMessages.map(m => (m.id === incoming.id ? incoming : m));
      } else {
        const withoutMatchingTemp = prevMessages.filter(m => {
          if (!m.id.startsWith('temp-')) return true;
          return !(
            m.sender_role === incoming.sender_role &&
            (m.text || '') === (incoming.text || '')
          );
        });
        next = [...withoutMatchingTemp, incoming];
      }
      return dedupeMessages(next);
    },
    [],
  );

  const loadMessages = useCallback(
    async (markRead?: boolean | string): Promise<void> => {
      if (!mountedRef.current) return;

      const isFirstLoad = !hasLoadedOnceRef.current;
      if (isFirstLoad) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      try {
        const data = await chatService.getMessages(appointmentId, markRead);
        if (!mountedRef.current) return;
        hasLoadedOnceRef.current = true;
        setState(prev => {
          const incoming = data.messages ?? [];
          const keepExisting =
            incoming.length === 0 &&
            !!data.sendBlocked &&
            prev.messages.length > 0;

          let nextMessages = keepExisting ? prev.messages : incoming;
          if (!keepExisting && prev.messages.some(m => m.id.startsWith('temp-'))) {
            // Preserve temps until server echoes them
            const temps = prev.messages.filter(m => m.id.startsWith('temp-'));
            const server = incoming;
            nextMessages = [...server];
            temps.forEach(temp => {
              const matched = server.some(
                s =>
                  s.sender_role === temp.sender_role &&
                  (s.text || '') === (temp.text || ''),
              );
              if (!matched) nextMessages.push(temp);
            });
          }

          return {
            ...prev,
            messages: dedupeMessages(nextMessages),
            chatAccess: data.chat_access ?? prev.chatAccess,
            followUpActive:
              data.chat_access?.follow_up_active ?? prev.followUpActive,
            activePhase: data.chat_access?.active_phase ?? prev.activePhase,
            isLoading: false,
            // HTTP path works — treat chat as connected so UI never sticks on Connecting
            isConnected: true,
            error: null,
          };
        });
      } catch (error: unknown) {
        if (!mountedRef.current) return;
        hasLoadedOnceRef.current = true;
        const apiError = error as ChatApiError;
        const isSendBlocked = apiError.httpStatus === 403;
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          chatAccess: isSendBlocked
            ? ({
                ...(prev.chatAccess ?? {}),
                can_send: false,
                can_read: true,
              } as ChatState['chatAccess'])
            : prev.chatAccess,
        }));
      }
    },
    [appointmentId],
  );

  useEffect(() => {
    mountedRef.current = true;
    loadMessages();
    return () => {
      mountedRef.current = false;
    };
  }, [appointmentId, loadMessages]);

  useEffect(() => {
    loadMessagesRef.current = loadMessages;
  }, [loadMessages]);

  // HTTP poll so peer messages arrive even if WS receive fails
  useEffect(() => {
    const id = setInterval(() => {
      if (!mountedRef.current) return;
      if (appStateRef.current !== 'active') return;
      loadMessagesRef.current?.();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [appointmentId]);

  const showTransientError = useCallback((message: string) => {
    if (!mountedRef.current || shouldSuppressChatError(message)) return;
    setState(prev => ({ ...prev, error: message }));
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, error: null }));
      }
    }, 4000);
  }, []);

  const sendViaHttp = useCallback(
    async (
      tempId: string,
      trimmedText: string,
      attachments?: Attachment[],
    ) => {
      const hasAttachments = !!attachments && attachments.length > 0;
      const payload: SendMessagePayload = {};
      if (trimmedText) payload.text = trimmedText;
      if (hasAttachments) payload.attachments = attachments;

      const result = await chatService.sendMessage(appointmentId, payload);
      if (!mountedRef.current) return;

      const raw = result as unknown as Record<string, unknown> | null;
      const nested =
        raw && typeof raw === 'object' && raw.message && typeof raw.message === 'object'
          ? (raw.message as Message)
          : null;
      const flat =
        raw && typeof raw === 'object' && ('id' in raw || 'text' in raw) && !nested
          ? (raw as unknown as Message)
          : null;
      const serverMessage = nested || flat;

      setState(prev => ({
        ...prev,
        messages: dedupeMessages(
          prev.messages.map(m =>
            m.id === tempId
              ? serverMessage
                ? { ...serverMessage, _pending: false }
                : { ...m, _pending: false }
              : m,
          ),
        ),
      }));
    },
    [appointmentId],
  );

  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]): Promise<void> => {
      const trimmedText = (text || '').trim();
      const hasAttachments = !!attachments && attachments.length > 0;
      if (!trimmedText && !hasAttachments) return;

      // Sync gate first — before any await / state update
      if (sendEnterLocked || sendingLockRef.current) return;

      const dedupeKey = `${appointmentId}|${role}|${trimmedText}|${
        hasAttachments
          ? attachments!.map(a => a.file_url).join(',')
          : ''
      }`;
      const now = Date.now();
      if (
        recentOutboundSend &&
        recentOutboundSend.key === dedupeKey &&
        now - recentOutboundSend.at < SEND_DEDUPE_MS
      ) {
        return;
      }

      if (
        !isChatSendEnabled(
          chatAccessRef.current,
          appointmentDateRef.current ?? undefined,
          appointmentContextRef.current ?? undefined,
        )
      ) {
        showTransientError(
          getChatDisabledReason(
            chatAccessRef.current,
            appointmentDateRef.current ?? undefined,
            appointmentContextRef.current ?? undefined,
          ),
        );
        return;
      }

      sendEnterLocked = true;
      sendingLockRef.current = true;
      recentOutboundSend = { key: dedupeKey, at: now };

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const tempMessage: Message = {
        id: tempId,
        appointment_id: appointmentId,
        sender_id: 'me',
        sender_role: role,
        text: trimmedText,
        attachments: attachments || [],
        phase: 'live',
        message_type: hasAttachments
          ? (attachments![0].file_type as any)
          : 'text',
        is_seen: false,
        created_at: new Date().toISOString(),
        _pending: true,
      };

      setState(prev => ({
        ...prev,
        messages: dedupeMessages([...prev.messages, tempMessage]),
      }));

      // One HTTP POST only — never WebSocket chat.send
      try {
        await sendViaHttp(tempId, trimmedText, attachments);
        // Single delayed refresh (no burst) — avoids races that re-echo the send
        setTimeout(() => loadMessagesRef.current?.(), 800);
      } catch (error: unknown) {
        const apiError = error as ChatApiError;

        if (apiError.code === 'DUPLICATE_SEND') {
          setState(prev => ({
            ...prev,
            messages: prev.messages.filter(m => m.id !== tempId),
          }));
          return;
        }

        if (recentOutboundSend?.key === dedupeKey) {
          recentOutboundSend = null;
        }
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== tempId),
        }));
        if (apiError.httpStatus === 403) {
          setState(prev => ({
            ...prev,
            chatAccess: prev.chatAccess
              ? { ...prev.chatAccess, can_send: false }
              : ({ can_send: false, can_read: true } as ChatState['chatAccess']),
          }));
          showTransientError(
            getChatDisabledReason(
              chatAccessRef.current,
              appointmentDateRef.current ?? undefined,
              appointmentContextRef.current ?? undefined,
            ),
          );
          return;
        }
        showTransientError('Unable to send message. Please try again.');
      } finally {
        sendingLockRef.current = false;
        sendEnterLocked = false;
      }
    },
    [appointmentId, role, showTransientError, sendViaHttp],
  );

  const markAsRead = useCallback(
    async (messageIds?: string[]): Promise<void> => {
      if (!messageIds || messageIds.length === 0) return;
      if (wsRef.current?.isConnected()) {
        wsRef.current.sendRead(messageIds);
      } else {
        try {
          await chatService.getMessages(appointmentId, messageIds.join(','));
        } catch {
          // silent
        }
      }
    },
    [appointmentId],
  );

  const attachSocketHandlers = useCallback(
    (ws: WebSocketService) => {
      ws.on('connected', () => {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isConnected: true, error: null }));
        }
      });

      ws.on('message', (data: WebSocketMessage) => {
        if (!data.message || !mountedRef.current) return;
        const incoming = data.message;
        setState(prev => ({
          ...prev,
          messages: appendOrReplaceMessage(prev.messages, incoming),
        }));
      });

      ws.on('read', data => {
        if (!data.message_ids || !mountedRef.current) return;
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            data.message_ids!.includes(msg.id)
              ? { ...msg, is_seen: true, seen_at: new Date().toISOString() }
              : msg,
          ),
        }));
      });

      ws.on('error', () => {
        // HTTP poll covers gaps
      });
    },
    [appendOrReplaceMessage],
  );

  const readAccessToken = useCallback(async () => {
    const tokenRaw = await Utils.getData('_TOKEN');
    if (!tokenRaw) return null;
    return String(tokenRaw).replace(/^Bearer\s+/i, '');
  }, []);

  const ensureSocket = useCallback(async () => {
    if (!mountedRef.current || !appointmentId) return;
    if (wsRef.current?.isConnected()) {
      setState(prev => ({ ...prev, isConnected: true }));
      return;
    }

    const token = await readAccessToken();
    if (!token || !mountedRef.current) return;

    if (wsRef.current) {
      wsRef.current.updateToken(token);
      await wsRef.current.connect();
      return;
    }

    const ws = new WebSocketService(
      appointmentId,
      token,
      () => {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isConnected: true, error: null }));
          loadMessagesRef.current?.();
        }
      },
      () => {
        // Keep isConnected true — HTTP + polling still deliver messages.
        // Only realtime WS dropped.
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isConnected: true }));
        }
      },
      readAccessToken,
    );
    attachSocketHandlers(ws);
    await ws.connect();
    wsRef.current = ws;
  }, [appointmentId, attachSocketHandlers, readAccessToken]);

  // Stable WS lifecycle — do not depend on chatAccess object identity
  useEffect(() => {
    ensureSocket();

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        const isComingToForeground =
          !!appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active';

        if (isComingToForeground) {
          loadMessagesRef.current?.();
          ensureSocket();
        }
        appStateRef.current = nextAppState;
      },
    );

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      subscription.remove();
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [appointmentId, ensureSocket]);

  return {
    ...state,
    loadMessages,
    sendMessage,
    markAsRead,
    isConnected: state.isConnected,
    isChatEnabled: isChatEnabledFlag,
  };
}
