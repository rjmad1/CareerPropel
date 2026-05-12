import { useQuery } from '@tanstack/react-query';

export interface Interview {
  id: string;
  type: 'phone_screen' | 'technical' | 'system_design' | 'behavioral' | 'final_round' | 'offer_discussion';
  date: string;
  time: string;
  interviewer?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

/**
 * Fetch interviews for a specific job
 */
export function useInterviews(jobId: string) {
  return useQuery<Interview[], Error>({
    queryKey: ['interviews', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/interviews`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch interviews');
      }

      return response.json();
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
