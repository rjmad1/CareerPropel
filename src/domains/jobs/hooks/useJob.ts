import { useQuery } from '@tanstack/react-query';
import { Job } from '@/types/job';

export function useJob(jobId: string) {
  return useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to load job');
      }
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
