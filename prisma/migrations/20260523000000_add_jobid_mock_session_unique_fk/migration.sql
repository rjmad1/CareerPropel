-- AddColumn: AgentExecution.jobId for precise indexed queries
ALTER TABLE "AgentExecution" ADD COLUMN "jobId" TEXT;
CREATE INDEX "AgentExecution_jobId_idx" ON "AgentExecution"("jobId");

-- AddForeignKey: MockInterviewSession.jobId → Job
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddUniqueConstraint: prevent duplicate sessions per candidate
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_candidateId_sessionId_key"
  UNIQUE ("candidateId", "sessionId");
