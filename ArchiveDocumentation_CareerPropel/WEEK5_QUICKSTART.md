# Week 5 JobDetailPanel — Quick Start Guide

## What's New

Week 5 delivers a complete detail panel system for viewing job details across 5 tabs.

## Files Created (14 files)

### Components (6 files)
```
src/domains/jobs/components/
├── JobDetailPanel.tsx (main panel - 284 lines)
├── index.ts
└── tabs/
    ├── OverviewTab.tsx (165 lines)
    ├── TimelineTab.tsx (198 lines)
    ├── InterviewsTab.tsx (248 lines)
    ├── PrepTab.tsx (240 lines)
    └── OffersTab.tsx (222 lines)
```

### Hooks (5 files)
```
src/domains/jobs/hooks/
├── useJob.ts
├── useJobActivities.ts
├── useInterviews.ts
├── useInterviewPrep.ts
├── useOffers.ts
└── index.ts
```

### Documentation (3 files)
```
WEEK5_IMPLEMENTATION.md       (complete implementation guide)
WEEK5_INTEGRATION_CHECKLIST.md (step-by-step integration)
WEEK5_SUMMARY.md              (architecture overview)
```

## Quick Integration (5 minutes)

### Step 1: Import in KanbanBoard
```typescript
import { useState } from 'react';
import { JobDetailPanel } from '@/domains/jobs';
```

### Step 2: Add State
```typescript
const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
```

### Step 3: Add Click Handler to JobCard
```typescript
<JobCard
  job={job}
  onClick={() => setSelectedJobId(job.id)}
/>
```

### Step 4: Render Panel
```typescript
{selectedJobId && (
  <JobDetailPanel
    jobId={selectedJobId}
    onClose={() => setSelectedJobId(null)}
  />
)}
```

## Component Usage

### Basic Usage
```typescript
import { JobDetailPanel } from '@/domains/jobs';

<JobDetailPanel
  jobId="job-123"
  onClose={() => setSelectedJobId(null)}
/>
```

### With TypeScript
```typescript
import { JobDetailPanel } from '@/domains/jobs';
import type { Job } from '@/domains/jobs';

interface Props {
  job: Job;
}
```

## Hook Usage

### useJob - Fetch Job Details
```typescript
import { useJob } from '@/domains/jobs';

const { data: job, isLoading, error } = useJob(jobId);
```

### useJobActivities - Fetch Timeline
```typescript
import { useJobActivities } from '@/domains/jobs';

const { data: activities } = useJobActivities(jobId);
```

### useInterviews - Fetch Interviews
```typescript
import { useInterviews } from '@/domains/jobs';

const { data: interviews } = useInterviews(jobId);
```

### useInterviewPrep - Fetch Prep Content
```typescript
import { useInterviewPrep } from '@/domains/jobs';

const { data: prep } = useInterviewPrep(jobId);
```

### useOffers - Fetch Offers
```typescript
import { useOffers } from '@/domains/jobs';

const { data: offers } = useOffers(jobId);
```

## Features

### Overview Tab
- Job description
- Location, type, salary, applied date
- Recruiter info
- External links (job posting, company site)
- Editable notes

### Timeline Tab
- Activity timeline (8 activity types)
- Relative timestamps
- Metadata display
- Visual timeline with icons

### Interviews Tab
- Schedule new interviews
- Upcoming interviews list
- Past interviews list
- Interview details (type, date, time, interviewer)
- Delete interviews

### Prep Tab
- STAR stories (Situation, Task, Action, Result)
- Technical concepts and key points
- Company intelligence (mission, news, culture)
- Likely interview questions

### Offers Tab
- Log new offers
- Base salary, bonus %, equity, start date
- Total compensation calculation
- Status tracking (pending/accepted/rejected)
- Delete offers

## Styling

Everything uses Tailwind CSS:
- Fixed right-side panel (384px wide)
- Sticky header with z-index management
- Color-coded statuses (green/yellow/orange/red)
- Smooth transitions
- Mobile responsive

## Data Caching Strategy

| Hook | Stale Time | Cache Time | Why |
|------|-----------|-----------|-----|
| useJob | 5m | 10m | Relatively static |
| useJobActivities | 2m | 10m | Frequently updated |
| useInterviews | 2m | 10m | Frequently updated |
| useInterviewPrep | 10m | 30m | Expensive to generate |
| useOffers | 5m | 10m | Medium frequency |

## Testing

### E2E Test Example
```typescript
describe('JobDetailPanel', () => {
  it('opens detail panel when clicking job', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="detail-panel"]').should('be.visible');
  });

  it('switches tabs', () => {
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('be.visible');
  });
});
```

## API Endpoints Required

### Already Implemented (Verify)
- GET `/api/jobs/{jobId}`
- GET `/api/jobs/{jobId}/activities`
- GET `/api/interviews?jobId={jobId}`
- GET `/api/interview-prep/{jobId}`
- GET `/api/offers?jobId={jobId}`

### To Implement
- POST `/api/interviews`
- DELETE `/api/interviews/{id}`
- POST `/api/offers`
- DELETE `/api/offers/{id}`
- PATCH `/api/jobs/{jobId}` (for notes)

## Common Patterns

### Adding a Mutation
```typescript
const { mutate: createInterview } = useMutation({
  mutationFn: (data) => axiosClient.post('/api/interviews', data),
  onSuccess: () => queryClient.invalidateQueries(['interviews']),
});

// Usage
createInterview(formData);
```

### Error Handling
```typescript
const { data, isLoading, error } = useJob(jobId);

if (error) return <ErrorState message={error.message} />;
if (isLoading) return <LoadingSpinner />;
```

### Conditional Rendering
```typescript
{activeTab === 'overview' && <OverviewTab job={job} />}
{activeTab === 'timeline' && <TimelineTab jobId={jobId} />}
```

## Performance Tips

1. **Memoization**: Wrap expensive calculations in useMemo
2. **Lazy Loading**: Use React.lazy() for tabs (future)
3. **Virtualization**: Use react-window if timeline grows (future)
4. **Prefetching**: Prefetch data on job hover (future)

## Troubleshooting

### Panel Not Opening
- Check if selectedJobId state is being set
- Verify JobDetailPanel is imported correctly
- Check browser console for errors

### Data Not Loading
- Verify API endpoints are returning data
- Check React Query DevTools
- Check network tab for 404/500 errors

### Styling Issues
- Ensure Tailwind CSS is imported
- Check z-index conflicts with other components
- Verify mobile viewport width (384px panel)

## What's Not Done Yet

❌ Mutation handlers (create/delete interviews, offers)
❌ Optimistic updates
❌ WebSocket real-time updates
❌ Interview prep AI generation
❌ Notes persistence to backend
❌ Offer comparison algorithm

These will be in Week 6+ or can be added anytime.

## Next Steps

1. **Right Now (5 min)**: Copy the 4-step integration above into KanbanBoard
2. **Next (1 hour)**: Implement mutation handlers in tabs
3. **Then (2 hours)**: Add E2E tests
4. **Finally (1 hour)**: Test everything works

**Estimated time to full integration**: 4-6 hours

## Documentation Files

- **WEEK5_IMPLEMENTATION.md** - Detailed implementation guide
- **WEEK5_INTEGRATION_CHECKLIST.md** - Step-by-step checklist with examples
- **WEEK5_SUMMARY.md** - Architecture decisions and technical details
- **WEEK5_QUICKSTART.md** - This file (quick reference)

## Questions?

Check the documentation files above for:
- Component props and interfaces
- Hook signatures and options
- API endpoint specifications
- Testing strategies
- Troubleshooting guides

Enjoy your JobDetailPanel! 🚀
