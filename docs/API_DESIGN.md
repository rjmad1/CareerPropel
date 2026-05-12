# Career-Ops: API Design & Endpoint Reference

## Base Configuration

- **Base URL**: `http://localhost:3000/api` (development)
- **Production Base URL**: `https://career-ops.vercel.app/api`
- **Authentication**: JWT token in `Authorization: Bearer <token>` header
- **Content-Type**: `application/json`
- **Rate Limit**: 100 requests/minute per user

## Authentication Endpoints

### POST /auth/login
Login with email/password or OAuth provider.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /auth/logout
Invalidate current session token.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Job Endpoints

### GET /jobs
List all jobs for candidate.

**Query Parameters:**
- `stage` (string, optional): Filter by stage (sourced, interested, applied, etc.)
- `search` (string, optional): Search job title/company
- `sort` (string, optional): Sort field (date, matchScore, stage)
- `page` (number, default: 1): Pagination page
- `limit` (number, default: 50): Results per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "job_123",
      "candidateId": "cand_456",
      "title": "Senior Software Engineer",
      "company": "TechCorp",
      "description": "...",
      "url": "https://techcorp.com/careers/swe",
      "stage": "interested",
      "matchScore": 87,
      "appliedAt": "2026-05-10T14:30:00Z",
      "createdAt": "2026-05-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "hasMore": true
  }
}
```

### POST /jobs
Create new job.

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "description": "We're looking for...",
  "url": "https://techcorp.com/careers/swe"
}
```

**Response (201):**
```json
{
  "id": "job_123",
  "candidateId": "cand_456",
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "stage": "sourced",
  "matchScore": 0,
  "createdAt": "2026-05-10T14:30:00Z"
}
```

### GET /jobs/:jobId
Get job details with all related data.

**Response (200):**
```json
{
  "id": "job_123",
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "description": "...",
  "stage": "interested",
  "matchScore": 87,
  "appliedAt": "2026-05-10T14:30:00Z",
  "activities": [
    {
      "id": "act_1",
      "action": "progressed",
      "timestamp": "2026-05-09T10:00:00Z"
    }
  ],
  "agentExecutions": [
    {
      "id": "exec_1",
      "agentType": "resume-tailor",
      "status": "completed"
    }
  ]
}
```

### PATCH /jobs/:jobId
Update job details.

**Request:**
```json
{
  "stage": "applied",
  "notes": "Great company, good alignment"
}
```

**Response (200):** Updated job object

### DELETE /jobs/:jobId
Archive/delete job.

**Response (204):** No content

## Agent Execution Endpoints

### GET /agent/executions
List agent executions for candidate.

**Query Parameters:**
- `status` (string): Filter by status (idle, running, completed, failed)
- `agentType` (string): Filter by agent type
- `jobId` (string, optional): Filter by associated job
- `page` (number): Pagination
- `limit` (number): Results per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "exec_123",
      "agentType": "resume-tailor",
      "status": "completed",
      "progress": 100,
      "startedAt": "2026-05-10T14:00:00Z",
      "completedAt": "2026-05-10T14:05:00Z",
      "duration": 300000,
      "tokenUsage": 1240,
      "currentTask": "Completed resume tailoring"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 45
  }
}
```

### GET /agent/execution/:executionId
Get detailed execution with tool calls and logs.

**Query Parameters:**
- `includeToolCalls` (boolean, default: true)
- `includeLogs` (boolean, default: true)

**Response (200):**
```json
{
  "id": "exec_123",
  "agentType": "resume-tailor",
  "status": "completed",
  "progress": 100,
  "duration": 300000,
  "tokenUsage": 1240,
  "toolCalls": [
    {
      "id": "tool_1",
      "toolName": "generate_resume",
      "status": "success",
      "input": { "jobId": "job_123" },
      "output": { "resume": "..." },
      "duration": 150000,
      "tokens": 620
    },
    {
      "id": "tool_2",
      "toolName": "validate_format",
      "status": "success",
      "duration": 2000,
      "tokens": 80
    }
  ],
  "logs": [
    {
      "id": "log_1",
      "level": "INFO",
      "message": "Starting resume tailoring",
      "timestamp": "2026-05-10T14:00:00Z"
    }
  ]
}
```

### GET /agent/execution/:executionId/logs
Get paginated logs for execution.

**Query Parameters:**
- `level` (string, optional): Filter by level (INFO, WARN, ERROR, DEBUG)
- `page` (number, default: 1)
- `limit` (number, default: 100)

**Response (200):**
```json
{
  "data": [
    {
      "id": "log_1",
      "level": "INFO",
      "message": "Starting resume tailoring",
      "data": {},
      "timestamp": "2026-05-10T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 15,
    "hasMore": false
  }
}
```

### PUT /agent/execution/:executionId
Update execution status (pause, resume, cancel).

**Request:**
```json
{
  "status": "paused"
}
```

**Valid Status Transitions:**
- running → paused
- paused → running
- running → failed (with cancellation)
- paused → failed (with cancellation)

**Response (200):** Updated execution object

### POST /agent/execution/:executionId/pause
Pause execution.

**Response (200):**
```json
{
  "id": "exec_123",
  "status": "paused",
  "message": "Execution paused"
}
```

### POST /agent/execution/:executionId/resume
Resume paused execution.

**Response (200):**
```json
{
  "id": "exec_123",
  "status": "running",
  "message": "Execution resumed"
}
```

### POST /agent/execution/:executionId/cancel
Cancel running execution.

**Response (200):**
```json
{
  "id": "exec_123",
  "status": "failed",
  "errorMessage": "Execution cancelled by user",
  "completedAt": "2026-05-10T14:05:30Z"
}
```

## Profile Endpoints

### GET /profile
Get complete profile summary.

**Response (200):**
```json
{
  "candidateId": "cand_456",
  "completenessScore": {
    "totalScore": 78,
    "personalInfoScore": 95,
    "resumeScore": 85,
    "skillsScore": 70,
    "experienceScore": 90,
    "educationScore": 65,
    "goalsScore": 45,
    "portfolioScore": 30,
    "completeness": 0.78
  },
  "topSkills": [
    {
      "name": "React",
      "category": "technical",
      "proficiency": "expert",
      "yearsOfExperience": 5,
      "endorsements": 12,
      "marketDemand": "high"
    }
  ],
  "recentAchievements": [
    {
      "id": "ach_1",
      "title": "Led API redesign",
      "description": "...",
      "metrics": [
        {
          "metric": "Response time improvement",
          "value": "40%",
          "unit": "percent"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "id": "rec_1",
      "priority": "high",
      "category": "skills",
      "suggestion": "Add TypeScript certification",
      "impact": "Highly relevant for modern roles",
      "estimatedTime": 480
    }
  ]
}
```

### PUT /profile
Update profile data.

**Request:**
```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  }
}
```

**Response (200):** Updated profile

### GET /profile/completeness
Get profile score and breakdown.

**Response (200):**
```json
{
  "id": "score_123",
  "totalScore": 78,
  "personalInfoScore": 95,
  "resumeScore": 85,
  "skillsScore": 70,
  "experienceScore": 90,
  "educationScore": 65,
  "goalsScore": 45,
  "portfolioScore": 30,
  "completeness": 0.78,
  "lastUpdated": "2026-05-10T10:00:00Z"
}
```

### GET /profile/entities
Get profile entities with filtering.

**Query Parameters:**
- `type` (string, optional): Filter by type (skill, achievement, experience, etc.)
- `source` (string, optional): Filter by source (resume, linkedin, manual, etc.)
- `search` (string, optional): Search by content
- `minConfidence` (number, optional): Filter by confidence threshold

**Response (200):**
```json
{
  "data": [
    {
      "id": "entity_1",
      "type": "skill",
      "content": "React.js",
      "confidence": 0.98,
      "source": "resume",
      "tags": ["frontend", "javascript"],
      "extractedAt": "2026-05-08T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

### POST /profile/entities
Create new profile entity.

**Request:**
```json
{
  "type": "skill",
  "content": "GraphQL",
  "confidence": 0.95,
  "source": "manual",
  "tags": ["backend", "api"]
}
```

**Response (201):** Created entity

### DELETE /profile/entities/:entityId
Delete profile entity.

**Response (204):** No content

### POST /profile/ats-check
Analyze resume for ATS compatibility.

**Request:**
```json
{
  "resumeId": "doc_123"
}
```

**Response (200):**
```json
{
  "score": 82,
  "suggestions": [
    {
      "issue": "Missing keywords",
      "recommendation": "Add 'Python' and 'AWS' to skills section",
      "impact": "high"
    },
    {
      "issue": "Formatting complexity",
      "recommendation": "Simplify resume formatting for better parsing",
      "impact": "medium"
    }
  ]
}
```

### POST /profile/narrative
Generate AI career narrative.

**Request:**
```json
{
  "includeAchievements": true,
  "includeFutureGoals": true
}
```

**Response (200):**
```json
{
  "narrative": "John is a seasoned software engineer with 8 years of experience building scalable web applications. Specializing in full-stack development with React and Node.js, John has led multiple successful projects..."
}
```

## Interview Prep Endpoints

### GET /interview-prep/:jobId
Get interview prep for job.

**Response (200):**
```json
{
  "id": "prep_123",
  "jobId": "job_456",
  "role": "Senior Software Engineer",
  "company": "TechCorp",
  "prepStatus": "ready",
  "confidenceScore": 0.85,
  "companyResearch": {
    "industry": "SaaS",
    "size": "500-1000 employees",
    "culture": "Fast-paced, customer-focused...",
    "technicalStack": ["TypeScript", "React", "Node.js", "PostgreSQL"],
    "recentNews": [...]
  },
  "roleBreakdown": {
    "seniority": "senior",
    "responsibilities": ["Lead API design", "Mentor junior engineers"],
    "requiredSkills": ["TypeScript", "System Design", "Leadership"],
    "preferredSkills": ["Kubernetes", "GraphQL"]
  },
  "starStories": [
    {
      "title": "Led successful microservices migration",
      "competency": "technical_leadership",
      "situation": "...",
      "task": "...",
      "action": "...",
      "result": "...",
      "metrics": "Reduced deployment time by 60%"
    }
  ],
  "technicalPrep": {
    "concepts": ["System Design", "Database Design", "API Architecture"],
    "suggestedResources": [...]
  }
}
```

### POST /interview-prep/:jobId
Generate interview prep for job.

**Request:**
```json
{
  "includeCompanyResearch": true,
  "includeStarStories": true,
  "includeTechnicalPrep": true
}
```

**Response (201):** Created interview prep

### PUT /interview-prep/:jobId
Update interview prep.

**Request:**
```json
{
  "starStories": [
    {
      "title": "Led API redesign",
      "competency": "problem_solving",
      ...
    }
  ]
}
```

**Response (200):** Updated prep

## Document Endpoints

### GET /documents
List all uploaded documents.

**Query Parameters:**
- `type` (string, optional): Filter by type (resume, cover_letter, etc.)
- `page` (number): Pagination

**Response (200):**
```json
{
  "data": [
    {
      "id": "doc_1",
      "name": "Resume_2026.pdf",
      "type": "pdf",
      "url": "https://storage.example.com/doc_1.pdf",
      "uploadedAt": "2026-05-08T10:00:00Z"
    }
  ]
}
```

### POST /documents/upload
Upload new document.

**Request:** multipart/form-data
- `file`: Document file (PDF, DOCX, TXT)
- `type`: Document type (resume, cover_letter, etc.)

**Response (201):** Created document with S3 URL

### POST /documents/:docId/parse
Parse document content.

**Response (200):**
```json
{
  "content": "John Doe...",
  "entities": [
    {
      "type": "skill",
      "content": "React",
      "confidence": 0.98
    }
  ]
}
```

## Analytics Endpoints

### GET /analytics/dashboard
Get dashboard metrics.

**Response (200):**
```json
{
  "totalJobs": 45,
  "jobsByStage": {
    "sourced": 12,
    "interested": 8,
    "applied": 15,
    "interviews": 8,
    "offers": 2
  },
  "applicationSuccessRate": 0.33,
  "averageTimeToInterview": 14,
  "interviewConversionRate": 0.28,
  "topSkillsInDemand": ["TypeScript", "React", "System Design"]
}
```

### GET /analytics/application-roi
Get application ROI metrics.

**Response (200):**
```json
{
  "totalApplications": 45,
  "totalInterviews": 12,
  "totalOffers": 2,
  "successRate": 0.044,
  "averageTimeInvested": 240,
  "bestPerformingCompanies": [...]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid job stage",
  "details": {
    "field": "stage",
    "value": "invalid_stage",
    "allowedValues": ["sourced", "interested", ...]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication token required"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "Access denied to this resource"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Job not found",
  "resourceId": "job_123"
}
```

### 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again after 60 seconds",
  "retryAfter": 60
}
```

### 500 Server Error
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "req_abc123"
}
```

## Pagination Standard

All list endpoints support pagination with:

**Query Parameters:**
- `page` (number, default: 1): Page number (1-indexed)
- `limit` (number, default: 50): Items per page (max: 200)
- `sort` (string, optional): Sort field and direction (e.g., `createdAt:desc`)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "totalPages": 3,
    "hasMore": true,
    "hasPrevious": false
  }
}
```

## Real-time Events (WebSocket)

Subscribe to live updates:

```typescript
// Agent status updates
event: 'agent:status'
data: {
  id: "exec_123",
  status: "running",
  progress: 45,
  currentTask: "Generating resume"
}

// Agent logs
event: 'agent:log'
data: {
  executionId: "exec_123",
  level: "INFO",
  message: "Processing job description"
}

// Job updates
event: 'job:updated'
data: {
  jobId: "job_123",
  stage: "applied",
  matchScore: 87
}

// Profile updates
event: 'profile:updated'
data: {
  score: 78,
  timestamp: "2026-05-10T14:30:00Z"
}
```

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture overview
- [Agent System](./architecture/AGENT_SYSTEM.md) — Agent execution details
