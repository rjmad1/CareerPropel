/**
 * API Routing for settings/ai-providers
 * Handles:
 * - GET: Fetch active provider configs (with key masking) and presets
 * - POST: Save provider credentials and user capability preferences
 * 
 * Enforced under Centralized Route Governance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { prisma } from '@/lib/db';
import { encryptApiKey } from '@/lib/llm/privacy';

export const dynamic = 'force-dynamic';

function getMasterSecret(): string {
  const secret = process.env.AI_MASTER_SECRET;
  if (!secret) {
    throw new Error('AI_MASTER_SECRET environment variable is required but not set');
  }
  return secret;
}

export const GET = withAuth(
  async (_request: NextRequest, auth) => {
    try {
      const email = auth.userEmail;

      // Fetch Candidate
      const candidate = await prisma.candidate.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      // Fetch Provider Configurations
      const configs = await prisma.aiProviderConfig.findMany({
        where: { candidateId: candidate.id },
      });

      // Fetch Capability Presets
      const presets = await prisma.userCapabilityPreset.findMany({
        where: { candidateId: candidate.id },
      });

      // Mask stored keys before returning them to client
      const sanitizedConfigs = configs.map((c) => ({
        providerName: c.providerName,
        endpointUrl: c.endpointUrl,
        isActive: c.isActive,
        priority: c.priority,
        hasKey: !!c.encryptedKey,
        maskedKey: c.encryptedKey ? '••••••••••••••••••••' : '',
      }));

      return NextResponse.json({
        configs: sanitizedConfigs,
        presets,
      });
    } catch (error) {
      console.error('[AI Provider Settings GET] Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to retrieve configurations' },
        { status: 500 }
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);

type ProviderConfig = {
  providerName: string;
  endpointUrl?: string;
  apiKey?: string;
  isActive?: boolean;
  priority?: number;
};

type PresetConfig = {
  presetName: string;
  providerName: string;
  modelName: string;
  maxCostLimit?: number;
  privacyMode?: string;
};

async function saveProvider(candidateId: string, cfg: ProviderConfig): Promise<NextResponse> {
  const { providerName, endpointUrl, apiKey, isActive, priority } = cfg;
  const encryptedKey =
    apiKey && apiKey !== '••••••••••••••••••••'
      ? encryptApiKey(apiKey, getMasterSecret())
      : undefined;

  await prisma.aiProviderConfig.upsert({
    where: { candidateId_providerName: { candidateId, providerName } },
    update: {
      endpointUrl: endpointUrl ?? null,
      ...(encryptedKey ? { encryptedKey } : {}),
      isActive: isActive ?? true,
      priority: priority ?? 1,
    },
    create: {
      candidateId,
      providerName,
      endpointUrl: endpointUrl ?? null,
      encryptedKey: encryptedKey ?? null,
      isActive: isActive ?? true,
      priority: priority ?? 1,
    },
  });
  return NextResponse.json({ success: true, message: 'Provider configuration saved successfully' });
}

async function savePreset(candidateId: string, cfg: PresetConfig): Promise<NextResponse> {
  const { presetName, providerName, modelName, maxCostLimit, privacyMode } = cfg;
  await prisma.userCapabilityPreset.upsert({
    where: { candidateId_presetName: { candidateId, presetName } },
    update: {
      providerName,
      modelName,
      maxCostLimit: maxCostLimit ?? 0.05,
      privacyMode: privacyMode ?? 'enterprise',
    },
    create: {
      candidateId,
      presetName,
      providerName,
      modelName,
      maxCostLimit: maxCostLimit ?? 0.05,
      privacyMode: privacyMode ?? 'enterprise',
    },
  });
  return NextResponse.json({ success: true, message: 'Capability preset configuration saved successfully' });
}

export const POST = withAuth(
  async (request: NextRequest, auth) => {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { email: auth.userEmail },
        select: { id: true },
      });

      if (!candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      const { action, providerConfig, presetConfig } = await request.json() as {
        action: 'save_provider' | 'save_preset';
        providerConfig?: ProviderConfig;
        presetConfig?: PresetConfig;
      };

      if (action === 'save_provider' && providerConfig) {
        return saveProvider(candidate.id, providerConfig);
      }

      if (action === 'save_preset' && presetConfig) {
        return savePreset(candidate.id, presetConfig);
      }

      return NextResponse.json({ error: 'Invalid request payload or action' }, { status: 400 });
    } catch (error) {
      console.error('[AI Provider Settings POST] Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to save configuration' },
        { status: 500 }
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'high',
  }
);
