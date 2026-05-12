import { useQuery } from '@tanstack/react-query';
import { Job } from '@/types/job';

/**
 * Fetch job details from the API
 */
export function useJob(jobId: string) {
  return useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch job');
      }

      return response.json();
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
