import { useQuery } from '@tanstack/react-query';
import { Job } from '@/types/job';

export function useJob(jobId: string) {
  return useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      // TODO: Implement API call in Phase 2
      // const { data } = await apiClient.get(`/api/jobs/${jobId}`);
      // return data;
      return {} as Job;
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
