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

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_input: CreateInterviewInput): Promise<unknown> => {
      // TODO: Phase 2 — await apiClient.post('/api/interviews', _input)
      throw new Error('Interview creation API not yet implemented');
    },
    onSuccess: (_, variables) => {
      // Invalidate interviews query for this job
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.jobId] });
      // Invalidate job activities to show new activity
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_interviewId: string) => {
      // TODO: Phase 2 — await apiClient.delete(`/api/interviews/${_interviewId}`)
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
    mutationFn: async ({ id: _id, updates: _updates }: Omit<UpdateInterviewInput, 'jobId'> & { id: string }): Promise<unknown> => {
      // TODO: Phase 2 — await apiClient.patch(`/api/interviews/${_id}`, _updates)
      throw new Error('Interview update API not yet implemented');
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
    mutationFn: async (_input: CreateOfferInput): Promise<unknown> => {
      // TODO: Phase 2 — await apiClient.post('/api/offers', _input)
      throw new Error('Offer creation API not yet implemented');
    },
    onSuccess: (_, variables) => {
      // Invalidate offers query for this job
      queryClient.invalidateQueries({ queryKey: ['offers', variables.jobId] });
      // Invalidate job activities to show new activity
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_offerId: string) => {
      // TODO: Phase 2 — await apiClient.delete(`/api/offers/${_offerId}`)
    },
    onSuccess: () => {
      // Invalidate all offers queries
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
    mutationFn: async ({ id: _id, updates: _updates }: UpdateOfferInput): Promise<unknown> => {
      // TODO: Phase 2 — await apiClient.patch(`/api/offers/${_id}`, _updates)
      throw new Error('Offer update API not yet implemented');
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
    mutationFn: async ({ jobId: _jobId, notes: _notes }: UpdateJobNotesInput): Promise<unknown> => {
      // TODO: Phase 2 — await apiClient.patch(`/api/jobs/${_jobId}`, { notes: _notes })
      throw new Error('Job notes update API not yet implemented');
    },
    onSuccess: (_, variables) => {
      // Invalidate job query
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      // Invalidate job activities to show notes update
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}
