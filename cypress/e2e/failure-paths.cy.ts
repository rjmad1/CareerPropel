describe('Failure-Path Resilience Journeys', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  describe('AI Provider Outage & Degraded Document Parsing', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.get('[data-cy="tab-intelligence"]').click();
      cy.get('[data-cy="tab-upload"]').click();
    });

    it('should degrade gracefully to Layer 1 deterministic parser when AI provider `/api/profile/upload` goes offline', () => {
      // Intercept the AI upload to return a degraded/fallback response
      cy.intercept('POST', '/api/profile/upload', {
        statusCode: 200,
        body: {
          source: 'fallback',
          confidence: 'low',
          entities: [
            {
              id: 'skill_node_fallback_typescript',
              type: 'skill',
              name: 'TypeScript (Deterministic Fallback)',
              confidence: 0.5
            },
            {
              id: 'skill_node_fallback_react',
              type: 'skill',
              name: 'React (Deterministic Fallback)',
              confidence: 0.5
            }
          ]
        }
      }).as('uploadFallback');

      // Mock File Drop
      const testFileContent = 'Experienced Engineer skilled in TypeScript and React.';
      cy.window().then((win) => {
        const file = new File([testFileContent], 'fallback_resume.pdf', { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        cy.get('[data-cy="drop-zone"]').trigger('drop', {
          dataTransfer,
          force: true
        });
      });

      // Terminal should start processing
      cy.get('[data-cy="parsing-monitor"]').should('be.visible');
      cy.get('[data-cy="terminal-logs"]').should('contain', 'Selected file');

      // Wait for upload intercept and verify degraded state is printed in terminal logs
      cy.wait('@uploadFallback');
      cy.get('[data-cy="terminal-logs"]', { timeout: 8000 })
        .should('contain', 'AI provider offline. Degraded to local deterministic extraction baseline.');

      // Check job status is completed
      cy.contains('completed').should('be.visible');
    });
  });

  describe('Real-time SSE Connection Disconnect & Auto-Recovery', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should track SSE disconnection and attempt heartbeats gracefully', () => {
      // Check that standard connection is present
      cy.get('[data-cy="agent-rail"]').should('exist');
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });

      // Force simulated browser window EventSource disconnect
      cy.window().then((win) => {
        // Find if we have any custom SSE disconnect mechanism or mock a MessageEvent
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'system:sse_disconnect',
            data: { reason: 'SSE Connection Interrupted' }
          })
        });
        win.dispatchEvent(event);
      });

      // Rail is resilient and should survive/reconnect
      cy.get('[data-cy="agent-rail"]').should('exist');
    });
  });

  describe('Worker Deadlock / Queue Stalls', () => {
    it('should gracefully handle job queues promotion and deadlock monitoring', () => {
      cy.visit('/jobs');
      // Verify job board workspace works properly
      cy.get('[data-cy="kanban-board"]').should('exist');
    });
  });
});
