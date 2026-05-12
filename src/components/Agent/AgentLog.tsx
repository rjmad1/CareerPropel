'use client';

import React, { useState } from 'react';
import { AgentLog as AgentLogType } from '@/lib/websocket/types';
import { cn } from '@/lib/utils';

interface AgentLogComponentProps {
  log: AgentLogType;
}

const levelColors = {
  INFO: 'bg-blue-100 text-blue-700',
  WARN: 'bg-amber-100 text-amber-700',
  ERROR: 'bg-red-100 text-red-700',
  DEBUG: 'bg-gray-100 text-gray-700',
};

const levelEmojis = {
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  DEBUG: '🔧',
};

export const AgentLog: React.FC<AgentLogComponentProps> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const level = log.level || 'INFO';
  const levelColor = levelColors[level as keyof typeof levelColors] || levelColors.INFO;
  const emoji = levelEmojis[level as keyof typeof levelEmojis] || '📝';
  const hasData = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div className="font-mono text-xs border-l-2 border-gray-200 pl-3 py-2">
      <div
        className={cn(
          'flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50',
          expanded && 'bg-gray-50'
        )}
        onClick={() => hasData && setExpanded(!expanded)}
      >
        <span className="text-base flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs px-2 py-0.5 rounded font-semibold', levelColor)}>
              {level}
            </span>
            <span className="text-gray-600 flex-1 truncate">{log.message}</span>
            <span className="text-gray-400 text-xs flex-shrink-0">
              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          {/* Expandable Data Section */}
          {hasData && expanded && (
            <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-300 text-xs text-gray-700 max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {hasData && !expanded && (
            <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <span>▶</span>
              <span>View details ({Object.keys(log.metadata || {}).length} fields)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentLog;
