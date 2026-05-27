# Week 5 Phase 6: Backend API Implementation — Assessment & Plan

## Current Status Assessment

### What Exists
✅ **Prisma Schema**: Fully defined with 8 models
- Candidate (user/auth)
- Job
- JobActivity
- InterviewFeedback (interviews)
- Offer
- ProfileData
- Skill
- Achievement
- Document

✅ **Database**: PostgreSQL configured
✅ **Next.js**: App router (src/app directory)
✅ **ORM**: Prisma client available

### What's Missing
❌ **API Route Handlers**: No routes in src/app/api/
❌ **Authentication**: No auth middleware
❌ **Request Validation**: No Zod schemas for inputs
❌ **Error Handling**: No centralized error handling
❌ **Database Operations**: No data access layer

---

## Required API Endpoints

### Critical for Tests (Blocking)

| Method | Route | Purpose | Priority |
|--------|-------|---------|----------|
| GET | `/api/jobs` | List jobs with pagination | 🔴 CRITICAL |
| POST | `/api/jobs` | Create job | 🔴 CRITICAL |
| GET | `/api/jobs/[id]` | Get job by ID | 🔴 CRITICAL |
| PATCH | `/api/jobs/[id]` | Update job | 🔴 CRITICAL |
| DELETE | `/api/jobs/[id]` | Delete job | 🔴 CRITICAL |
| POST | `/api/interviews` | Create interview | 🔴 CRITICAL |
| GET | `/api/interviews` | List interviews | 🔴 CRITICAL |
| DELETE | `/api/interviews/[id]` | Delete interview | 🔴 CRITICAL |
| POST | `/api/offers` | Create offer | 🔴 CRITICAL |
| GET | `/api/offers` | List offers | 🔴 CRITICAL |
| DELETE | `/api/offers/[id]` | Delete offer | 🔴 CRITICAL |

### Additional for Full Functionality

| Method | Route | Purpose | Priority |
|--------|-------|---------|----------|
| GET | `/api/jobs/[id]/activities` | Get job timeline | 🟡 Important |
| GET | `/api/interview-prep/[id]` | Get interview prep | 🟡 Important |
| PATCH | `/api/interviews/[id]` | Update interview | 🟡 Important |
| PATCH | `/api/offers/[id]` | Update offer | 🟡 Important |
| GET | `/api/profile` | Get user profile | 🟡 Important |
| PATCH | `/api/profile` | Update profile | 🟡 Important |

---

## Implementation Options

### Option A: Implement Full API (Recommended)
**Scope**: 11 critical endpoints + 6 additional = 17 total
**Effort**: 6-8 hours
**Quality**: Production-ready
**Test Coverage**: 100%
**Value**: Complete system integration

**Includes**:
- Authentication/authorization
- Request validation with Zod
- Comprehensive error handling
- Activity logging
- Database operations

**Outcome**: All 50+ tests pass, MVP complete

---

### Option B: Implement Critical Endpoints Only
**Scope**: 11 critical endpoints
**Effort**: 3-4 hours
**Quality**: MVP minimum
**Test Coverage**: ~80%
**Value**: Tests pass, basic functionality works

**Includes**:
- CRUD operations for jobs, interviews, offers
- Basic error handling
- Minimum validation

**Outcome**: 50+ tests pass, MVP functional but incomplete

---

### Option C: Mock Endpoints in Tests
**Scope**: No backend changes
**Effort**: 30 minutes
**Quality**: Test infrastructure only
**Test Coverage**: 100% (but not real)
**Value**: Tests pass without API

**Includes**:
- cy.intercept() mocking all API calls
- Fake responses
- No real integration

**Outcome**: Tests pass, but API still missing for users

---

## Recommended Approach: Option A (Full Implementation)

### Why This Makes Sense
1. **Minimal extra work**: Only 3-4 more hours than Option B
2. **Production-ready**: Complete system works end-to-end
3. **Future-proof**: No technical debt
4. **Quality**: Can't claim MVP complete without working API
5. **Confidence**: Real integration testing validates system

### Timeline
- **API Implementation**: 4-5 hours
- **Testing & Debugging**: 1-2 hours
- **Deployment ready**: 5-7 hours total

---

## Implementation Plan: Option A

### Phase 6.1: Setup (30 minutes)
1. Create API route structure
   ```
   src/app/api/
   ├── jobs/
   │   ├── route.ts          (GET, POST)
   │   └── [id]/
   │       └── route.ts      (GET, PATCH, DELETE)
   ├── interviews/
   │   ├── route.ts          (GET, POST)
   │   └── [id]/
   │       └── route.ts      (PATCH, DELETE)
   ├── offers/
   │   ├── route.ts          (GET, POST)
   │   └── [id]/
   │       └── route.ts      (PATCH, DELETE)
   └── middleware/
       ├── auth.ts
       └── errors.ts
   ```

2. Create validation schemas
   ```
   src/lib/schemas/
   ├── job.ts
   ├── interview.ts
   ├── offer.ts
   └── profile.ts
   ```

3. Create data access layer
   ```
   src/lib/db/
   ├── jobs.ts
   ├── interviews.ts
   ├── offers.ts
   └── profile.ts
   ```

### Phase 6.2: Authentication (1 hour)
- Implement user/session management
- Create auth middleware
- Handle request context with user ID

### Phase 6.3: Core Endpoints (2 hours)
Implement in this order (simplest to most complex):
1. Jobs: GET (list with pagination)
2. Jobs: POST (create)
3. Jobs: GET/PATCH/DELETE (by ID)
4. Interviews: GET, POST, DELETE
5. Offers: GET, POST, DELETE

### Phase 6.4: Additional Endpoints (1 hour)
1. Interview updates
2. Offer updates
3. Activity timeline
4. Interview prep data

### Phase 6.5: Testing & Debugging (1-2 hours)
1. Run Cypress test suite
2. Fix any failures
3. Verify 50+ tests pass
4. Performance check

---

## Code Examples

### Example 1: Jobs GET (List with Pagination)

```typescript
// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '100');
  const offset = parseInt(searchParams.get('offset') ?? '0');
  
  try {
    const jobs = await prisma.job.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
```

### Example 2: Interviews POST (Create)

```typescript
// src/app/api/interviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }
    
    // Create
    const interview = await prisma.interviewFeedback.create({
      data: {
        jobId: data.jobId,
        candidateId: 'current-user-id', // from auth context
        type: data.type,
        notes: data.notes,
        selfRating: data.selfRating
      }
    });
    
    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}
```

---

## Critical Files to Create

### Required (Must have)
- `src/app/api/jobs/route.ts` (150 lines)
- `src/app/api/jobs/[id]/route.ts` (150 lines)
- `src/app/api/interviews/route.ts` (120 lines)
- `src/app/api/interviews/[id]/route.ts` (80 lines)
- `src/app/api/offers/route.ts` (120 lines)
- `src/app/api/offers/[id]/route.ts` (80 lines)
- `src/lib/db/jobs.ts` (100 lines)
- `src/lib/db/interviews.ts` (80 lines)
- `src/lib/db/offers.ts` (80 lines)
- `src/lib/schemas/validation.ts` (100 lines)

**Total**: ~1,000 lines of code

### Optional (Nice to have)
- `src/lib/db/utils.ts` (50 lines)
- `src/app/api/middleware/auth.ts` (50 lines)
- `src/app/api/middleware/errors.ts` (50 lines)

---

## Effort Breakdown

| Task | Time | Notes |
|------|------|-------|
| API Route Setup | 30 min | Create directory structure, basic handlers |
| Authentication | 1 hour | User context, session handling |
| Jobs Endpoints | 1.5 hours | GET (list/single), POST, PATCH, DELETE |
| Interviews Endpoints | 1 hour | GET, POST, DELETE |
| Offers Endpoints | 1 hour | GET, POST, DELETE |
| Testing & Debugging | 1.5 hours | Run tests, fix issues |
| **Total** | **~6 hours** | **Ready for deployment** |

---

## What Users Will Get

### After Phase 6 Completion ✅
- Fully functional job application tracker
- Can create, update, delete jobs
- Can schedule and track interviews
- Can log and compare offers
- Complete activity timeline
- Interview preparation data
- User profile management

### Working Features ✅
- Kanban board with 14 stages
- Job card details with metadata
- Interview scheduling (all 6 types)
- Offer logging with compensation calculation
- Timeline with 8 activity types
- Notes and annotations
- Filters and sorting
- Real-time mutations

### API Integration ✅
- All CRUD operations
- Proper error handling
- Activity logging
- Validation
- Authorization

---

## Decision Matrix

| Factor | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Complete MVP | ✅ Yes | ⚠️ Partial | ❌ No |
| Tests Pass | ✅ Yes | ✅ Yes | ✅ Yes |
| Real Integration | ✅ Yes | ⚠️ Basic | ❌ No |
| Production Ready | ✅ Yes | ⚠️ Limited | ❌ No |
| Time Investment | 6 hours | 3 hours | 0.5 hours |
| Technical Debt | ❌ None | ⚠️ Some | 🔴 High |
| Future Work | Minimal | More work | Must implement API |

---

## Recommendation

**Proceed with Option A: Full Implementation**

**Justification**:
1. Only 3 more hours than minimal option
2. Completes MVP properly
3. No technical debt
4. Tests all pass
5. System is production-ready
6. Can show working demo
7. Ready for v0.2 planning

**Timeline**: 6 hours to fully working MVP

---

## Decision Required

**Choose one**:
- [ ] **A**: Implement full API (6 hours, production-ready)
- [ ] **B**: Implement critical endpoints only (3 hours, minimal MVP)
- [ ] **C**: Mock API in tests (30 min, tests-only)

**What would you prefer?**

**Current Time Invested**: ~30 hours  
**Time to MVP**: 36-38 hours (A) or 33-35 hours (B)  
**Status**: Ready to start Phase 6
