'use client';

import React from 'react';
import { Agent } from '@/types/agent';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  isCompact?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  isPauseLoading?: boolean;
}

const statusColors = {
  idle: 'bg-gray-100 text-gray-700',
  running: 'bg-green-100 text-green-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-orange-100 text-orange-700',
};

const statusBgColors = {
  idle: 'bg-white border-gray-200',
  running: 'bg-green-50 border-green-200',
  waiting: 'bg-yellow-50 border-yellow-200',
  failed: 'bg-red-50 border-red-200',
  completed: 'bg-blue-50 border-blue-200',
  paused: 'bg-orange-50 border-orange-200',
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isCompact = true,
  isSelected = false,
  onSelect,
  onPause,
  onResume,
  onCancel,
  isPauseLoading = false,
}) => {
  const confidencePercent = Math.round((agent.confidence || 0.8) * 100);
  const bgColor = statusBgColors[agent.status as keyof typeof statusBgColors] || 'bg-white border-gray-200';

  if (isCompact) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          'p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
          isSelected && 'bg-blue-50 border-l-4 border-l-blue-500'
        )}
        data-cy={`agent-rail-item-${agent.id}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">{agent.name}</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className={cn('text-xs px-4 py-2 rounded-full font-medium', statusColors[agent.status as keyof typeof statusColors])}>
                {agent.status}
              </span>
              {agent.queueDepth > 0 && (
                <span className="text-xs bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                  Queue: {agent.queueDepth}
                </span>
              )}
            </div>
            {agent.status === 'running' && agent.progress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(agent.progress, 100)}%` }}
                    data-cy="agent-progress-bar"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{agent.progress}%</p>
              </div>
            )}
            {agent.currentTask && (
              <p className="text-xs text-gray-600 mt-4 truncate">Task: {agent.currentTask}</p>
            )}
            {agent.lastActivity && (
              <p className="text-xs text-gray-500 mt-2">
                Last: {new Date(agent.lastActivity).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className={cn('border rounded-lg p-8 m-8', bgColor)}>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
        <p className="text-sm text-gray-600 mt-2">{`Type: ${agent.type}`}</p>
      </div>

      {/* Status Section */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-gray-600 font-semibold">Status</p>
          <span className={cn('inline-block text-sm px-6 py-2 rounded-full font-medium mt-2', statusColors[agent.status as keyof typeof statusColors])}>
            {agent.status}
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-600 font-semibold">Confidence</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-32 bg-gray-200 rounded-full h-4">
              <div
                className={cn('h-4 rounded-full', confidencePercent >= 80 ? 'bg-green-500' : confidencePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700">{confidencePercent}%</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {agent.status === 'running' && agent.progress !== undefined && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-gray-600 font-semibold">Progress</p>
            <span className="text-sm font-medium text-gray-900">{agent.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(agent.progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded p-6 border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold">Queue Depth</p>
          <p className="text-lg font-bold text-gray-900 mt-2">{agent.queueDepth}</p>
        </div>

        <div className="bg-white rounded p-6 border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold">Tokens Used</p>
          <p className="text-lg font-bold text-gray-900 mt-2">{agent.tokensUsed?.toLocaleString() || '0'}</p>
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-8 p-6 bg-white rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-2">Current Task</p>
          <p className="text-sm text-gray-900">{agent.currentTask}</p>
        </div>
      )}

      {/* Error Message */}
      {agent.errorMessage && (
        <div className="mb-8 p-6 bg-red-50 rounded border border-red-200">
          <p className="text-xs text-red-600 font-semibold mb-2">Error</p>
          <p className="text-sm text-red-700">{agent.errorMessage}</p>
        </div>
      )}

      {/* Last Activity */}
      {agent.lastActivity && (
        <div className="mb-8 text-xs text-gray-500">
          Last activity: {new Date(agent.lastActivity).toLocaleString()}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {agent.status === 'running' && (
          <button
            onClick={onPause}
            disabled={isPauseLoading}
            className="flex-1 px-6 py-4 text-sm font-medium bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-md transition-colors"
          >
            {isPauseLoading ? 'Pausing...' : 'Pause'}
          </button>
        )}

        {agent.status === 'paused' && (
          <button
            onClick={onResume}
            disabled={isPauseLoading}
            className="flex-1 px-6 py-4 text-sm font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-md transition-colors"
          >
            {isPauseLoading ? 'Resuming...' : 'Resume'}
          </button>
        )}

        {(agent.status === 'running' || agent.status === 'paused') && (
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentCard;
