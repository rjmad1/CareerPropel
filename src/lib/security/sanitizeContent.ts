'use client';

import DOMPurify from 'dompurify';

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

// Server-side fallback to strip all HTML tags and script elements securely
function stripHtmlOnServer(html: string): string {
  if (typeof html !== 'string') return '';
  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove all other HTML tags
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
  return cleaned;
}

// Server-safe DOMPurify helper
function getPurify(): { sanitize: (value: string, options?: any) => string } {
  if (typeof window !== 'undefined' && !(global as any).__MOCK_SERVER__) {
    return DOMPurify;
  }
  return {
    sanitize: (value: string) => stripHtmlOnServer(value),
  };
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return getPurify().sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeHtml(value: string, options?: any): string {
  return getPurify().sanitize(value, options);
}

export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(value, base);
    if (!SAFE_URL_PROTOCOLS.has(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

