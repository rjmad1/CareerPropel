-- CreateTable
CREATE TABLE "AgentExecution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "agentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "input" TEXT,
    "output" TEXT,
    "errorMessage" TEXT,
    "tokenCount" INTEGER,
    "durationMs" INTEGER,
    "queueJobId" TEXT,
    "currentTask" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "providerId" TEXT,
    "requestId" TEXT,
    "correlationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolCall" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "tokens" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "ToolCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentExecution_userId_status_idx" ON "AgentExecution"("userId", "status");
CREATE INDEX "AgentExecution_jobId_idx" ON "AgentExecution"("jobId");
CREATE INDEX "AgentExecution_queueJobId_idx" ON "AgentExecution"("queueJobId");
CREATE INDEX "AgentExecution_agentType_createdAt_idx" ON "AgentExecution"("agentType", "createdAt");
CREATE INDEX "ToolCall_executionId_status_idx" ON "ToolCall"("executionId", "status");
CREATE INDEX "ToolCall_toolName_idx" ON "ToolCall"("toolName");
CREATE INDEX "EventLog_executionId_timestamp_idx" ON "EventLog"("executionId", "timestamp");
CREATE INDEX "EventLog_level_timestamp_idx" ON "EventLog"("level", "timestamp");

-- AddForeignKey
ALTER TABLE "ToolCall"
ADD CONSTRAINT "ToolCall_executionId_fkey"
FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog"
ADD CONSTRAINT "EventLog_executionId_fkey"
FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
