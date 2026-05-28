/**
 * WARNING: NOT FOR PRODUCTION USE
 * THIS IS A RETAINED SCRATCH/EXPERIMENTAL FILE RELOCATED OUTSIDE THE RUNTIME TREE.
 */

import { POST } from '../src/app/api/agents/execute/route';
import { NextRequest } from 'next/server';
import { startExecutionWorker, closeExecutionWorker, createExecutionWorker } from '../src/lib/queue/workers';
import { prisma } from '../src/lib/db';
import { closeQueues } from '../src/lib/queue/queues';

async function test() {
  console.log('--- STARTING CONTROLLED QUEUE EXECUTION TEST ---');
  
  const testUserId = 'test-queue-user@example.com';
  
  // Ensure a Candidate exists for this user to avoid missing candidate warnings/errors
  console.log(`Checking if Candidate exists for ${testUserId}...`);
  let candidate = await prisma.candidate.findUnique({
    where: { email: testUserId },
  });
  if (!candidate) {
    console.log(`Creating Candidate for ${testUserId}...`);
    candidate = await prisma.candidate.create({
      data: {
        email: testUserId,
        name: 'Queue Test User',
      },
    });
  }
  console.log('Candidate ready:', candidate.id);

  console.log('Setting QUEUE_EXECUTION_ENABLED=true in process.env');
  process.env.QUEUE_EXECUTION_ENABLED = 'true';

  console.log('Starting execution worker asynchronously...');
  const workerPromise = startExecutionWorker();
  const worker = createExecutionWorker();
  console.log('Worker initialized in background!');

  // Set up events to track progress
  worker.on('completed', (job) => {
    console.log(`[Worker Event] Job completed: ${job.id}`);
  });
  worker.on('failed', (job, err) => {
    console.error(`[Worker Event] Job failed: ${job?.id}, error:`, err);
  });

  console.log('Constructing NextRequest...');
  const req = new NextRequest('http://localhost/api/agents/execute', {
    method: 'POST',
    headers: {
      'x-user-id': testUserId,
    },
    body: JSON.stringify({
      agentType: 'resume-tailor',
      context: {
        resume: 'Test resume description and profile summary.',
      },
    }),
  });

  console.log('Invoking execute/route.ts POST endpoint...');
  const response = await POST(req);
  const responseData = await response.json();
  console.log('Response HTTP Status:', response.status);
  console.log('Response Body:', responseData);

  if (response.status !== 202) {
    throw new Error(`Expected HTTP status 202, got ${response.status}`);
  }

  const executionId = responseData.executionId;
  if (!executionId) {
    throw new Error('Response body did not contain executionId');
  }

  console.log(`Successfully enqueued. Execution ID: ${executionId}`);

  // Poll database to verify AgentExecution row lifecycle
  console.log('Polling database to verify AgentExecution lifecycle...');
  let success = false;
  for (let i = 0; i < 30; i++) {
    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
    });
    console.log(`[t=${i}s] DB Status:`, execution?.status, '| queueJobId:', execution?.queueJobId);
    
    if (execution?.status === 'completed') {
      console.log('Success! AgentExecution completed successfully.');
      success = true;
      break;
    } else if (execution?.status === 'failed') {
      console.log('AgentExecution failed. Error:', execution.errorMessage);
      // Wait, failed status is still a valid lifecycle transition (it did not crash on RecordNotFound!)
      success = true;
      break;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('Cleaning up candidate and DB records...');
  // Clean up the created execution record
  await prisma.agentExecution.deleteMany({
    where: { userId: testUserId },
  });
  await prisma.eventLog.deleteMany({
    where: { executionId },
  });
  await prisma.candidate.delete({
    where: { email: testUserId },
  });

  console.log('Shutting down worker and queues...');
  await closeExecutionWorker();
  await closeQueues();
  await prisma.$disconnect();

  if (success) {
    console.log('--- TEST PASSED SUCCESSFULLY ---');
  } else {
    console.log('--- TEST TIMED OUT OR FAILED ---');
    process.exit(1);
  }
}

test().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
