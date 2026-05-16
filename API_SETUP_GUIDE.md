# API Setup Guide

## What Was Created

### 1. Environment Configuration (`.env.local`)
- ✅ Created with development defaults
- **Note**: Update `NEXTAUTH_SECRET` with a secure value for production
- API base URL configured to `http://localhost:3000/api`

### 2. API Route Handlers
- ✅ `src/app/api/jobs/route.ts` - GET/POST endpoints
  - `GET /api/jobs` - List all jobs with optional filters
  - `POST /api/jobs` - Create a new job
  
- ✅ `src/app/api/jobs/[id]/route.ts` - Individual job operations
  - `GET /api/jobs/[id]` - Get single job
  - `PATCH /api/jobs/[id]` - Update job
  - `DELETE /api/jobs/[id]` - Delete job

## Next Steps to Get Running

### 1. **Database Setup** (Required)

PostgreSQL must be running with the `career_ops_dev` database:

```bash
# Create database (if not exists)
createdb -U career_user career_ops_dev

# Or using psql
psql -U postgres
CREATE DATABASE career_ops_dev OWNER career_user;
```

**⚠️ Important**: Update `.env.local` if your PostgreSQL credentials differ.

### 2. **Run Prisma Migrations**

This creates the database tables from the schema:

```bash
cd ~/CareerPropel
npm run db:push
```

Or if you want to create a migration:

```bash
npm run db:migrate -- --name init
```

### 3. **Install Dependencies** (if not done)

```bash
npm install
```

### 4. **Start Dev Server**

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Testing the API

### Create a Job (Form Submission)
1. Navigate to `http://localhost:3000`
2. Click "+ Add Job" button
3. Fill in the form:
   - Role: "Software Engineer"
   - Company: "Acme Corp"
   - Job URL: (optional)
   - Notes: (optional)
4. Click "Add Job"

### Verify API Response
Check browser DevTools → Network tab → Click the job creation request → Response tab

Expected successful response (201):
```json
{
  "id": "cj8...",
  "title": "Software Engineer",
  "company": "Acme Corp",
  "stage": "sourced",
  "candidateId": "cj7...",
  "url": null,
  "description": null,
  "createdAt": "2026-05-13T...",
  "updatedAt": "2026-05-13T...",
  "activities": []
}
```

## Current Behavior

- **Auto-candidate creation**: Jobs are automatically assigned to a default candidate if none exists
- **Job stages**: Default stage is "sourced" (can be updated via PATCH)
- **Real-time sync**: WebSocket connection will sync across browser tabs when implemented

## Debugging

If you get API errors:

1. **Check `.env.local` is created**
   ```bash
   ls -la ~/CareerPropel/.env.local
   ```

2. **Verify database connection**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio to inspect the database.

3. **Check server logs**
   - Watch the terminal running `npm run dev`
   - Look for error messages related to database or API routes

4. **Clear Next.js cache** (if routes aren't recognized)
   ```bash
   rm -rf .next
   npm run dev
   ```

## Architecture Notes

- **API Routes**: Use Next.js App Router (`src/app/api/*`)
- **Database**: Prisma ORM with PostgreSQL
- **Frontend**: React Query for data fetching via `useJobs()` hook
- **Auto-candidate**: Currently creates a default candidate to avoid foreign key errors

## Next Phase

After API works:
- Implement WebSocket for real-time updates
- Add authentication (NextAuth)
- Implement job matching/scoring
- Build interview prep workspace
- Add agent execution polling
