# Domain Ownership Map

This document lists the 7 functional domains located under `src/domains/` and details their folder structures and responsibilities.

---

## Functional Domains

### 1. `src/domains/networking/`
- **Responsibilities**: Controls external API requests, scraping, and social outreach generation.
- **Key Files**:
  - `workers/`: Background queue consumer workers.
  - `services/`: Outreach, followup, and discovery services.
  - `repositories/`: Database model repositories.

### 2. `src/domains/jobs/`
- **Responsibilities**: Manages job application stages, Kanban boards, and target listings.

### 3. `src/domains/profile/`
- **Responsibilities**: User resumes, skills matrices, profile completeness calculations.

### 4. `src/domains/interviews/`
- **Responsibilities**: Coordinates interview preparation content generation and practice logs.

### 5. `src/domains/documents/`
- **Responsibilities**: Handles user resumes, transcripts, cover letters, and document parsing exports.

### 6. `src/domains/agents/`
- **Responsibilities**: Domain-level wrapper for custom autonomous worker agents.

### 7. `src/domains/kanban/`
- **Responsibilities**: Backs the job pipeline dashboard board view.
