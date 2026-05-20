'use client';

import React, { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { useRealTime } from '@/hooks/useRealTime';

export interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggedOver?: boolean;
}

/**
 * JobCard - Individual job application card in the Kanban board
 * 
 * Features:
 * - Real-time updates via WebSocket
 * - Drag-and-drop support
 * - Match score indicator
 * - Priority level visualization
 * - Interview status badge
 * - Confidence indicator
 * - Quick action hints
 * - Risks/blockers display
 * 
 * Displays:
 * - Role name
 * - Company name
 * - Match score (0-100%)
 * - Interview status
 * - Priority badge
 * - Confidence indicator
 * - Risk/blocker indicators
 * - Next action preview
 * 
 * Props:
 * - job: Job data object
 * - onClick?: Callback when card is clicked
 * - onDragStart?: Callback for drag start
 * - isDraggedOver?: Visual indication if dragged over
 */
export const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  onDragStart,
  isDraggedOver = false,
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
  const stageConfig = { borderColor: 'border-gray-300' };
  const priorityColor = getPriorityColor(jobAny.priority || 'medium');
  const confidenceColor = getConfidenceColor(jobAny.aiConfidence || 0);

  return (
    <div
      onClick={onClick}
      onDragStart={onDragStart}
      draggable
      className={`
        job-card bg-white rounded-lg shadow hover:shadow-md transition-all cursor-move
        border-l-4 p-6 space-y-4 relative overflow-hidden
        ${isDraggedOver ? 'ring-2 ring-blue-400 opacity-75' : ''}
        ${isUpdating ? 'ring-2 ring-green-400' : ''}
        ${stageConfig.borderColor}
      `}
      data-testid="job-card"
      data-cy={`job-card-${job.id}`}
    >
      {/* Updating indicator */}
      {isUpdating && (
        <div className="absolute top-0 left-0 right-0 h-2 bg-green-400 animate-pulse" />
      )}

      {/* Header: Role + Company + Priority */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {job.title}
            </h4>
            <p className="text-xs text-gray-600 truncate">{job.company}</p>
          </div>
          <div className={`px-4 py-0.5 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 ${priorityColor}`}>
            {(jobAny.priority || 'medium').charAt(0).toUpperCase() + (jobAny.priority || 'medium').slice(1)}
          </div>
        </div>
      </div>

      {/* Match Score Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Match Score</span>
          <span className="text-xs font-semibold text-gray-900">
            {Math.round(job.matchScore)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${getMatchScoreColor(
              job.matchScore
            )}`}
            style={{ width: `${job.matchScore}%` }}
          />
        </div>
      </div>

      {/* Interview Status Badge */}
      {jobAny.interviewStatus && jobAny.interviewStatus !== 'not_started' && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">Status:</span>
          <span className={`px-4 py-0.5 rounded text-xs font-semibold ${getInterviewStatusColor(jobAny.interviewStatus)}`}>
            {formatInterviewStatus(jobAny.interviewStatus)}
          </span>
        </div>
      )}

      {/* Metrics Row: Confidence + Resume + Recruiter */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-gray-600">Confidence</div>
          <div className={`font-semibold ${confidenceColor}`}>
            {Math.round((jobAny.aiConfidence || 0) * 100)}%
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-gray-600">Resume</div>
          <div className="font-semibold text-gray-900">
            {jobAny.resumeVersion || '—'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-gray-600">Recruiter</div>
          <div className="font-semibold text-gray-900">
            {!jobAny.recruiterStatus || jobAny.recruiterStatus === 'not_contacted'
              ? '—'
              : jobAny.recruiterStatus.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Risks/Blockers Indicators */}
      {((jobAny.risks?.length > 0) || (jobAny.blockers?.length > 0)) && (
        <div className="flex gap-4 text-xs">
          {jobAny.risks?.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded">
              <span>⚠️</span>
              <span>{jobAny.risks.length} risk{jobAny.risks.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {jobAny.blockers?.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded">
              <span>🚫</span>
              <span>{jobAny.blockers.length} blocker{jobAny.blockers.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Next Action Preview */}
      {jobAny.nextAction && (
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
          <span className="text-gray-500">Next:</span> {jobAny.nextAction}
        </div>
      )}

      {/* Application Date */}
      <div className="pt-2 text-xs text-gray-500">
        Applied {formatDate(job.appliedAt || job.createdAt)}
      </div>
    </div>
  );
};

function getPriorityColor(
  priority: string
): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return colors[priority] || colors.medium;
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-700';
  if (confidence >= 0.6) return 'text-blue-700';
  if (confidence >= 0.4) return 'text-yellow-700';
  return 'text-red-700';
}

function getInterviewStatusColor(status: string): string {
  const colors: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-gray-100 text-gray-700',
    passed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
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
