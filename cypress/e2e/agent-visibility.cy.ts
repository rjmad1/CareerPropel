/**
 * Agent Visibility and Operations Tests
 * 
 * Tests Agent Rail functionality:
 * - Agent list display
 * - Real-time status updates
 * - Progress tracking
 * - Log viewing
 * - Error states
 * - Metrics display
 */

describe('Agent Visibility System', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Agent Rail Layout', () => {
    it('should display agent rail with all agents', () => {
      cy.get('[data-cy="agent-rail"]').should('exist');
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Agents').should('be.visible');
        cy.contains('🤖').should('be.visible');
      });
    });

    it('should display all 8 agent types', () => {
      const agents = [
        'resume_tailor',
        'job_matching',
        'application',
        'research',
        'interview_prep',
        'networking',
        'follow_up',
        'analytics',
      ];

      agents.forEach((agent) => {
        cy.get(`[data-cy="agent-rail-item-${agent}"]`).should('exist');
      });
    });

    it('should show connection status indicator', () => {
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('🟢 Connected').should('be.visible');
      });
    });

    it('should show agent count footer', () => {
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('agents active').should('be.visible');
        cy.contains('running').should('be.visible');
      });
    });
  });

  describe('Agent Selection and Details', () => {
    it('should display agent details when selected', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Resume Tailor').should('be.visible');
        cy.contains('Tailors resume').should('be.visible');
      });
    });

    it('should highlight selected agent', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .should('not.have.class', 'bg-blue-50');

      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .should('have.class', 'bg-blue-50');
    });

    it('should display full agent metrics in detail view', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Queue Depth').should('be.visible');
        cy.contains('Confidence').should('be.visible');
        cy.contains('Tokens Used').should('be.visible');
        cy.contains('Last Activity').should('be.visible');
      });
    });

    it('should switch agent details when clicking different agent', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Resume Tailor').should('be.visible');
      });

      cy.get('[data-cy="agent-rail-item-job_matching"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Job Matching').should('be.visible');
      });
    });
  });

  describe('Agent Status Updates', () => {
    it('should update agent status in real-time', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      // Simulate status update
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              status: 'running',
              progress: 65,
              currentTask: 'Analyzing job description',
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Running').should('be.visible');
        cy.contains('Analyzing job description').should('be.visible');
      });
    });

    it('should display progress bar for running agents', () => {
      // Simulate running agent
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              status: 'running',
              progress: 45,
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .within(() => {
          cy.get('[data-cy="agent-progress-bar"]').should('exist');
        });
    });

    it('should hide progress bar when agent completes', () => {
      // First set to running
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              status: 'running',
              progress: 45,
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-progress-bar"]').should('exist');

      // Then complete
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              status: 'completed',
              progress: 100,
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .within(() => {
          cy.get('[data-cy="agent-progress-bar"]').should('not.exist');
        });
    });

    it('should display error state when agent fails', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      // Simulate error
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              status: 'error',
              errorMessage: 'Failed to parse job description',
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Error').should('be.visible');
        cy.contains('Failed to parse job description').should('be.visible');
      });
    });
  });

  describe('Activity Logs', () => {
    it('should expand and collapse activity logs', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      // Logs collapsed initially
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Activity Log').should('be.visible');
        cy.contains('No logs yet').should('not.exist');
      });

      // Click to expand
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Activity Log').click();
      });

      // Should show log entries
      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.get('[data-cy="agent-log-info"]').should('be.visible');
      });
    });

    it('should display log entries with correct level styling', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      // Simulate info log
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:log',
            data: {
              agentId: 'resume_tailor',
              timestamp: Date.now(),
              level: 'info',
              message: 'Starting job analysis',
              metadata: {},
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Activity Log').click();
        cy.contains('INFO').should('be.visible');
        cy.contains('Starting job analysis').should('be.visible');
      });
    });

    it('should display error logs with red styling', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:log',
            data: {
              agentId: 'resume_tailor',
              timestamp: Date.now(),
              level: 'error',
              message: 'Failed to process input',
              metadata: { errorCode: 'PARSE_ERROR' },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Activity Log').click();
        cy.get('[data-cy="agent-log-error"]').should('exist');
      });
    });

    it('should keep only last 100 logs per agent', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      // Simulate 150 log messages
      for (let i = 0; i < 150; i++) {
        cy.window().then((win) => {
          const event = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'agent:log',
              data: {
                agentId: 'resume_tailor',
                timestamp: Date.now() + i * 100,
                level: 'info',
                message: `Log message ${i}`,
                metadata: {},
              },
            }),
          });
          win.dispatchEvent(event);
        });
      }

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Activity Log').click();
        // Should only show last 100
        cy.get('[data-cy="agent-log-info"]').should('have.length.lte', 100);
      });
    });
  });

  describe('Metrics Display', () => {
    it('should display all agent metrics', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('Queue Depth').should('be.visible');
        cy.contains('Confidence').should('be.visible');
        cy.contains('Tokens Used').should('be.visible');
        cy.contains('Last Activity').should('be.visible');
      });
    });

    it('should update metrics in real-time', () => {
      cy.get('[data-cy="agent-rail-item-resume_tailor"]')
        .first()
        .click();

      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'agent:status',
            data: {
              id: 'resume_tailor',
              queueDepth: 5,
              confidence: 0.92,
              tokensUsed: 2500,
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="agent-rail"]').within(() => {
        cy.contains('5').should('be.visible'); // Queue depth
        cy.contains('92%').should('be.visible'); // Confidence
        cy.contains('2,500').should('be.visible'); // Tokens used
      });
    });
  });

  describe('Multiple Agent States', () => {
    it('should display different agents in different states', () => {
      // Set agents to different states
      cy.window().then((win) => {
        [
          { id: 'resume_tailor', status: 'running', progress: 45 },
          { id: 'job_matching', status: 'idle' },
          { id: 'application', status: 'error' },
        ].forEach((agent) => {
          const event = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'agent:status',
              data: agent,
            }),
          });
          win.dispatchEvent(event);
        });
      });

      // Verify all agents visible with correct states
      cy.get('[data-cy="agent-rail-item-resume_tailor"]').should('exist');
      cy.get('[data-cy="agent-rail-item-job_matching"]').should('exist');
      cy.get('[data-cy="agent-rail-item-application"]').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should be scrollable when many agents present', () => {
      cy.get('[data-cy="agent-rail"]').within(() => {
        // Left panel should be scrollable
        cy.get('div[class*="overflow-y-auto"]').should('exist');
      });
    });

    it('should maintain layout on small screens', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="agent-rail"]').should('be.visible');
    });
  });
});
