/**
 * Drag and Drop Tests
 * Tests for Kanban board swimlane interactions
 */

describe('Kanban Drag and Drop', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  describe('Swimlane Display', () => {
    it('should display all pipeline stages as swimlanes', () => {
      const stages = [
        'SOURCED',
        'INTERESTED',
        'RESUME_TAILORING',
        'APPLIED',
        'RECRUITER_SCREEN',
        'HIRING_MANAGER',
        'TECHNICAL_INTERVIEW',
        'SYSTEM_DESIGN',
        'BEHAVIORAL',
        'FINAL_ROUND',
        'OFFER',
        'NEGOTIATION',
        'REJECTED',
        'ARCHIVED',
      ];

      stages.forEach((stage) => {
        cy.get(`[data-cy="swimlane-${stage}"]`).should('exist');
      });
    });

    it('should display stage headers', () => {
      cy.get('[data-cy="swimlane-header"]').should('have.length.greaterThan', 0);
    });

    it('should display card count badges', () => {
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'APPLIED' });
      cy.createTestJob({ stage: 'TECHNICAL_INTERVIEW' });

      cy.get('[data-cy="swimlane-APPLIED"] [data-cy="card-count"]').should(
        'contain',
        '2'
      );
      cy.get('[data-cy="swimlane-TECHNICAL_INTERVIEW"] [data-cy="card-count"]')
        .should('contain', '1');
    });
  });

  describe('Basic Drag and Drop', () => {
    beforeEach(() => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });
    });

    it('should drag job card between swimlanes', () => {
      cy.dragJobCard('Test Job', 'RECRUITER_SCREEN');

      cy.get('[data-cy="swimlane-RECRUITER_SCREEN"]').should('contain', 'Test Job');
      cy.get('[data-cy="swimlane-APPLIED"]').should('not.contain', 'Test Job');
    });

    it('should update job stage in database', () => {
      cy.dragJobCard('Test Job', 'TECHNICAL_INTERVIEW');

      cy.request('GET', '/api/jobs').then((response) => {
        const job = response.body.find((j: any) => j.title === 'Test Job');
        expect(job.stage).to.equal('TECHNICAL_INTERVIEW');
      });
    });

    it('should show visual feedback during drag', () => {
      cy.get('[data-cy="job-card"]:contains("Test Job")')
        .trigger('mousedown', { button: 0 })
        .should('have.class', 'dragging');
    });
  });

  describe('Drop Zone Highlighting', () => {
    beforeEach(() => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });
    });

    it('should highlight drop zone on drag over', () => {
      cy.get('[data-cy="job-card"]:contains("Test Job")').trigger('dragstart');
      cy.get('[data-cy="swimlane-RECRUITER_SCREEN"]')
        .trigger('dragover')
        .should('have.class', 'drag-over');
    });

    it('should remove highlight when drag leaves', () => {
      cy.get('[data-cy="job-card"]:contains("Test Job")').trigger('dragstart');
      cy.get('[data-cy="swimlane-RECRUITER_SCREEN"]')
        .trigger('dragover')
        .trigger('dragleave')
        .should('not.have.class', 'drag-over');
    });
  });

  describe('Multiple Drag Operations', () => {
    it('should handle rapid consecutive drags', () => {
      cy.createTestJob({ title: 'Job 1', stage: 'APPLIED' });
      cy.createTestJob({ title: 'Job 2', stage: 'APPLIED' });

      cy.dragJobCard('Job 1', 'RECRUITER_SCREEN');
      cy.dragJobCard('Job 2', 'TECHNICAL_INTERVIEW');
      cy.dragJobCard('Job 1', 'TECHNICAL_INTERVIEW');

      cy.get('[data-cy="swimlane-RECRUITER_SCREEN"]').should('not.contain', 'Job 1');
      cy.get('[data-cy="swimlane-TECHNICAL_INTERVIEW"]').should('contain', 'Job 1');
      cy.get('[data-cy="swimlane-TECHNICAL_INTERVIEW"]').should('contain', 'Job 2');
    });

    it('should maintain card order within swimlane', () => {
      cy.createTestJob({ title: 'Job A', stage: 'APPLIED' });
      cy.createTestJob({ title: 'Job B', stage: 'APPLIED' });

      cy.get('[data-cy="swimlane-APPLIED"] [data-cy="job-card"]')
        .eq(0)
        .should('contain', 'Job A');
      cy.get('[data-cy="swimlane-APPLIED"] [data-cy="job-card"]')
        .eq(1)
        .should('contain', 'Job B');
    });
  });

  describe('Invalid Drop Handling', () => {
    it('should revert card if dropped outside swimlanes', () => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });

      cy.get('[data-cy="job-card"]:contains("Test Job")')
        .trigger('dragstart')
        .trigger('dragend', { pageX: 10, pageY: 10 });

      cy.get('[data-cy="swimlane-APPLIED"]').should('contain', 'Test Job');
    });

    it('should prevent drag to same swimlane', () => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });

      cy.get('[data-cy="swimlane-APPLIED"] [data-cy="job-card"]').then(
        ($before) => {
          const beforeCount = $before.length;

          cy.dragJobCard('Test Job', 'APPLIED');

          cy.get('[data-cy="swimlane-APPLIED"] [data-cy="job-card"]').should(
            'have.length',
            beforeCount
          );
        }
      );
    });
  });

  describe('Card Content', () => {
    it('should display job title', () => {
      cy.createTestJob({ title: 'Senior Engineer' });
      cy.get('[data-cy="job-card"]').should('contain', 'Senior Engineer');
    });

    it('should display company name', () => {
      cy.createTestJob({ company: 'TechCorp' });
      cy.get('[data-cy="job-card"]').should('contain', 'TechCorp');
    });

    it('should display match score', () => {
      cy.createTestJob({ matchScore: 87 });
      cy.get('[data-cy="job-card-match-score"]').should('contain', '87');
    });

    it('should display stage progress indicator', () => {
      cy.createTestJob({ stage: 'TECHNICAL_INTERVIEW' });
      cy.get('[data-cy="job-card-stage-indicator"]').should('exist');
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should support arrow keys for stage navigation', () => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });

      cy.get('[data-cy="job-card"]:contains("Test Job")')
        .focus()
        .type('{rightarrow}');

      cy.get('[data-cy="swimlane-RECRUITER_SCREEN"]').should('contain', 'Test Job');
    });

    it('should support Enter to move to next stage', () => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });

      cy.get('[data-cy="job-card"]:contains("Test Job")')
        .focus()
        .type('{enter}');

      cy.get('[data-cy="swimlane-RECRUITER_SCREEN"]').should('contain', 'Test Job');
    });

    it('should support Tab to cycle through cards', () => {
      cy.createTestJob({ title: 'Job 1', stage: 'APPLIED' });
      cy.createTestJob({ title: 'Job 2', stage: 'APPLIED' });

      cy.get('[data-cy="job-card"]').first().focus().tab();

      cy.focused().should('contain', 'Job 2');
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle drag operations with 100+ jobs', () => {
      // Create many jobs
      for (let i = 0; i < 100; i++) {
        cy.createTestJob({ title: `Job ${i}`, stage: 'APPLIED' });
      }

      // Drag should still be responsive
      cy.get('[data-cy="job-card"]').first().then(($card) => {
        const start = performance.now();

        cy.dragJobCard($card.text().trim(), 'RECRUITER_SCREEN');

        cy.then(() => {
          const end = performance.now();
          expect(end - start).to.be.lessThan(500); // Should complete in < 500ms
        });
      });
    });

    it('should render swimlanes efficiently with 500+ jobs', () => {
      for (let i = 0; i < 500; i++) {
        const stage = i % 3 === 0 ? 'APPLIED' : i % 3 === 1 ? 'RECRUITER_SCREEN' : 'TECHNICAL_INTERVIEW';
        cy.createTestJob({ title: `Job ${i}`, stage });
      }

      cy.visit('/');

      // Page should load within reasonable time
      cy.get('[data-cy="kanban-board"]', { timeout: 3000 }).should('exist');
    });
  });

  describe('Persistence', () => {
    it('should persist stage changes after page reload', () => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });

      cy.dragJobCard('Test Job', 'TECHNICAL_INTERVIEW');
      cy.reload();

      cy.get('[data-cy="swimlane-TECHNICAL_INTERVIEW"]').should('contain', 'Test Job');
      cy.get('[data-cy="swimlane-APPLIED"]').should('not.contain', 'Test Job');
    });

    it('should preserve drag history', () => {
      cy.createTestJob({ title: 'Test Job', stage: 'APPLIED' });

      cy.dragJobCard('Test Job', 'RECRUITER_SCREEN');
      cy.dragJobCard('Test Job', 'TECHNICAL_INTERVIEW');

      cy.request('GET', '/api/jobs/:id/history').then((response) => {
        expect(response.body).to.have.length.greaterThan(0);
      });
    });
  });

  describe('Card Expansion', () => {
    it('should show expanded card details on click', () => {
      cy.createTestJob({
        title: 'Test Job',
        company: 'TechCorp',
        matchScore: 85,
      });

      cy.get('[data-cy="job-card"]').click();
      cy.get('[data-cy="job-details-modal"]').should('be.visible');
      cy.get('[data-cy="job-details-modal"]').should('contain', 'TechCorp');
    });

    it('should allow inline editing from expanded view', () => {
      cy.createTestJob({ title: 'Test Job' });

      cy.get('[data-cy="job-card"]').click();
      cy.get('[data-cy="edit-priority"]').click();
      cy.get('select[name="priority"]').select('HIGH');
      cy.get('button:contains("Save")').click();

      cy.get('[data-cy="job-priority-badge"]').should('contain', 'HIGH');
    });
  });
});
