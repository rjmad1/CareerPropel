'use client';

import React, { useState } from 'react';
import { AgentExecution, ToolCall } from '@/types/agent';
import { cn } from '@/lib/utils';

interface AgentExecutionTimelineProps {
  execution: AgentExecution;
  toolCalls: ToolCall[];
}

const statusIconMap = {
  pending: '⏳',
  running: '▶️',
  success: '✅',
  failed: '❌',
};

export const AgentExecutionTimeline: React.FC<AgentExecutionTimelineProps> = ({
  execution,
  toolCalls,
}) => {
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const sortedToolCalls = [...toolCalls].sort((a, b) => {
    const aTime = new Date(a.startedAt).getTime();
    const bTime = new Date(b.startedAt).getTime();
    return aTime - bTime;
  });

  const totalDuration =
    execution.durationMs || sortedToolCalls.reduce((acc, tc) => acc + (tc.duration || 0), 0);

  const getToolStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getProgressPercentage = (toolCall: ToolCall) => {
    if (totalDuration === 0) return 0;
    return ((toolCall.duration || 0) / totalDuration) * 100;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Execution Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold">Status</p>
          <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{execution.status}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold">Tool Calls</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{toolCalls.length}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold">Total Duration</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{totalDuration}ms</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold">Tokens</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{execution.tokenCount || 0}</p>
        </div>
      </div>

      {/* Timeline */}
      {sortedToolCalls.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Execution Timeline</h3>

          {sortedToolCalls.map((toolCall, index) => (
            <div key={toolCall.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Tool Call Header */}
              <div
                onClick={() =>
                  setExpandedToolId(expandedToolId === toolCall.id ? null : toolCall.id)
                }
                className={cn(
                  'p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3',
                  expandedToolId === toolCall.id && 'bg-gray-50'
                )}
              >
                <span className="text-base mt-0.5">
                  {statusIconMap[toolCall.status as keyof typeof statusIconMap] || '❓'}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{toolCall.toolName}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded font-medium border', getToolStatusColor(toolCall.status))}>
                      {toolCall.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Step {index + 1} • {toolCall.duration || 0}ms
                    </span>
                  </div>

                  {/* Duration Bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={cn(
                        'h-1.5 rounded-full',
                        toolCall.status === 'success'
                          ? 'bg-green-500'
                          : toolCall.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                      )}
                      style={{ width: `${getProgressPercentage(toolCall)}%` }}
                    />
                  </div>
                </div>

                <span className="text-gray-400 text-xs flex-shrink-0 mt-1">
                  {expandedToolId === toolCall.id ? '▼' : '▶'}
                </span>
              </div>

              {/* Tool Call Details */}
              {expandedToolId === toolCall.id && (
                <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
                  {/* Timing */}
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">Timing</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div>
                        Started: {toolCall.startedAt ? new Date(toolCall.startedAt).toLocaleTimeString() : 'N/A'}
                      </div>
                      <div>
                        Completed:{' '}
                        {toolCall.completedAt
                          ? new Date(toolCall.completedAt).toLocaleTimeString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  {toolCall.input && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Input</p>
                      <pre className="text-xs bg-white p-2 rounded border border-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(toolCall.input, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Output */}
                  {toolCall.output && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Output</p>
                      <pre className="text-xs bg-white p-2 rounded border border-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(toolCall.output, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {toolCall.error && (
                    <div>
                      <p className="text-xs text-red-600 font-semibold mb-1">Error</p>
                      <p className="text-xs bg-red-50 p-2 rounded border border-red-300 text-red-700">
                        {toolCall.error}
                      </p>
                    </div>
                  )}

                  {/* Tokens */}
                  {toolCall.tokens && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>🔷 Tokens:</span>
                      <span className="font-semibold">{toolCall.tokens}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">No tool calls yet</p>
        </div>
      )}
    </div>
  );
};

export default AgentExecutionTimeline;
