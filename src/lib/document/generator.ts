import { callLLM } from '@/lib/llm/provider';

export type DocumentType = 'resume' | 'cover_letter';
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'concise';

export interface GenerateDocumentInput {
  type: DocumentType;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  candidateName?: string;
  candidateEmail?: string;
  existingResumeSummary?: string;
  skills?: string[];
  achievements?: string[];
  yearsOfExperience?: number;
  tone?: CoverLetterTone;
  focusAreas?: string[];
}

export interface GeneratedDocument {
  title: string;
  content: string;
  wordCount: number;
  generatedAt: string;
}

export async function generateTailoredResume(
  input: GenerateDocumentInput
): Promise<GeneratedDocument> {
  const skillsText = input.skills?.length ? `Key Skills: ${input.skills.join(', ')}` : '';
  const achievementsText = input.achievements?.length
    ? `Notable Achievements:\n${input.achievements.map((a) => `- ${a}`).join('\n')}`
    : '';
  const jobContext = input.jobTitle
    ? `Target Role: ${input.jobTitle}${input.company ? ` at ${input.company}` : ''}`
    : 'General professional resume';
  const jdContext = input.jobDescription
    ? `\n\nJob Description to tailor for:\n${input.jobDescription.slice(0, 1500)}`
    : '';

  const prompt = `You are an expert resume writer. Generate a professional, ATS-optimised resume in clean Markdown format.

${jobContext}${jdContext}

Candidate Details:
- Name: ${input.candidateName || 'Professional'}
- Email: ${input.candidateEmail || '[email@example.com]'}
- Experience: ${input.yearsOfExperience ? `${input.yearsOfExperience} years` : 'Not specified'}
${skillsText ? `\n${skillsText}` : ''}
${achievementsText ? `\n${achievementsText}` : ''}
${input.existingResumeSummary ? `\nExisting Profile Summary:\n${input.existingResumeSummary}` : ''}
${input.focusAreas?.length ? `\nFocus Areas: ${input.focusAreas.join(', ')}` : ''}

Generate a complete, compelling resume with:
1. Professional Summary (3-4 sentences, keyword-rich)
2. Core Competencies (12-16 skills in a grid)
3. Professional Experience (2-3 roles with STAR-format bullets)
4. Education
5. Certifications (if relevant)

Make every bullet quantifiable. Use strong action verbs. Align language to the job description keywords where provided.
Output ONLY the resume in Markdown. No preamble or explanation.`;

  const result = await callLLM([{ role: 'user', content: prompt }], {
    maxTokens: 2048,
    temperature: 0.2,
    systemPrompt: 'You are an expert resume writer.',
  });

  const content = result.content;
  const title = input.jobTitle
    ? `Resume – ${input.jobTitle}${input.company ? ` at ${input.company}` : ''}`
    : `Professional Resume`;

  return {
    title,
    content,
    wordCount: content.split(/\s+/).length,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateCoverLetter(
  input: GenerateDocumentInput
): Promise<GeneratedDocument> {
  if (!input.jobTitle || !input.company) {
    throw new Error('Job title and company are required for cover letter generation');
  }

  const tone =
    input.tone === 'enthusiastic'
      ? 'warm, enthusiastic, and energetic'
      : input.tone === 'concise'
      ? 'concise, direct, and impactful — keep it under 250 words'
      : 'professional, confident, and compelling';

  const jdContext = input.jobDescription
    ? `\n\nJob Description:\n${input.jobDescription.slice(0, 1500)}`
    : '';

  const prompt = `You are an expert career coach and cover letter writer. Write a ${tone} cover letter.

Role: ${input.jobTitle} at ${input.company}${jdContext}

Candidate:
- Name: ${input.candidateName || 'Professional'}
- Experience: ${input.yearsOfExperience ? `${input.yearsOfExperience} years` : 'Not specified'}
${input.skills?.length ? `- Top Skills: ${input.skills.slice(0, 8).join(', ')}` : ''}
${input.achievements?.length ? `- Key Achievement: ${input.achievements[0]}` : ''}
${input.focusAreas?.length ? `- Focus Areas: ${input.focusAreas.join(', ')}` : ''}

Structure:
1. Opening hook that references the specific role (1 paragraph)
2. Why this company specifically — show research, not generic praise (1 paragraph)
3. Top 2 relevant achievements with metrics (1 paragraph)
4. Cultural fit / forward-looking close (1 paragraph)

Output ONLY the cover letter text in Markdown (starting with the date line). No preamble.`;

  const result = await callLLM([{ role: 'user', content: prompt }], {
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: 'You are an expert cover letter writer.',
  });

  const content = result.content;

  return {
    title: `Cover Letter – ${input.jobTitle} at ${input.company}`,
    content,
    wordCount: content.split(/\s+/).length,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateNegotiationScript(input: {
  currentOffer: number;
  targetSalary: number;
  jobTitle: string;
  company: string;
  yearsOfExperience?: number;
  competingOffer?: number;
  keyAchievements?: string[];
}): Promise<{ emailScript: string; talkingPoints: string[]; redLines: string[] }> {
  const gap = input.targetSalary - input.currentOffer;
  const gapPct = ((gap / input.currentOffer) * 100).toFixed(1);
  const competingOfferText = input.competingOffer
    ? `\nCompeting Offer: $${input.competingOffer.toLocaleString()}`
    : '';

  const prompt = `You are an expert salary negotiation coach. Generate a professional negotiation response.

Context:
- Role: ${input.jobTitle} at ${input.company}
- Current Offer: $${input.currentOffer.toLocaleString()}
- Target Salary: $${input.targetSalary.toLocaleString()} (${gapPct}% increase)
${input.yearsOfExperience ? `- Experience: ${input.yearsOfExperience} years` : ''}${competingOfferText}
${input.keyAchievements?.length ? `- Key Achievements:\n${input.keyAchievements.map((a) => `  - ${a}`).join('\n')}` : ''}

Respond with a JSON object with exactly these fields:
{
  "emailScript": "Professional email to send requesting reconsideration (3-4 paragraphs, specific and confident)",
  "talkingPoints": ["Array of 4-5 specific talking points for a phone negotiation"],
  "redLines": ["Array of 2-3 minimum requirements / deal-breakers to be clear about"]
}

The email should be warm but confident. Reference specific value. Never apologise for asking.
Output ONLY the JSON object.`;

  const result = await callLLM([{ role: 'user', content: prompt }], {
    maxTokens: 1500,
    temperature: 0.5,
    systemPrompt: 'You are an expert salary negotiation coach.',
  });

  const raw = result.content || '{}';

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return {
      emailScript: raw,
      talkingPoints: [],
      redLines: [],
    };
  }
}

export async function generateEmailTemplate(input: {
  type: 'thank_you' | 'follow_up' | 'counter_offer' | 'withdraw' | 'recruiter_reach_out';
  jobTitle?: string;
  company?: string;
  interviewerName?: string;
  candidateName?: string;
  daysSinceInterview?: number;
  offerAmount?: number;
  targetAmount?: number;
  reason?: string;
  context?: string;
}): Promise<{ subject: string; body: string }> {
  const typeDescriptions: Record<string, string> = {
    thank_you: 'post-interview thank-you note sent within 24 hours',
    follow_up: 'polite follow-up after no response for 5-7 days',
    counter_offer: 'professional counter-offer request email',
    withdraw: 'gracious withdrawal from the process',
    recruiter_reach_out: 'proactive outreach to a recruiter',
  };

  const prompt = `Write a ${typeDescriptions[input.type] || input.type} email for a job candidate.

Context:
- Type: ${input.type}
- Role: ${input.jobTitle || 'the position'} at ${input.company || 'the company'}
${input.interviewerName ? `- Interviewer: ${input.interviewerName}` : ''}
${input.candidateName ? `- Candidate: ${input.candidateName}` : ''}
${input.daysSinceInterview ? `- Days since interview: ${input.daysSinceInterview}` : ''}
${input.offerAmount ? `- Current offer: $${input.offerAmount.toLocaleString()}` : ''}
${input.targetAmount ? `- Target: $${input.targetAmount.toLocaleString()}` : ''}
${input.reason ? `- Additional context: ${input.reason}` : ''}
${input.context ? `- Extra notes: ${input.context}` : ''}

Respond with a JSON object:
{
  "subject": "Email subject line",
  "body": "Email body — professional, specific, under 200 words unless this is a counter offer"
}

Keep it human, not stiff. Output ONLY the JSON.`;

  const result = await callLLM([{ role: 'user', content: prompt }], {
    maxTokens: 800,
    temperature: 0.6,
    systemPrompt: 'You are an expert career communications assistant.',
  });

  const raw = result.content || '{}';

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return { subject: 'Re: Application', body: raw };
  }
}
