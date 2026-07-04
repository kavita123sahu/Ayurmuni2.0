import { Platform } from 'react-native';
import { WS_BASE } from './api';
import { WebSocketMessage } from '../types/chat';

type MessageHandler = (data: WebSocketMessage) => void;

export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private handlers: Map<string, MessageHandler[]> = new Map();
    private isConnecting = false;
    private pingInterval: NodeJS.Timeout | null = null;
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

        // Build WebSocket URL
        const url = `${WS_BASE}/ws/communication/appointments/${this.appointmentId}/?token=${this.token}`;
        console.log('🔌 Connecting WebSocket:', url.replace(this.token, '***'));

        try {
            // ✅ Native WebSocket — no package needed!
            this.ws = new WebSocket(url);

            // @ts-ignore — React Native WebSocket events
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

    private handleMessage(event: { data: string }): void {
        try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('📩 WebSocket message:', data.type);
            this.routeMessage(data);
        } catch (error) {
            console.error('❌ WebSocket parse error:', error);
        }
    }

    private handleClose(event: { code: number; reason: string }): void {
        console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
        this.isConnecting = false;
        this.stopPing();
        this.onDisconnect?.();

        // Don't reconnect if intentional close
        if (this.isIntentionalClose) return;

        // Normal closure codes
        if (event.code === 1000 || event.code === 1001) {
            console.log('👋 Normal closure, not reconnecting');
            return;
        }

        this.reconnect();
    }

    private handleError(event: any): void {
        console.error('❌ WebSocket error:', event);
        this.isConnecting = false;
    }

    private routeMessage(data: WebSocketMessage): void {
        switch (data.type) {
            case 'chat.connected':
                this.emit('connected', data);
                break;
            case 'chat.receive':
                this.emit('message', data);
                break;
            case 'chat.error':
                this.emit('error', data);
                break;
            case 'chat.read':
                this.emit('read', data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    private reconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                if (!this.isIntentionalClose) {
                    this.connect();
                }
            }, delay);
        } else {
            console.error('❌ Max reconnect attempts reached');
            this.emit('error', {
                type: 'chat.error',
                error: 'Connection lost. Please refresh.'
            });
        }
    }

    // ✅ Send message via WebSocket
    sendMessage(text: string): boolean {
        if (this.isConnected()) {
            this.send(JSON.stringify({ type: 'chat.send', text }));
            return true;
        }
        return false;
    }

    // ✅ Mark as read via WebSocket
    sendRead(messageIds?: string[]): boolean {
        if (this.isConnected()) {
            this.send(JSON.stringify({
                type: 'chat.read',
                message_ids: messageIds
            }));
            return true;
        }
        return false;
    }

    // ✅ Send any data
    private send(data: string): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.warn('⚠️ WebSocket not open, message not sent');
        }
    }

    // ✅ Heartbeat ping
    private startPing(): void {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            if (this.isConnected()) {
                // Send ping to keep connection alive
                this.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Every 30 seconds
    }

    private stopPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    // ✅ Check connection status
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    getReadyState(): number {
        return this.ws?.readyState ?? -1;
    }

    // ✅ Event handling
    on(event: string, handler: MessageHandler): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }

    off(event: string, handler: MessageHandler): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            this.handlers.set(
                event,
                handlers.filter((h) => h !== handler)
            );
        }
    }

    private emit(event: string, data: WebSocketMessage): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach((handler) => handler(data));
        }
    }

    // ✅ Disconnect
    disconnect(): void {
        this.isIntentionalClose = true;
        this.stopPing();
        if (this.ws) {
            try {
                this.ws.close(1000, 'Normal closure');
            } catch (e) {
                // Ignore
            }
            this.ws = null;
        }
        this.isConnecting = false;
    }
}