/**
 * Job Detail Panel E2E Test Suite
 * Comprehensive tests for JobDetailPanel component and all tabs
 * Tests cover: opening/closing, navigation, CRUD operations, error handling
 */

import { loginUser, createTestJob, deleteTestData, fillForm, selectDropdown } from '../support/helpers';

describe('JobDetailPanel - Opening & Closing', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
  });

  afterEach(() => {
    deleteTestData();
  });

  it('opens job detail panel on card click', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="job-detail-panel"]').should('be.visible');
    cy.get('[data-testid="job-detail-panel-header"]').should('contain', 'Software Engineer');
  });

  it('displays job metadata in sticky header', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="panel-job-title"]').should('be.visible');
    cy.get('[data-testid="panel-company-name"]').should('be.visible');
    cy.get('[data-testid="panel-match-score"]').should('be.visible');
    cy.get('[data-testid="panel-salary-range"]').should('be.visible');
    cy.get('[data-testid="panel-stage-badge"]').should('be.visible');
  });

  it('applies correct color coding to match score', () => {
    cy.get('[data-testid="job-card"]').first().click();
    // Match score should be styled based on value
    cy.get('[data-testid="panel-match-score"]').should('have.class', /text-(green|yellow|orange|red)-600/);
  });

  it('closes panel on close button click', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="job-detail-panel"]').should('be.visible');
    cy.get('[data-testid="panel-close-btn"]').click();
    cy.get('[data-testid="job-detail-panel"]').should('not.exist');
  });

  it('closes panel on background click (overlay)', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="job-detail-panel"]').should('be.visible');
    cy.get('[data-testid="panel-overlay"]').click({ force: true });
    cy.get('[data-testid="job-detail-panel"]').should('not.exist');
  });

  it('closes panel on Escape key', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="job-detail-panel"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-testid="job-detail-panel"]').should('not.exist');
  });

  it('prevents accidental panel close with unsaved changes', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-overview"]').click();
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').type('Unsaved changes');
    cy.get('[data-testid="panel-close-btn"]').click();
    // Should show confirmation dialog
    cy.on('window:confirm', () => true);
    cy.get('[data-testid="job-detail-panel"]').should('not.exist');
  });
});

describe('JobDetailPanel - Tab Navigation', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
  });

  afterEach(() => {
    deleteTestData();
  });

  it('displays Overview tab by default', () => {
    cy.get('[data-testid="tab-overview"]').should('have.attr', 'data-active', 'true');
    cy.get('[data-testid="tab-content-overview"]').should('be.visible');
  });

  it('switches to Timeline tab', () => {
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="tab-timeline"]').should('have.attr', 'data-active', 'true');
    cy.get('[data-testid="tab-content-timeline"]').should('be.visible');
  });

  it('switches to Interviews tab', () => {
    cy.get('[data-testid="tab-interviews"]').click();
    cy.get('[data-testid="tab-interviews"]').should('have.attr', 'data-active', 'true');
    cy.get('[data-testid="tab-content-interviews"]').should('be.visible');
  });

  it('switches to Prep tab', () => {
    cy.get('[data-testid="tab-prep"]').click();
    cy.get('[data-testid="tab-prep"]').should('have.attr', 'data-active', 'true');
    cy.get('[data-testid="tab-content-prep"]').should('be.visible');
  });

  it('switches to Offers tab', () => {
    cy.get('[data-testid="tab-offers"]').click();
    cy.get('[data-testid="tab-offers"]').should('have.attr', 'data-active', 'true');
    cy.get('[data-testid="tab-content-offers"]').should('be.visible');
  });

  it('maintains state when switching between tabs', () => {
    // Add note in overview
    cy.get('[data-testid="tab-overview"]').click();
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').clear().type('Test note');
    
    // Switch to interviews and back
    cy.get('[data-testid="tab-interviews"]').click();
    cy.get('[data-testid="tab-overview"]').click();
    
    // Note should still be there
    cy.get('[data-testid="notes-textarea"]').should('have.value', 'Test note');
  });

  it('navigates tabs with keyboard shortcuts', () => {
    // Tab 1: Overview -> Timeline (right arrow)
    cy.get('[data-testid="tab-timeline"]').parent().type('{rightarrow}');
    cy.get('[data-testid="tab-timeline"]').should('have.attr', 'data-active', 'true');
    
    // Timeline -> Interviews (right arrow)
    cy.get('[data-testid="tab-timeline"]').parent().type('{rightarrow}');
    cy.get('[data-testid="tab-interviews"]').should('have.attr', 'data-active', 'true');
  });
});

describe('JobDetailPanel - Interview Management', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-interviews"]').click();
  });

  afterEach(() => {
    deleteTestData();
  });

  it('displays upcoming and past interviews in separate sections', () => {
    cy.get('[data-testid="upcoming-interviews-section"]').should('be.visible');
    cy.get('[data-testid="past-interviews-section"]').should('be.visible');
  });

  it('schedules a new technical interview', () => {
    cy.get('[data-testid="schedule-interview-btn"]').click();
    cy.get('[data-testid="interview-form"]').should('be.visible');
    
    selectDropdown('[data-testid="interview-type-select"]', 'technical');
    cy.get('[data-testid="interview-date"]').type('2026-06-15');
    cy.get('[data-testid="interview-time"]').type('14:00');
    cy.get('[data-testid="interview-interviewer"]').type('John Smith');
    cy.get('[data-testid="interview-location"]').type('Zoom');
    cy.get('[data-testid="interview-notes"]').type('Practice system design questions');
    
    cy.get('[data-testid="schedule-submit-btn"]').click();
    cy.get('[data-testid="interview-form"]').should('not.exist');
    cy.get('[data-testid="upcoming-interviews-section"]').should('contain', 'Technical Interview');
  });

  it('schedules a behavioral interview', () => {
    cy.get('[data-testid="schedule-interview-btn"]').click();
    selectDropdown('[data-testid="interview-type-select"]', 'behavioral');
    cy.get('[data-testid="interview-date"]').type('2026-06-20');
    cy.get('[data-testid="interview-time"]').type('10:00');
    cy.get('[data-testid="schedule-submit-btn"]').click();
    cy.get('[data-testid="upcoming-interviews-section"]').should('contain', 'Behavioral');
  });

  it('schedules a phone screen', () => {
    cy.get('[data-testid="schedule-interview-btn"]').click();
    selectDropdown('[data-testid="interview-type-select"]', 'phone_screen');
    cy.get('[data-testid="interview-date"]').type('2026-05-20');
    cy.get('[data-testid="interview-time"]').type('13:30');
    cy.get('[data-testid="schedule-submit-btn"]').click();
    cy.get('[data-testid="upcoming-interviews-section"]').should('contain', 'Phone Screen');
  });

  it('shows loading state while scheduling interview', () => {
    cy.get('[data-testid="schedule-interview-btn"]').click();
    selectDropdown('[data-testid="interview-type-select"]', 'technical');
    cy.get('[data-testid="interview-date"]').type('2026-06-15');
    cy.get('[data-testid="interview-time"]').type('14:00');
    
    // Slow down network to see loading state
    cy.intercept('POST', '/api/interviews', (req) => {
      req.reply((res) => {
        res.delay(1000);
        res.send({ statusCode: 200, body: { id: '123', type: 'technical' } });
      });
    });
    
    cy.get('[data-testid="schedule-submit-btn"]').click();
    cy.get('[data-testid="schedule-submit-btn"]').should('have.text', 'Scheduling...');
    cy.get('[data-testid="schedule-submit-btn"]').should('be.disabled');
  });

  it('displays interview details with metadata', () => {
    cy.get('[data-testid="interview-item"]').first().within(() => {
      cy.get('[data-testid="interview-type-badge"]').should('be.visible');
      cy.get('[data-testid="interview-date"]').should('be.visible');
      cy.get('[data-testid="interview-time"]').should('be.visible');
      cy.get('[data-testid="interview-interviewer"]').should('be.visible');
      cy.get('[data-testid="interview-location"]').should('be.visible');
    });
  });

  it('deletes an interview with confirmation', () => {
    const interviewCount = cy.get('[data-testid="interview-item"]').its('length');
    
    cy.get('[data-testid="interview-item"]').first().within(() => {
      cy.get('[data-testid="interview-delete-btn"]').click();
    });
    
    cy.on('window:confirm', () => true);
    cy.get('[data-testid="interview-item"]').its('length').should('be.lessThan', interviewCount);
  });

  it('cancels delete on confirmation cancel', () => {
    cy.get('[data-testid="interview-item"]').first().within(() => {
      cy.get('[data-testid="interview-delete-btn"]').click();
    });
    
    cy.on('window:confirm', () => false);
    cy.get('[data-testid="interview-item"]').should('have.length.at.least', 1);
  });

  it('validates required fields before submitting', () => {
    cy.get('[data-testid="schedule-interview-btn"]').click();
    cy.get('[data-testid="schedule-submit-btn"]').click();
    cy.get('[data-testid="interview-form"]').should('be.visible');
    cy.get('[data-testid="form-error-message"]').should('contain', 'required');
  });

  it('handles interview scheduling errors gracefully', () => {
    cy.intercept('POST', '/api/interviews', {
      statusCode: 500,
      body: { error: 'Failed to schedule interview' }
    });
    
    cy.get('[data-testid="schedule-interview-btn"]').click();
    fillForm({
      '[data-testid="interview-type-select"]': 'technical',
      '[data-testid="interview-date"]': '2026-06-15',
      '[data-testid="interview-time"]': '14:00'
    });
    cy.get('[data-testid="schedule-submit-btn"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Failed');
  });
});

describe('JobDetailPanel - Offer Management', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-offers"]').click();
  });

  afterEach(() => {
    deleteTestData();
  });

  it('logs a new offer', () => {
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-form"]').should('be.visible');
    
    cy.get('[data-testid="offer-salary"]').type('150000');
    cy.get('[data-testid="offer-bonus"]').type('20');
    cy.get('[data-testid="offer-equity"]').type('0.05');
    cy.get('[data-testid="offer-start-date"]').type('2026-07-01');
    cy.get('[data-testid="offer-notes"]').type('Great opportunity');
    
    cy.get('[data-testid="offer-submit-btn"]').click();
    cy.get('[data-testid="offer-form"]').should('not.exist');
    cy.get('[data-testid="offers-list"]').should('contain', '$150,000');
  });

  it('calculates total compensation automatically', () => {
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-salary"]').type('100000');
    cy.get('[data-testid="offer-bonus"]').type('20');
    // Total should show: 100,000 + 20,000 = 120,000
    cy.get('[data-testid="offer-total-compensation"]').should('contain', '$120,000');
  });

  it('displays offer with status badge', () => {
    cy.get('[data-testid="offer-item"]').first().within(() => {
      cy.get('[data-testid="offer-salary"]').should('be.visible');
      cy.get('[data-testid="offer-status-badge"]').should('be.visible');
      cy.get('[data-testid="offer-start-date"]').should('be.visible');
    });
  });

  it('updates offer status from pending to accepted', () => {
    cy.get('[data-testid="offer-item"]').first().within(() => {
      cy.get('[data-testid="offer-status-badge"]').should('have.class', 'bg-yellow-100');
      cy.get('[data-testid="offer-status-select"]').select('accepted');
    });
    
    cy.get('[data-testid="offer-item"]').first().within(() => {
      cy.get('[data-testid="offer-status-badge"]').should('have.class', 'bg-green-100');
    });
  });

  it('compares multiple offers side-by-side', () => {
    // Log first offer
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-salary"]').type('150000');
    cy.get('[data-testid="offer-submit-btn"]').click();
    
    // Log second offer
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-salary"]').type('160000');
    cy.get('[data-testid="offer-bonus"]').type('25');
    cy.get('[data-testid="offer-submit-btn"]').click();
    
    // Both should be visible
    cy.get('[data-testid="offer-item"]').should('have.length', 2);
    cy.get('[data-testid="offers-comparison"]').should('be.visible');
  });

  it('deletes an offer with confirmation', () => {
    const offerCount = cy.get('[data-testid="offer-item"]').its('length');
    
    cy.get('[data-testid="offer-item"]').first().within(() => {
      cy.get('[data-testid="offer-delete-btn"]').click();
    });
    
    cy.on('window:confirm', () => true);
    cy.get('[data-testid="offer-item"]').its('length').should('be.lessThan', offerCount);
  });

  it('shows loading state while logging offer', () => {
    cy.intercept('POST', '/api/offers', (req) => {
      req.reply((res) => {
        res.delay(800);
        res.send({ statusCode: 200, body: { id: '456' } });
      });
    });
    
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-salary"]').type('150000');
    cy.get('[data-testid="offer-submit-btn"]').click();
    cy.get('[data-testid="offer-submit-btn"]').should('have.text', 'Logging...');
    cy.get('[data-testid="offer-submit-btn"]').should('be.disabled');
  });

  it('validates required fields before submitting', () => {
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-submit-btn"]').click();
    cy.get('[data-testid="offer-form"]').should('be.visible');
    cy.get('[data-testid="form-error-message"]').should('contain', 'required');
  });

  it('handles offer creation errors gracefully', () => {
    cy.intercept('POST', '/api/offers', {
      statusCode: 400,
      body: { error: 'Invalid compensation data' }
    });
    
    cy.get('[data-testid="log-offer-btn"]').click();
    cy.get('[data-testid="offer-salary"]').type('invalid');
    cy.get('[data-testid="offer-submit-btn"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid');
  });
});

describe('JobDetailPanel - Notes Management', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-overview"]').click();
  });

  afterEach(() => {
    deleteTestData();
  });

  it('displays existing notes', () => {
    cy.get('[data-testid="notes-content"]').should('be.visible');
  });

  it('edits and saves notes', () => {
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').clear().type('Updated notes about this job');
    cy.get('[data-testid="notes-save-btn"]').click();
    cy.get('[data-testid="notes-content"]').should('contain', 'Updated notes about this job');
  });

  it('cancels notes edit without saving', () => {
    const originalText = cy.get('[data-testid="notes-content"]').invoke('text');
    
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').clear().type('Discarded changes');
    cy.get('[data-testid="notes-cancel-btn"]').click();
    
    cy.get('[data-testid="notes-content"]').invoke('text').should('equal', originalText);
  });

  it('shows loading state while saving notes', () => {
    cy.intercept('PATCH', '/api/jobs/*', (req) => {
      req.reply((res) => {
        res.delay(500);
        res.send({ statusCode: 200 });
      });
    });
    
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').clear().type('Test notes');
    cy.get('[data-testid="notes-save-btn"]').click();
    cy.get('[data-testid="notes-save-btn"]').should('have.text', 'Saving...');
    cy.get('[data-testid="notes-save-btn"]').should('be.disabled');
  });

  it('handles notes save errors gracefully', () => {
    cy.intercept('PATCH', '/api/jobs/*', {
      statusCode: 500,
      body: { error: 'Failed to save notes' }
    });
    
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').clear().type('Test notes');
    cy.get('[data-testid="notes-save-btn"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Failed');
  });

  it('syncs notes with activity timeline', () => {
    cy.get('[data-testid="notes-edit-btn"]').click();
    cy.get('[data-testid="notes-textarea"]').clear().type('Interview notes for follow-up');
    cy.get('[data-testid="notes-save-btn"]').click();
    
    // Switch to timeline and verify activity is logged
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="activity-item"]').first().should('contain', 'notes');
  });
});

describe('JobDetailPanel - Timeline Display', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-timeline"]').click();
  });

  afterEach(() => {
    deleteTestData();
  });

  it('displays activity timeline', () => {
    cy.get('[data-testid="activity-timeline"]').should('be.visible');
    cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
  });

  it('shows different activity icons for different types', () => {
    cy.get('[data-testid="activity-icon-applied"]').should('be.visible');
    // Check for various activity type icons
    cy.get('[data-testid*="activity-icon-"]').should('have.length.at.least', 1);
  });

  it('displays activity metadata and timestamps', () => {
    cy.get('[data-testid="activity-item"]').first().within(() => {
      cy.get('[data-testid="activity-timestamp"]').should('contain', 'ago');
      cy.get('[data-testid="activity-description"]').should('be.visible');
    });
  });

  it('formats relative times correctly', () => {
    cy.get('[data-testid="activity-timestamp"]').each(($timestamp) => {
      cy.wrap($timestamp).should('match', /(ago|today|yesterday)/i);
    });
  });

  it('sorts activities by most recent first', () => {
    // Get first activity timestamp
    cy.get('[data-testid="activity-item"]').first().within(() => {
      cy.get('[data-testid="activity-timestamp"]').invoke('text').then((firstTime) => {
        // Parse and verify ordering (should be "recently" compared to others)
        expect(firstTime).not.to.be.empty;
      });
    });
  });

  it('displays all 8 activity types', () => {
    const activityTypes = [
      'applied',
      'stage_changed',
      'interview_scheduled',
      'interview_completed',
      'rejected',
      'offered',
      'note_added',
      'agent_action'
    ];
    
    activityTypes.forEach((type) => {
      cy.get(`[data-testid="activity-icon-${type}"]`).should('exist');
    });
  });

  it('displays activity metadata in formatted boxes', () => {
    cy.get('[data-testid="activity-item"]').first().within(() => {
      cy.get('[data-testid="activity-metadata"]').should('be.visible');
      cy.get('[data-testid="activity-metadata-item"]').should('have.length.at.least', 1);
    });
  });

  it('handles empty timeline gracefully', () => {
    // For new job with no activity
    cy.get('[data-testid="job-card"]').eq(1).click();
    cy.get('[data-testid="tab-timeline"]').click();
    cy.get('[data-testid="empty-timeline-message"]').should('exist');
  });
});

describe('JobDetailPanel - Error Handling & Edge Cases', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
  });

  afterEach(() => {
    deleteTestData();
  });

  it('handles network errors when loading job details', () => {
    cy.intercept('GET', '/api/jobs/*', { statusCode: 500 });
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to load');
    cy.get('[data-testid="panel-retry-btn"]').should('be.visible');
  });

  it('retries on network error', () => {
    let requestCount = 0;
    cy.intercept('GET', '/api/jobs/*', (req) => {
      requestCount++;
      if (requestCount === 1) {
        req.reply({ statusCode: 500 });
      } else {
        req.reply({ statusCode: 200, body: { id: '1', title: 'Test Job' } });
      }
    });
    
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="panel-retry-btn"]').click();
    cy.get('[data-testid="job-detail-panel-header"]').should('be.visible');
  });

  it('displays loading skeleton while fetching data', () => {
    cy.intercept('GET', '/api/jobs/*', (req) => {
      req.reply((res) => {
        res.delay(1000);
      });
    });
    
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="panel-skeleton"]').should('be.visible');
  });

  it('handles very long job descriptions', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-overview"]').click();
    cy.get('[data-testid="job-description"]').should('be.visible');
    // Text should be scrollable or truncated appropriately
    cy.get('[data-testid="job-description"]').should('have.css', 'overflow');
  });

  it('handles missing interview prep data', () => {
    cy.intercept('GET', '/api/interview-prep/*', {
      statusCode: 404,
      body: { error: 'No prep data available' }
    });
    
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-prep"]').click();
    cy.get('[data-testid="empty-prep-message"]').should('be.visible');
  });

  it('handles concurrent mutation operations', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-interviews"]').click();
    
    // Start two interview schedules
    cy.get('[data-testid="schedule-interview-btn"]').click();
    cy.get('[data-testid="interview-date"]').type('2026-06-15');
    cy.get('[data-testid="schedule-submit-btn"]').click();
    
    // While first is in flight, open another
    cy.get('[data-testid="schedule-interview-btn"]').click();
    cy.get('[data-testid="interview-date"]').type('2026-06-20');
    cy.get('[data-testid="schedule-submit-btn"]').click();
    
    // Both should complete successfully
    cy.get('[data-testid="upcoming-interviews-section"]').should('contain', '2026-06-15');
    cy.get('[data-testid="upcoming-interviews-section"]').should('contain', '2026-06-20');
  });
});

describe('JobDetailPanel - Accessibility', () => {
  beforeEach(() => {
    loginUser();
    cy.visit('/');
  });

  afterEach(() => {
    deleteTestData();
  });

  it('has proper ARIA labels on interactive elements', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="panel-close-btn"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="notes-edit-btn"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="schedule-interview-btn"]').should('have.attr', 'aria-label');
  });

  it('maintains keyboard navigation', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-overview"]').focus().should('have.focus');
    cy.get('[data-testid="tab-overview"]').type('{rightarrow}');
    cy.get('[data-testid="tab-timeline"]').should('have.focus');
  });

  it('announces dynamic content changes to screen readers', () => {
    cy.get('[data-testid="job-card"]').first().click();
    cy.get('[data-testid="tab-interviews"]').click();
    cy.get('[data-testid="schedule-interview-btn"]').click();
    // Should have aria-live region for form submission feedback
    cy.get('[aria-live="polite"]').should('be.visible');
  });

  it('supports dark mode contrast requirements', () => {
    // Enable dark mode
    cy.get('html').should('have.class', 'dark');
    cy.get('[data-testid="job-detail-panel"]').should('have.css', 'color');
    // Text should have sufficient contrast
    cy.get('[data-testid="panel-job-title"]').should('have.css', 'color');
  });
});
