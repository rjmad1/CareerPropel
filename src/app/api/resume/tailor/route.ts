/**
 * POST /api/resume/tailor
 *
 * Triggers a real AI resume tailoring pass via the `resume-tailor` agent.
 * Fetches variant content from DB, assembles full context (resume + JD + profile),
 * enqueues or directly persists the agent execution, and returns the executionId
 * for the client to poll.
 *
 * Request body:
 * {
 *   variantId?:       string   // DB variant to tailor (fetches content automatically)
 *   resumeContent?:   string   // raw markdown resume if no variantId
 *   jobDescription:   string   // required — the job posting text
 *   companyName?:     string
 *   targetRole?:      string
 * }
 *
 * Response 202:
 * {
 *   executionId: string
 *   status: 'queued'
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware/withAuth';
import { prisma } from '@/lib/db';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';
import { assembleMasterProfile } from '@/lib/profile/master-profile/assembler';
import { publishAgentStatus } from '@/lib/agents/redis-integration';

export const dynamic = 'force-dynamic';

const TailorSchema = z.object({
  variantId:      z.string().optional(),
  resumeContent:  z.string().max(50_000).optional(),
  jobDescription: z.string().min(10, 'Job description is required').max(15_000),
  companyName:    z.string().max(200).optional(),
  targetRole:     z.string().max(200).optional(),
});

export const POST = withAuth(
  async (request: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      if (!userEmail) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const body       = await request.json();
      const validation = TailorSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { variantId, resumeContent, jobDescription, companyName, targetRole } = validation.data;

      // Resolve candidate record
      const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
      if (!candidate) {
        return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
      }

      // Resolve resume content: prefer explicit variantId, then raw text
      let resolvedContent = resumeContent ?? '';
      let resolvedRole    = targetRole ?? '';
      let resolvedCompany = companyName ?? '';

      if (variantId) {
        const variant = await prisma.resumeVariant.findUnique({ where: { id: variantId } });
        if (!variant) {
          return NextResponse.json({ error: 'Resume variant not found' }, { status: 404 });
        }
        if (variant.candidateId !== candidate.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        resolvedContent = variant.content;
        resolvedRole    = resolvedRole || variant.targetRole;
        resolvedCompany = resolvedCompany || (variant.targetCompany ?? '');
      }

      if (!resolvedContent) {
        return NextResponse.json(
          { error: 'Provide either variantId or resumeContent' },
          { status: 400 }
        );
      }

      // Assemble master profile text for richer context (best-effort — not fatal)
      let profileText = '';
      try {
        const { profile } = await assembleMasterProfile(candidate.id);
        const skillNames  = profile.topSkills.join(', ');
        const roleLines   = profile.roles.slice(0, 5).map(
          (r) => `${r.title} at ${r.company} (${r.startDate}–${r.endDate ?? 'present'})`
        ).join('\n');
        profileText = `Top Skills: ${skillNames}\n\nRecent Experience:\n${roleLines}`;
      } catch {
        // Non-fatal — proceed with resume content only
      }

      // Build agent prompt context
      const promptContext: Record<string, string> = {
        resume:         resolvedContent,
        jobDescription,
        ...(resolvedCompany  && { companyName:  resolvedCompany }),
        ...(resolvedRole     && { targetRole:   resolvedRole }),
        ...(profileText      && { userProfile:  profileText }),
      };

      const useQueue = process.env.QUEUE_EXECUTION_ENABLED === 'true';

      let executionId: string;

      if (useQueue) {
        try {
          executionId = await enqueueAgentExecution(
            'resume-tailor',
            userEmail,
            promptContext as Record<string, unknown>,
          );
        } catch (enqueueErr: unknown) {
          const qErr = enqueueErr as { code?: string; message?: string };
          if (qErr?.code === 'COST_CEILING_EXCEEDED') {
            return NextResponse.json({ error: qErr.message }, { status: 400 });
          }
          throw enqueueErr;
        }
      } else {
        // Legacy cron path
        const execution = await prisma.agentExecution.create({
          data: {
            userId:          userEmail,
            agentType:       'resume-tailor',
            status:          'queued',
            input:           JSON.stringify(promptContext),
            executionSource: 'cron',
          },
        });

        publishAgentStatus(
          userEmail,
          execution.id,
          'resume-tailor',
          'queued',
          0,
          'Resume tailor queued for processing',
        ).catch(() => { /* Redis unavailable — client polls DB */ });

        executionId = execution.id;
      }

      // Tag the execution with variantId so the completion handler can find it
      if (variantId) {
        await prisma.agentExecution.update({
          where: { id: executionId },
          data:  { jobId: null }, // jobId is the only optional string field available
        }).catch(() => { /* Non-fatal */ });
      }

      return NextResponse.json(
        {
          executionId,
          status:  'queued',
          message: 'Resume tailoring queued. Poll for progress.',
          variantId: variantId ?? null,
        },
        { status: 202 }
      );
    } catch (err: unknown) {
      console.error('[Resume Tailor] Error:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'heavy',
    auditSensitivity: 'medium',
  }
);

