import { useState, useCallback, useEffect } from 'react'
import { Job, JobStage } from '@/types/job'
import { getNotificationManager } from '@/lib/notifications/manager'

export interface MoveResult {
  agentType: string | null
  executionId: string | null
}

export interface UseJobBoardReturn {
  jobs: Job[]
  selectedJobId: string | null
  loading: boolean
  error: Error | null
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  moveJob: (id: string, newStage: JobStage) => Promise<MoveResult>
  selectJob: (id: string | null) => void
  getJobById: (id: string) => Job | undefined
  getJobsByStage: (stage: JobStage) => Job[]
  refetch: () => Promise<void>
}

const AGENT_LABELS: Record<string, string> = {
  'job-match': 'Job Match',
  'resume-tailor': 'Resume Tailor',
  'research': 'Company Research',
  'interview-prep': 'Interview Prep',
  'follow-up': 'Follow-Up',
  'networking': 'Networking',
}

async function fetchJobsFromApi(): Promise<Job[]> {
  const res = await fetch('/api/jobs?limit=200')
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.statusText}`)
  const json = await res.json()
  const items: Job[] = Array.isArray(json) ? json : json.data?.items ?? json.data ?? []
  return items
}

async function callMoveEndpoint(id: string, stage: JobStage): Promise<MoveResult> {
  const res = await fetch(`/api/jobs/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      if (body?.error) detail = body.error
    } catch { /* ignore parse failure */ }
    throw new Error(`Move failed (${res.status}): ${detail}`)
  }
  const json = await res.json()
  return { agentType: json.agentType ?? null, executionId: json.executionId ?? null }
}

export function useJobBoard(): UseJobBoardReturn {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchJobsFromApi()
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load jobs'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev])
  }, [])

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
    )
  }, [])

  const deleteJob = useCallback(
    (id: string) => {
      setJobs((prev) => prev.filter((job) => job.id !== id))
      if (selectedJobId === id) setSelectedJobId(null)
    },
    [selectedJobId]
  )

  const moveJob = useCallback(
    async (id: string, newStage: JobStage): Promise<MoveResult> => {
      // Optimistic UI update
      const previous = jobs.find((j) => j.id === id)
      updateJob(id, { stage: newStage })

      let result: MoveResult = { agentType: null, executionId: null }
      try {
        result = await callMoveEndpoint(id, newStage)

        if (result.agentType) {
          const label = AGENT_LABELS[result.agentType] ?? result.agentType
          const stageName = newStage.replaceAll('_', ' ')
          getNotificationManager().notify(
            'info',
            `${label} agent triggered`,
            `Moving to ${stageName} — ${label} is running in the background.`,
            { duration: 5000 }
          )
        }
      } catch {
        // Revert on hard failure
        if (previous) updateJob(id, { stage: previous.stage })
      }
      return result
    },
    [jobs, updateJob]
  )

  const selectJob = useCallback((id: string | null) => {
    setSelectedJobId(id)
  }, [])

  const getJobById = useCallback(
    (id: string) => jobs.find((job) => job.id === id),
    [jobs]
  )

  const getJobsByStage = useCallback(
    (stage: JobStage) => jobs.filter((job) => job.stage === stage),
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
    refetch,
  }
}
