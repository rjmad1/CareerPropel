import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Job } from '@/types/job';

/**
 * Create a new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation<Job, Error, Partial<Job>>({
    mutationFn: async (jobData) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create job');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/**
 * Update an existing job
 */
export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation<Job, Error, Partial<Job>>({
    mutationFn: async (jobData) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/**
 * Delete a job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (jobId) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/**
 * Update job notes
 */
export function useUpdateJobNotes() {
  const queryClient = useQueryClient();

  return useMutation<Job, Error, { jobId: string; notes: string }>({
    mutationFn: async ({ jobId, notes }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
    },
  });
}

/**
 * Create a new interview
 */
export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { 
    jobId: string; 
    type: string; 
    date: string;
    time: string;
    duration?: number;
    interviewer?: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
  }>({
    mutationFn: async (data) => {
      const scheduledAtStr = data.date && data.time 
        ? `${data.date}T${data.time}:00`
        : new Date().toISOString();
      
      const payload = {
        jobId: data.jobId,
        type: data.type,
        scheduledAt: scheduledAtStr,
        duration: data.duration || 60,
        interviewer: data.interviewer ? { name: data.interviewer } : undefined,
        location: data.location,
        meetingLink: data.meetingLink,
        notes: data.notes,
      };

      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create interview');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-interviews', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

/**
 * Delete an interview
 */
export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (interviewId) => {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete interview');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

/**
 * Create a new offer
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, {
    jobId: string;
    baseSalary: number;
    bonusPercent?: number;
    equity?: string;
    benefits?: string[];
    startDate?: string;
    notes?: string;
  }>({
    mutationFn: async (data) => {
      const payload: any = {
        jobId: data.jobId,
        salary: data.baseSalary,
      };

      if (data.bonusPercent) {
        payload.bonus = {
          amount: data.bonusPercent,
          type: 'percentage',
        };
      }

      if (data.equity) {
        payload.equity = {
          amount: parseFloat(data.equity),
        };
      }

      if (data.notes) {
        payload.notes = data.notes;
      }

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create offer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

/**
 * Delete an offer
 */
export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (offerId) => {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete offer');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}
