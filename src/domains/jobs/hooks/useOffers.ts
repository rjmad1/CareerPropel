import { useQuery } from '@tanstack/react-query';


export interface Offer {
  id: string;
  jobId: string;
  baseSalary: number;
  bonusPercent: number;
  equity: string;
  startDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
}

export function useOffers(jobId: string) {
  return useQuery<Offer[], Error>({
    queryKey: ['offers', jobId],
    queryFn: async () => {
      const { data } = // TODO: API call in Phase 2
      // await apiClient.get(`/api/offers?jobId=${jobId}`);
      return data;
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
