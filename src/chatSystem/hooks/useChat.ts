// import { useState, useEffect, useRef, useCallback } from 'react';
// import { AppState, AppStateStatus } from 'react-native';
// import { chatService } from '../services/chatService';
// import { WebSocketService } from '../services/websocketService';
// import { Message, ChatState, SendMessagePayload, WebSocketMessage, Attachment } from '../types/chat';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Utils } from '../../common/Utils';

// export function useChat(appointmentId: string, role: 'doctor' | 'patient') {
//   const [state, setState] = useState<ChatState>({
//     appointmentId,
//     messages: [],
//     isLoading: true,
//     isConnected: false,
//     error: null,
//     participantRole: role,
//     chatAccess: null,
//     followUpActive: false,
//     activePhase: 'live',
//   });

//   console.log('📝useChatinitialized:', { appointmentId, role, state });
//   const wsRef = useRef<WebSocketService | null>(null);
//   const mountedRef = useRef<boolean>(true);
//   const appStateRef = useRef<AppStateStatus>(AppState.currentState);
//   const loadMessagesRef = useRef<((markRead?: boolean | string) => Promise<void>) | null>(null);

//   // ✅ Load messages
//   const loadMessages = useCallback(
//     async (markRead?: boolean | string): Promise<void> => {
//       if (!mountedRef.current) return;

//       console.log('📥 Loading messages...');
//       setState((prev) => ({ ...prev, isLoading: true }));
//       try {
//         const data = await chatService.getMessages(appointmentId, markRead);
//         if (mountedRef.current) {
//           console.log('📥 Messages loaded:', data.messages?.length || 0);
//           setState((prev) => ({
//             ...prev,
//             messages: data.messages || [],
//             chatAccess: data.chat_access || null,
//             followUpActive: data.chat_access?.follow_up_active || false,
//             activePhase: data.chat_access?.active_phase || 'live',
//             isLoading: false,
//             error: null,
//           }));
//         }
//       } catch (error: any) {
//         console.error('❌ Load messages error:', error);
//         if (mountedRef.current) {
//           setState((prev) => ({
//             ...prev,
//             isLoading: false,
//             error: error.message || 'Failed to load messages',
//           }));
//         }
//       }
//     },
//     [appointmentId]
//   );

//   useEffect(() => {
//     loadMessagesRef.current = loadMessages;
//   }, [loadMessages]);

//   // ✅ Send message
//   const sendMessage = useCallback(
//     async (text: string, attachments?: Attachment[]): Promise<void> => {
//       console.log('📤 sendMessage called:', { text, attachments });

//       // Try WebSocket first
//       if (wsRef.current?.isConnected()) {
//         const sent = wsRef.current.sendMessage(text);
//         if (sent) {
//           // Optimistic update
//           const tempMessage: Message = {
//             id: `temp-${Date.now()}`,
//             appointment_id: appointmentId,
//             sender_id: 'me',
//             sender_role: role,
//             text: text,
//             attachments: attachments || [],
//             phase: 'live',
//             message_type: 'text',
//             is_seen: false,
//             created_at: new Date().toISOString(),
//           };
//           setState((prev) => ({
//             ...prev,
//             messages: [...prev.messages, tempMessage],
//           }));
//           console.log('📤 Message sent via WebSocket');
//           return;
//         }
//       }

//       // Fallback to HTTP
//       console.log('📤 Sending via HTTP fallback');
//       try {
//         const payload: SendMessagePayload = { text };
//         if (attachments && attachments.length > 0) {
//           payload.attachments = attachments;
//         }
//         await chatService.sendMessage(appointmentId, payload);
//         await loadMessages();
//       } catch (error: any) {
//         console.error('❌ Send error:', error);
//         setState((prev) => ({
//           ...prev,
//           error: error.message || 'Failed to send message',
//         }));
//       }
//     },
//     [appointmentId, role, loadMessages]
//   );

//   // ✅ Mark as read
//   const markAsRead = useCallback(
//     async (messageIds?: string[]): Promise<void> => {
//       console.log('📖 Marking as read:', messageIds);
//       if (wsRef.current?.isConnected()) {
//         wsRef.current.sendRead(messageIds);
//       }
//       if (messageIds && messageIds.length > 0) {
//         await loadMessages(messageIds.join(','));
//       } else {
//         await loadMessages('all');
//       }
//     },
//     [loadMessages]
//   );

//   // ✅ Setup WebSocket
//   useEffect(() => {
//     mountedRef.current = true;

//     const setupWebSocket = async (): Promise<void> => {
//       try {
//         // const token = await AsyncStorage.getItem('access_token');
//         const token = await Utils.getData('_TOKEN');
//         console.log('🔐 Token found:', token);
//         if (!token || !appointmentId) {
//           console.log('⚠️ No token or appointmentId');
//           return;
//         }
//         console.log('🔌 Connecting WebSocket...', { appointmentId, role, token });

//         const ws = new WebSocketService(
//           appointmentId,
//           token,
//           () => {
//             console.log('✅ WebSocket connected');
//             if (mountedRef.current) {
//               setState((prev) => ({ ...prev, isConnected: true, error: null }));
//             }
//           },
//           () => {
//             console.log('❌ WebSocket disconnected');
//             if (mountedRef.current) {
//               setState((prev) => ({ ...prev, isConnected: false }));
//             }
//           }
//         );

//         ws.on('message', (data: WebSocketMessage) => {
//           console.log('📩 WebSocket message received:', data);
//           if (data.message && mountedRef.current) {
//             setState((prev) => {
//               const exists = prev.messages.some((m: Message) => m.id === data.message!.id);
//               if (exists) return prev;
//               return {
//                 ...prev,
//                 messages: [...prev.messages, data.message!],
//               };
//             });
//           }
//         });

//         ws.on('connected', (data) => {
//           console.log('✅ Chat connected:', data);
//         });

//         ws.on('read', (data) => {
//           console.log('📖 Read receipt:', data);
//           if (data.message_ids && mountedRef.current) {
//             setState((prev) => ({
//               ...prev,
//               messages: prev.messages.map((msg: Message) =>
//                 data.message_ids!.includes(msg.id)
//                   ? { ...msg, is_seen: true, seen_at: new Date().toISOString() }
//                   : msg
//               ),
//             }));
//           }
//         });

//         ws.on('error', (data) => {
//           console.error('❌ WebSocket error:', data);
//           if (mountedRef.current) {
//             setState((prev) => ({
//               ...prev,
//               error: data.error || 'WebSocket error',
//             }));
//           }
//         });

//         ws.connect();
//         wsRef.current = ws;
//         await loadMessages();

//       } catch (error) {
//         console.error('❌ Setup error:', error);
//       }
//     };

//     setupWebSocket();

//     const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
//       const isComingToForeground =
//         appStateRef.current.match(/inactive|background/) &&
//         nextAppState === 'active';

//       if (isComingToForeground) {
//         console.log('📱 App foregrounded');
//         if (wsRef.current && !wsRef.current.isConnected()) {
//           wsRef.current.connect();
//         }
//         if (loadMessagesRef.current) {
//           loadMessagesRef.current();
//         }
//       }
//       appStateRef.current = nextAppState;
//     });

//     return () => {
//       mountedRef.current = false;
//       subscription.remove();
//       if (wsRef.current) {
//         wsRef.current.disconnect();
//         wsRef.current = null;
//       }
//     };
//   }, [appointmentId, loadMessages]);

//   return {
//     ...state,
//     loadMessages,
//     sendMessage,
//     markAsRead,
//     isConnected: state.isConnected,
//   };
// }

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { chatService } from '../services/chatService';
import { WebSocketService } from '../services/websocketService';
import { Message, ChatState, SendMessagePayload, WebSocketMessage, Attachment } from '../types/chat';
import { Utils } from '../../common/Utils';

export function useChat(appointmentId: string, role: 'doctor' | 'patient') {
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
          setState((prev) => ({
            ...prev,
            messages: data.messages || [],
            chatAccess: data.chat_access || null,
            followUpActive: data.chat_access?.follow_up_active || false,
            activePhase: data.chat_access?.active_phase || 'live',
            isLoading: false,
            error: null,
          }));
        }
      } catch (error: any) {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: isFirstLoad ? error.message || 'Failed to load messages' : prev.error,
          }));
        }
      }
    },
    [appointmentId]
  );

  useEffect(() => {
    loadMessagesRef.current = loadMessages;
  }, [loadMessages]);

  // ✅ Error ko auto-clear karo taaki toast hamesha ke liye atka na rahe
  const showTransientError = useCallback((message: string) => {
    if (!mountedRef.current) return;
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
      } catch (error: any) {
        // Fail hone pe temp message hata do, warna galat message atka reh jayega
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== tempId),
        }));
        showTransientError(error.message || 'Message bhejne mein error aayi');
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
    mountedRef.current = true;

    const setupWebSocket = async (): Promise<void> => {
      try {
        const token = await Utils.getData('_TOKEN');
        if (!token || !appointmentId) return;

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
              // Apna hi temp/optimistic message ho to usko real message se replace karo
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

        ws.on('error', (data) => {
          if (mountedRef.current && data.error) {
            showTransientError(data.error);
          }
        });

        ws.connect();
        wsRef.current = ws;
        await loadMessages();
      } catch (error) {
        console.error('❌ Setup error:', error);
      }
    };

    setupWebSocket();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const isComingToForeground =
        appStateRef.current.match(/inactive|background/) && nextAppState === 'active';

      if (isComingToForeground) {
        if (wsRef.current && !wsRef.current.isConnected()) {
          wsRef.current.connect();
        }
        loadMessagesRef.current?.();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      mountedRef.current = false;
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      subscription.remove();
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [appointmentId, loadMessages, showTransientError]);

  return {
    ...state,
    loadMessages,
    sendMessage,
    markAsRead,
    isConnected: state.isConnected,
  };
}