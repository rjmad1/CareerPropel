import { useQuery } from '@tanstack/react-query';

export interface Activity {
  id: string;
  type: 'stage_changed' | 'applied' | 'interview_scheduled' | 'interview_completed' | 'rejected' | 'offered' | 'note_added' | 'agent_action';
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Fetch activity log for a specific job
 */
export function useJobActivities(jobId: string) {
  return useQuery<Activity[], Error>({
    queryKey: ['job-activities', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/activities`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch activities');
      }

      return response.json();
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
