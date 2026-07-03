export interface User {
  id: string;
  phone_number: string;
  role: 'doctor' | 'customer' | 'patient';
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

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
  text: string;
  attachments: Attachment[];
  is_seen: boolean;
  seen_at?: string;
  doctor_read_at?: string;
  patient_read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatState {
  appointmentId: string;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  participantRole: 'doctor' | 'patient';
  chatAccess: {
    can_send: boolean;
    can_read: boolean;
  };
}

export interface SendMessagePayload {
  text?: string;
  attachments?: Attachment[];
}

export interface WebSocketMessage {
  type: 'chat.send' | 'chat.read' | 'chat.connected' | 'chat.receive' | 'chat.error';
  text?: string;
  message_ids?: string[];
  message?: Message;
  participant_role?: 'doctor' | 'patient';
  error?: string;
}