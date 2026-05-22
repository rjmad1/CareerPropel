describe('Resume Lab Workspace', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then(win => win.sessionStorage.clear());
    cy.visit('/');
    cy.login();
    cy.visit('/resume-lab');
    // Confirm expected initial variants are present before each test
    cy.get('[data-cy="variant-card-var_1"]').should('exist');
    cy.get('[data-cy="variant-card-var_2"]').should('exist');
  });

  describe('Workspace Loading & Statistics Dashboard', () => {
    it('should successfully render the workspace and core metrics', () => {
      // 1. Workspace container
      cy.get('[data-cy="resume-lab-workspace"]').should('exist');
      
      // 2. Main title & description
      cy.contains('Resume Lab Workspace').should('be.visible');
      cy.contains('Create, compare, and modify customized resume versions').should('be.visible');
      
      // 3. Stats widget cards
      cy.contains('Active Variants').should('exist');
      cy.contains('Avg Integrity').should('exist');
      cy.contains('Export Format').should('exist');
    });
  });

  describe('Variant Manager & Version Controller', () => {
    it('should support toggling, creating, and selecting variant items', () => {
      // 4. Verify pre-populated variants are visible
      cy.get('[data-cy="variant-manager-workspace"]').should('exist');
      cy.get('[data-cy="variant-card-var_1"]').should('exist');
      cy.get('[data-cy="variant-card-var_2"]').should('exist');

      // 5. Open new variant creation modal/form
      cy.get('[data-cy="toggle-create-variant-btn"]').click();
      cy.get('[data-cy="create-variant-form"]').should('be.visible');

      // 6. Fill out variant form fields
      cy.get('[data-cy="variant-name-input"]').type('Executive Devops & Telemetry Architect');
      cy.get('[data-cy="variant-role-input"]').type('Staff Cloud Infrastructure Lead');
      cy.get('[data-cy="variant-desc-input"]').type('Stresses automated k8s sharding, caching layers and AWS telemetry pipelines.');

      // 7. Submit form to create variant
      cy.get('[data-cy="save-variant-btn"]').click();

      // 8. Verify the new variant card has been appended and selected
      cy.get('[data-cy="create-variant-form"]').should('not.exist');
      cy.contains('Executive Devops & Telemetry Architect').should('be.visible');
      cy.get('[data-cy="variant-card-var_1"]').should('have.attr', 'data-selected', 'false'); // Var 1 should be deselected
    });

    it('should support comparing two variants side-by-side', () => {
      // 9. Click on comparison button for the second variant
      cy.get('[data-cy="compare-btn-var_2"]').click();

      // 10. Matrix view should render displaying side-by-side markdown comparison
      cy.get('[data-cy="comparison-view"]').should('be.visible');
      cy.contains('Side-by-Side Comparison Matrix').should('be.visible');
      cy.contains('General UI & Telemetry Specialist').should('be.visible'); // Active primary
      cy.contains('Backend Caching & Decoupling Focus').should('be.visible'); // Compared variant

      // 11. Close the comparison view
      cy.contains('Close Comparison').click();
      cy.get('[data-cy="comparison-view"]').should('not.exist');
    });

    it('should support deleting a variant successfully', () => {
      // 12. Trigger delete on the second variant card
      cy.get('[data-cy="delete-btn-var_2"]').click();

      // 13. Verify the variant has been removed from the panel
      cy.get('[data-cy="variant-card-var_2"]').should('not.exist');
    });
  });

  describe('Split-Screen Interactive Markdown Editor', () => {
    it('should display keywords, ATS analysis, support tab modes and real-time updates', () => {
      // 14. Verify main editor workspace components are present
      cy.get('[data-cy="resume-editor-workspace"]').should('exist');
      cy.contains('Key Keywords Alignment').should('be.visible');
      cy.get('[data-cy="keyword-alignment-TypeScript"]').should('exist');
      cy.get('[data-cy="keyword-alignment-React"]').should('exist');

      // 15. Check default split-screen view showing both editor & paper preview
      cy.get('[data-cy="markdown-editor"]').should('be.visible');
      cy.get('[data-cy="paper-preview"]').should('be.visible');

      // 16. Switch to Edit Mode (expands editor, hides preview)
      cy.get('[data-cy="mode-edit-btn"]').click();
      cy.get('[data-cy="markdown-editor"]').should('be.visible');
      cy.get('[data-cy="paper-preview"]').should('not.exist');

      // 17. Switch to Preview Mode (expands paper preview, hides editor)
      cy.get('[data-cy="mode-preview-btn"]').click();
      cy.get('[data-cy="paper-preview"]').should('be.visible');
      cy.get('[data-cy="markdown-editor"]').should('not.exist');

      // Return to split view for next actions
      cy.get('[data-cy="mode-split-btn"]').click();

      // 18. Capture baseline values, then simulate editing without keywords
      cy.get('[data-cy="keyword-match-count"]').invoke('text').as('initialCount');
      cy.get('[data-cy="ats-match-score"]').invoke('text').as('initialScore');

      cy.get('[data-cy="markdown-editor"]').clear().type('# John Doe\n## Core Expertise\n- Systems: Docker\n- Languages: Python');

      // Keywords alignment and match score should adjust downwards (not exact values)
      cy.get('[data-cy="keyword-match-count"]').invoke('text').then(newCount => {
        cy.get('@initialCount').then(initialCount => {
          const newMatched = parseInt((newCount as string).split('/')[0]);
          const initialMatched = parseInt((initialCount as string).split('/')[0]);
          expect(newMatched).to.be.lessThan(initialMatched);
        });
      });
      cy.get('[data-cy="ats-match-score"]').invoke('text').then(newScore => {
        cy.get('@initialScore').then(initialScore => {
          expect(parseInt(newScore as string)).to.be.lessThan(parseInt(initialScore as string));
        });
      });

      // 19. Type keywords to raise keyword match count
      cy.get('[data-cy="markdown-editor"]').type('\nAdding React, Next.js, and TypeScript, Redis, System Design skills.');
      cy.get('[data-cy="keyword-match-count"]').invoke('text').then(count => {
        expect(parseInt((count as string).split('/')[0])).to.be.greaterThan(2);
      });

      // 20. Copy Markdown clipboard copy button — verify UI feedback and clipboard content
      cy.get('[data-cy="copy-markdown-btn"]').click();
      cy.get('[data-cy="copy-markdown-btn"]').should('contain', 'Copied!');
      cy.window().then(win => win.navigator.clipboard.readText()).then(text => {
        expect(text).to.not.be.empty;
        expect(text).to.include('John Doe');
      });
    });
  });
});
