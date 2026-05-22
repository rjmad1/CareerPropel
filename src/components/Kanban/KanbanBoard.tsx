'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Job, JobStage, PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/types/job';
import { Swimlane, SwimlaneConfig } from './Swimlane';
import { JobCard } from './JobCard';
import { JobDetailPanel } from '@/domains/jobs';
import { useRealTime } from '@/hooks/useRealTime';
import { AnyWebSocketMessage } from '@/lib/websocket/types';

// Per-stage visual config: icon, description, and colours pulled from STAGE_COLORS
const STAGE_CONFIG: Record<JobStage, SwimlaneConfig> = {
  sourced: {
    label: STAGE_LABELS.sourced,
    icon: '🔍',
    description: 'Discovered and saved',
    borderColor: STAGE_COLORS.sourced.border,
    color: STAGE_COLORS.sourced.bg,
  },
  interested: {
    label: STAGE_LABELS.interested,
    icon: '⭐',
    description: 'Planning to apply',
    borderColor: STAGE_COLORS.interested.border,
    color: STAGE_COLORS.interested.bg,
  },
  resume_tailoring: {
    label: STAGE_LABELS.resume_tailoring,
    icon: '✍️',
    description: 'Customising resume',
    borderColor: STAGE_COLORS.resume_tailoring.border,
    color: STAGE_COLORS.resume_tailoring.bg,
  },
  applied: {
    label: STAGE_LABELS.applied,
    icon: '📤',
    description: 'Application submitted',
    borderColor: STAGE_COLORS.applied.border,
    color: STAGE_COLORS.applied.bg,
  },
  recruiter_screen: {
    label: STAGE_LABELS.recruiter_screen,
    icon: '📞',
    description: 'Recruiter call booked',
    borderColor: STAGE_COLORS.recruiter_screen.border,
    color: STAGE_COLORS.recruiter_screen.bg,
  },
  hiring_manager: {
    label: STAGE_LABELS.hiring_manager,
    icon: '👔',
    description: 'Hiring manager screen',
    borderColor: STAGE_COLORS.hiring_manager.border,
    color: STAGE_COLORS.hiring_manager.bg,
  },
  technical_interview: {
    label: STAGE_LABELS.technical_interview,
    icon: '💻',
    description: 'Technical round',
    borderColor: STAGE_COLORS.technical_interview.border,
    color: STAGE_COLORS.technical_interview.bg,
  },
  system_design: {
    label: STAGE_LABELS.system_design,
    icon: '🏗️',
    description: 'System design interview',
    borderColor: STAGE_COLORS.system_design.border,
    color: STAGE_COLORS.system_design.bg,
  },
  behavioral: {
    label: STAGE_LABELS.behavioral,
    icon: '🗣️',
    description: 'Behavioural round',
    borderColor: STAGE_COLORS.behavioral.border,
    color: STAGE_COLORS.behavioral.bg,
  },
  final_round: {
    label: STAGE_LABELS.final_round,
    icon: '🏆',
    description: 'Final interview',
    borderColor: STAGE_COLORS.final_round.border,
    color: STAGE_COLORS.final_round.bg,
  },
  offer: {
    label: STAGE_LABELS.offer,
    icon: '🎉',
    description: 'Offer received',
    borderColor: STAGE_COLORS.offer.border,
    color: STAGE_COLORS.offer.bg,
  },
  negotiation: {
    label: STAGE_LABELS.negotiation,
    icon: '🤝',
    description: 'Negotiating terms',
    borderColor: STAGE_COLORS.negotiation.border,
    color: STAGE_COLORS.negotiation.bg,
  },
  rejected: {
    label: STAGE_LABELS.rejected,
    icon: '❌',
    description: 'Application closed',
    borderColor: STAGE_COLORS.rejected.border,
    color: STAGE_COLORS.rejected.bg,
  },
  archived: {
    label: STAGE_LABELS.archived,
    icon: '📁',
    description: 'Archived for reference',
    borderColor: STAGE_COLORS.archived.border,
    color: STAGE_COLORS.archived.bg,
  },
};

export interface KanbanBoardProps {
  initialJobs?: Job[];
  onJobUpdate?: (jobId: string, updates: Partial<Job>) => Promise<void>;
  onJobClick?: (job: Job) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialJobs = [],
  onJobUpdate,
  onJobClick,
}) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [mobileStage, setMobileStage] = useState<JobStage>(PIPELINE_STAGES[0]);
  const isLoading = false;

  const { connected, subscribe } = useRealTime({
    autoConnect: true,
    channels: ['job:update', 'job:created', 'job:deleted'],
  });

  useEffect(() => {
    const unsub = subscribe('job:update', (message: AnyWebSocketMessage) => {
      if (message.type === 'job:update') {
        const { jobId, changes } = message.data;
        setJobs((prev) =>
          prev.map((job) => (job.id === jobId ? { ...job, ...(changes as Partial<Job>) } : job))
        );
      }
    });
    return unsub;
  }, [subscribe]);

  useEffect(() => {
    const unsub = subscribe('job:created', (message: AnyWebSocketMessage) => {
      if (message.type === 'job:created') {
        setJobs((prev) => [...prev, message.data.job as unknown as Job]);
      }
    });
    return unsub;
  }, [subscribe]);

  useEffect(() => {
    const unsub = subscribe('job:deleted', (message: AnyWebSocketMessage) => {
      if (message.type === 'job:deleted') {
        setJobs((prev) => prev.filter((j) => j.id !== message.data.jobId));
      }
    });
    return unsub;
  }, [subscribe]);

  const handleJobDrop = useCallback(
    async (jobId: string, targetStage: JobStage) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job || job.stage === targetStage) return;

      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, stage: targetStage } : j)));

      try {
        if (onJobUpdate) await onJobUpdate(jobId, { stage: targetStage });
      } catch {
        // Revert on failure
        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, stage: job.stage } : j)));
        setError('Failed to move job');
      }
    },
    [jobs, onJobUpdate]
  );

  const jobsByStage = useCallback((): Record<JobStage, Job[]> => {
    const grouped = PIPELINE_STAGES.reduce<Record<JobStage, Job[]>>(
      (acc, stage) => ({ ...acc, [stage]: [] }),
      {} as Record<JobStage, Job[]>
    );
    jobs.forEach((job) => {
      grouped[job.stage]?.push(job);
    });
    return grouped;
  }, [jobs]);

  const groupedJobs = jobsByStage();

  return (
    <div className="flex flex-col h-full bg-slate-50" data-cy="kanban-board">
      {!connected && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs font-medium text-amber-800 flex-shrink-0 flex items-center gap-2">
          <span>⚠️</span>
          <span>Disconnected from real-time updates. Changes will sync on reconnect.</span>
        </div>
      )}

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-xs font-medium text-red-800 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
          <button className="underline hover:text-red-900" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Mobile: stage pill selector + vertical list */}
      <div className="lg:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Stage tabs — horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 border-b border-slate-200 bg-white scrollbar-none shrink-0">
          {PIPELINE_STAGES.map((stage) => {
            const count = groupedJobs[stage].length;
            const cfg = STAGE_CONFIG[stage];
            const isActive = mobileStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setMobileStage(stage)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Jobs for selected stage */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {groupedJobs[mobileStage].length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="text-3xl mb-2">{STAGE_CONFIG[mobileStage].icon}</div>
              <p className="text-sm font-medium">No jobs in {STAGE_CONFIG[mobileStage].label}</p>
            </div>
          ) : (
            groupedJobs[mobileStage].map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => {
                  setSelectedJobId(job.id);
                  onJobClick?.(job);
                }}
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('jobId', job.id);
                }}
                onMoveStage={handleJobDrop}
              />
            ))
          )}
        </div>
      </div>

      {/* Desktop: horizontal Kanban swimlanes */}
      <div className="hidden lg:flex flex-1 overflow-x-auto overflow-y-hidden min-h-0" data-cy="swimlanes-container">
        <div className="inline-flex gap-0 h-full min-w-min">
          {PIPELINE_STAGES.map((stage) => (
            <Swimlane
              key={stage}
              stage={stage}
              config={STAGE_CONFIG[stage]}
              jobs={groupedJobs[stage]}
              isLoading={isLoading}
              onJobDrop={handleJobDrop}
              onJobClick={(job) => {
                setSelectedJobId(job.id);
                onJobClick?.(job);
              }}
              onJobMoveStage={handleJobDrop}
            />
          ))}
        </div>
      </div>

      {selectedJobId && (
        <JobDetailPanel jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  );
};

export default KanbanBoard;
