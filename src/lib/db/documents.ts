import { prisma } from "@/lib/db";
import type { UploadDocumentInput, ListDocumentsQuery } from '@/lib/validation/schemas';

/**
 * Get documents for a user
 */
export async function getDocuments(userId: string, query: ListDocumentsQuery) {
  const { limit, offset, type, jobId, sortBy, sortOrder } = query;

  const where: any = {
    candidateId: userId,
  };

  if (type) {
    where.type = type;
  }

  if (jobId) {
    where.jobId = jobId;
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: {
        [sortBy === 'name' ? 'name' : sortBy === 'createdAt' ? 'createdAt' : 'updatedAt']:
          sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip: offset,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    data: documents,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Get a single document
 */
export async function getDocumentById(userId: string, documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document || document.candidateId !== userId) {
    return null;
  }

  return document;
}

/**
 * Upload a new document
 */
export async function uploadDocument(userId: string, data: UploadDocumentInput) {
  return prisma.document.create({
    data: {
      candidateId: userId,
      name: data.name,
      type: data.type,
      content: data.content,
      jobId: data.jobId,
      version: data.version || '1.0',
      tags: data.tags ?? [],
    },
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(userId: string, documentId: string) {
  const document = await getDocumentById(userId, documentId);
  if (!document) {
    return null;
  }

  return prisma.document.delete({
    where: { id: documentId },
  });
}

/**
 * Get documents by type
 */
export async function getDocumentsByType(userId: string, type: string) {
  return prisma.document.findMany({
    where: {
      candidateId: userId,
      type,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Get job-specific documents
 */
export async function getJobDocuments(userId: string, jobId: string) {
  return prisma.document.findMany({
    where: {
      candidateId: userId,
      jobId,
    },
    orderBy: { updatedAt: 'desc' },
  });
}
