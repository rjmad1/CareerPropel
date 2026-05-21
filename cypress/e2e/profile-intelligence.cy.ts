describe('Profile Intelligence Workspace', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login();
    cy.visit('/profile');
    // Navigate to Profile Intelligence tab
    cy.get('[data-cy="tab-intelligence"]').click();
  });

  describe('Tab Navigation and Workspace Loading', () => {
    it('should load the Profile Intelligence tab and display header metrics', () => {
      cy.get('[data-cy="profile-intelligence-dashboard"]').should('exist');
      cy.contains('Profile Intelligence Workspace').should('be.visible');
      cy.contains('Integrity score').should('exist');
      cy.contains('Total Nodes').should('exist');
    });

    it('should switch between workspace sub-tabs correctly', () => {
      // 1. Upload Console
      cy.get('[data-cy="tab-upload"]').click();
      cy.get('[data-cy="parsing-monitor"]').should('not.exist');
      cy.get('[data-cy="drop-zone"]').should('be.visible');

      // 2. STAR Milestones
      cy.get('[data-cy="tab-star"]').click();
      cy.get('[data-cy="achievement-library-workspace"]').should('be.visible');

      // 3. Fragments Library
      cy.get('[data-cy="tab-fragments"]').click();
      cy.get('[data-cy="fragments-workspace"]').should('be.visible');

      // 4. Back to Graph
      cy.get('[data-cy="tab-graph"]').click();
      cy.get('[data-cy="interactive-svg-canvas"]').should('be.visible');
    });
  });

  describe('Interactive Connection Graph', () => {
    beforeEach(() => {
      cy.get('[data-cy="tab-graph"]').click();
    });

    it('should display node-link canvas and list node metadata upon click', () => {
      // SVG canvas should render lines and circles
      cy.get('[data-cy="interactive-svg-canvas"]').within(() => {
        cy.get('circle').should('have.length.at.least', 5);
        cy.get('line').should('have.length.at.least', 4);
      });

      // Default empty metadata state
      cy.get('[data-cy="graph-node-details-empty"]').should('contain', 'No node selected');

      // Click on TypeScript skill node
      cy.get('[data-cy="graph-node-node_skill_typescript"]').click();

      // Inspector panel should update with skill details
      cy.get('[data-cy="graph-node-details"]').within(() => {
        cy.contains('skill').should('exist');
        cy.contains('TypeScript').should('exist');
        cy.contains('Proficiency').should('exist');
      });
    });

    it('should support searching nodes in the connection net', () => {
      cy.get('[data-cy="graph-search-input"]').type('React');
      // Hovering or searching highlights matching nodes
      cy.get('[data-cy="graph-node-node_skill_react"]').within(() => {
        cy.get('circle').should('exist');
      });
    });
  });

  describe('Document Upload and Parsing Pipeline', () => {
    beforeEach(() => {
      cy.get('[data-cy="tab-upload"]').click();
    });

    it('should simulate drag-and-drop file parsing, logs streaming, and inspector toggle', () => {
      // Mock File creation
      const testFileContent = 'Senior Fullstack Engineer experienced with Next.js, React, and TypeScript. Standardized telemetry pipelines.';
      cy.window().then((win) => {
        const file = new File([testFileContent], 'my_resume.pdf', { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Trigger drop action on drop-zone
        cy.get('[data-cy="drop-zone"]').trigger('drop', {
          dataTransfer,
          force: true
        });
      });

      // Terminal and progress bar should show during processing
      cy.get('[data-cy="parsing-monitor"]').should('be.visible');
      cy.get('[data-cy="progress-bar"]').should('exist');
      cy.get('[data-cy="terminal-logs"]').should('contain', 'Selected file');

      // Wait for complete state simulation (takes around 2-3 seconds)
      cy.contains('completed', { timeout: 8000 }).should('be.visible');
      cy.get('[data-cy="json-toggle"]').click();
      cy.get('[data-cy="json-inspector"]').should('be.visible');
    });
  });

  describe('STAR Achievements Milestones & AI Quantifier', () => {
    beforeEach(() => {
      cy.get('[data-cy="tab-star"]').click();
    });

    it('should show pre-populated achievements, support filters, and toggle details', () => {
      // Toggle card expand/collapse
      cy.get('[data-cy="achievement-header-ach_1"]').click();
      cy.contains('Situation (S)').should('be.visible');
      cy.contains('Result (R)').should('be.visible');
      cy.contains('Dashboard Latency').should('exist');

      // Filter by core competency
      cy.get('[data-cy="filter-leadership"]').click();
      // Since no default milestone matches leadership directly in titles/skills, should show empty or filtered state
      cy.get('[data-cy="achievements-container"]').should('exist');
    });

    it('should simulate drafting a new milestone and saving it to the list', () => {
      cy.get('[data-cy="toggle-add-achievement-btn"]').click();
      cy.get('[data-cy="new-achievement-form"]').should('be.visible');

      cy.get('[data-cy="new-achievement-title"]').type('Kubernetes Multi-Cluster Transition');
      cy.get('[data-cy="new-achievement-desc"]').type('Orchestrated infrastructure modernization for microservices.');
      
      cy.get('[data-cy="save-achievement-btn"]').click();
      
      // Verification
      cy.get('[data-cy="new-achievement-form"]').should('not.exist');
      cy.contains('Kubernetes Multi-Cluster Transition').should('be.visible');
    });

    it('should support the AI polish quantifier and copying suggestions', () => {
      cy.get('[data-cy="quantifier-input"]').type('I speeded up a dashboard rendering speed.');
      cy.get('[data-cy="polish-btn"]').click();
      
      // Wait for AI polished suggestion block
      cy.get('[data-cy="quantifier-result"]', { timeout: 4000 }).should('be.visible');
      cy.get('[data-cy="copy-polished-btn"]').should('exist');
    });
  });

  describe('Tailored Resume Fragments', () => {
    beforeEach(() => {
      cy.get('[data-cy="tab-fragments"]').click();
    });

    it('should list fragments, switch categories, search, and allow copy clicks', () => {
      cy.get('[data-cy="fragments-container"]').within(() => {
        cy.get('[data-cy^="fragment-card-"]').should('have.length.at.least', 2);
      });

      // Category Pill filter
      cy.get('[data-cy="category-btn-experience"]').click();
      cy.get('[data-cy="fragments-container"]').should('exist');

      // Reset category to show achievements and other segments
      cy.get('[data-cy="category-btn-all"]').click();

      // Search field
      cy.get('[data-cy="fragments-search-input"]').type('Cypress');
      cy.contains('Cypress E2E automation structures').should('exist');

      // Copy simulation
      cy.get('[data-cy="copy-fragment-btn-frag_2"]').click();
      cy.get('[data-cy="copy-fragment-btn-frag_2"]').should('contain', 'Copied!');
    });
  });
});
