/**
 * AgentContextBuilder
 *
 * Fetches real candidate data from the database and merges it into the
 * context that gets sent to every agent prompt.  The worker calls this
 * before touching the LLM so "[No resume provided]" never reaches
 * production logs.
 */

import { prisma } from '@/lib/db';
import { AgentPromptContext } from './prompts';

interface ResumeContent {
  text?: string;
  [key: string]: unknown;
}

interface BuildContextOptions {
  /** userId is the candidate's email (NextAuth convention in this app) */
  userId: string;
  /** jobId to pull the matching job description, if the execution is job-scoped */
  jobId?: string;
  /** Any additional context the caller already has (wins on collision) */
  overrides?: Partial<AgentPromptContext>;
}

/**
 * Serialize a candidate's profile data + skills into a compact string
 * suitable for injecting into an agent prompt.
 */
function serializeProfile(candidate: {
  name: string;
  email: string;
  location: string | null;
  summary: string | null;
  skills: Array<{ name: string; proficiency: string }>;
  profileData: Array<{ type: string; content: unknown }>;
  achievements: Array<{ title: string; description: string; metrics: unknown }>;
}): string {
  const parts: string[] = [`Name: ${candidate.name}`, `Email: ${candidate.email}`];

  if (candidate.location) parts.push(`Location: ${candidate.location}`);
  if (candidate.summary) parts.push(`\nSummary:\n${candidate.summary}`);

  if (candidate.skills.length > 0) {
    const grouped: Record<string, string[]> = {};
    for (const s of candidate.skills) {
      (grouped[s.proficiency] ??= []).push(s.name);
    }
    const skillLines = Object.entries(grouped)
      .map(([level, names]) => `  ${level}: ${names.join(', ')}`)
      .join('\n');
    parts.push(`\nSkills:\n${skillLines}`);
  }

  // Resume text, if stored
  const resumeData = candidate.profileData.find((p) => p.type === 'resume');
  if (resumeData) {
    const content = resumeData.content as ResumeContent;
    const text = typeof content?.text === 'string'
      ? content.text
      : (resumeData.content != null ? JSON.stringify(resumeData.content) : 'Not available');
    parts.push(`\nResume:\n${text.slice(0, 4000)}`);
  }

  if (candidate.achievements.length > 0) {
    const achLines = candidate.achievements
      .slice(0, 5)
      .map((a) => `- ${a.title}: ${a.description}${a.metrics ? ` (${JSON.stringify(a.metrics)})` : ''}`)
      .join('\n');
    parts.push(`\nKey Achievements:\n${achLines}`);
  }

  return parts.join('\n');
}

export async function buildAgentContext(
  options: BuildContextOptions
): Promise<AgentPromptContext> {
  const { userId, jobId, overrides = {} } = options;

  // Fetch candidate by email (userId === email in this app)
  const candidate = await prisma.candidate.findUnique({
    where: { email: userId },
    include: {
      skills: true,
      profileData: { where: { type: { in: ['resume', 'linkedin_export'] } } },
      achievements: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });

  const ctx: AgentPromptContext = {};

  if (candidate) {
    ctx.userProfile = serializeProfile(candidate);

    // Extract resume text separately for agents that need it verbatim
    const resumeData = candidate.profileData.find((p) => p.type === 'resume');
    if (resumeData) {
      const content = resumeData.content as ResumeContent;
      ctx.resume = typeof content?.text === 'string'
        ? content.text
        : (resumeData.content != null ? JSON.stringify(resumeData.content) : undefined);
    }
  }

  // Fetch job-scoped context
  if (jobId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true, company: true, description: true },
    });
    if (job) {
      ctx.companyName = job.company;
      if (job.description) ctx.jobDescription = job.description;
    }
  }

  // Previous interview notes for interview-prep agent
  if (candidate && jobId) {
    const interviews = await prisma.interview.findMany({
      where: { candidateId: candidate.id, jobId },
      orderBy: { scheduledAt: 'desc' },
      take: 3,
      select: { type: true, notes: true, scheduledAt: true },
    });
    if (interviews.length > 0) {
      ctx.previousInterviews = interviews
        .map((i) => `${i.type} (${i.scheduledAt.toISOString().slice(0, 10)}): ${i.notes ?? 'No notes'}`)
        .join('\n');
    }
  }

  // Caller-supplied overrides win on collision — preserves manual context
  return { ...ctx, ...overrides };
}
