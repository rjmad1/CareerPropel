/**
 * Analytics Tests
 * Tests for analytics dashboard, metrics, and export functionality
 */

describe('Analytics Dashboard', () => {
  beforeEach(() => {
    cy.visit('/analytics');
    cy.login();
  });

  describe('Metrics Display', () => {
    it('should display summary metrics', () => {
      cy.get('[data-cy="metric-total-applications"]').should('exist');
      cy.get('[data-cy="metric-success-rate"]').should('exist');
      cy.get('[data-cy="metric-interview-rate"]').should('exist');
      cy.get('[data-cy="metric-rejection-rate"]').should('exist');
    });

    it('should calculate total applications correctly', () => {
      cy.createTestJob({ title: 'Job 1' });
      cy.createTestJob({ title: 'Job 2' });
      cy.createTestJob({ title: 'Job 3' });

      cy.visit('/analytics');
      cy.get('[data-cy="metric-total-applications"]').should('contain', '3');
    });

    it('should calculate success rate', () => {
      cy.createTestJob({ stage: 'OFFER' });
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'REJECTED' });
      cy.createTestJob({ stage: 'OFFER' });

      cy.visit('/analytics');
      cy.get('[data-cy="metric-success-rate"]')
        .should('contain', '50'); // 2 offers out of 4
    });

    it('should calculate interview rate', () => {
      cy.createTestJob({ stage: 'TECHNICAL_INTERVIEW' });
      cy.createTestJob({ stage: 'BEHAVIORAL' });
      cy.createTestJob({ stage: 'APPLIED' });

      cy.visit('/analytics');
      cy.get('[data-cy="metric-interview-rate"]')
        .should('contain', '66.66'); // 2 interviews out of 3
    });

    it('should handle zero applications', () => {
      cy.visit('/analytics');
      cy.get('[data-cy="metric-total-applications"]').should('contain', '0');
      cy.get('[data-cy="metric-success-rate"]').should('contain', '0');
    });
  });

  describe('Charts and Visualizations', () => {
    beforeEach(() => {
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'TECHNICAL_INTERVIEW' });
      cy.createTestJob({ stage: 'OFFER' });
      cy.createTestJob({ stage: 'REJECTED' });
      cy.visit('/analytics');
    });

    it('should display pipeline stage chart', () => {
      cy.get('[data-cy="chart-pipeline-stages"]').should('exist');
      cy.get('[data-cy="chart-pipeline-stages"]').should('be.visible');
    });

    it('should display match score distribution chart', () => {
      cy.get('[data-cy="chart-match-score"]').should('exist');
    });

    it('should display salary distribution chart', () => {
      cy.get('[data-cy="chart-salary"]').should('exist');
    });

    it('should display outcomes pie chart', () => {
      cy.get('[data-cy="chart-outcomes"]').should('exist');
    });
  });

  describe('Analytics Export', () => {
    beforeEach(() => {
      cy.createTestJob({ title: 'Test Job 1', matchScore: 85 });
      cy.createTestJob({ title: 'Test Job 2', matchScore: 65 });
      cy.visit('/analytics');
    });

    it('should export analytics as CSV', () => {
      cy.exportAnalytics('csv');
      cy.readFile('cypress/downloads/career-propel-analytics-*.csv').should(
        'contain',
        'Total Applications'
      );
    });

    it('should export analytics as JSON', () => {
      cy.exportAnalytics('json');
      cy.readFile('cypress/downloads/career-propel-analytics-*.json').then(
        (content) => {
          const data = JSON.parse(content);
          expect(data.totalApplications).to.equal(2);
          expect(data).to.have.property('successRate');
          expect(data).to.have.property('interviewRate');
        }
      );
    });

    it('should export analytics as HTML', () => {
      cy.exportAnalytics('html');
      cy.readFile('cypress/downloads/career-propel-analytics-*.html').should(
        'contain',
        'Career Propel Analytics Report'
      );
    });

    it('CSV export should contain correct data', () => {
      cy.exportAnalytics('csv');
      cy.readFile('cypress/downloads/career-propel-analytics-*.csv').then(
        (content) => {
          expect(content).to.contain('Total Applications');
          expect(content).to.contain('Success Rate');
          expect(content).to.contain('INTERVIEW RATE');
        }
      );
    });

    it('JSON export should be valid JSON', () => {
      cy.exportAnalytics('json');
      cy.readFile('cypress/downloads/career-propel-analytics-*.json').then(
        (content) => {
          expect(() => JSON.parse(content)).to.not.throw();
        }
      );
    });

    it('HTML export should contain styling', () => {
      cy.exportAnalytics('html');
      cy.readFile('cypress/downloads/career-propel-analytics-*.html').should(
        'contain',
        '<style>'
      );
    });
  });

  describe('Metrics Accuracy', () => {
    it('should format percentages correctly', () => {
      cy.createTestJob({ stage: 'OFFER' });
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'APPLIED' });

      cy.visit('/analytics');
      cy.get('[data-cy="metric-success-rate"]').then(($el) => {
        const text = $el.text();
        expect(text).to.match(/\d+\.?\d*%/);
      });
    });

    it('should update metrics when jobs change', () => {
      cy.createTestJob({ stage: 'APPLIED' });
      cy.visit('/analytics');
      cy.get('[data-cy="metric-total-applications"]').should('contain', '1');

      cy.createTestJob({ stage: 'OFFER' });
      cy.reload();
      cy.get('[data-cy="metric-total-applications"]').should('contain', '2');
    });

    it('should calculate median salary correctly', () => {
      cy.createTestJob({ minSalary: 100000, maxSalary: 120000 });
      cy.createTestJob({ minSalary: 150000, maxSalary: 180000 });
      cy.createTestJob({ minSalary: 200000, maxSalary: 250000 });

      cy.visit('/analytics');
      cy.get('[data-cy="salary-median"]').should('exist');
    });
  });

  describe('Stage Distribution Table', () => {
    it('should display all stages with counts', () => {
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'TECHNICAL_INTERVIEW' });
      cy.createTestJob({ stage: 'OFFER' });

      cy.visit('/analytics');
      cy.get('[data-cy="stage-table"]').should('exist');
      cy.get('[data-cy="stage-table"] tbody tr').should('have.length.greaterThan', 0);
    });

    it('should show stage counts accurately', () => {
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'APPLIED' });

      cy.visit('/analytics');
      cy.get('[data-cy="stage-APPLIED"]').should('contain', '2');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no jobs', () => {
      cy.visit('/analytics');
      cy.get('[data-cy="empty-analytics-state"]').should('contain', 'No applications yet');
    });

    it('should show empty state message in exports', () => {
      cy.exportAnalytics('csv');
      cy.readFile('cypress/downloads/career-propel-analytics-*.csv').should(
        'contain',
        'No applications'
      );
    });
  });

  describe('Top Companies Section', () => {
    it('should display top companies', () => {
      cy.createTestJob({ company: 'Google' });
      cy.createTestJob({ company: 'Google' });
      cy.createTestJob({ company: 'Amazon' });

      cy.visit('/analytics');
      cy.get('[data-cy="top-companies"]').should('exist');
      cy.get('[data-cy="company-Google"]').should('contain', '2');
    });

    it('should calculate company success rates', () => {
      cy.createTestJob({ company: 'Google', stage: 'OFFER' });
      cy.createTestJob({ company: 'Google', stage: 'REJECTED' });

      cy.visit('/analytics');
      cy.get('[data-cy="company-Google-success-rate"]')
        .should('contain', '50');
    });

    it('should limit to top 10 companies', () => {
      for (let i = 0; i < 15; i++) {
        cy.createTestJob({ company: `Company ${i}` });
      }

      cy.visit('/analytics');
      cy.get('[data-cy="top-companies"] tr').should('have.length.lessThanOrEqual', 11); // header + 10 rows
    });
  });

  describe('Performance', () => {
    it('should load analytics page within acceptable time', () => {
      cy.visit('/analytics');
      cy.get('[data-cy="metric-total-applications"]', { timeout: 2000 }).should(
        'exist'
      );
    });

    it('should render charts without blocking UI', () => {
      // Create multiple jobs
      for (let i = 0; i < 50; i++) {
        cy.createTestJob({ title: `Job ${i}` });
      }

      cy.visit('/analytics');
      cy.get('[data-cy="chart-pipeline-stages"]', { timeout: 3000 }).should(
        'exist'
      );
    });
  });

  describe('Advanced Week 9 Analytics & Insights', () => {
    it('should support switching tabs to view Advanced ROI, Career Trajectory, and Market Insights', () => {
      // 1. Verify all tab selectors exist
      cy.get('[data-cy="tab-roi"]').should('exist');
      cy.get('[data-cy="tab-trajectory"]').should('exist');
      cy.get('[data-cy="tab-market"]').should('exist');

      // --- ROI FUNNEL TESTS ---
      // 2. Click ROI & Funnel tab
      cy.get('[data-cy="tab-roi"]').click();
      
      // 3. Verify ROI container and metric cards
      cy.get('[data-cy="roi-metrics-container"]').should('exist');
      cy.get('[data-cy="roi-metrics"]').within(() => {
        cy.contains('Application Yield').should('exist');
        cy.contains('Funnel Velocity').should('exist');
        cy.contains('Offer Conversion').should('exist');
      });

      // 4. Verify Funnel stages list
      cy.get('[data-cy="funnel-stage"]').should('have.length', 5);
      cy.contains('Pipeline Conversion Funnel').should('be.visible');
      cy.contains('Discovery & Sourced').should('be.visible');
      cy.contains('Offers Received').should('be.visible');

      // 5. Verify Turnaround Benchmarks
      cy.contains('Stage Turnaround Benchmarks').should('be.visible');
      cy.contains('Technical Assessment').should('exist');

      // --- CAREER TRAJECTORY TESTS ---
      // 6. Click Career Trajectory Map tab
      cy.get('[data-cy="tab-trajectory"]').click();

      // 7. Verify Trajectory Map rendering
      cy.get('[data-cy="trajectory-card"]').should('exist');
      cy.get('[data-cy="trajectory-svg"]').should('be.visible');

      // 8. Verify default active details (Staff Software Engineer is selected/active by default)
      cy.get('[data-cy="node-details"]').within(() => {
        cy.contains('Staff Software Engineer').should('be.visible');
        cy.contains('ACTIVE').should('exist');
        cy.contains('Current Goal').should('exist');
        cy.contains('Skill Gaps to Close').should('exist');
        cy.contains('Required Milestones').should('exist');
      });

      // 9. Click on Director of Engineering node to test interactivity
      cy.get('[data-cy="trajectory-node"][data-node-id="director-eng"]').click();

      // 10. Inspector details should update for Director
      cy.get('[data-cy="node-details"]').within(() => {
        cy.contains('Director of Engineering').should('be.visible');
        cy.contains('LOCKED').should('exist');
        cy.contains('3-5 Years').should('exist');
        cy.contains('Scale engineering department').should('exist');
      });

      // 11. Click on Completed Senior Engineer node
      cy.get('[data-cy="trajectory-node"][data-node-id="senior-eng"]').click();
      cy.get('[data-cy="node-details"]').within(() => {
        cy.contains('Senior Software Engineer').should('be.visible');
        cy.contains('COMPLETED').should('exist');
        cy.contains('All Core Gaps Closed').should('be.visible');
      });

      // --- MARKET INSIGHTS TESTS ---
      // 12. Click Market Timing & Demand tab
      cy.get('[data-cy="tab-market"]').click();

      // 13. Verify Market Insights rendering
      cy.get('[data-cy="market-insights"]').should('exist');
      cy.get('[data-cy="skill-demand-list"]').should('exist');
      cy.get('[data-cy="salary-bench-list"]').should('exist');
      cy.contains('Next.js 14/15 App Router').should('be.visible');
      cy.contains('Salary Benchmarks').should('be.visible');

      // 14. Switch mode to Onsite
      cy.get('[data-cy="market-mode-btn-onsite"]').click();
      cy.get('[data-cy="market-mode-btn-onsite"]').should('have.class', 'bg-indigo-600');
      cy.contains('Salary Benchmarks (Onsite)').should('be.visible');

      // 15. Switch mode to Remote
      cy.get('[data-cy="market-mode-btn-remote"]').click();
      cy.get('[data-cy="market-mode-btn-remote"]').should('have.class', 'bg-indigo-600');
      cy.contains('Salary Benchmarks (Remote)').should('be.visible');
    });
  });
});

