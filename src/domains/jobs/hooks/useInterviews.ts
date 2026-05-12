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

export function useInterviews(jobId: string) {
  return useQuery<Interview[], Error>({
    queryKey: ['interviews', jobId],
    queryFn: async () => {
      // TODO: Implement API call in Phase 2
      // const { data } = await apiClient.get(`/api/interviews?jobId=${jobId}`);
      // return data;
      return [];
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
