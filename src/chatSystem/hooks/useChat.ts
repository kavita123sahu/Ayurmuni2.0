import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { chatService } from '../services/chatService';
import { WebSocketService } from '../services/websocketService';
import { Message, ChatState, SendMessagePayload, WebSocketMessage, Attachment } from '../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useChat(appointmentId: string, role: 'doctor' | 'patient') {
  const [state, setState] = useState<ChatState>({
    appointmentId,
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    participantRole: role,
    chatAccess: { can_send: false, can_read: false },
  });

  const wsRef = useRef<WebSocketService | null>(null);
  const tokenRef = useRef<string>('');
  const mountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  const loadMessagesRef = useRef<Function>();

  // ✅ Load messages using fetch
  const loadMessages = useCallback(
    async (markRead?: boolean | string) => {
      if (!mountedRef.current) return;
      
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const data = await chatService.getMessages(appointmentId, markRead);
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            messages: data.messages,
            chatAccess: data.chat_access,
            isLoading: false,
            error: null,
          }));
        }
      } catch (error: any) {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Failed to load messages',
          }));
        }
      }
    },
    [appointmentId]
  );

  // Store loadMessages in ref for cleanup
  useEffect(() => {
    loadMessagesRef.current = loadMessages;
  }, [loadMessages]);

  // ✅ Send message (WebSocket first, fallback HTTP)
  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]) => {
      // Try WebSocket first
      if (wsRef.current?.isConnected()) {
        const sent = wsRef.current.sendMessage(text);
        if (sent) {
          // Optimistically add message
          const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            appointment_id: appointmentId,
            sender_id: 'me',
            sender_role: role,
            text: text,
            attachments: attachments || [],
            is_seen: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, tempMessage],
          }));
          return;
        }
      }

      // Fallback to HTTP
      try {
        const payload: SendMessagePayload = { text };
        if (attachments) payload.attachments = attachments;
        const result = await chatService.sendMessage(appointmentId, payload);
        // Refresh messages to get the real one
        await loadMessages();
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to send message',
        }));
      }
    },
    [appointmentId, role, loadMessages]
  );

  // ✅ Mark as read
  const markAsRead = useCallback(
    async (messageIds?: string[]) => {
      // WebSocket mark read
      if (wsRef.current?.isConnected()) {
        wsRef.current.sendRead(messageIds);
      }
      
      // HTTP mark read for persistence
      if (messageIds) {
        await loadMessages(messageIds.join(','));
      } else {
        await loadMessages('all');
      }
    },
    [loadMessages]
  );

  // ✅ Setup WebSocket
  useEffect(() => {
    mountedRef.current = true;

    const setupWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token || !appointmentId) return;
        
        tokenRef.current = token;

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

        // ✅ Handle incoming messages
        ws.on('message', (data: WebSocketMessage) => {
          if (data.message && mountedRef.current) {
            setState((prev) => {
              // Avoid duplicates
              const exists = prev.messages.some(m => m.id === data.message!.id);
              if (exists) return prev;
              return {
                ...prev,
                messages: [...prev.messages, data.message!],
              };
            });
          }
        });

        ws.on('connected', (data) => {
          console.log('✅ Chat connected:', data);
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
          if (mountedRef.current) {
            setState((prev) => ({
              ...prev,
              error: data.error || 'WebSocket error',
            }));
          }
        });

        ws.connect();
        wsRef.current = ws;

        // ✅ Load initial messages
        await loadMessages();

      } catch (error) {
        console.error('❌ Setup error:', error);
      }
    };

    setupWebSocket();

    // ✅ Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const isComingToForeground = 
        appStateRef.current.match(/inactive|background/) && 
        nextAppState === 'active';

      if (isComingToForeground) {
        console.log('📱 App foregrounded, reconnecting...');
        if (wsRef.current && !wsRef.current.isConnected()) {
          wsRef.current.connect();
        }
        // Refresh messages
        if (loadMessagesRef.current) {
          loadMessagesRef.current();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [appointmentId, loadMessages]);

  return {
    ...state,
    loadMessages,
    sendMessage,
    markAsRead,
    isConnected: state.isConnected,
  };
}