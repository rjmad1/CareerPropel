/**
 * useJobs Hook
 * React Query hook for fetching and managing job data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, JobFilter, JobSort, CreateJobInput, UpdateJobInput } from '@/types/job';
import axios from 'axios';

const API_URL = '/api/jobs';

// Query keys
export const jobsQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsQueryKeys.all, 'list'] as const,
  list: (filters?: JobFilter, sort?: JobSort) =>
    [...jobsQueryKeys.lists(), { filters, sort }] as const,
  details: () => [...jobsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsQueryKeys.details(), id] as const,
};

// API functions
const fetchJobs = async (filters?: JobFilter, sort?: JobSort): Promise<Job[]> => {
  const params = new URLSearchParams();
  if (filters?.company) params.append('company', filters.company);
  if (filters?.searchText) params.append('search', filters.searchText);
  if (filters?.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
  if (filters?.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
  if (sort?.field) {
    params.append('sortBy', sort.field);
    params.append('sortDir', sort.direction);
  }

  const { data } = await axios.get<Job[]>(API_URL, { params });
  return data;
};

const fetchJobById = async (id: string): Promise<Job> => {
  const { data } = await axios.get<Job>(`${API_URL}/${id}`);
  return data;
};

const createJob = async (input: CreateJobInput): Promise<Job> => {
  const { data } = await axios.post<Job>(API_URL, input);
  return data;
};

const updateJob = async (id: string, input: UpdateJobInput): Promise<Job> => {
  const { data } = await axios.patch<Job>(`${API_URL}/${id}`, input);
  return data;
};

const deleteJob = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

// Hooks
export const useJobs = (filters?: JobFilter, sort?: JobSort) => {
  return useQuery({
    queryKey: jobsQueryKeys.list(filters, sort),
    queryFn: () => fetchJobs(filters, sort),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: jobsQueryKeys.detail(id),
    queryFn: () => fetchJobById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateJobInput) => createJob(input),
    onSuccess: (newJob) => {
      queryClient.setQueryData(jobsQueryKeys.lists(), (oldData?: Job[]) => {
        return oldData ? [newJob, ...oldData] : [newJob];
      });
      queryClient.setQueryData(jobsQueryKeys.detail(newJob.id), newJob);
    },
  });
};

export const useUpdateJob = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateJobInput) => updateJob(jobId, input),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(jobsQueryKeys.detail(jobId), updatedJob);
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.lists() });
    },
  });
};

export const useDeleteJob = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: jobsQueryKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.lists() });
    },
  });
};
