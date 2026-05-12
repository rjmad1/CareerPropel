'use client';

import React, { useEffect, useState } from 'react';
import { Notification } from '@/lib/notifications/manager';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

/**
 * Toast - Individual notification toast component
 * 
 * Features:
 * - Type-based styling and icons
 * - Auto-dismiss with progress bar
 * - Action button support
 * - Smooth animations
 * - Dismissible via close button
 * 
 * Props:
 * - notification: Notification object
 * - onDismiss: Callback to dismiss notification
 */
export const Toast: React.FC<ToastProps> = ({
  notification,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = getTypeConfig(notification.type);

  // Handle auto-dismiss
  useEffect(() => {
    if (!notification.duration || notification.duration === 0) {
      return;
    }

    const startTime = Date.now();
    const duration = notification.duration;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for animation to complete
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      data-cy={`toast-${notification.id}`}
    >
      <div
        className={`
          rounded-lg shadow-lg p-4 max-w-sm
          flex gap-3 items-start
          ${config.bgColor} ${config.borderColor}
          border
        `}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 text-xl ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${config.titleColor}`}>
            {notification.title}
          </div>
          {notification.message && (
            <div className={`text-sm mt-1 ${config.messageColor}`}>
              {notification.message}
            </div>
          )}

          {/* Action Button */}
          {notification.action && (
            <button
              onClick={() => {
                notification.action!.onClick();
                handleDismiss();
              }}
              className={`
                text-xs font-semibold mt-2 underline
                ${config.actionColor} hover:opacity-75 transition-opacity
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 text-lg ${config.closeColor} hover:opacity-75 transition-opacity`}
        >
          ✕
        </button>

        {/* Progress Bar (if auto-dismissing) */}
        {notification.duration && notification.duration > 0 && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${config.progressColor}`}
            style={{
              width: `${progress}%`,
              transition: 'width 0.1s linear',
            }}
          />
        )}
      </div>
    </div>
  );
};

interface TypeConfig {
  icon: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
  messageColor: string;
  actionColor: string;
  closeColor: string;
  progressColor: string;
}

function getTypeConfig(type: string): TypeConfig {
  const configs: Record<string, TypeConfig> = {
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      actionColor: 'text-blue-700',
      closeColor: 'text-blue-400',
      progressColor: 'bg-blue-400',
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      actionColor: 'text-green-700',
      closeColor: 'text-green-400',
      progressColor: 'bg-green-400',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
      actionColor: 'text-yellow-700',
      closeColor: 'text-yellow-400',
      progressColor: 'bg-yellow-400',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      actionColor: 'text-red-700',
      closeColor: 'text-red-400',
      progressColor: 'bg-red-400',
    },
  };

  return configs[type] || configs.info;
}

export default Toast;
