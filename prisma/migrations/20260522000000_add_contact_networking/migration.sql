-- CreateTable: Contact (Networking / Recruiter CRM)
CREATE TABLE "Contact" (
    "id"               TEXT NOT NULL,
    "candidateId"      TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "company"          TEXT,
    "role"             TEXT,
    "email"            TEXT,
    "phone"            TEXT,
    "linkedInUrl"      TEXT,
    "type"             TEXT NOT NULL DEFAULT 'recruiter',
    "status"           TEXT NOT NULL DEFAULT 'to_contact',
    "jobId"            TEXT,
    "notes"            TEXT,
    "followUpAt"       TIMESTAMP(3),
    "lastContactedAt"  TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_candidateId_idx" ON "Contact"("candidateId");
CREATE INDEX "Contact_candidateId_status_idx" ON "Contact"("candidateId", "status");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
