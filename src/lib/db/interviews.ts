import { prisma } from "@/lib/db";
import type { ScheduleInterviewInput, UpdateInterviewInput, ListInterviewsQuery } from '@/lib/validation/schemas';
import { createActivity } from './jobs';

/**
 * Get interviews for a user with optional filtering
 */
export async function getInterviews(userId: string, query: ListInterviewsQuery) {
  const { limit, offset, jobId, type, status, sortBy, sortOrder } = query;

  // Build where clause - must verify ownership via job
  const where: any = {
    job: {
      candidateId: userId,
    },
  };

  if (jobId) {
    where.jobId = jobId;
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      include: { job: true },
      orderBy: {
        [sortBy === 'createdAt' ? 'createdAt' : 'scheduledAt']: sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip: offset,
      take: limit,
    }),
    prisma.interview.count({ where }),
  ]);

  return {
    data: interviews,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Get a single interview
 */
export async function getInterviewById(userId: string, interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { job: true },
  });

  if (!interview) {
    return null;
  }

  // Verify ownership
  if (interview.job.candidateId !== userId) {
    return null;
  }

  return interview;
}

/**
 * Schedule a new interview
 */
export async function scheduleInterview(userId: string, data: ScheduleInterviewInput) {
  // Verify job ownership
  const job = await prisma.job.findFirst({
    where: { id: data.jobId, candidateId: userId },
  });

  if (!job) {
    return null;
  }

  const interview = await prisma.interview.create({
    data: {
      jobId: data.jobId,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration || 60,
      interviewer: data.interviewer,
      meetingLink: data.meetingLink,
      location: data.location,
      notes: data.notes,
      status: 'scheduled',
    },
    include: { job: true },
  });

  // Log activity
  await createActivity(data.jobId, 'INTERVIEW_SCHEDULED', {
    interviewType: data.type,
    scheduledAt: data.scheduledAt,
    interviewer: data.interviewer?.name,
  });

  return interview;
}

/**
 * Update an interview
 */
export async function updateInterview(userId: string, interviewId: string, data: UpdateInterviewInput) {
  const interview = await getInterviewById(userId, interviewId);
  if (!interview) {
    return null;
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
    include: { job: true },
  });

  // Log activity if status changed
  if (data.status && data.status !== interview.status) {
    await createActivity(interview.jobId, 'INTERVIEW_UPDATED', {
      previousStatus: interview.status,
      newStatus: data.status,
      interviewType: data.type || interview.type,
    });
  }

  return updated;
}

/**
 * Delete an interview
 */
export async function deleteInterview(userId: string, interviewId: string) {
  const interview = await getInterviewById(userId, interviewId);
  if (!interview) {
    return null;
  }

  await prisma.interview.delete({
    where: { id: interviewId },
  });

  // Log activity
  await createActivity(interview.jobId, 'INTERVIEW_DELETED', {
    interviewType: interview.type,
    scheduledAt: interview.scheduledAt,
  });

  return interview;
}

/**
 * Get interviews for a specific job
 */
export async function getJobInterviews(userId: string, jobId: string) {
  // Verify ownership
  const job = await prisma.job.findFirst({
    where: { id: jobId, candidateId: userId },
  });

  if (!job) {
    return null;
  }

  return prisma.interview.findMany({
    where: { jobId },
    orderBy: { scheduledAt: 'asc' },
  });
}

/**
 * Get upcoming interviews for a user
 */
export async function getUpcomingInterviews(userId: string, limit: number = 10) {
  return prisma.interview.findMany({
    where: {
      job: {
        candidateId: userId,
      },
      scheduledAt: {
        gte: new Date(),
      },
      status: 'scheduled',
    },
    include: { job: true },
    orderBy: { scheduledAt: 'asc' },
    take: limit,
  });
}
