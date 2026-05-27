import { create } from 'zustand';
import { Job, JobStage, JobFilter, JobSort } from '@/types/job';

type SortableValue = string | number | null | undefined;

interface JobStoreState {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJobId: string | null;
  filters: JobFilter;
  sort: JobSort;
  isLoading: boolean;
  error: string | null;

  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, data: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;
  moveJob: (jobId: string, newStage: JobStage) => void;
  selectJob: (jobId: string | null) => void;
  setFilters: (filters: JobFilter) => void;
  setSort: (sort: JobSort) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  getJobsByStage: (stage: JobStage) => Job[];
  applyFiltersAndSort: () => void;
}

const defaultSort: JobSort = {
  field: 'appliedAt',
  direction: 'desc',
};

export const useJobStore = create<JobStoreState>((set, get) => ({
  jobs: [],
  filteredJobs: [],
  selectedJobId: null,
  filters: {},
  sort: defaultSort,
  isLoading: false,
  error: null,

  setJobs: (jobs) => {
    set({ jobs });
    get().applyFiltersAndSort();
  },

  addJob: (job) => {
    set((state) => ({ jobs: [job, ...state.jobs] }));
    get().applyFiltersAndSort();
  },

  updateJob: (jobId, data) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...data, updatedAt: new Date() } : job
      ),
    }));
    get().applyFiltersAndSort();
  },

  deleteJob: (jobId) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
      selectedJobId: state.selectedJobId === jobId ? null : state.selectedJobId,
    }));
    get().applyFiltersAndSort();
  },

  moveJob: (jobId, newStage) => {
    get().updateJob(jobId, { stage: newStage });
  },

  selectJob: (jobId) => {
    set({ selectedJobId: jobId });
  },

  setFilters: (filters) => {
    set({ filters });
    get().applyFiltersAndSort();
  },

  setSort: (sort) => {
    set({ sort });
    get().applyFiltersAndSort();
  },

  clearFilters: () => {
    set({ filters: {}, sort: defaultSort });
    get().applyFiltersAndSort();
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  getJobsByStage: (stage) => {
    return get().filteredJobs.filter((job) => job.stage === stage);
  },

  applyFiltersAndSort: () => {
    const { jobs, filters, sort } = get();
    let filtered = [...jobs];

    if (filters.company) {
      filtered = filtered.filter((job) =>
        job.company.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        (job.location?.toLowerCase().includes(search) ?? false)
      );
    }

    if (filters.stages && filters.stages.length > 0) {
      filtered = filtered.filter((job) => filters.stages!.includes(job.stage));
    }

    if (filters.salaryMin !== undefined) {
      filtered = filtered.filter((job) => job.salary?.min !== undefined && job.salary.min >= filters.salaryMin!);
    }

    if (filters.salaryMax !== undefined) {
      filtered = filtered.filter((job) => job.salary?.max !== undefined && job.salary.max <= filters.salaryMax!);
    }

    filtered.sort((a, b) => {
      let aVal: SortableValue = a[sort.field as keyof Job] as SortableValue;
      let bVal: SortableValue = b[sort.field as keyof Job] as SortableValue;

      if (sort.field === 'matchScore') {
        aVal = a.matchScore || 0;
        bVal = b.matchScore || 0;
      } else if (sort.field === 'appliedAt') {
        aVal = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        bVal = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      } else if (sort.field === 'salary') {
        aVal = a.salary?.max || 0;
        bVal = b.salary?.max || 0;
      }

      if ((aVal ?? '') < (bVal ?? '')) return sort.direction === 'asc' ? -1 : 1;
      if ((aVal ?? '') > (bVal ?? '')) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    set({ filteredJobs: filtered });
  },
}));
