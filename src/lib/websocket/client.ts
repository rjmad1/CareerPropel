/**
 * WebSocket Client for Career Propel Real-Time Features
 * Handles connection, reconnection, and message routing
 */

import { AnyWebSocketMessage, SubscriptionMessage } from './types';

type MessageHandler = (message: AnyWebSocketMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private config: WebSocketConfig;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectCount = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private messageQueue: AnyWebSocketMessage[] = [];

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false;
        this.socket = new WebSocket(this.config.url);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectCount = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as AnyWebSocketMessage;
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.stopHeartbeat();
          this.notifyConnectionHandlers(false);

          if (!this.isIntentionallyClosed && this.reconnectCount < (this.config.reconnectAttempts || 5)) {
            this.reconnectCount++;
            console.log(`Reconnecting... Attempt ${this.reconnectCount}/${this.config.reconnectAttempts}`);
            setTimeout(
              () => this.connect().catch((e) => console.error('Reconnection failed', e)),
              (this.config.reconnectDelay || 3000) * this.reconnectCount
            );
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send a message to the server
   */
  public send(message: AnyWebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to message types
   */
  public subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Subscribe to connection state changes
   */
  public onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Request subscription to channels
   */
  public subscribeToChannels(channels: string[]): void {
    const message: SubscriptionMessage = {
      type: 'subscribe',
      channels,
    };
    this.send(message as any);
  }

  /**
   * Request unsubscription from channels
   */
  public unsubscribeFromChannels(channels: string[]): void {
    const message: SubscriptionMessage = {
      type: 'unsubscribe',
      channels,
    };
    this.send(message as any);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: AnyWebSocketMessage): void {
    // Route to handlers for this message type
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${message.type}`, error);
        }
      });
    }
  }

  /**
   * Notify all connection handlers
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler', error);
      }
    });
  }

  /**
   * Start sending heartbeat messages
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'heartbeat',
          data: null,
          timestamp: new Date(),
          messageId: `hb-${Date.now()}`,
        } as any);
      }
    }, this.config.heartbeatInterval || 30000);
  }

  /**
   * Stop sending heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }
}

// Singleton instance
let clientInstance: WebSocketClient | null = null;

/**
 * Get or create WebSocket client instance
 */
export function getWebSocketClient(config?: WebSocketConfig): WebSocketClient {
  if (!clientInstance && config) {
    clientInstance = new WebSocketClient(config);
  }
  if (!clientInstance) {
    throw new Error('WebSocket client not initialized. Provide config.');
  }
  return clientInstance;
}

/**
 * Initialize WebSocket client
 */
export function initWebSocket(url: string, options?: Partial<WebSocketConfig>): WebSocketClient {
  clientInstance = new WebSocketClient({
    url,
    ...options,
  });
  return clientInstance;
}
