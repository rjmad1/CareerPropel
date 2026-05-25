/**
 * ATS Keyword Extractor
 *
 * Extracts exact recruiter language from job descriptions.
 *
 * CRITICAL RULE: Do NOT synonymize. If the JD says "Product Lifecycle Management",
 * the resume must use "Product Lifecycle Management" — not a synonym.
 * This module preserves exact phrasing.
 */

// ─── Multi-word phrase patterns ───────────────────────────────────────────────

/** Phrases that are high-value ATS terms — must be extracted verbatim */
const MULTI_WORD_PATTERNS = [
  // Methodologies
  /\bAgile(?: Development)?\b/g,
  /\bScrum(?: Master)?\b/g,
  /\bLean(?: Manufacturing| Six Sigma| UX)?\b/g,
  /\bSix Sigma\b/g,
  /\bProduct Lifecycle Management\b/g,
  /\bProduct[\s-]Led Growth\b/g,
  /\bData[\s-]Driven\b/g,
  /\bCI\/CD\b/g,
  /\bDevSecOps\b/g,
  /\bInfrastructure as Code\b/g,
  /\bZero[\s-]Trust\b/g,
  // Tech domains
  /\bMachine Learning\b/g,
  /\bDeep Learning\b/g,
  /\bNatural Language Processing\b/g,
  /\bLarge Language Models?\b/g,
  /\bReinforcement Learning\b/g,
  /\bComputer Vision\b/g,
  /\bData Engineering\b/g,
  /\bPlatform Engineering\b/g,
  /\bSite Reliability Engineering\b/g,
  /\bSoftware Development Life Cycle\b/g,
  /\bObject[\s-]Oriented Programming\b/g,
  /\bFunctional Programming\b/g,
  /\bEvent[\s-]Driven Architecture\b/g,
  /\bDomain[\s-]Driven Design\b/g,
  /\bTest[\s-]Driven Development\b/g,
  /\bBehavior[\s-]Driven Development\b/g,
  // Cloud
  /\bAmazon Web Services\b/g,
  /\bGoogle Cloud Platform\b/g,
  /\bMicrosoft Azure\b/g,
  /\bMulti[\s-]Cloud\b/g,
  // Business
  /\bCustomer Success\b/g,
  /\bCustomer Experience\b/g,
  /\bStakeholder Management\b/g,
  /\bChange Management\b/g,
  /\bP&L (Responsibility|Management|Ownership)\b/g,
  /\bGo[\s-]to[\s-]Market\b/g,
  /\bCross[\s-]Functional Teams?\b/g,
  /\bRevenue Growth\b/g,
];

/** Section header markers in JDs — content after these is high-priority */
const REQUIRED_HEADERS = [
  /requirements?:?\s*$/im,
  /required qualifications?:?\s*$/im,
  /must have:?\s*$/im,
  /you (will|must|should) have:?\s*$/im,
  /basic qualifications?:?\s*$/im,
];

const PREFERRED_HEADERS = [
  /preferred qualifications?:?\s*$/im,
  /nice[\s-]to[\s-]have:?\s*$/im,
  /bonus:?\s*$/im,
  /plus(?:es?)?:?\s*$/im,
];

// ─── Single-word tech/domain terms ────────────────────────────────────────────

const KNOWN_TECH_TERMS = new Set([
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift',
  'React', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Nuxt',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
  'Kafka', 'RabbitMQ', 'Celery', 'BullMQ',
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Helm',
  'AWS', 'GCP', 'Azure',
  'GraphQL', 'REST', 'gRPC', 'WebSockets',
  'Figma', 'Sketch', 'Storybook',
  'Git', 'GitHub', 'GitLab', 'Bitbucket',
  'Jira', 'Confluence', 'Notion', 'Linear',
  'Datadog', 'Grafana', 'Prometheus', 'Splunk', 'OpenTelemetry',
  'Airflow', 'dbt', 'Spark', 'Snowflake', 'BigQuery', 'Redshift',
  'Stripe', 'Twilio', 'Segment', 'Amplitude', 'Mixpanel',
  'Salesforce', 'HubSpot',
  'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy',
  'OpenAI', 'Anthropic', 'LangChain',
]);

// ─── Action verbs commonly used in JDs ───────────────────────────────────────

const JD_ACTION_VERBS = [
  'design', 'architect', 'build', 'develop', 'implement', 'deploy',
  'lead', 'manage', 'own', 'drive', 'scale', 'optimize', 'mentor',
  'collaborate', 'partner', 'define', 'establish', 'create',
  'analyze', 'evaluate', 'research', 'investigate',
  'communicate', 'present', 'document',
];

// ─── Extraction functions ─────────────────────────────────────────────────────

export interface ExtractedKeywords {
  required:    string[];
  preferred:   string[];
  title:       string[];
  tools:       string[];
  domain:      string[];
  actionVerbs: string[];
  all:         string[];
}

function extractSection(text: string, headers: RegExp[]): string {
  for (const header of headers) {
    const match = header.exec(text);
    if (match) {
      const start = match.index + match[0].length;
      // Take up to 2000 chars after the section header
      return text.slice(start, start + 2000);
    }
  }
  return '';
}

function extractMultiWordPhrases(text: string): string[] {
  const found: string[] = [];
  for (const pattern of MULTI_WORD_PATTERNS) {
    pattern.lastIndex = 0; // reset global regex
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const phrase = m[0].trim();
      if (!found.includes(phrase)) found.push(phrase);
    }
  }
  return found;
}

function extractTechTerms(text: string): string[] {
  const found: string[] = [];
  for (const term of KNOWN_TECH_TERMS) {
    // Word-boundary match, case-insensitive for detection but preserve canonical
    const re = new RegExp(`\\b${term.replace(/[.+]/g, '\\$&')}\\b`, 'i');
    if (re.test(text)) found.push(term);
  }
  return found;
}

function extractActionVerbs(text: string): string[] {
  return JD_ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}\\b`, 'i').test(text),
  );
}

function extractTitleKeywords(jobTitle: string): string[] {
  // Split title into component words, preserving compounds like "Full-Stack"
  return jobTitle
    .split(/[\s\/,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !/^(and|or|the|of|in|for|at|with)$/i.test(w));
}

/**
 * Extract all keyword categories from a job description.
 *
 * Output is deduplicated per category. Exact phrasing is preserved —
 * no synonymization is applied here.
 */
export function extractJobKeywords(
  jobTitle: string,
  jobDescription: string,
): ExtractedKeywords {
  const requiredSection  = extractSection(jobDescription, REQUIRED_HEADERS) || jobDescription;
  const preferredSection = extractSection(jobDescription, PREFERRED_HEADERS);

  const required  = [
    ...extractMultiWordPhrases(requiredSection),
    ...extractTechTerms(requiredSection),
  ];

  const preferred = preferredSection
    ? [
        ...extractMultiWordPhrases(preferredSection),
        ...extractTechTerms(preferredSection),
      ].filter((k) => !required.includes(k))
    : [];

  const title       = extractTitleKeywords(jobTitle);
  const tools       = extractTechTerms(jobDescription);
  const domain      = extractMultiWordPhrases(jobDescription).filter(
    (p) => !required.includes(p) && !preferred.includes(p),
  );
  const actionVerbs = extractActionVerbs(jobDescription);

  const all = [...new Set([...title, ...required, ...preferred, ...tools, ...domain])];

  return {
    required:    [...new Set(required)],
    preferred:   [...new Set(preferred)],
    title:       [...new Set(title)],
    tools:       [...new Set(tools)],
    domain:      [...new Set(domain)],
    actionVerbs: [...new Set(actionVerbs)],
    all,
  };
}
