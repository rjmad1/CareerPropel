'use client';

import React, { useState, useEffect } from 'react';
import { Agent, AgentLog as AgentLogType } from '@/lib/websocket/types';
import { AGENT_CONFIGS } from '@/types/agent-configs';
import { useRealTime } from '@/hooks/useRealTime';
import { AgentCard } from './AgentCard';
import AgentLog from './AgentLog';

/**
 * AgentRail - Real-time sidebar showing all agents and their status
 * 
 * Layout: 2-column (w-64 list + flex-1 details)
 * 
 * Features:
 * - Real-time agent status updates via WebSocket
 * - Agent selection and detail expansion
 * - Progress bar for running agents
 * - Expandable logs for each agent
 * - Connection status indicator
 * - Metrics display (queue depth, confidence, tokens, last activity)
 * 
 * WebSocket subscriptions:
 * - 'agent:status' - Updates agent state
 * - 'agent:log' - Appends logs (keeps last 100)
 * 
 * Data attributes for E2E testing:
 * - data-cy="agent-rail"
 * - data-cy="agent-rail-item-{id}"
 * - data-cy="agent-progress-bar"
 */
export const AgentRail: React.FC = () => {
  // State
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [logs, setLogs] = useState<Record<string, AgentLogType[]>>({});
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState(false);

  // WebSocket connection
  const { connected, subscribe } = useRealTime({
    autoConnect: true,
    channels: ['agent:status', 'agent:log'],
  });

  // Initialize agents from configs
  useEffect(() => {
    const initialAgents: Record<string, Agent> = {};
    Object.entries(AGENT_CONFIGS).forEach(([type, config]) => {
      initialAgents[type] = {
        id: type,
        type: type as any,
        name: config.name,
        status: 'idle',
        progress: 0,
        queueDepth: 0,
        lastActivity: new Date(),
        tokensUsed: 0,
        confidence: 0.8,
        errorMessage: undefined,
        currentTask: undefined,
      };
    });
    setAgents(initialAgents);
  }, []);

  // Subscribe to agent status updates
  useEffect(() => {
    const unsubscribe = subscribe('agent:status', (message: any) => {
      if (message.type === 'agent:status') {
        setAgents((prev) => ({
          ...prev,
          [message.data.id]: {
            ...prev[message.data.id],
            ...message.data,
          },
        }));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Subscribe to agent logs
  useEffect(() => {
    const unsubscribe = subscribe('agent:log', (message: any) => {
      if (message.type === 'agent:log') {
        setLogs((prev) => {
          const agentId = message.data.agentId;
          const agentLogs = prev[agentId] || [];
          // Keep last 100 logs per agent
          const newLogs = [...agentLogs, message.data].slice(-100);
          return {
            ...prev,
            [agentId]: newLogs,
          };
        });
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Get selected agent
  const selectedAgent = selectedAgentId ? agents[selectedAgentId] : null;
  const selectedAgentLogs = selectedAgentId ? logs[selectedAgentId] || [] : [];

  return (
    <div
      className="flex h-full bg-white border-r border-gray-200"
      data-cy="agent-rail"
    >
      {/* Left Panel: Agent List (w-64) */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-lg">🤖</span>
            <h2 className="font-semibold text-gray-900">Agents</h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div
              className={`w-4 h-4 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-gray-600">
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Agent List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {Object.values(agents).map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isCompact={true}
                isSelected={selectedAgentId === agent.id}
                onSelect={() => setSelectedAgentId(agent.id)}
              />
            ))}
          </div>
        </div>

        {/* Footer: Summary */}
        <div className="px-8 py-6 border-t border-gray-200 text-xs text-gray-600">
          <div>{Object.keys(agents).length} agents active</div>
          <div>
            {Object.values(agents).filter((a) => a.status === 'running').length}{' '}
            running
          </div>
        </div>
      </div>

      {/* Right Panel: Agent Details (flex-1) */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <>
            {/* Agent Details */}
            <div className="flex-1 overflow-y-auto">
              <AgentCard agent={selectedAgent} isCompact={false} />
            </div>

            {/* Logs Section */}
            <div className="border-t border-gray-200">
              {/* Logs Header */}
              <div
                onClick={() => setExpandedLogs(!expandedLogs)}
                className="px-8 py-6 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
              >
                <h3 className="font-semibold text-sm text-gray-900">
                  Activity Log ({selectedAgentLogs.length})
                </h3>
                <span className="text-xs text-gray-500">
                  {expandedLogs ? '▼' : '▶'}
                </span>
              </div>

              {/* Logs List */}
              {expandedLogs && (
                <div className="max-h-64 overflow-y-auto border-t border-gray-200">
                  {selectedAgentLogs.length > 0 ? (
                    <div className="space-y-2 p-6">
                      {selectedAgentLogs.map((log, idx) => (
                        <AgentLog
                          key={`${log.timestamp}-${idx}`}
                          log={log}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                      No logs yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // No agent selected
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-gray-500 text-sm">
                Select an agent to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentRail;
