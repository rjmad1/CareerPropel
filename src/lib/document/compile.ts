import { log } from '@/lib/logging/logger';

export interface ResumeExperience {
  role: string;
  company: string;
  location?: string;
  duration: string;
  description: string;
}

export interface ResumeCompileInput {
  fullName: string;
  headline: string;
  contact: string;
  summary: string;
  skills: string;
  experience: ResumeExperience[];
  certifications?: string;
}

/**
 * Parses inline markdown (specifically **bold** tags) to HTML.
 */
function formatMarkdownInline(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Formats a description text block into a clean, print-friendly HTML structure.
 * Converts markdown list bullets (- or *) into <ul>/<li> elements, and regular text to <p>.
 */
function formatDescription(desc: string): string {
  const lines = desc.split('\n');
  let inList = false;
  let html = '';

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('-') || line.startsWith('*')) {
      if (!inList) {
        html += '<ul style="margin-left: 16px; list-style-type: disc; margin-top: 4px; margin-bottom: 6px;">';
        inList = true;
      }
      const content = line.substring(1).trim();
      html += `<li style="margin-bottom: 3px; line-height: 1.4;">${formatMarkdownInline(content)}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p style="margin-bottom: 6px; text-align: justify; line-height: 1.4;">${formatMarkdownInline(line)}</p>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

/**
 * Builds a state-of-the-art styled A4 HTML template for printing the resume.
 */
export function generateResumeHtml(data: ResumeCompileInput): string {
  // Parse skills: split by comma if it's a list, otherwise trim
  const skillsList = data.skills
    ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.fullName} - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Lora', Georgia, serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #1e293b; /* Slate-800 */
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Inter', sans-serif;
    }

    .resume-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0.4in 0.5in;
    }

    header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
    }

    h1 {
      font-size: 24pt;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a; /* Slate-900 */
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .headline {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: #4f46e5; /* Indigo-600 */
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .contact-info {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      color: #64748b; /* Slate-500 */
      font-weight: 400;
      word-spacing: 1px;
    }

    section {
      margin-bottom: 18px;
    }

    h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #1e1b4b; /* Indigo-950 */
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #c7d2fe; /* Indigo-200 */
      padding-bottom: 3px;
      margin-bottom: 8px;
    }

    .summary-text {
      text-align: justify;
      color: #334155; /* Slate-700 */
      font-size: 10pt;
    }

    .skills-grid {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      color: #334155;
      font-weight: 500;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .skill-tag {
      background-color: #f8fafc; /* Slate-50 */
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 2px 6px;
      color: #334155;
    }

    .experience-item {
      margin-bottom: 12px;
    }

    .experience-item:last-child {
      margin-bottom: 0;
    }

    .experience-header {
      display: flex;
      justify-content: justify;
      align-items: baseline;
      margin-bottom: 1px;
    }

    .job-title-company {
      font-family: 'Inter', sans-serif;
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
    }

    .job-title-company span.company {
      font-weight: 500;
      color: #475569;
    }

    .duration-location {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      font-weight: 600;
      color: #4f46e5;
      margin-left: auto;
      text-align: right;
    }

    .job-metadata {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      font-style: italic;
      color: #64748b;
      margin-bottom: 4px;
    }

    .job-description {
      color: #334155;
      font-size: 9.5pt;
    }

    .certifications-text {
      color: #334155;
      font-size: 9.5pt;
    }

    @media print {
      body {
        background: none;
      }
      .resume-container {
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <header>
      <h1>${data.fullName}</h1>
      <div class="headline">${data.headline}</div>
      <div class="contact-info">${data.contact}</div>
    </header>

    <section>
      <h2>Professional Summary</h2>
      <p class="summary-text">${formatMarkdownInline(data.summary)}</p>
    </section>

    <section>
      <h2>Core Competencies</h2>
      <div class="skills-grid">
        ${skillsList.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
    </section>

    <section>
      <h2>Professional Experience</h2>
      ${data.experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <div class="job-title-company">
              ${exp.role} <span class="company">— ${exp.company}</span>
            </div>
            <div class="duration-location">
              ${exp.duration}
            </div>
          </div>
          ${exp.location ? `<div class="job-metadata">${exp.location}</div>` : ''}
          <div class="job-description">
            ${formatDescription(exp.description)}
          </div>
        </div>
      `).join('')}
    </section>

    ${data.certifications ? `
    <section>
      <h2>Certifications</h2>
      <div class="certifications-text">
        ${formatDescription(data.certifications)}
      </div>
    </section>
    ` : ''}
  </div>
</body>
</html>
  `;
}

/**
 * Launches a headless browser using Playwright to compile the HTML resume to a high-fidelity PDF buffer.
 */
export async function compileHtmlToPdf(html: string): Promise<Buffer> {
  log.info('[PDF Compiler] Starting HTML-to-PDF compilation via Playwright');
  
  // Dynamic import of playwright chromium
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 794, height: 1123 }, // standard A4 aspect ratio at 96 DPI
    });
    
    const page = await context.newPage();
    
    // Set direct HTML content
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    // Force emulation of print media stylesheets
    await page.emulateMedia({ media: 'print' });
    
    // Print to high fidelity PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.4in',
        bottom: '0.4in',
        left: '0.4in',
        right: '0.4in'
      },
      printBackground: true,
      displayHeaderFooter: false,
    });
    
    log.info({ sizeBytes: pdfBuffer.length }, '[PDF Compiler] Successfully compiled PDF buffer');
    return pdfBuffer;
  } catch (error) {
    log.error({ error }, '[PDF Compiler] Compilation failed');
    throw error;
  } finally {
    await browser.close();
  }
}
