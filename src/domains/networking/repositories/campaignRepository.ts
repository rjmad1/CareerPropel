import { prisma } from '@/lib/db';
import { OutreachCampaign, OutreachCampaignStatus } from '@prisma/client';
import { CampaignFilters, CampaignStats, CreateCampaignInput } from '../types';

export class CampaignRepository {
  async create(data: CreateCampaignInput): Promise<OutreachCampaign> {
    return prisma.outreachCampaign.create({ data });
  }

  async findById(id: string) {
    return prisma.outreachCampaign.findUnique({
      where: { id },
      include: {
        outreaches: {
          include: { contact: true },
          orderBy: { createdAt: 'desc' },
        },
        job: { select: { id: true, title: true, company: true } },
      },
    });
  }

  async findAll(candidateId: string, filters: CampaignFilters = {}) {
    const where: Record<string, unknown> = { candidateId };
    if (filters.status) where.status = filters.status;

    return prisma.outreachCampaign.findMany({
      where,
      include: {
        _count: { select: { outreaches: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    });
  }

  async updateStatus(id: string, status: OutreachCampaignStatus): Promise<OutreachCampaign> {
    return prisma.outreachCampaign.update({
      where: { id },
      data: {
        status,
        ...(status === 'ACTIVE' ? { startedAt: new Date() } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
  }

  async getStats(id: string): Promise<CampaignStats> {
    const outreaches = await prisma.outreach.findMany({
      where: { campaignId: id },
      select: { status: true },
    });

    const sent = outreaches.filter((o) => ['SENT', 'DELIVERED', 'VIEWED', 'REPLIED'].includes(o.status)).length;
    const replied = outreaches.filter((o) => o.status === 'REPLIED').length;
    const pending = outreaches.filter((o) => o.status === 'DRAFT').length;

    return {
      totalOutreaches: outreaches.length,
      sent,
      replied,
      replyRate: sent > 0 ? replied / sent : 0,
      pending,
    };
  }
}

export const campaignRepository = new CampaignRepository();
