import { WS_BASE } from './api';
import { WebSocketMessage } from '../types/chat';

type MessageHandler = (data: WebSocketMessage) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isConnecting = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isIntentionalClose = false;

  constructor(
    private appointmentId: string,
    private token: string,
    private onConnect?: () => void,
    private onDisconnect?: () => void
  ) { }

  connect(): void {
    if (this.isConnecting) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.isConnecting = true;
    this.isIntentionalClose = false;

    const url = `${WS_BASE}/ws/communication/appointments/${this.appointmentId}/?token=${this.token}`;
 console.log("urlllll", url);
 

    // console.log('🔌 Connecting WebSocket:', url.replace(this.token, '***'));

    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  private handleOpen(): void {
    console.log('✅ WebSocket connected');
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.startPing();
    this.onConnect?.();
  }

  private handleMessage(event: any): void {
    try {
      if (!event.data) {
        console.warn('⚠️ Empty WebSocket message');
        return;
      }

      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('📩 WebSocket received:', data.type);

      // ✅ Route message
      if (data.type === 'chat.connected') {
        this.emit('connected', data);
      } else if (data.type === 'chat.receive') {
        this.emit('message', data);
      } else if (data.type === 'chat.error') {
        console.error('❌ Server error:', data.error);
        this.emit('error', data);
      } else if (data.type === 'chat.read') {
        this.emit('read', data);
      } else if (data.type === 'ping') {
        this.sendPong();
      } else {
        console.log('⚠️ Unknown message type:', data.type);
        if (data.message) {
          this.emit('message', data);
        }
      }
    } catch (error) {
      console.error('❌ WebSocket parse error:', error);
    }
  }


  private handleClose(event: any): void {
    console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`);
    this.isConnecting = false;
    this.stopPing();
    this.onDisconnect?.();

    if (this.isIntentionalClose) return;
    if (event.code === 1000 || event.code === 1001) {
      console.log('👋 Normal closure');
      return;
    }
    this.reconnect();
  }

  private handleError(event: any): void {
    console.error('❌ WebSocket error:', event);
    this.isConnecting = false;
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`🔄 Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        if (!this.isIntentionalClose) {
          this.connect();
        }
      }, delay);
    } else {
      console.error('❌ Max reconnect attempts reached');
      this.emit('error', { type: 'chat.error', error: 'Connection lost. Please refresh.' });
    }
  }

  // sendMessage(text: string): boolean {
  //   if (this.isConnected()) {
  //     try {
  //       const payload = { type: 'chat.send', text };
  //       this.ws?.send(JSON.stringify(payload));
  //       console.log('📤 Sent:', payload);
  //       return true;
  //     } catch (error) {
  //       console.error('❌ Send failed:', error);
  //       return false;
  //     }
  //   }
  //   console.warn('⚠️ WebSocket not open');
  //   return false;
  // }

  sendMessage(text: string): boolean {
    // ✅ GUARD: khaali text WS pe kabhi mat bhejo — backend chat.error return karta hai
    if (!text || !text.trim()) {
      console.warn('⚠️ Empty text — WebSocket se nahi bhejenge');
      return false;
    }
    if (this.isConnected()) {
      try {
        const payload = { type: 'chat.send', text };
        this.ws?.send(JSON.stringify(payload));
        console.log('📤 Sent:', payload);
        return true;
      } catch (error) {
        console.error('❌ Send failed:', error);
        return false;
      }
    }
    console.warn('⚠️ WebSocket not open');
    return false;
  }

  sendRead(messageIds?: string[]): boolean {
    if (this.isConnected()) {
      try {
        const payload = { type: 'chat.read', message_ids: messageIds };
        this.ws?.send(JSON.stringify(payload));
        console.log('📤 Read:', payload);
        return true;
      } catch (error) {
        console.error('❌ Read failed:', error);
        return false;
      }
    }
    return false;
  }

  private sendPong(): void {
    if (this.isConnected()) {
      try {
        this.ws?.send(JSON.stringify({ type: 'pong' }));
        console.log('💓 Pong sent');
      } catch (error) {
        console.error('❌ Pong failed:', error);
      }
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        try {
          this.ws?.send(JSON.stringify({ type: 'ping' }));
          console.log('💓 Ping sent');
        } catch (error) {
          console.error('❌ Ping failed:', error);
        }
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  on(event: string, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      this.handlers.set(event, handlers.filter((h) => h !== handler));
    }
  }

  private emit(event: string, data: WebSocketMessage): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    this.stopPing();
    if (this.ws) {
      try {
        this.ws.close(1000, 'Normal closure');
      } catch (e) { }
      this.ws = null;
    }
    this.isConnecting = false;
  }
}