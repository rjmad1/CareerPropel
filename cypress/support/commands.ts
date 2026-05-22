/// <reference types="cypress" />

/**
 * Cypress Custom Commands for Career Propel
 * Domain-specific automation commands for testing job application workflows
 */

// Login command
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const testEmail = email ?? Cypress.env('CYPRESS_TEST_EMAIL');
  const testPassword = password ?? Cypress.env('CYPRESS_TEST_PASSWORD');
  if (!testEmail || !testPassword) {
    throw new Error('CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD are required for cy.login');
  }

  cy.visit('/api/auth/signin');
  cy.get('input[type="email"]').type(testEmail);
  cy.get('input[type="password"]').type(testPassword);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Create test job
Cypress.Commands.add(
  'createTestJob',
  (
    jobData: {
      title?: string;
      company?: string;
      stage?: string;
      matchScore?: number;
      minSalary?: number;
      maxSalary?: number;
    } = {}
  ) => {
    const defaultJob = {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      stage: 'APPLIED',
      matchScore: 85,
      minSalary: 150000,
      maxSalary: 200000,
      ...jobData,
    };

    return cy.request('POST', '/api/jobs', defaultJob);
  }
);

// Fill filter form
Cypress.Commands.add(
  'fillFilters',
  (filters: {
    textSearch?: string;
    matchScoreMin?: number;
    matchScoreMax?: number;
    salaryMin?: number;
    salaryMax?: number;
    stages?: string[];
  }) => {
    if (filters.textSearch) {
      cy.get('input[placeholder*="Search"]').type(filters.textSearch);
    }
    if (filters.matchScoreMin !== undefined) {
      cy.get('input[type="number"]').first().clear().type(filters.matchScoreMin.toString());
    }
    if (filters.matchScoreMax !== undefined) {
      cy.get('input[type="number"]').eq(1).clear().type(filters.matchScoreMax.toString());
    }
    if (filters.salaryMin !== undefined) {
      cy.get('input[type="number"]').eq(2).clear().type(filters.salaryMin.toString());
    }
    if (filters.salaryMax !== undefined) {
      cy.get('input[type="number"]').eq(3).clear().type(filters.salaryMax.toString());
    }
    if (filters.stages && filters.stages.length > 0) {
      filters.stages.forEach((stage) => {
        cy.get(`label:contains("${stage}")`).click();
      });
    }
  }
);

// Apply filters
Cypress.Commands.add('applyFilters', () => {
  cy.get('button:contains("Apply Filters")').click();
  cy.get('[data-cy="job-card"]').should('exist');
});

// Drag job card
Cypress.Commands.add(
  'dragJobCard',
  (jobTitle: string, targetStage: string) => {
    cy.get(`[data-cy="job-card"]:contains("${jobTitle}")`).should('exist');
    cy.get(`[data-cy="job-card"]:contains("${jobTitle}")`)
      .trigger('mousedown', { button: 0 })
      .trigger('dragstart');
    cy.get(`[data-cy="swimlane-${targetStage}"]`)
      .trigger('dragover')
      .trigger('drop');
    cy.get(`[data-cy="job-card"]:contains("${jobTitle}")`)
      .trigger('dragend');
  }
);

// Select jobs for bulk operations
Cypress.Commands.add('selectJobs', (jobTitles: string[]) => {
  jobTitles.forEach((title) => {
    cy.get(`[data-cy="job-card"]:contains("${title}") input[type="checkbox"]`)
      .check();
  });
});

// Save filter preset
Cypress.Commands.add(
  'saveFilterPreset',
  (presetName: string) => {
    cy.get('button:contains("Save Current")').click();
    cy.get('input[placeholder="Preset name..."]').type(presetName);
    cy.get('button:contains("Save")').click();
  }
);

// Export analytics
Cypress.Commands.add(
  'exportAnalytics',
  (format: 'csv' | 'json' | 'html' | 'pdf' = 'csv') => {
    const buttonText = format === 'csv' ? 'Export CSV'
      : format === 'json' ? 'Export JSON'
      : format === 'html' ? 'Export HTML'
      : 'Export PDF';

    cy.get(`button:contains("${buttonText}")`).click();
    
    // Verify download was triggered
    cy.readFile(`cypress/downloads/career-propel-analytics-*`)
      .should('exist');
  }
);

// Verify analytics metrics
Cypress.Commands.add(
  'verifyAnalyticsMetrics',
  (expectedMetrics: {
    totalApplications?: number;
    successRate?: number;
    interviewRate?: number;
  }) => {
    if (expectedMetrics.totalApplications !== undefined) {
      cy.get('[data-cy="metric-total-applications"]')
        .should('contain', expectedMetrics.totalApplications);
    }
    if (expectedMetrics.successRate !== undefined) {
      cy.get('[data-cy="metric-success-rate"]')
        .should('contain', expectedMetrics.successRate);
    }
    if (expectedMetrics.interviewRate !== undefined) {
      cy.get('[data-cy="metric-interview-rate"]')
        .should('contain', expectedMetrics.interviewRate);
    }
  }
);

// Check localStorage
Cypress.Commands.add(
  'checkLocalStorage',
  (key: string, expectedValue?: any) => {
    cy.window().then((window) => {
      const stored = localStorage.getItem(key);
      if (expectedValue) {
        expect(stored).to.equal(JSON.stringify(expectedValue));
      } else {
        expect(stored).to.exist;
      }
    });
  }
);

// Extend Cypress type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      createTestJob(jobData?: any): Chainable<any>;
      fillFilters(filters: any): Chainable<void>;
      applyFilters(): Chainable<void>;
      dragJobCard(jobTitle: string, targetStage: string): Chainable<void>;
      selectJobs(jobTitles: string[]): Chainable<void>;
      saveFilterPreset(presetName: string): Chainable<void>;
      exportAnalytics(format?: 'csv' | 'json' | 'html' | 'pdf'): Chainable<void>;
      verifyAnalyticsMetrics(expectedMetrics: any): Chainable<void>;
      checkLocalStorage(key: string, expectedValue?: any): Chainable<void>;
    }
  }
}

export {};
