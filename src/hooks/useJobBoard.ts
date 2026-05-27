import { useState, useCallback } from 'react'
import { Job } from '@/components/Kanban'
import { StageId } from '@/lib/design-tokens'

/** Result returned from a job stage move operation */
export interface MoveResult {
  success: boolean;
  executionId?: string;
  agentType?: string;
  error?: string;
}

export interface UseJobBoardReturn {
  jobs: Job[]
  selectedJobId: string | null
  loading: boolean
  error: Error | null
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  moveJob: (id: string, newStage: StageId) => void
  selectJob: (id: string | null) => void
  getJobById: (id: string) => Job | undefined
  getJobsByStage: (stage: StageId) => Job[]
}

/**
 * useJobBoard Hook
 * Custom hook for managing Kanban board job state.
 */
export function useJobBoard(): UseJobBoardReturn {
  const [jobs, setJobs] = useState<Job[]>([
    // Mock data for development
    {
      id: '1',
      title: 'Senior React Engineer',
      company: 'Google',
      stage: 'sourced',
      matchScore: 92,
      appliedAt: new Date().toISOString(),
      salary: { min: 150000, max: 200000, currency: 'USD' },
      location: 'Mountain View, CA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'dev',
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'Microsoft',
      stage: 'interested',
      matchScore: 85,
      appliedAt: null,
      salary: { min: 140000, max: 180000, currency: 'USD' },
      location: 'Seattle, WA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'dev',
    },
    {
      id: '3',
      title: 'Staff Engineer',
      company: 'Meta',
      stage: 'applied',
      matchScore: 88,
      appliedAt: new Date(Date.now() - 86400000).toISOString(),
      location: 'Menlo Park, CA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'dev',
    },
    {
      id: '4',
      title: 'Principal Engineer',
      company: 'Apple',
      stage: 'recruiter_screen',
      matchScore: 90,
      appliedAt: null,
      recruiterEmail: 'recruiter@apple.com',
      recruiterName: 'Sarah Chen',
      location: 'Cupertino, CA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'dev',
    },
    {
      id: '5',
      title: 'Engineering Manager',
      company: 'Amazon',
      stage: 'hiring_manager',
      matchScore: 87,
      appliedAt: null,
      location: 'Seattle, WA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'dev',
    },
  ])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev])
  }, [])

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      )
    )
  }, [])

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id))
    if (selectedJobId === id) {
      setSelectedJobId(null)
    }
  }, [selectedJobId])

  const moveJob = useCallback((id: string, newStage: StageId) => {
    updateJob(id, { stage: newStage as unknown as Job['stage'] })
  }, [updateJob])

  const selectJob = useCallback((id: string | null) => {
    setSelectedJobId(id)
  }, [])

  const getJobById = useCallback(
    (id: string) => jobs.find((job) => job.id === id),
    [jobs]
  )

  const getJobsByStage = useCallback(
    (stage: StageId) => jobs.filter((job) => job.stage === stage),
    [jobs]
  )

  return {
    jobs,
    selectedJobId,
    loading,
    error,
    addJob,
    updateJob,
    deleteJob,
    moveJob,
    selectJob,
    getJobById,
    getJobsByStage,
  }
}
