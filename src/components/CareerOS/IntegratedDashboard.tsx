'use client';

import React, { useState } from 'react';
import { AgentRail } from '@/components/Agent/AgentRail';
import { useProfile } from '@/hooks/useProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

/**
 * IntegratedDashboard - The main Career OS control center
 * 
 * 3-column layout:
 * - Left (w-64): AgentRail with live agent status
 * - Center (flex-1): Job Kanban board (swimlanes)
 * - Right (w-80): Context panel (profile/agent details)
 * 
 * Real-time sync across all sections via WebSocket
 */
export const IntegratedDashboard: React.FC<{ candidateId: string }> = ({
  candidateId,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [_selectedAgentId, _setSelectedAgentId] = useState<string | null>(null);

  const { score: profileScore, recommendations: _recommendations } = useProfile(candidateId);
  const { completeness, breakdown } = useProfileCompletion(candidateId);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left: Agent Rail */}
      <div className="w-64 border-r border-gray-700 overflow-y-auto bg-gray-800">
        <AgentRail />
      </div>

      {/* Center: Kanban Board */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 bg-gray-800">
          <h1 className="text-2xl font-bold text-white">Career OS</h1>
          <p className="text-sm text-gray-400 mt-1">
            🤖 AI-Powered Career Execution Platform
          </p>
        </div>

        {/* Kanban Grid */}
        <div className="flex-1 overflow-x-auto p-6 space-y-4">
          {/* Swimlane Labels */}
          <div className="grid grid-cols-8 gap-4 px-4">
            {[
              'Sourced',
              'Interested',
              'Tailoring',
              'Applied',
              'Screen',
              'Interview',
              'Final',
              'Offer',
            ].map((stage) => (
              <div key={stage} className="text-sm font-semibold text-gray-400">
                {stage}
              </div>
            ))}
          </div>

          {/* Cards (Mock) */}
          <div className="grid grid-cols-8 gap-4 px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((stage) => (
              <div
                key={`col-${stage}`}
                className="space-y-3 bg-gray-700 rounded-lg p-3 min-h-96"
              >
                {stage <= 3 && (
                  <div
                    className="p-3 bg-blue-900 border border-blue-700 rounded cursor-pointer hover:bg-blue-800 transition-colors"
                    onClick={() => setSelectedJobId(`job_${stage}`)}
                  >
                    <p className="font-semibold text-sm">Senior Engineer</p>
                    <p className="text-xs text-gray-300 mt-1">TechCorp Inc</p>
                    <div className="flex gap-1 mt-2">
                      <span className="text-xs bg-blue-700 px-2 py-0.5 rounded">
                        🤖 AI 85%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Context Panel */}
      <div className="w-80 border-l border-gray-700 overflow-y-auto bg-gray-800 p-4">
        {selectedJobId ? (
          <div>
            <h3 className="font-bold text-lg mb-4">Job Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Role</p>
                <p className="font-semibold">Senior Engineer</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Company</p>
                <p className="font-semibold">TechCorp Inc</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Match Score</p>
                <div className="w-full bg-gray-700 rounded h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: '75%' }}
                  />
                </div>
                <p className="text-sm text-green-400 mt-1">75% Match</p>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
                View Full Details
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-lg mb-4">Profile Status</h3>
            {profileScore ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Completeness</p>
                  <div className="w-full bg-gray-700 rounded h-2">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    {completeness}% Complete
                  </p>
                </div>

                <div className="text-xs">
                  <p className="text-gray-400 mb-2">Score Breakdown</p>
                  <div className="space-y-1">
                    {Object.entries(breakdown || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-gray-400">{key}</span>
                        <span className="font-semibold text-gray-200">
                          {value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
                  Edit Profile
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Loading profile...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedDashboard;
