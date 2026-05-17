import { prisma } from "@/lib/db";
import type { LogOfferInput, UpdateOfferInput, ListOffersQuery } from '@/lib/validation/schemas';
import { createActivity } from './jobs';


/**
 * Get offers for a user
 */
export async function getOffers(userId: string, query: ListOffersQuery) {
  const { limit, offset, status, sortBy, sortOrder } = query;

  const where: any = {
    job: {
      candidateId: userId,
    },
  };

  if (status) {
    where.status = status;
  }

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      include: { job: true },
      orderBy: {
        [sortBy === 'salary' ? 'salary' : 'createdAt']: sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip: offset,
      take: limit,
    }),
    prisma.offer.count({ where }),
  ]);

  return {
    data: offers,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Get a single offer
 */
export async function getOfferById(userId: string, offerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { job: true },
  });

  if (!offer) {
    return null;
  }

  if (offer.job.candidateId !== userId) {
    return null;
  }

  return offer;
}

/**
 * Log a new offer
 */
export async function logOffer(userId: string, data: LogOfferInput) {
  // Verify job ownership
  const job = await prisma.job.findFirst({
    where: { id: data.jobId, candidateId: userId },
  });

  if (!job) {
    return null;
  }

  const offer = await prisma.offer.create({
    data: {
      jobId: data.jobId,
      salary: data.salary,
      equity: data.equity,
      bonus: data.bonus,
      benefits: data.benefits,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      status: data.status || 'received',
      negotiated: data.negotiated || false,
      notes: data.notes,
    },
    include: { job: true },
  });

  // Log activity and update job stage
  await createActivity(data.jobId, 'OFFER_RECEIVED', {
    salary: data.salary,
    status: data.status || 'received',
  });

  // Update job stage to offer
  await prisma.job.update({
    where: { id: data.jobId },
    data: { stage: 'offer' },
  });

  return offer;
}

/**
 * Update an offer
 */
export async function updateOffer(userId: string, offerId: string, data: UpdateOfferInput) {
  const offer = await getOfferById(userId, offerId);
  if (!offer) {
    return null;
  }

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data,
    include: { job: true },
  });

  // Log activity if status changed
  if (data.status && data.status !== offer.status) {
    await createActivity(offer.jobId, 'OFFER_UPDATED', {
      previousStatus: offer.status,
      newStatus: data.status,
    });
  }

  return updated;
}

/**
 * Delete an offer
 */
export async function deleteOffer(userId: string, offerId: string) {
  const offer = await getOfferById(userId, offerId);
  if (!offer) {
    return null;
  }

  await prisma.offer.delete({
    where: { id: offerId },
  });

  // Log activity
  await createActivity(offer.jobId, 'OFFER_DELETED', {
    salary: offer.salary,
  });

  return offer;
}

/**
 * Get job offers
 */
export async function getJobOffers(userId: string, jobId: string) {
  // Verify ownership
  const job = await prisma.job.findFirst({
    where: { id: jobId, candidateId: userId },
  });

  if (!job) {
    return null;
  }

  return prisma.offer.findMany({
    where: { jobId },
    orderBy: { createdAt: 'desc' },
  });
}
