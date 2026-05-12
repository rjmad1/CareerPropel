import React from 'react'
import { cn } from '@/lib/utils'
import { JobCard } from './JobCard'
import { Job } from './KanbanBoard'
import type { StageId } from '@/lib/design-tokens'

interface Stage {
  id: StageId
  label: string
  color: string
}

export interface SwimlaneProps {
  stage: Stage
  jobs: Job[]
  onJobSelect?: (job: Job) => void
  onJobMove?: (jobId: string, newStage: StageId) => void
  onJobDelete?: (jobId: string) => void
  selectedJobId?: string | null
  isHovered?: boolean
  onHover?: () => void
  onHoverLeave?: () => void
}

/**
 * Swimlane Component
 * Vertical column for a single job application stage.
 */
export const Swimlane: React.FC<SwimlaneProps> = ({
  stage,
  jobs,
  onJobSelect,
  onJobMove,
  onJobDelete,
  selectedJobId,
  isHovered,
  onHover,
  onHoverLeave,
}) => {
  return (
    <div
      className="flex flex-col flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg overflow-hidden"
      onMouseEnter={onHover}
      onMouseLeave={onHoverLeave}
    >
      {/* Stage Header */}
      <div
        className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2"
        style={{ backgroundColor: stage.color + '10' }}
      >
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
            aria-hidden="true"
          />
          <h3 className="font-semibold text-sm text-gray-900">{stage.label}</h3>
        </div>
        <Badge variant="gray" size="sm">
          {jobs.length}
        </Badge>
      </div>

      {/* Jobs Container */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {jobs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-sm text-gray-400">No jobs in this stage</p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onSelect={() => onJobSelect?.(job)}
              onDelete={() => onJobDelete?.(job.id)}
            />
          ))
        )}
      </div>

      {/* Drop Zone Hint (when dragging) */}
      {isHovered && (
        <div className="border-t border-dashed border-gray-300 p-2 text-center text-xs text-gray-400">
          Drop here
        </div>
      )}
    </div>
  )
}

Swimlane.displayName = 'Swimlane'
