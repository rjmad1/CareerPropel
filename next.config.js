/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Playwright is a native-binary package used only in server-side scraping
  // routes. Mark it external so webpack never tries to bundle it.
  // Renamed from experimental.serverComponentsExternalPackages in Next.js 15+.
  serverExternalPackages: ['playwright', 'playwright-core'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // X-XSS-Protection REMOVED: deprecated header; known to introduce XSS in legacy
          // browsers when set to "block" mode. Replaced by Content-Security-Policy below.
          // Ref: https://owasp.org/www-project-secure-headers/
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content-Security-Policy: defence-in-depth against XSS and data injection.
          // 'unsafe-inline' is required by Next.js 14 for style injection and inline
          // hydration scripts; tighten to nonce-based CSP when upgrading to Next.js 15+.
          // Trusted external sources: Anthropic API, Google Fonts, and MUI CDN.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.anthropic.com https://api.lever.co https://boards.greenhouse.io wss:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
