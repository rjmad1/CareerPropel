import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/lib/api/axiosClient';
import { Job } from '../types';

export function useJob(jobId: string) {
  return useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/api/jobs/${jobId}`);
      return data;
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
