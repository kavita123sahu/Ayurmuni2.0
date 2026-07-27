
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { chatService } from '../services/chatService';
import { WebSocketService } from '../services/websocketService';
import { Message, ChatState, SendMessagePayload, WebSocketMessage, Attachment, ChatApiError } from '../types/chat';
import { Utils } from '../../common/Utils';
import { isChatSendEnabled, getChatDisabledReason, AppointmentChatLike, shouldSuppressChatError } from '../utils/chatAccessUtils';

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
  const mountedRef = useRef<boolean>(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const loadMessagesRef = useRef<((markRead?: boolean | string) => Promise<void>) | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // ✅ Load messages — sirf pehli baar full loading dikhao, uske baad silently refresh
  const loadMessages = useCallback(
    async (markRead?: boolean | string): Promise<void> => {
      if (!mountedRef.current) return;

      const isFirstLoad = !hasLoadedOnceRef.current;
      if (isFirstLoad) {
        setState((prev) => ({ ...prev, isLoading: true }));
      }
      try {
        const data = await chatService.getMessages(appointmentId, markRead);
        if (mountedRef.current) {
          hasLoadedOnceRef.current = true;
          setState((prev) => {
            const incoming = data.messages ?? [];
            const keepExisting =
              incoming.length === 0 &&
              !!data.sendBlocked &&
              prev.messages.length > 0;

            return {
              ...prev,
              messages: keepExisting ? prev.messages : incoming,
              chatAccess: data.chat_access ?? prev.chatAccess,
              followUpActive: data.chat_access?.follow_up_active ?? prev.followUpActive,
              activePhase: data.chat_access?.active_phase ?? prev.activePhase,
              isLoading: false,
              error: null,
            };
          });
        }
      } catch (error: unknown) {
        if (mountedRef.current) {
          hasLoadedOnceRef.current = true;
          const apiError = error as ChatApiError;
          const isSendBlocked = apiError.httpStatus === 403;

          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
            chatAccess: isSendBlocked
              ? {
                  ...(prev.chatAccess ?? {}),
                  can_send: false,
                  can_read: true,
                } as ChatState['chatAccess']
              : prev.chatAccess,
          }));
        }
      }
    },
    [appointmentId]
  );

  // Always fetch history first — independent of WebSocket.
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

  // ✅ Error ko auto-clear karo taaki toast hamesha ke liye atka na rahe
  const showTransientError = useCallback((message: string) => {
    if (!mountedRef.current || shouldSuppressChatError(message)) {
      return;
    }
    setState((prev) => ({ ...prev, error: message }));
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, error: null }));
      }
    }, 4000);
  }, []);

  // ✅ Send message — attachments HAMESHA HTTP se jaate hain (WS sirf text handle karta hai)
  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]): Promise<void> => {
      const trimmedText = (text || '').trim();
      const hasAttachments = !!attachments && attachments.length > 0;

      if (!trimmedText && !hasAttachments) return;

      if (!isChatSendEnabled(
        chatAccessRef.current,
        appointmentDateRef.current ?? undefined,
        appointmentContextRef.current ?? undefined,
      )) {
        showTransientError(getChatDisabledReason(
          chatAccessRef.current,
          appointmentDateRef.current ?? undefined,
          appointmentContextRef.current ?? undefined,
        ));
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        appointment_id: appointmentId,
        sender_id: 'me',
        sender_role: role,
        text: trimmedText,
        attachments: attachments || [],
        phase: 'live',
        message_type: hasAttachments ? (attachments![0].file_type as any) : 'text',
        is_seen: false,
        created_at: new Date().toISOString(),
      };

      // Optimistic UI — turant dikhao
      setState((prev) => ({ ...prev, messages: [...prev.messages, tempMessage] }));

      // Sirf pure-text message hi WS se try karo
      if (!hasAttachments && wsRef.current?.isConnected() && trimmedText) {
        const sent = wsRef.current.sendMessage(trimmedText);
        if (sent) return; // real confirmation 'message' event se aayega (dedupe wahan)
      }

      // Attachment ya WS-fail case — HTTP se bhejo
      try {
        const payload: SendMessagePayload = {};
        if (trimmedText) payload.text = trimmedText;
        if (hasAttachments) payload.attachments = attachments;

        const result = await chatService.sendMessage(appointmentId, payload);

        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === tempId ? (result?.message ?? { ...m, id: `sent-${Date.now()}` }) : m
          ),
        }));
      } catch (error: unknown) {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== tempId),
        }));
        const apiError = error as ChatApiError;
        if (apiError.httpStatus === 403) {
          setState((prev) => ({
            ...prev,
            chatAccess: prev.chatAccess
              ? { ...prev.chatAccess, can_send: false }
              : ({ can_send: false, can_read: true } as ChatState['chatAccess']),
          }));
          showTransientError(getChatDisabledReason(
            chatAccessRef.current,
            appointmentDateRef.current ?? undefined,
            appointmentContextRef.current ?? undefined,
          ));
          return;
        }
        showTransientError('Unable to send message. Please try again.');
      }
    },
    [appointmentId, role, showTransientError]
  );

  // ✅ Mark as read — koi reload nahi, sirf WS ping ya silent HTTP
  const markAsRead = useCallback(
    async (messageIds?: string[]): Promise<void> => {
      if (!messageIds || messageIds.length === 0) return;
      if (wsRef.current?.isConnected()) {
        wsRef.current.sendRead(messageIds);
      } else {
        try {
          await chatService.getMessages(appointmentId, messageIds.join(','));
        } catch {
          // silent fail — read receipt critical nahi hai
        }
      }
    },
    [appointmentId]
  );

  useEffect(() => {
    const canSend = isChatSendEnabled(
      chatAccessRef.current,
      appointmentDateRef.current ?? undefined,
      appointmentContextRef.current ?? undefined,
    );

    if (!canSend) {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, isConnected: false }));
      }
      return;
    }

    const setupWebSocket = async (): Promise<void> => {
      try {
        const token = await Utils.getData('_TOKEN');
        if (!token || !appointmentId || !mountedRef.current) return;

        if (wsRef.current) {
          return;
        }

        const ws = new WebSocketService(
          appointmentId,
          token,
          () => {
            if (mountedRef.current) {
              setState((prev) => ({ ...prev, isConnected: true, error: null }));
            }
          },
          () => {
            if (mountedRef.current) {
              setState((prev) => ({ ...prev, isConnected: false }));
            }
          }
        );

        ws.on('message', (data: WebSocketMessage) => {
          if (data.message && mountedRef.current) {
            const incoming = data.message;
            setState((prev) => {
              const exists = prev.messages.some((m) => m.id === incoming.id);
              if (exists) return prev;
              const withoutMatchingTemp = prev.messages.filter((m) => {
                if (!m.id.startsWith('temp-')) return true;
                const sameSender = m.sender_role === incoming.sender_role;
                const sameText = (m.text || '') === (incoming.text || '');
                return !(sameSender && sameText);
              });
              return { ...prev, messages: [...withoutMatchingTemp, incoming] };
            });
          }
        });

        ws.on('read', (data) => {
          if (data.message_ids && mountedRef.current) {
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                data.message_ids!.includes(msg.id)
                  ? { ...msg, is_seen: true, seen_at: new Date().toISOString() }
                  : msg
              ),
            }));
          }
        });

        ws.on('error', () => {
          // Doctor offline / WS unavailable — history still loads via HTTP; no user-facing error.
        });

        ws.connect();
        wsRef.current = ws;
      } catch (error) {
        console.error('❌ Setup error:', error);
      }
    };

    setupWebSocket();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const isComingToForeground =
        appStateRef.current.match(/inactive|background/) && nextAppState === 'active';

      if (isComingToForeground) {
        loadMessagesRef.current?.();
        if (wsRef.current && !wsRef.current.isConnected()) {
          wsRef.current.connect();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      subscription.remove();
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [
    appointmentId,
    appointmentDate,
    appointmentContext,
    state.chatAccess,
    showTransientError,
  ]);

  return {
    ...state,
    loadMessages,
    sendMessage,
    markAsRead,
    isConnected: state.isConnected,
    isChatEnabled: isChatEnabledFlag,
  };
}