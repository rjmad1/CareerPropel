import { PrismaClient } from '@prisma/client';
import type { CreateJobInput, UpdateJobInput, ListJobsQuery } from '@/lib/validation/schemas';

// Initialize Prisma
const prisma = new PrismaClient();

/**
 * Get all jobs for a user with filtering, sorting, and pagination
 */
export async function getJobs(userId: string, query: ListJobsQuery) {
  const {
    limit,
    offset,
    company,
    stage,
    minSalary,
    maxSalary,
    minMatchScore,
    maxMatchScore,
    priority,
    sortBy,
    sortOrder,
  } = query;

  // Build where clause
  const where: any = {
    candidateId: userId,
  };

  if (company) {
    where.company = { contains: company, mode: 'insensitive' };
  }

  if (stage) {
    where.stage = stage;
  }

  if (minSalary || maxSalary) {
    where.salary = {};
    if (minSalary) where.salary.gte = minSalary;
    if (maxSalary) where.salary.lte = maxSalary;
  }

  if (minMatchScore || maxMatchScore) {
    where.matchScore = {};
    if (minMatchScore) where.matchScore.gte = minMatchScore;
    if (maxMatchScore) where.matchScore.lte = maxMatchScore;
  }

  if (priority) {
    where.priority = priority;
  }

  // Map sort field to database column
  const sortMap: Record<string, string> = {
    matchScore: 'matchScore',
    appliedAt: 'appliedAt',
    salary: 'salary',
    company: 'company',
    title: 'title',
    updatedAt: 'updatedAt',
  };

  const orderBy = {
    [sortMap[sortBy] || 'updatedAt']: sortOrder === 'asc' ? 'asc' : 'desc',
  };

  // Execute query
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        activities: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data: jobs,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Get a single job by ID
 */
export async function getJobById(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!job) {
    return null;
  }

  // Verify ownership
  if (job.candidateId !== userId) {
    return null;
  }

  return job;
}

/**
 * Create a new job
 */
export async function createJob(userId: string, data: CreateJobInput) {
  const job = await prisma.job.create({
    data: {
      candidateId: userId,
      title: data.title,
      company: data.company,
      description: data.description,
      location: data.location,
      salary: data.salary,
      matchScore: data.matchScore || 0,
      appliedAt: new Date(),
      stage: 'sourced',
      priority: 'medium',
      recruiter: data.recruiter,
      notes: data.notes,
    },
  });

  // Log activity
  await createActivity(jobId, 'CREATED', {
    title: data.title,
    company: data.company,
  });

  return job;
}

/**
 * Update a job
 */
export async function updateJob(userId: string, jobId: string, data: UpdateJobInput) {
  const job = await getJobById(userId, jobId);
  if (!job) {
    return null;
  }

  const previousStage = job.stage;
  const previousPriority = job.priority;

  const updated = await prisma.job.update({
    where: { id: jobId },
    data,
  });

  // Log activity if stage or priority changed
  if (previousStage !== data.stage || previousPriority !== data.priority) {
    await createActivity(jobId, 'UPDATED', {
      previousStage,
      newStage: data.stage,
      previousPriority,
      newPriority: data.priority,
    });
  }

  return updated;
}

/**
 * Delete (archive) a job
 */
export async function deleteJob(userId: string, jobId: string) {
  const job = await getJobById(userId, jobId);
  if (!job) {
    return null;
  }

  const deleted = await prisma.job.update({
    where: { id: jobId },
    data: { stage: 'archived' },
  });

  // Log activity
  await createActivity(jobId, 'DELETED', {
    title: job.title,
    company: job.company,
  });

  return deleted;
}

/**
 * Create job activity (internal use)
 */
export async function createActivity(
  jobId: string,
  action: string,
  metadata: Record<string, any> = {}
) {
  return prisma.jobActivity.create({
    data: {
      jobId,
      action,
      metadata,
      createdAt: new Date(),
    },
  });
}

/**
 * Get activities for a job
 */
export async function getJobActivities(userId: string, jobId: string, limit: number = 50) {
  const job = await getJobById(userId, jobId);
  if (!job) {
    return null;
  }

  return prisma.jobActivity.findMany({
    where: { jobId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
