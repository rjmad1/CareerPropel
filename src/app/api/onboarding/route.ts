import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CAPABILITY_PRESETS } from '@/lib/llm/orchestrator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    const candidate = await prisma.candidate.findUnique({
      where: { email },
      select: { id: true, preferences: true, name: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await request.json();
    const { persona, outcomes, privacyMode, computeTier } = body as {
      persona: {
        targetRole: string;
        industry: string;
        seniority: string;
      };
      outcomes: string[];
      privacyMode: 'local' | 'zero_retention' | 'enterprise';
      computeTier: 'free' | 'managed' | 'byo';
    };

    if (!persona || !outcomes || !privacyMode || !computeTier) {
      return NextResponse.json({ error: 'Invalid onboarding payload. All preferences are required.' }, { status: 400 });
    }

    // 1. Prepare user preferences update
    const currentPrefs = (candidate.preferences as Record<string, any>) || {};
    const updatedPreferences = {
      ...currentPrefs,
      onboarded: true,
      onboarding: {
        persona,
        outcomes,
        privacyMode,
        computeTier,
        completedAt: new Date().toISOString(),
      },
    };

    // 2. Perform database updates in a transaction
    await prisma.$transaction(async (tx) => {
      // A. Update candidate preferences & roles
      await tx.candidate.update({
        where: { id: candidate.id },
        data: {
          preferences: updatedPreferences,
          summary: `Target Role: ${persona.seniority} ${persona.targetRole} in ${persona.industry}`,
        },
      });

      // B. Create Capability presets matching choices
      for (const presetKey of Object.keys(CAPABILITY_PRESETS)) {
        // Map preset options based on privacy and compute preferences
        let providerName = 'gemini';
        let modelName = 'gemini-2.5-flash';
        let maxCostLimit = 0.05;

        // Apply Compute choices
        if (computeTier === 'free') {
          providerName = 'groq';
          modelName = 'llama-3.1-8b-instant';
          maxCostLimit = 0.01;
        } else if (computeTier === 'byo') {
          providerName = 'openai';
          modelName = 'gpt-4o-mini';
          maxCostLimit = 0.03;
        }

        // Apply Privacy overrides
        if (privacyMode === 'local') {
          providerName = 'ollama';
          modelName = 'llama3';
          maxCostLimit = 0.0;
        }

        // Specific preset adjustments
        if (presetKey === 'TECHNICAL_INTERVIEW') {
          if (privacyMode !== 'local') {
            providerName = 'anthropic';
            modelName = 'claude-3-5-sonnet-20241022';
            maxCostLimit = 0.15;
          } else {
            modelName = 'codegemma';
          }
        }

        await tx.userCapabilityPreset.upsert({
          where: {
            candidateId_presetName: {
              candidateId: candidate.id,
              presetName: presetKey,
            },
          },
          update: {
            providerName,
            modelName,
            maxCostLimit,
            privacyMode,
          },
          create: {
            candidateId: candidate.id,
            presetName: presetKey,
            providerName,
            modelName,
            maxCostLimit,
            privacyMode,
          },
        });
      }

      // C. Pre-scaffold initial provider configuration active state placeholders
      const providersToScaffold = ['openai', 'anthropic', 'gemini', 'groq', 'ollama'];
      for (const provider of providersToScaffold) {
        await tx.aiProviderConfig.upsert({
          where: {
            candidateId_providerName: {
              candidateId: candidate.id,
              providerName: provider,
            },
          },
          update: {
            isActive: true,
          },
          create: {
            candidateId: candidate.id,
            providerName: provider,
            isActive: true,
            priority: provider === 'ollama' ? 2 : 1,
            endpointUrl: provider === 'ollama' ? 'http://localhost:11434/v1' : null,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully and outcomes tailored.',
    });
  } catch (error) {
    console.error('[AI Onboarding POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save onboarding selections' },
      { status: 500 }
    );
  }
}
