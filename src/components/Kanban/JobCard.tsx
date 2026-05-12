import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import type { Job } from './KanbanBoard'

export interface JobCardProps {
  job: Job
  isSelected?: boolean
  onSelect?: () => void
  onDelete?: () => void
}

/**
 * JobCard Component
 * Individual job card displayed in Kanban swimlane.
 */
export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected = false,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border rounded-lg p-3 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-blue-400',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200'
      )}
      data-job-id={job.id}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect?.()
      }}
    >
      {/* Company & Title */}
      <div className="flex flex-col gap-1 mb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{job.company}</p>
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{job.title}</h4>
      </div>

      {/* Match Score */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant="primary" size="sm">
          {job.matchScore}% Match
        </Badge>
        {job.salary && (
          <span className="text-xs text-gray-600">
            ${(job.salary.min / 1000).toFixed(0)}k-${(job.salary.max / 1000).toFixed(0)}k
          </span>
        )}
      </div>

      {/* Location */}
      {job.location && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">📍 {job.location}</p>
      )}

      {/* Application Date */}
      {job.applicationDate && (
        <p className="text-xs text-gray-500 mb-2">
          Applied: {new Date(job.applicationDate).toLocaleDateString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.()
          }}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details
        </button>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-xs text-red-600 hover:text-red-700"
            aria-label="Delete job"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

JobCard.displayName = 'JobCard'
