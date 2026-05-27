/**
 * Prompt Governance Registry
 * Versioned prompt storage with lineage, rollback, and A/B routing.
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { AgentType, getAgentSystemPrompt, buildAgentUserPromptTemplate } from '@/lib/agents/prompts';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'prompt-registry' });

export interface PromptVersionRecord {
  id: string;
  agentType: string;
  version: string;
  systemPrompt: string;
  systemHash: string;
  userPromptTemplate: string;
  userPromptHash: string;
  preprocessingVersion: string;
  sanitizerVersion: string;
  outputSchemaVersion: string;
  changelog: string | null;
  isActive: boolean;
  canaryPercent: number | null;
  createdBy: string | null;
  createdAt: Date;
}

export function hashPrompt(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Return the active PromptVersion for an agent type, seeding v1.0.0 if none exists. */
export async function getActivePromptVersion(agentType: AgentType): Promise<PromptVersionRecord> {
  // Canary: if multiple active versions exist, route based on canaryPercent
  const actives = await prisma.promptVersion.findMany({
    where: { agentType, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (actives.length === 0) {
    return seedPromptVersion(agentType);
  }

  if (actives.length === 1) return actives[0] as unknown as PromptVersionRecord;

  // Canary routing: pick canary version based on random roll
  const canary = actives.find((v) => v.canaryPercent != null);
  if (canary && Math.random() * 100 < (canary.canaryPercent ?? 0)) {
    return canary as unknown as PromptVersionRecord;
  }
  const stable = actives.find((v) => v.canaryPercent == null) ?? actives[0];
  return stable as unknown as PromptVersionRecord;
}

/** Seed v1.0.0 from the static prompts module. Idempotent. */
async function seedPromptVersion(agentType: AgentType): Promise<PromptVersionRecord> {
  const systemPrompt = getAgentSystemPrompt(agentType);
  const userPromptTemplate = buildAgentUserPromptTemplate(agentType);

  const existing = await prisma.promptVersion.findUnique({
    where: { agentType_version: { agentType, version: '1.0.0' } },
  });
  if (existing) return existing as unknown as PromptVersionRecord;

  const record = await prisma.promptVersion.create({
    data: {
      capability: agentType as string,
      agentType: agentType as string,
      version: '1.0.0',
      template: userPromptTemplate,
      systemPrompt,
      systemHash: hashPrompt(systemPrompt),
      userPromptTemplate,
      userPromptHash: hashPrompt(userPromptTemplate),
      changelog: 'Initial version seeded from static prompts',
      isActive: true,
      createdBy: 'system',
    },
  });

  log.info({ agentType, version: '1.0.0' }, 'Seeded initial prompt version');
  return record as unknown as PromptVersionRecord;
}

/** Register a new prompt version. Optionally deactivate previous versions. */
export async function registerPromptVersion(opts: {
  agentType: AgentType;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  changelog?: string;
  createdBy?: string;
  canaryPercent?: number;
  activate?: boolean; // default true
}): Promise<PromptVersionRecord> {
  const { agentType, version, systemPrompt, userPromptTemplate, changelog, createdBy, canaryPercent, activate = true } = opts;

  const record = await prisma.promptVersion.upsert({
    where: { agentType_version: { agentType, version } },
    create: {
      capability: agentType as string,
      agentType: agentType as string,
      version,
      template: userPromptTemplate,
      systemPrompt,
      systemHash: hashPrompt(systemPrompt),
      userPromptTemplate,
      userPromptHash: hashPrompt(userPromptTemplate),
      changelog: changelog ?? null,
      isActive: activate,
      canaryPercent: canaryPercent ?? null,
      createdBy: createdBy ?? null,
    },
    update: {
      systemPrompt,
      systemHash: hashPrompt(systemPrompt),
      userPromptTemplate,
      userPromptHash: hashPrompt(userPromptTemplate),
      changelog: changelog ?? null,
      isActive: activate,
      canaryPercent: canaryPercent ?? null,
    },
  });

  log.info({ agentType, version, isActive: activate }, 'Prompt version registered');
  return record as unknown as PromptVersionRecord;
}

/** Roll back to a specific version: deactivate all others, activate target. */
export async function rollbackPromptVersion(agentType: AgentType, version: string): Promise<void> {
  await prisma.$transaction([
    prisma.promptVersion.updateMany({
      where: { agentType, isActive: true },
      data: { isActive: false },
    }),
    prisma.promptVersion.update({
      where: { agentType_version: { agentType, version } },
      data: { isActive: true, deprecatedAt: null },
    }),
  ]);
  log.info({ agentType, version }, 'Rolled back to prompt version');
}

/** Diff two prompt versions for debugging/audit. */
export function diffPromptVersions(
  a: PromptVersionRecord,
  b: PromptVersionRecord,
): { systemChanged: boolean; userTemplateChanged: boolean; fromVersion: string; toVersion: string } {
  return {
    systemChanged: a.systemHash !== b.systemHash,
    userTemplateChanged: a.userPromptHash !== b.userPromptHash,
    fromVersion: a.version,
    toVersion: b.version,
  };
}

/** List all versions for an agent type ordered newest first. */
export async function listPromptVersions(agentType: AgentType): Promise<PromptVersionRecord[]> {
  const rows = await prisma.promptVersion.findMany({
    where: { agentType },
    orderBy: { createdAt: 'desc' },
  });
  return rows as unknown as unknown as PromptVersionRecord[];
}
