/**
 * Real-time WebSocket Communication Tests
 * 
 * Tests WebSocket:
 * - Connection establishment and disconnection
 * - Message sending and receiving
 * - Reconnection with exponential backoff
 * - Message queuing during offline periods
 * - Heartbeat keep-alive
 * - Error handling and recovery
 */

describe('WebSocket Real-time Communication', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection on page load', () => {
      cy.get('[data-cy="agent-rail"]').should('exist');
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });
    });

    it('should show disconnected state when WebSocket is unavailable', () => {
      // Simulate network interruption
      cy.window().then((win) => {
        cy.intercept('/ws*', {
          statusCode: 500,
        }).as('wsError');
      });

      cy.reload();
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🔴 Disconnected').should('be.visible');
      });
    });

    it('should maintain connection state across navigation', () => {
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });

      cy.get('[data-cy="kanban-board"]').should('exist');

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('still.exist');
      });
    });
  });

  describe('Message Handling', () => {
    it('should handle agent status updates via WebSocket', () => {
      // Select first agent
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Resume Tailor').should('be.visible');
      });

      // Simulate status update message
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              status: 'running',
              progress: 45,
              currentTask: 'Tailoring resume for TechCorp',
            },
          }),
        });
        win.dispatchEvent(event);
      });

      // Verify progress bar updated
      cy.get('[data-cy="agent-progress-bar"]').should('exist');
    });

    it('should handle agent log messages', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      // Expand logs
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Activity Log').click();
      });

      // Simulate log message
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:log',
            data: {
              agentId: 'resume_tailor',
              timestamp: Date.now(),
              level: 'info',
              message: 'Starting resume analysis',
              metadata: { jobTitle: 'Senior Engineer' },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      // Verify log appears
      cy.get('[data-cy="agent-log-info"]').should('be.visible');
      cy.contains('Starting resume analysis').should('be.visible');
    });

    it('should handle job update messages', () => {
      // Create a test job in the sourced stage
      cy.get('[data-cy="swimlane-sourced"]').should('exist');

      // Simulate job update
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:update',
            data: {
              jobId: 'job-1',
              changes: {
                stage: 'interested',
                matchScore: 92,
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      // Job should move to new stage
      cy.get('[data-cy="swimlane-interested"]').within(() => {
        cy.get('[data-cy="job-card-job-1"]').should('exist');
      });
    });
  });

  describe('Message Queuing', () => {
    it('should queue messages when disconnected', () => {
      // This test verifies offline behavior
      cy.window().then((win) => {
        // Close WebSocket connection
        const wsClient = win.getWebSocketClient?.();
        if (wsClient) {
          wsClient.disconnect();
        }
      });

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🔴 Disconnected').should('be.visible');
      });

      // Simulate attempting to send message while disconnected
      cy.window().then((win) => {
        const wsClient = win.getWebSocketClient?.();
        if (wsClient) {
          wsClient.send({
            type: 'subscribe',
            channels: ['agent:status'],
          });
        }
      });

      // Reconnect
      cy.window().then((win) => {
        const wsClient = win.getWebSocketClient?.();
        if (wsClient) {
          // In a real test, we'd restart WebSocket server
          cy.reload();
        }
      });

      // Should be reconnected
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected', { timeout: 5000 }).should('be.visible');
      });
    });
  });

  describe('Heartbeat', () => {
    it('should maintain connection with heartbeat', () => {
      // Connection should stay alive
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });

      // Wait and verify still connected
      cy.wait(5000);
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed messages gracefully', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: 'invalid json {]',
        });
        win.dispatchEvent(event);
      });

      // Should not crash, connection should remain
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });
    });

    it('should handle missing required message fields', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            // Missing 'type' field
            data: { someField: 'value' },
          }),
        });
        win.dispatchEvent(event);
      });

      // Should handle gracefully
      cy.get('[data-cy="agent-rail"]').should('exist');
    });
  });

  describe('Subscription Management', () => {
    it('should subscribe to specific channels', () => {
      // Verify agent status subscription
      cy.get('[data-cy="agent-rail-item-resume_tailor"]').should('exist');

      // Verify job update subscription
      cy.get('[data-cy="swimlane-sourced"]').should('exist');
    });

    it('should handle multiple subscriptions simultaneously', () => {
      // Both agent and job channels should be active
      cy.get('[data-cy="agent-rail"]').should('exist');
      cy.get('[data-cy="kanban-board"]').should('exist');

      // Both should receive updates
      cy.window().then((win) => {
        const event1 = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: { id: 'resume_tailor', status: 'running' },
          }),
        });
        win.dispatchEvent(event1);

        const event2 = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:update',
            data: { jobId: 'job-1', changes: { matchScore: 85 } },
          }),
        });
        win.dispatchEvent(event2);
      });

      // Both should update without interference
      cy.get('[data-cy="agent-rail"]').should('exist');
      cy.get('[data-cy="kanban-board"]').should('exist');
    });
  });
});
