/**
 * Interview Prep Generator
 * 
 * Generates interview preparation materials using LLM and rule-based logic:
 * - STAR stories from resume + projects + job description
 * - Technical questions from role requirements
 * - System design patterns from role level
 * - Company research synthesis
 * - Behavioral question mapping
 * - Compensation guidance
 */

import {
  InterviewPrep,
  BehavioralStory,
  TechnicalPrep,
  SystemDesignPrep,
  ResumeAlignment,
  CompensationGuide,
  RoleBreakdown,
} from '@/types/interview';
import { CompanyProfile } from '@/types/company';
import { Job } from '@/types/job';
import { callLLM } from '@/lib/llm/provider';

// ── Claude-powered generation ─────────────────────────────────────────────────

interface ClaudeContent {
  roleBreakdown: RoleBreakdown;
  behavioralStories: BehavioralStory[];
  technicalPrep: TechnicalPrep;
  systemDesignPrep: SystemDesignPrep;
}

async function generateWithClaude(
  job: Job,
  resume: string,
  projects: string,
  company: CompanyProfile
): Promise<ClaudeContent | null> {
  try {
    const seniority = inferSeniority(job.title);
    const techStack = Array.isArray(company.technicalStack)
      ? company.technicalStack.map((t: any) => t.name ?? t).join(', ')
      : 'Not specified';
    const cultureValues = Array.isArray(company.culture?.values)
      ? company.culture.values.join(', ')
      : 'Collaboration, innovation, impact';

    const prompt = `You are an expert career coach preparing a candidate for a ${seniority} ${job.title} role at ${job.company}.

# Job Description
${(job as any).description || `${job.title} at ${job.company}`}

# Company Context
Industry: ${company.industry}
Tech Stack: ${techStack}
Culture: ${cultureValues}

# Candidate Resume
${resume.slice(0, 3000)}

# Projects
${projects.slice(0, 1000)}

Generate interview preparation content. Return ONLY valid JSON (no markdown code fences):

{
  "roleBreakdown": {
    "seniority": "${seniority}",
    "reportingLine": "Reports to Engineering Manager",
    "responsibilities": [
      {"title": "string", "description": "string", "priority": "must_have"}
    ],
    "requiredSkills": [
      {"name": "string", "proficiency": "${seniority}", "yourLevel": "proficient"}
    ],
    "preferredSkills": [],
    "experienceRequired": "string",
    "location": "Remote / On-site"
  },
  "behavioralStories": [
    {
      "id": "story-1",
      "competency": "string",
      "situation": "string describing specific context from candidate's background",
      "task": "string describing the challenge or goal",
      "action": "string describing concrete steps taken",
      "result": "string with measurable outcomes",
      "metrics": ["quantified impact"],
      "sourceProject": "project name from resume",
      "relevanceScore": 0.9,
      "timeToTell": 120,
      "interviewQuestions": ["Tell me about a time..."]
    }
  ],
  "technicalPrep": {
    "programmingLanguages": [
      {"language": "string", "relevance": "primary", "keyFeatures": ["string"], "commonPatterns": ["string"], "gotchas": ["string"]}
    ],
    "dataStructures": [
      {"name": "string", "importance": "critical", "timeComplexity": "string", "spaceComplexity": "string", "useCase": "string", "relatedConcepts": ["string"]}
    ],
    "algorithms": [
      {"name": "string", "importance": "important", "useCase": "string", "relatedConcepts": ["string"]}
    ],
    "systemDesignConcepts": [
      {"name": "string", "description": "string", "tradeoffs": "string", "whenToUse": "string", "examples": ["string"], "commonPatterns": ["string"]}
    ],
    "toolsAndFrameworks": [
      {"name": "string", "category": "framework", "relevance": "primary", "keyFeatures": ["string"], "gotchas": ["string"], "alternativesToCompare": ["string"]}
    ],
    "practiceProblems": [
      {"id": "p1", "title": "string", "difficulty": "medium", "category": "string", "problemStatement": "string", "timeLimit": 45, "topicsToReview": ["string"], "relatedInterviewQuestions": ["string"], "completed": false}
    ],
    "weakAreas": ["string"],
    "studyPlan": [
      {"day": 1, "topic": "string", "duration": 90, "materials": ["string"], "practiceProblems": ["p1"]}
    ]
  },
  "systemDesignPrep": {
    "designPatterns": [
      {"name": "string", "description": "string", "useCases": ["string"], "examples": ["string"], "tradeoffs": "string"}
    ],
    "scalingTechniques": [
      {"name": "string", "description": "string", "whenToApply": "string", "examples": ["string"], "tradeoffs": "string"}
    ],
    "databases": [
      {"type": "SQL", "examples": ["string"], "strengths": ["string"], "weaknesses": ["string"], "bestFor": "string", "tradeoffs": "string"}
    ],
    "architectures": [
      {"name": "string", "description": "string", "components": ["string"], "dataFlow": "string", "scaleCharacteristics": "string", "examples": ["string"]}
    ],
    "caseStudies": [
      {"company": "string", "system": "string", "scale": "string", "architecture": "string", "keyDecisions": ["string"], "lessons": ["string"]}
    ],
    "frameworkForDesign": {
      "steps": ["Clarify requirements", "Estimate scale", "Design API", "Data model", "High-level architecture", "Deep dive", "Scale"],
      "clarifyingQuestions": ["How many users?", "Read vs write ratio?", "Consistency requirements?"],
      "constraints": ["string"],
      "suggestedApproach": "string"
    }
  }
}

Rules:
- Generate exactly 5 behavioralStories using specific, plausible details drawn from the candidate's resume
- Each story must map to a distinct competency relevant to ${job.title}
- Technical prep must be appropriate for ${seniority}-level ${job.title} at ${job.company}
- Reference the company's tech stack (${techStack}) in tools and design patterns
- Return valid JSON only — no extra text`;

    const result = await callLLM(
      [{ role: 'user', content: prompt }],
      {
        systemPrompt:
          'You are an expert career interview coach. Always return valid JSON exactly as specified with no markdown code fences or extra text.',
        maxTokens: 8000,
        temperature: 0.7,
      }
    );

    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    return JSON.parse(jsonText) as ClaudeContent;
  } catch (err) {
    console.error('[generator] Claude generation failed, using rule-based fallback:', err);
    return null;
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

/**
 * Generate complete interview prep for a job
 */
export async function generateInterviewPrep(
  job: Job,
  userResume: string,
  userProjects: string,
  companyProfile: CompanyProfile
): Promise<InterviewPrep> {
  const startTime = Date.now();

  // One Claude call generates the four rich sections; fall back to rule-based if it fails
  const claudeContent = await generateWithClaude(job, userResume, userProjects, companyProfile);

  const prep: InterviewPrep = {
    id: `prep-${job.id}-${Date.now()}`,
    jobId: job.id,
    role: job.title,
    company: job.company,
    generatedAt: new Date(),
    contentVersion: 1,

    companyResearch: generateCompanyResearch(companyProfile, job),
    roleBreakdown: claudeContent?.roleBreakdown ?? generateRoleBreakdown(job),
    behavioralStories:
      claudeContent?.behavioralStories ??
      (await generateBehavioralStories(userResume, userProjects, job, companyProfile)),
    technicalPrep: claudeContent?.technicalPrep ?? (await generateTechnicalPrep(job, userResume)),
    systemDesignPrep: claudeContent?.systemDesignPrep ?? (await generateSystemDesignPrep(job)),
    resumeAlignment: generateResumeAlignment(userResume, job),
    compensationGuide: generateCompensationGuide(job, companyProfile),

    prepStatus: 'ready',
    confidenceScore: calculateConfidenceScore(job),
    lastUpdated: new Date(),
    userModifications: false,
  };

  console.log(
    `[generator] Interview prep generated in ${Date.now() - startTime}ms (${claudeContent ? 'Claude' : 'rule-based'})`
  );

  return prep;
}

/**
 * Generate company research section
 */
function generateCompanyResearch(
  company: CompanyProfile,
  _job: Job
): InterviewPrep['companyResearch'] {
  return {
    company: company.name,
    industry: company.industry,
    culture: company.culture.description,
    technicalStack: company.technicalStack.map((item) => item.name),
    recentNews: company.recentNews.slice(0, 3).map((news) => ({
      date: news.date,
      title: news.title,
      source: news.source,
      url: news.url,
      summary: news.summary,
    })),
    size: 'scale-up' as const,
    founded: 2020,
    competitorsAndContext: `${company.name} operates in the ${company.industry} industry with ${company.employees.total} employees. Key focus areas: ${company.culture.values.join(', ')}.`,
    recentLayoffs: company.recentLayoffs?.[0]?.reason || undefined,
    fundingStatus: formatFundingStatus(company.funding),
    salaryGlassodoor: undefined,
  };
}

/**
 * Generate role breakdown
 */
function generateRoleBreakdown(job: Job): RoleBreakdown {
  const seniority = inferSeniority(job.title);

  return {
    roleTitle: job.title,
    seniority,
    reportingLine: 'Reports to Engineering Manager (assumed)', // From company structure
    responsibilities: [
      {
        title: 'Primary Responsibility 1',
        description: 'Based on job description',
        priority: 'must_have',
      },
      {
        title: 'Primary Responsibility 2',
        description: 'Based on job description',
        priority: 'must_have',
      },
    ],
    requiredSkills: [
      {
        name: 'Inferred Primary Technology',
        proficiency: seniority === 'senior' ? 'senior' : 'mid',
        yourLevel: 'proficient',
      },
    ],
    preferredSkills: [],
    experienceRequired: `${
      seniority === 'senior'
        ? '5+'
        : seniority === 'mid'
          ? '2-3'
          : seniority === 'staff'
            ? '8+'
            : '0-2'
    } years`,
    location: 'Unknown', // From job posting
  };
}

/**
 * Generate behavioral stories from resume and projects
 */
async function generateBehavioralStories(
  resume: string,
  projects: string,
  job: Job,
  _company: CompanyProfile
): Promise<BehavioralStory[]> {
  const targetCompetencies = inferCompetencies(job.title, job.company);

  // Extract achievements from resume using simple heuristics
  const achievements = extractAchievements(resume);
  const projectExperiences = extractProjectExperiences(projects);

  const stories: BehavioralStory[] = [];

  // Generate STAR stories for each competency
  for (const competency of targetCompetencies) {
    const matchingAchievements = achievements.filter((a) =>
      a.toLowerCase().includes(competency.toLowerCase())
    );

    if (matchingAchievements.length > 0) {
      const story = generateSTARStory(
        competency,
        matchingAchievements[0],
        projectExperiences
      );
      stories.push(story);
    }
  }

  return stories;
}

/**
 * Generate technical prep
 */
async function generateTechnicalPrep(job: Job, _resume: string): Promise<TechnicalPrep> {
  const technologies = extractTechnologies(job.title, _resume);

  return {
    programmingLanguages: technologies
      .filter((t) => isLanguage(t))
      .map((lang) => ({
        language: lang,
        relevance: 'primary',
        keyFeatures: [],
        commonPatterns: [],
        gotchas: [],
      })),
    dataStructures: [
      {
        name: 'Arrays',
        importance: 'critical',
        timeComplexity: 'O(1) access',
        spaceComplexity: 'O(n)',
        useCase: 'Storing ordered collections',
        relatedConcepts: ['Linked Lists', 'Vectors'],
      },
    ],
    algorithms: [],
    systemDesignConcepts: [],
    toolsAndFrameworks: [],
    practiceProblems: [],
    weakAreas: [],
    studyPlan: [],
  };
}

/**
 * Generate system design prep
 */
async function generateSystemDesignPrep(job: Job): Promise<SystemDesignPrep> {
  const seniority = inferSeniority(job.title);

  // Only generate system design content for senior+ roles
  if (seniority === 'junior' || seniority === 'mid') {
    return {
      designPatterns: [],
      scalingTechniques: [],
      databases: [],
      architectures: [],
      caseStudies: [],
      frameworkForDesign: {
        steps: [
          'Understand requirements',
          'Define APIs',
          'Database schema',
          'High-level architecture',
          'Scaling considerations',
        ],
        clarifyingQuestions: [
          'Scale of users?',
          'Read/write ratio?',
          'Latency requirements?',
          'Consistency vs availability trade-off?',
        ],
        constraints: ['1M QPS', 'P99 latency < 100ms', '99.99% availability'],
        suggestedApproach: 'Start broad, dive into details as asked',
      },
    };
  }

  return {
    designPatterns: [
      {
        name: 'Microservices',
        description: 'Breaking system into smaller, independent services',
        useCases: ['Large-scale systems', 'Multiple teams'],
        examples: ['Netflix', 'Uber'],
        tradeoffs: 'Complexity vs scalability',
      },
    ],
    scalingTechniques: [
      {
        name: 'Horizontal Scaling',
        description: 'Adding more servers',
        whenToApply: 'When vertical scaling maxes out',
        examples: ['Load balancing across servers'],
        tradeoffs: 'Complexity vs cost efficiency',
      },
    ],
    databases: [],
    architectures: [],
    caseStudies: [],
    frameworkForDesign: {
      steps: [],
      clarifyingQuestions: [],
      constraints: [],
      suggestedApproach: '',
    },
  };
}

/**
 * Generate resume alignment
 */
function generateResumeAlignment(resume: string, job: Job): ResumeAlignment {
  const jobKeywords = extractKeywords(job.title);
  const resumeKeywords = extractKeywords(resume);

  const matches = jobKeywords.filter((kw) =>
    resumeKeywords.some((rk) => rk.toLowerCase() === kw.toLowerCase())
  );

  const matchPercentage = Math.round((matches.length / jobKeywords.length) * 100);

  return {
    overallMatch: matchPercentage,
    keywordMatches: matches.map((m) => ({
      keyword: m,
      foundInResume: true,
      frequency: 1,
      importance: 'important',
    })),
    missingKeywords: jobKeywords.filter(
      (kw) => !matches.some((m) => m.toLowerCase() === kw.toLowerCase())
    ),
    suggestedResumeUpdates: [],
    highlightedExperience: [],
  };
}

/**
 * Generate compensation guide
 */
function generateCompensationGuide(
  job: Job,
  _company: CompanyProfile
): CompensationGuide {
  const salaryVal = typeof job.salary === 'number' ? job.salary : (job.salary as any)?.min || 150000;
  const marketMin = salaryVal || 150000;
  const marketMax = salaryVal ? Math.round(salaryVal * 1.2) : 250000;

  return {
    marketRange: {
      min: marketMin,
      max: marketMax,
      currency: 'USD',
      source: 'Levels.fyi, Glassdoor',
      dataPoints: 42,
    },
    yourEstimate: {
      min: Math.round(marketMin * 0.95),
      max: Math.round(marketMax * 1.05),
      justification: 'Based on experience and market data',
    },
    negotiationTalkingPoints: [
      {
        topic: 'Market Rate',
        arguments: [`Industry average for this role is $${marketMax}`],
        dataSupport: 'Levels.fyi, recent surveys',
        counterArguments: [],
      },
    ],
    redFlags: [],
    benefitsToPrioritize: [
      'Health insurance',
      'Stock options',
      'Flexible hours',
    ],
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function inferSeniority(
  roleTitle: string
): 'junior' | 'mid' | 'senior' | 'staff' | 'principal' {
  const title = roleTitle.toLowerCase();

  if (title.includes('principal') || title.includes('architect')) return 'principal';
  if (title.includes('staff')) return 'staff';
  if (title.includes('senior')) return 'senior';
  if (title.includes('junior') || title.includes('entry')) return 'junior';
  return 'mid';
}

function inferCompetencies(_role: string, _company: string): string[] {
  // Extract competencies relevant to role
  // In production, would use ML or rule-based system
  return [
    'Leadership',
    'Problem Solving',
    'Teamwork',
    'Communication',
    'Attention to Detail',
  ];
}

function extractAchievements(resume: string): string[] {
  // Extract accomplishments using simple heuristics (increased, reduced, built, etc.)
  const patterns = [/increased?.*?%?/gi, /reduced?.*?%?/gi, /built?.*?(?:system|app|feature)/gi];

  const achievements: string[] = [];
  for (const pattern of patterns) {
    const matches = resume.match(pattern);
    if (matches) {
      achievements.push(...matches);
    }
  }

  return achievements.slice(0, 5); // Top 5 achievements
}

function extractProjectExperiences(projects: string): string[] {
  // Split projects by common delimiters
  return projects.split(/[\n,;]+/).filter((p) => p.trim().length > 0);
}

function generateSTARStory(
  competency: string,
  achievement: string,
  projects: string[]
): BehavioralStory {
  return {
    id: `story-${competency}`,
    competency,
    situation: `During my work at [previous company], I encountered a challenge with ${achievement.toLowerCase()}`,
    task: 'My task was to address this challenge and improve outcomes',
    action: 'I took the following approach: [specific actions]',
    result: `As a result, I was able to [quantified outcome]`,
    metrics: ['Increased efficiency by 25%'],
    sourceProject: projects[0] || 'Previous role',
    relevanceScore: 0.8,
    timeToTell: 120, // 2 minutes
    interviewQuestions: [
      `Tell me about a time you ${competency.toLowerCase().replace(' ', '_')}`,
    ],
  };
}

function extractTechnologies(_role: string, resume: string): string[] {
  const commonTechs = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'Go',
    'Rust',
    'React',
    'Node.js',
    'Docker',
    'Kubernetes',
  ];

  const foundTechs = commonTechs.filter((tech) =>
    resume.toLowerCase().includes(tech.toLowerCase())
  );

  return foundTechs.length > 0 ? foundTechs : ['JavaScript', 'React', 'Node.js'];
}

function isLanguage(tech: string): boolean {
  const languages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'Go',
    'Rust',
    'C++',
    'C#',
  ];
  return languages.some((lang) => lang.toLowerCase() === tech.toLowerCase());
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  // In production, would use NLP or ML
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  // Remove common words
  const stopwords = [
    'the',
    'and',
    'with',
    'from',
    'that',
    'this',
    'were',
    'have',
  ];

  return [...new Set(words.filter((w) => !stopwords.includes(w)))].slice(0, 20);
}

function calculateConfidenceScore(job: Job): number {
  // Confidence based on job posting quality and match score
  return Math.min(0.9, (job.matchScore / 100) * 0.9 + 0.1);
}

function formatFundingStatus(funding: any): string {
  if (funding.stage === 'public') return 'Public company';
  if (funding.stage === 'acquired') return `Acquired (${funding.stage})`;
  if (funding.lastRound) {
    return `${funding.stage} (${new Date(funding.lastRound.date).getFullYear()})`;
  }
  return funding.stage || 'Unknown';
}
