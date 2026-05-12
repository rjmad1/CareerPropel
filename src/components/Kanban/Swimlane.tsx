'use client';

import React, { useState, useRef } from 'react';
import { Job, JobStage, SwimlaneConfig } from '@/types/job';
import { JobCard } from './JobCard';

export interface SwimlaneProps {
  stage: JobStage;
  config: SwimlaneConfig;
  jobs: Job[];
  isLoading?: boolean;
  onJobDrop?: (jobId: string, targetStage: JobStage) => void;
  onJobClick?: (job: Job) => void;
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
      className={`flex flex-col min-h-0 w-96 ${config.color} border-r ${config.borderColor} flex-shrink-0`}
      data-cy={`swimlane-${stage}`}
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b ${config.borderColor} flex-shrink-0`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{config.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{config.label}</h3>
            <p className="text-xs text-gray-600">{config.description}</p>
          </div>
          <div className="bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
            {jobs.length}
          </div>
        </div>
      </div>

      {/* Jobs Container */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto min-h-0 p-3 space-y-2 transition-colors ${
          isDragOver ? 'bg-opacity-75' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-cy={`swimlane-jobs-${stage}`}
      >
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white rounded shadow animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          // Job cards
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => onJobClick?.(job)}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('jobId', job.id);
              }}
              isDraggedOver={dragOverJob === job.id}
            />
          ))
        ) : (
          // Empty state
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">✨</div>
              <p>No jobs here</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Stage info */}
      <div className={`px-4 py-2 border-t ${config.borderColor} text-xs text-gray-600 flex-shrink-0`}>
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
