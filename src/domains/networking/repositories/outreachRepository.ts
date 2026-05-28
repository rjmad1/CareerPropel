import { prisma } from '@/lib/db';
import { Outreach, OutreachStatus } from '@prisma/client';
import { CreateOutreachInput } from '../types';

export class OutreachRepository {
  async create(data: CreateOutreachInput): Promise<Outreach> {
    return prisma.outreach.create({
      data: {
        campaignId: data.campaignId,
        contactId: data.contactId,
        channel: data.channel,
        message: data.message,
        personalizedMessage: data.personalizedMessage,
        sequenceStep: data.sequenceStep ?? 0,
        scheduledAt: data.scheduledAt,
        status: 'DRAFT',
      },
    });
  }

  async approve(id: string, approvedBy: string): Promise<Outreach> {
    return prisma.outreach.update({
      where: { id },
      data: { approvedBy, approvedAt: new Date(), status: 'QUEUED' },
    });
  }

  async markSent(id: string): Promise<Outreach> {
    return prisma.outreach.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async markReplied(id: string, sentiment: string): Promise<Outreach> {
    const outreach = await prisma.outreach.update({
      where: { id },
      data: { status: 'REPLIED', repliedAt: new Date(), responseSentiment: sentiment },
    });
    // Update contact lastReplyAt
    await prisma.contact.update({
      where: { id: outreach.contactId },
      data: { lastReplyAt: new Date() },
    });
    return outreach;
  }

  async findPendingApproval(candidateId: string) {
    return prisma.outreach.findMany({
      where: {
        status: 'DRAFT',
        approvedAt: null,
        campaign: { candidateId },
      },
      include: {
        contact: { select: { id: true, name: true, company: true, role: true } },
        campaign: { select: { id: true, company: true, objective: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countTodaySent(candidateId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return prisma.outreach.count({
      where: {
        sentAt: { gte: startOfDay },
        campaign: { candidateId },
        status: { in: ['SENT', 'DELIVERED', 'VIEWED', 'REPLIED'] },
      },
    });
  }

  async findSequenceNext(campaignId: string, contactId: string): Promise<Outreach | null> {
    return prisma.outreach.findFirst({
      where: { campaignId, contactId, status: 'QUEUED', scheduledAt: { lte: new Date() } },
      orderBy: { sequenceStep: 'asc' },
    });
  }

  async findByCampaignAndStatus(campaignId: string, status: OutreachStatus) {
    return prisma.outreach.findMany({
      where: { campaignId, status },
      include: { contact: true },
    });
  }
}

export const outreachRepository = new OutreachRepository();
