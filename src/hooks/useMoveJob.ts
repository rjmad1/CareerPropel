/**
 * useMoveJob Hook
 * Custom hook for moving jobs between stages with optimistic updates
 */

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { JobStage } from '@/types/job';
import { useJobStore } from './useJobStore';
import { useUpdateJob } from './useJobs';
import axios from 'axios';

interface MoveJobOptions {
  onSuccess?: (jobId: string, newStage: JobStage) => void;
  onError?: (jobId: string, error: Error) => void;
}

export const useMoveJob = (options?: MoveJobOptions) => {
  const updateJobStore = useJobStore((state) => state.updateJob);
  const updateJobQueryMutation = useUpdateJob('');

  return useCallback(
    async (jobId: string, newStage: JobStage) => {
      // Store original state for rollback
      const jobStore = useJobStore.getState();
      const originalJob = jobStore.jobs.find((j) => j.id === jobId);

      if (!originalJob) {
        console.error('Job not found for moving');
        return;
      }

      try {
        // Optimistic update: update local state immediately
        updateJobStore(jobId, { stage: newStage });

        // Send to server
        const response = await axios.patch(`/api/jobs/${jobId}`, {
          stage: newStage,
        });

        // Update with confirmed server data
        updateJobStore(jobId, response.data);

        // Call success callback
        options?.onSuccess?.(jobId, newStage);
      } catch (error) {
        // Rollback on error
        updateJobStore(jobId, { stage: originalJob.stage });

        const err = error instanceof Error ? error : new Error('Failed to move job');
        console.error('Error moving job:', err);

        // Call error callback
        options?.onError?.(jobId, err);

        throw err;
      }
    },
    [updateJobStore, options]
  );
};

/**
 * Alternative: Mutation-based approach for more control
 */
export const useMoveJobMutation = (options?: MoveJobOptions) => {
  const updateJobStore = useJobStore((state) => state.updateJob);
  const { jobs } = useJobStore();

  return useMutation({
    mutationFn: async ({ jobId, newStage }: { jobId: string; newStage: JobStage }) => {
      return axios.patch(`/api/jobs/${jobId}`, { stage: newStage });
    },
    onMutate: async ({ jobId, newStage }) => {
      // Optimistic update
      const originalJob = jobs.find((j) => j.id === jobId);
      updateJobStore(jobId, { stage: newStage });
      return originalJob;
    },
    onSuccess: (response, { jobId, newStage }) => {
      updateJobStore(jobId, response.data);
      options?.onSuccess?.(jobId, newStage);
    },
    onError: (error, { jobId }, context) => {
      // Rollback on error
      if (context) {
        updateJobStore(jobId, { stage: context.stage });
      }
      const err = error instanceof Error ? error : new Error('Failed to move job');
      options?.onError?.(jobId, err);
    },
  });
};
