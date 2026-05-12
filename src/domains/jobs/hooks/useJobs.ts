import { useQuery } from '@tanstack/react-query';
import { Job, JobListResponse } from '@/types/job';

/**
 * Fetch list of jobs for the current user
 */
export function useJobs() {
  return useQuery<Job[], Error>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch jobs');
      }

      const data: JobListResponse = await response.json();
      return data.jobs;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
