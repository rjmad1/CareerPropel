import React, { useState } from 'react'
import { KANBAN_STAGES, StageId } from '@/lib/design-tokens'
import { Swimlane } from './Swimlane'
import { Badge } from '@/components/ui'

export interface Job {
  id: string
  title: string
  company: string
  stage: StageId
  matchScore: number
  applicationDate?: string
  salary?: { min: number; max: number; currency: string }
  location?: string
  description?: string
  recruiterEmail?: string
  recruiterName?: string
}

export interface KanbanBoardProps {
  jobs: Job[]
  onJobSelect?: (job: Job) => void
  onJobMove?: (jobId: string, newStage: StageId) => void
  onJobDelete?: (jobId: string) => void
  selectedJobId?: string | null
}

/**
 * KanbanBoard Component
 * Main Kanban board with 14 swimlane stages for job applications.
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  jobs,
  onJobSelect,
  onJobMove,
  onJobDelete,
  selectedJobId,
}) => {
  const [hoveredStage, setHoveredStage] = useState<StageId | null>(null)

  const getJobsByStage = (stage: StageId): Job[] => {
    return jobs.filter((job) => job.stage === stage).sort((a, b) => {
      // Sort by match score descending
      return (b.matchScore || 0) - (a.matchScore || 0)
    })
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your career pipeline across {jobs.length} applications
        </p>
      </div>

      {/* Swimlanes Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6">
          {KANBAN_STAGES.map((stage) => (
            <Swimlane
              key={stage.id}
              stage={stage}
              jobs={getJobsByStage(stage.id)}
              onJobSelect={onJobSelect}
              onJobMove={onJobMove}
              onJobDelete={onJobDelete}
              selectedJobId={selectedJobId}
              isHovered={hoveredStage === stage.id}
              onHover={() => setHoveredStage(stage.id)}
              onHoverLeave={() => setHoveredStage(null)}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <StatCard label="Total Applications" value={jobs.length} />
        <StatCard label="In Progress" value={jobs.filter((j) => !['rejected', 'archived', 'offer'].includes(j.stage)).length} />
        <StatCard label="Offers" value={jobs.filter((j) => j.stage === 'offer').length} />
        <StatCard label="Rejected" value={jobs.filter((j) => j.stage === 'rejected').length} />
      </div>
    </div>
  )
}

KanbanBoard.displayName = 'KanbanBoard'

interface StatCardProps {
  label: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
)
