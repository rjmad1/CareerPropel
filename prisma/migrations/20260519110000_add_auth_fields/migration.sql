-- AlterTable: add credential auth + profile fields to Candidate
ALTER TABLE "Candidate"
    ADD COLUMN IF NOT EXISTS "avatarUrl"                 TEXT,
    ADD COLUMN IF NOT EXISTS "passwordHash"              TEXT,
    ADD COLUMN IF NOT EXISTS "emailVerified"             BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "emailVerificationToken"    TEXT,
    ADD COLUMN IF NOT EXISTS "emailVerificationTokenExp" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "passwordResetToken"        TEXT,
    ADD COLUMN IF NOT EXISTS "passwordResetTokenExp"     TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "preferences"               JSONB;
