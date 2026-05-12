/**
 * Notification Manager - Centralized notification handling
 * 
 * Manages:
 * - Notification creation, updates, dismissal
 * - Auto-dismiss timers
 * - Priority queuing
 * - Persistence
 * - Subscriber callbacks
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // ms, 0 = never auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

type NotificationCallback = (notification: Notification) => void;
type NotificationDismissCallback = (id: string) => void;

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private subscribers: Set<NotificationCallback> = new Set();
  private dismissSubscribers: Set<NotificationDismissCallback> = new Set();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private nextId = 0;

  /**
   * Show a notification
   */
  notify(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void };
    }
  ): string {
    const id = `notification-${this.nextId++}`;
    const duration = options?.duration ?? this.getDefaultDuration(type);

    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      action: options?.action,
      createdAt: Date.now(),
    };

    this.notifications.set(id, notification);
    this.notifySubscribers(notification);

    // Set auto-dismiss timer
    if (duration && duration > 0) {
      const timeout = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timeouts.set(id, timeout);
    }

    return id;
  }

  /**
   * Show success notification
   */
  success(title: string, message?: string, options?: { duration?: number }): string {
    return this.notify('success', title, message || '', options);
  }

  /**
   * Show error notification
   */
  error(title: string, message?: string, options?: { duration?: number }): string {
    return this.notify('error', title, message || '', {
      ...options,
      duration: options?.duration ?? 5000,
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message?: string, options?: { duration?: number }): string {
    return this.notify('warning', title, message || '', {
      ...options,
      duration: options?.duration ?? 4000,
    });
  }

  /**
   * Show info notification
   */
  info(title: string, message?: string, options?: { duration?: number }): string {
    return this.notify('info', title, message || '', {
      ...options,
      duration: options?.duration ?? 3000,
    });
  }

  /**
   * Dismiss notification by ID
   */
  dismiss(id: string): void {
    // Clear timeout if exists
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    // Remove notification
    this.notifications.delete(id);

    // Notify subscribers
    this.dismissSubscribers.forEach((cb) => cb(id));
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    const ids = Array.from(this.notifications.keys());
    ids.forEach((id) => this.dismiss(id));
  }

  /**
   * Get all current notifications
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  /**
   * Subscribe to notification changes
   * Returns unsubscribe function
   */
  subscribe(callback: NotificationCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Subscribe to notification dismissals
   * Returns unsubscribe function
   */
  onDismiss(callback: NotificationDismissCallback): () => void {
    this.dismissSubscribers.add(callback);
    return () => {
      this.dismissSubscribers.delete(callback);
    };
  }

  /**
   * Update existing notification
   */
  update(id: string, changes: Partial<Notification>): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const updated = { ...notification, ...changes, id };
    this.notifications.set(id, updated);
    this.notifySubscribers(updated);
  }

  /**
   * Clear all subscribers (for cleanup)
   */
  clear(): void {
    this.dismissAll();
    this.subscribers.clear();
    this.dismissSubscribers.clear();
  }

  private notifySubscribers(notification: Notification): void {
    this.subscribers.forEach((cb) => {
      try {
        cb(notification);
      } catch (err) {
        console.error('Notification subscriber error:', err);
      }
    });
  }

  private getDefaultDuration(type: NotificationType): number {
    const durations: Record<NotificationType, number> = {
      info: 3000,
      success: 3000,
      warning: 4000,
      error: 5000,
    };
    return durations[type];
  }
}

// Singleton instance
let instance: NotificationManager | null = null;

export function getNotificationManager(): NotificationManager {
  if (!instance) {
    instance = new NotificationManager();
  }
  return instance;
}

// For testing
export function createNotificationManager(): NotificationManager {
  return new NotificationManager();
}
