/**
 * @jest-environment node
 *
 * Scraping Queue & Worker Integration Tests — Phase 8 Validation
 *
 * Assertions:
 * 1. Enqueuing: LinkedIn profile and job search enqueues correctly.
 * 2. Dequeuing & Circuit Breaker: dequeueNext retrieves correct jobs, and handles tripped circuit breakers.
 * 3. Worker Processing & DB Upsert: executeJob handles success and performs DB updates/caching.
 * 4. Failure & Retry Budget: retries work with exponential backoff; permanent failures move to dead-letter.
 * 5. Execution Timeout: 45-second execution limit triggers failure on timeout.
 */

import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis/redisClient';
import { scrapingQueue, ScrapingJobPayload } from '@/lib/scraping/scrapingQueue';
import { startScrapingWorker, stopScrapingWorker } from '@/lib/scraping/worker';
import { searchIndeed } from '@/lib/scraping/indeed';
import { searchLinkedInJobs, importLinkedInProfile } from '@/lib/scraping/linkedin';
import {
  publishAgentStarted,
  publishAgentCompleted,
  publishAgentStatus,
} from '@/lib/agents/redis-integration';

// Mock Redis integration to assert pub/sub event updates
jest.mock('@/lib/agents/redis-integration', () => ({
  publishAgentStarted: jest.fn().mockResolvedValue(undefined),
  publishAgentCompleted: jest.fn().mockResolvedValue(undefined),
  publishAgentStatus: jest.fn().mockResolvedValue(undefined),
}));

// Mock indeed and linkedin modules to prevent launching real headless Chrome instances
jest.mock('@/lib/scraping/indeed', () => ({
  searchIndeed: jest.fn(),
  normalizeIndeed: jest.fn().mockImplementation((job) => ({
    source: 'indeed',
    externalId: null,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    url: job.url,
    postedAt: job.postedAt,
    salary: job.salary ?? null,
    department: null,
  })),
}));

jest.mock('@/lib/scraping/linkedin', () => ({
  searchLinkedInJobs: jest.fn(),
  importLinkedInProfile: jest.fn(),
  normalizeLinkedIn: jest.fn().mockImplementation((job) => ({
    source: 'linkedin',
    externalId: null,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    url: job.url,
    postedAt: job.postedAt,
    salary: null,
    department: null,
  })),
}));

const mockSearchIndeed = searchIndeed as jest.MockedFunction<typeof searchIndeed>;
const mockSearchLinkedInJobs = searchLinkedInJobs as jest.MockedFunction<typeof searchLinkedInJobs>;
const mockImportLinkedInProfile = importLinkedInProfile as jest.MockedFunction<typeof importLinkedInProfile>;

const mockPublishStarted = publishAgentStarted as jest.MockedFunction<typeof publishAgentStarted>;
const mockPublishCompleted = publishAgentCompleted as jest.MockedFunction<typeof publishAgentCompleted>;
const mockPublishStatus = publishAgentStatus as jest.MockedFunction<typeof publishAgentStatus>;

describe('Scraping Queue & Background Worker - Integrated Hardening Pass', () => {
  const originalSetTimeout = global.setTimeout;
  let TEST_USER_ID: string;
  let timeoutSpy: jest.SpiedFunction<typeof setTimeout>;

  beforeAll(() => {
    // Enable feature flags explicitly
    process.env.LINKEDIN_SCRAPING_ENABLED = 'true';
    process.env.INDEED_SCRAPING_ENABLED = 'true';
    process.env.SCRAPING_GLOBAL_KILL_SWITCH = 'false';

    // Intercept throttle delay in worker.ts to run immediately, but leave 45s task timeout intact
    timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn: any, ms?: number) => {
      if (ms !== undefined && ms >= 2000 && ms < 45000) {
        fn();
        return {} as any;
      }
      return originalSetTimeout(fn, ms) as any;
    });
  });

  afterAll(() => {
    if (timeoutSpy) {
      timeoutSpy.mockRestore();
    }
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    TEST_USER_ID = `test-user-${Math.random().toString(36).substring(7)}`;

    // Clean Redis keys
    await redis.del('scraping:queue');
    await redis.del('scraping:cb:linkedin:fails');
    await redis.del('scraping:cb:linkedin:status');
    await redis.del('scraping:cb:indeed:fails');
    await redis.del('scraping:cb:indeed:status');

    // Create a base candidate for the worker to reference
    await prisma.candidate.upsert({
      where: { id: TEST_USER_ID },
      create: {
        id: TEST_USER_ID,
        email: `${TEST_USER_ID}@example.com`,
        name: 'Test Candidate',
      },
      update: {
        email: `${TEST_USER_ID}@example.com`,
        name: 'Test Candidate',
      },
    });
  });

  afterEach(async () => {
    // Terminate worker loop if running
    stopScrapingWorker();

    // Clean database records
    await prisma.profileData.deleteMany({ where: { candidateId: TEST_USER_ID } });
    await prisma.skill.deleteMany({ where: { candidateId: TEST_USER_ID } });
    await prisma.agentExecution.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.candidate.deleteMany({ where: { id: TEST_USER_ID } });

    // Clean Redis keys
    await redis.del('scraping:queue');
    await redis.del('scraping:cb:linkedin:fails');
    await redis.del('scraping:cb:linkedin:status');
    await redis.del('scraping:cb:indeed:fails');
    await redis.del('scraping:cb:indeed:status');
  });

  // Test 1: Enqueuing
  describe('Queue Enqueuing', () => {
    it('correctly enqueues LinkedIn profile import, persists status queued, and publishes events', async () => {
      const profileUrl = 'https://linkedin.com/in/test-candidate';
      const correlationId = 'test-trace-id-123';

      const executionId = await scrapingQueue.enqueueProfileImport(
        TEST_USER_ID,
        profileUrl,
        correlationId
      );

      expect(executionId).toBeDefined();

      // Check DB entry status
      const execution = await prisma.agentExecution.findUniqueOrThrow({
        where: { id: executionId },
      });
      expect(execution.status).toBe('queued');
      expect(execution.userId).toBe(TEST_USER_ID);
      expect(JSON.parse(execution.input!)).toEqual({ profileUrl });

      // Check Redis queue payload
      const queuedJobs = await redis.lrange('scraping:queue', 0, -1);
      expect(queuedJobs).toHaveLength(1);

      const job: ScrapingJobPayload = JSON.parse(queuedJobs[0]);
      expect(job.executionId).toBe(executionId);
      expect(job.userId).toBe(TEST_USER_ID);
      expect(job.taskType).toBe('profile');
      expect(job.provider).toBe('linkedin');
      expect(job.payload).toEqual({ profileUrl });
      expect(job.correlationId).toBe(correlationId);
      expect(job.retries).toBe(0);

      // Verify real-time pub/sub notifications called
      expect(mockPublishStarted).toHaveBeenCalledWith(
        TEST_USER_ID,
        executionId,
        'linkedin-profile',
        { profileUrl }
      );
      expect(mockPublishStatus).toHaveBeenCalledWith(
        TEST_USER_ID,
        executionId,
        'linkedin-profile',
        'queued',
        0,
        'Profile import queued...'
      );
    });

    it('correctly enqueues job searches with proper provider mapping', async () => {
      const executionId = await scrapingQueue.enqueueJobSearch(
        TEST_USER_ID,
        'indeed',
        'Node.js Developer',
        'Austin, TX',
        10,
        'test-trace-id-456'
      );

      const execution = await prisma.agentExecution.findUniqueOrThrow({
        where: { id: executionId },
      });
      expect(execution.status).toBe('queued');
      expect(execution.agentType).toBe('indeed-search');
      expect(JSON.parse(execution.input!)).toEqual({
        query: 'Node.js Developer',
        location: 'Austin, TX',
        limit: 10,
      });

      const queuedJobs = await redis.lrange('scraping:queue', 0, -1);
      expect(queuedJobs).toHaveLength(1);
      const job: ScrapingJobPayload = JSON.parse(queuedJobs[0]);
      expect(job.provider).toBe('indeed');
    });
  });

  // Test 2: Dequeuing & Circuit Breakers
  describe('Queue Dequeuing and Circuit Breakers', () => {
    it('dequeues the next item in order when the circuit breaker is healthy', async () => {
      const id1 = await scrapingQueue.enqueueJobSearch(TEST_USER_ID, 'indeed', 'React Dev');
      const id2 = await scrapingQueue.enqueueJobSearch(TEST_USER_ID, 'linkedin', 'Next.js Dev');

      const job1 = await scrapingQueue.dequeueNext();
      expect(job1).not.toBeNull();
      expect(job1!.executionId).toBe(id1);

      const job2 = await scrapingQueue.dequeueNext();
      expect(job2).not.toBeNull();
      expect(job2!.executionId).toBe(id2);

      const jobEmpty = await scrapingQueue.dequeueNext();
      expect(jobEmpty).toBeNull();
    });

    it('defers the job, rotates it to the back, and returns null when circuit breaker trips', async () => {
      // Manually trip the circuit breaker for indeed
      await redis.set('scraping:cb:indeed:status', 'tripped');

      const id1 = await scrapingQueue.enqueueJobSearch(TEST_USER_ID, 'indeed', 'React Dev');
      const id2 = await scrapingQueue.enqueueJobSearch(TEST_USER_ID, 'linkedin', 'Next.js Dev');

      // The indeed job should be skipped and rotated back. dequeueNext returns null because the first job indeed is skipped.
      const jobResult = await scrapingQueue.dequeueNext();
      expect(jobResult).toBeNull();

      // Check if Indeed job is rotated to the back of the queue
      const queuedJobs = await redis.lrange('scraping:queue', 0, -1);
      expect(queuedJobs).toHaveLength(2);

      const firstQueued: ScrapingJobPayload = JSON.parse(queuedJobs[0]);
      const secondQueued: ScrapingJobPayload = JSON.parse(queuedJobs[1]);

      // Initially it was [indeed, linkedin]. After rotation, it should be [linkedin, indeed]
      expect(firstQueued.executionId).toBe(id2); // LinkedIn is now first
      expect(secondQueued.executionId).toBe(id1); // Indeed rotated to back
    });
  });

  // Test 3: Worker Processing
  describe('Worker Processing & DB Upsert', () => {
    it('successfully processes LinkedIn profile, executes database upsert, and updates execution state', async () => {
      const mockProfileData = {
        name: 'John Doe',
        headline: 'Staff Engineer',
        location: 'San Francisco, CA',
        about: 'Experienced developer',
        experience: [{ title: 'SWE', company: 'Google', duration: '2 years', description: 'coding' }],
        education: [{ school: 'UC Berkeley', degree: 'BS', field: 'CS', years: '2020' }],
        skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
      };

      mockImportLinkedInProfile.mockResolvedValueOnce(mockProfileData);

      const executionId = await scrapingQueue.enqueueProfileImport(
        TEST_USER_ID,
        'https://linkedin.com/in/johndoe'
      );

      // Start worker trigger sequentially
      const runningPromise = startScrapingWorker();
      
      // Stop the worker from looping forever in tests
      stopScrapingWorker();

      // Wait a moment for worker tasks to process
      await new Promise((resolve) => setTimeout(resolve, 100));
      await runningPromise;

      // Verify scraper called
      expect(mockImportLinkedInProfile).toHaveBeenCalledWith('https://linkedin.com/in/johndoe');

      // Verify db upsert of profile data
      const profile = await prisma.profileData.findUniqueOrThrow({
        where: {
          candidateId_type: {
            candidateId: TEST_USER_ID,
            type: 'linkedin_export',
          },
        },
      });
      expect(profile.content).toBeDefined();
      expect((profile.content as any).name).toBe('John Doe');

      // Verify db skills upsert
      const skills = await prisma.skill.findMany({
        where: { candidateId: TEST_USER_ID },
      });
      expect(skills.map(s => s.name)).toContain('TypeScript');
      expect(skills.map(s => s.name)).toContain('Node.js');

      // Verify DB execution status
      const updatedExec = await prisma.agentExecution.findUniqueOrThrow({
        where: { id: executionId },
      });
      expect(updatedExec.status).toBe('completed');
      expect(updatedExec.errorMessage).toBeNull();
      expect(JSON.parse(updatedExec.output!)).toEqual({
        name: 'John Doe',
        headline: 'Staff Engineer',
        experience: 1,
        education: 1,
        skills: 3,
      });

      // Verify pub/sub status update
      expect(mockPublishCompleted).toHaveBeenCalledWith(
        TEST_USER_ID,
        executionId,
        'linkedin-profile',
        'success',
        expect.any(Object)
      );
    });

    it('successfully processes job search, transiently caches in Redis (EX 10m), and completes job', async () => {
      const mockJobs = [
        { title: 'Engineer', company: 'Acme', location: 'Austin', description: 'Write code', url: 'http://acme.org/job', postedAt: 'today', salary: '$120k' }
      ];
      mockSearchIndeed.mockResolvedValueOnce(mockJobs);

      const executionId = await scrapingQueue.enqueueJobSearch(
        TEST_USER_ID,
        'indeed',
        'Engineer',
        'Austin'
      );

      const runningPromise = startScrapingWorker();
      stopScrapingWorker();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await runningPromise;

      expect(mockSearchIndeed).toHaveBeenCalledWith('Engineer', 'Austin', 20);

      // Verify execution updated to completed in DB
      const updatedExec = await prisma.agentExecution.findUniqueOrThrow({
        where: { id: executionId },
      });
      expect(updatedExec.status).toBe('completed');

      // Verify Redis transient caching
      const redisKey = `scraping:search:results:${executionId}`;
      const cached = await redis.get(redisKey);
      expect(cached).not.toBeNull();
      const parsedCached = JSON.parse(cached!);
      expect(parsedCached).toHaveLength(1);
      expect(parsedCached[0].title).toBe('Engineer');
      expect(parsedCached[0].source).toBe('indeed');

      // Verify Redis TTL is around 600 seconds
      const ttl = await redis.ttl(redisKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(600);
    });
  });

  // Test 4: Failures & Retry Budget
  describe('Failures & Retry Budget', () => {
    it('retries job with exponential backoff on failure and increments circuit breaker fails count', async () => {
      mockSearchLinkedInJobs.mockRejectedValueOnce(new Error('Rate limit block'));

      const executionId = await scrapingQueue.enqueueJobSearch(
        TEST_USER_ID,
        'linkedin',
        'Lead Dev'
      );

      const runningPromise = startScrapingWorker();
      stopScrapingWorker();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await runningPromise;

      // Expect that since the job failed, it gets scheduled for a retry
      // Let's check circuit breaker fails count in Redis
      const fails = await redis.get('scraping:cb:linkedin:fails');
      expect(Number(fails)).toBe(1);

      // Check that the job was re-queued
      const queuedJobs = await redis.lrange('scraping:queue', 0, -1);
      expect(queuedJobs).toHaveLength(1);
      
      const retriedJob: ScrapingJobPayload = JSON.parse(queuedJobs[0]);
      expect(retriedJob.retries).toBe(1);
      expect(retriedJob.executionId).toBe(executionId);

      // Status in DB remains queued for the next attempt
      const exec = await prisma.agentExecution.findUniqueOrThrow({
        where: { id: executionId },
      });
      expect(exec.status).toBe('queued');
    });

    it('moves to dead-letter (permanent failure) when retry budget (3) is exceeded', async () => {
      const executionId = await scrapingQueue.enqueueJobSearch(
        TEST_USER_ID,
        'linkedin',
        'Fail Dev'
      );

      const jobPayload: ScrapingJobPayload = {
        executionId,
        userId: TEST_USER_ID,
        taskType: 'search',
        provider: 'linkedin',
        payload: { query: 'Fail Dev' },
        retries: 3, // Already exhausted retry budget
      };

      // Handle the failure directly
      await scrapingQueue.fail(jobPayload, 'Persistent error block');

      // Check DB execution status
      const updatedExec = await prisma.agentExecution.findUniqueOrThrow({
        where: { id: executionId },
      });
      expect(updatedExec.status).toBe('failed');
      expect(updatedExec.errorMessage).toContain('Max retries reached. Error: Persistent error block');

      // Verify dead-letter pub/sub status update
      expect(mockPublishCompleted).toHaveBeenCalledWith(
        TEST_USER_ID,
        executionId,
        'linkedin-search',
        'failed',
        undefined,
        'Persistent error block'
      );

      // Verify circuit breaker incremented
      const failsCount = await redis.get('scraping:cb:linkedin:fails');
      expect(Number(failsCount)).toBe(1);
    });
  });

  // Test 5: Hard Timeouts (Phase 3)
  describe('Execution Timeout Racing', () => {
    it('trips the timeout if a scraping job hangs beyond 45 seconds', async () => {
      // Mock the scraper to return a promise that never resolves
      mockSearchLinkedInJobs.mockImplementation(() => new Promise(() => {}));

      await scrapingQueue.enqueueJobSearch(
        TEST_USER_ID,
        'linkedin',
        'Hanging Dev'
      );

      // Temporarily override timeoutSpy to trigger the 45s timeout after 50ms
      timeoutSpy.mockImplementation((fn: any, ms?: number) => {
        if (ms === 45000) {
          return originalSetTimeout(fn, 50) as any;
        }
        if (ms !== undefined && ms >= 2000 && ms < 45000) {
          fn();
          return {} as any;
        }
        return originalSetTimeout(fn, ms) as any;
      });

      const runningPromise = startScrapingWorker();
      stopScrapingWorker();

      // Wait for execution loop to fully run
      await new Promise((resolve) => setTimeout(resolve, 150));
      await runningPromise;

      // Verify the execution record is processed
      const fails = await redis.get('scraping:cb:linkedin:fails');
      expect(Number(fails)).toBe(1);
    });
  });
});
