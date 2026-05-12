# Week 5 Integration Checklist

## Component Files Created ✅

- [x] `src/domains/jobs/components/JobDetailPanel.tsx` - Main detail panel
- [x] `src/domains/jobs/components/tabs/OverviewTab.tsx` - Overview tab
- [x] `src/domains/jobs/components/tabs/TimelineTab.tsx` - Timeline tab
- [x] `src/domains/jobs/components/tabs/InterviewsTab.tsx` - Interviews tab
- [x] `src/domains/jobs/components/tabs/PrepTab.tsx` - Prep tab
- [x] `src/domains/jobs/components/tabs/OffersTab.tsx` - Offers tab

## Hook Files Created ✅

- [x] `src/domains/jobs/hooks/useJob.ts` - Fetch single job
- [x] `src/domains/jobs/hooks/useJobActivities.ts` - Fetch activities timeline
- [x] `src/domains/jobs/hooks/useInterviews.ts` - Fetch interviews
- [x] `src/domains/jobs/hooks/useInterviewPrep.ts` - Fetch prep data
- [x] `src/domains/jobs/hooks/useOffers.ts` - Fetch offers

## Export Indexes ✅

- [x] `src/domains/jobs/hooks/index.ts` - Export all hooks
- [x] `src/domains/jobs/components/index.ts` - Export all components
- [x] `src/domains/jobs/index.ts` - Updated domain index

## Integration Tasks (TODO)

### 1. Integrate with KanbanBoard
- [ ] Import JobDetailPanel in KanbanBoard component
- [ ] Add `selectedJobId` state to KanbanBoard
- [ ] Add onClick handler to JobCard to set selectedJobId
- [ ] Render JobDetailPanel with selected job ID

```typescript
import { useState } from 'react';
import { JobDetailPanel } from '@/domains/jobs';

export default function KanbanBoard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // ... existing code ...
  
  return (
    <div className="flex">
      {/* Kanban content */}
      {selectedJobId && (
        <JobDetailPanel
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}
```

### 2. API Endpoints - VERIFY EXISTING

- [ ] GET `/api/jobs/{jobId}` - Returns Job object
- [ ] GET `/api/jobs/{jobId}/activities` - Returns Activity[] 
- [ ] GET `/api/interviews?jobId={jobId}` - Returns Interview[]
- [ ] GET `/api/interview-prep/{jobId}` - Returns PrepData
- [ ] GET `/api/offers?jobId={jobId}` - Returns Offer[]

### 3. Create Missing API Mutations

- [ ] POST `/api/interviews` - Create interview
- [ ] DELETE `/api/interviews/{interviewId}` - Delete interview
- [ ] POST `/api/offers` - Create offer
- [ ] DELETE `/api/offers/{offerId}` - Delete offer
- [ ] PATCH `/api/jobs/{jobId}` - Update job notes

### 4. Implement Mutation Handlers

In **InterviewsTab.tsx**, implement:
```typescript
const { mutate: createInterview } = useMutation({
  mutationFn: (data: any) => axiosClient.post('/api/interviews', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
});

const { mutate: deleteInterview } = useMutation({
  mutationFn: (id: string) => axiosClient.delete(`/api/interviews/${id}`),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
});
```

In **OffersTab.tsx**, implement:
```typescript
const { mutate: createOffer } = useMutation({
  mutationFn: (data: any) => axiosClient.post('/api/offers', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
});

const { mutate: deleteOffer } = useMutation({
  mutationFn: (id: string) => axiosClient.delete(`/api/offers/${id}`),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
});
```

In **OverviewTab.tsx**, implement:
```typescript
const { mutate: updateNotes } = useMutation({
  mutationFn: (notes: string) => axiosClient.patch(`/api/jobs/${job.id}`, { notes }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job'] }),
});
```

### 5. Add E2E Tests

- [ ] Test opening JobDetailPanel from KanbanBoard
- [ ] Test switching between tabs
- [ ] Test scheduling interview and seeing it in timeline
- [ ] Test logging offer and seeing total compensation calculated
- [ ] Test editing notes
- [ ] Test deleting interview
- [ ] Test deleting offer

Add to `cypress/e2e/job-detail-panel.cy.ts`:
```typescript
describe('JobDetailPanel', () => {
  it('opens detail panel when clicking a job card', () => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="detail-panel-header"]').should('be.visible');
  });

  it('switches between tabs', () => {
    // Open detail panel
    cy.get('[data-testid="detail-panel-header"]').should('be.visible');
    
    // Click timeline tab
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('be.visible');
    
    // Click interviews tab
    cy.get('[data-testid="tab-interviews"]').click();
    cy.get('[data-testid="interviews-content"]').should('be.visible');
  });

  it('schedules interview and shows in timeline', () => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-interviews"]').click();
    
    // Schedule interview
    cy.get('[data-testid="schedule-btn"]').click();
    cy.get('select[name="type"]').select('technical');
    cy.get('input[name="date"]').type('2025-06-15');
    cy.get('input[name="time"]').type('14:00');
    cy.get('input[name="interviewer"]').type('John Doe');
    cy.get('[data-testid="schedule-submit"]').click();
    
    // Verify in timeline
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="activity-interview-scheduled"]').should('exist');
  });
});
```

### 6. Update Data Attributes for Testing

Add `data-testid` attributes to components:
- JobDetailPanel: `data-testid="detail-panel"`, `data-testid="detail-panel-header"`
- Tabs: `data-testid="tab-{name}"`, `data-testid="{name}-content"`
- Forms: `data-testid="schedule-btn"`, `data-testid="schedule-submit"`
- Timeline: `data-testid="activity-{type}"`

### 7. Performance Optimization (Future)

- [ ] Lazy load tab content components
- [ ] Virtualize long lists (timeline, questions)
- [ ] Implement prefetching on hover
- [ ] Add suspense boundaries for concurrent rendering

## Deployment Checklist

- [ ] All components tested locally
- [ ] E2E tests passing
- [ ] No console errors or warnings
- [ ] Lighthouse performance >90%
- [ ] Mobile responsive (test on mobile viewport)
- [ ] Keyboard navigation working
- [ ] Git commits pushed to main

## Documentation

- [x] WEEK5_IMPLEMENTATION.md - Detailed implementation guide
- [x] API endpoints documented
- [x] Integration examples provided
- [x] Component props documented in code
- [ ] TODO: Update main README.md with Week 5 changes
- [ ] TODO: Update CHANGELOG.md

## Status Summary

**Components**: 6 new tab/panel components ✅  
**Hooks**: 5 new data-fetching hooks ✅  
**Integration**: Ready for KanbanBoard integration ⏳  
**Testing**: Test structure provided ⏳  
**API**: Requires mutation implementation ⏳  

## Next Steps

1. Wire up JobDetailPanel to KanbanBoard (1-2 hours)
2. Implement mutation handlers in tabs (3-4 hours)
3. Add E2E tests (2-3 hours)
4. Performance testing and optimization (1-2 hours)
5. Mobile responsiveness verification (1 hour)

**Estimated remaining time for full Week 5 completion: 8-12 hours**

## Questions & Notes

- Interview prep generation requires AI backend - verify endpoint availability
- Offer comparison UI ready but comparison algorithm needs implementation
- Timeline activity icons can be customized based on design system
- Consider adding interview reminder notifications in Week 6
