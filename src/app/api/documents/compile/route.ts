import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { generateResumeHtml, compileHtmlToPdf } from '@/lib/document/compile';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  location: z.string().optional(),
  duration: z.string(),
  description: z.string(),
});

const CompileRequestSchema = z.object({
  fullName: z.string().min(1),
  headline: z.string().min(1),
  contact: z.string().min(1),
  summary: z.string().min(1),
  skills: z.string().min(1),
  experience: z.array(ExperienceSchema),
  certifications: z.string().optional(),
});

/**
 * POST /api/documents/compile
 * Compiles a structured, tailored resume into a high-fidelity downloadable PDF.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Session verification & authentication
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Request body parsing and Zod validation
    const body = await request.json();
    const validation = CompileRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        }, 
        { status: 400 }
      );
    }

    const resumeData = validation.data;

    // 3. Generate structured premium HTML
    const htmlContent = generateResumeHtml(resumeData);

    // 4. Compile HTML string to PDF binary via headless Chromium (Playwright)
    const pdfBuffer = await compileHtmlToPdf(htmlContent);

    // 5. Build clean, descriptive filename
    const sanitizedHeadline = resumeData.headline.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const filename = `Resume_${resumeData.fullName.replace(/\s+/g, '_')}_${sanitizedHeadline}.pdf`;

    // 6. Return response streaming the binary PDF buffer
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error: unknown) {
    console.error('POST /api/documents/compile error:', error);
    return NextResponse.json(
      { error: 'Failed to compile PDF document', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
