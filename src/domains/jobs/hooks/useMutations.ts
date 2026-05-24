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
    mutationFn: async (input: CreateInterviewInput) => {
      return input;
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
    mutationFn: async (interviewId: string) => {
      // TODO: API call in Phase 2
      // await apiClient.delete(`/api/interviews/${interviewId}`);
    },
    onSuccess: (_, interviewId) => {
      // Invalidate all interviews queries (we don't know which job it belonged to)
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
    mutationFn: async ({ id, updates }: Omit<UpdateInterviewInput, 'jobId'> & { id: string }) => {
      return { id, ...updates };
    },
    onSuccess: (_, variables) => {
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
    mutationFn: async (input: CreateOfferInput) => {
      return input;
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
    mutationFn: async (offerId: string) => {
      // TODO: API call in Phase 2
      // await apiClient.delete(`/api/offers/${offerId}`);
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
    mutationFn: async ({ id, updates }: UpdateOfferInput) => {
      return { id, ...updates };
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
    mutationFn: async ({ jobId, notes }: UpdateJobNotesInput) => {
      return { jobId, notes };
    },
    onSuccess: (_, variables) => {
      // Invalidate job query
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      // Invalidate job activities to show notes update
      queryClient.invalidateQueries({ queryKey: ['job-activities', variables.jobId] });
    },
  });
}
