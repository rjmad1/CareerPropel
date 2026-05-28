/**
 * Zod validation schemas for Fit Evaluation Engine API endpoints.
 * Ensures type safety at the API boundary.
 */

import { z } from 'zod';
import { FitDimension } from '../types';

// ─── Analyze Request ─────────────────────────────────────────────────────────

export const AnalyzeRequestSchema = z.object({
  jobId: z.string().optional(),
  rawJdText: z.string().min(50, 'Job description must be at least 50 characters').optional(),
  customWeights: z.record(z.string(), z.number().min(0).max(1)).optional(),
})
.refine((data) => data.jobId || data.rawJdText, {
  message: 'Either jobId or rawJdText is required',
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// ─── Re-analyze Request ────────────────────────────────────────────────────

export const ReanalyzeRequestSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  stages: z.array(
    z.enum(['deconstruction', 'strength-mapping', 'gap-analysis', 'fit-scoring'])
  ).min(1, 'At least one stage is required'),
  customWeights: z.record(z.string(), z.number().min(0).max(1)).optional(),
});

export type ReanalyzeRequest = z.infer<typeof ReanalyzeRequestSchema>;

// ─── Deconstruction Re-run Request ─────────────────────────────────────────

export const DeconstructionReRunSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
});

export type DeconstructionReRun = z.infer<typeof DeconstructionReRunSchema>;

// ─── Custom Weight Override Schema ─────────────────────────────────────────

const FitDimensionEnum = z.nativeEnum(FitDimension);

export const WeightOverrideSchema = z.record(FitDimensionEnum, z.number().min(0).max(1));

export type WeightOverride = z.infer<typeof WeightOverrideSchema>;

// ─── Scores Query Schema ───────────────────────────────────────────────────

export const ScoresQuerySchema = z.object({
  jobId: z.string().optional(),
  recommendation: z.enum(['STRONG_PURSUE', 'PURSUE', 'CONSIDER', 'DEPRIORITIZE', 'SUPPRESS']).optional(),
  includeSuppressed: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type ScoresQuery = z.infer<typeof ScoresQuerySchema>;
