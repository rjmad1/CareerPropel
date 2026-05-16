import { z } from 'zod'

/**
 * Job validation schemas
 * Centralized validation for all job-related endpoints
 */

export const CreateJobInputSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(255, 'Job title must be under 255 characters')
    .trim(),
  company: z
    .string()
    .min(1, 'Company name is required')
    .max(255, 'Company name must be under 255 characters')
    .trim(),
  url: z
    .string()
    .url('Invalid job URL')
    .max(2048, 'URL must be under 2048 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Notes must be under 2000 characters')
    .optional()
    .or(z.literal('')),
  stage: z
    .enum([
      'sourced',
      'interested',
      'resume_tailoring',
      'applied',
      'recruiter_screen',
      'hiring_manager',
      'technical_interview',
      'system_design',
      'behavioral',
      'final_round',
      'offer',
      'negotiation',
      'rejected',
      'archived',
    ])
    .optional()
    .default('sourced'),
})

export const UpdateJobInputSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title must not be empty')
    .max(255, 'Job title must be under 255 characters')
    .trim()
    .optional(),
  company: z
    .string()
    .min(1, 'Company name must not be empty')
    .max(255, 'Company name must be under 255 characters')
    .trim()
    .optional(),
  url: z
    .string()
    .url('Invalid job URL')
    .max(2048, 'URL must be under 2048 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Notes must be under 2000 characters')
    .optional()
    .or(z.literal('')),
  stage: z
    .enum([
      'sourced',
      'interested',
      'resume_tailoring',
      'applied',
      'recruiter_screen',
      'hiring_manager',
      'technical_interview',
      'system_design',
      'behavioral',
      'final_round',
      'offer',
      'negotiation',
      'rejected',
      'archived',
    ])
    .optional(),
})

export const JobFilterSchema = z.object({
  company: z.string().optional(),
  search: z.string().optional(),
  stage: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
})

// Type exports for use in hooks/components
export type CreateJobInput = z.infer<typeof CreateJobInputSchema>
export type UpdateJobInput = z.infer<typeof UpdateJobInputSchema>
export type JobFilter = z.infer<typeof JobFilterSchema>
