# Profile Intelligence System

## Overview

The Profile Intelligence System continuously ingests, parses, and analyzes user career data (resumes, cover letters, LinkedIn exports, notes) to maintain a comprehensive, normalized profile. It tracks completeness, identifies gaps, generates recommendations, and enables resume reuse across applications.

## System Components

### 1. Document Ingestion & Parsing

**Supported Formats:**
- PDF resumes and cover letters
- DOCX documents
- TXT plain text
- CSV skill matrices
- XLSX spreadsheets
- LinkedIn HTML exports
- Markdown notes

**Parsing Process:**

```
1. Upload document → Validate type and size (<10MB)
2. Extract raw text → OCR if PDF, parse structure
3. Parse content → Identify sections (experience, skills, education)
4. Extract entities → Skills, achievements, companies, dates
5. Normalize → Standardize skill names, dates, formats
6. Deduplicate → Merge similar entities across documents
7. Store → Create ProfileEntity records with confidence scores
8. Log → Create ExtractionLog with status and metrics
```

**Confidence Scoring:**
- Direct extraction (e.g., "5 years React") → 0.95
- Inferred from context (role includes common skill) → 0.75
- Fuzzy match (similar wording) → 0.60
- User-provided/manual → 1.0

### 2. Entity Extraction

**ProfileEntity Model:**

```prisma
model ProfileEntity {
  id               String
  candidateId      String
  type             String        // skill | achievement | experience | education | certification | language
  content          String        // The extracted text
  confidence       Float         // 0-1 extraction confidence
  source           String        // resume | cover_letter | linkedin | manual
  tags             String[]      // categorization tags
  relatedEntityIds String[]      // connections to other entities
  
  extractedAt      DateTime
  createdAt        DateTime
  updatedAt        DateTime
}
```

**Entity Types:**

| Type | Examples | Extraction Logic |
|------|----------|-------------------|
| **skill** | React, Python, Leadership | Noun phrases, role keywords |
| **achievement** | "Led 20% revenue growth" | Metric + context extraction |
| **experience** | "Senior Engineer at Google 3yr" | Company, role, duration parsing |
| **education** | "BS Computer Science, MIT" | School, degree, year parsing |
| **certification** | "AWS Solutions Architect" | Cert names, issuer, date |
| **language** | "Fluent Spanish" | Language names, proficiency |

**Extraction Example (Resume → Entities):**

```
Resume text:
"Senior Software Engineer at Google (2020-2023)
Led development of microservices platform, improving latency by 40%.
Skills: TypeScript, React, Node.js, AWS, PostgreSQL."

Extracted Entities:
1. type: "experience"
   content: "Senior Software Engineer at Google"
   confidence: 0.98
   tags: ["tech", "senior"]

2. type: "achievement"
   content: "Led development of microservices platform"
   confidence: 0.92
   tags: ["technical_leadership"]

3. type: "achievement"
   content: "Improved latency by 40%"
   confidence: 0.95
   tags: ["performance", "metrics"]

4. type: "skill"
   content: "TypeScript"
   confidence: 0.99
   tags: ["technical", "language"]

5-8. ... (other skills)
```

### 3. Completeness Scoring Algorithm

**8-Category Scoring System:**

```
totalScore = weighted average of 8 categories

Categories and Weights:
1. Personal Info (10%)        — Name, email, phone, location
2. Resume (15%)               — Current resume uploaded, up-to-date
3. Skills (20%)               — 15+ skills, proficiency levels
4. Experience (20%)           — Job history, years, companies
5. Education (10%)            — Degree, school, graduation date
6. Goals (10%)                — Career direction, preferences
7. Portfolio (10%)            — GitHub, projects, portfolio links
8. Certifications (5%)        — Relevant industry certifications
```

**Scoring Logic:**

```typescript
calculateCompletenessScore(profile: Profile): ProfileScore {
  const scores = {
    personalInfo: scorePersonalInfo(profile),      // 0-100
    resume: scoreResume(profile),                  // 0-100
    skills: scoreSkills(profile),                  // 0-100
    experience: scoreExperience(profile),          // 0-100
    education: scoreEducation(profile),            // 0-100
    goals: scoreGoals(profile),                    // 0-100
    portfolio: scorePortfolio(profile),            // 0-100
    certifications: scoreCertifications(profile),  // 0-100
  };
  
  const weights = {
    personalInfo: 0.10,
    resume: 0.15,
    skills: 0.20,
    experience: 0.20,
    education: 0.10,
    goals: 0.10,
    portfolio: 0.10,
    certifications: 0.05,
  };
  
  const totalScore = Object.entries(scores).reduce(
    (sum, [key, score]) => sum + (score * weights[key]),
    0
  );
  
  return {
    totalScore: Math.round(totalScore),
    breakdown: scores,
    completeness: totalScore / 100,
    recommendations: generateRecommendations(scores),
  };
}
```

**Category Scoring Details:**

**Personal Info (0-100):**
- Name: +20
- Email: +20
- Phone: +20
- Location: +20
- Photo: +20

**Resume (0-100):**
- Document uploaded: +30
- Updated in last 6mo: +40
- ATS-compatible format: +30

**Skills (0-100):**
- 5-9 skills: +25
- 10-14 skills: +50
- 15-20 skills: +80
- 20+ skills: +100
- With proficiency levels: +20 bonus

**Experience (0-100):**
- 1 year: +20
- 3 years: +50
- 5+ years: +80
- 5+ different companies: +20 bonus

**Education (0-100):**
- HS/GED: +30
- Bachelor's: +70
- Master's: +90
- PhD: +100

**Goals (0-100):**
- Career direction defined: +50
- Preferred role identified: +30
- Industry/company preferences: +20

**Portfolio (0-100):**
- LinkedIn profile: +30
- GitHub profile: +35
- Portfolio website: +35

**Certifications (0-100):**
- 1 relevant cert: +50
- 2+ relevant certs: +100

### 4. Profile Completeness Visualization

**Radial Progress Chart:**

```
        ┌─────────────────┐
        │                 │
        │   ███ 78%       │
        │  78/100         │
        │                 │
        └─────────────────┘

Breakdown (8 segments):
┌────────────────────────────────┐
│ Personal Info:  ▓▓▓▓▓ 95       │
│ Resume:         ▓▓▓▓░ 85       │
│ Skills:         ▓▓▓░░ 70       │
│ Experience:     ▓▓▓▓▓ 90       │
│ Education:      ▓▓░░░ 65       │
│ Goals:          ▓▓░░░ 45       │
│ Portfolio:      ▓░░░░ 30       │
│ Certifications: ▓░░░░ 35       │
└────────────────────────────────┘

Color Coding:
▓ = 75-100% (green) ✓
░ = 50-74% (yellow) ⚠
░ = <50% (red) ✗
```

### 5. Recommendation Generation

**Recommendation Types:**

| Priority | Impact | Time | Examples |
|----------|--------|------|----------|
| **High** | Major improvement | <2hr | Add LinkedIn profile, update resume |
| **Medium** | Measurable boost | 2-8hr | Add GitHub projects, certifications |
| **Low** | Nice-to-have | 8+hr | Add portfolio, polish bio |

**Example Recommendation:**

```json
{
  "id": "rec_001",
  "priority": "high",
  "category": "resume",
  "suggestion": "Update resume - last modified 8 months ago",
  "impact": "Fresh resume increases interview callbacks by 25%",
  "estimatedTime": 120,  // minutes
  "action": "Upload updated resume"
}
```

**Recommendation Algorithm:**

```typescript
generateRecommendations(scores: ScoreBreakdown): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Check each category for gaps
  if (scores.personalInfo < 100) {
    recommendations.push({
      priority: 'high',
      category: 'personal_info',
      suggestion: 'Complete your profile information',
      impact: 'Required for application forms and recruiter outreach',
      estimatedTime: 15,
    });
  }
  
  if (scores.resume < 80) {
    recommendations.push({
      priority: 'high',
      category: 'resume',
      suggestion: 'Update or create current resume',
      impact: 'First impression for 90% of applications',
      estimatedTime: 120,
    });
  }
  
  if (scores.skills < 70) {
    recommendations.push({
      priority: 'high',
      category: 'skills',
      suggestion: 'Add in-demand skills to profile (TypeScript, Python, AWS)',
      impact: 'Match score correlation +15-20 points',
      estimatedTime: 30,
    });
  }
  
  // Sort by priority and impact
  return recommendations.sort(byPriority);
}
```

### 6. Semantic Skill Representation

**SemanticSkill Model:**

```typescript
interface SemanticSkill {
  name: string;                    // "React"
  category: 'technical' | 'soft' | 'domain' | 'language';
  proficiency: 'beginner' | 'intermediate' | 'proficient' | 'expert';
  yearsOfExperience?: number;      // 5
  endorsements?: number;           // 12 (from LinkedIn)
  projects?: string[];             // ["project_id_1", "project_id_2"]
  lastUsed?: Date;                 // 2026-05-10
  marketDemand?: 'low' | 'medium' | 'high';
}
```

**Proficiency Mapping:**

```
User Input → Proficiency Level

"5 years React" → proficient (or expert if combined with achievements)
"Expert in Python" → expert
"Familiar with Docker" → intermediate
"Learning TypeScript" → beginner

Resume Keywords:
- "Led", "architected", "designed" + skill → expert
- "Developed", "implemented" + skill → proficient
- "Experience with", "used" + skill → intermediate
- "Knowledge of", "familiar" + skill → beginner
```

**Market Demand Tracking:**

```
Calculate from job postings:
- Track skill frequency in incoming jobs
- Compare to user's skill level
- Alert if demand >high but proficiency <proficient

Example:
System Design appears in 45% of target roles
User proficiency: beginner
Recommendation: "High-demand skill, consider learning"
```

### 7. Achievement & Metric Extraction

**Achievement Model:**

```typescript
interface Achievement {
  id: string;
  title: string;                   // "Led API redesign"
  description: string;
  metrics: {
    metric: string;                // "Response time improvement"
    value: number | string;        // "40%"
    unit: string;                  // "percent"
  }[];
  context: string;                 // "Google, 2022"
  impact: string;                  // "Enabled 10k+ users"
  sourceProject?: string;          // Resume/LinkedIn ID
  date: Date;
  relevantSkills: string[];        // ["backend", "performance"]
}
```

**Extraction Process:**

```
Resume text:
"Led API redesign, improving response time by 40% and enabling
 10k additional concurrent users. Mentored 3 junior engineers
 in microservices patterns."

Extracted Achievements:
1. title: "Led API redesign"
   metrics: [
     {metric: "Response time", value: 40, unit: "percent"},
     {metric: "Concurrent users", value: 10000, unit: "absolute"}
   ]
   skills: ["backend", "performance", "leadership"]

2. title: "Mentored 3 junior engineers"
   metrics: [
     {metric: "Engineers mentored", value: 3, unit: "count"}
   ]
   skills: ["leadership", "mentoring"]
```

### 8. Resume Fragment Cache

**ResumeFragment Model:**

```prisma
model ResumeFragment {
  id               String
  candidateId      String
  section          String      // experience | achievement | skill | project
  content          String      // The fragment text
  sourceDocument   String      // resume version ID
  jobRelevance     String[]    // [job_id_1, job_id_2, ...]
  
  createdAt        DateTime
  lastUsed         DateTime?
}
```

**Fragment Reuse:**

```
When tailoring resume for new job:
1. Fetch job requirements
2. Search ResumeFragment cache for matching sections
3. Get fragments with highest relevance scores
4. Include in tailored resume
5. Track jobRelevance (which jobs this fragment was used for)

Example:
Job: "Full-stack engineer at startup"
Matching fragments:
- "Experience leading small team projects" (relevance: 0.95)
- "End-to-end feature ownership" (relevance: 0.92)
- "AWS deployment experience" (relevance: 0.88)
```

### 9. Profile Knowledge Graph

**ProfileNode Model:**

```typescript
interface ProfileNode {
  id: string;
  type: 'skill' | 'achievement' | 'company' | 'project' | 'person';
  name: string;
  description?: string;
  connections: string[];         // node IDs this connects to
  confidence: number;            // 0-1
  metadata?: Record<string, any>;
}
```

**Example Knowledge Graph:**

```
Skills:
  React (0.99)
  ├─ JavaScript (0.95)
  ├─ TypeScript (0.92)
  ├─ State Management (0.88)
  └─ Testing (0.80)

Company:
  Google (0.98)
  ├─ Role: Software Engineer
  ├─ Duration: 3 years
  ├─ Skills: [React, TypeScript, GCP]
  └─ Achievements: [API redesign, mentorship]

Projects:
  Microservices Platform
  ├─ Uses: Node.js, PostgreSQL, Kubernetes
  ├─ Metric: 40% latency improvement
  └─ Team size: 5 engineers
```

**Uses:**
- Detect skill gaps (for recommendations)
- Find related achievements for interviews
- Improve resume tailoring (entity relationships)
- Career trajectory analysis

## Database Models

### ProfileEntity
```prisma
model ProfileEntity {
  id               String     @id @default(cuid())
  candidateId      String
  type             String     // skill | achievement | experience | education | certification | language
  content          String
  confidence       Float      @default(1.0)
  source           String     // resume | cover_letter | linkedin | manual
  tags             String[]
  relatedEntityIds String[]   @default([])
  
  extractedAt      DateTime   @default(now())
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  
  candidate        Candidate  @relation(fields: [candidateId], references: [id])
  
  @@index([candidateId])
  @@index([type])
}
```

### ExtractionLog
```prisma
model ExtractionLog {
  id           String     @id @default(cuid())
  candidateId  String
  documentType String     // resume | cover_letter | linkedin
  status       String     // success | partial | failed
  totalEntities Int
  confidence   Float      // average
  errors       String?
  duration     Int?       // milliseconds
  metadata     Json?
  
  createdAt    DateTime   @default(now())
  
  candidate    Candidate  @relation(fields: [candidateId], references: [id])
  
  @@index([candidateId])
}
```

### ProfileScore
```prisma
model ProfileScore {
  id                  String     @id @default(cuid())
  candidateId         String     @unique
  totalScore          Int        @default(0)
  personalInfoScore   Int        @default(0)
  resumeScore         Int        @default(0)
  skillsScore         Int        @default(0)
  experienceScore     Int        @default(0)
  educationScore      Int        @default(0)
  goalsScore          Int        @default(0)
  portfolioScore      Int        @default(0)
  completeness        Float      @default(0.0)
  recommendations     Json?      // array
  lastUpdated         DateTime   @updatedAt
  
  candidate           Candidate  @relation(fields: [candidateId], references: [id])
}
```

## API Service Layer

**Key Functions:**

```typescript
// Fetch complete profile with all entities and scores
getProfileSummary(candidateId: string): Promise<ProfileSummary>

// Get just the completeness scores
getProfileScore(candidateId: string): Promise<ProfileScore>

// Get entities with filtering
getProfileEntities(
  candidateId: string,
  filters: {type?: string, source?: string, minConfidence?: number}
): Promise<ProfileEntity[]>

// Create/update/delete entities
saveProfileEntity(entity: ProfileEntity): Promise<ProfileEntity>
deleteProfileEntity(entityId: string): Promise<void>

// Extract from document
extractFromDocument(documentId: string): Promise<ExtractionLog>

// Analyze for ATS optimization
analyzeResumeForATS(resumeId: string): Promise<ATSAnalysis>

// Generate AI narrative
generateCareerNarrative(candidateId: string): Promise<string>

// Calculate completeness
calculateCompletenessScore(candidateId: string): Promise<ProfileScore>

// Detect gaps
detectSkillGaps(targetJob: Job): Promise<string[]>
```

## UI Components

### ProfileCompleteness
- Radial progress chart with 8-segment breakdown
- Color-coded segments (red/yellow/green)
- Tooltip showing detailed scores
- Click to expand section for recommendations

### ProfileEditor
- Multi-tab interface (8 tabs per scoring categories)
- Form inputs for manual data entry
- Document upload area (drag/drop)
- Save/discard changes buttons
- Unsaved changes warning

### RecommendationPanel
- Sorted by priority (high → medium → low)
- Shows impact and estimated time
- Dismissal tracking
- "Quick win" callout
- Link to action (e.g., "Upload resume")

### SkillMatrix
- Grid view of skills
- Search and filter by category
- Sort by proficiency, demand, endorsements, years
- Shows market demand badges
- Edit/delete actions

### AchievementExtractor
- Achievement list with inline editing
- "Extract from Resume" button (AI-powered)
- Create new achievement form
- Metrics builder (dynamic fields)
- Shows: title, description, metrics, context, impact

## See Also

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System overview
- [Agent System](./AGENT_SYSTEM.md) — Profile extraction agents
- [API Design](../API_DESIGN.md) — Profile API endpoints
