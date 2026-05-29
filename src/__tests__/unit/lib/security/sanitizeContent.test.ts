/**
 * @jest-environment jsdom
 */
import { sanitizeText, sanitizeUrl, sanitizeHtml } from '@/lib/security/sanitizeContent'

describe('sanitizeContent', () => {
  describe('sanitizeText', () => {
    it('returns empty string for non-string inputs', () => {
      expect(sanitizeText(null)).toBe('')
      expect(sanitizeText(undefined)).toBe('')
      expect(sanitizeText(123)).toBe('')
      expect(sanitizeText({})).toBe('')
    })

    it('strips all HTML tags and leaves raw text', () => {
      const input = '<p>Hello <strong>world</strong><script>alert(1)</script>!</p>'
      expect(sanitizeText(input)).toBe('Hello world!')
    })

    it('returns exact same string if it has no HTML', () => {
      const input = 'Clean plain text with no tags.'
      expect(sanitizeText(input)).toBe(input)
    })
  })

  describe('sanitizeUrl', () => {
    it('returns null for non-string inputs or empty strings', () => {
      expect(sanitizeUrl(null)).toBe(null)
      expect(sanitizeUrl(undefined)).toBe(null)
      expect(sanitizeUrl('')).toBe(null)
      expect(sanitizeUrl('   ')).toBe(null)
    })

    it('returns valid absolute HTTP/HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path')
      expect(sanitizeUrl('http://test.org/api?foo=bar')).toBe('http://test.org/api?foo=bar')
    })

    it('returns valid mailto and tel links', () => {
      expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com')
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('resolves relative URLs to the window origin', () => {
      expect(sanitizeUrl('/jobs/123')).toBe('http://localhost/jobs/123')
    })

    it('returns null for unsafe protocols (e.g., javascript:, data:)', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe(null)
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe(null)
    })

    it('resolves raw safe strings relative to window.location.origin', () => {
      expect(sanitizeUrl('not-a-url-at-all')).toBe('http://localhost/not-a-url-at-all')
    })

    it('returns null for malformed URLs that throw during parsing', () => {
      expect(sanitizeUrl('http://[')).toBe(null)
    })
  })

  describe('sanitizeHtml', () => {
    it('keeps safe tags on client and strips unsafe tags', () => {
      const input = '<b>Hello</b> <script>alert(1)</script>'
      expect(sanitizeHtml(input)).toBe('<b>Hello</b> ')
    })

    it('strips all tags on server fallback', () => {
      (global as any).__MOCK_SERVER__ = true;
      try {
        const input = '<b>Hello</b> <script>alert(1)</script>'
        expect(sanitizeHtml(input)).toBe('Hello ')
      } finally {
        delete (global as any).__MOCK_SERVER__;
      }
    })
  })
})

