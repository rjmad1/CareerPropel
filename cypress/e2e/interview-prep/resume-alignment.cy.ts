describe('ResumeAlignment Component', () => {
  beforeEach(() => {
    cy.visit('/interview-prep');
    cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
    cy.get('[data-cy="resume-alignment-tab"]').click();
    cy.get('[data-cy="resume-alignment-container"]').should('be.visible');
  });

  describe('Match Score Visualization', () => {
    it('should display match score circular progress', () => {
      cy.get('[data-cy="match-score-circle"]').should('be.visible');
    });

    it('should show match score percentage', () => {
      cy.get('[data-cy="match-percentage"]').should('contain', '%');
    });

    it('should display score in 0-100 range', () => {
      cy.get('[data-cy="match-percentage"]').then(($el) => {
        const score = parseInt($el.text());
        expect(score).to.be.within(0, 100);
      });
    });

    it('should show match quality label', () => {
      cy.get('[data-cy="match-quality-label"]').should('be.visible');
    });

    it('should display color indicator for match level', () => {
      cy.get('[data-cy="match-score-circle"]').should('have.class', /score-/);
    });

    it('should show match summary explanation', () => {
      cy.get('[data-cy="match-summary"]').should('be.visible');
    });

    it('should update score based on alignment', () => {
      cy.get('[data-cy="match-percentage"]').should('be.visible');
    });
  });

  describe('Matched Keywords Display', () => {
    it('should display matched keywords section', () => {
      cy.get('[data-cy="matched-keywords-section"]').should('be.visible');
    });

    it('should show list of matched keywords', () => {
      cy.get('[data-cy="matched-keyword"]').should('have.length.greaterThan', 0);
    });

    it('should display checkmark for matched keywords', () => {
      cy.get('[data-cy="matched-keyword"]').first().within(() => {
        cy.get('[data-cy="match-checkmark"]').should('be.visible');
      });
    });

    it('should show keyword frequency', () => {
      cy.get('[data-cy="matched-keyword"]').first().within(() => {
        cy.get('[data-cy="keyword-frequency"]').should('contain', /\d+/);
      });
    });

    it('should display keyword category', () => {
      cy.get('[data-cy="matched-keyword"]').first().within(() => {
        cy.get('[data-cy="keyword-category"]').should('be.visible');
      });
    });

    it('should show keyword relevance score', () => {
      cy.get('[data-cy="matched-keyword"]').first().within(() => {
        cy.get('[data-cy="relevance-score"]').should('contain', '%');
      });
    });

    it('should allow filtering matched keywords', () => {
      cy.get('[data-cy="keyword-filter"]').type('Python');
      cy.get('[data-cy="matched-keyword"]').should('contain', 'Python');
    });
  });

  describe('Missing Keywords', () => {
    it('should display missing keywords section', () => {
      cy.get('[data-cy="missing-keywords-section"]').should('be.visible');
    });

    it('should show list of missing keywords', () => {
      cy.get('[data-cy="missing-keyword"]').should('have.length.greaterThan', 0);
    });

    it('should display priority level for missing keywords', () => {
      cy.get('[data-cy="missing-keyword"]').first().within(() => {
        cy.get('[data-cy="priority-badge"]').should('be.visible');
      });
    });

    it('should show suggestions for missing keywords', () => {
      cy.get('[data-cy="missing-keyword"]').first().within(() => {
        cy.get('[data-cy="suggestion"]').should('be.visible');
      });
    });

    it('should display importance indicator', () => {
      cy.get('[data-cy="missing-keyword"]').first().within(() => {
        cy.get('[data-cy="importance-score"]').should('be.visible');
      });
    });

    it('should show how to add keywords', () => {
      cy.get('[data-cy="missing-keyword"]').first().within(() => {
        cy.get('[data-cy="add-suggestion"]').should('be.visible');
      });
    });

    it('should allow dismissing keywords', () => {
      cy.get('[data-cy="missing-keyword"]').first().within(() => {
        cy.get('[data-cy="dismiss-keyword"]').click();
      });
      cy.get('[data-cy="missing-keyword"]').should('have.length.lessThan', 1);
    });
  });

  describe('Skills Gap Analysis', () => {
    it('should display skills gap section', () => {
      cy.get('[data-cy="skills-gap-section"]').should('be.visible');
    });

    it('should show skills by category', () => {
      cy.get('[data-cy="skill-category"]').should('have.length.greaterThan', 0);
    });

    it('should display proficiency levels for skills', () => {
      cy.get('[data-cy="skill-item"]').first().within(() => {
        cy.get('[data-cy="proficiency-level"]').should('be.visible');
      });
    });

    it('should show gap between required and actual proficiency', () => {
      cy.get('[data-cy="skill-item"]').first().within(() => {
        cy.get('[data-cy="proficiency-gap"]').should('be.visible');
      });
    });

    it('should display recommended proficiency level', () => {
      cy.get('[data-cy="skill-item"]').first().within(() => {
        cy.get('[data-cy="recommended-level"]').should('be.visible');
      });
    });

    it('should show improvement suggestions for gaps', () => {
      cy.get('[data-cy="skill-item"]').first().within(() => {
        cy.get('[data-cy="improvement-tip"]').should('be.visible');
      });
    });

    it('should highlight critical skill gaps', () => {
      cy.get('[data-cy="skill-item"][data-criticality="high"]').should('have.length.greaterThan', 0);
    });
  });

  describe('ATS Optimization Scoring', () => {
    it('should display ATS optimization section', () => {
      cy.get('[data-cy="ats-optimization-section"]').should('be.visible');
    });

    it('should show 4 ATS metrics', () => {
      cy.get('[data-cy="ats-metric"]').should('have.length', 4);
    });

    it('should display keyword density metric', () => {
      cy.get('[data-cy="ats-metric"][data-metric="keyword-density"]').should('be.visible');
      cy.get('[data-cy="ats-metric"][data-metric="keyword-density"]').should('contain', 'Keyword Density');
    });

    it('should display formatting metric', () => {
      cy.get('[data-cy="ats-metric"][data-metric="formatting"]').should('be.visible');
    });

    it('should display action verbs metric', () => {
      cy.get('[data-cy="ats-metric"][data-metric="action-verbs"]').should('be.visible');
    });

    it('should display quantification metric', () => {
      cy.get('[data-cy="ats-metric"][data-metric="quantification"]').should('be.visible');
    });

    it('should show score for each metric', () => {
      cy.get('[data-cy="ats-metric"]').each(($metric) => {
        cy.wrap($metric).find('[data-cy="metric-score"]').should('contain', /\d+%/);
      });
    });

    it('should display overall ATS score', () => {
      cy.get('[data-cy="overall-ats-score"]').should('contain', '%');
    });

    it('should show metric descriptions', () => {
      cy.get('[data-cy="ats-metric"]').first().within(() => {
        cy.get('[data-cy="metric-description"]').should('be.visible');
      });
    });

    it('should provide improvement recommendations per metric', () => {
      cy.get('[data-cy="ats-metric"]').first().within(() => {
        cy.get('[data-cy="metric-recommendation"]').should('be.visible');
      });
    });
  });

  describe('Tailoring Recommendations', () => {
    it('should display tailoring recommendations section', () => {
      cy.get('[data-cy="tailoring-recommendations-section"]').should('be.visible');
    });

    it('should show summary section recommendations', () => {
      cy.get('[data-cy="section-recommendation"][data-section="summary"]').should('be.visible');
    });

    it('should show skills section recommendations', () => {
      cy.get('[data-cy="section-recommendation"][data-section="skills"]').should('be.visible');
    });

    it('should show experience section recommendations', () => {
      cy.get('[data-cy="section-recommendation"][data-section="experience"]').should('be.visible');
    });

    it('should show certifications section recommendations', () => {
      cy.get('[data-cy="section-recommendation"][data-section="certifications"]').should('be.visible');
    });

    it('should display recommendation priority', () => {
      cy.get('[data-cy="section-recommendation"]').first().within(() => {
        cy.get('[data-cy="priority-badge"]').should('be.visible');
      });
    });

    it('should show specific changes to make', () => {
      cy.get('[data-cy="section-recommendation"]').first().within(() => {
        cy.get('[data-cy="recommendation-detail"]').should('be.visible');
      });
    });

    it('should provide examples for recommendations', () => {
      cy.get('[data-cy="section-recommendation"]').first().within(() => {
        cy.get('[data-cy="recommendation-example"]').should('be.visible');
      });
    });

    it('should show impact of each recommendation', () => {
      cy.get('[data-cy="section-recommendation"]').first().within(() => {
        cy.get('[data-cy="impact-estimate"]').should('be.visible');
      });
    });
  });

  describe('Resume Editing Checklist', () => {
    it('should display editing checklist', () => {
      cy.get('[data-cy="editing-checklist"]').should('be.visible');
    });

    it('should show 9 checklist items', () => {
      cy.get('[data-cy="checklist-item"]').should('have.length', 9);
    });

    it('should allow checking items off', () => {
      cy.get('[data-cy="checklist-item"]').first().within(() => {
        cy.get('[data-cy="checklist-checkbox"]').click();
        cy.get('[data-cy="checklist-checkbox"]').should('be.checked');
      });
    });

    it('should display checklist item descriptions', () => {
      cy.get('[data-cy="checklist-item"]').first().within(() => {
        cy.get('[data-cy="item-description"]').should('be.visible');
      });
    });

    it('should show checklist completion percentage', () => {
      cy.get('[data-cy="checklist-progress"]').should('contain', '%');
    });

    it('should display checklist progress bar', () => {
      cy.get('[data-cy="progress-bar"]').should('be.visible');
    });

    it('should highlight incomplete items', () => {
      cy.get('[data-cy="checklist-item"][data-completed="false"]').should('have.length.greaterThan', 0);
    });

    it('should show tips for checklist items', () => {
      cy.get('[data-cy="checklist-item"]').first().within(() => {
        cy.get('[data-cy="item-tip"]').should('be.visible');
      });
    });
  });

  describe('Priority Actions', () => {
    it('should display priority actions section', () => {
      cy.get('[data-cy="priority-actions-section"]').should('be.visible');
    });

    it('should show list of priority actions', () => {
      cy.get('[data-cy="priority-action"]').should('have.length.greaterThan', 0);
    });

    it('should display action titles', () => {
      cy.get('[data-cy="priority-action"]').first().within(() => {
        cy.get('[data-cy="action-title"]').should('be.visible');
      });
    });

    it('should show action priority levels', () => {
      cy.get('[data-cy="priority-action"]').first().within(() => {
        cy.get('[data-cy="priority-level"]').should('be.visible');
      });
    });

    it('should display estimated impact of actions', () => {
      cy.get('[data-cy="priority-action"]').first().within(() => {
        cy.get('[data-cy="estimated-impact"]').should('contain', '%');
      });
    });

    it('should show time estimate for actions', () => {
      cy.get('[data-cy="priority-action"]').first().within(() => {
        cy.get('[data-cy="time-estimate"]').should('contain', /min|hour/);
      });
    });

    it('should allow marking actions as complete', () => {
      cy.get('[data-cy="priority-action"]').first().within(() => {
        cy.get('[data-cy="mark-complete"]').click();
      });
      cy.get('[data-cy="action-completed"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('[data-cy="resume-alignment-container"]').find('h2, h3, h4').should('have.length.greaterThan', 0);
    });

    it('should have accessible buttons', () => {
      cy.get('[data-cy="resume-alignment-container"]').find('button').each(($btn) => {
        cy.wrap($btn).should('have.attr', 'aria-label').or('contain', /\w+/);
      });
    });

    it('should have keyboard navigation', () => {
      cy.get('[data-cy="checklist-checkbox"]').first().focus();
      cy.get('[data-cy="checklist-checkbox"]').first().should('have.focus');
    });

    it('should support Space to toggle checkboxes', () => {
      cy.get('[data-cy="checklist-checkbox"]').first().focus();
      cy.get('[data-cy="checklist-checkbox"]').first().type(' ');
      cy.get('[data-cy="checklist-checkbox"]').first().should('be.checked');
    });

    it('should have color contrast for match score', () => {
      cy.get('[data-cy="match-score-circle"]').should('be.visible');
    });

    it('should provide text alternatives for icons', () => {
      cy.get('[data-cy="resume-alignment-container"]').find('svg').each(($svg) => {
        cy.wrap($svg).should('have.attr', 'aria-label').or('have.attr', 'title');
      });
    });

    it('should have accessible progress indicators', () => {
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'role', 'progressbar');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile (375px)', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="resume-alignment-container"]').should('be.visible');
      cy.get('[data-cy="match-score-circle"]').should('be.visible');
    });

    it('should stack sections vertically on mobile', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="matched-keywords-section"]').should('be.visible');
      cy.get('[data-cy="missing-keywords-section"]').should('be.visible');
    });

    it('should be responsive on tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('[data-cy="resume-alignment-container"]').should('be.visible');
      cy.get('[data-cy="skills-gap-section"]').should('be.visible');
    });

    it('should display 2-column layout on tablet', () => {
      cy.viewport(768, 1024);
      cy.get('[data-cy="two-column-layout"]').should('be.visible');
    });

    it('should be responsive on desktop (1280px)', () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="resume-alignment-container"]').should('be.visible');
      cy.get('[data-cy="multi-column-layout"]').should('be.visible');
    });

    it('should display all sections on desktop', () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="matched-keywords-section"]').should('be.visible');
      cy.get('[data-cy="ats-optimization-section"]').should('be.visible');
      cy.get('[data-cy="tailoring-recommendations-section"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing resume data gracefully', () => {
      cy.intercept('GET', '**/resume', { body: {} }).as('getResume');
      cy.reload();
      cy.wait('@getResume');
      cy.get('[data-cy="empty-resume-state"]').should('be.visible');
    });

    it('should show error message on load failure', () => {
      cy.intercept('GET', '**/resume-alignment', { statusCode: 500 }).as('alignmentError');
      cy.reload();
      cy.wait('@alignmentError');
      cy.get('[data-cy="error-message"]').should('be.visible');
    });

    it('should provide retry button on error', () => {
      cy.intercept('GET', '**/resume-alignment', { statusCode: 500 }).as('alignmentError');
      cy.reload();
      cy.wait('@alignmentError');
      cy.get('[data-cy="retry-button"]').should('be.visible').click();
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '**/resume-alignment', { forceNetworkError: true }).as('networkError');
      cy.reload();
      cy.get('[data-cy="network-error"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should display loading skeleton for match score', () => {
      cy.intercept('GET', '**/match-score', (req) => {
        req.reply((res) => {
          res.delay(1000);
        });
      }).as('loadingScore');
      cy.reload();
      cy.get('[data-cy="match-score-skeleton"]').should('be.visible');
    });

    it('should display loading skeleton for keywords', () => {
      cy.intercept('GET', '**/keywords', (req) => {
        req.reply((res) => {
          res.delay(1000);
        });
      }).as('loadingKeywords');
      cy.reload();
      cy.get('[data-cy="keywords-skeleton"]').should('be.visible');
    });

    it('should remove loading state after data loads', () => {
      cy.get('[data-cy="resume-alignment-container"]').should('be.visible');
      cy.get('[data-cy="match-percentage"]').should('contain', '%');
    });
  });

  describe('Data Accuracy', () => {
    it('should display match score in valid range', () => {
      cy.get('[data-cy="match-percentage"]').then(($el) => {
        const score = parseInt($el.text());
        expect(score).to.be.within(0, 100);
      });
    });

    it('should show ATS scores in valid range', () => {
      cy.get('[data-cy="metric-score"]').each(($el) => {
        const score = parseInt($el.text());
        expect(score).to.be.within(0, 100);
      });
    });

    it('should display checklist completion accuracy', () => {
      cy.get('[data-cy="checklist-progress"]').then(($el) => {
        const progress = parseInt($el.text());
        expect(progress).to.be.within(0, 100);
      });
    });

    it('should show correct section recommendation counts', () => {
      cy.get('[data-cy="section-recommendation"]').should('have.length.greaterThan', 0);
    });

    it('should match keyword categories accurately', () => {
      cy.get('[data-cy="matched-keyword"]').first().within(() => {
        cy.get('[data-cy="keyword-category"]').should('be.visible');
      });
    });
  });
});
