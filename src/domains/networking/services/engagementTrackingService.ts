import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { outreachRepository } from '../repositories/outreachRepository';
import { NetworkingDashboardStats, TemplateMetrics } from '../types';

const logger = createLogger({ component: 'engagement-tracking' });

type ReplyWindow = '7d' | '30d' | '90d';

export class EngagementTrackingService {
  async trackReply(
    outreachId: string,
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
  ): Promise<void> {
    const outreach = await outreachRepository.markReplied(outreachId, sentiment);
    await this.recordMetric(
      outreach.campaignId,
      'reply',
      1,
      sentiment,
    );
    logger.info({ outreachId, sentiment }, 'Reply tracked');
  }

  async calculateReplyRate(candidateId: string, window: ReplyWindow): Promise<number> {
    const days = window === '7d' ? 7 : window === '30d' ? 30 : 90;
    const since = new Date(Date.now() - days * 86_400_000);

    const [sent, replied] = await Promise.all([
      prisma.outreach.count({
        where: {
          campaign: { candidateId },
          sentAt: { gte: since },
          status: { in: ['SENT', 'DELIVERED', 'VIEWED', 'REPLIED'] },
        },
      }),
      prisma.outreach.count({
        where: {
          campaign: { candidateId },
          repliedAt: { gte: since },
          status: 'REPLIED',
        },
      }),
    ]);

    return sent > 0 ? replied / sent : 0;
  }

  async calculateConversionRate(candidateId: string): Promise<number> {
    // Conversion = contacts who replied AND candidateId has interview scheduled after
    const replied = await prisma.outreach.count({
      where: { campaign: { candidateId }, status: 'REPLIED' },
    });
    const interviews = await prisma.interview.count({ where: { candidateId } });
    return replied > 0 ? Math.min(interviews / replied, 1) : 0;
  }

  async getTemplatePerformance(candidateId: string): Promise<TemplateMetrics[]> {
    const outreaches = await prisma.outreach.findMany({
      where: { campaign: { candidateId } },
      select: {
        channel: true,
        sequenceStep: true,
        status: true,
      },
    });

    const buckets = new Map<string, { sent: number; replied: number }>();
    for (const o of outreaches) {
      const key = `${o.channel}:step${o.sequenceStep}`;
      const existing = buckets.get(key) ?? { sent: 0, replied: 0 };
      if (['SENT', 'DELIVERED', 'VIEWED', 'REPLIED'].includes(o.status)) existing.sent++;
      if (o.status === 'REPLIED') existing.replied++;
      buckets.set(key, existing);
    }

    return Array.from(buckets.entries()).map(([template, stats]) => ({
      template,
      sent: stats.sent,
      replied: stats.replied,
      replyRate: stats.sent > 0 ? stats.replied / stats.sent : 0,
    }));
  }

  async recordMetric(
    candidateId: string,
    metricType: string,
    value: number,
    dimension?: string,
  ): Promise<void> {
    await prisma.engagementMetric.create({
      data: { candidateId, metricType, value, dimension },
    });
  }

  async getDashboardStats(candidateId: string): Promise<NetworkingDashboardStats> {
    const [totalContacts, activeOutreaches, replyRate, warmPaths, activeCampaigns] =
      await Promise.all([
        prisma.contact.count({ where: { candidateId } }),
        prisma.outreach.count({
          where: { campaign: { candidateId }, status: { in: ['QUEUED', 'SENT', 'DELIVERED'] } },
        }),
        this.calculateReplyRate(candidateId, '30d'),
        prisma.relationshipGraph.count({
          where: { candidateId, confidence: { gte: 0.6 } },
        }),
        prisma.outreachCampaign.count({
          where: { candidateId, status: 'ACTIVE' },
        }),
      ]);

    // Avg response time in hours
    const recentReplied = await prisma.outreach.findMany({
      where: { campaign: { candidateId }, status: 'REPLIED', sentAt: { not: null }, repliedAt: { not: null } },
      select: { sentAt: true, repliedAt: true },
      take: 50,
    });

    const avgMs = recentReplied.length > 0
      ? recentReplied.reduce((sum, o) => sum + (o.repliedAt!.getTime() - o.sentAt!.getTime()), 0) / recentReplied.length
      : 0;

    return {
      totalContacts,
      activeOutreaches,
      replyRate,
      warmPaths,
      campaignsActive: activeCampaigns,
      avgResponseTime: Math.round(avgMs / 3_600_000), // hours
    };
  }
}

export const engagementTrackingService = new EngagementTrackingService();
