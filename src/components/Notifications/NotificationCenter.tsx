'use client';

import React, { useState, useEffect } from 'react';
import { Notification, getNotificationManager } from '@/lib/notifications/manager';
import { Toast } from './Toast';

/**
 * NotificationCenter - Manages and displays all toast notifications
 * 
 * Features:
 * - Centralized notification management
 * - Multiple concurrent notifications
 * - Stack management (FIFO dismissal)
 * - Auto-cleanup of dismissed notifications
 * - Type-specific styling
 * - Action button support
 * 
 * Usage:
 * - Place at root of app
 * - Use getNotificationManager() globally to show notifications
 * 
 * Example:
 * ```
 * const notifier = getNotificationManager();
 * notifier.success('Success!', 'Operation completed');
 * notifier.error('Error!', 'Something went wrong', { duration: 5000 });
 * ```
 */
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const manager = getNotificationManager();

    // Subscribe to new notifications
    const unsubscribeNotify = manager.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Subscribe to dismissals
    const unsubscribeDismiss = manager.onDismiss((id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });

    // Get initial notifications (in case component mounted after some were created)
    const initial = manager.getAll();
    if (initial.length > 0) {
      setNotifications(initial);
    }

    return () => {
      unsubscribeNotify();
      unsubscribeDismiss();
    };
  }, []);

  const handleDismiss = (id: string) => {
    const manager = getNotificationManager();
    manager.dismiss(id);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none"
      data-cy="notification-center"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast
            notification={notification}
            onDismiss={handleDismiss}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
