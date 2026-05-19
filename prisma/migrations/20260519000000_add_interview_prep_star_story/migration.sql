-- CreateTable
CREATE TABLE "InterviewPrep" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "prepStatus" TEXT NOT NULL DEFAULT 'not_started',
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "companyResearch" JSONB,
    "roleBreakdown" JSONB,
    "technicalPrep" JSONB,
    "systemDesignPrep" JSONB,
    "resumeAlignment" JSONB,
    "compensationGuide" JSONB,
    "generatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userModifications" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewPrep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarStory" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "interviewPrepId" TEXT,
    "competency" TEXT NOT NULL,
    "competencies" TEXT[],
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "situation" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "metrics" TEXT[],
    "sourceProject" TEXT,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeToTell" INTEGER,
    "confidence" INTEGER,
    "interviewQuestions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarStory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewPrep_jobId_key" ON "InterviewPrep"("jobId");

-- CreateIndex
CREATE INDEX "InterviewPrep_candidateId_idx" ON "InterviewPrep"("candidateId");

-- CreateIndex
CREATE INDEX "StarStory_candidateId_idx" ON "StarStory"("candidateId");

-- CreateIndex
CREATE INDEX "StarStory_interviewPrepId_idx" ON "StarStory"("interviewPrepId");

-- AddForeignKey
ALTER TABLE "InterviewPrep" ADD CONSTRAINT "InterviewPrep_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPrep" ADD CONSTRAINT "InterviewPrep_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarStory" ADD CONSTRAINT "StarStory_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarStory" ADD CONSTRAINT "StarStory_interviewPrepId_fkey" FOREIGN KEY ("interviewPrepId") REFERENCES "InterviewPrep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
