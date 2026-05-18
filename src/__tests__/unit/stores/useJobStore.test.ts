import { act } from '@testing-library/react'
import { useJobStore } from '@/hooks/useJobStore'
import type { Job } from '@/types/job'

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    title: 'Software Engineer',
    company: 'Acme Corp',
    stage: 'sourced',
    matchScore: 75,
    appliedAt: new Date('2024-01-15'),
    location: 'Remote',
    userId: 'user-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  }
}

// Reset the store between tests
beforeEach(() => {
  act(() => {
    useJobStore.getState().setJobs([])
    useJobStore.getState().clearFilters()
    useJobStore.getState().selectJob(null)
    useJobStore.getState().setError(null)
    useJobStore.getState().setLoading(false)
  })
})

describe('useJobStore - initial state', () => {
  it('has empty jobs array', () => {
    expect(useJobStore.getState().jobs).toEqual([])
  })

  it('has empty filteredJobs array', () => {
    expect(useJobStore.getState().filteredJobs).toEqual([])
  })

  it('has no selected job', () => {
    expect(useJobStore.getState().selectedJobId).toBeNull()
  })

  it('is not loading', () => {
    expect(useJobStore.getState().isLoading).toBe(false)
  })

  it('has no error', () => {
    expect(useJobStore.getState().error).toBeNull()
  })
})

describe('setJobs', () => {
  it('replaces the jobs array', () => {
    const jobs = [makeJob({ id: 'a' }), makeJob({ id: 'b' })]
    act(() => useJobStore.getState().setJobs(jobs))
    expect(useJobStore.getState().jobs).toHaveLength(2)
  })

  it('updates filteredJobs', () => {
    const jobs = [makeJob({ id: 'c' })]
    act(() => useJobStore.getState().setJobs(jobs))
    expect(useJobStore.getState().filteredJobs).toHaveLength(1)
  })
})

describe('addJob', () => {
  it('prepends a job to the list', () => {
    const existing = makeJob({ id: 'old', title: 'Old Job' })
    act(() => useJobStore.getState().setJobs([existing]))
    const newJob = makeJob({ id: 'new', title: 'New Job' })
    act(() => useJobStore.getState().addJob(newJob))
    const jobs = useJobStore.getState().jobs
    expect(jobs[0].id).toBe('new')
    expect(jobs[1].id).toBe('old')
  })
})

describe('updateJob', () => {
  it('updates the specified job fields', () => {
    act(() => useJobStore.getState().setJobs([makeJob({ id: 'job-1', stage: 'sourced' })]))
    act(() => useJobStore.getState().updateJob('job-1', { stage: 'applied' }))
    const job = useJobStore.getState().jobs.find(j => j.id === 'job-1')
    expect(job?.stage).toBe('applied')
  })

  it('does not affect other jobs', () => {
    act(() =>
      useJobStore.getState().setJobs([
        makeJob({ id: 'job-1' }),
        makeJob({ id: 'job-2', stage: 'applied' }),
      ])
    )
    act(() => useJobStore.getState().updateJob('job-1', { stage: 'offer' }))
    const job2 = useJobStore.getState().jobs.find(j => j.id === 'job-2')
    expect(job2?.stage).toBe('applied')
  })

  it('updates the updatedAt timestamp', () => {
    const original = makeJob({ id: 'job-1', updatedAt: new Date('2020-01-01') })
    act(() => useJobStore.getState().setJobs([original]))
    act(() => useJobStore.getState().updateJob('job-1', { stage: 'offer' }))
    const updated = useJobStore.getState().jobs.find(j => j.id === 'job-1')
    expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(new Date('2020-01-01').getTime())
  })
})

describe('deleteJob', () => {
  it('removes the job from the list', () => {
    act(() =>
      useJobStore.getState().setJobs([
        makeJob({ id: 'job-1' }),
        makeJob({ id: 'job-2' }),
      ])
    )
    act(() => useJobStore.getState().deleteJob('job-1'))
    const ids = useJobStore.getState().jobs.map(j => j.id)
    expect(ids).not.toContain('job-1')
    expect(ids).toContain('job-2')
  })

  it('clears selectedJobId when the deleted job was selected', () => {
    act(() => useJobStore.getState().setJobs([makeJob({ id: 'job-1' })]))
    act(() => useJobStore.getState().selectJob('job-1'))
    act(() => useJobStore.getState().deleteJob('job-1'))
    expect(useJobStore.getState().selectedJobId).toBeNull()
  })

  it('preserves selectedJobId when a different job is deleted', () => {
    act(() =>
      useJobStore.getState().setJobs([
        makeJob({ id: 'job-1' }),
        makeJob({ id: 'job-2' }),
      ])
    )
    act(() => useJobStore.getState().selectJob('job-1'))
    act(() => useJobStore.getState().deleteJob('job-2'))
    expect(useJobStore.getState().selectedJobId).toBe('job-1')
  })
})

describe('moveJob', () => {
  it('changes the stage of the specified job', () => {
    act(() => useJobStore.getState().setJobs([makeJob({ id: 'job-1', stage: 'sourced' })]))
    act(() => useJobStore.getState().moveJob('job-1', 'applied'))
    const job = useJobStore.getState().jobs.find(j => j.id === 'job-1')
    expect(job?.stage).toBe('applied')
  })
})

describe('selectJob', () => {
  it('sets selectedJobId', () => {
    act(() => useJobStore.getState().selectJob('job-99'))
    expect(useJobStore.getState().selectedJobId).toBe('job-99')
  })

  it('clears selectedJobId when null is passed', () => {
    act(() => useJobStore.getState().selectJob('job-1'))
    act(() => useJobStore.getState().selectJob(null))
    expect(useJobStore.getState().selectedJobId).toBeNull()
  })
})

describe('setFilters and applyFiltersAndSort', () => {
  const jobs = [
    makeJob({ id: '1', company: 'Acme', stage: 'sourced', matchScore: 90, title: 'Engineer' }),
    makeJob({ id: '2', company: 'Beta', stage: 'applied', matchScore: 60, title: 'Manager' }),
    makeJob({ id: '3', company: 'Acme', stage: 'applied', matchScore: 75, title: 'Designer' }),
  ]

  beforeEach(() => {
    act(() => useJobStore.getState().setJobs(jobs))
  })

  it('filters by company (case insensitive)', () => {
    act(() => useJobStore.getState().setFilters({ company: 'acme' }))
    const filtered = useJobStore.getState().filteredJobs
    expect(filtered.every(j => j.company === 'Acme')).toBe(true)
    expect(filtered).toHaveLength(2)
  })

  it('filters by searchText against title, company, and location', () => {
    act(() => useJobStore.getState().setFilters({ searchText: 'manager' }))
    const filtered = useJobStore.getState().filteredJobs
    expect(filtered.some(j => j.id === '2')).toBe(true)
    expect(filtered).toHaveLength(1)
  })

  it('filters by stages array', () => {
    act(() => useJobStore.getState().setFilters({ stages: ['applied'] }))
    const filtered = useJobStore.getState().filteredJobs
    expect(filtered.every(j => j.stage === 'applied')).toBe(true)
    expect(filtered).toHaveLength(2)
  })

  it('sorts by matchScore ascending', () => {
    act(() => useJobStore.getState().setSort({ field: 'matchScore', direction: 'asc' }))
    const filtered = useJobStore.getState().filteredJobs
    expect(filtered[0].matchScore).toBeLessThanOrEqual(filtered[1].matchScore!)
  })

  it('sorts by matchScore descending', () => {
    act(() => useJobStore.getState().setSort({ field: 'matchScore', direction: 'desc' }))
    const filtered = useJobStore.getState().filteredJobs
    expect(filtered[0].matchScore).toBeGreaterThanOrEqual(filtered[1].matchScore!)
  })
})

describe('clearFilters', () => {
  it('resets filters and sort to defaults', () => {
    act(() => useJobStore.getState().setFilters({ company: 'Acme' }))
    act(() => useJobStore.getState().clearFilters())
    expect(useJobStore.getState().filters).toEqual({})
    expect(useJobStore.getState().sort.direction).toBe('desc')
  })
})

describe('getJobsByStage', () => {
  it('returns only jobs in the given stage', () => {
    act(() =>
      useJobStore.getState().setJobs([
        makeJob({ id: '1', stage: 'sourced' }),
        makeJob({ id: '2', stage: 'applied' }),
        makeJob({ id: '3', stage: 'sourced' }),
      ])
    )
    const sourced = useJobStore.getState().getJobsByStage('sourced')
    expect(sourced).toHaveLength(2)
    expect(sourced.every(j => j.stage === 'sourced')).toBe(true)
  })
})

describe('setLoading and setError', () => {
  it('sets loading state', () => {
    act(() => useJobStore.getState().setLoading(true))
    expect(useJobStore.getState().isLoading).toBe(true)
    act(() => useJobStore.getState().setLoading(false))
    expect(useJobStore.getState().isLoading).toBe(false)
  })

  it('sets error state', () => {
    act(() => useJobStore.getState().setError('Something went wrong'))
    expect(useJobStore.getState().error).toBe('Something went wrong')
    act(() => useJobStore.getState().setError(null))
    expect(useJobStore.getState().error).toBeNull()
  })
})
