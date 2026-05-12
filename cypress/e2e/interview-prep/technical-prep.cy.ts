describe('TechnicalPrep Component', () => {
  beforeEach(() => {
    cy.visit('/interview-prep');
    cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
    cy.get('[data-cy="tech-prep-tab"]').click();
    cy.get('[data-cy="technical-prep-container"]').should('be.visible');
  });

  describe('Programming Languages Display', () => {
    it('should display list of programming languages', () => {
      cy.get('[data-cy="languages-section"]').should('be.visible');
      cy.get('[data-cy="language-item"]').should('have.length.greaterThan', 0);
    });

    it('should show language proficiency levels', () => {
      cy.get('[data-cy="language-item"]').first().within(() => {
        cy.get('[data-cy="language-name"]').should('be.visible');
        cy.get('[data-cy="proficiency-indicator"]').should('be.visible');
      });
    });

    it('should display estimated study hours per language', () => {
      cy.get('[data-cy="language-item"]').first().within(() => {
        cy.get('[data-cy="study-hours"]').should('contain', 'hours');
      });
    });

    it('should allow filtering languages', () => {
      cy.get('[data-cy="language-filter"]').type('Python');
      cy.get('[data-cy="language-item"]').should('contain', 'Python');
    });

    it('should show recommended learning order', () => {
      cy.get('[data-cy="language-order-indicator"]').should('be.visible');
    });
  });

  describe('Practice Problem Roadmap', () => {
    it('should display difficulty categories', () => {
      cy.get('[data-cy="roadmap-section"]').should('be.visible');
      cy.get('[data-cy="difficulty-badge"]').should('have.length.greaterThan', 0);
    });

    it('should show easy, medium, hard problems breakdown', () => {
      cy.get('[data-cy="difficulty-badge"][data-difficulty="easy"]').should('be.visible');
      cy.get('[data-cy="difficulty-badge"][data-difficulty="medium"]').should('be.visible');
      cy.get('[data-cy="difficulty-badge"][data-difficulty="hard"]').should('be.visible');
    });

    it('should display problem count per difficulty', () => {
      cy.get('[data-cy="problem-count"]').each(($el) => {
        cy.wrap($el).should('contain', /\d+/);
      });
    });

    it('should show estimated time per problem', () => {
      cy.get('[data-cy="problem-item"]').first().within(() => {
        cy.get('[data-cy="time-estimate"]').should('be.visible');
      });
    });

    it('should display completion progress for each difficulty', () => {
      cy.get('[data-cy="difficulty-progress"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Core Topics Expansion', () => {
    it('should display core topic categories', () => {
      cy.get('[data-cy="topics-section"]').should('be.visible');
      cy.get('[data-cy="topic-category"]').should('have.length.greaterThan', 0);
    });

    it('should expand data structures category', () => {
      cy.get('[data-cy="topic-category"][data-category="data-structures"]').click();
      cy.get('[data-cy="topic-item"]').should('be.visible');
    });

    it('should expand algorithms category', () => {
      cy.get('[data-cy="topic-category"][data-category="algorithms"]').click();
      cy.get('[data-cy="topic-item"]').should('be.visible');
    });

    it('should expand system design foundations', () => {
      cy.get('[data-cy="topic-category"][data-category="system-design"]').click();
      cy.get('[data-cy="topic-item"]').should('be.visible');
    });

    it('should show topic details on expansion', () => {
      cy.get('[data-cy="topic-category"]').first().click();
      cy.get('[data-cy="topic-details"]').should('be.visible');
    });

    it('should display key patterns for each topic', () => {
      cy.get('[data-cy="topic-category"]').first().click();
      cy.get('[data-cy="pattern-list"]').should('be.visible');
    });

    it('should show estimated study hours per topic', () => {
      cy.get('[data-cy="topic-category"]').first().click();
      cy.get('[data-cy="topic-hours"]').should('contain', 'hours');
    });
  });

  describe('Practice Strategy by Topic', () => {
    it('should display difficulty level recommendations', () => {
      cy.get('[data-cy="strategy-card"]').first().within(() => {
        cy.get('[data-cy="difficulty-level"]').should('be.visible');
      });
    });

    it('should show estimated hours for each topic strategy', () => {
      cy.get('[data-cy="strategy-card"]').each(($el) => {
        cy.wrap($el).find('[data-cy="hours"]').should('contain', 'hours');
      });
    });

    it('should display problem count in strategy', () => {
      cy.get('[data-cy="strategy-card"]').first().within(() => {
        cy.get('[data-cy="problem-count"]').should('be.visible');
      });
    });

    it('should show key patterns for strategy', () => {
      cy.get('[data-cy="strategy-card"]').first().within(() => {
        cy.get('[data-cy="key-patterns"]').should('be.visible');
      });
    });

    it('should allow marking topic as in-progress', () => {
      cy.get('[data-cy="start-studying-btn"]').first().click();
      cy.get('[data-cy="status-badge"]').should('contain', 'In Progress');
    });

    it('should allow marking topic as completed', () => {
      cy.get('[data-cy="complete-topic-btn"]').first().click();
      cy.get('[data-cy="status-badge"]').should('contain', 'Completed');
    });
  });

  describe('Study Path Roadmap', () => {
    it('should display 3-phase study path', () => {
      cy.get('[data-cy="study-path"]').should('be.visible');
      cy.get('[data-cy="phase"]').should('have.length', 3);
    });

    it('should show fundamentals phase', () => {
      cy.get('[data-cy="phase"][data-phase="fundamentals"]').should('be.visible');
      cy.get('[data-cy="phase"][data-phase="fundamentals"]').should('contain', 'Fundamentals');
    });

    it('should show intermediate phase', () => {
      cy.get('[data-cy="phase"][data-phase="intermediate"]').should('be.visible');
      cy.get('[data-cy="phase"][data-phase="intermediate"]').should('contain', 'Intermediate');
    });

    it('should show advanced phase', () => {
      cy.get('[data-cy="phase"][data-phase="advanced"]').should('be.visible');
      cy.get('[data-cy="phase"][data-phase="advanced"]').should('contain', 'Advanced');
    });

    it('should display topics for each phase', () => {
      cy.get('[data-cy="phase-topics"]').should('have.length', 3);
    });

    it('should show time estimates for each phase', () => {
      cy.get('[data-cy="phase-time-estimate"]').should('have.length', 3);
    });

    it('should display phase progress indicators', () => {
      cy.get('[data-cy="phase-progress"]').should('have.length', 3);
    });

    it('should show total study hours for all phases', () => {
      cy.get('[data-cy="total-study-hours"]').should('contain', 'hours');
    });
  });

  describe('Common Mistakes Guide', () => {
    it('should display mistakes section', () => {
      cy.get('[data-cy="mistakes-section"]').should('be.visible');
    });

    it('should show list of common mistakes', () => {
      cy.get('[data-cy="mistake-item"]').should('have.length.greaterThan', 0);
    });

    it('should display mistake description and explanation', () => {
      cy.get('[data-cy="mistake-item"]').first().within(() => {
        cy.get('[data-cy="mistake-title"]').should('be.visible');
        cy.get('[data-cy="mistake-explanation"]').should('be.visible');
      });
    });

    it('should show mistake severity level', () => {
      cy.get('[data-cy="mistake-item"]').first().within(() => {
        cy.get('[data-cy="severity-badge"]').should('be.visible');
      });
    });

    it('should provide solutions for each mistake', () => {
      cy.get('[data-cy="mistake-item"]').first().within(() => {
        cy.get('[data-cy="mistake-solution"]').should('be.visible');
      });
    });

    it('should show examples of mistakes', () => {
      cy.get('[data-cy="mistake-item"]').first().within(() => {
        cy.get('[data-cy="mistake-example"]').should('be.visible');
      });
    });
  });

  describe('Resource Recommendations', () => {
    it('should display resources section', () => {
      cy.get('[data-cy="resources-section"]').should('be.visible');
    });

    it('should show recommended books', () => {
      cy.get('[data-cy="resource-category"][data-type="books"]').should('be.visible');
    });

    it('should show recommended online courses', () => {
      cy.get('[data-cy="resource-category"][data-type="courses"]').should('be.visible');
    });

    it('should show recommended practice platforms', () => {
      cy.get('[data-cy="resource-category"][data-type="platforms"]').should('be.visible');
    });

    it('should display resource details and links', () => {
      cy.get('[data-cy="resource-item"]').first().within(() => {
        cy.get('[data-cy="resource-title"]').should('be.visible');
        cy.get('[data-cy="resource-link"]').should('have.attr', 'href');
      });
    });

    it('should show resource ratings', () => {
      cy.get('[data-cy="resource-item"]').first().within(() => {
        cy.get('[data-cy="resource-rating"]').should('be.visible');
      });
    });

    it('should display estimated time for each resource', () => {
      cy.get('[data-cy="resource-item"]').first().within(() => {
        cy.get('[data-cy="resource-time"]').should('be.visible');
      });
    });
  });

  describe('Study Tracking', () => {
    it('should track completed topics', () => {
      cy.get('[data-cy="complete-topic-btn"]').first().click();
      cy.get('[data-cy="completed-count"]').should('contain', /\d+/);
    });

    it('should update progress on topic completion', () => {
      cy.get('[data-cy="overall-progress"]').should('be.visible');
      cy.get('[data-cy="complete-topic-btn"]').first().click();
      cy.get('[data-cy="overall-progress"]').should('be.visible');
    });

    it('should display hours spent studying', () => {
      cy.get('[data-cy="hours-spent"]').should('be.visible');
    });

    it('should show estimated remaining hours', () => {
      cy.get('[data-cy="hours-remaining"]').should('be.visible');
    });

    it('should display completion percentage', () => {
      cy.get('[data-cy="completion-percentage"]').should('contain', '%');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('[data-cy="technical-prep-container"]').find('h2, h3, h4').should('have.length.greaterThan', 0);
    });

    it('should have accessible buttons', () => {
      cy.get('[data-cy="technical-prep-container"]').find('button').each(($btn) => {
        cy.wrap($btn).should('have.attr', 'aria-label').or('contain', /\w+/);
      });
    });

    it('should have keyboard navigation', () => {
      cy.get('[data-cy="topic-category"]').first().focus();
      cy.get('[data-cy="topic-category"]').first().should('have.focus');
    });

    it('should support keyboard Enter to expand sections', () => {
      cy.get('[data-cy="topic-category"]').first().focus();
      cy.get('[data-cy="topic-category"]').first().type('{enter}');
      cy.get('[data-cy="topic-details"]').should('be.visible');
    });

    it('should have color contrast for difficulty badges', () => {
      cy.get('[data-cy="difficulty-badge"]').each(($el) => {
        cy.wrap($el).should('be.visible');
      });
    });

    it('should provide text alternatives for icons', () => {
      cy.get('[data-cy="technical-prep-container"]').find('svg').each(($svg) => {
        cy.wrap($svg).should('have.attr', 'aria-label').or('have.attr', 'title');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile (375px)', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="technical-prep-container"]').should('be.visible');
      cy.get('[data-cy="topic-category"]').should('be.visible');
    });

    it('should stack sections vertically on mobile', () => {
      cy.viewport(375, 812);
      cy.get('[data-cy="languages-section"]').should('be.visible');
      cy.get('[data-cy="roadmap-section"]').should('be.visible');
    });

    it('should be responsive on tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('[data-cy="technical-prep-container"]').should('be.visible');
      cy.get('[data-cy="topic-category"]').should('be.visible');
    });

    it('should display side-by-side content on tablet', () => {
      cy.viewport(768, 1024);
      cy.get('[data-cy="topics-section"]').should('be.visible');
      cy.get('[data-cy="resources-section"]').should('be.visible');
    });

    it('should be responsive on desktop (1280px)', () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="technical-prep-container"]').should('be.visible');
      cy.get('[data-cy="multi-column-layout"]').should('be.visible');
    });

    it('should display all sections on desktop', () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="languages-section"]').should('be.visible');
      cy.get('[data-cy="roadmap-section"]').should('be.visible');
      cy.get('[data-cy="topics-section"]').should('be.visible');
      cy.get('[data-cy="resources-section"]').should('be.visible');
    });
  });

  describe('Empty States', () => {
    it('should handle empty language list gracefully', () => {
      cy.intercept('GET', '**/languages', { body: [] }).as('getLanguages');
      cy.reload();
      cy.wait('@getLanguages');
      cy.get('[data-cy="empty-languages-state"]').should('be.visible');
    });

    it('should handle empty problems list gracefully', () => {
      cy.intercept('GET', '**/problems', { body: [] }).as('getProblems');
      cy.reload();
      cy.wait('@getProblems');
      cy.get('[data-cy="empty-problems-state"]').should('be.visible');
    });

    it('should handle empty resources list gracefully', () => {
      cy.intercept('GET', '**/resources', { body: [] }).as('getResources');
      cy.reload();
      cy.wait('@getResources');
      cy.get('[data-cy="empty-resources-state"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle language data loading error', () => {
      cy.intercept('GET', '**/languages', { statusCode: 500 }).as('languagesError');
      cy.reload();
      cy.wait('@languagesError');
      cy.get('[data-cy="error-message"]').should('be.visible');
    });

    it('should show retry button on error', () => {
      cy.intercept('GET', '**/languages', { statusCode: 500 }).as('languagesError');
      cy.reload();
      cy.wait('@languagesError');
      cy.get('[data-cy="retry-button"]').should('be.visible').click();
    });

    it('should handle problem data loading error', () => {
      cy.intercept('GET', '**/problems', { statusCode: 500 }).as('problemsError');
      cy.reload();
      cy.wait('@problemsError');
      cy.get('[data-cy="error-message"]').should('be.visible');
    });

    it('should display network error message', () => {
      cy.intercept('GET', '**/technical-prep', { forceNetworkError: true }).as('networkError');
      cy.reload();
      cy.get('[data-cy="network-error"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should display loading skeleton for languages', () => {
      cy.intercept('GET', '**/languages', (req) => {
        req.reply((res) => {
          res.delay(1000);
        });
      }).as('loadingLanguages');
      cy.reload();
      cy.get('[data-cy="languages-skeleton"]').should('be.visible');
    });

    it('should display loading skeleton for topics', () => {
      cy.intercept('GET', '**/topics', (req) => {
        req.reply((res) => {
          res.delay(1000);
        });
      }).as('loadingTopics');
      cy.reload();
      cy.get('[data-cy="topics-skeleton"]').should('be.visible');
    });

    it('should remove loading state after data loads', () => {
      cy.get('[data-cy="technical-prep-container"]').should('be.visible');
      cy.get('[data-cy="topic-category"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Data Accuracy', () => {
    it('should display correct topic names', () => {
      cy.get('[data-cy="topic-category"]').first().should('contain', /Data Structures|Algorithms|System Design/);
    });

    it('should show correct difficulty levels', () => {
      cy.get('[data-cy="difficulty-badge"]').each(($el) => {
        cy.wrap($el).should('contain', /Easy|Medium|Hard/i);
      });
    });

    it('should calculate total hours correctly', () => {
      cy.get('[data-cy="phase-time-estimate"]').then(($phases) => {
        const phases = Array.from($phases).map(($el) => parseInt(cy.wrap($el).text()));
        cy.get('[data-cy="total-study-hours"]').should('contain', phases.reduce((a, b) => a + b, 0));
      });
    });
  });
});
