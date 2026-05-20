/**
 * API Routing for settings/ai-providers
 * Handles:
 * - GET: Fetch active provider configs (with key masking) and presets
 * - POST: Save provider credentials and user capability preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encryptApiKey } from '@/lib/llm/privacy';

export const dynamic = 'force-dynamic';

const DEFAULT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function getMasterSecret(): string {
  return process.env.AI_MASTER_SECRET || DEFAULT_SECRET;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

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
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    const candidate = await prisma.candidate.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, providerConfig, presetConfig } = body as {
      action: 'save_provider' | 'save_preset';
      providerConfig?: {
        providerName: string;
        endpointUrl?: string;
        apiKey?: string;
        isActive?: boolean;
        priority?: number;
      };
      presetConfig?: {
        presetName: string;
        providerName: string;
        modelName: string;
        maxCostLimit?: number;
        privacyMode?: string;
      };
    };

    if (action === 'save_provider' && providerConfig) {
      const { providerName, endpointUrl, apiKey, isActive, priority } = providerConfig;

      // AES Encrypt if key was provided and not masked
      let encryptedKey: string | undefined = undefined;
      if (apiKey && apiKey !== '••••••••••••••••••••') {
        encryptedKey = encryptApiKey(apiKey, getMasterSecret());
      }

      await prisma.aiProviderConfig.upsert({
        where: {
          candidateId_providerName: {
            candidateId: candidate.id,
            providerName,
          },
        },
        update: {
          endpointUrl: endpointUrl || null,
          ...(encryptedKey ? { encryptedKey } : {}),
          isActive: isActive !== undefined ? isActive : true,
          priority: priority !== undefined ? priority : 1,
        },
        create: {
          candidateId: candidate.id,
          providerName,
          endpointUrl: endpointUrl || null,
          encryptedKey: encryptedKey || null,
          isActive: isActive !== undefined ? isActive : true,
          priority: priority !== undefined ? priority : 1,
        },
      });

      return NextResponse.json({ success: true, message: 'Provider configuration saved successfully' });
    }

    if (action === 'save_preset' && presetConfig) {
      const { presetName, providerName, modelName, maxCostLimit, privacyMode } = presetConfig;

      await prisma.userCapabilityPreset.upsert({
        where: {
          candidateId_presetName: {
            candidateId: candidate.id,
            presetName,
          },
        },
        update: {
          providerName,
          modelName,
          maxCostLimit: maxCostLimit !== undefined ? maxCostLimit : 0.05,
          privacyMode: privacyMode || 'enterprise',
        },
        create: {
          candidateId: candidate.id,
          presetName,
          providerName,
          modelName,
          maxCostLimit: maxCostLimit !== undefined ? maxCostLimit : 0.05,
          privacyMode: privacyMode || 'enterprise',
        },
      });

      return NextResponse.json({ success: true, message: 'Capability preset configuration saved successfully' });
    }

    return NextResponse.json({ error: 'Invalid request payload or action' }, { status: 400 });
  } catch (error) {
    console.error('[AI Provider Settings POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
