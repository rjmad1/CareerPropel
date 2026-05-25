/**
 * ATS Formatter
 *
 * Enforces ATS-safe formatting rules on generated document content.
 *
 * ALLOWED:
 *  - Single-column linear layout (Markdown)
 *  - Standard headings: Experience, Skills, Education, Certifications, Projects
 *  - Plain bullet structures (- or •)
 *  - Consistent date formats
 *
 * FORBIDDEN:
 *  - Tables
 *  - Multi-column layouts
 *  - Text boxes / dividers (heavy)
 *  - Icons / graphics / charts
 *  - Headers/footers
 *  - Complex typography
 */

export interface FormatViolation {
  type:    string;
  message: string;
  line?:   number;
}

export interface FormatCheckResult {
  passed:     boolean;
  violations: FormatViolation[];
  cleaned:    string; // auto-cleaned version
}

// ─── Forbidden pattern rules ──────────────────────────────────────────────────

const FORBIDDEN_RULES: Array<{
  name:    string;
  pattern: RegExp;
  fix:     (match: string) => string;
  message: string;
}> = [
  {
    name:    'table',
    pattern: /\|[^\n]*\|[^\n]*\n(\|[-:]+)+/g,
    fix:     () => '', // strip tables entirely
    message: 'Markdown table detected — ATS parsers cannot parse tables. Convert to bullet list.',
  },
  {
    name:    'html_tag',
    pattern: /<\/?(?:div|span|table|td|tr|th|img|svg|br|hr|header|footer|section|aside)[^>]*>/gi,
    fix:     () => '',
    message: 'HTML tag detected — resume must be plain Markdown only.',
  },
  {
    name:    'horizontal_rule',
    pattern: /^---+$|^===+$|^\*\*\*+$/gm,
    fix:     () => '',
    message: 'Horizontal rule detected — decorative separators break parser section detection.',
  },
  {
    name:    'code_block',
    pattern: /```[\s\S]*?```/g,
    fix:     (m) => m.replace(/```[\w]*\n?/g, '').replace(/```/g, ''),
    message: 'Code block detected — strip fenced blocks.',
  },
  {
    name:    'inline_code',
    pattern: /`[^`]+`/g,
    fix:     (m) => m.replace(/`/g, ''),
    message: 'Inline code formatting — use plain text.',
  },
  {
    name:    'bold_italic_mix',
    // ***text*** is over-formatted
    pattern: /\*{3}[^*]+\*{3}/g,
    fix:     (m) => m.replace(/\*/g, ''),
    message: 'Bold+italic (***) detected — keep formatting minimal.',
  },
];

// ─── Standard heading normalizer ─────────────────────────────────────────────

const HEADING_MAP: Record<string, string> = {
  'work experience':    'Experience',
  'work history':       'Experience',
  'professional experience': 'Experience',
  'employment':         'Experience',
  'career history':     'Experience',
  'technical skills':   'Skills',
  'core competencies':  'Skills',
  'key skills':         'Skills',
  'expertise':          'Skills',
  'qualifications':     'Skills',
  'academic background': 'Education',
  'academic history':   'Education',
  'schooling':          'Education',
  'credentials':        'Certifications',
  'licences':           'Certifications',
  'licenses':           'Certifications',
  'side projects':      'Projects',
  'personal projects':  'Projects',
  'notable projects':   'Projects',
};

function normalizeHeadings(text: string): string {
  return text.replace(/^(#{1,3})\s+(.+)$/gim, (_, hashes, heading) => {
    const lower = heading.toLowerCase().trim();
    const canonical = HEADING_MAP[lower];
    return canonical ? `${hashes} ${canonical}` : `${hashes} ${heading}`;
  });
}

// ─── Bullet normalizer ────────────────────────────────────────────────────────

function normalizeBullets(text: string): string {
  // Normalize bullet chars: •, *, ▪, → to -
  return text.replace(/^[•▪▸→►]\s+/gm, '- ');
}

// ─── Date format normalizer ───────────────────────────────────────────────────

function normalizeDates(text: string): string {
  // Convert MM/YY to MM/YYYY (e.g. 01/22 → 01/2022) — only 2-digit years
  return text.replace(/\b(\d{2})\/(\d{2})\b/g, (_, mm, yy) => {
    const year = parseInt(yy, 10) < 50 ? `20${yy}` : `19${yy}`;
    return `${mm}/${year}`;
  });
}

// ─── Contact section formatter ────────────────────────────────────────────────

export function formatContactSection(
  name: string,
  email: string,
  phone?: string,
  location?: string,
  linkedIn?: string,
): string {
  const lines = [`# ${name}`, email];
  if (phone)    lines.push(phone);
  if (location) lines.push(location);
  if (linkedIn) lines.push(linkedIn);
  return lines.join('\n');
}

// ─── Main formatter ───────────────────────────────────────────────────────────

export function enforceATSFormat(content: string): FormatCheckResult {
  const violations: FormatViolation[] = [];
  let cleaned = content;

  // Apply each rule: detect violations, auto-clean
  for (const rule of FORBIDDEN_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(cleaned)) {
      violations.push({ type: rule.name, message: rule.message });
    }
    rule.pattern.lastIndex = 0;
    cleaned = cleaned.replace(rule.pattern, rule.fix);
  }

  // Normalize
  cleaned = normalizeHeadings(cleaned);
  cleaned = normalizeBullets(cleaned);
  cleaned = normalizeDates(cleaned);

  // Collapse excessive blank lines (max 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return {
    passed:     violations.length === 0,
    violations,
    cleaned,
  };
}

/** Apply ATS formatting rules and return cleaned content. Logs violations. */
export function formatForATS(content: string): string {
  const { cleaned } = enforceATSFormat(content);
  return cleaned;
}
