'use client';

import DOMPurify from 'dompurify';

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

// Server-safe DOMPurify helper
function getPurify(): { sanitize: (value: string, options?: any) => string } {
  if (typeof window !== 'undefined') {
    return DOMPurify;
  }
  return {
    sanitize: (value: string) => value,
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

