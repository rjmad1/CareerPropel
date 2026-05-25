import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import { createWorkflow } from './engine';
import { expireStaleApprovals } from './approval-manager';

const SCHEDULE_CHECK_INTERVAL_MS = 60_000; // 1 minute

/**
 * Process workflow schedules that are due to trigger.
 */
async function processDueSchedules(): Promise<void> {
  const due = await prisma.workflowSchedule.findMany({
    where: {
      isActive: true,
      nextTriggerAt: { lte: new Date() },
      definitionId: { not: null },
    },
    include: {
      candidate: { select: { id: true, email: true } },
    },
  });

  for (const schedule of due) {
    if (!schedule.definitionId) continue;

    try {
      const definition = await prisma.workflowDefinition.findUnique({
        where: { id: schedule.definitionId },
        select: { name: true },
      });
      if (!definition) continue;

      await createWorkflow({
        templateId: definition.name,
        candidateId: schedule.candidate.id,
        userId: schedule.candidate.email,
        jobId: schedule.jobId ?? undefined,
        triggeredBy: `schedule:${schedule.id}`,
      });

      const nextTriggerAt = computeNextTrigger(schedule);

      await prisma.workflowSchedule.update({
        where: { id: schedule.id },
        data: {
          lastTriggeredAt: new Date(),
          nextTriggerAt,
          // Deactivate one-time schedules after they fire
          isActive: nextTriggerAt !== null,
        },
      });

      log.info({ scheduleId: schedule.id, template: definition.name }, 'Schedule triggered');
    } catch (err) {
      log.error({ err, scheduleId: schedule.id }, 'Schedule trigger failed');
    }
  }
}

function computeNextTrigger(schedule: {
  triggerType: string;
  cronExpression?: string | null;
}): Date | null {
  if (schedule.triggerType === 'one_time') return null;

  if (schedule.triggerType === 'recurring' && schedule.cronExpression) {
    // Supports "every_Nd" syntax, e.g. "every_7d"
    const match = schedule.cronExpression.match(/^every_(\d+)d$/);
    if (match) {
      const days = parseInt(match[1], 10);
      return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }

  return null;
}

/**
 * Detect stale jobs and fire inactivity-triggered workflow schedules.
 */
async function processInactivitySchedules(): Promise<void> {
  const schedules = await prisma.workflowSchedule.findMany({
    where: {
      isActive: true,
      triggerType: 'inactivity',
      jobId: { not: null },
      inactivityDays: { not: null },
      definitionId: { not: null },
    },
    include: { candidate: { select: { id: true, email: true } } },
  });

  for (const schedule of schedules) {
    if (!schedule.jobId || !schedule.inactivityDays || !schedule.definitionId) continue;

    try {
      const lastActivity = await prisma.jobActivity.findFirst({
        where: { jobId: schedule.jobId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      if (!lastActivity) continue;

      const daysSince = Math.floor(
        (Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSince < schedule.inactivityDays) continue;

      // Check we haven't already triggered this recently
      const recentExecution = await prisma.workflowExecution.findFirst({
        where: {
          candidateId: schedule.candidate.id,
          jobId: schedule.jobId,
          definitionId: schedule.definitionId,
          createdAt: {
            gte: new Date(Date.now() - schedule.inactivityDays * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true },
      });

      if (recentExecution) continue;

      const definition = await prisma.workflowDefinition.findUnique({
        where: { id: schedule.definitionId },
        select: { name: true },
      });
      if (!definition) continue;

      await createWorkflow({
        templateId: definition.name,
        candidateId: schedule.candidate.id,
        userId: schedule.candidate.email,
        jobId: schedule.jobId,
        triggeredBy: `inactivity:${schedule.id}`,
      });

      await prisma.workflowSchedule.update({
        where: { id: schedule.id },
        data: { lastTriggeredAt: new Date() },
      });

      log.info(
        { scheduleId: schedule.id, jobId: schedule.jobId, daysSince },
        'Inactivity schedule triggered',
      );
    } catch (err) {
      log.error({ err, scheduleId: schedule.id }, 'Inactivity schedule processing failed');
    }
  }
}

/**
 * Start the workflow scheduler.
 * Runs schedule checks, inactivity detection, and approval expiry on a timer.
 */
export function startWorkflowScheduler(): { stop: () => void } {
  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await processDueSchedules();
      await processInactivitySchedules();
      await expireStaleApprovals();
    } catch (err) {
      log.error({ err }, 'Workflow scheduler tick error');
    } finally {
      running = false;
    }
  };

  const interval = setInterval(tick, SCHEDULE_CHECK_INTERVAL_MS);
  log.info('Workflow scheduler started');

  return {
    stop: () => {
      clearInterval(interval);
      log.info('Workflow scheduler stopped');
    },
  };
}
