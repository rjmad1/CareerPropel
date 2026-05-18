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
    queryFn: async (): Promise<Offer[]> => {
      const res = await fetch(`/api/offers`);
      if (!res.ok) return [];
      const json = await res.json();
      const items: any[] = json.data?.items ?? json.data ?? [];

      return items
        .filter((offer: any) => offer.jobId === jobId)
        .map((offer: any): Offer => {
          const equityNote = offer.notes?.includes('Equity:')
            ? offer.notes.split('Equity:')[1].trim().split(';')[0].trim()
            : '';
          const baseNote = offer.notes?.includes('Equity:')
            ? offer.notes.split('; Equity:')[0].trim()
            : offer.notes || '';

          return {
            id: offer.id,
            jobId: offer.jobId,
            baseSalary: offer.salary || 0,
            bonusPercent: offer.bonus?.type === 'percentage' ? (offer.bonus?.amount ?? 0) : 0,
            equity: equityNote,
            startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
            status: offer.status === 'received' ? 'pending' : (offer.status || 'pending'),
            notes: baseNote || undefined,
          };
        });
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
