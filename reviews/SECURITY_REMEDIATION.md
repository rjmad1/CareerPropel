# CareerPropel - Security Remediation Plan

## Priority 1: Critical (Must Fix Before MVP)

### 1.1 Input Validation with Zod
**Status**: TODO
**Impact**: Prevents invalid data, injection attacks
**Scope**: All API endpoints

**Implementation**:
- Create `src/lib/validations/job.ts` with Zod schemas
- Create `src/lib/validations/auth.ts` for auth payloads
- Add middleware to validate request bodies
- Return 400 Bad Request for validation failures

**Files to Create**:
```
src/lib/validations/
├── job.ts
├── auth.ts
└── common.ts (shared validators)
```

### 1.2 API Authentication
**Status**: TODO
**Impact**: Prevents unauthorized access
**Scope**: All protected endpoints

**Implementation**:
- Create middleware: `src/lib/middleware/auth.ts`
- Integrate NextAuth session validation
- Attach user context to requests
- Return 401 Unauthorized if no session

**Protected Endpoints**:
- POST `/api/jobs` - Requires session
- PATCH `/api/jobs/[id]` - Requires session + ownership
- DELETE `/api/jobs/[id]` - Requires session + ownership
- POST `/api/jobs/*/interview-prep` - Requires session
- POST `/api/agents/*/execute` - Requires session

### 1.3 Error Handling & Normalization
**Status**: TODO
**Impact**: Prevents information disclosure
**Scope**: All API routes

**Implementation**:
- Create `src/lib/errors/ApiError.ts` class
- Standardize error responses
- Log internal errors (don't expose to client)
- Return generic messages for sensitive errors

**Error Response Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": { /* only in dev */ }
  }
}
```

### 1.4 Prompt Injection Protection
**Status**: TODO
**Impact**: Prevents LLM exploitation
**Scope**: Interview prep, agent execution

**Implementation**:
- Create `src/lib/safety/promptSanitizer.ts`
- Add prompt boundary markers
- Validate prompt length
- Escape special characters
- Create `src/lib/safety/contentFilter.ts` for user input

**Example**:
```typescript
const sanitized = sanitizePrompt(userInput, {
  maxLength: 2000,
  allowedPatterns: ['skills', 'experience', 'projects'],
})
```

---

## Priority 2: High (Before User Testing)

### 2.1 Rate Limiting
**Status**: TODO
**Impact**: Prevents abuse of expensive endpoints
**Scope**: LLM endpoints, agent execution

**Implementation**:
- Install: `npm install ratelimit-lib` (or Upstash)
- Create middleware: `src/lib/middleware/rateLimit.ts`
- Apply to endpoints:
  - `/api/jobs/*/interview-prep` - 5 req/min per user
  - `/api/agents/*/execute` - 2 req/min per user

### 2.2 WebSocket Authorization
**Status**: TODO
**Impact**: Prevents unauthorized real-time data access
**Scope**: Real-time job updates

**Implementation**:
- Validate NextAuth session in WebSocket handlers
- Check user owns resource before streaming
- Implement subscription permissions

---

## Priority 3: Medium (Before Production)

### 3.1 CORS & CSRF Protection
**Status**: TODO
**Impact**: Prevents cross-site attacks

**Implementation**:
- Configure CORS headers
- Add CSRF tokens to state-changing operations
- Validate origin

### 3.2 Audit Logging
**Status**: TODO
**Impact**: Tracks security-relevant events

**Implementation**:
- Log all auth attempts
- Log job modifications (who, what, when)
- Log agent execution

---

## Implementation Order

1. **Week 1**: Zod validation + error handling (highest ROI)
2. **Week 2**: Authentication middleware
3. **Week 3**: Prompt sanitization
4. **Week 4**: Rate limiting
5. **Week 5**: CORS/CSRF, audit logging

---

## Testing Strategy

- [ ] Unit tests for validators
- [ ] Integration tests for auth middleware
- [ ] Prompt injection test cases
- [ ] Load tests for rate limiting
- [ ] OWASP Top 10 security checklist

---

## Reference Files

- OWASP API Security: https://owasp.org/www-project-api-security/
- NextAuth Security: https://next-auth.js.org/getting-started/example
- Zod Documentation: https://zod.dev
