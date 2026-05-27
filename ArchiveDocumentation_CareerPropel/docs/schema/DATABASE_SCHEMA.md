# Database Schema Design

## Overview

The Career Propel database uses PostgreSQL with Prisma ORM. The schema is organized into 4 layers:

1. **Core Models (Week 1-5)** — Candidate, Job, Skill, Achievement, Document, Interview Feedback, Offer
2. **Profile Intelligence (Week 6)** — ProfileEntity, ExtractionLog, ProfileScore
3. **Agent Execution (Week 6)** — AgentExecution, ToolCall, EventLog
4. **Interview Preparation (Week 6)** — InterviewPrep, StarStory, CompanyResearch, RoleBreakdown

## Core Models (Weeks 1-5)

### Candidate
Root entity representing a job seeker.

**Fields:**
- `id` (cuid) — Primary key
- `email` (unique, indexed) — User email for authentication
- `name` (string) — Full name
- `createdAt` (datetime) — Account creation timestamp
- `updatedAt` (datetime) — Last update timestamp

**Relations:**
- One-to-many: jobs, profileData, skills, achievements, documents, interviewFeedback, offers
- Week 6: profileEntities, extractionLogs, profileScore, agentExecutions, interviewPreps

**Indexes:**
```
PRIMARY KEY (id)
UNIQUE (email)
```

### Job
Represents a job opportunity from discovery to completion.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `title` (string) — Job title
- `company` (string) — Company name
- `description` (text) — Full job description
- `url` (string, optional) — Job posting URL
- `stage` (string, default: "sourced", indexed) — Application stage
- `appliedAt` (datetime, optional) — When candidate applied
- `createdAt` (datetime) — When job was added
- `updatedAt` (datetime) — Last modification

**Stages:**
```
sourced → interested → resume_tailoring → applied → recruiter_screen
→ hiring_manager → technical_interview → system_design → behavioral
→ final_round → offer → negotiation → rejected / archived
```

**Relations:**
- Many-to-one: Candidate
- One-to-many: activities (JobActivity), interviewFeedback, offers, agentExecutions, interviewPrep

**Indexes:**
```
INDEX (candidateId)
INDEX (stage)
INDEX (candidateId, stage) — for filtering by stage per candidate
```

### JobActivity
Tracks changes and actions on a job application.

**Fields:**
- `id` (cuid) — Primary key
- `jobId` (indexed) — Foreign key
- `action` (string) — Type of activity (applied, progressed, rejected, etc.)
- `metadata` (json, optional) — Extra data (recruiter name, salary, etc.)
- `createdAt` (datetime) — Activity timestamp

**Relations:**
- Many-to-one: Job

**Indexes:**
```
INDEX (jobId)
INDEX (jobId, createdAt) — for timeline queries
```

### ProfileData
Stores raw user profile documents and information.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `type` (string) — Document type (resume, cover_letter, linkedin_export, notes)
- `content` (json) — Structured or unstructured content
- `createdAt` (datetime) — Upload/creation date
- `updatedAt` (datetime) — Last update

**Relations:**
- Many-to-one: Candidate

**Indexes:**
```
INDEX (candidateId)
INDEX (candidateId, type) — for filtering by type
```

### Skill
Represents a skill in candidate's profile.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `name` (string) — Skill name (e.g., "React", "Leadership")
- `proficiency` (int, 1-5, default: 1) — Skill level
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- Many-to-one: Candidate

**Indexes:**
```
UNIQUE (candidateId, name) — prevents duplicate skills per candidate
INDEX (candidateId)
```

**Proficiency Levels:**
```
1 = Beginner
2 = Intermediate
3 = Proficient
4 = Advanced
5 = Expert
```

### Achievement
Documents quantifiable accomplishments and career highlights.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `title` (string) — Achievement title
- `description` (text) — Detailed description
- `metrics` (json, optional) — Quantifiable results array
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- Many-to-one: Candidate

**Indexes:**
```
INDEX (candidateId)
```

**Metrics Structure:**
```json
[
  {"metric": "Revenue increase", "value": 500000, "unit": "dollars"},
  {"metric": "Team growth", "value": 150, "unit": "percent"},
  {"metric": "Deployment time reduction", "value": 60, "unit": "percent"}
]
```

### Document
Stores uploaded files (resumes, cover letters, etc.).

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `name` (string) — File name
- `type` (string) — File type (pdf, docx, txt)
- `url` (string) — S3 or storage URL
- `uploadedAt` (datetime) — Upload timestamp

**Relations:**
- Many-to-one: Candidate

**Indexes:**
```
INDEX (candidateId)
INDEX (candidateId, type) — for filtering by document type
```

### InterviewFeedback
Stores feedback from completed interviews.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `jobId` (indexed) — Foreign key
- `type` (string) — Interview type (behavioral, technical, system_design, other)
- `selfRating` (int, 1-5, optional) — How candidate felt
- `notes` (text, optional) — Feedback notes
- `createdAt` (datetime)

**Relations:**
- Many-to-one: Candidate, Job

**Indexes:**
```
INDEX (candidateId)
INDEX (jobId)
INDEX (candidateId, jobId) — for candidate-job interviews
```

### Offer
Represents received job offers.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `jobId` (indexed) — Foreign key
- `salary` (int, optional) — Base salary in dollars
- `equity` (string, optional) — Equity grant (e.g., "0.5%")
- `bonus` (int, optional) — Bonus in dollars
- `startDate` (datetime, optional) — Start date
- `status` (string, default: "pending") — Offer status
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Offer Statuses:**
```
pending → accepted / rejected / negotiating
```

**Relations:**
- Many-to-one: Candidate, Job

**Indexes:**
```
INDEX (candidateId)
INDEX (jobId)
INDEX (status) — for filtering by offer status
```

## Profile Intelligence Models (Week 6)

### ProfileEntity
Extracted semantic entities from documents.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `type` (string, indexed) — Entity type (skill, achievement, experience, education, certification, language)
- `content` (string) — The extracted entity text
- `confidence` (float, default: 1.0) — Extraction confidence (0-1)
- `source` (string, indexed) — Source document (resume, cover_letter, linkedin, manual)
- `tags` (string array) — Categorization tags
- `relatedEntityIds` (string array) — IDs of related entities
- `extractedAt` (datetime) — When entity was extracted
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- Many-to-one: Candidate

**Indexes:**
```
INDEX (candidateId)
INDEX (type) — for filtering by entity type
INDEX (source) — for filtering by source
INDEX (candidateId, type) — combined query
```

**Confidence Tiers:**
```
0.95-1.0 = Extracted from document (high confidence)
0.75-0.94 = Inferred from context
0.50-0.74 = Fuzzy matched
1.0 = Manual entry
```

### ExtractionLog
Tracks document parsing and entity extraction history.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `documentType` (string) — Type parsed (resume, cover_letter, linkedin)
- `status` (string, indexed) — Extraction status (success, partial, failed)
- `totalEntities` (int) — Number of entities extracted
- `confidence` (float) — Average confidence score
- `errors` (text, optional) — Error messages
- `duration` (int, optional) — Processing time in milliseconds
- `metadata` (json, optional) — Document-specific metadata
- `createdAt` (datetime)

**Relations:**
- Many-to-one: Candidate

**Indexes:**
```
INDEX (candidateId)
INDEX (status) — for filtering by extraction status
INDEX (candidateId, createdAt) — for extraction history timeline
```

### ProfileScore
Completeness scoring and recommendations.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (string, unique) — Foreign key (one score per candidate)
- `totalScore` (int, 0-100) — Overall completeness
- `personalInfoScore` (int) — Personal info completeness
- `resumeScore` (int) — Resume completeness
- `skillsScore` (int) — Skills completeness
- `experienceScore` (int) — Experience completeness
- `educationScore` (int) — Education completeness
- `goalsScore` (int) — Career goals completeness
- `portfolioScore` (int) — Portfolio/links completeness
- `completeness` (float, 0-1) — As percentage
- `recommendations` (json, optional) — Array of recommendation objects
- `lastUpdated` (datetime) — When score was recalculated

**Relations:**
- One-to-one: Candidate

**Indexes:**
```
UNIQUE (candidateId) — one score per candidate
INDEX (totalScore) — for leaderboards/analytics
INDEX (lastUpdated) — for tracking stale scores
```

## Agent Execution Models (Week 6)

### AgentExecution
Represents a single agent task execution.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `jobId` (indexed, optional) — Associated job if applicable
- `agentType` (string, indexed) — Agent type (resume-tailor, job-match, etc.)
- `status` (string, indexed, default: "idle") — Execution status
- `startedAt` (datetime, optional) — When execution started
- `completedAt` (datetime, optional) — When execution completed
- `duration` (int, optional) — Total duration in milliseconds
- `currentTask` (string, optional) — What agent is currently doing
- `progress` (int, default: 0) — Progress percentage (0-100)
- `tokenUsage` (int, optional) — Total tokens consumed
- `errorMessage` (string, optional) — Error if failed
- `metadata` (json, optional) — Task-specific data
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- Many-to-one: Candidate, Job
- One-to-many: toolCalls, eventLogs

**Statuses:**
```
idle → running → completed / failed / paused
paused → running
```

**Indexes:**
```
INDEX (candidateId) — all executions for candidate
INDEX (jobId) — executions for specific job
INDEX (agentType) — filter by agent type
INDEX (status) — filter by status
INDEX (candidateId, agentType) — candidate's executions of specific agent
INDEX (candidateId, createdAt) — for execution timeline
```

### ToolCall
Individual tool invocation within an agent execution.

**Fields:**
- `id` (cuid) — Primary key
- `executionId` (indexed) — Foreign key
- `toolName` (string, indexed) — Name of tool called
- `status` (string, indexed, default: "pending") — Tool status
- `input` (json, optional) — Tool input parameters
- `output` (json, optional) — Tool output/result
- `error` (string, optional) — Error message if failed
- `startedAt` (datetime) — When tool started
- `completedAt` (datetime, optional) — When tool completed
- `duration` (int, optional) — Tool execution time in milliseconds
- `tokens` (int, optional) — Tokens used by this tool call
- `metadata` (json, optional) — Additional metadata

**Relations:**
- Many-to-one: AgentExecution

**Tool Statuses:**
```
pending → running → success / failed
```

**Indexes:**
```
INDEX (executionId) — all tools in execution
INDEX (toolName) — filter by tool type
INDEX (status) — filter by status
INDEX (executionId, toolName) — specific tools in execution
```

### EventLog
Log entries for agent execution events.

**Fields:**
- `id` (cuid) — Primary key
- `executionId` (indexed) — Foreign key
- `level` (string, indexed) — Log level (INFO, WARN, ERROR, DEBUG)
- `message` (string) — Log message
- `data` (json, optional) — Structured event data
- `timestamp` (datetime) — Event timestamp

**Relations:**
- Many-to-one: AgentExecution

**Log Levels:**
```
DEBUG = Detailed debugging info
INFO = General informational messages
WARN = Warning conditions (recoverable)
ERROR = Error conditions (may impact execution)
```

**Indexes:**
```
INDEX (executionId) — logs for execution
INDEX (level) — filter by severity
INDEX (timestamp) — for timeline queries
INDEX (executionId, timestamp) — execution timeline
```

**Retention Policy:**
```
Keep all logs for 30 days (GDPR compliance)
Archive to cold storage after 30 days
Delete after 90 days (configurable)
```

## Interview Preparation Models (Week 6)

### InterviewPrep
Main container for interview preparation materials.

**Fields:**
- `id` (cuid) — Primary key
- `candidateId` (indexed) — Foreign key
- `jobId` (unique, indexed) — Foreign key (one prep per job)
- `role` (string) — Job title
- `company` (string) — Company name
- `prepStatus` (string, default: "not_started") — Prep status
- `confidenceScore` (float, default: 0.0) — 0-1 confidence in prep quality
- `contentVersion` (int, default: 1) — Version number for updates
- `userModifications` (bool, default: false) — User has edited content
- `generatedAt` (datetime) — When prep was generated
- `expiresAt` (datetime, optional) — When prep becomes stale
- `lastUpdated` (datetime) — Last modification
- `technicalPrep` (json, optional) — Technical topics
- `systemDesignPrep` (json, optional) — System design concepts
- `resumeAlignment` (json, optional) — Resume alignment analysis
- `compensationGuide` (json, optional) — Salary discussion guide

**Relations:**
- Many-to-one: Candidate, Job
- One-to-many: starStories
- One-to-one: companyResearch, roleBreakdown

**Prep Statuses:**
```
not_started → generating → ready → stale
```

**Indexes:**
```
UNIQUE (jobId) — one prep per job
INDEX (candidateId) — candidate's interview preps
INDEX (prepStatus) — filter by status
INDEX (expiresAt) — for staleness checks
```

### StarStory
STAR (Situation, Task, Action, Result) behavioral interview story.

**Fields:**
- `id` (cuid) — Primary key
- `prepId` (indexed) — Foreign key
- `title` (string, optional) — Story title
- `summary` (string, optional) — Brief summary
- `competency` (string) — Primary competency (leadership, teamwork, etc.)
- `situation` (text) — Situation description
- `task` (text) — Task/challenge
- `action` (text) — Action taken
- `result` (text) — Result/outcome
- `metrics` (string, optional) — Quantifiable outcomes
- `sourceProject` (string, optional) — Resume project ID this comes from
- `relevanceScore` (float, default: 0.5) — 0-1 relevance to job
- `confidence` (int, optional) — 1-5 confidence rating
- `timeToTell` (int, optional) — Seconds to tell story
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- Many-to-one: InterviewPrep

**Competencies:**
```
leadership, teamwork, problem_solving, communication,
adaptability, conflict_resolution, initiative, technical_depth
```

**Indexes:**
```
INDEX (prepId) — stories for interview prep
INDEX (competency) — filter by competency
INDEX (relevanceScore DESC) — sort by relevance
```

### CompanyResearch
Company intelligence and analysis.

**Fields:**
- `id` (cuid) — Primary key
- `prepId` (unique) — Foreign key (one research per prep)
- `company` (string) — Company name
- `industry` (string, optional) — Industry
- `size` (string, optional) — Company size (startup, scale-up, mid-market, enterprise)
- `founded` (int, optional) — Year founded
- `culture` (text, optional) — Culture summary
- `recentNews` (json, optional) — Array of news items
- `technicalStack` (string array, optional) — Technologies used
- `competitorsAndContext` (text, optional) — Competitive landscape
- `fundingStatus` (string, optional) — Funding status
- `recentLayoffs` (string, optional) — Layoff information
- `linkedinUrl` (string, optional) — Company LinkedIn
- `crunchbaseUrl` (string, optional) — Crunchbase link
- `salaryMin` (int, optional) — Salary range min
- `salaryMax` (int, optional) — Salary range max
- `salaryCurrency` (string, default: "USD") — Currency
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- One-to-one: InterviewPrep

**Indexes:**
```
UNIQUE (prepId) — one research per prep
```

### RoleBreakdown
Job requirements and role analysis.

**Fields:**
- `id` (cuid) — Primary key
- `prepId` (unique) — Foreign key (one breakdown per prep)
- `roleTitle` (string) — Job title
- `seniority` (string, optional) — Level (junior, mid, senior, staff, principal)
- `reportingLine` (string, optional) — Reports to
- `responsibilities` (json, optional) — Array of responsibilities
- `requiredSkills` (json, optional) — Array of required skills
- `preferredSkills` (json, optional) — Array of preferred skills
- `experienceRequired` (string, optional) — Experience level
- `teamSize` (int, optional) — Team size
- `location` (string, optional) — Location/remote
- `travelPercentage` (int, optional) — Travel percentage
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Relations:**
- One-to-one: InterviewPrep

**Indexes:**
```
UNIQUE (prepId) — one breakdown per prep
```

## Query Patterns

### Timeline Queries
```sql
-- Get recent jobs
SELECT * FROM "Job" 
WHERE "candidateId" = ? 
ORDER BY "createdAt" DESC 
LIMIT 20;

-- Get execution timeline
SELECT * FROM "AgentExecution" 
WHERE "candidateId" = ? 
ORDER BY "createdAt" DESC 
LIMIT 50;
```

### Kanban Queries
```sql
-- Group jobs by stage
SELECT "stage", COUNT(*) as count 
FROM "Job" 
WHERE "candidateId" = ? 
GROUP BY "stage";

-- Get jobs for specific stage
SELECT * FROM "Job" 
WHERE "candidateId" = ? AND "stage" = ? 
ORDER BY "appliedAt" DESC;
```

### Profile Queries
```sql
-- Get all entities of type
SELECT * FROM "ProfileEntity" 
WHERE "candidateId" = ? AND "type" = ? 
ORDER BY "confidence" DESC;

-- Get execution history for agent type
SELECT * FROM "AgentExecution" 
WHERE "candidateId" = ? AND "agentType" = ? 
ORDER BY "createdAt" DESC;
```

## Performance Considerations

### Indexes Summary
- candidateId appears in every table (sharding key)
- (candidateId, type/stage/status) combos for filtering
- createdAt for timeline sorting
- Unique constraints prevent duplicates

### Query Optimization
- Use indexes for WHERE clauses
- Pagination (limit 50) for large result sets
- Batch updates with transaction blocks
- Archive old EventLog entries monthly

### Data Retention
```
Keep (indefinitely):
- Candidate, Job, Document, InterviewFeedback, Offer
- ProfileEntity, ExtractionLog, ProfileScore
- AgentExecution, ToolCall (last 6 months)
- InterviewPrep, StarStory, CompanyResearch, RoleBreakdown

Archive (after 30 days):
- EventLog to cold storage

Delete (after 90 days):
- EventLog permanently (GDPR compliance)
```

### Backup Strategy
- Daily incremental backups
- Weekly full backups
- 30-day retention
- Point-in-time recovery capability

## Migration Strategy

### Week 6 Initial Setup
```bash
npx prisma migrate dev --name initial_schema
npx prisma generate
```

### Future Migrations
```bash
# Add new field
npx prisma migrate dev --name add_new_field

# Safe: create → populate → default → make required
```

### Zero-Downtime Migrations
1. Add column with default (backward compatible)
2. Deploy code to read new column
3. Backfill data
4. Make column required
5. Remove old column in future migration

## See Also

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System overview
- [Agent System](./AGENT_SYSTEM.md) — Agent execution models
- [Profile Intelligence](./PROFILE_INTELLIGENCE.md) — Profile models
