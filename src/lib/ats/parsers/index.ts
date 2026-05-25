/**
 * ATS Parser Validation Pipeline
 *
 * Simulates what ATS parsers do when they ingest a resume.
 * Validates machine-readability across six dimensions.
 */

export interface ParserValidationSummary {
  headingsValid:    boolean;
  datesValid:       boolean;
  contactValid:     boolean;
  sectionsDetected: string[];
  chronologyValid:  boolean;
  /** 0–20 for ATS score format component */
  formatScore:      number;
  /** 0–10 for ATS score chronology component */
  chronologyScore:  number;
  warnings:         string[];
  errors:           string[];
  recommendations:  string[];
}

// ─── Heading validation ───────────────────────────────────────────────────────

const REQUIRED_HEADINGS = ['Experience', 'Education', 'Skills'];
const OPTIONAL_HEADINGS = ['Certifications', 'Projects', 'Summary', 'Objective', 'Publications'];

/** Headings that ATS parsers fail on */
const FORBIDDEN_HEADING_PATTERNS = [
  /\bwork history\b/i,   // some older parsers skip this
  /\bexpertise\b/i,      // ambiguous
  /\baccomplishments\b/i, // sometimes not mapped
];

function validateHeadings(text: string): {
  valid: boolean;
  detected: string[];
  warnings: string[];
} {
  const detected: string[] = [];
  const warnings: string[] = [];

  for (const heading of [...REQUIRED_HEADINGS, ...OPTIONAL_HEADINGS]) {
    if (new RegExp(`^##?\\s*${heading}`, 'im').test(text)) {
      detected.push(heading);
    }
  }

  const missingRequired = REQUIRED_HEADINGS.filter((h) => !detected.includes(h));
  if (missingRequired.length > 0) {
    warnings.push(`Missing standard headings: ${missingRequired.join(', ')}`);
  }

  for (const pattern of FORBIDDEN_HEADING_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push(`Heading pattern "${pattern.source}" may not parse correctly in all ATS systems.`);
    }
  }

  return { valid: missingRequired.length === 0, detected, warnings };
}

// ─── Date validation ──────────────────────────────────────────────────────────

const VALID_DATE_PATTERNS = [
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/g, // "Jan 2022"
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g,
  /\b\d{2}\/\d{4}\b/g, // 01/2022
  /\b\d{4}\s*[-–]\s*\d{4}\b/g, // 2020–2022
  /\b\d{4}\s*[-–]\s*Present\b/gi, // 2020–Present
  /\b\d{4}\s*[-–]\s*Current\b/gi,
];

const AMBIGUOUS_DATE_PATTERNS = [
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // MM/DD/YY — parser may misread
  /\b\d{4}\s*to\s*\d{4}\b/gi, // "2020 to 2022" — text parsers sometimes miss
];

function validateDates(text: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for ambiguous formats
  for (const pattern of AMBIGUOUS_DATE_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push(`Ambiguous date format detected — prefer "Month YYYY" or "MM/YYYY".`);
    }
  }

  // Must have at least some valid dates
  const hasValidDates = VALID_DATE_PATTERNS.some((p) => {
    p.lastIndex = 0;
    return p.test(text);
  });

  if (!hasValidDates) {
    warnings.push('No parseable date formats detected. Add employment dates in "Month YYYY" format.');
  }

  return { valid: hasValidDates && warnings.length === 0, warnings };
}

// ─── Contact parsing ──────────────────────────────────────────────────────────

const EMAIL_PATTERN = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}\b/;
const PHONE_PATTERN = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;

function validateContact(text: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const hasEmail = EMAIL_PATTERN.test(text);
  const hasPhone = PHONE_PATTERN.test(text);

  if (!hasEmail) warnings.push('No email address detected — required for ATS contact parsing.');
  if (!hasPhone) warnings.push('No phone number detected — recommended for ATS contact extraction.');

  return { valid: hasEmail, warnings };
}

// ─── Chronology validation ────────────────────────────────────────────────────

function validateChronology(text: string): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Detect multiple "Present" / "Current" roles (likely an error)
  const presentCount = (text.match(/\b(Present|Current)\b/gi) ?? []).length;
  if (presentCount > 1) {
    warnings.push(`${presentCount} "Present" date entries found — only one current role is expected.`);
  }

  // Check for reverse-chronological order heuristic
  // Extract years mentioned in the Experience section
  const expSection = text.slice(
    text.search(/^##?\s*Experience/im),
    text.search(/^##?\s*(Education|Skills|Certifications)/im),
  );
  const years = (expSection.match(/\b(20\d\d|19\d\d)\b/g) ?? [])
    .map(Number)
    .filter((y) => y > 1990 && y <= new Date().getFullYear());

  if (years.length >= 4) {
    let prevYear = years[0];
    for (const year of years.slice(1)) {
      if (year > prevYear + 2) {
        warnings.push(
          `Non-chronological year sequence detected (${prevYear} → ${year}). Ensure most-recent role is listed first.`,
        );
        break;
      }
      prevYear = Math.min(prevYear, year);
    }
  }

  return { valid: warnings.length === 0, warnings };
}

// ─── Format compliance (no forbidden elements) ───────────────────────────────

const FORBIDDEN_FORMAT_PATTERNS = [
  { pattern: /\|.*\|/m,         message: 'Table detected — ATS parsers often misread tables.' },
  { pattern: /^[>\s]*>/m,       message: 'Blockquotes/nested structure detected — avoid in ATS resumes.' },
  { pattern: /```[\s\S]*?```/m, message: 'Code block detected — strip fenced blocks from resume body.' },
];

function validateFormat(text: string): { score: number; errors: string[] } {
  const errors: string[] = [];

  for (const { pattern, message } of FORBIDDEN_FORMAT_PATTERNS) {
    if (pattern.test(text)) errors.push(message);
  }

  // Score: 20 base, -5 per error
  const score = Math.max(0, 20 - errors.length * 5);
  return { score, errors };
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export function runParserValidation(resumeText: string): ParserValidationSummary {
  const headings    = validateHeadings(resumeText);
  const dates       = validateDates(resumeText);
  const contact     = validateContact(resumeText);
  const chronology  = validateChronology(resumeText);
  const format      = validateFormat(resumeText);

  const allWarnings = [
    ...headings.warnings,
    ...dates.warnings,
    ...contact.warnings,
    ...chronology.warnings,
  ];

  const chronologyScore = chronology.valid ? 10 : chronology.warnings.length > 1 ? 2 : 6;

  const recommendations: string[] = [
    ...allWarnings.map((w) => w),
    ...format.errors,
  ];

  return {
    headingsValid:    headings.valid,
    datesValid:       dates.valid,
    contactValid:     contact.valid,
    sectionsDetected: headings.detected,
    chronologyValid:  chronology.valid,
    formatScore:      format.score,
    chronologyScore,
    warnings:         allWarnings,
    errors:           format.errors,
    recommendations,
  };
}
