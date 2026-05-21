import { ParsingLogEntry } from '@/types/knowledge-graph';

/**
 * Document Parser Utility
 * 
 * Simulates low-level parsing of PDF, DOCX, and LinkedIn JSON exports.
 * Generates streamable progress logs for frontend visualization.
 */

const LOG_TEMPLATES: Record<string, string[]> = {
  pdf: [
    'Initializing PDF JS stream parser...',
    'Opening binary document stream...',
    'Extracting metadata (creator, timestamp, pages)...',
    'Performing optical layout analysis (page structures)...',
    'OCR segment parsing: localized 4 high-density experience blocks...',
    'Cleaning whitespace formatting and special character tags...',
    'Syntactic mapping of sections complete.'
  ],
  docx: [
    'Initializing Office Open XML parser...',
    'Extracting document archive contents...',
    'Reading word/document.xml content trees...',
    'Decoding document styles and hierarchy definitions...',
    'Parsing 12 heading segments and list items...',
    'Normalizing plain-text segments...',
    'Document structure mapping complete.'
  ],
  json: [
    'Initializing JSON stream-reader...',
    'Validating schema (LinkedIn Profile Export)...',
    'Extracting primary identity (Candidate profile node)...',
    'Parsing work history array (found 5 positions)...',
    'Parsing skills collection (found 28 skill nodes)...',
    'Parsing recommendations array...',
    'Object payload parsing complete.'
  ]
};

/**
 * Generate logs representing the parser stepping through document analysis
 */
export function getParsingProgressLogs(
  fileType: 'pdf' | 'docx' | 'json',
  step: number
): ParsingLogEntry {
  const templates = LOG_TEMPLATES[fileType] || LOG_TEMPLATES.pdf;
  const index = Math.min(step, templates.length - 1);
  
  return {
    timestamp: new Date().toLocaleTimeString(),
    level: step === templates.length - 1 ? 'success' : 'info',
    message: templates[index]
  };
}

/**
 * Simulate document text parsing delay
 */
export async function parseDocumentText(
  fileName: string,
  onProgress: (progress: number, log: ParsingLogEntry) => void
): Promise<string> {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const fileType = (extension === 'pdf' ? 'pdf' : extension === 'docx' ? 'docx' : 'json') as 'pdf' | 'docx' | 'json';
  const steps = LOG_TEMPLATES[fileType].length;

  for (let i = 0; i < steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const progress = Math.round(((i + 1) / steps) * 100);
    const log = getParsingProgressLogs(fileType, i);
    onProgress(progress, log);
  }

  // Returns generic text based on file format
  if (fileType === 'json') {
    return JSON.stringify({
      name: 'User Imported Profile',
      skills: ['TypeScript', 'React', 'GraphQL', 'Next.js', 'System Design', 'PostgreSQL'],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'TechCorp Solutions',
          date: '2024 - Present',
          achievements: ['Designed real-time telemetry systems reducing dashboard latency by 320ms.', 'Mentored 4 junior engineers on functional patterns.']
        }
      ]
    });
  }

  return `Parsed document: ${fileName}. Contains Senior Software Engineer experience, technical skill matrix with Next.js, and strong STAR impact metrics.`;
}
