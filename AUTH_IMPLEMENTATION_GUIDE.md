# Authentication Implementation Guide

## Current Status: ✅ Complete (Framework) | 🔄 Requires NextAuth Setup

---

## Overview

All API endpoints now have **authentication and authorization** checks in place. The framework is ready, but requires NextAuth configuration to function.

---

## 🔐 Protected Endpoints

### Jobs API

#### `GET /api/jobs` - List User's Jobs
**Authentication**: ✅ REQUIRED
**Authorization**: Returns only jobs for authenticated user
**Status Code**: 
- 200 OK - Success
- 401 Unauthorized - Not logged in
- 500 Error - Database issue

```bash
# Request requires valid NextAuth session
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/jobs
```

---

#### `POST /api/jobs` - Create Job
**Authentication**: ✅ REQUIRED
**Authorization**: Job created under authenticated user's profile
**Validation**: ✅ Zod schema enforced
**Status Code**:
- 201 Created - Success
- 400 Bad Request - Invalid input
- 401 Unauthorized - Not logged in
- 500 Error - Database issue

```bash
# Only authenticated users can create jobs
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Software Engineer",
    "company": "Acme Corp",
    "url": "https://job.example.com",
    "notes": "Interesting opportunity"
  }'
```

---

#### `GET /api/jobs/[id]` - Get Job Details
**Authentication**: ✅ REQUIRED
**Authorization**: ✅ REQUIRED - User must own the job
**Status Code**:
- 200 OK - Success
- 401 Unauthorized - Not logged in
- 403 Forbidden - Doesn't own job
- 404 Not Found - Job doesn't exist

```bash
# User can only view their own jobs
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/jobs/cj8d4h2k9s
```

---

#### `PATCH /api/jobs/[id]` - Update Job
**Authentication**: ✅ REQUIRED
**Authorization**: ✅ REQUIRED - User must own the job
**Validation**: ✅ Zod schema enforced (partial)
**Status Code**:
- 200 OK - Success
- 400 Bad Request - Invalid input
- 401 Unauthorized - Not logged in
- 403 Forbidden - Doesn't own job
- 404 Not Found - Job doesn't exist

```bash
# User can only update their own jobs
curl -X PATCH http://localhost:3000/api/jobs/cj8d4h2k9s \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "stage": "applied",
    "notes": "Updated notes"
  }'
```

---

#### `DELETE /api/jobs/[id]` - Delete Job
**Authentication**: ✅ REQUIRED
**Authorization**: ✅ REQUIRED - User must own the job
**Status Code**:
- 200 OK - Success
- 401 Unauthorized - Not logged in
- 403 Forbidden - Doesn't own job
- 404 Not Found - Job doesn't exist

```bash
# User can only delete their own jobs
curl -X DELETE http://localhost:3000/api/jobs/cj8d4h2k9s \
  -H "Cookie: next-auth.session-token=..."
```

---

## 🔄 Authentication Flow

### Current Implementation

```
Request
  ↓
[Authentication Check]
  ├─ No session → 401 Unauthorized
  └─ Valid session → Continue
  ↓
[Validation Check] (for POST/PATCH)
  ├─ Invalid input → 400 Bad Request
  └─ Valid input → Continue
  ↓
[Authorization Check] (for GET/PATCH/DELETE)
  ├─ Not resource owner → 403 Forbidden
  └─ Resource owner → Continue
  ↓
[Database Operation]
  ├─ Success → 200/201/204
  └─ Error → 500 Internal Error
```

---

## 📊 Security Matrix

| Endpoint | Auth | Authz | Validation | Sanitization |
|----------|------|-------|------------|--------------|
| GET /api/jobs | ✅ | ✅ (user filter) | ✅ (params) | ✅ |
| POST /api/jobs | ✅ | N/A | ✅ (body) | ✅ |
| GET /api/jobs/[id] | ✅ | ✅ (ownership) | ✅ (ID) | N/A |
| PATCH /api/jobs/[id] | ✅ | ✅ (ownership) | ✅ (body) | ✅ |
| DELETE /api/jobs/[id] | ✅ | ✅ (ownership) | ✅ (ID) | N/A |

---

## 🔧 NextAuth Setup (Required to Enable Auth)

### What's Needed

1. **NextAuth Configuration** - Add to project
2. **Session Provider** - Wrap app with SessionProvider
3. **Auth Route Handler** - `/api/auth/[...nextauth]`
4. **Environment Variables** - NEXTAUTH_SECRET, NEXTAUTH_URL

### Implementation Steps

1. **Install NextAuth**:
   ```bash
   npm install next-auth
   ```

2. **Create auth config** - `src/lib/auth.ts`:
   ```typescript
   import NextAuth from "next-auth"
   import CredentialsProvider from "next-auth/providers/credentials"

   export const { handlers, auth, signIn, signOut } = NextAuth({
     providers: [
       CredentialsProvider({
         credentials: {
           email: { label: "Email", type: "text" },
           password: { label: "Password", type: "password" }
         },
         async authorize(credentials) {
           // Validate credentials against database
           // Return user object if valid, null if invalid
         }
       })
     ],
     session: { strategy: "jwt" },
     pages: {
       signIn: "/login",
       error: "/auth/error"
     }
   })
   ```

3. **Create route handler** - `src/app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import { handlers } from "@/lib/auth"
   export const { GET, POST } = handlers
   ```

4. **Wrap app with SessionProvider** - `src/app/layout.tsx`:
   ```typescript
   import { SessionProvider } from "next-auth/react"
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <SessionProvider>
             {children}
           </SessionProvider>
         </body>
       </html>
     )
   }
   ```

5. **Add env variables** - `.env.local`:
   ```
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

---

## 💡 How Authentication Works

### 1. User Logs In
```
User → POST /api/auth/signin 
  → NextAuth validates credentials
  → Creates session/JWT token
  → Stores in HTTP-only cookie
```

### 2. User Makes Protected Request
```
User → GET /api/jobs 
  → Browser sends cookie with request
  → getAuthSession() validates token
  → Returns user context (email, id)
  → Handler uses to filter/authorize
```

### 3. Auth Fails
```
User (no session) → GET /api/jobs
  → getAuthSession() fails
  → Throws UNAUTHORIZED error
  → Returns 401 + error message
  → Frontend redirects to login
```

---

## 🧪 Testing Without NextAuth (Development)

### Current State
Auth checks are in place, but will fail without NextAuth setup because:
- `getAuthSession()` relies on NextAuth
- No session = 401 Unauthorized for all endpoints

### Options to Test

**Option A: Mock Auth** (Recommended for dev)
```typescript
// Temporarily mock for testing:
export async function getAuthContext() {
  return {
    userId: 'test-user-id',
    userEmail: 'test@example.com',
    session: { user: { email: 'test@example.com' } }
  }
}
```

**Option B: Skip Auth Temporarily**
Replace `await getAuthContext()` with:
```typescript
// const { userEmail } = await getAuthContext()
const userEmail = 'test@example.com'
```

**Option C: Set Up NextAuth First** (Proper approach)
Follow the NextAuth Setup section above.

---

## 🔑 API Error Responses

### Unauthorized (401)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource"
  }
}
```

### Forbidden (403)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

### Validation Error (400)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed: title: Job title is required"
  }
}
```

### Not Found (404)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested job was not found"
  }
}
```

---

## 📝 Important Notes

### User-Job Relationship
- Jobs are tied to **Candidate** model via `candidateId`
- Candidate has **email** field that matches NextAuth user email
- When user logs in, we find/create their Candidate profile
- All jobs retrieved/modified are filtered by Candidate email

### Database Considerations
```typescript
// Current flow:
1. User logs in → session created with email
2. GET /api/jobs → Find Candidate by email → Get their jobs
3. POST /api/jobs → Find/create Candidate by email → Create job
4. PATCH /api/jobs/[id] → Verify ownership by Candidate.email
```

### Future Improvements
- [ ] Link User table to Candidate (currently email-based)
- [ ] Add user roles (admin, recruiter, etc.)
- [ ] Implement team sharing of jobs
- [ ] Add audit logging for all auth events

---

## ✅ Checklist Before Going Live

- [ ] NextAuth installed and configured
- [ ] Auth route handler created
- [ ] SessionProvider wrapping app
- [ ] Environment variables set
- [ ] Test login flow works
- [ ] Test protected endpoints (should redirect to login)
- [ ] Test ownership verification (can't access others' jobs)
- [ ] Test error responses
- [ ] Remove any mock auth code

---

## 🚀 Quick Start (After DB Setup)

```bash
# 1. Run migrations
npm run db:push

# 2. Install NextAuth
npm install next-auth

# 3. Create auth config (follow NextAuth Setup above)

# 4. Start dev server
npm run dev

# 5. Test at http://localhost:3000
# Should redirect to login since auth is required
```

---

**Status**: Framework complete ✅ | Waiting for NextAuth setup 🔄
**Last Updated**: May 16, 2026
