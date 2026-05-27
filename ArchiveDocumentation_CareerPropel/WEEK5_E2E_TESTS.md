# Week 5: JobDetailPanel E2E Tests

## Test Suite: Job Detail Panel Workflows

### Test File Location
`cypress/e2e/job-detail-panel.cy.ts`

### Test Coverage

#### 1. Opening Detail Panel
```typescript
describe('JobDetailPanel - Opening', () => {
  it('opens detail panel when clicking a job card', () => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="detail-panel"]').should('be.visible');
    cy.get('[data-testid="detail-panel-header"]').should('contain', 'Software Engineer');
  });

  it('closes detail panel when clicking close button', () => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="detail-panel"]').should('be.visible');
    cy.get('button:has(svg[data-icon="x"])').click();
    cy.get('[data-testid="detail-panel"]').should('not.exist');
  });

  it('displays correct job information in header', () => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="detail-panel-header"]').within(() => {
      cy.get('h2').should('contain', 'Software Engineer');
      cy.get('p').should('contain', 'TechCorp');
      cy.get('[data-testid="match-score"]').should('contain', '%');
    });
  });
});
```

#### 2. Tab Navigation
```typescript
describe('JobDetailPanel - Tab Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="detail-panel"]').should('be.visible');
  });

  it('switches to Timeline tab', () => {
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('be.visible');
  });

  it('switches to Interviews tab', () => {
    cy.get('[data-testid="tab-interviews"]').click();
    cy.get('[data-testid="interviews-content"]').should('be.visible');
  });

  it('switches to Prep tab', () => {
    cy.get('[data-testid="tab-prep"]').click();
    cy.get('[data-testid="prep-content"]').should('be.visible');
  });

  it('switches to Offers tab', () => {
    cy.get('[data-testid="tab-offers"]').click();
    cy.get('[data-testid="offers-content"]').should('be.visible');
  });

  it('maintains tab state when switching', () => {
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('be.visible');
    cy.get('[data-testid="tab-overview"]').click();
    cy.get('[data-testid="overview-content"]').should('be.visible');
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('be.visible');
  });
});
```

#### 3. Interview Management
```typescript
describe('JobDetailPanel - Interview Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-interviews"]').click();
  });

  it('schedules a new interview', () => {
    cy.get('[data-testid="schedule-btn"]').click();
    
    // Fill form
    cy.get('select').select('technical');
    cy.get('input[type="date"]').type('2025-06-15');
    cy.get('input[type="time"]').type('14:00');
    cy.get('input[placeholder*="Interviewer"]').type('John Doe');
    cy.get('input[placeholder*="Location"]').type('Virtual');
    
    cy.get('[data-testid="schedule-submit"]').click();
    
    // Verify interview appears
    cy.get('[data-testid="interviews-content"]').should('contain', 'Technical Interview');
    cy.get('[data-testid="interviews-content"]').should('contain', 'John Doe');
  });

  it('shows upcoming and past interviews separately', () => {
    cy.get('[data-testid="interviews-content"]').within(() => {
      cy.contains('h3', 'Upcoming').should('be.visible');
      cy.contains('h3', 'Past').should('exist');
    });
  });

  it('deletes an interview with confirmation', () => {
    cy.get('[data-testid="interviews-content"]').within(() => {
      cy.get('button:has(svg[data-icon="trash"])').first().click();
    });
    
    cy.on('window:confirm', () => true); // Confirm deletion
    cy.get('[data-testid="interviews-content"]').should('not.contain', 'Previous Interview Type');
  });

  it('shows interview appears in timeline after creation', () => {
    // Schedule interview
    cy.get('[data-testid="schedule-btn"]').click();
    cy.get('select').select('behavioral');
    cy.get('input[type="date"]').type('2025-06-20');
    cy.get('input[type="time"]').type('10:00');
    cy.get('[data-testid="schedule-submit"]').click();
    
    // Check timeline
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('contain', 'Interview Scheduled');
  });
});
```

#### 4. Offer Management
```typescript
describe('JobDetailPanel - Offer Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-offers"]').click();
  });

  it('logs a new offer', () => {
    cy.get('[data-testid="add-offer-btn"]').click();
    
    // Fill form
    cy.get('input[placeholder*="Base Salary"]').type('150000');
    cy.get('input[placeholder*="Bonus"]').type('20');
    cy.get('input[placeholder*="Equity"]').type('0.25%');
    cy.get('input[type="date"]').type('2025-07-01');
    
    cy.get('[data-testid="log-offer-submit"]').click();
    
    // Verify offer appears
    cy.get('[data-testid="offers-content"]').should('contain', '$150,000');
    cy.get('[data-testid="offers-content"]').should('contain', '$180,000'); // 150k + 20%
  });

  it('calculates total compensation correctly', () => {
    cy.get('[data-testid="add-offer-btn"]').click();
    cy.get('input[placeholder*="Base Salary"]').type('100000');
    cy.get('input[placeholder*="Bonus"]').type('25');
    cy.get('input[type="date"]').type('2025-07-15');
    cy.get('[data-testid="log-offer-submit"]').click();
    
    // Total should be 125000 (100000 + 25%)
    cy.get('[data-testid="offers-content"]').should('contain', '$125,000');
  });

  it('deletes an offer with confirmation', () => {
    cy.get('[data-testid="offers-content"]').within(() => {
      cy.get('button:has(svg[data-icon="trash"])').first().click();
    });
    
    cy.on('window:confirm', () => true); // Confirm deletion
    cy.get('[data-testid="offers-content"]').should('not.contain', 'Pending');
  });

  it('shows offer appears in timeline after creation', () => {
    // Log offer
    cy.get('[data-testid="add-offer-btn"]').click();
    cy.get('input[placeholder*="Base Salary"]').type('120000');
    cy.get('input[type="date"]').type('2025-07-10');
    cy.get('[data-testid="log-offer-submit"]').click();
    
    // Check timeline
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="timeline-content"]').should('contain', 'Offered');
  });
});
```

#### 5. Notes Management
```typescript
describe('JobDetailPanel - Notes Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-overview"]').click();
  });

  it('edits and saves notes', () => {
    cy.get('button').contains('Edit').click();
    cy.get('textarea[placeholder*="notes"]').type('Great team, interested in this role');
    cy.get('button').contains('Save').click();
    
    // Verify save completed
    cy.get('button').contains('Edit').should('be.visible');
    cy.get('textarea').should('not.exist');
  });

  it('displays saved notes on reload', () => {
    cy.get('button').contains('Edit').click();
    cy.get('textarea[placeholder*="notes"]').type('Follow up next week');
    cy.get('button').contains('Save').click();
    
    // Reload
    cy.reload();
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-overview"]').click();
    cy.get('div').should('contain', 'Follow up next week');
  });

  it('shows loading state while saving', () => {
    cy.get('button').contains('Edit').click();
    cy.get('textarea[placeholder*="notes"]').type('New note');
    cy.get('button').contains('Save').click();
    
    // Button should show saving state briefly
    cy.get('button').contains('Saving...').should('be.visible');
  });
});
```

#### 6. Timeline Activity Display
```typescript
describe('JobDetailPanel - Timeline', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-timeline"]').click();
  });

  it('displays activity timeline', () => {
    cy.get('[data-testid="timeline-content"]').should('be.visible');
    cy.get('[data-testid="timeline-content"]').should('contain', 'Applied');
  });

  it('shows relative timestamps', () => {
    cy.get('[data-testid="timeline-content"]').should('contain.text', 'ago');
  });

  it('displays activity metadata', () => {
    cy.get('[data-testid="timeline-content"]').within(() => {
      cy.get('[data-testid*="activity-"]').should('have.length.greaterThan', 0);
    });
  });
});
```

### Test Data Requirements

Before running tests, ensure:
1. Test database has sample jobs with:
   - Basic job information (title, company, salary, etc.)
   - Existing activities in timeline
   - Some existing interviews
   - Some existing offers

2. Mock API responses for:
   - POST /api/interviews → returns interview with ID
   - DELETE /api/interviews/{id} → returns 200 OK
   - POST /api/offers → returns offer with ID
   - DELETE /api/offers/{id} → returns 200 OK
   - PATCH /api/jobs/{id} → returns updated job

### Running Tests

```bash
# Run all E2E tests
npm run e2e

# Run JobDetailPanel tests only
npm run e2e -- --spec "cypress/e2e/job-detail-panel.cy.ts"

# Run specific test
npm run e2e -- --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "schedules a new interview"

# Run headless (CI mode)
npm run e2e:headless
```

### Test Utilities

```typescript
// Common test helpers
const openDetailPanel = () => {
  cy.visit('/');
  cy.get('[data-testid="job-card"]').first().click();
  cy.get('[data-testid="detail-panel"]').should('be.visible');
};

const switchToTab = (tabName: string) => {
  cy.get(`[data-testid="tab-${tabName}"]`).click();
  cy.get(`[data-testid="${tabName}-content"]`).should('be.visible');
};

const scheduleInterview = (type: string, date: string, time: string) => {
  switchToTab('interviews');
  cy.get('[data-testid="schedule-btn"]').click();
  cy.get('select').select(type);
  cy.get('input[type="date"]').type(date);
  cy.get('input[type="time"]').type(time);
  cy.get('[data-testid="schedule-submit"]').click();
};
```

### Expected Coverage

- ✅ Panel opening/closing
- ✅ Tab navigation
- ✅ Interview creation and deletion
- ✅ Offer creation and deletion
- ✅ Notes editing and saving
- ✅ Timeline activity display
- ✅ Data persistence across reloads
- ✅ Loading states and confirmations
- ✅ Form validation
- ✅ Error handling

### Test Status

| Test Suite | Status | Notes |
|-----------|--------|-------|
| Opening Panel | ⏳ TODO | Ready to implement |
| Tab Navigation | ⏳ TODO | Ready to implement |
| Interview Management | ⏳ TODO | Requires API mocking |
| Offer Management | ⏳ TODO | Requires API mocking |
| Notes Management | ⏳ TODO | Requires API mocking |
| Timeline Display | ⏳ TODO | Ready to implement |

### Next Steps

1. Create Cypress fixtures for test data
2. Set up API mocking (cy.intercept)
3. Implement test helpers and utilities
4. Write full test suite
5. Integrate with CI/CD pipeline
6. Achieve >80% coverage on JobDetailPanel components

### Estimated Time

- Test setup: 1 hour
- Test implementation: 2-3 hours
- Test debugging and fixes: 1 hour
- **Total: 4-5 hours**

All infrastructure is ready. Tests can be implemented immediately.
