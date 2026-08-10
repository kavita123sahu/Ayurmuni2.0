export interface Attachment {
  file_url: string;
  file_type: 'image' | 'document' | 'video' | 'audio';
  file_name?: string;
}

export interface Message {
  id: string;
  appointment_id: string;
  sender_id: string;
  sender_role: 'doctor' | 'patient';
  sender_name?: string;
  text: string;
  attachments: Attachment[];
  phase: 'live' | 'followup';
  message_type: 'text' | 'image' | 'document';
  is_seen: boolean;
  seen_at?: string | null;
  doctor_read_at?: string | null;
  patient_read_at?: string | null;
  read_by?: Array<{
    reader_role: string;
    read_at: string;
  }>;
  is_read_by_me?: boolean;
  created_at: string;
  updated_at?: string;
  /** Local-only flag for optimistic messages before server ack. */
  _pending?: boolean;
}

export interface ChatAccess {
  can_send: boolean;
  can_read: boolean;
  active_phase: 'live' | 'followup';
  call_status: string;
  appointment_status: string;
  follow_up_active: boolean;
  follow_up: {
    schedule: boolean;
    date: string | null;
    reason: string | null;
  };
}

export interface ChatState {
  appointmentId: string;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  participantRole: 'doctor' | 'patient';
  chatAccess: ChatAccess | null;
  followUpActive: boolean;
  activePhase: 'live' | 'followup';
}

export interface SendMessagePayload {
  text?: string;
  attachments?: Attachment[];
}

export interface WebSocketMessage {
  type: string;
  text?: string;
  message_ids?: string[];
  message?: Message;
  participant_role?: 'doctor' | 'patient';
  error?: string;
}

export interface MessagesResponse {
  messages: Message[];
  chat_access: ChatAccess | null;
  read_receipt?: unknown;
  /** True when send is blocked (e.g. 403) but history may still be returned. */
  sendBlocked?: boolean;
}

export interface ChatApiError extends Error {
  httpStatus?: number;
  code?: string;
  errors?: Record<string, unknown>;
  chat_access?: Partial<ChatAccess>;
  messages?: Message[];
}