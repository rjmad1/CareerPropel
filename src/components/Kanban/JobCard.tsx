'use client';

import React, { useState, useEffect } from 'react';
import { Job, JobStage, PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/types/job';
import { useRealTime } from '@/hooks/useRealTime';

export interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggedOver?: boolean;
  onMoveStage?: (jobId: string, targetStage: JobStage) => void;
}

/**
 * JobCard - Individual job application card in the Kanban board
 * 
 * Features:
 * - Real-time updates via WebSocket
 * - Drag-and-drop support with HTML5 and keyboard arrows
 * - WCAG 2.1 AA Compliant: focus states, explicit roles, screen-reader guidance
 * - Match score indicator
 * - Priority level visualization
 * - Interview status badge
 * - Confidence indicator
 * - Risks/blockers display
 */
export const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  onDragStart,
  isDraggedOver = false,
  onMoveStage,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { subscribe } = useRealTime();

  // Subscribe to updates for this specific job
  useEffect(() => {
    const unsubscribe = subscribe('job:update', (message: any) => {
      if (message.type === 'job:update' && message.data.jobId === job.id) {
        setIsUpdating(true);
        const timer = setTimeout(() => setIsUpdating(false), 1500);
        return () => clearTimeout(timer);
      }
    });

    return unsubscribe;
  }, [job.id, subscribe]);

  const jobAny = job as any;
  const stageBorder = STAGE_COLORS[job.stage]?.border || 'border-slate-200';
  const priorityColor = getPriorityColor(jobAny.priority || 'medium');
  const confidenceColor = getConfidenceColor(jobAny.aiConfidence || 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveStage('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveStage('right');
    }
  };

  const moveStage = (direction: 'left' | 'right') => {
    const currentIndex = PIPELINE_STAGES.indexOf(job.stage);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === 'left' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'right' && currentIndex < PIPELINE_STAGES.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex && onMoveStage) {
      onMoveStage(job.id, PIPELINE_STAGES[newIndex]);
    }
  };

  const ariaLabel = `${job.title} at ${job.company}. Priority: ${jobAny.priority || 'medium'}. Match score: ${Math.round(job.matchScore)}%. Stage: ${STAGE_LABELS[job.stage]}. Press Enter to view details, Left/Right arrows to move stages.`;

  return (
    <div
      onClick={onClick}
      onDragStart={onDragStart}
      onKeyDown={handleKeyDown}
      draggable
      tabIndex={0}
      role="listitem"
      aria-label={ariaLabel}
      className={`
        job-card bg-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing
        border-l-4 p-5 space-y-4 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${isDraggedOver ? 'ring-2 ring-blue-400 opacity-75' : ''}
        ${isUpdating ? 'ring-2 ring-emerald-400' : ''}
        ${stageBorder}
      `}
      data-testid="job-card"
      data-cy={`job-card-${job.id}`}
    >
      {/* Updating indicator */}
      {isUpdating && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-400 animate-pulse" />
      )}

      {/* Header: Role + Company + Priority */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-sm truncate leading-snug">
              {job.title}
            </h4>
            <p className="text-xs text-slate-500 truncate font-semibold leading-normal mt-0.5">{job.company}</p>
          </div>
          <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 ${priorityColor}`}>
            {jobAny.priority || 'medium'}
          </div>
        </div>
      </div>

      {/* Match Score Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Match Score</span>
          <span className="font-bold text-slate-900">
            {Math.round(job.matchScore)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getMatchScoreColor(
              job.matchScore
            )}`}
            style={{ width: `${job.matchScore}%` }}
          />
        </div>
      </div>

      {/* Interview Status Badge */}
      {jobAny.interviewStatus && jobAny.interviewStatus !== 'not_started' && (
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-500 font-medium">Status:</span>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getInterviewStatusColor(jobAny.interviewStatus)}`}>
            {formatInterviewStatus(jobAny.interviewStatus)}
          </span>
        </div>
      )}

      {/* Metrics Row: Confidence + Resume + Recruiter */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-medium">
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
          <div className="text-slate-400">Confidence</div>
          <div className={`font-bold mt-0.5 ${confidenceColor}`}>
            {Math.round((jobAny.aiConfidence || 0) * 100)}%
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
          <div className="text-slate-400">Resume</div>
          <div className="font-bold text-slate-800 mt-0.5">
            {jobAny.resumeVersion || '—'}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
          <div className="text-slate-400">Recruiter</div>
          <div className="font-bold text-slate-800 mt-0.5">
            {!jobAny.recruiterStatus || jobAny.recruiterStatus === 'not_contacted'
              ? '—'
              : jobAny.recruiterStatus.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Risks/Blockers Indicators */}
      {((jobAny.risks?.length > 0) || (jobAny.blockers?.length > 0)) && (
        <div className="flex gap-2 text-[10px] font-bold">
          {jobAny.risks?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">
              <span>⚠️</span>
              <span>{jobAny.risks.length} risk{jobAny.risks.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {jobAny.blockers?.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg">
              <span>🚫</span>
              <span>{jobAny.blockers.length} blocker{jobAny.blockers.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Next Action Preview */}
      {jobAny.nextAction && (
        <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium">
          <span className="text-slate-400">Next:</span> {jobAny.nextAction}
        </div>
      )}

      {/* Application Date */}
      <div className="pt-2 text-[10px] font-semibold text-slate-400">
        Applied {formatDate(job.appliedAt || job.createdAt)}
      </div>

      {/* Mobile: prev/next stage buttons */}
      <div className="lg:hidden flex gap-1.5 pt-1 border-t border-slate-100">
        <button
          onClick={(e) => { e.stopPropagation(); moveStage('left'); }}
          disabled={PIPELINE_STAGES.indexOf(job.stage) === 0}
          aria-label="Move to previous stage"
          className="flex-1 text-xs text-slate-500 hover:text-slate-700 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); moveStage('right'); }}
          disabled={PIPELINE_STAGES.indexOf(job.stage) === PIPELINE_STAGES.length - 1}
          aria-label="Move to next stage"
          className="flex-1 text-xs text-slate-500 hover:text-slate-700 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

function getPriorityColor(
  priority: string
): string {
  const colors: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600 border border-slate-200',
    medium: 'bg-blue-50 text-blue-600 border border-blue-100',
    high: 'bg-amber-50 text-amber-600 border border-amber-100',
    critical: 'bg-red-50 text-red-600 border border-red-100',
  };
  return colors[priority] || colors.medium;
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-emerald-600';
  if (confidence >= 0.6) return 'text-blue-600';
  if (confidence >= 0.4) return 'text-amber-600';
  return 'text-red-600';
}

function getInterviewStatusColor(status: string): string {
  const colors: Record<string, string> = {
    not_started: 'bg-slate-100 text-slate-600 border border-slate-200',
    scheduled: 'bg-blue-50 text-blue-600 border border-blue-100',
    in_progress: 'bg-purple-50 text-purple-600 border border-purple-100',
    completed: 'bg-slate-100 text-slate-600 border border-slate-200',
    passed: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    failed: 'bg-red-50 text-red-600 border border-red-100',
  };
  return colors[status] || colors.not_started;
}

function formatInterviewStatus(status: string): string {
  const labels: Record<string, string> = {
    not_started: 'Not Started',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    passed: 'Passed',
    failed: 'Failed',
  };
  return labels[status] || status;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default JobCard;
