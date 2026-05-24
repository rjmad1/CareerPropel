'use client';

import React, { useState, useRef } from 'react';
import { Job, JobStage } from '@/types/job';
import { JobCard } from './JobCard';

export interface SwimlaneConfig {
  label: string;
  borderColor: string;
  bgColor?: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface SwimlaneProps {
  stage: JobStage;
  config: SwimlaneConfig;
  jobs: Job[];
  isLoading?: boolean;
  onJobDrop?: (jobId: string, targetStage: JobStage) => void;
  onJobClick?: (job: Job) => void;
  onJobMoveStage?: (jobId: string, targetStage: JobStage) => void;
  /** Optional custom renderer — replaces the default JobCard when provided.
   *  Receives the job plus all handlers so consumers can wrap/enhance JobCard
   *  without reimplementing drag-and-drop or click logic. */
  renderJobCard?: (
    job: Job,
    handlers: {
      onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
      onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
      onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
      onClick: (job: Job) => void;
      draggableProps?: Record<string, unknown>;
      isDragging?: boolean;
    },
  ) => React.ReactNode;
}

/**
 * Swimlane - A vertical column representing one job application stage
 * 
 * Features:
 * - Displays all jobs in a specific stage
 * - Drag-and-drop support for moving jobs between stages
 * - Real-time updates from WebSocket
 * - Visual indicators (count, stage icon, color)
 * - Scrollable job list
 * 
 * Props:
 * - stage: The job stage this swimlane represents
 * - config: Visual configuration (color, icon, label)
 * - jobs: Array of jobs in this stage
 * - isLoading?: Whether data is loading
 * - onJobDrop?: Callback when job is dropped on this swimlane
 * - onJobClick?: Callback when job card is clicked
 */
export const Swimlane: React.FC<SwimlaneProps> = ({
  stage,
  config,
  jobs,
  isLoading = false,
  onJobDrop,
  onJobClick,
  onJobMoveStage,
  renderJobCard,
}) => {
  const [dragOverJob, setDragOverJob] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the swimlane entirely
    if (e.currentTarget === scrollContainerRef.current) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragOverJob(null);

    const jobId = e.dataTransfer.getData('jobId');
    if (jobId && onJobDrop) {
      onJobDrop(jobId, stage);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-0 w-64 sm:w-72 lg:w-80 xl:w-96 ${config.color} border-r ${config.borderColor} flex-shrink-0`}
      data-cy={`swimlane-${stage}`}
    >
      {/* Header */}
      <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b ${config.borderColor} flex-shrink-0`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-xl">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{config.label}</h3>
            <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block truncate">{config.description}</p>
          </div>
          <div className="bg-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold text-gray-900 shrink-0">
            {jobs.length}
          </div>
        </div>
      </div>

      {/* Jobs Container */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-3 transition-colors ${
          isDragOver ? 'bg-opacity-75' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-cy={`swimlane-jobs-${stage}`}
      >
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white rounded shadow animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          // Job cards — use custom renderer when provided (e.g. to overlay agent badges)
          jobs.map((job) => {
            const cardHandlers = {
              onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('jobId', job.id);
              },
              onDragEnd: (_e: React.DragEvent<HTMLDivElement>) => {
                setDragOverJob(null);
              },
              onClick: (j: Job) => onJobClick?.(j),
              isDragging: dragOverJob === job.id,
            };

            return renderJobCard ? (
              <React.Fragment key={job.id}>{renderJobCard(job, cardHandlers)}</React.Fragment>
            ) : (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => onJobClick?.(job)}
                onDragStart={cardHandlers.onDragStart}
                isDraggedOver={dragOverJob === job.id}
                onMoveStage={onJobMoveStage}
              />
            );
          })
        ) : (
          // Empty state
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <p>No jobs here</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Stage info */}
      <div className={`px-4 py-2 sm:px-6 sm:py-3 border-t ${config.borderColor} text-xs text-gray-600 flex-shrink-0`}>
        <div className="flex justify-between">
          <span>Average match score:</span>
          <span className="font-semibold">
            {jobs.length > 0
              ? Math.round(
                  jobs.reduce((sum, j) => sum + j.matchScore, 0) / jobs.length
                )
              : '-'}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default Swimlane;
