/**
 * Demo Seed Data Generators
 * All static data pools and generator functions used to produce realistic synthetic data.
 * No Lorem Ipsum — all content is domain-appropriate and realistic.
 */

import {
  demoEmail,
  demoMeta,
  demoPreferences,
  pick,
  pickN,
  randInt,
  daysAgo,
  daysAhead,
  seededRng,
  type CandidateArchetype,
  type JobStage,
} from './demo-data-registry';

// ─── Name Pools ───────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Aisha', 'Marcus', 'Priya', 'Diego', 'Yuki', 'Fatima', 'James', 'Sofia',
  'Wei', 'Amara', 'Liam', 'Zara', 'Carlos', 'Nadia', 'Ethan', 'Mei',
  'Jordan', 'Layla', 'Ryan', 'Ama', 'Tyler', 'Kavya', 'Noah', 'Ingrid',
  'Samuel', 'Leila', 'Oliver', 'Camille', 'Arjun', 'Hannah', 'Daniel',
  'Mia', 'Ravi', 'Chloe', 'Lucas', 'Nina', 'Kevin', 'Sara', 'Alex', 'Hina',
];

const LAST_NAMES = [
  'Johnson', 'Patel', 'Rodriguez', 'Kim', 'Nguyen', 'Williams', 'Al-Hassan',
  'Chen', 'Okafor', 'Müller', 'Sharma', 'Thompson', 'Nakamura', 'Singh',
  'Martinez', 'Larsson', 'Osei', 'Taylor', 'Ibrahim', 'Park', 'Anderson',
  'Kumar', 'Kowalski', 'Diallo', 'Wilson', 'Nkosi', 'Rivera', 'Johansson',
  'Bakr', 'Brown', 'Zhang', 'Davis', 'Yamamoto', 'Mensah', 'Clark',
];

// ─── Location Pools ───────────────────────────────────────────────────────────

const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
  'Atlanta, GA', 'Miami, FL', 'London, UK', 'Toronto, Canada',
  'Berlin, Germany', 'Singapore', 'Sydney, Australia', 'Amsterdam, Netherlands',
  'Remote — US', 'Remote — Global', 'Bangalore, India', 'Dublin, Ireland',
];

// ─── Tech & Skills Pools ──────────────────────────────────────────────────────

const SENIOR_SKILLS = [
  'Product Strategy', 'Roadmap Prioritization', 'Stakeholder Management',
  'P&L Ownership', 'OKR Frameworks', 'Enterprise SaaS', 'Go-to-Market',
  'AI/ML Product', 'Platform Architecture', 'Executive Communication',
  'Cross-functional Leadership', 'B2B Monetization', 'Developer Experience',
  'API Products', 'Data-Driven Decision Making', 'User Research',
];

const MID_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'System Design',
  'SQL', 'GraphQL', 'REST APIs', 'CI/CD', 'Docker', 'Kubernetes',
  'AWS', 'GCP', 'Agile', 'Technical Writing', 'Product Analytics',
  'A/B Testing', 'Feature Flags', 'Performance Optimization',
];

const ENTRY_SKILLS = [
  'JavaScript', 'HTML/CSS', 'React', 'Git', 'Figma', 'UX Research',
  'Wireframing', 'SQL Basics', 'Agile Basics', 'Communication',
  'Project Management', 'Data Analysis', 'Customer Empathy',
];

const RECRUITER_SKILLS = [
  'Talent Sourcing', 'Boolean Search', 'LinkedIn Recruiter',
  'Applicant Tracking Systems', 'Offer Negotiation', 'Candidate Experience',
  'Employer Branding', 'Diversity Hiring', 'Pipeline Management',
  'Compensation Analysis', 'Interview Coordination', 'Stakeholder Management',
];

// ─── Company & Industry Pools ─────────────────────────────────────────────────

export const COMPANIES = [
  { name: 'TechVault AI', industry: 'Artificial Intelligence', size: 'startup' },
  { name: 'Nexus Platforms', industry: 'Cloud Infrastructure', size: 'mid-size' },
  { name: 'Orbital Systems', industry: 'Enterprise Software', size: 'enterprise' },
  { name: 'DataBridge Analytics', industry: 'Data & Analytics', size: 'mid-size' },
  { name: 'Veritas Health Tech', industry: 'HealthTech', size: 'startup' },
  { name: 'Apex Financial', industry: 'FinTech', size: 'enterprise' },
  { name: 'CloudMesh Inc.', industry: 'DevOps & Cloud', size: 'mid-size' },
  { name: 'Meridian Commerce', industry: 'E-Commerce', size: 'enterprise' },
  { name: 'Polaris Security', industry: 'Cybersecurity', size: 'mid-size' },
  { name: 'ClearPath Logistics', industry: 'Supply Chain', size: 'startup' },
  { name: 'Luminary EdTech', industry: 'Education Technology', size: 'startup' },
  { name: 'GreenGrid Energy', industry: 'CleanTech', size: 'mid-size' },
  { name: 'Synapse Robotics', industry: 'Robotics & Automation', size: 'startup' },
  { name: 'Titan Payments', industry: 'Payment Processing', size: 'enterprise' },
  { name: 'OpenBridge OSS', industry: 'Open Source / Developer Tools', size: 'startup' },
  { name: 'Quantum Genomics', industry: 'Biotech', size: 'startup' },
  { name: 'Atlas HR Solutions', industry: 'HR Technology', size: 'mid-size' },
  { name: 'Sterling Capital Tech', industry: 'Capital Markets', size: 'enterprise' },
  { name: 'Horizon Automotive AI', industry: 'Automotive Tech', size: 'mid-size' },
  { name: 'Zenith Media Platform', industry: 'Media & Entertainment', size: 'enterprise' },
];

// ─── Job Title Pools ──────────────────────────────────────────────────────────

const SENIOR_JOB_TITLES = [
  'Director of Product Management',
  'Group Product Manager',
  'Senior Director of Product',
  'VP of Product Management',
  'Head of Product',
  'Chief Product Officer',
  'Director of Engineering',
  'VP of Engineering',
  'Principal Engineer',
  'Staff Software Engineer',
];

const MID_JOB_TITLES = [
  'Senior Software Engineer',
  'Product Manager',
  'Senior Product Manager',
  'Lead Software Engineer',
  'Data Engineer',
  'Senior Data Scientist',
  'Platform Engineer',
  'DevOps Engineer',
  'Full Stack Engineer',
  'Backend Engineer',
  'Frontend Engineer',
];

const ENTRY_JOB_TITLES = [
  'Software Engineer',
  'Junior Product Manager',
  'Associate Product Manager',
  'UX Designer',
  'Data Analyst',
  'QA Engineer',
  'Technical Writer',
  'Solutions Engineer',
  'Implementation Consultant',
];

// ─── Recruiter Names ──────────────────────────────────────────────────────────

const RECRUITER_NAMES = [
  'Jessica Tran', 'Marcus Webb', 'Priya Sharma', 'Daniel Kim', 'Laura Chen',
  'Sophie Nakamura', 'Kevin Patel', 'Rachel Torres', 'Anil Kapoor',
  'Dana Willis', 'Olivia Grant', 'Brandon Lee', 'Maya Patel', 'Chris Reynolds',
  'Fatima Al-Rashid', 'Jake Morrison', 'Nadia Volkov', 'Sam Okafor',
];

// ─── Job Description Templates ────────────────────────────────────────────────

const JOB_DESCRIPTION_TEMPLATES = [
  (title: string, company: string) =>
    `We are seeking an exceptional ${title} to join ${company} at a pivotal stage of growth. You will own the product vision, strategy, and execution for a high-impact product line, working closely with engineering, design, and go-to-market teams. This role requires deep customer empathy, a data-driven mindset, and the ability to translate complex problems into elegant product solutions.`,
  
  (title: string, company: string) =>
    `${company} is looking for a ${title} to lead our next generation of platform capabilities. You will define and execute a multi-year product roadmap, manage a team of talented product managers, and drive alignment across engineering organizations. The ideal candidate has a track record of shipping AI-powered products at scale and working in fast-paced, cross-functional environments.`,
  
  (title: string, company: string) =>
    `Join ${company} as a ${title} and help us build the future of enterprise software. You will own a product portfolio generating $50M+ ARR, define technical and business strategy, and partner with C-suite stakeholders. We are looking for someone who can bring both strategic vision and execution excellence to a high-growth product area.`,
  
  (title: string, company: string) =>
    `As ${title} at ${company}, you will be responsible for the end-to-end product lifecycle of our core platform. This includes customer discovery, roadmap definition, feature delivery, and post-launch iteration. You will work with a world-class engineering team and have the opportunity to shape a product used by millions of enterprise users worldwide.`,
];

const JOB_REQUIREMENTS = [
  '8+ years of product management experience with at least 3 years in a senior or group PM role',
  'Experience building and scaling B2B SaaS products from $0 to $100M+ ARR',
  'Strong analytical skills; comfort with SQL, product analytics, and A/B testing',
  'Proven ability to lead cross-functional teams of engineers, designers, and researchers',
  'Track record of shipping AI/ML-powered features in production at enterprise scale',
  'Experience with enterprise go-to-market, sales cycle, and customer success',
  'Excellent written and verbal communication; ability to present to executive audiences',
  'MBA or equivalent experience preferred; engineering background a strong plus',
  'Experience with platform and API product development',
  'Strong product sense with demonstrated customer empathy',
  'Ability to operate in ambiguity and drive clarity in complex organizations',
  'Experience defining and tracking product KPIs, OKRs, and business metrics',
];

// ─── Document Content Templates ───────────────────────────────────────────────

export function generateResumeContent(
  name: string,
  archetype: CandidateArchetype,
  location: string
): Record<string, unknown> {
  const headlines: Record<CandidateArchetype, string> = {
    job_seeker_senior: 'Senior Product Leader | Enterprise SaaS | AI Products',
    job_seeker_mid: 'Senior Software Engineer | Full Stack | Cloud-Native',
    job_seeker_entry: 'UX Designer & Junior PM | User-Centric Product Thinking',
    recruiter: 'Technical Recruiter | Engineering & Product Talent | Global Hiring',
    hiring_manager: 'Engineering Leader | Platform & Infrastructure | Scale',
    coordinator: 'Interview Coordinator | Talent Operations | Candidate Experience',
  };

  return {
    headline: headlines[archetype],
    name,
    location,
    summary: `Experienced professional based in ${location} with a passion for building products that matter. Strong cross-functional collaborator with a track record of delivering results in fast-paced environments.`,
    experience: [
      {
        company: pick(COMPANIES, seededRng(name.length)).name,
        title: pick(archetype === 'job_seeker_senior' ? SENIOR_JOB_TITLES : MID_JOB_TITLES, seededRng(name.charCodeAt(0))),
        start: '2020-06',
        end: null,
        current: true,
      },
      {
        company: pick(COMPANIES, seededRng(name.length + 1)).name,
        title: pick(MID_JOB_TITLES, seededRng(name.charCodeAt(1) || 65)),
        start: '2017-03',
        end: '2020-05',
        current: false,
      },
    ],
    education: [
      {
        degree: pick(['B.S. Computer Science', 'M.S. Software Engineering', 'MBA, Strategy', 'B.A. Economics', 'B.S. Industrial Engineering'], seededRng(name.length * 3)),
        institution: pick(['Stanford University', 'MIT', 'UC Berkeley', 'Carnegie Mellon', 'UT Austin', 'University of Michigan', 'Georgia Tech', 'Northwestern'], seededRng(name.length * 7)),
        year: randInt(2010, 2020, seededRng(name.charCodeAt(0) * 2)),
      },
    ],
    ...demoMeta({ contentType: 'resume' }),
  };
}

// ─── Cover Letter Templates ────────────────────────────────────────────────────

export function generateCoverLetterContent(
  candidateName: string,
  jobTitle: string,
  company: string
): string {
  return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${jobTitle} role at ${company}. Having followed ${company}'s trajectory closely, I am deeply impressed by the company's commitment to innovation and the caliber of the team you have assembled.

In my current role, I have consistently delivered results at the intersection of product strategy and engineering execution. My experience spans the full product lifecycle — from customer discovery and roadmap definition to cross-functional delivery and post-launch optimization.

I am particularly excited about this opportunity because it aligns with my strengths in building products at scale. I would welcome the chance to bring my skills in stakeholder alignment, data-driven roadmap prioritization, and enterprise product strategy to your team.

I look forward to discussing how I can contribute to ${company}'s mission.

Warm regards,
${candidateName}

[SYNTHETIC] This is an AI-generated demo cover letter for demonstration purposes.`;
}

// ─── Achievement Pools ────────────────────────────────────────────────────────

export const ACHIEVEMENT_TEMPLATES = [
  {
    title: 'Led product launch generating $40M ARR in first year',
    description: 'Defined 0→1 product vision, assembled cross-functional squad, and shipped a market-defining product to enterprise customers.',
    metrics: { arr: '$40M', timeline: '12 months', customers: 120 },
  },
  {
    title: 'Reduced customer churn by 28% via proactive health scoring',
    description: 'Built a customer health scoring engine that surfaced early churn signals to CSMs, reducing annual churn from 18% to 13%.',
    metrics: { churn_reduction: '28%', revenue_retained: '$12M ARR', timeline: '6 months' },
  },
  {
    title: 'Scaled platform to 5M daily active users',
    description: 'Led architecture and product decisions that enabled the platform to handle 50x traffic growth without degradation.',
    metrics: { dau: '5M', latency_improvement: '60%', uptime: '99.99%' },
  },
  {
    title: 'Delivered API ecosystem generating 200+ integrations',
    description: 'Built and launched a partner API platform enabling a rich third-party integration marketplace.',
    metrics: { integrations: '200+', partner_sourced_pipeline: '22%', timeline: '14 months' },
  },
  {
    title: 'Improved developer onboarding time by 70%',
    description: 'Redesigned the developer experience for the platform SDK, reducing time-to-first-successful-call from 4 hours to 45 minutes.',
    metrics: { onboarding_reduction: '70%', dev_satisfaction: '+31 NPS', sdk_installs: '50K+' },
  },
  {
    title: 'Hired and grown product team from 3 to 18 PMs',
    description: 'Built PM org from scratch, established career laddering, competency frameworks, and PM excellence programs.',
    metrics: { team_growth: '3 → 18', retention: '94%', internal_promotions: 5 },
  },
  {
    title: 'Launched AI-powered feature with 55% enterprise adoption in 90 days',
    description: 'Owned product strategy for an LLM-powered AI assistant embedded in the core product workflow.',
    metrics: { adoption: '55%', dau_lift: '+38%', nps_improvement: '+22 points' },
  },
  {
    title: 'Consolidated 3 legacy products saving $22M annually',
    description: 'Led multi-year platform consolidation across 3 overlapping products, aligning 4 engineering orgs.',
    metrics: { annual_savings: '$22M', products_consolidated: 3, nps: '+15 points' },
  },
];

// ─── AI Summary Templates (InterviewPrep content) ─────────────────────────────

export function generateCompanyResearch(company: string): Record<string, unknown> {
  return {
    ...demoMeta({ contentType: 'company_research' }),
    overview: `${company} is a leading technology company with a strong focus on enterprise software and AI-powered solutions. The company has been growing rapidly, expanding its platform capabilities and customer base across multiple industries.`,
    recentNews: [
      `${company} announced a major product expansion into AI-native workflow automation`,
      `${company} reported strong Q4 results, beating analyst expectations by 12%`,
      `${company} opened new engineering hub in Austin, TX, adding 500 jobs`,
    ],
    culture: `${company} is known for its high-performance culture, engineering excellence, and customer obsession. The company values data-driven decision-making, rapid iteration, and cross-functional collaboration.`,
    interviewStyle: 'Structured behavioral interviews with STAR format, product sense exercises, and case studies focused on real customer problems.',
    keyMetrics: {
      employees: randInt(500, 50000, seededRng(company.length)),
      founded: randInt(2005, 2018, seededRng(company.length * 2)),
      funding: `$${randInt(50, 500, seededRng(company.length * 3))}M`,
    },
  };
}

export function generateTechnicalPrep(role: string): Record<string, unknown> {
  return {
    ...demoMeta({ contentType: 'technical_prep' }),
    coreTopics: [
      'System design fundamentals',
      'Distributed systems at scale',
      'API design and RESTful principles',
      'Data modeling and schema design',
      'Performance optimization strategies',
    ],
    practiceProblems: [
      `Design the data pipeline for ${role} analytics at 10M events/day`,
      'How would you architect a real-time notification system?',
      'Design a feature flag system for gradual rollouts',
    ],
    resources: [
      'System Design Interview by Alex Xu',
      'Designing Data-Intensive Applications',
      'AWS Architecture Center',
    ],
  };
}

// ─── Main Generator Functions ──────────────────────────────────────────────────

interface GeneratedCandidate {
  email: string;
  name: string;
  phone: string;
  location: string;
  summary: string;
  avatarUrl: string | null;
  passwordHash: string; // pre-hashed, injected at runtime
  emailVerified: boolean;
  preferences: Record<string, unknown>;
  archetype: CandidateArchetype;
}

/**
 * Generates a unique candidate profile for a given archetype and index.
 */
export function generateCandidate(
  archetype: CandidateArchetype,
  index: number,
  rng: () => number,
  passwordHash: string
): GeneratedCandidate {
  const firstName = pick(FIRST_NAMES, rng);
  const lastName = pick(LAST_NAMES, rng);
  const name = `${firstName} ${lastName}`;
  const slug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${archetype.replace(/_/g, '.')}.${index}`;
  const location = pick(LOCATIONS, rng);

  const summaries: Record<CandidateArchetype, string> = {
    job_seeker_senior: `Senior product and engineering leader with 12+ years of experience driving 0→1 products and scaling platforms to $100M+ ARR. Expert in enterprise SaaS, AI/ML products, and cross-functional team leadership. Seeking Director/VP-level opportunities at high-growth companies.`,
    job_seeker_mid: `Software engineer with 5+ years building scalable web applications and distributed systems. Experienced in full-stack development, cloud-native architectures, and agile product delivery. Passionate about developer experience and clean, maintainable code.`,
    job_seeker_entry: `Recent graduate with a foundation in computer science and UX design. Eager to join a collaborative team where I can grow my product and engineering skills while contributing to meaningful user experiences.`,
    recruiter: `Technical recruiter with 7 years of experience placing engineering and product talent at Fortune 500 companies and high-growth startups. Expertise in sourcing passive candidates, offer negotiation, and building diverse pipelines.`,
    hiring_manager: `Engineering leader with 10+ years building and scaling high-performance engineering teams. Deep expertise in platform infrastructure, distributed systems, and technical hiring. Passionate about engineering excellence and team development.`,
    coordinator: `Interview coordinator and talent operations specialist with 4 years of experience running high-volume interview programs. Skilled in candidate experience optimization, scheduling efficiency, and recruiting process design.`,
  };

  return {
    email: demoEmail(slug),
    name,
    phone: `+1 (${randInt(200, 999, rng)}) ${randInt(200, 999, rng)}-${randInt(1000, 9999, rng)}`,
    location,
    summary: summaries[archetype],
    avatarUrl: null,
    passwordHash,
    emailVerified: true,
    preferences: demoPreferences('system', true, {
      archetype,
      displayName: name,
      isDemo: true,
    }),
    archetype,
  };
}

/**
 * Generates skills for a candidate based on archetype.
 */
export function generateSkills(archetype: CandidateArchetype, rng: () => number): Array<{ name: string; proficiency: string }> {
  const pool =
    archetype === 'job_seeker_senior' || archetype === 'hiring_manager'
      ? SENIOR_SKILLS
      : archetype === 'job_seeker_mid'
      ? MID_SKILLS
      : archetype === 'recruiter' || archetype === 'coordinator'
      ? RECRUITER_SKILLS
      : ENTRY_SKILLS;

  const count = randInt(6, Math.min(15, pool.length), rng);
  const selected = pickN(pool, count, rng);
  const proficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];

  return selected.map((name, i) => ({
    name,
    proficiency:
      i < 3 ? 'expert' : i < 6 ? 'advanced' : pick(proficiencies, rng),
  }));
}

/**
 * Generates jobs for a candidate with varied stages and realistic attributes.
 */
export function generateJobsForCandidate(
  candidateId: string,
  archetype: CandidateArchetype,
  count: number,
  rng: () => number
): Array<Record<string, unknown>> {
  const stages: JobStage[] = [
    'sourced', 'interested', 'resume_tailoring', 'applied',
    'recruiter_screen', 'hiring_manager', 'technical_interview',
    'system_design', 'behavioral', 'final_round', 'offer',
    'negotiation', 'rejected', 'archived',
  ];

  const titlePool =
    archetype === 'job_seeker_senior' || archetype === 'hiring_manager'
      ? SENIOR_JOB_TITLES
      : archetype === 'job_seeker_entry'
      ? ENTRY_JOB_TITLES
      : MID_JOB_TITLES;

  const salaryBase =
    archetype === 'job_seeker_senior' || archetype === 'hiring_manager'
      ? 200000
      : archetype === 'job_seeker_mid'
      ? 120000
      : 80000;

  const jobs = [];
  const usedCompanyCombos = new Set<string>();

  for (let i = 0; i < count; i++) {
    let company;
    let title;
    let combo;
    let attempts = 0;

    do {
      company = pick(COMPANIES, rng);
      title = pick(titlePool, rng);
      combo = `${company.name}:${title}`;
      attempts++;
    } while (usedCompanyCombos.has(combo) && attempts < 20);

    usedCompanyCombos.add(combo);

    const stage = pick(stages, rng);
    const isApplied = !['sourced', 'interested', 'resume_tailoring'].includes(stage);
    const appliedDaysAgo = isApplied ? randInt(5, 120, rng) : null;
    const salary = salaryBase + randInt(-20000, 80000, rng);
    const priority = pick(['low', 'medium', 'high'], rng);
    const workMode = pick(['Remote', 'Hybrid', 'On-site'], rng);
    const recruiterName = pick(RECRUITER_NAMES, rng);
    const templateFn = pick(JOB_DESCRIPTION_TEMPLATES, rng);

    const requirementsCount = randInt(3, 6, rng);
    const requirements = pickN(JOB_REQUIREMENTS, requirementsCount, rng);

    jobs.push({
      candidateId,
      title,
      company: company.name,
      description: templateFn(title, company.name) + '\n\nRequirements:\n' + requirements.map((r) => `• ${r}`).join('\n'),
      url: `https://${company.name.toLowerCase().replace(/[^a-z]/g, '')}.com/careers/${title.toLowerCase().replace(/[^a-z]/g, '-')}`,
      location: `${pick(LOCATIONS, rng)} (${workMode})`,
      salary,
      matchScore: parseFloat((rng() * 0.4 + 0.6).toFixed(2)),
      priority,
      stage,
      appliedAt: appliedDaysAgo ? daysAgo(appliedDaysAgo) : null,
      recruiterName,
      recruiterEmail: `${recruiterName.toLowerCase().replace(' ', '.')}@${company.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      recruiterPhone: `+1 (${randInt(200, 999, rng)}) ${randInt(200, 999, rng)}-${randInt(1000, 9999, rng)}`,
      notes: generateJobNotes(stage, company.name, title, rng),
      tags: generateJobTags(company.industry, archetype, rng),
    });
  }

  return jobs;
}

function generateJobNotes(
  stage: string,
  company: string,
  title: string,
  rng: () => number
): string {
  const notesByStage: Record<string, string[]> = {
    sourced: [
      `Identified via LinkedIn. ${company} is growing their ${title} team. Strong culture fit signal.`,
      `Found on company careers page. Referral possible through former colleague.`,
      `Flagged from job alert. Requirements align well with current experience.`,
    ],
    interested: [
      `Researched ${company} deeply. Very excited about the product vision. Scheduling informational with recruiter.`,
      `Warm intro from alumni network. Reached out to ${company} recruiter directly.`,
    ],
    resume_tailoring: [
      `Tailoring resume to emphasize ${title} responsibilities. Aligning keywords with job description.`,
      `Customizing achievements to match ${company}'s evaluation criteria.`,
    ],
    applied: [
      `Application submitted via company portal. Recruiter outreach pending.`,
      `Applied with tailored resume and cover letter. Follow-up scheduled for next week.`,
    ],
    recruiter_screen: [
      `Recruiter screen completed. Good signal — advancing to HM loop. Compensation band confirmed.`,
      `Screen call went well. Recruiter confirmed team is growing and timeline is 3 weeks.`,
    ],
    hiring_manager: [
      `HM loop went extremely well. Strong fit confirmed on both sides. Expect technical panel invite soon.`,
      `Great conversation with hiring manager. They love the enterprise platform background.`,
    ],
    technical_interview: [
      `Technical round: system design question on distributed event processing. Solid performance.`,
      `Coding assessment completed. Architecture discussion with senior engineers went well.`,
    ],
    system_design: [
      `System design round: designed a real-time job recommendations pipeline. Panel was engaged.`,
      `Deep technical discussion on data modeling and API design. Strong feedback from panel.`,
    ],
    behavioral: [
      `Behavioral panel: STAR format. Leadership, conflict resolution, and product vision stories landed well.`,
      `Excellent behavioral round. Exec team was very engaged. Strong culture fit.`,
    ],
    final_round: [
      `Final round scheduled with VP and CPO. Preparing product vision presentation and executive-level STAR stories.`,
      `VP interview: presenting 90-day plan and product strategy vision. Feeling very prepared.`,
    ],
    offer: [
      `Verbal offer received: $${randInt(150, 400, rng)}K base + equity. Written offer expected this week.`,
      `Offer at top of band. Evaluating competing offers. Counter deadline: ${randInt(3, 10, rng)} days.`,
    ],
    negotiation: [
      `Negotiating: requesting $${randInt(10, 30, rng)}K higher base and accelerated equity vesting cliff.`,
      `Counter-offer submitted. Awaiting HR response. Strong leverage from competing offer.`,
    ],
    rejected: [
      `Rejected after ${pick(['recruiter screen', 'HM loop', 'technical interview', 'final round'], rng)}. Feedback: looking for more domain-specific experience.`,
      `Passed on role — withdrew after offer compensation did not meet expectations.`,
    ],
    archived: [
      `Role filled internally. Keeping ${company} relationship warm for future openings.`,
      `Decided to archive — role requirements changed significantly during process.`,
    ],
  };

  const notes = notesByStage[stage] || notesByStage['applied'];
  return pick(notes, rng);
}

function generateJobTags(industry: string, archetype: CandidateArchetype, rng: () => number): string[] {
  const baseTags = [industry.split(' ')[0]];
  const extraTags = pick(
    [
      ['AI', 'SaaS', 'Platform'],
      ['Remote', 'FinTech', 'Scale'],
      ['Startup', 'Series B', 'Growth'],
      ['Enterprise', 'B2B', 'API'],
      ['ML', 'DataOps', 'Cloud'],
      ['DevTools', 'OSS', 'Developer'],
    ],
    rng
  );
  return [...new Set([...baseTags, ...extraTags])];
}

// ─── Interview Generators ─────────────────────────────────────────────────────

export function generateInterview(
  candidateId: string,
  jobId: string,
  index: number,
  jobStage: string,
  rng: () => number
): Record<string, unknown> {
  const types = ['phone', 'video', 'onsite', 'panel', 'technical', 'behavioral'];
  const type = pick(types, rng);

  // Earlier interviews are more likely completed; later ones scheduled
  const daysOffset = randInt(5, 90, rng);
  const isPast = index === 0 || rng() > 0.3;
  const scheduledAt = isPast ? daysAgo(daysOffset) : daysAhead(randInt(1, 14, rng));
  const status = isPast ? pick(['completed', 'completed', 'completed', 'cancelled', 'rescheduled'], rng) : 'scheduled';

  const durations: Record<string, number> = {
    phone: 30,
    video: 60,
    onsite: 240,
    panel: 180,
    technical: 90,
    behavioral: 60,
  };

  const locations = [
    'Google Meet', 'Zoom', 'Microsoft Teams', 'Phone', 'Onsite',
    'Slack Huddle', 'Webex', 'Amazon Chime',
  ];

  const noteTemplates = [
    `${type} interview round. Discussion covered product strategy, cross-functional collaboration, and technical depth. Strong signal from interviewer.`,
    `${type} round completed. Behavioral questions focused on leadership, ambiguity, and customer obsession. Went very well overall.`,
    `${type} interview: technical case study exercise on system design and architecture. Feedback was positive.`,
    `${type} panel: 4 interviewers, 45 minutes each. Topics: strategy, product sense, data/metrics, and leadership. Excellent session.`,
    `${type} screen: confirmed scope, compensation band, and timeline. Advancing to next stage.`,
  ];

  return {
    candidateId,
    jobId,
    type,
    scheduledAt,
    duration: durations[type] || 60,
    location: pick(locations, rng),
    meetingLink: `https://meet.google.com/demo-${Math.random().toString(36).slice(2, 9)}`,
    notes: pick(noteTemplates, rng),
    status,
  };
}

// ─── Offer Generators ─────────────────────────────────────────────────────────

export function generateOffer(
  candidateId: string,
  jobId: string,
  archetype: CandidateArchetype,
  rng: () => number
): Record<string, unknown> {
  const salaryBase =
    archetype === 'job_seeker_senior' || archetype === 'hiring_manager'
      ? randInt(200000, 420000, rng)
      : archetype === 'job_seeker_mid'
      ? randInt(120000, 200000, rng)
      : randInt(75000, 130000, rng);

  const equity = `$${randInt(50, 300, rng)},000 RSU / year (4-yr vest, ${pick(['1-yr', '6-mo'], rng)} cliff)`;
  const bonus = Math.round(salaryBase * randInt(10, 25, rng) / 100);
  const statuses = ['pending', 'received', 'accepted', 'rejected', 'negotiating'] as const;
  const status = pick(statuses, rng);

  return {
    candidateId,
    jobId,
    salary: salaryBase,
    equity,
    bonus,
    benefits: 'Full medical/dental/vision, 401k match, $3K education budget, flexible PTO, remote work stipend $2K/yr',
    startDate: daysAhead(randInt(30, 90, rng)),
    status,
    negotiated: ['negotiating', 'accepted'].includes(status),
    notes: `Offer letter received. Total comp approximately $${Math.round((salaryBase + bonus) / 1000)}K base + equity. ${status === 'negotiating' ? 'Negotiating for higher base and accelerated vesting schedule.' : status === 'accepted' ? 'Accepted — start date confirmed.' : status === 'rejected' ? 'Declined — compensation below market rate.' : 'Reviewing offer details with advisor.'}`,
  };
}

// ─── Document Generators ──────────────────────────────────────────────────────

export function generateDocument(
  candidateId: string,
  jobId: string | null,
  candidateName: string,
  archetype: CandidateArchetype,
  index: number,
  rng: () => number
): Record<string, unknown> {
  const docTypes = ['resume', 'cover_letter', 'notes', 'pdf', 'offer_letter'] as const;
  type DocType = typeof docTypes[number];
  const type: DocType = pick([...docTypes], rng);
  const version = `v${randInt(1, 4, rng)}.${randInt(0, 9, rng)}`;
  const suffix = jobId ? `Job-${index}` : 'Master';

  const nameMap: Record<DocType, string> = {
    resume: `[SYNTHETIC] ${candidateName.replace(' ', '_')}_Resume_${suffix}.pdf`,
    cover_letter: `[SYNTHETIC] Cover_Letter_${suffix}.pdf`,
    notes: `[SYNTHETIC] Interview_Notes_${suffix}.txt`,
    pdf: `[SYNTHETIC] Offer_Letter_${suffix}.pdf`,
    offer_letter: `[SYNTHETIC] Offer_Letter_${suffix}.pdf`,
  };

  const contentMap: Record<DocType, string> = {
    resume: `[SYNTHETIC] Resume for ${candidateName}\n\nThis is a synthetic demo document generated by the CareerPropel demo seed system.\nProfile: ${archetype}\n\n${generateResumeContent(candidateName, archetype, pick(LOCATIONS, rng)).summary}`,
    cover_letter: generateCoverLetterContent(candidateName, pick(SENIOR_JOB_TITLES, rng), pick(COMPANIES, rng).name),
    notes: `[SYNTHETIC] Interview preparation notes.\n\nKey talking points:\n• Quantified achievements with $M impact metrics\n• STAR stories for leadership and conflict resolution\n• Questions to ask the interviewer\n\nGenerated: ${new Date().toISOString()}`,
    pdf: `[SYNTHETIC] AI-generated PDF document for demo purposes. Contains synthesized content for the ${archetype} archetype.`,
    offer_letter: `[SYNTHETIC] OFFER LETTER\n\nDear ${candidateName},\n\nWe are pleased to extend an offer of employment for the role of [Position Title].\n\nBase Salary: $${randInt(100, 400, rng)}K\nEquity: Competitive RSU package\nStart Date: [TBD]\n\nThis is a synthetic offer letter for demonstration purposes only.`,
  };

  return {
    candidateId,
    jobId,
    name: nameMap[type],
    type,
    url: null,
    content: contentMap[type],
    version,
    tags: ['demo', type, archetype.replace(/_/g, '-')],
  };
}

// ─── Calendar Event Generator ─────────────────────────────────────────────────

export function generateCalendarEvent(
  candidateId: string,
  jobId: string | null,
  index: number,
  rng: () => number
): Record<string, unknown> {
  const eventTypes = [
    { title: 'Phone Screen Interview', duration: 30 },
    { title: 'Technical Interview Round', duration: 90 },
    { title: 'Behavioral Panel Interview', duration: 120 },
    { title: 'Hiring Manager Loop', duration: 60 },
    { title: 'Final Round Interview', duration: 180 },
    { title: 'Recruiter Follow-up Call', duration: 30 },
    { title: 'Offer Discussion Call', duration: 45 },
    { title: 'Interview Prep Session', duration: 60 },
  ];

  const event = pick(eventTypes, rng);
  const isPast = rng() > 0.4;
  const startAt = isPast ? daysAgo(randInt(1, 60, rng)) : daysAhead(randInt(1, 21, rng));
  const endAt = new Date(startAt.getTime() + event.duration * 60 * 1000);

  return {
    candidateId,
    externalId: `demo-cal-evt-${Date.now()}-${index}`,
    provider: pick(['google', 'outlook'], rng),
    title: `[DEMO] ${event.title}`,
    description: `Demo calendar event generated by CareerPropel seed system. This event represents a ${event.title.toLowerCase()} in the candidate's job search pipeline.`,
    startAt,
    endAt,
    location: pick(['Google Meet', 'Zoom', 'Phone', 'Onsite', 'Microsoft Teams'], rng),
    meetingUrl: `https://meet.google.com/demo-${Math.random().toString(36).slice(2, 9)}`,
    jobId,
    interviewId: null,
    syncedAt: new Date(),
  };
}

// ─── Agent Execution Generator ────────────────────────────────────────────────

export function generateAgentExecution(
  userEmail: string,
  jobTitle: string,
  index: number,
  rng: () => number
): { execution: Record<string, unknown>; toolCalls: Record<string, unknown>[]; eventLogs: Record<string, unknown>[] } {
  const agentTypes = ['resume-tailor', 'job-match', 'interview-prep', 'research', 'follow-up'] as const;
  const type = pick([...agentTypes], rng);
  const statuses = ['queued', 'running', 'completed', 'completed', 'completed', 'failed'] as const;
  const status = pick([...statuses], rng);
  const durationMs = randInt(800, 15000, rng);
  const tokenCount = randInt(500, 8000, rng);

  const startedAt = daysAgo(randInt(1, 60, rng));
  const completedAt = status === 'completed' || status === 'failed'
    ? new Date(startedAt.getTime() + durationMs)
    : null;

  const execution = {
    userId: userEmail,
    agentType: type,
    status,
    input: JSON.stringify({
      ...demoMeta(),
      jobTitle,
      agentType: type,
      requestedAt: startedAt.toISOString(),
    }),
    output: status === 'completed'
      ? JSON.stringify({
          ...demoMeta(),
          summary: `AI ${type} completed successfully for "${jobTitle}". Generated tailored content with ${randInt(3, 8, rng)} key improvements identified.`,
          improvements: randInt(3, 8, rng),
          confidence: parseFloat((rng() * 0.3 + 0.7).toFixed(2)),
        })
      : status === 'failed'
      ? null
      : null,
    tokenCount,
    durationMs,
    errorMessage: status === 'failed' ? 'AI provider rate limit exceeded. Please retry.' : null,
    startedAt,
    completedAt,
  };

  const toolCallCount = randInt(2, 6, rng);
  const toolCalls = Array.from({ length: toolCallCount }, (_, i) => ({
    tool: pick(['search_web', 'extract_text', 'generate_content', 'analyze_resume', 'score_match', 'fetch_job_details'], rng),
    input: { query: jobTitle, step: i + 1, ...demoMeta() },
    output: status === 'completed' ? { result: `Tool output for step ${i + 1}`, tokens: randInt(100, 500, rng) } : null,
    status: status === 'completed' ? 'completed' : i < 2 ? 'completed' : 'failed',
    startedAt: new Date(startedAt.getTime() + i * 1000),
    completedAt: status === 'completed' ? new Date(startedAt.getTime() + (i + 1) * 1200) : null,
  }));

  const logLevels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'] as const;
  const eventLogs = Array.from({ length: randInt(3, 8, rng) }, (_, i) => ({
    level: pick([...logLevels], rng),
    message: pick([
      `Agent ${type} started for job: ${jobTitle}`,
      `Fetching job description and company data`,
      `Analyzing candidate profile and skills match`,
      `Generating tailored content with AI`,
      `Scoring match quality: ${(rng() * 0.4 + 0.6).toFixed(2)}`,
      `Finalizing output and storing results`,
      `Agent execution completed successfully`,
      `Warning: Low confidence on skill extraction`,
    ], rng),
    metadata: { step: i + 1, ...demoMeta() },
    timestamp: new Date(startedAt.getTime() + i * 500),
  }));

  return { execution, toolCalls, eventLogs };
}

// ─── Audit Log Generator ──────────────────────────────────────────────────────

export function generateAuditLog(
  email: string,
  resourceId: string,
  index: number,
  rng: () => number
): Record<string, unknown> {
  const actions = [
    'LOGIN', 'LOGOUT', 'JOB_CREATED', 'JOB_UPDATED', 'JOB_STAGE_CHANGED',
    'JOB_DELETED', 'DOCUMENT_UPLOADED', 'INTERVIEW_SCHEDULED', 'OFFER_RECEIVED',
    'PROFILE_UPDATED', 'API_KEY_CREATED', 'SETTINGS_CHANGED', 'AI_AGENT_RUN',
  ] as const;

  const resources = ['jobs', 'candidates', 'documents', 'interviews', 'offers', 'settings', 'api_keys'] as const;
  const severities = ['info', 'info', 'info', 'info', 'warning', 'error'] as const;

  const action = pick([...actions], rng);
  const resource = pick([...resources], rng);
  const severity = pick([...severities], rng);

  return {
    email,
    action,
    resource,
    resourceId: resourceId || `demo-resource-${index}`,
    details: {
      ...demoMeta(),
      message: `Demo audit log: ${action} on ${resource}`,
      ipAddress: `${randInt(10, 200, rng)}.${randInt(0, 255, rng)}.${randInt(0, 255, rng)}.${randInt(1, 254, rng)}`,
    },
    ipAddress: `${randInt(10, 200, rng)}.${randInt(0, 255, rng)}.${randInt(0, 255, rng)}.${randInt(1, 254, rng)}`,
    userAgent: pick([
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ], rng),
    status: pick(['success', 'success', 'success', 'failure'], rng),
    severity,
    createdAt: daysAgo(randInt(0, 90, rng)),
  };
}

// ─── STAR Story Generator ──────────────────────────────────────────────────────

export function generateStarStory(
  candidateId: string,
  prepId: string | null,
  rng: () => number
): Record<string, unknown> {
  const competencies = [
    'leadership', 'problem-solving', 'cross-functional collaboration',
    'customer obsession', 'data-driven decision making', 'innovation',
    'conflict resolution', 'stakeholder management', 'execution excellence',
  ];

  const competency = pick(competencies, rng);

  return {
    candidateId,
    interviewPrepId: prepId,
    competency,
    competencies: pickN(competencies, 3, rng),
    title: `${pick(['Led', 'Drove', 'Launched', 'Scaled', 'Transformed'], rng)} ${pick(['platform', 'product', 'team', 'initiative', 'program'], rng)} to achieve ${pick(['$10M ARR', '3x growth', '50% efficiency gain', '30% cost reduction', '2x user adoption'], rng)}`,
    summary: `Faced with a critical ${competency} challenge, I took ownership and delivered measurable impact through a combination of strategic thinking and execution.`,
    situation: `Our team was facing a critical challenge with ${pick(['declining user retention', 'competitive pressure', 'technical debt', 'organizational misalignment', 'customer churn'], rng)} that threatened our core KPIs.`,
    task: `As the ${pick(['product lead', 'senior engineer', 'technical PM', 'team lead'], rng)}, I was responsible for defining and executing a solution that would reverse this trend within one quarter.`,
    action: `I took a systematic approach: (1) conducted 15 customer discovery interviews to understand root causes, (2) built a cross-functional coalition with engineering, design, and data teams, (3) defined a focused MVP scope, (4) established weekly metrics reviews to track progress.`,
    result: `Delivered the solution in ${randInt(6, 16, rng)} weeks, resulting in a ${randInt(15, 45, rng)}% improvement in the target metric and ${randInt(5, 25, rng)}% uplift in customer satisfaction.`,
    metrics: [
      `${randInt(10, 50, rng)}% improvement in core KPI`,
      `${randInt(5, 20, rng)}% increase in user satisfaction`,
      `Delivered ${randInt(2, 6, rng)} weeks ahead of schedule`,
    ],
    relevanceScore: parseFloat((rng() * 0.4 + 0.6).toFixed(2)),
    timeToTell: randInt(90, 180, rng),
    confidence: randInt(70, 100, rng),
    interviewQuestions: [
      `Tell me about a time you demonstrated ${competency}`,
      `Describe a situation where you had to show ${competency}`,
      `Give me an example of ${competency} in your career`,
    ],
  };
}
