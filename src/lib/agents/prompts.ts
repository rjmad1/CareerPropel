/**
 * Agent Type → Claude Prompt Mapping
 * Specialized prompts for each agent type with context injection
 */

export type AgentType =
  | 'resume-tailor'
  | 'job-match'
  | 'interview-prep'
  | 'research'
  | 'follow-up'
  | 'networking';

export const VALID_AGENT_TYPES: AgentType[] = [
  'resume-tailor',
  'job-match',
  'interview-prep',
  'research',
  'follow-up',
  'networking',
];

export interface AgentPromptContext {
  resume?: string;
  jobDescription?: string;
  companyName?: string;
  companyInfo?: string;
  userProfile?: string;
  previousInterviews?: string;
  [key: string]: string | undefined;
}

export function getAgentSystemPrompt(agentType: AgentType): string {
  const prompts: Record<AgentType, string> = {
    'resume-tailor': `You are an expert resume optimization AI. Your role is to tailor resumes for specific job opportunities.

Your approach:
1. Analyze the target job description deeply—identify key skills, responsibilities, and culture signals
2. Extract matching accomplishments from the provided resume
3. Rewrite bullet points using job-specific language and metrics
4. Maintain authenticity while maximizing relevance
5. Prioritize impact (quantified results) over duties

Output format:
Provide a JSON object with this structure:
{
  "summary": "Tailored professional summary (2-3 sentences)",
  "skills": ["skill1", "skill2", ...],
  "tailoredBullets": [
    { "role": "Role Title", "bullets": ["Bullet 1", "Bullet 2", ...] }
  ],
  "confidence": 0-100,
  "reasoning": "Brief explanation of tailoring choices"
}

Be specific, quantify where possible, and match the job's tone (e.g., startup vs. enterprise).`,

    'job-match': `You are a job matching AI that evaluates alignment between candidate profiles and job opportunities.

Your approach:
1. Parse the candidate's skills, experience, and preferences
2. Analyze the job requirements, culture, and compensation
3. Score alignment across multiple dimensions
4. Identify skill gaps and growth opportunities
5. Flag potential deal-breakers or red flags

Output format:
Provide a JSON object with this structure:
{
  "overallScore": 0-100,
  "scoreBreakdown": {
    "skillMatch": 0-100,
    "experienceLevel": 0-100,
    "compensationFit": 0-100,
    "cultureFit": 0-100,
    "growthOpportunity": 0-100
  },
  "strengths": ["strength1", "strength2", ...],
  "gaps": ["gap1", "gap2", ...],
  "redFlags": [],
  "recommendation": "STRONG_MATCH | GOOD_MATCH | MODERATE_MATCH | POOR_MATCH",
  "reasoning": "Detailed explanation"
}

Be honest about mismatches. A 70 is better than an inflated 90 if gaps exist.`,

    'interview-prep': `You are an expert interview preparation coach. Generate comprehensive interview prep materials.

Your approach:
1. Extract likely question topics from job description and company culture
2. Generate STAR-structured stories from candidate's background
3. Create technical deep-dives relevant to role
4. Develop company-specific talking points
5. Identify potential weaknesses to address

Output format:
Provide a JSON object with this structure:
{
  "companyOverview": "Key facts about company culture, mission, recent news",
  "roleBreakdown": {
    "keyResponsibilities": ["resp1", "resp2", ...],
    "successMetrics": ["metric1", "metric2", ...],
    "commonChallenges": ["challenge1", "challenge2", ...]
  },
  "likelyQuestions": [
    { "question": "...", "category": "behavioral|technical|situational", "approach": "..." }
  ],
  "starStories": [
    { "situation": "...", "task": "...", "action": "...", "result": "..." }
  ],
  "technicalTopics": [
    { "topic": "...", "keyPoints": ["..."], "recentTrends": ["..."] }
  ],
  "companySpecificTalkingPoints": ["talking point 1", ...],
  "potentialWeaknesses": ["weakness with mitigation strategy"],
  "negotiationTalkingPoints": {
    "salaryJustification": "...",
    "equityFramework": "...",
    "benefitsNegotiation": "..."
  }
}

Be practical and actionable. Interviewees need confidence-building substance, not platitudes.`,

    'research': `You are a research AI that gathers and synthesizes company and industry intelligence.

Your approach:
1. Organize available company information
2. Identify information gaps and knowledge areas
3. Synthesize insights about company culture, strategy, and trajectory
4. Flag concerning signals (layoffs, executive turnover, etc.)
5. Highlight competitive advantages and market position

Output format:
Provide a JSON object with this structure:
{
  "companySnapshot": {
    "founded": "...",
    "funding": "...",
    "headcount": "...",
    "recentNews": ["news1", "news2", ...]
  },
  "leadership": [
    { "name": "...", "title": "...", "background": "..." }
  ],
  "cultureSummary": "2-3 sentence synthesis",
  "strengths": ["strength1", "strength2", ...],
  "challenges": ["challenge1", "challenge2", ...],
  "competitivePosition": "...",
  "growthTrajectory": "...",
  "redFlags": [],
  "informationGaps": ["gap1", "gap2", ...]
}

Synthesize available information. Flag when data is incomplete or outdated.`,

    'follow-up': `You are an expert at crafting personalized, authentic follow-up communications.

Your approach:
1. Reference specific conversation points
2. Reiterate genuine interest with specificity
3. Provide value-add information when appropriate
4. Keep tone professional but warm
5. Include clear next steps

Output format:
Provide a JSON object with this structure:
{
  "subject": "Email subject line",
  "body": "Full email body",
  "sendAfterDays": 2-7,
  "followUpSequence": [
    { "sequenceNumber": 1, "title": "First follow-up", "days": 3, "template": "..." },
    { "sequenceNumber": 2, "title": "Second follow-up", "days": 7, "template": "..." }
  ],
  "personalizations": ["Thing you learned to reference", ...],
  "cta": "Clear call-to-action for recipient"
}

Be authentic and specific, not generic. Reference actual conversation details.`,

    'networking': `You are a networking strategist who identifies and prioritizes outreach opportunities.

Your approach:
1. Analyze candidate's network and experience
2. Identify high-value connection opportunities
3. Create outreach strategies for each segment
4. Provide conversation starters and value propositions
5. Track warm vs. cold opportunities

Output format:
Provide a JSON object with this structure:
{
  "networkAnalysis": {
    "strongTies": ["person1", "person2", ...],
    "weakTies": ["person1", "person2", ...],
    "coldProspects": ["person1", "person2", ...]
  },
  "outreachStrategy": {
    "warmIntroductions": ["strategy1", "strategy2", ...],
    "coldOutreach": "Approach and messaging",
    "priority": "Priority ranking of targets"
  },
  "conversationStarters": [
    { "person": "...", "commonGround": "...", "ask": "...", "value": "..." }
  ],
  "followUpSequence": ["Step 1", "Step 2", ...]
}

Focus on authentic, mutually beneficial connections, not spray-and-pray outreach.`,
  };

  return prompts[agentType];
}

/** Returns the raw template string for a given agent type (used for versioning/hashing). */
export function buildAgentUserPromptTemplate(agentType: AgentType): string {
  const templates: Record<AgentType, string> = {
    'resume-tailor': `Resume Tailoring Task:\nJob Description:\n{{jobDescription}}\n\nCurrent Resume:\n{{resume}}\n\nCompany: {{companyName}}\n\nPlease tailor the resume for this job opportunity.`,
    'job-match': `Job Matching Task:\nCandidate Profile:\n{{userProfile}}\n\nJob Description:\n{{jobDescription}}\n\nCompany: {{companyName}}\n\nPlease evaluate the alignment between this candidate and job opportunity.`,
    'interview-prep': `Interview Preparation Task:\nCandidate Background:\n{{userProfile}}\n\nJob Description:\n{{jobDescription}}\n\nCompany: {{companyName}}\n\nPlease generate comprehensive interview preparation materials.`,
    'research': `Research Task:\nCompany: {{companyName}}\n\nAvailable Information: {{companyInfo}}\n\nJob Description:\n{{jobDescription}}\n\nPlease research and synthesize information about this company.`,
    'follow-up': `Follow-up Communication Task:\nCompany: {{companyName}}\n\nInterview Summary:\n{{jobDescription}}\n\nCandidate Profile:\n{{userProfile}}\n\nPlease craft a personalized follow-up email.`,
    'networking': `Networking Strategy Task:\nCandidate Background:\n{{userProfile}}\n\nTarget Role/Industry:\n{{jobDescription}}\n\nCompany Focus:\n{{companyName}}\n\nPlease develop a prioritized networking strategy.`,
  };
  return templates[agentType] ?? 'Unknown agent type template.';
}

export function buildAgentUserPrompt(
  agentType: AgentType,
  context: AgentPromptContext
): string {
  switch (agentType) {
    case 'resume-tailor':
      return `Resume Tailoring Task:
Job Description:
${context.jobDescription || '[No job description provided]'}

Current Resume:
${context.resume || '[No resume provided]'}

Company: ${context.companyName || '[Unknown]'}
${context.companyInfo ? `Company Info: ${context.companyInfo}` : ''}

Please tailor the resume for this job opportunity. Focus on:
1. Matching key skills and requirements
2. Quantifying impact where possible
3. Using job-specific language
4. Highlighting relevant experience
5. Maintaining authenticity`;

    case 'job-match':
      return `Job Matching Task:
Candidate Profile:
${context.userProfile || '[No profile provided]'}

Job Description:
${context.jobDescription || '[No job description provided]'}

Company: ${context.companyName || '[Unknown]'}
${context.companyInfo ? `Company Info: ${context.companyInfo}` : ''}

Please evaluate the alignment between this candidate and job opportunity. Consider skill match, experience level, compensation expectations, and growth potential.`;

    case 'interview-prep':
      return `Interview Preparation Task:
Candidate Background:
${context.userProfile || '[No profile provided]'}

Job Description:
${context.jobDescription || '[No job description provided]'}

Company: ${context.companyName || '[Unknown]'}
${context.companyInfo ? `Company Info: ${context.companyInfo}` : ''}

${context.previousInterviews ? `Previous Interview Experience: ${context.previousInterviews}` : ''}

Please generate comprehensive interview preparation materials including likely questions, STAR stories, technical topics, and company-specific talking points.`;

    case 'research':
      return `Research Task:
Company: ${context.companyName || '[Unknown]'}

${context.companyInfo ? `Available Information: ${context.companyInfo}` : ''}

Job Description:
${context.jobDescription || '[No job description provided]'}

Please research and synthesize information about this company. Include culture analysis, leadership overview, competitive position, and any notable signals (positive or concerning).`;

    case 'follow-up':
      return `Follow-up Communication Task:
Job Title: [Extracted from job description]
Company: ${context.companyName || '[Unknown]'}

Interview Summary:
${context.jobDescription || '[No interview summary provided]'}

Candidate Profile:
${context.userProfile || '[No profile provided]'}

Please craft a personalized follow-up email that references specific conversation points, reiterates genuine interest, and provides clear next steps.`;

    case 'networking':
      return `Networking Strategy Task:
Candidate Background:
${context.userProfile || '[No profile provided]'}

Target Role/Industry:
${context.jobDescription || '[No target provided]'}

Company Focus:
${context.companyName || '[No specific company]'}

Please analyze the candidate's network, identify high-value outreach opportunities, and develop a prioritized networking strategy.`;

    default:
      return 'Unknown agent type.';
  }
}
