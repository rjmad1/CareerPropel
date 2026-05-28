import { useQuery } from '@tanstack/react-query';


export interface Activity {
  id: string;
  type: 'stage_changed' | 'applied' | 'interview_scheduled' | 'interview_completed' | 'rejected' | 'offered' | 'note_added' | 'agent_action';
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export function useJobActivities(jobId: string) {
  return useQuery<Activity[], Error>({
    queryKey: ['job-activities', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}/activities`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to load activities');
      }
      const json = await res.json();
      const raw: Record<string, unknown>[] = json.data ?? json ?? [];
      return raw.map((item) => {
        const meta = item.metadata as Record<string, unknown> | undefined;
        return {
          id: item.id as string,
          type: item.action as Activity['type'],
          timestamp: item.createdAt as string,
          description: (meta?.description as string | undefined) ?? (item.action as string),
          metadata: meta,
        };
      });
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
