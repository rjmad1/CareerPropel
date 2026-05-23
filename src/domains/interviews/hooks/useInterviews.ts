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

const API_TO_UI_TYPE: Record<string, Interview['type']> = {
  recruiter_screen: 'phone_screen',
  other: 'offer_discussion',
};

export function useInterviews(jobId: string) {
  return useQuery<Interview[], Error>({
    queryKey: ['interviews', jobId],
    queryFn: async (): Promise<Interview[]> => {
      const res = await fetch(`/api/interviews?jobId=${encodeURIComponent(jobId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      const items: unknown[] = json.data?.items ?? json.data ?? [];

      return (items as Record<string, unknown>[]).map((interview): Interview => {
        const dt = new Date(interview.scheduledAt as string);
        const date = dt.toISOString().slice(0, 10);
        const time = dt.toISOString().slice(11, 16);
        const rawType: string = (interview.type as string) || '';

        return {
          id: interview.id as string,
          type: (API_TO_UI_TYPE[rawType] || rawType) as Interview['type'],
          date,
          time,
          interviewer: (interview.interviewer as Record<string, string> | undefined)?.name,
          location: interview.location as string | undefined,
          meetingLink: interview.meetingLink as string | undefined,
          notes: interview.notes as string | undefined,
          status: (interview.status as Interview['status']) || 'scheduled',
        };
      });
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
