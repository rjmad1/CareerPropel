/**
 * React hook for interacting with the Fit Evaluation Engine API.
 * Provides loading states, caching via React Query, and re-analysis triggers.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FullFitAnalysisResult } from '@/lib/fit-engine/types';
import type { FitScoringSnapshot } from '@prisma/client';
import { useState } from 'react';

interface FitScoreWithJob extends FitScoringSnapshot {
  job: { id: string; title: string; company: string; stage: string };
}

interface ScoresResponse {
  success: boolean;
  data: FitScoreWithJob[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useFitScores(opts?: { page?: number; limit?: number; recommendation?: string }) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.recommendation) params.set('recommendation', opts.recommendation);
  params.set('includeSuppressed', 'false');

  return useQuery<ScoresResponse>({
    queryKey: ['fit-scores', opts?.page, opts?.recommendation],
    queryFn: async () => {
      const res = await fetch(`/api/fit-engine/scores?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to fetch scores');
      }
      return res.json();
    },
  });
}

export function useFitScore(jobId: string | undefined) {
  return useQuery<{ success: boolean; data: FitScoringSnapshot & { job: { id: string; title: string; company: string; stage: string } } }>({
    queryKey: ['fit-score', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/fit-engine/scores?jobId=${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch score');
      return res.json();
    },
    enabled: !!jobId,
  });
}

export function useFitDeconstruction(jobId: string | undefined) {
  return useQuery<{ success: boolean; data: unknown }>({
    queryKey: ['fit-deconstruction', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/fit-engine/deconstruction?jobId=${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch deconstruction');
      return res.json();
    },
    enabled: !!jobId,
  });
}

export function useRunFitAnalysis() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (opts: {
      jobId?: string;
      rawJdText?: string;
      customWeights?: Record<string, number>;
    }) => {
      setCurrentStage('Analyzing role...');
      setProgress(null);

      const res = await fetch('/api/fit-engine/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.detail || err.error || 'Analysis failed');
      }

      setCurrentStage(null);
      setProgress('Complete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fit-scores'] });
      queryClient.invalidateQueries({ queryKey: ['fit-score'] });
    },
    onError: (_err) => {
      setCurrentStage(null);
      setProgress('Failed');
    },
  });

  return { ...mutation, progress, currentStage };
}

export function useReanalyzeFit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opts: {
      jobId: string;
      stages: Array<'deconstruction' | 'strength-mapping' | 'gap-analysis' | 'fit-scoring'>;
      customWeights?: Record<string, number>;
    }) => {
      const res = await fetch('/api/fit-engine/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.detail || err.error || 'Re-analysis failed');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fit-scores'] });
      queryClient.invalidateQueries({ queryKey: ['fit-score', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['fit-deconstruction', variables.jobId] });
    },
  });
}
