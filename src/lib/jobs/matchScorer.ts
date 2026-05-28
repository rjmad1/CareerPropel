import { callLLM } from '@/lib/llm/provider';
import { prisma } from '@/lib/db';

export interface MatchAnalysis {
  score: number; // 0–100
  summary: string;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  scoredAt: string;
  source?: 'ai' | 'fallback';
  confidence?: 'high' | 'medium' | 'low';
  reason?: string;
}

/**
 * Score a job against the candidate's profile using Claude.
 * Persists matchScore on the Job row and returns the full analysis.
 */
export async function scoreJobMatch(
  jobId: string,
  candidateId: string
): Promise<MatchAnalysis> {
  const [job, candidate] = await Promise.all([
    prisma.job.findUnique({
      where: { id: jobId, candidateId },
      select: { title: true, company: true, description: true },
    }),
    prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        skills: { take: 30 },
        achievements: { take: 10 },
        profileEntities: {
          where: { type: { in: ['experience', 'education', 'certification'] } },
          take: 20,
        },
      },
    }),
  ]);

  if (!job) throw new Error('Job not found');
  if (!candidate) throw new Error('Candidate not found');

  const skillsList = candidate.skills
    .map((s) => `${s.name} (${s.proficiency})`)
    .join(', ');

  const achievementsList = candidate.achievements
    .map((a) => `- ${a.title}: ${a.description}`)
    .join('\n');

  const experienceList = candidate.profileEntities
    .filter((e) => e.type === 'experience')
    .map((e) => {
      const d = e.data !== null && typeof e.data === 'object' ? e.data as Record<string, unknown> : {};
      const title = typeof d.title === 'string' ? d.title : 'Role';
      const company = typeof d.company === 'string' ? d.company : 'Company';
      return `- ${title} at ${company}`;
    })
    .join('\n');

  const jdText = job.description
    ? job.description.slice(0, 2000)
    : `${job.title} role at ${job.company} (no description provided)`;

  const prompt = `You are a senior technical recruiter and career coach. Evaluate how well this candidate matches the job posting. Respond with ONLY a valid JSON object — no markdown fences, no extra text.

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${jdText}

CANDIDATE PROFILE:
Skills: ${skillsList || 'No skills listed'}
${achievementsList ? `Key Achievements:\n${achievementsList}` : ''}
${experienceList ? `Experience:\n${experienceList}` : ''}
${candidate.summary ? `Summary: ${candidate.summary}` : ''}

Return this exact JSON structure:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence honest assessment of fit>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap or missing skill 1>", "<gap 2>"],
  "nextSteps": ["<concrete action to improve candidacy>", "<action 2>"]
}

Scoring guide:
90-100: Exceptional fit — candidate exceeds most requirements
75-89: Strong fit — meets key requirements with minor gaps
60-74: Good fit — meets core requirements, some gaps exist
40-59: Partial fit — relevant background but significant gaps
0-39: Weak fit — fundamental misalignment`;

  let analysis: MatchAnalysis;

  try {
    const result = await callLLM([{ role: 'user', content: prompt }], {
      maxTokens: 800,
      temperature: 0.1,
      systemPrompt: 'You are an expert recruiter evaluating candidate-job fit. Always respond with valid JSON only.',
    });

    const raw = result.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    analysis = {
      score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      summary: String(parsed.summary || ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String) : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.map(String) : [],
      scoredAt: new Date().toISOString(),
      source: 'ai',
      confidence: 'high',
    };
  } catch (err) {
    console.error('[matchScorer] AI scoring failed — job:', jobId, 'candidate:', candidateId, err);
    const hasDescription = Boolean(job.description);
    const skillCount = candidate.skills.length;
    const fallbackScore = Math.min(
      hasDescription ? 50 + Math.min(skillCount * 2, 30) : 30,
      75
    );

    analysis = {
      score: fallbackScore,
      summary: `AI analysis temporarily unavailable. Using estimated scoring based on profile completeness (${skillCount} skills).`,
      strengths: skillCount > 0 ? [`${skillCount} skills on profile`] : [],
      gaps: ['Add job description for detailed gap analysis', 'Complete profile for better scoring'],
      nextSteps: ['Paste the full job description', 'Add your key achievements to the profile'],
      scoredAt: new Date().toISOString(),
      source: 'fallback',
      confidence: 'low',
      reason: 'AI provider temporarily offline. Displaying estimated score.',
    };
  }

  // Persist the score
  await prisma.job.update({
    where: { id: jobId },
    data: { matchScore: analysis.score },
  });

  return analysis;
}

/**
 * Fire-and-forget scoring — safe to call from job creation without awaiting.
 */
export function scheduleMatchScore(jobId: string, candidateId: string): void {
  scoreJobMatch(jobId, candidateId).catch(() => {
    // Silently ignore — score can be triggered manually from UI
  });
}
