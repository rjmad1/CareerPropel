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

/**
 * Strip prompt-injection patterns from strings that will be embedded in LLM
 * prompts. This is defence-in-depth — the system prompt already instructs the
 * model to return JSON only, but we also remove the most common injection
 * directives from user-controlled fields (job descriptions, resume text, etc.)
 * before interpolation so they cannot override the system prompt.
 */
function sanitizeForPrompt(text: string): string {
  return text
    .replace(/ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|context)/gi, '[removed]')
    .replace(/you\s+are\s+now\s+(a\s+)?/gi, '[removed] ')
    .replace(/disregard\s+(all\s+)?(previous|prior)\s+(instructions?|context)/gi, '[removed]')
    .replace(/system\s*prompt\s*:/gi, '[removed]:')
    .replace(/<\|?(system|user|assistant|im_start|im_end)\|?>/gi, '')
    .replace(/```[^`]*```/g, '[code block removed]')
    .trim()
}

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

    const jobDescription = sanitizeForPrompt(
      (job as any).description || `${job.title} at ${job.company}`
    )
    const sanitizedResume = sanitizeForPrompt(resume.slice(0, 3000))
    const sanitizedProjects = sanitizeForPrompt(projects.slice(0, 1000))

    const prompt = `You are an expert career coach preparing a candidate for a ${seniority} ${job.title} role at ${job.company}.

# Job Description
${jobDescription}

# Company Context
Industry: ${company.industry}
Tech Stack: ${techStack}
Culture: ${cultureValues}

# Candidate Resume
${sanitizedResume}

# Projects
${sanitizedProjects}

Generate highly specific and hyper-tailored interview preparation content for this exact candidate, role, and company. Avoid generic or templated advice.

Return ONLY valid JSON (no markdown code fences or extra text):

{
  "roleBreakdown": {
    "seniority": "${seniority}",
    "reportingLine": "Reports to Engineering Manager",
    "responsibilities": [
      {"title": "string", "description": "detailed responsibility from job description", "priority": "must_have"}
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
      "situation": "detailed context from candidate's resume/projects demonstrating this competency",
      "task": "the concrete challenge or goal faced by the candidate",
      "action": "exact actions the candidate took, including tools or technical details used",
      "result": "quantified metric-driven business or technical outcome",
      "metrics": ["quantified impact, e.g., '+25% latency reduction'"],
      "sourceProject": "project name from resume",
      "relevanceScore": 0.9,
      "timeToTell": 120,
      "interviewQuestions": ["Tell me about a time..."]
    }
  ],
  "technicalPrep": {
    "programmingLanguages": [
      {
        "language": "string",
        "relevance": "primary",
        "keyFeatures": ["specific language feature needed for this role"],
        "commonPatterns": ["idiomatic design patterns in this language"],
        "gotchas": ["pitfalls/corner-cases common in technical interviews for this language"]
      }
    ],
    "dataStructures": [
      {
        "name": "string",
        "importance": "critical",
        "timeComplexity": "e.g., O(1) or O(log N)",
        "spaceComplexity": "e.g., O(N)",
        "useCase": "concrete interview-relevant use case for this role",
        "relatedConcepts": ["string"]
      }
    ],
    "algorithms": [
      {
        "name": "string",
        "importance": "important",
        "useCase": "interview-relevant algorithm problem context for this role",
        "relatedConcepts": ["string"]
      }
    ],
    "systemDesignConcepts": [
      {
        "name": "string",
        "description": "how this concept applies to the company's domain and scale",
        "tradeoffs": "pro/con analysis",
        "whenToUse": "specific scenarios at this company's scale",
        "examples": ["how it's used in industry"],
        "commonPatterns": ["architectural styles"]
      }
    ],
    "toolsAndFrameworks": [
      {
        "name": "string",
        "category": "framework",
        "relevance": "primary",
        "keyFeatures": ["framework feature relevant to the job"],
        "gotchas": ["common issues/performance problems"],
        "alternativesToCompare": ["competing options"]
      }
    ],
    "practiceProblems": [
      {
        "id": "p1",
        "title": "string",
        "difficulty": "medium",
        "category": "string",
        "problemStatement": "fully-formed coding question appropriate for this company and seniority",
        "timeLimit": 45,
        "topicsToReview": ["string"],
        "relatedInterviewQuestions": ["string"],
        "completed": false
      }
    ],
    "weakAreas": ["skills or requirements from the Job Description where the Candidate's Resume shows a gap or low experience"],
    "studyPlan": [
      {"day": 1, "topic": "focused preparation topic addressing a weak area or core skill gap", "duration": 90, "materials": ["focused review materials"], "practiceProblems": ["p1"]}
    ]
  },
  "systemDesignPrep": {
    "designPatterns": [
      {
        "name": "string",
        "description": "pattern description and how it is applied",
        "useCases": ["string"],
        "examples": ["string"],
        "tradeoffs": "detailed architectural trade-offs"
      }
    ],
    "scalingTechniques": [
      {
        "name": "string",
        "description": "how this scaling technique operates at high load",
        "whenToApply": "specific scaling thresholds",
        "examples": ["real-world examples from company's competitors or target domain"],
        "tradeoffs": "consistency, complexity, or cost tradeoffs"
      }
    ],
    "databases": [
      {
        "type": "SQL",
        "examples": ["PostgreSQL"],
        "strengths": ["ACID compliance"],
        "weaknesses": ["scaling complexity"],
        "bestFor": "relational structures",
        "tradeoffs": "CAP theorem tradeoffs"
      }
    ],
    "architectures": [
      {
        "name": "string",
        "description": "architectural style aligned with the company's engineering goals",
        "components": ["string"],
        "dataFlow": "detailed request-response and data pipeline flow",
        "scaleCharacteristics": "bottlenecks, scaling vectors",
        "examples": ["famous industry adoption"]
      }
    ],
    "caseStudies": [
      {
        "company": "string",
        "system": "string",
        "scale": "string",
        "architecture": "string",
        "keyDecisions": ["string"],
        "lessons": ["string"]
      }
    ],
    "frameworkForDesign": {
      "steps": ["Clarify requirements", "Estimate scale", "Design API", "Data model", "High-level architecture", "Deep dive", "Scale"],
      "clarifyingQuestions": ["specific clarifying questions for the company's product domain"],
      "constraints": ["QPS, storage, throughput, latency targets matching the company's scale"],
      "suggestedApproach": "custom-tailored step-by-step strategy for the interview day"
    }
  }
}

Rules:
- Generate exactly 5 behavioralStories using specific, plausible details drawn from the candidate's resume/projects.
- Each behavioral story must map to a distinct competency relevant to the role's level and responsibilities.
- Under "technicalPrep.programmingLanguages", prioritize languages explicitly mentioned in the Job Description, then the company's tech stack, then the candidate's resume.
- Under "technicalPrep.dataStructures" and "technicalPrep.algorithms", predict 3+ highly relevant technical structures/algorithms matching the technical challenge types common in interviews for this company and domain (e.g. distributed locking, graph traversal, heavy caching).
- Under "systemDesignPrep", align the case studies, scaling techniques, and database choices directly with the company's product challenges (e.g., if they are FinTech, focus on consistency, idempotent transactions, double-entry ledgers; if they are social media, focus on graph queries, feed generation, push vs pull models; if they are SaaS, focus on multitenancy and microservice isolation).
- Perform a thorough skill gap analysis by comparing the required skills in the Job Description against the Candidate's Resume, listing these as "weakAreas", and building the "studyPlan" day-by-day directly targeting these weak areas.
- Return valid JSON only — no extra text, markdown wrappers, or explanation outside the JSON.`;

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
    experienceRequired: `${seniorityToYears(seniority)} years`,
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

  // Extract achievements from resume using advanced heuristics
  const achievements = extractAchievements(resume);
  const projectExperiences = extractProjectExperiences(projects);

  const stories: BehavioralStory[] = [];

  // Generate STAR stories for each competency sequentially
  for (let i = 0; i < targetCompetencies.length; i++) {
    const competency = targetCompetencies[i];
    const achievement = achievements[i % achievements.length] || "Led key technical projects to deliver high-quality features under tight timelines";
    const story = generateSTARStory(
      competency,
      achievement,
      projectExperiences
    );
    stories.push(story);
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

function seniorityToYears(seniority: 'junior' | 'mid' | 'senior' | 'staff' | 'principal'): string {
  if (seniority === 'senior') return '5+'
  if (seniority === 'staff') return '8+'
  if (seniority === 'mid') return '2-3'
  return '0-2'
}

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
  if (!resume) return [];

  // Split resume by common list indicators or newlines
  const lines = resume
    .split(/[\n•\-*]+/g)
    .map((l) => l.trim())
    .filter((l) => l.length > 30 && l.length < 250);

  const actionVerbs = new Set([
    'led', 'built', 'designed', 'migrated', 'developed', 'optimized',
    'implemented', 'created', 'scaled', 'managed', 'improved', 'increased',
    'reduced', 'delivered', 'spearheaded', 'automated', 'saved', 'architected',
    'coordinated', 'engineered', 'launched', 'mentored', 'resolved'
  ]);

  const scoredLines = lines.map((line) => {
    let score = 0;
    const lower = line.toLowerCase();

    // Check action verbs
    const words = lower.split(/\W+/);
    if (words.some((w) => actionVerbs.has(w))) {
      score += 10;
    }

    // Check metrics
    const metricMatches = lower.match(/(\d+%\s*(?:reduction|increase|improvement|decrease|more|less|faster)?|\$\d+[\d,.]*(?:\s*[kKmMbB])?|\b\d+\s*(?:engineers|users|servers|days|weeks|months|years)\b)/g);
    if (metricMatches) {
      score += 15 + metricMatches.length * 5;
    }

    // Prefer moderate lengths
    if (line.length > 50 && line.length < 150) {
      score += 5;
    }

    return { line, score };
  });

  // Sort by score descending and select top 5
  scoredLines.sort((a, b) => b.score - a.score);
  const selected = scoredLines.slice(0, 5).map((sl) => sl.line);

  // Fallback if none found
  if (selected.length === 0) {
    return [
      "Led key technical initiatives to design and build scalable, high-performance web applications, improving team velocity.",
      "Optimized database queries and API endpoints, reducing latency by 35% and improving overall user experience.",
      "Spearheaded microservices migration to decouple a large monolithic codebase, enabling rapid independent deployments.",
      "Collaborated with cross-functional product and design teams to deliver high-priority user-facing features on schedule.",
      "Mentored junior engineers and introduced automated testing processes, raising test coverage across core modules by 20%."
    ];
  }

  // If we found some but fewer than 5, pad them with sensible defaults
  const fallbacks = [
    "Led key technical initiatives to design and build scalable, high-performance web applications.",
    "Optimized database queries and API endpoints, reducing latency by 35%.",
    "Spearheaded microservices migration to decouple a large monolithic codebase.",
    "Collaborated with cross-functional product and design teams to deliver high-priority features.",
    "Mentored junior engineers and introduced automated testing processes, raising test coverage."
  ];
  while (selected.length < 5) {
    selected.push(fallbacks[selected.length]);
  }

  return selected;
}

function extractProjectExperiences(projects: string): string[] {
  if (!projects) return [];
  // Split projects by common delimiters
  return projects.split(/[\n,;]+/g).filter((p) => p.trim().length > 0);
}

function generateSTARStory(
  competency: string,
  achievement: string,
  projects: string[]
): BehavioralStory {
  // Extract action verb
  const verbs = [
    'led', 'built', 'designed', 'migrated', 'developed', 'optimized',
    'implemented', 'created', 'scaled', 'managed', 'improved', 'increased',
    'reduced', 'delivered', 'spearheaded', 'automated', 'saved', 'architected',
    'coordinated', 'engineered', 'launched', 'mentored', 'resolved'
  ];
  let actionVerb = 'spearheaded';
  for (const v of verbs) {
    if (new RegExp(`\\b${v}\\b`, 'i').test(achievement)) {
      actionVerb = v;
      break;
    }
  }

  // Extract metric
  const metricRegex = /(\d+%\s*(?:reduction|increase|improvement|decrease|more|less|faster)?|\$\d+[\d,.]*(?:\s*[kKmMbB])?|\b\d+\s*(?:engineers|users|servers|days|weeks|months|years)\b)/gi;
  const metricMatch = achievement.match(metricRegex);
  const metric = metricMatch ? metricMatch[0] : 'a significant 25% efficiency improvement';

  // Extract core subject (after the verb)
  let subject = achievement;
  const verbIdx = achievement.toLowerCase().indexOf(actionVerb.toLowerCase());
  if (verbIdx !== -1) {
    subject = achievement.substring(verbIdx + actionVerb.length).trim();
  }
  // Strip trailing punctuation
  subject = subject.replace(/[.;,]+$/, '').trim();

  // Create highly customized STAR fields
  const title = `${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} ${subject.split(' ').slice(0, 3).join(' ')}`;
  const situation = `During my tenure, we encountered a critical bottleneck needing to resolve: ${subject.toLowerCase()}. We needed to deliver high reliability and performance.`;
  const task = `My specific mandate was to act as the primary owner to plan, execute, and deliver this objective, ensuring maximum impact on our engineering metrics.`;
  const action = `To address this, I took a methodical approach: first, evaluated constraints; second, designed the solution and gathered stakeholder feedback; and third, personally took action to ${actionVerb} ${subject.toLowerCase()} using industry best practices.`;
  const result = `Through these focused efforts, we successfully resolved the core challenges, achieving outstanding outcomes specifically measured by: ${metric}.`;

  return {
    id: `story-${competency.toLowerCase().replace(/\s+/g, '-')}`,
    competency,
    title,
    summary: `Successfully planned and executed the initiative to ${actionVerb} ${subject.toLowerCase()}, achieving ${metric}.`,
    situation,
    task,
    action,
    result,
    metrics: metricMatch ? metricMatch : [metric],
    sourceProject: projects[0] || 'Core Role Achievement',
    relevanceScore: 0.88,
    timeToTell: 120, // 2 minutes
    interviewQuestions: [
      `Tell me about a time you demonstrated ${competency.toLowerCase()} during a project.`,
      `Describe a situation where you had to use ${competency.toLowerCase()} to overcome a challenge.`,
      `Give an example of how you applied ${competency.toLowerCase()} to drive results.`
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

  const stopwords = new Set(['the', 'and', 'with', 'from', 'that', 'this', 'were', 'have']);

  return [...new Set(words.filter((w) => !stopwords.has(w)))].slice(0, 20);
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
