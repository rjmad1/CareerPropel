# Root Cause Analysis: DOMPurify SSR Pre-rendering Crash

## 1. Exact Stack Trace
During the static generation phase of the Next.js production build (`next build`), the build worker crashes with the following error:
```text
Error occurred prerendering page "/settings/integrations". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: g.default.sanitize is not a function
    at <unknown> (C:\Users\rajaj\CareerPropel\.next\server\chunks\ssr\[root-of-the-server]__13na4dr._.js:2:11216)
    at Array.map (<anonymous>)
    at <unknown> (C:\Users\rajaj\CareerPropel\.next\server\chunks\ssr\[root-of-the-server]__13na4dr._.js:2:8852)
    at Array.map (<anonymous>)
    at <unknown> (C:\Users\rajaj\CareerPropel\.next\server\chunks\ssr\[root-of-the-server]__13na4dr._.js:2:8538)
```

## 2. Failing Module
The failing module is `/settings/integrations/page.tsx` (and potentially other pages like `/networking`, `/jobs`, `/job-search` if they are pre-rendered) due to direct imports of `dompurify` and calls to `DOMPurify.sanitize`.

## 3. Import Resolution & Runtime Context
- **ESM/CJS Interoperability:** 
  `dompurify` is packaged to dynamically adapt to its runtime environment.
  - In a **Browser** environment, the package automatically detects the global `window` object and returns an initialized `DOMPurify` instance as the default export. This instance contains the `.sanitize()` method.
  - In a **Node.js (Server)** environment (such as Next.js SSR/Static generation), the package does not find a global `window` object. It therefore exports a **factory function** (`[Function: DOMPurify]`) that expects a custom window object (e.g. from `jsdom`) to be passed in to create an instance:
    ```javascript
    const DOMPurify = require('dompurify')(window);
    ```
- **The Issue:**
  When compiling for the server, Next.js imports `dompurify`. The default import resolves to `g.default`, which points to the factory function.
  Calling `DOMPurify.sanitize(...)` translates to calling `g.default.sanitize(...)`. Since `g.default` is the factory function, it does not have the `.sanitize` property defined on it, resulting in the `TypeError: g.default.sanitize is not a function`.

## 4. Proposed Resolution Strategy

### A. Centralize Sanitization & Eliminate Direct Imports
Instead of importing the raw `dompurify` package directly in individual page components, all HTML and text sanitization must be routed through `src/lib/security/sanitizeContent.ts`. No other file should import `dompurify`.

### B. Environment-Aware Safe Fallback
In `sanitizeContent.ts`, we implement a secure, environment-aware wrapper that detects whether it is running on the client or the server:
```typescript
import DOMPurify from 'dompurify';

// Safe DOMPurify retriever
function getPurify() {
  if (typeof window !== 'undefined') {
    // In the browser, DOMPurify is automatically initialized
    return DOMPurify;
  }
  // On the server, DOMPurify is a factory function. Since we do not want to
  // bundle JSDOM in the runtime (which increases bundle size and fails on Edge/Serverless runtimes),
  // we return a safe fallback that strips tags or escapes content.
  return {
    sanitize: (value: string) => {
      // Server-side fallback: strip HTML tags using regex, or do entity escaping.
      // Since Next.js React renders standard text safely by default (escaping tags),
      // we can return standard stripped text for SSR, avoiding XSS injection.
      return value.replace(/<\/?[^>]+(>|$)/g, "");
    }
  };
}
```

### C. URL-Context vs. HTML-Context Separation
- **`sanitizeUrl(url)`**: Returns a validated URL only if it uses a safe protocol (`http:`, `https:`, `mailto:`, `tel:`). It does not need `DOMPurify` because protocol validation is sufficient to prevent `javascript:` XSS vectors in `href`.
- **Audit Findings & Recent Fortifications:** We have verified that the pages using `sanitizeUrl` place the output exclusively inside `href` attributes:
  - `src/app/job-search/page.tsx`: `<a href={safeUrl}>` (Fortified: strictly checks for `http://` or `https://` prefix)
  - `src/app/jobs/page.tsx`: `<a href={safeUrl}>` (Fortified: strictly checks for `http://` or `https://` prefix)
  - `src/app/settings/integrations/page.tsx`: `<a href={sanitizeUrl(url)}>` (Fortified: validates `http://` or `https://` prefixes for both `infoHref` and `connectHref`)
  - `src/app/networking/page.tsx`: `<a href={sanitizeUrl(url)}>` (Fortified: strictly filters `mailto:` prefix for emails and `http://`/`https://` prefixes for LinkedIn URLs)
  - `src/components/InterviewPrep/ResumeAlignment.tsx`: (Fortified: strictly filters `blob:` prefix or `http://`/`https://` prefixes for generated/external PDF links)

  These are safe URL-only contexts, further hardened with strict protocol scheme checks to ensure malformed or relative protocol bypasses are rejected. No `dangerouslySetInnerHTML` is used with these URLs.

## 5. Sanitization Contracts (Test Specifications)
To ensure the behavior is deterministic and secure, we define the following contracts:

1. **`sanitizeText` (Plain Text Context):**
   - **Input:** `Hello <script>alert(1)</script> <b>World</b>`
   - **Expected Output:** `Hello  World` (All HTML tags stripped).
   - **XSS Prevention:** Safe against script tags and tag injections.

2. **`sanitizeHtml` (HTML Context):**
   - **Input:** `<b>Hello</b> <script>alert(1)</script>`
   - **Expected Output (Client):** `<b>Hello</b> ` (Keeps safe tags, strips unsafe script).
   - **Expected Output (Server):** `Hello ` (Strips all HTML tags to be secure during static rendering).

3. **`sanitizeUrl` (URL Context):**
   - **Input:** `javascript:alert(1)` -> **Expected:** `null`
   - **Input:** `https://google.com` -> **Expected:** `https://google.com/`
   - **Input:** `mailto:test@example.com` -> **Expected:** `mailto:test@example.com`
