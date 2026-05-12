'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Job, JobStage, getAllSwimlaneStages, isValidTransition } from '@/types/job';
import { Swimlane } from './Swimlane';
import { JobDetailPanel } from '@/domains/jobs';
import { useRealTime } from '@/hooks/useRealTime';

interface KanbanBoardProps {
  initialJobs?: Job[];
  onJobUpdate?: (jobId: string, updates: Partial<Job>) => Promise<void>;
  onJobClick?: (job: Job) => void;
}

/**
 * KanbanBoard - Main Kanban/swimlane view of job applications
 * 
 * Features:
 * - Real-time job updates via WebSocket
 * - Drag-and-drop between swimlanes
 * - Optimistic updates for smooth UX
 * - Animated transitions
 * - Stage-based organization
 * - Swimlane statistics
 * 
 * Layout:
 * - Horizontal scroll container with swimlanes
 * - Each swimlane represents a job application stage
 * - Jobs flow left-to-right through pipeline
 * 
 * WebSocket subscriptions:
 * - 'job:update' - Real-time job changes
 * - 'job:created' - New jobs added
 * - 'job:deleted' - Jobs removed
 * 
 * Props:
 * - initialJobs?: Initial job data
 * - onJobUpdate?: Callback to persist job changes
 * - onJobClick?: Callback when job card clicked
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialJobs = [],
  onJobUpdate,
  onJobClick,
}) => {
  // State
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, Partial<Job>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // WebSocket connection
  const { connected, subscribe } = useRealTime({
    autoConnect: true,
    channels: ['job:update', 'job:created', 'job:deleted'],
  });

  // Subscribe to job updates
  useEffect(() => {
    const unsubscribe = subscribe('job:update', (message: any) => {
      if (message.type === 'job:update') {
        const { jobId, changes } = message.data;
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, ...changes } : job
          )
        );
        // Clear optimistic update after real update received
        setOptimisticUpdates((prev) => {
          const updated = { ...prev };
          delete updated[jobId];
          return updated;
        });
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Subscribe to new jobs
  useEffect(() => {
    const unsubscribe = subscribe('job:created', (message: any) => {
      if (message.type === 'job:created') {
        setJobs((prev) => [...prev, message.data.job]);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Subscribe to job deletions
  useEffect(() => {
    const unsubscribe = subscribe('job:deleted', (message: any) => {
      if (message.type === 'job:deleted') {
        setJobs((prev) => prev.filter((j) => j.id !== message.data.jobId));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  /**
   * Handle job drop on swimlane - move job to new stage
   */
  const handleJobDrop = useCallback(
    async (jobId: string, targetStage: JobStage) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      // Validate transition
      if (!isValidTransition(job.stage, targetStage)) {
        setError(`Cannot move from ${job.stage} to ${targetStage}`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      try {
        // Optimistic update
        const updates = { stage: targetStage };
        setOptimisticUpdates((prev) => ({
          ...prev,
          [jobId]: updates,
        }));
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j))
        );

        // Persist to backend
        if (onJobUpdate) {
          await onJobUpdate(jobId, updates);
        }
      } catch (err) {
        // Revert optimistic update on error
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, stage: job.stage } : j
          )
        );
        setOptimisticUpdates((prev) => {
          const updated = { ...prev };
          delete updated[jobId];
          return updated;
        });
        setError('Failed to update job');
      }
    },
    [jobs, onJobUpdate]
  );

  /**
   * Group jobs by stage
   */
  const jobsByStage = useCallback((): Record<JobStage, Job[]> => {
    const grouped: Record<JobStage, Job[]> = {
      sourced: [],
      interested: [],
      resume_tailoring: [],
      applied: [],
      recruiter_screen: [],
      hiring_manager: [],
      technical_interview: [],
      system_design: [],
      behavioral: [],
      final_round: [],
      offer: [],
      negotiation: [],
      rejected: [],
      archived: [],
    };

    jobs.forEach((job) => {
      grouped[job.stage].push(job);
    });

    return grouped;
  }, [jobs]);

  /**
   * Calculate board statistics
   */
  const getStats = () => {
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(
        (j) =>
          j.stage !== 'rejected' &&
          j.stage !== 'archived' &&
          j.stage !== 'offer'
      ).length,
      offers: jobs.filter((j) => j.stage === 'offer').length,
      rejected: jobs.filter((j) => j.stage === 'rejected').length,
      averageConfidence:
        jobs.length > 0
          ? Math.round(
              (jobs.reduce((sum, j) => sum + j.aiConfidence, 0) / jobs.length) *
                100
            )
          : 0,
    };
  };

  const stats = getStats();
  const groupedJobs = jobsByStage();

  return (
    <div
      className="flex flex-col h-full bg-gray-50"
      data-cy="kanban-board"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Pipeline</h1>
            <p className="text-sm text-gray-600 mt-1">
              Drag jobs between stages to move them forward
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalJobs}
              </div>
              <div className="text-xs text-gray-600">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.activeJobs}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.offers}
              </div>
              <div className="text-xs text-gray-600">Offers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageConfidence}%
              </div>
              <div className="text-xs text-gray-600">Avg Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-700 flex-shrink-0">
          ⚠️ Disconnected from real-time updates. Changes will be synced when reconnected.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700 flex-shrink-0">
          ❌ {error}
        </div>
      )}

      {/* Swimlanes Container */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden min-h-0"
        data-cy="swimlanes-container"
      >
        <div className="inline-flex gap-0 h-full min-w-min">
          {getAllSwimlaneStages().map(([stage, config]) => (
            <Swimlane
              key={stage}
              stage={stage}
              config={config}
              jobs={groupedJobs[stage]}
              isLoading={isLoading}
              onJobDrop={handleJobDrop}
              onJobClick={(job) => {
                setSelectedJobId(job.id);
                onJobClick?.(job);
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute bottom-4 right-4">
          <div className="animate-spin">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      )}

      {/* Job Detail Panel */}
      {selectedJobId && (
        <JobDetailPanel
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
