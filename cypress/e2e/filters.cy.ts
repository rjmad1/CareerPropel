/**
 * Filter Form Tests
 * Comprehensive tests for job filtering, persistence, and preset management
 */

describe('Advanced Job Filters', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  describe('Filter Visibility and Basic Functionality', () => {
    it('should display all filter sections', () => {
      cy.get('[data-cy="filter-section-text-search"]').should('exist');
      cy.get('[data-cy="filter-section-match-score"]').should('exist');
      cy.get('[data-cy="filter-section-salary"]').should('exist');
      cy.get('[data-cy="filter-section-stages"]').should('exist');
      cy.get('[data-cy="filter-section-priority"]').should('exist');
      cy.get('[data-cy="filter-section-status"]').should('exist');
    });

    it('should allow text search', () => {
      cy.createTestJob({ title: 'Senior Engineer', company: 'Google' });
      cy.createTestJob({ title: 'Junior Developer', company: 'Amazon' });

      cy.get('input[placeholder*="Search"]').type('Senior');
      cy.applyFilters();
      cy.get('[data-cy="job-card"]').should('have.length', 1);
      cy.get('[data-cy="job-card"]').should('contain', 'Senior Engineer');
    });

    it('should filter by match score range', () => {
      cy.createTestJob({ matchScore: 95 });
      cy.createTestJob({ matchScore: 45 });
      cy.createTestJob({ matchScore: 15 });

      cy.fillFilters({ matchScoreMin: 60, matchScoreMax: 100 });
      cy.applyFilters();
      cy.get('[data-cy="job-card"]').should('have.length', 1);
    });

    it('should filter by salary range', () => {
      cy.createTestJob({ minSalary: 150000, maxSalary: 200000 });
      cy.createTestJob({ minSalary: 100000, maxSalary: 120000 });

      cy.fillFilters({ salaryMin: 140000, salaryMax: 210000 });
      cy.applyFilters();
      cy.get('[data-cy="job-card"]').should('have.length', 1);
    });

    it('should filter by pipeline stages', () => {
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'TECHNICAL_INTERVIEW' });
      cy.createTestJob({ stage: 'OFFER' });

      cy.fillFilters({ stages: ['TECHNICAL_INTERVIEW', 'OFFER'] });
      cy.applyFilters();
      cy.get('[data-cy="job-card"]').should('have.length', 2);
    });
  });

  describe('Filter Persistence', () => {
    it('should persist filters to localStorage', () => {
      cy.fillFilters({
        textSearch: 'Engineer',
        matchScoreMin: 70,
      });
      cy.applyFilters();

      cy.checkLocalStorage('career-propel-filters');
    });

    it('should restore filters after page reload', () => {
      cy.fillFilters({ textSearch: 'Senior' });
      cy.applyFilters();

      cy.reload();
      cy.get('input[placeholder*="Search"]').should('have.value', 'Senior');
    });

    it('should clear filters with clear button', () => {
      cy.fillFilters({ textSearch: 'Engineer', matchScoreMin: 80 });
      cy.applyFilters();

      cy.get('button:contains("Clear All")').click();
      cy.get('input[placeholder*="Search"]').should('have.value', '');
      cy.get('[data-cy="filter-match-score-min"]').should('have.value', '0');
    });
  });

  describe('Filter Presets', () => {
    it('should save filter preset', () => {
      cy.fillFilters({ textSearch: 'Engineer', matchScoreMin: 75 });
      cy.saveFilterPreset('High Quality Engineer Roles');

      cy.get('[data-cy="preset-badge"]')
        .should('contain', 'High Quality Engineer Roles');
    });

    it('should load filter preset', () => {
      cy.saveFilterPreset('Test Preset');
      cy.fillFilters({ textSearch: 'Different Search' });

      cy.get('[data-cy="preset-badge"]:contains("Test Preset")').click();
      cy.get('input[placeholder*="Search"]').should('not.contain', 'Different');
    });

    it('should delete filter preset', () => {
      cy.saveFilterPreset('Preset to Delete');
      cy.get('[data-cy="preset-badge"]:contains("Preset to Delete") button').click();

      cy.get('[data-cy="preset-badge"]:contains("Preset to Delete")').should('not.exist');
    });

    it('should persist presets to localStorage', () => {
      cy.saveFilterPreset('My Preset');
      cy.checkLocalStorage('career-propel-filter-presets');
    });
  });

  describe('Filter Import/Export', () => {
    it('should export filters as JSON', () => {
      cy.fillFilters({
        textSearch: 'Engineer',
        matchScoreMin: 80,
        salaryMin: 150000,
      });

      cy.get('button:contains("Export Filters")').click();
      
      cy.readFile('cypress/downloads/filters-*.json').should('exist');
    });

    it('should import filters from JSON', () => {
      const filterData = {
        textSearch: 'Imported Search',
        matchScoreMin: 85,
        matchScoreMax: 100,
        salaryMin: 200000,
        salaryMax: 300000,
        stages: [],
        priority: [],
        status: [],
      };

      // Create a test file
      cy.window().then((win) => {
        const blob = new Blob([JSON.stringify(filterData)], {
          type: 'application/json',
        });
        const file = new File([blob], 'filters.json', { type: 'application/json' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const input = win.document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dataTransfer.files;
          cy.wrap(input).trigger('change');
        }
      });

      cy.get('input[placeholder*="Search"]').should('contain', 'Imported Search');
    });
  });

  describe('Advanced Filter Combinations', () => {
    it('should combine multiple filters', () => {
      cy.createTestJob({
        title: 'Senior Engineer',
        company: 'Google',
        matchScore: 95,
        minSalary: 200000,
        maxSalary: 250000,
        stage: 'APPLIED',
      });

      cy.createTestJob({
        title: 'Junior Developer',
        company: 'Startup',
        matchScore: 45,
        minSalary: 80000,
        maxSalary: 100000,
        stage: 'INTERESTED',
      });

      cy.fillFilters({
        textSearch: 'Engineer',
        matchScoreMin: 80,
        salaryMin: 150000,
        stages: ['APPLIED'],
      });

      cy.applyFilters();
      cy.get('[data-cy="job-card"]').should('have.length', 1);
      cy.get('[data-cy="job-card"]').should('contain', 'Senior Engineer');
    });

    it('should handle no results gracefully', () => {
      cy.fillFilters({
        textSearch: 'Nonexistent Company XYZ',
        matchScoreMin: 95,
        salaryMin: 500000,
      });

      cy.applyFilters();
      cy.get('[data-cy="empty-state"]').should('contain', 'No jobs match your filters');
    });
  });

  describe('Sorting', () => {
    it('should sort by date added (default)', () => {
      cy.createTestJob({ title: 'First Job', company: 'Company A' });
      cy.wait(100);
      cy.createTestJob({ title: 'Second Job', company: 'Company B' });

      cy.applyFilters();
      cy.get('[data-cy="job-card"]').first().should('contain', 'Second Job');
    });

    it('should sort by match score', () => {
      cy.createTestJob({ title: 'Low Match', matchScore: 30 });
      cy.createTestJob({ title: 'High Match', matchScore: 95 });

      cy.get('select[value="matchScore"]').select('matchScore');
      cy.get('button:contains("Descending")').click();

      cy.applyFilters();
      cy.get('[data-cy="job-card"]').first().should('contain', 'High Match');
    });

    it('should sort by salary', () => {
      cy.createTestJob({ title: 'Low Pay', minSalary: 80000 });
      cy.createTestJob({ title: 'High Pay', minSalary: 250000 });

      cy.get('select').select('maxSalary');
      cy.applyFilters();
      cy.get('[data-cy="job-card"]').first().should('contain', 'High Pay');
    });
  });

  describe('Expandable Sections', () => {
    it('should toggle filter section visibility', () => {
      cy.get('[data-cy="filter-section-salary"] .section-content').should('be.visible');
      cy.get('[data-cy="filter-section-salary"] button').click();
      cy.get('[data-cy="filter-section-salary"] .section-content').should('not.be.visible');
    });

    it('should remember section expansion state', () => {
      cy.get('[data-cy="filter-section-stages"] button').click();
      cy.get('[data-cy="filter-section-priority"] button').click();

      cy.reload();
      // Verify state is remembered
      cy.get('[data-cy="filter-section-stages"] .section-content').should('not.be.visible');
    });
  });
});
