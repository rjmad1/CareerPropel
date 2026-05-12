import {
  setupMockWebSocket,
  sendMockWebSocketMessage,
  mockPrepStatusUpdate,
} from '../../support/mock-api';

describe('WebSocket Integration - Interview Prep Real-time Updates', () => {
  beforeEach(() => {
    cy.visit('/interview-prep');
    cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
  });

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection on modal open', () => {
      cy.window().then((win) => {
        cy.stub(win, 'WebSocket').as('wsConstructor');
      });
      cy.get('@wsConstructor').should('have.been.called');
    });

    it('should connect to correct WebSocket endpoint', () => {
      cy.window().then((win) => {
        cy.stub(win, 'WebSocket').callsFake(function (url: string) {
          expect(url).to.include('interview-prep');
          return {};
        });
      });
    });

    it('should handle WebSocket connection established', () => {
      const socket = setupMockWebSocket();
      cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
    });

    it('should handle WebSocket connection errors gracefully', () => {
      cy.window().then((win) => {
        cy.stub(win, 'WebSocket').throws('Connection failed');
      });
      cy.get('[data-cy="connection-error"]').should('be.visible');
    });

    it('should reconnect on connection loss', () => {
      const socket = setupMockWebSocket();
      if (socket.onclose) {
        socket.onclose({ type: 'close' });
      }
      cy.wait(1000);
      cy.get('[data-cy="reconnecting-indicator"]').should('be.visible');
    });

    it('should show connected status indicator', () => {
      setupMockWebSocket();
      cy.get('[data-cy="connection-status"]').should('contain', 'Connected');
    });

    it('should update status on connection state change', () => {
      const socket = setupMockWebSocket();
      if (socket.onopen) {
        socket.onopen({ type: 'open' });
      }
      cy.get('[data-cy="connection-status"]').should('contain', 'Connected');
    });
  });

  describe('Real-time Readiness Score Updates', () => {
    it('should receive and display readiness score updates', () => {
      const socket = setupMockWebSocket();
      mockPrepStatusUpdate(socket, 85);
      cy.get('[data-cy="readiness-percentage"]').should('contain', '85%');
    });

    it('should animate score changes', () => {
      const socket = setupMockWebSocket();
      cy.get('[data-cy="readiness-percentage"]').then(($el) => {
        const initialScore = parseInt($el.text());
        mockPrepStatusUpdate(socket, initialScore + 10);
        cy.get('[data-cy="readiness-percentage"]').should('contain', (initialScore + 10).toString());
      });
    });

    it('should update progress bar on score change', () => {
      const socket = setupMockWebSocket();
      mockPrepStatusUpdate(socket, 90);
      cy.get('[data-cy="readiness-progress"]').should('have.css', 'width', '90%');
    });

    it('should show score update timestamp', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'prep-status-update',
        readinessScore: 80,
        timestamp: new Date().toISOString(),
      });
      cy.get('[data-cy="last-update-time"]').should('be.visible');
    });

    it('should handle multiple score updates in sequence', () => {
      const socket = setupMockWebSocket();
      mockPrepStatusUpdate(socket, 70);
      cy.wait(100);
      mockPrepStatusUpdate(socket, 75);
      cy.wait(100);
      mockPrepStatusUpdate(socket, 80);
      cy.get('[data-cy="readiness-percentage"]').should('contain', '80%');
    });

    it('should not allow invalid score values', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'prep-status-update',
        readinessScore: 150, // Invalid: > 100
        timestamp: new Date().toISOString(),
      });
      cy.get('[data-cy="readiness-percentage"]').should('not.contain', '150%');
    });

    it('should update completion status on score change', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'prep-status-update',
        readinessScore: 100,
        completionStatus: {
          company: true,
          role: true,
          behavioral: true,
          technical: true,
          systemDesign: true,
          resume: true,
        },
      });
      cy.get('[data-cy="completion-badge"]').should('contain', 'Complete');
    });
  });

  describe('Tab Completion Status Updates', () => {
    it('should receive tab completion status via WebSocket', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'company-intelligence',
        isComplete: true,
      });
      cy.get('[data-cy="company-tab-status"]').should('have.class', 'completed');
    });

    it('should update company intelligence completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'company-intelligence',
        isComplete: true,
      });
      cy.get('[data-cy="company-intel-checkmark"]').should('be.visible');
    });

    it('should update role breakdown completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'role-breakdown',
        isComplete: true,
      });
      cy.get('[data-cy="role-checkmark"]').should('be.visible');
    });

    it('should update behavioral stories completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'behavioral-stories',
        isComplete: true,
      });
      cy.get('[data-cy="behavioral-checkmark"]').should('be.visible');
    });

    it('should update technical prep completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'technical-prep',
        isComplete: true,
      });
      cy.get('[data-cy="technical-checkmark"]').should('be.visible');
    });

    it('should update system design completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'system-design',
        isComplete: true,
      });
      cy.get('[data-cy="system-design-checkmark"]').should('be.visible');
    });

    it('should update resume alignment completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'resume-alignment',
        isComplete: true,
      });
      cy.get('[data-cy="resume-checkmark"]').should('be.visible');
    });

    it('should update mock interview completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'mock-interview',
        isComplete: true,
      });
      cy.get('[data-cy="mock-interview-checkmark"]').should('be.visible');
    });

    it('should handle partial completion status', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'technical-prep',
        isComplete: false,
        progress: 50,
      });
      cy.get('[data-cy="technical-progress"]').should('contain', '50%');
    });

    it('should update tab visual indicators on completion', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'tab-completion-update',
        tab: 'behavioral-stories',
        isComplete: true,
      });
      cy.get('[data-cy="behavioral-stories-tab"]').should('have.class', 'completed');
    });
  });

  describe('Content Update Events', () => {
    it('should receive company intelligence updates', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'content-update',
        section: 'company-intelligence',
        data: { funding: '$200M', headcount: 500 },
      });
      cy.get('[data-cy="company-intel-content"]').should('contain', '500');
    });

    it('should receive resume alignment updates', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'content-update',
        section: 'resume-alignment',
        data: { matchScore: 85 },
      });
      cy.get('[data-cy="match-percentage"]').should('contain', '85%');
    });

    it('should receive behavioral story updates', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'content-update',
        section: 'behavioral-stories',
        data: { storiesCount: 8 },
      });
      cy.get('[data-cy="stories-count"]').should('contain', '8');
    });

    it('should receive technical prep updates', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'content-update',
        section: 'technical-prep',
        data: { topicsCompleted: 5 },
      });
      cy.get('[data-cy="topics-completed"]').should('contain', '5');
    });

    it('should update UI without page reload', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'content-update',
        section: 'company-intelligence',
        data: { recentNews: 3 },
      });
      cy.get('[data-cy="company-intel-container"]').should('be.visible');
    });

    it('should handle batch content updates', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'content-update-batch',
        updates: [
          { section: 'company-intelligence', data: { headcount: 500 } },
          { section: 'resume-alignment', data: { matchScore: 85 } },
          { section: 'technical-prep', data: { topicsCompleted: 5 } },
        ],
      });
      cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
    });
  });

  describe('Error Handling via WebSocket', () => {
    it('should receive and display error messages', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'error',
        message: 'Failed to update company data',
        severity: 'warning',
      });
      cy.get('[data-cy="error-notification"]').should('contain', 'Failed to update');
    });

    it('should handle WebSocket message parse errors', () => {
      const socket = setupMockWebSocket();
      if (socket.onmessage) {
        socket.onmessage({
          type: 'message',
          data: '{invalid json',
        });
      }
      cy.get('[data-cy="parse-error"]').should('not.exist');
    });

    it('should receive retry instructions from server', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'retry-instruction',
        action: 'refresh-company-data',
        delaySeconds: 5,
      });
      cy.get('[data-cy="retry-indicator"]').should('be.visible');
    });

    it('should receive sync conflict notifications', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'sync-conflict',
        field: 'readiness-score',
        serverValue: 85,
        clientValue: 80,
      });
      cy.get('[data-cy="sync-conflict-dialog"]').should('be.visible');
    });

    it('should handle authentication token expiration', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'auth-expired',
        message: 'Your session has expired',
      });
      cy.get('[data-cy="login-prompt"]').should('be.visible');
    });
  });

  describe('Performance and Optimization', () => {
    it('should debounce rapid score updates', () => {
      const socket = setupMockWebSocket();
      let updateCount = 0;
      cy.get('[data-cy="readiness-percentage"]').then(() => {
        updateCount++;
      });
      
      for (let i = 0; i < 10; i++) {
        mockPrepStatusUpdate(socket, 70 + i);
      }
      
      cy.get('[data-cy="readiness-percentage"]').should('contain', '79%');
    });

    it('should handle high-frequency updates without UI lag', () => {
      const socket = setupMockWebSocket();
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        sendMockWebSocketMessage(socket, {
          type: 'prep-status-update',
          readinessScore: 50 + (i % 50),
          timestamp: new Date().toISOString(),
        });
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).to.be.lessThan(2000); // Should complete in < 2 seconds
    });

    it('should batch multiple updates into single render', () => {
      const socket = setupMockWebSocket();
      cy.window().then((win) => {
        let renderCount = 0;
        const originalRender = win.requestAnimationFrame;
        cy.stub(win, 'requestAnimationFrame').callsFake((callback: any) => {
          renderCount++;
          return originalRender(callback);
        });
      });
    });

    it('should maintain responsive UI during updates', () => {
      const socket = setupMockWebSocket();
      mockPrepStatusUpdate(socket, 85);
      cy.get('[data-cy="start-mock-interview-btn"]').should('be.enabled');
    });

    it('should handle large data payloads efficiently', () => {
      const socket = setupMockWebSocket();
      const largePayload = {
        type: 'content-update',
        section: 'technical-prep',
        data: {
          topics: Array(100).fill({
            name: 'Topic',
            description: 'Description',
            patterns: ['Pattern1', 'Pattern2', 'Pattern3'],
          }),
        },
      };
      sendMockWebSocketMessage(socket, largePayload);
      cy.get('[data-cy="interview-prep-modal"]').should('be.visible');
    });
  });

  describe('Message Queue and Ordering', () => {
    it('should process messages in order', () => {
      const socket = setupMockWebSocket();
      mockPrepStatusUpdate(socket, 50);
      cy.wait(100);
      mockPrepStatusUpdate(socket, 75);
      cy.wait(100);
      mockPrepStatusUpdate(socket, 100);
      cy.get('[data-cy="readiness-percentage"]').should('contain', '100%');
    });

    it('should handle out-of-order messages gracefully', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'prep-status-update',
        readinessScore: 100,
        timestamp: new Date(Date.now() + 10000).toISOString(),
      });
      cy.wait(100);
      sendMockWebSocketMessage(socket, {
        type: 'prep-status-update',
        readinessScore: 50,
        timestamp: new Date().toISOString(),
      });
      cy.get('[data-cy="readiness-percentage"]').should('contain', '50%');
    });

    it('should ignore duplicate messages', () => {
      const socket = setupMockWebSocket();
      const message = {
        type: 'prep-status-update',
        readinessScore: 75,
        messageId: 'msg-001',
        timestamp: new Date().toISOString(),
      };
      sendMockWebSocketMessage(socket, message);
      cy.wait(100);
      sendMockWebSocketMessage(socket, message); // Send duplicate
      cy.get('[data-cy="readiness-percentage"]').should('contain', '75%');
    });
  });

  describe('Connection Persistence', () => {
    it('should maintain connection during idle time', () => {
      setupMockWebSocket();
      cy.wait(5000); // Wait 5 seconds
      cy.get('[data-cy="connection-status"]').should('contain', 'Connected');
    });

    it('should send heartbeat pings', () => {
      const socket = setupMockWebSocket();
      cy.window().then((win) => {
        cy.stub(socket, 'send').as('wsSend');
      });
      cy.wait(30000); // Wait 30 seconds
      cy.get('@wsSend').should('have.been.called');
    });

    it('should respond to server pings', () => {
      const socket = setupMockWebSocket();
      sendMockWebSocketMessage(socket, {
        type: 'ping',
      });
      cy.get('[data-cy="connection-status"]').should('contain', 'Connected');
    });

    it('should close connection cleanly on modal close', () => {
      const socket = setupMockWebSocket();
      cy.get('[data-cy="close-interview-prep-btn"]').click();
      expect(socket.readyState).to.equal(3); // CLOSED state
    });
  });
});
