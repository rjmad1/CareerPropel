/**
 * Job Language Profiler
 *
 * Builds a comprehensive language profile for a job posting:
 * tone, seniority signals, company type, and domain vocabulary.
 * Used to tune resume variant language to match recruiter expectations.
 */

export type CompanyStage = 'startup' | 'growth' | 'enterprise' | 'public' | 'unknown';
export type SenioritySignal = 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive';
export type DomainProfile =
  | 'product'
  | 'engineering'
  | 'data'
  | 'design'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'hr'
  | 'general';

export interface JobLanguageProfile {
  title:          string;
  company:        string;
  companyStage:   CompanyStage;
  seniority:      SenioritySignal;
  domain:         DomainProfile;
  /** Exact action verbs the JD uses (prefer these in bullets) */
  preferredVerbs: string[];
  /** Domain-specific vocabulary the JD favors */
  domainVocab:    string[];
  /** Industries mentioned */
  industries:     string[];
  /** Is this a people-manager role? */
  isManagerRole:  boolean;
  /** Estimated team/org size signal */
  teamScaleHint:  'ic' | 'lead' | 'manager' | 'director' | 'vp';
}

// ─── Detection helpers ────────────────────────────────────────────────────────

const STARTUP_SIGNALS    = /\b(startup|early[\s-]stage|seed|series [abc]|fast[\s-]paced|hypergrowth|wear many hats|scrappy|small team)\b/i;
const ENTERPRISE_SIGNALS = /\b(fortune [0-9]+|enterprise|global|at scale|thousands of (employees|customers)|established|large org|matrixed)\b/i;
const PUBLIC_SIGNALS     = /\b(public company|nasdaq|nyse|sec filing|publicly traded)\b/i;

const SENIORITY_MAP: Array<[RegExp, SenioritySignal]> = [
  [/\b(vp|vice president|svp|evp|c-level|chief)\b/i,        'executive'],
  [/\b(director|gm|general manager)\b/i,                     'principal'],
  [/\b(principal|staff|distinguished|architect)\b/i,         'staff'],
  [/\b(senior|sr\.?|lead)\b/i,                              'senior'],
  [/\b(mid[\s-]level|iii|3\+? years)\b/i,                   'mid'],
  [/\b(junior|jr\.?|entry[\s-]level|new grad|0[\s-]2 years)\b/i, 'entry'],
];

const MANAGER_SIGNALS = /\b(manage|manage a team|people manager|direct reports|hiring|performance reviews|build and lead|grow the team)\b/i;
const IC_SIGNALS      = /\b(individual contributor|ic\b|no direct reports)\b/i;

function detectCompanyStage(text: string): CompanyStage {
  if (PUBLIC_SIGNALS.test(text)) return 'public';
  if (ENTERPRISE_SIGNALS.test(text)) return 'enterprise';
  if (STARTUP_SIGNALS.test(text)) return 'startup';
  // Growth: moderate signals
  if (/\b(scaling|series [de]|late[\s-]stage|hundreds of employees)\b/i.test(text)) return 'growth';
  return 'unknown';
}

function detectSeniority(title: string, text: string): SenioritySignal {
  const combined = `${title} ${text}`;
  for (const [pattern, level] of SENIORITY_MAP) {
    if (pattern.test(combined)) return level;
  }
  return 'mid';
}

function detectDomain(title: string, text: string): DomainProfile {
  const combined = `${title} ${text}`.toLowerCase();
  if (/\b(product manager|pm\b|product owner|product lead)\b/.test(combined)) return 'product';
  if (/\b(data (scientist|engineer|analyst)|ml engineer|ai engineer)\b/.test(combined)) return 'data';
  if (/\b(designer|ux|ui|design|figma|user research)\b/.test(combined)) return 'design';
  if (/\b(marketing|growth|seo|sem|content|brand)\b/.test(combined)) return 'marketing';
  if (/\b(sales|revenue|account executive|business development|ae\b)\b/.test(combined)) return 'sales';
  if (/\b(operations|ops|supply chain|logistics|process)\b/.test(combined)) return 'operations';
  if (/\b(finance|accounting|controller|cfo|analyst)\b/.test(combined)) return 'finance';
  if (/\b(hr|people|talent|recruiting|hrbp)\b/.test(combined)) return 'hr';
  if (/\b(engineer|developer|software|backend|frontend|fullstack|devops|platform)\b/.test(combined)) return 'engineering';
  return 'general';
}

function extractPreferredVerbs(text: string): string[] {
  const verbPattern = /(?:^|\n)[•\-*]\s+([A-Z][a-z]+)/gm;
  const verbs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = verbPattern.exec(text)) !== null) {
    if (!verbs.includes(m[1])) verbs.push(m[1]);
  }
  return verbs.slice(0, 15);
}

function extractIndustries(text: string): string[] {
  const industries: string[] = [];
  const INDUSTRY_PATTERNS: Array<[RegExp, string]> = [
    [/\b(fintech|financial technology|financial services|banking)\b/i, 'Fintech'],
    [/\b(healthcare|health tech|medtech|medical)\b/i, 'Healthcare'],
    [/\b(edtech|education technology|e-learning)\b/i, 'EdTech'],
    [/\b(e-commerce|ecommerce|retail|consumer)\b/i, 'E-Commerce'],
    [/\b(saas|software as a service|b2b software)\b/i, 'SaaS'],
    [/\b(enterprise software|b2b|enterprise)\b/i, 'Enterprise'],
    [/\b(gaming|game|esports)\b/i, 'Gaming'],
    [/\b(media|content|streaming|entertainment)\b/i, 'Media'],
    [/\b(cloud|infrastructure|devops|platform)\b/i, 'Cloud/Infra'],
    [/\b(ai|artificial intelligence|machine learning)\b/i, 'AI/ML'],
    [/\b(cybersecurity|security|infosec)\b/i, 'Cybersecurity'],
    [/\b(logistics|supply chain|transportation)\b/i, 'Logistics'],
  ];
  for (const [pattern, label] of INDUSTRY_PATTERNS) {
    if (pattern.test(text) && !industries.includes(label)) industries.push(label);
  }
  return industries;
}

function detectTeamScale(title: string, text: string): JobLanguageProfile['teamScaleHint'] {
  if (IC_SIGNALS.test(text)) return 'ic';
  if (/\bvp\b|vice president|svp/i.test(title)) return 'vp';
  if (/\bdirector\b/i.test(title)) return 'director';
  if (/\bmanager\b/i.test(title) || MANAGER_SIGNALS.test(text)) return 'manager';
  if (/\blead\b/i.test(title)) return 'lead';
  return 'ic';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function profileJobLanguage(
  jobTitle: string,
  company: string,
  jobDescription: string,
): JobLanguageProfile {
  return {
    title:          jobTitle,
    company,
    companyStage:   detectCompanyStage(jobDescription),
    seniority:      detectSeniority(jobTitle, jobDescription),
    domain:         detectDomain(jobTitle, jobDescription),
    preferredVerbs: extractPreferredVerbs(jobDescription),
    domainVocab:    [],
    industries:     extractIndustries(jobDescription),
    isManagerRole:  MANAGER_SIGNALS.test(jobDescription) && !IC_SIGNALS.test(jobDescription),
    teamScaleHint:  detectTeamScale(jobTitle, jobDescription),
  };
}
