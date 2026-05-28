import 'server-only';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Production-grade server-side parser for uploaded documents
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf' || mimeType.endsWith('pdf')) {
    try {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      await parser.destroy();
      return data.text || '';
    } catch (err) {
      console.error('[server-parser] pdf-parse failed:', err);
      throw new Error(`Failed to parse PDF document bytes: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType.endsWith('docx')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (err) {
      console.error('[server-parser] mammoth failed:', err);
      throw new Error(`Failed to parse Word document bytes: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (mimeType === 'application/json' || mimeType.endsWith('json')) {
    try {
      const rawText = buffer.toString('utf8');
      const parsed = JSON.parse(rawText);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch (err) {
      console.error('[server-parser] JSON parse failed:', err);
      throw new Error(`Failed to parse structured JSON document: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Fallback: try raw text decoding
  try {
    return buffer.toString('utf8');
  } catch (err) {
    console.error('[server-parser] Raw text decoding failed:', err);
    throw new Error('Unsupported document format or unreadable text coding.');
  }
}
