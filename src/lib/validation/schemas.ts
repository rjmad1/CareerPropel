import { z } from 'zod';

/**
 * Jobs Domain Schemas
 */
export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  company: z.string().min(1, 'Company is required').max(200, 'Company name too long'),
  description: z.string().min(1, 'Description is required').max(5000),
  location: z.string().min(1, 'Location is required').max(100),
  salary: z.number().positive('Salary must be positive').optional(),
  salaryRange: z
    .object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
    })
    .optional(),
  matchScore: z.number().min(0).max(100).optional(),
  recruiter: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  source: z.string().optional(),
  applicationUrl: z.string().url().optional(),
  notes: z.string().max(3000).optional(),
});

export const updateJobSchema = z.object({
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(100).optional(),
  salary: z.number().positive().optional(),
  salaryRange: z
    .object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
    })
    .optional(),
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
  matchScore: z.number().min(0).max(100).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'rejected', 'offered', 'archived']).optional(),
  notes: z.string().max(3000).optional(),
  recruiter: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

export const listJobsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  company: z.string().optional(),
  stage: z.string().optional(),
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  minMatchScore: z.coerce.number().optional(),
  maxMatchScore: z.coerce.number().optional(),
  priority: z.string().optional(),
  sortBy: z
    .enum(['matchScore', 'appliedAt', 'salary', 'company', 'title', 'updatedAt'])
    .default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Interviews Domain Schemas
 */
export const scheduleInterviewSchema = z.object({
  jobId: z.string().min(1, 'Job ID required'),
  type: z.enum(['recruiter_screen', 'technical', 'system_design', 'behavioral', 'final_round', 'other']),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(240).optional().default(60),
  interviewer: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      title: z.string().optional(),
    })
    .optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  notes: z.string().max(2000).optional(),
  reminders: z
    .array(z.object({ type: z.enum(['email', 'sms', 'push']), minutesBefore: z.number() }))
    .optional(),
});

export const updateInterviewSchema = z.object({
  type: z.enum(['recruiter_screen', 'technical', 'system_design', 'behavioral', 'final_round', 'other']).optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().min(15).max(240).optional(),
  interviewer: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      title: z.string().optional(),
    })
    .optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  feedback: z
    .object({
      rating: z.number().min(1).max(5).optional(),
      notes: z.string().max(2000).optional(),
      nextSteps: z.string().max(1000).optional(),
    })
    .optional(),
});

export const listInterviewsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  jobId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['scheduledAt', 'createdAt']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Offers Domain Schemas
 */
export const logOfferSchema = z.object({
  jobId: z.string().min(1, 'Job ID required'),
  salary: z.number().positive('Salary must be positive'),
  equity: z
    .object({
      amount: z.number().positive().optional(),
      vestingYears: z.number().positive().optional(),
      cliffMonths: z.number().nonnegative().optional(),
    })
    .optional(),
  bonus: z
    .object({
      amount: z.number().nonnegative().optional(),
      type: z.enum(['cash', 'percentage']).optional(),
    })
    .optional(),
  benefits: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  startDate: z.string().datetime().optional(),
  negotiated: z.boolean().default(false),
  status: z.enum(['received', 'accepted', 'rejected', 'pending']).default('received'),
  notes: z.string().max(2000).optional(),
});

export const updateOfferSchema = z.object({
  salary: z.number().positive().optional(),
  equity: z
    .object({
      amount: z.number().positive().optional(),
      vestingYears: z.number().positive().optional(),
      cliffMonths: z.number().nonnegative().optional(),
    })
    .optional(),
  bonus: z
    .object({
      amount: z.number().nonnegative().optional(),
      type: z.enum(['cash', 'percentage']).optional(),
    })
    .optional(),
  status: z.enum(['received', 'accepted', 'rejected', 'pending']).optional(),
  negotiated: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const listOffersQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  status: z.string().optional(),
  sortBy: z.enum(['salary', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Documents Domain Schemas
 */
export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Document name required').max(200),
  type: z.enum(['resume', 'cover_letter', 'portfolio', 'research', 'notes', 'other']),
  content: z.string().min(1, 'Document content required'),
  jobId: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const listDocumentsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  type: z.string().optional(),
  jobId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Profile Domain Schemas
 */
export const updateProfileSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .array(
      z.object({
        title: z.string().max(200),
        company: z.string().max(200),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().max(2000).optional(),
      })
    )
    .optional(),
  preferences: z
    .object({
      targetRoles: z.array(z.string()).optional(),
      targetCompanies: z.array(z.string()).optional(),
      salaryExpectation: z.number().optional(),
      locations: z.array(z.string()).optional(),
      jobTypes: z.array(z.enum(['full_time', 'part_time', 'contract', 'freelance'])).optional(),
      workArrangement: z.array(z.enum(['remote', 'hybrid', 'on_site'])).optional(),
    })
    .optional(),
});

/**
 * Export all schemas
 */
export const schemas = {
  // Jobs
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
  // Interviews
  scheduleInterviewSchema,
  updateInterviewSchema,
  listInterviewsQuerySchema,
  // Offers
  logOfferSchema,
  updateOfferSchema,
  listOffersQuerySchema,
  // Documents
  uploadDocumentSchema,
  listDocumentsQuerySchema,
  // Profile
  updateProfileSchema,
};

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type ListInterviewsQuery = z.infer<typeof listInterviewsQuerySchema>;
export type LogOfferInput = z.infer<typeof logOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type ListOffersQuery = z.infer<typeof listOffersQuerySchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
