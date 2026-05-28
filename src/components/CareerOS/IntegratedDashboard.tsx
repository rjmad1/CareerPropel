'use client';

import React from 'react';
import { AgentRail } from '@/components/Agent/AgentRail';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';
import { useProfile } from '@/hooks/useProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useJobBoard } from '@/hooks/useJobBoard';

export const IntegratedDashboard: React.FC<{ candidateId: string }> = ({
  candidateId,
}) => {
  const { score: profileScore } = useProfile(candidateId);
  const { completeness, breakdown } = useProfileCompletion(candidateId);
  const { jobs, loading, error, moveJob } = useJobBoard();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left: Agent Rail */}
      <div className="w-64 border-r border-gray-700 overflow-y-auto bg-gray-800 flex-shrink-0">
        <AgentRail />
      </div>

      {/* Center: Real Kanban Board */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 bg-gray-800 flex-shrink-0 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Career OS</h1>
            <p className="text-xs text-gray-400 mt-1">AI-Powered Career Execution Platform</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-300 block">Integrated Dashboard</span>
            <span className="text-xs text-gray-400 block font-mono">Candidate: Raja Jeevan Kumar Maduri</span>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
            Loading jobs…
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center flex-1 text-red-400 text-sm">
            Failed to load jobs: {error.message}
          </div>
        )}

        {/* Kanban — only mounted when data is ready; WebSocket listeners attach on mount */}
        {!loading && !error && (
          <div className="flex-1 overflow-hidden">
            <KanbanBoard
              initialJobs={jobs}
              onJobMove={(id, stage) => moveJob(id, stage as Parameters<typeof moveJob>[1])}
            />
          </div>
        )}
      </div>

      {/* Right: Profile Status */}
      <div className="w-72 border-l border-gray-700 overflow-y-auto bg-gray-800 p-6 flex-shrink-0">
        <h3 className="font-bold text-base mb-6 text-white">Profile Status</h3>
        {profileScore ? (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400">Completeness</p>
                <span className="text-sm font-semibold text-gray-200">{completeness}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-3">Score Breakdown</p>
              <div className="space-y-2">
                {Object.entries(breakdown || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize text-xs text-gray-400">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-300 w-8 text-right">
                        {value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Overall Score</p>
              <p className="text-2xl font-bold text-white">
                {profileScore.totalScore ?? 0}
                <span className="text-sm text-gray-400 font-normal">/100</span>
              </p>
            </div>

            <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Edit Profile
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Loading profile…</p>
        )}
      </div>
    </div>
  );
};

export default IntegratedDashboard;
