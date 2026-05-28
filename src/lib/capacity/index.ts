import { partitionedQueues } from '@/lib/queue/queues';
import { redis } from '@/lib/redis/redisClient';
import { prisma } from '@/lib/db';
import { runtimeSettings } from '@/lib/runtime/settings';

export interface CapacityReport {
  timestamp: string;
  queues: {
    [key: string]: {
      depth: number;
      active: number;
      throughputPerMin: number;
      saturationRatio: number; // 0–1
    };
  };
  redis: {
    estimatedMemoryBytes: number;
    pressureStatus: 'low' | 'moderate' | 'high' | 'critical';
  };
  provider: {
    concurrencyUsed: number;
    concurrencyCapacity: number;
    concurrencyRatio: number;
  };
  saturationProjections: {
    timeToExhaustionMin: number; // minutes before saturation threshold
    alertLevel: 'green' | 'yellow' | 'red';
  };
  scalingRecommendations: string[];
}

/**
 * Compiles a comprehensive runtime capacity and saturation forecast report.
 */
export async function generateCapacityReport(): Promise<CapacityReport> {
  const report: CapacityReport = {
    timestamp: new Date().toISOString(),
    queues: {},
    redis: {
      estimatedMemoryBytes: 0,
      pressureStatus: 'low',
    },
    provider: {
      concurrencyUsed: 0,
      concurrencyCapacity: runtimeSettings.agentConcurrencyLimit,
      concurrencyRatio: 0,
    },
    saturationProjections: {
      timeToExhaustionMin: 9999,
      alertLevel: 'green',
    },
    scalingRecommendations: [],
  };

  // 1. Gather Queue Saturation Metric
  let totalActive = 0;
  let totalWaiting = 0;

  for (const [name, q] of Object.entries(partitionedQueues)) {
    const counts = await q.getJobCounts('waiting', 'active');
    const waiting = counts.waiting ?? 0;
    const active = counts.active ?? 0;
    totalActive += active;
    totalWaiting += waiting;

    // Estimate throughput based on last completed jobs count (mocked projection)
    const completedCount = await q.getJobCounts('completed');
    const throughput = Math.max(1, (completedCount.completed ?? 0) / 60); // proxy per-minute rate

    const limit = runtimeSettings.queueConcurrency;
    const saturationRatio = limit > 0 ? active / limit : 0;

    report.queues[name] = {
      depth: waiting,
      active,
      throughputPerMin: Number(throughput.toFixed(2)),
      saturationRatio: Number(saturationRatio.toFixed(2)),
    };
  }

  // 2. Estimate Redis Memory Pressure
  try {
    const info = await redis.info('memory');
    const match = info.match(/used_memory:(\d+)/);
    if (match) {
      report.redis.estimatedMemoryBytes = parseInt(match[1], 10);
    }
  } catch {
    // Fallback if info fails
    report.redis.estimatedMemoryBytes = 10 * 1024 * 1024; // 10MB
  }

  const memoryMb = report.redis.estimatedMemoryBytes / (1024 * 1024);
  if (memoryMb > 800) {
    report.redis.pressureStatus = 'critical';
  } else if (memoryMb > 500) {
    report.redis.pressureStatus = 'high';
  } else if (memoryMb > 250) {
    report.redis.pressureStatus = 'moderate';
  } else {
    report.redis.pressureStatus = 'low';
  }

  // 3. Provider Concurrency Estimation
  const runningExecutions = await prisma.agentExecution.count({
    where: { status: 'running' },
  });
  report.provider.concurrencyUsed = runningExecutions;
  const providerRatio = runtimeSettings.agentConcurrencyLimit > 0
    ? runningExecutions / runtimeSettings.agentConcurrencyLimit
    : 0;
  report.provider.concurrencyRatio = Number(providerRatio.toFixed(2));

  // 4. Calculate Saturation Projections
  const queueThreshold = 500;
  const currentDepth = totalWaiting;
  const depthRate = totalActive > 0 ? totalActive * 0.1 : 1; // dummy net increase proxy
  const timeToExhaustion = Math.max(0, (queueThreshold - currentDepth) / depthRate);
  
  report.saturationProjections.timeToExhaustionMin = Math.round(timeToExhaustion);

  if (currentDepth >= 300 || providerRatio > 0.9) {
    report.saturationProjections.alertLevel = 'red';
  } else if (currentDepth >= 100 || providerRatio > 0.7) {
    report.saturationProjections.alertLevel = 'yellow';
  } else {
    report.saturationProjections.alertLevel = 'green';
  }

  // 5. Generate Scaling Recommendations
  if (report.saturationProjections.alertLevel === 'red') {
    report.scalingRecommendations.push('🚨 URGENT: Deploy additional worker instances immediately. Core queues are saturated.');
    report.scalingRecommendations.push('🚨 ACTION: Enable dynamic load shedding to suspend all non-critical agents.');
  } else if (report.saturationProjections.alertLevel === 'yellow') {
    report.scalingRecommendations.push('⚠️ WARNING: Monitor worker concurrency levels closely. Standard queue depth is climbing.');
    report.scalingRecommendations.push('⚠️ ACTION: Transition high-cost operations to low-concurrency models.');
  } else {
    report.scalingRecommendations.push('✅ System capacity within bounds. No horizontal scaling required.');
  }

  if (report.redis.pressureStatus === 'critical' || report.redis.pressureStatus === 'high') {
    report.scalingRecommendations.push('🚨 REDIS: Memory footprint elevated. Execute eviction sweep on historical real-time buffers.');
  }

  return report;
}
