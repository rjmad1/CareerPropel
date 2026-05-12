'use client';

import React from 'react';
import { Agent, AgentStatus } from '@/lib/websocket/types';
import { AGENT_CONFIGS, getAgentColor, getAgentStatusLabel } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
  isCompact?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * AgentCard - Renders a single agent with status indicator and progress
 * 
 * Used by AgentRail in both:
 * - Compact mode: Just name, status, progress bar
 * - Full mode: Expanded details with metrics
 * 
 * Props:
 * - agent: Agent state object with id, type, status, progress, etc.
 * - isCompact?: boolean - If true, show minimal layout (for list view), else show full (for detail view)
 * - isSelected?: boolean - Highlight if selected
 * - onSelect?: () => void - Callback when card is clicked
 */
export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isCompact = true,
  isSelected = false,
  onSelect,
}) => {
  const config = AGENT_CONFIGS[agent.type];
  const statusColor = getAgentColor(agent.status);
  const statusLabel = getAgentStatusLabel(agent.status);

  // Compact view - for list items in AgentRail left sidebar
  if (isCompact) {
    return (
      <div
        onClick={onSelect}
        className={`
          px-3 py-2 rounded cursor-pointer transition-colors
          border-l-4 border-transparent
          ${isSelected 
            ? 'bg-blue-50 border-l-blue-500' 
            : 'hover:bg-gray-50'
          }
        `}
        data-cy={`agent-rail-item-${agent.id}`}
      >
        {/* Header: Icon + Name + Status Dot */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{config.icon}</span>
          <span className="flex-1 text-sm font-medium text-gray-900">
            {config.name}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${statusColor}`}
            title={statusLabel}
          />
        </div>

        {/* Progress Bar (if running) */}
        {agent.progress > 0 && agent.progress < 100 && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${agent.progress}%` }}
                data-cy="agent-progress-bar"
              />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {Math.round(agent.progress)}%
            </div>
          </div>
        )}

        {/* Status Label */}
        <div className="text-xs text-gray-600">
          {statusLabel}
        </div>
      </div>
    );
  }

  // Full view - for detail panel on AgentRail right side
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {config.name}
            </h3>
            <p className="text-xs text-gray-500">
              {config.description}
            </p>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${statusColor}`}
            title={statusLabel}
          />
        </div>
      </div>

      {/* Status & Current Task */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className="text-sm font-medium text-gray-900">
            {statusLabel}
          </span>
        </div>

        {agent.currentTask && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Current Task</span>
            <span className="text-sm font-medium text-gray-900">
              {agent.currentTask}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar (if running) */}
      {agent.progress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(agent.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Queue Depth</div>
          <div className="text-lg font-semibold text-gray-900">
            {agent.queueDepth}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Confidence</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(agent.confidence * 100)}%
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Tokens Used</div>
          <div className="text-lg font-semibold text-gray-900">
            {agent.tokensUsed.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-500 mb-1">Last Activity</div>
          <div className="text-xs font-semibold text-gray-900">
            {formatLastActivity(agent.lastActivity)}
          </div>
        </div>
      </div>

      {/* Error Message (if error state) */}
      {agent.status === 'error' && agent.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="text-xs font-semibold text-red-900 mb-1">
            Error
          </div>
          <div className="text-xs text-red-700">
            {agent.errorMessage}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {agent.completedTasks > 0 && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tasks Completed</span>
          <span className="text-sm font-medium text-green-600">
            {agent.completedTasks}
          </span>
        </div>
      )}

      {/* Failed Tasks */}
      {agent.failedTasks > 0 && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tasks Failed</span>
          <span className="text-sm font-medium text-red-600">
            {agent.failedTasks}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Format lastActivity timestamp to relative time string
 * e.g., "2 minutes ago", "just now"
 */
function formatLastActivity(timestamp: number | Date): string {
  const now = Date.now();
  const lastTime = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const diffMs = now - lastTime;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 30) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}
