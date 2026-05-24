/**
 * @jest-environment node
 *
 * Unit & Integration Test Suite for Continuous Appraisal & Accomplishment System
 * Verifies:
 * - Accomplishment CRUD operations via route handlers.
 * - AI STAR Quantification and metrics extraction.
 * - Performance Appraisal compilation and DB session tracking.
 */

// 1. Setup required Mocks BEFORE importing application code
jest.mock('@/lib/middleware/auth', () => ({
  getAuthContext: jest.fn().mockResolvedValue({
    userId: 'test-candidate-001',
    userEmail: 'test-candidate-001@example.com',
    session: { user: { id: 'test-candidate-001', email: 'test-candidate-001@example.com' } },
  }),
}));

jest.mock('@/lib/llm/provider', () => ({
  callLLM: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { GET as getAccomplishments, POST as createAccomplishment, PUT as updateAccomplishment, DELETE as deleteAccomplishment } from '@/app/api/profile/accomplishments/route';
import { POST as quantifyAccomplishment } from '@/app/api/profile/quantify/route';
import { POST as compileAppraisal } from '@/app/api/profile/appraisal-compile/route';

const mockCallLLM = callLLM as jest.MockedFunction<typeof callLLM>;

describe('Continuous Performance System Tests', () => {
  beforeAll(async () => {
    // 2. Guarantee Candidate exists in clean staging state
    await prisma.candidate.upsert({
      where: { email: 'test-candidate-001@example.com' },
      update: {},
      create: {
        id: 'test-candidate-001',
        email: 'test-candidate-001@example.com',
        name: 'Test Candidate',
      },
    });
  });

  afterAll(async () => {
    // 3. Clean up database state
    await prisma.accomplishment.deleteMany({
      where: { candidateId: 'test-candidate-001' },
    });
    await prisma.appraisalSession.deleteMany({
      where: { candidateId: 'test-candidate-001' },
    });
    await prisma.candidate.delete({
      where: { id: 'test-candidate-001' },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Accomplishment Journal CRUD route handlers', () => {
    test('POST should create a new accomplishment log', async () => {
      const payload = {
        title: 'Built latencies compressor',
        category: 'Project',
        description: 'Optimized server execution latency.',
        metrics: '+40% speedup',
        starContext: 'Situation: latency peak; Action: custom compression.',
        visibility: 'staged_for_appraisal',
      };

      const req = new NextRequest('http://localhost/api/profile/accomplishments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await createAccomplishment(req);
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.accomplishment).toBeDefined();
      expect(body.accomplishment.title).toBe(payload.title);
      expect(body.accomplishment.visibility).toBe(payload.visibility);

      // Clean up local test creation
      await prisma.accomplishment.delete({
        where: { id: body.accomplishment.id },
      });
    });

    test('GET should retrieve all user accomplishments', async () => {
      const created = await prisma.accomplishment.create({
        data: {
          candidateId: 'test-candidate-001',
          title: 'GET Test Latency Compressor',
          category: 'Project',
          description: 'Optimized server execution latency.',
          metrics: '+40% speedup',
          visibility: 'staged_for_appraisal',
        },
      });

      const req = new NextRequest('http://localhost/api/profile/accomplishments', {
        method: 'GET',
      });

      const res = await getAccomplishments(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.accomplishments).toBeDefined();
      const match = body.accomplishments.find((acc: any) => acc.id === created.id);
      expect(match).toBeDefined();
      expect(match.title).toBe('GET Test Latency Compressor');

      // Clean up
      await prisma.accomplishment.delete({
        where: { id: created.id },
      });
    });

    test('PUT should modify existing accomplishment', async () => {
      const created = await prisma.accomplishment.create({
        data: {
          candidateId: 'test-candidate-001',
          title: 'Initial Title',
          category: 'Project',
          description: 'Initial Description',
          visibility: 'staged_for_appraisal',
        },
      });

      const updatePayload = {
        id: created.id,
        title: 'Built Premium latencies compressor',
        visibility: 'public',
      };

      const req = new NextRequest('http://localhost/api/profile/accomplishments', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      const res = await updateAccomplishment(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.accomplishment.title).toBe(updatePayload.title);
      expect(body.accomplishment.visibility).toBe(updatePayload.visibility);

      // Clean up
      await prisma.accomplishment.delete({
        where: { id: created.id },
      });
    });

    test('DELETE should discard logged accomplishment', async () => {
      const created = await prisma.accomplishment.create({
        data: {
          candidateId: 'test-candidate-001',
          title: 'To Be Deleted',
          category: 'Project',
          description: 'To Be Deleted Description',
          visibility: 'staged_for_appraisal',
        },
      });

      const req = new NextRequest(`http://localhost/api/profile/accomplishments?id=${created.id}`, {
        method: 'DELETE',
      });

      const res = await deleteAccomplishment(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);

      // Verify deletion from database
      const record = await prisma.accomplishment.findUnique({
        where: { id: created.id },
      });
      expect(record).toBeNull();
    });
  });

  describe('2. AI Quantified (STAR) Narratives', () => {
    test('POST should refine a raw achievement using LLM', async () => {
      // Mock LLM STAR output
      mockCallLLM.mockResolvedValueOnce({
        content: JSON.stringify({
          title: 'Refined Engine latency Optimizer',
          starContext: 'Situation: backend bottleneck; Action: custom indexing; Result: +35% latency drop.',
          metrics: '+35% latency drop',
          refinedDescription: '* Implemented customized indexing queries\n* Boosted overall platform speed',
        }),
        stopReason: 'end_turn',
        inputTokens: 120,
        outputTokens: 140,
        totalTokens: 260,
      });

      const payload = {
        title: 'indexed postgres db',
        description: 'made queries much faster',
        category: 'Process Improvement',
      };

      const req = new NextRequest('http://localhost/api/profile/quantify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await quantifyAccomplishment(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Refined Engine latency Optimizer');
      expect(body.data.metrics).toBe('+35% latency drop');
      expect(body.data.refinedDescription).toContain('queries');

      // Assertions on LLM mock call parameters
      expect(mockCallLLM).toHaveBeenCalledTimes(1);
      const callArgs = mockCallLLM.mock.calls[0];
      expect(callArgs[0]).toBeDefined(); // messages
      expect(callArgs[0][0].content).toContain(payload.title);
      expect(callArgs[0][0].content).toContain(payload.description);
      expect(callArgs[0][0].content).toContain(payload.category);
      expect(callArgs[1]).toEqual({
        systemPrompt: expect.stringContaining("STAR-formatted accomplishment quantification"),
        temperature: 0.3,
      });
    });

    test('POST should handle LLM failures gracefully', async () => {
      // Mock LLM failure
      mockCallLLM.mockRejectedValueOnce(new Error('LLM call failed'));

      const req = new NextRequest('http://localhost/api/profile/quantify', {
        method: 'POST',
        body: JSON.stringify({
          title: 'indexed postgres db',
          description: 'made queries much faster',
          category: 'Process Improvement',
        }),
      });

      const res = await quantifyAccomplishment(req);
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBe('LLM call failed');
    });
  });

  describe('3. Appraisal Compiler Narrative synthesis', () => {
    test('POST should synthesize staged accomplishments and record appraisal session', async () => {
      // Create staged accomplishments
      const a1 = await prisma.accomplishment.create({
        data: {
          candidateId: 'test-candidate-001',
          title: 'Spearheaded auth migration',
          category: 'Leadership',
          description: 'Led two engineers to migrate next-auth secrets.',
          metrics: '0 downtime',
          visibility: 'staged_for_appraisal',
        },
      });

      mockCallLLM.mockResolvedValueOnce({
        content: `# Mid-Year Appraisal Draft\n1. **Executive Summary**: Delivered high value.\n2. **Execution & Scope**: Preserved **0 downtime** metric.`,
        stopReason: 'end_turn',
        inputTokens: 200,
        outputTokens: 300,
        totalTokens: 500,
      });

      const req = new NextRequest('http://localhost/api/profile/appraisal-compile', {
        method: 'POST',
        body: JSON.stringify({
          ids: [a1.id],
          title: 'H1 Midyear Review Cycle',
          type: 'performance',
        }),
      });

      const res = await compileAppraisal(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.content).toContain('Preserved');
      expect(body.session).toBeDefined();

      // Check DB entry for session
      const session = await prisma.appraisalSession.findUnique({
        where: { id: body.session.id },
      });
      expect(session).not.toBeNull();
      expect(session?.status).toBe('compiled');
      expect(session?.selfReview).toContain('Mid-Year Appraisal Draft');

      // Assertions on LLM mock call parameters
      expect(mockCallLLM).toHaveBeenCalledTimes(1);
      const callArgs = mockCallLLM.mock.calls[0];
      expect(callArgs[0]).toBeDefined(); // messages
      expect(callArgs[0][0].content).toContain('Spearheaded auth migration');
      expect(callArgs[0][0].content).toContain('0 downtime');
      expect(callArgs[1]).toEqual({
        systemPrompt: expect.stringContaining("Chief People Officer"),
        temperature: 0.5,
      });

      // Clean up accomplishments and sessions
      await prisma.appraisalSession.delete({
        where: { id: session!.id },
      });
      await prisma.accomplishment.delete({
        where: { id: a1.id },
      });
    });

    test('POST with empty/missing ids should return a 400 and not create an appraisalSession', async () => {
      const req = new NextRequest('http://localhost/api/profile/appraisal-compile', {
        method: 'POST',
        body: JSON.stringify({
          title: 'H1 Midyear Review Cycle',
          type: 'performance',
        }),
      });

      const res = await compileAppraisal(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toContain('Staged accomplishment IDs are required');

      // Check DB entry for session
      const sessions = await prisma.appraisalSession.findMany({
        where: { candidateId: 'test-candidate-001' },
      });
      expect(sessions.length).toBe(0);
    });

    test('POST with invalid/nonexistent ids should return a 404 and not create a session', async () => {
      const req = new NextRequest('http://localhost/api/profile/appraisal-compile', {
        method: 'POST',
        body: JSON.stringify({
          ids: ['nonexistent-id-123'],
          title: 'H1 Midyear Review Cycle',
          type: 'performance',
        }),
      });

      const res = await compileAppraisal(req);
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.error).toContain('No matching accomplishments found');

      // Check DB entry for session
      const sessions = await prisma.appraisalSession.findMany({
        where: { candidateId: 'test-candidate-001' },
      });
      expect(sessions.length).toBe(0);
    });

    test('POST should handle LLM failure gracefully and not create an appraisalSession', async () => {
      // Create staged accomplishments
      const a1 = await prisma.accomplishment.create({
        data: {
          candidateId: 'test-candidate-001',
          title: 'Spearheaded auth migration',
          category: 'Leadership',
          description: 'Led two engineers to migrate next-auth secrets.',
          metrics: '0 downtime',
          visibility: 'staged_for_appraisal',
        },
      });

      mockCallLLM.mockRejectedValueOnce(new Error('LLM call failed'));

      const req = new NextRequest('http://localhost/api/profile/appraisal-compile', {
        method: 'POST',
        body: JSON.stringify({
          ids: [a1.id],
          title: 'H1 Midyear Review Cycle',
          type: 'performance',
        }),
      });

      const res = await compileAppraisal(req);
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBe('LLM call failed');

      // Check DB entry for session
      const sessions = await prisma.appraisalSession.findMany({
        where: { candidateId: 'test-candidate-001' },
      });
      expect(sessions.length).toBe(0);

      // Clean up
      await prisma.accomplishment.delete({
        where: { id: a1.id },
      });
    });
  });
});
