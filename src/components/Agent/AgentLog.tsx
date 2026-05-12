'use client';

import React from 'react';
import { AgentLog } from '@/lib/websocket/types';

interface AgentLogProps {
  log: AgentLog;
  isExpanded?: boolean;
}

/**
 * AgentLog - Renders a single agent log entry
 * 
 * Displays:
 * - Timestamp
 * - Log level (info, warning, error, debug)
 * - Message
 * - Metadata (if present)
 * 
 * Used by AgentRail to display logs in the detail panel
 */
export const AgentLogComponent: React.FC<AgentLogProps> = ({
  log,
  isExpanded: _isExpanded = false,
}) => {
  // Color and icon based on log level
  const levelConfig = getLevelConfig(log.level);

  return (
    <div
      className={`
        px-3 py-2 border-l-2 font-mono text-xs space-y-1
        ${levelConfig.borderColor} ${levelConfig.bgColor}
      `}
      data-cy={`agent-log-${log.level}`}
    >
      {/* Header: Icon + Level + Timestamp */}
      <div className="flex items-center gap-2">
        <span className={levelConfig.icon}>{levelConfig.emoji}</span>
        <span className={`font-semibold ${levelConfig.textColor}`}>
          {log.level.toUpperCase()}
        </span>
        <span className="text-gray-400 ml-auto">
          {formatTimestamp(log.timestamp)}
        </span>
      </div>

      {/* Message */}
      <div className={levelConfig.messageColor}>
        {log.message}
      </div>

      {/* Metadata (if present and expanded) */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div className="mt-1 pt-1 border-t border-gray-300 opacity-75">
          {Object.entries(log.metadata).map(([key, value]) => (
            <div key={key} className="text-gray-600">
              <span className="font-semibold">{key}:</span>{' '}
              {formatMetadataValue(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Provides color, icon, and styling based on log level
 */
function getLevelConfig(
  level: 'info' | 'warning' | 'error' | 'debug'
): {
  emoji: string;
  icon: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  messageColor: string;
} {
  const configs = {
    info: {
      emoji: 'ℹ️',
      icon: '',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      messageColor: 'text-blue-900',
    },
    warning: {
      emoji: '⚠️',
      icon: '',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300',
      bgColor: 'bg-yellow-50',
      messageColor: 'text-yellow-900',
    },
    error: {
      emoji: '❌',
      icon: '',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      bgColor: 'bg-red-50',
      messageColor: 'text-red-900',
    },
    debug: {
      emoji: '🔍',
      icon: '',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
      messageColor: 'text-gray-900',
    },
  };

  return configs[level] || configs.info;
}

/**
 * Format timestamp to relative or absolute time
 */
function formatTimestamp(timestamp: number | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  const now = new Date();

  // If today, show just time
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  // Otherwise show date and time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format metadata values for display
 * Handles strings, numbers, objects, arrays
 */
function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}
