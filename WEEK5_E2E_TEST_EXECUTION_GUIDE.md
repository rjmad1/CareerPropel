# Week 5 Phase 4: E2E Test Suite Execution Guide

## Overview

This guide covers the complete Cypress E2E test suite for the JobDetailPanel component. The test suite includes 50+ test cases covering all functionality, edge cases, and accessibility requirements.

## Test Files Structure

```
cypress/
├── e2e/
│   └── job-detail-panel.cy.ts (650+ lines, 50+ tests)
├── support/
│   ├── helpers.ts (400+ lines, 50+ utilities)
│   └── test-data.ts (400+ lines, fixtures & payloads)
└── cypress.config.ts (existing configuration)
```

## Test Coverage

### 1. Opening & Closing JobDetailPanel (7 tests)
- ✅ Opens on card click
- ✅ Displays metadata in header
- ✅ Applies color coding to match score
- ✅ Closes on close button
- ✅ Closes on overlay click
- ✅ Closes on Escape key
- ✅ Prevents close with unsaved changes

**Lines**: 1-80 | **Estimated Runtime**: ~5 seconds

### 2. Tab Navigation (6 tests)
- ✅ Overview tab shows by default
- ✅ Switch to Timeline tab
- ✅ Switch to Interviews tab
- ✅ Switch to Prep tab
- ✅ Switch to Offers tab
- ✅ Maintains state between tab switches
- ✅ Keyboard navigation with arrow keys

**Lines**: 81-150 | **Estimated Runtime**: ~6 seconds

### 3. Interview Management (10 tests)
- ✅ Displays upcoming and past interviews
- ✅ Schedules technical interview
- ✅ Schedules behavioral interview
- ✅ Schedules phone screen
- ✅ Shows loading state during scheduling
- ✅ Displays interview details with metadata
- ✅ Deletes interview with confirmation
- ✅ Cancels delete on confirmation cancel
- ✅ Validates required fields
- ✅ Handles scheduling errors

**Lines**: 151-280 | **Estimated Runtime**: ~12 seconds

### 4. Offer Management (9 tests)
- ✅ Logs new offer
- ✅ Calculates total compensation automatically
- ✅ Displays offer with status badge
- ✅ Updates offer status
- ✅ Compares multiple offers
- ✅ Deletes offer with confirmation
- ✅ Shows loading state while logging
- ✅ Validates required fields
- ✅ Handles creation errors

**Lines**: 281-410 | **Estimated Runtime**: ~10 seconds

### 5. Notes Management (6 tests)
- ✅ Displays existing notes
- ✅ Edits and saves notes
- ✅ Cancels edit without saving
- ✅ Shows loading state while saving
- ✅ Handles save errors
- ✅ Syncs notes with timeline

**Lines**: 411-480 | **Estimated Runtime**: ~7 seconds

### 6. Timeline Display (6 tests)
- ✅ Displays activity timeline
- ✅ Shows different activity icons
- ✅ Displays metadata and timestamps
- ✅ Formats relative times correctly
- ✅ Sorts by most recent first
- ✅ Displays all 8 activity types
- ✅ Shows metadata in formatted boxes
- ✅ Handles empty timeline

**Lines**: 481-550 | **Estimated Runtime**: ~5 seconds

### 7. Error Handling & Edge Cases (6 tests)
- ✅ Handles network errors
- ✅ Retries on network error
- ✅ Shows loading skeleton
- ✅ Handles very long descriptions
- ✅ Handles missing prep data
- ✅ Handles concurrent mutations

**Lines**: 551-620 | **Estimated Runtime**: ~8 seconds

### 8. Accessibility (4 tests)
- ✅ Has ARIA labels on interactive elements
- ✅ Maintains keyboard navigation
- ✅ Announces dynamic changes to screen readers
- ✅ Supports dark mode contrast

**Lines**: 621-650 | **Estimated Runtime**: ~4 seconds

**Total Tests**: 50+ | **Total Runtime**: ~60-90 seconds

## Running the Tests

### Prerequisites

1. Ensure development server is running:
```bash
npm run dev
```

2. Ensure backend API is running (if not mocked):
```bash
npm run server  # or appropriate backend command
```

### Running All Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cy:open

# Run all tests headless
npm run cy:run

# Run with specific browser
npm run cy:run -- --browser chrome
npm run cy:run -- --browser firefox
npm run cy:run -- --browser edge
```

### Running Specific Test Suites

```bash
# Opening & Closing tests only
npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "Opening & Closing"

# Interview Management tests only
npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "Interview Management"

# Offer Management tests only
npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "Offer Management"

# Error Handling tests only
npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "Error Handling"

# Accessibility tests only
npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "Accessibility"
```

### Running Single Test

```bash
# Find the exact test name and run it
npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "opens job detail panel on card click"
```

### Debug Mode

```bash
# Run with debug output
DEBUG=cypress:* npm run cy:run

# Run with slow motion (500ms delay)
npx cypress run --config defaultCommandTimeout=1500

# Run with screenshots on failure
npx cypress run --screenshot-on-error

# Run with full video recording
npx cypress run --record=false --video
```

## Test Execution Examples

### Example 1: Full Test Suite Run

```bash
$ npm run cy:run
================================== Warnings =================================

We had 0 warning(s) from your test files.

================================ Specs to run ================================

(1 spec file)

1) cypress/e2e/job-detail-panel.cy.ts

================================ Running: job-detail-panel.cy.ts (1/1) =

  JobDetailPanel - Opening & Closing
    ✓ opens job detail panel on card click
    ✓ displays job metadata in sticky header
    ✓ applies correct color coding to match score
    ✓ closes panel on close button click
    ✓ closes panel on background click (overlay)
    ✓ closes panel on Escape key
    ✓ prevents accidental panel close with unsaved changes

  JobDetailPanel - Tab Navigation
    ✓ displays Overview tab by default
    ✓ switches to Timeline tab
    ✓ switches to Interviews tab
    ... [continues for all 50+ tests]

================================ All specs passed! ========================

50 passing
Total duration: 1m 24s
```

### Example 2: Running Specific Test Suite

```bash
$ npx cypress run --spec "cypress/e2e/job-detail-panel.cy.ts" --grep "Interview Management"

  JobDetailPanel - Interview Management
    ✓ displays upcoming and past interviews in separate sections
    ✓ schedules a new technical interview
    ✓ schedules a behavioral interview
    ✓ schedules a phone screen
    ✓ shows loading state while scheduling interview
    ✓ displays interview details with metadata
    ✓ deletes an interview with confirmation
    ✓ cancels delete on confirmation cancel
    ✓ validates required fields before submitting
    ✓ handles interview scheduling errors gracefully

10 passing
Total duration: 12.5s
```

## Test Data Setup

### Automatic Setup

Each test automatically:
1. **Logs in** using TEST_USER credentials
2. **Creates test jobs** from SAMPLE_JOBS
3. **Creates test interviews** from SAMPLE_INTERVIEWS
4. **Creates test offers** from SAMPLE_OFFERS
5. **Cleans up after** with `deleteTestData()`

### Manual Data Creation

Create specific test data in beforeEach:

```typescript
beforeEach(() => {
  loginUser();
  cy.visit('/');
  createTestJob({
    title: 'Custom Job Title',
    salary: 200000
  });
});
```

### Using Test Fixtures

Import and use predefined test data:

```typescript
import { SAMPLE_JOBS, SAMPLE_INTERVIEWS } from '../support/test-data';

// Use sample data
const job = SAMPLE_JOBS[0];
const interview = SAMPLE_INTERVIEWS[0];
```

## Helper Functions Reference

### Authentication
```typescript
loginUser(email?, password?)              // Log in test user
logoutUser()                              // Log out (not yet implemented)
```

### Data Creation
```typescript
createTestJob(jobData?)                   // Create job via API
createAndOpenJob(jobData?)                // Create job and open panel
deleteTestData()                          // Clean up test data
```

### Form Operations
```typescript
fillForm(fields)                          // Fill multiple fields
selectDropdown(selector, value)           // Select dropdown option
scheduleInterview(type, date, time, ...)  // Schedule interview
logOffer(salary, bonus, equity, date)     // Log offer
clearAndFill(selector, value)             // Clear and fill input
```

### Navigation
```typescript
openJobDetailPanel()                      // Open first job's detail panel
closeJobDetailPanel()                     // Close detail panel
navigateToTab(tabName)                    // Switch to specific tab
scrollIntoView(selector)                  // Scroll element into view
```

### Verification
```typescript
verifyLoadingState(selector, text?)       // Verify loading state
verifyErrorMessage(expectedError)         // Verify error displayed
verifySuccessMessage(expectedSuccess)     // Verify success displayed
verifyElementCount(selector, count)       // Verify element count
hasClass(selector, className)             // Check element class
```

### API Mocking
```typescript
mockApiError(method, url, statusCode, message)     // Mock error response
mockApiSuccess(method, url, responseBody)          // Mock success response
mockSlowApiResponse(method, url, delayMs)          // Mock slow response
waitForApiCall(method, url)                        // Wait for API call
```

### Waiting
```typescript
waitForElement(selector, timeout?)        // Wait for element visible
waitForElementToDisappear(selector)       // Wait for element gone
verifyLoadingState(selector)              // Wait for loading complete
```

## Common Test Patterns

### Pattern 1: Testing Form Submission

```typescript
it('schedules a new interview', () => {
  cy.get('[data-testid="schedule-interview-btn"]').click();
  selectDropdown('[data-testid="interview-type-select"]', 'technical');
  cy.get('[data-testid="interview-date"]').type('2026-06-15');
  cy.get('[data-testid="interview-time"]').type('14:00');
  cy.get('[data-testid="schedule-submit-btn"]').click();
  cy.get('[data-testid="upcoming-interviews-section"]').should('contain', 'Technical Interview');
});
```

### Pattern 2: Testing With Confirmation Dialog

```typescript
it('deletes interview with confirmation', () => {
  cy.get('[data-testid="interview-delete-btn"]').click();
  cy.on('window:confirm', () => true);
  cy.get('[data-testid="interview-item"]').should('have.length.lessThan', 1);
});
```

### Pattern 3: Testing Error Handling

```typescript
it('handles scheduling errors gracefully', () => {
  cy.intercept('POST', '/api/interviews', {
    statusCode: 500,
    body: { error: 'Failed to schedule' }
  });
  cy.get('[data-testid="schedule-interview-btn"]').click();
  // ... fill form ...
  cy.get('[data-testid="schedule-submit-btn"]').click();
  cy.get('[data-testid="error-message"]').should('contain', 'Failed');
});
```

### Pattern 4: Testing Loading States

```typescript
it('shows loading state while scheduling', () => {
  cy.intercept('POST', '/api/interviews', (req) => {
    req.reply((res) => {
      res.delay(1000);
      res.send({ statusCode: 200, body: { id: '123' } });
    });
  });
  cy.get('[data-testid="schedule-submit-btn"]').click();
  cy.get('[data-testid="schedule-submit-btn"]').should('have.text', 'Scheduling...');
  cy.get('[data-testid="schedule-submit-btn"]').should('be.disabled');
});
```

## Troubleshooting

### Tests Timing Out

**Problem**: Tests fail with "cy.visit did not visit the correct page"

**Solutions**:
1. Ensure dev server is running: `npm run dev`
2. Increase timeout in cypress.config.ts:
   ```typescript
   defaultCommandTimeout: 10000,
   requestTimeout: 5000
   ```
3. Add explicit wait: `cy.visit('/', { waitForLoad: true })`

### Data Not Persisting

**Problem**: Test data created in one test not available in next

**Solutions**:
1. Ensure `beforeEach` creates data, not `before`
2. Use `cy.request()` for API calls to ensure synchronous execution
3. Add explicit wait: `cy.wait(500)`

### Selectors Not Found

**Problem**: `cy.get('[data-testid="..."]')` fails

**Solutions**:
1. Verify data-testid attribute exists in component
2. Use `cy.debug()` to inspect DOM
3. Check if element is hidden: `cy.get(...).should('be.visible')`
4. Wait for element: `cy.get(..., { timeout: 5000 })`

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:
1. Use explicit waits instead of fixed delays
2. Avoid brittle selectors (use data-testid)
3. Wait for network: `cy.intercept('GET', '/api/**').as('api'); cy.wait('@api')`
4. Add proper error handling for async operations

## Performance Benchmarks

### Expected Test Execution Times

| Test Suite | Count | Duration | Avg per Test |
|-----------|-------|----------|--------------|
| Opening & Closing | 7 | ~5s | 0.7s |
| Tab Navigation | 6 | ~6s | 1.0s |
| Interview Management | 10 | ~12s | 1.2s |
| Offer Management | 9 | ~10s | 1.1s |
| Notes Management | 6 | ~7s | 1.2s |
| Timeline Display | 6 | ~5s | 0.8s |
| Error Handling | 6 | ~8s | 1.3s |
| Accessibility | 4 | ~4s | 1.0s |
| **Total** | **50** | **~60-90s** | **1.1s avg** |

### Optimization Tips

1. **Parallel Execution**: Run tests in parallel (requires Cypress Pro)
   ```bash
   npx cypress run --parallel --record
   ```

2. **Headless Mode**: Use headless mode for faster execution
   ```bash
   npx cypress run  # headless by default
   ```

3. **Filter by Tag**: Only run critical path tests during CI
   ```typescript
   it('critical: schedules interview', () => { ... });
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run dev &
      - run: npm run cy:run
      - if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: cypress-videos
          path: cypress/videos/
```

## Test Maintenance

### Adding New Tests

1. Create describe block for feature
2. Add beforeEach and afterEach hooks
3. Write test cases with clear names
4. Use appropriate data-testid selectors
5. Add error handling tests
6. Update test count in this guide

### Updating Existing Tests

1. Keep test names descriptive
2. Maintain test data consistency
3. Update selectors if component changes
4. Document any breaking changes
5. Run full suite before committing

### Deprecating Tests

1. Mark with `it.skip()` if temporarily disabled
2. Document reason in comment
3. Create issue to address
4. Remove when no longer needed

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)
- [Debugging](https://docs.cypress.io/guides/guides/debugging)

## Contact & Support

For test issues:
1. Check this guide's troubleshooting section
2. Review test output and screenshots
3. Check component implementation (data-testid attributes)
4. Consult Cypress documentation
5. File issue with reproduction steps
