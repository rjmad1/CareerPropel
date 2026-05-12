import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/lib/api/axiosClient';

export interface Activity {
  id: string;
  type: 'stage_changed' | 'applied' | 'interview_scheduled' | 'interview_completed' | 'rejected' | 'offered' | 'note_added' | 'agent_action';
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

export function useJobActivities(jobId: string) {
  return useQuery<Activity[], Error>({
    queryKey: ['job-activities', jobId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/api/jobs/${jobId}/activities`);
      return data;
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
