import { prisma } from '@/lib/db';
import { Contact } from '@prisma/client';
import {
  ContactFilters,
  ContactScores,
  DiscoveredRecruiter,
  PaginatedResult,
} from '../types';

export class ContactRepository {
  async findWithIntelligence(id: string) {
    return prisma.contact.findUnique({
      where: { id },
      include: {
        sourceRelationships: true,
        targetRelationships: true,
      },
    });
  }

  async findAll(candidateId: string, filters: ContactFilters): Promise<PaginatedResult<Contact>> {
    const limit = Math.min(filters.limit ?? 50, 200);
    const offset = filters.offset ?? 0;

    const where: Record<string, unknown> = { candidateId };
    if (filters.contactType) where.contactType = filters.contactType;
    if (filters.recruiterType) where.recruiterType = filters.recruiterType;
    if (filters.company) where.company = { contains: filters.company, mode: 'insensitive' };
    if (filters.minScore !== undefined) where.influenceScore = { gte: filters.minScore };
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { role: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: [{ influenceScore: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.contact.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async updateIntelligenceScores(id: string, scores: ContactScores): Promise<Contact> {
    return prisma.contact.update({
      where: { id },
      data: scores as Record<string, unknown>,
    });
  }

  async findDuplicates(name: string, company: string): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        name: { equals: name, mode: 'insensitive' },
        company: { equals: company, mode: 'insensitive' },
      },
    });
  }

  async upsertDiscovered(candidateId: string, data: DiscoveredRecruiter): Promise<Contact> {
    // Dedup: same name + company
    const existing = await this.findDuplicates(data.name, data.company);
    if (existing.length > 0) {
      return prisma.contact.update({
        where: { id: existing[0].id },
        data: {
          linkedInUrl: data.linkedinUrl ?? existing[0].linkedInUrl,
          email: data.email ?? existing[0].email,
          discoveryMetadata: { source: data.discoverySource, confidence: data.confidenceScore },
        },
      });
    }

    return prisma.contact.create({
      data: {
        candidateId,
        name: data.name,
        role: data.title,
        company: data.company,
        linkedInUrl: data.linkedinUrl,
        email: data.email,
        type: 'recruiter',
        status: 'to_contact',
        contactType: 'RECRUITER',
        recruiterType: data.recruiterType as never,
        discoveryMetadata: { source: data.discoverySource, confidence: data.confidenceScore },
      },
    });
  }

  async findTopByScore(candidateId: string, limit = 10): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: { candidateId },
      orderBy: [{ influenceScore: 'desc' }, { hiringAuthorityScore: 'desc' }],
      take: limit,
    });
  }
}

export const contactRepository = new ContactRepository();
