import { useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Interview Mutations
// ============================================================================

export interface CreateInterviewInput {
  jobId: string;
  type: 'phone_screen' | 'technical' | 'system_design' | 'behavioral' | 'final_round' | 'offer_discussion';
  date: string;
  time: string;
  interviewer?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
}

const UI_TO_API_TYPE: Record<string, string> = {
  phone_screen: 'recruiter_screen',
  offer_discussion: 'other',
};

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInterviewInput): Promise<unknown> => {
      const payload = {
        jobId: input.jobId,
        type: UI_TO_API_TYPE[input.type] || input.type,
        scheduledAt: `${input.date}T${input.time}:00.000Z`,
        interviewer: input.interviewer ? { name: input.interviewer } : undefined,
        location: input.location || undefined,
        meetingLink: input.meetingLink || undefined,
        notes: input.notes || undefined,
      };

      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to schedule interview');
      }

      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interviewId: string) => {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete interview');
      }
      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

export interface UpdateInterviewInput {
  id: string;
  jobId: string;
  updates: Partial<CreateInterviewInput>;
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: Omit<UpdateInterviewInput, 'jobId'> & { id: string }): Promise<unknown> => {
      const payload: Record<string, unknown> = {};
      if (updates.type) payload.type = UI_TO_API_TYPE[updates.type] || updates.type;
      if (updates.date && updates.time) {
        payload.scheduledAt = `${updates.date}T${updates.time}:00.000Z`;
      }
      if (updates.interviewer !== undefined) {
        payload.interviewer = updates.interviewer ? { name: updates.interviewer } : undefined;
      }
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.meetingLink !== undefined) payload.meetingLink = updates.meetingLink;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      const res = await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update interview');
      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

// ============================================================================
// Offer Mutations
// ============================================================================

export interface CreateOfferInput {
  jobId: string;
  baseSalary: number;
  bonusPercent: number;
  equity: string;
  startDate: string;
  notes?: string;
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOfferInput): Promise<unknown> => {
      const noteParts: string[] = [];
      if (input.notes) noteParts.push(input.notes);
      if (input.equity) noteParts.push(`Equity: ${input.equity}`);

      const payload = {
        jobId: input.jobId,
        salary: input.baseSalary,
        bonus: input.bonusPercent ? { amount: input.bonusPercent, type: 'percentage' } : undefined,
        startDate: input.startDate ? `${input.startDate}T00:00:00.000Z` : undefined,
        notes: noteParts.length > 0 ? noteParts.join('; ') : undefined,
      };

      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to log offer');
      }

      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete offer');
      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export interface UpdateOfferInput {
  id: string;
  updates: Partial<CreateOfferInput>;
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateOfferInput): Promise<unknown> => {
      const payload: Record<string, unknown> = {};
      if (updates.baseSalary !== undefined) payload.salary = updates.baseSalary;
      if (updates.bonusPercent !== undefined) {
        payload.bonus = { amount: updates.bonusPercent, type: 'percentage' };
      }
      if (updates.startDate) payload.startDate = `${updates.startDate}T00:00:00.000Z`;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      const res = await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update offer');
      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

// ============================================================================
// Job Notes Mutation
// ============================================================================

export interface UpdateJobNotesInput {
  jobId: string;
  notes: string;
}

export function useUpdateJobNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, notes }: UpdateJobNotesInput): Promise<unknown> => {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to update notes');
      }
      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}
