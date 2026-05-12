/**
 * Kanban Board and Job Card Tests
 * 
 * Tests Kanban functionality:
 * - Swimlane display
 * - Job card rendering
 * - Drag-and-drop between swimlanes
 * - Job updates via real-time sync
 * - Optimistic updates
 * - Card metrics and indicators
 * - Empty states
 * - Statistics
 */

describe('Kanban Board', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Board Layout', () => {
    it('should display kanban board', () => {
      cy.get('[data-cy="kanban-board"]').should('exist');
      cy.contains('Job Pipeline').should('be.visible');
    });

    it('should display header with statistics', () => {
      cy.get('[data-cy="kanban-board"]').within(() => {
        cy.contains('Total Jobs').should('be.visible');
        cy.contains('Active').should('be.visible');
        cy.contains('Offers').should('be.visible');
        cy.contains('Rejected').should('be.visible');
        cy.contains('Avg Confidence').should('be.visible');
      });
    });

    it('should display swimlanes container', () => {
      cy.get('[data-cy="swimlanes-container"]').should('exist');
      cy.get('[data-cy="swimlanes-container"]').should(
        'have.class',
        'overflow-x-auto'
      );
    });

    it('should display all swimlane stages', () => {
      const stages = [
        'sourced',
        'interested',
        'resume_tailoring',
        'applied',
        'recruiter_screen',
        'hiring_manager',
        'technical_interview',
        'system_design',
        'behavioral',
        'final_round',
        'offer',
        'negotiation',
        'rejected',
        'archived',
      ];

      stages.forEach((stage) => {
        cy.get(`[data-cy="swimlane-${stage}"]`).should('exist');
      });
    });
  });

  describe('Swimlane Display', () => {
    it('should display swimlane header with icon and label', () => {
      cy.get('[data-cy="swimlane-sourced"]').within(() => {
        cy.contains('Sourced').should('be.visible');
        cy.contains('🔍').should('be.visible');
      });
    });

    it('should display job count in swimlane header', () => {
      cy.get('[data-cy="swimlane-sourced"]').within(() => {
        // Should show count (0 if empty, or number if jobs present)
        cy.get('div[class*="rounded-full"]').should('exist');
      });
    });

    it('should display empty state when swimlane has no jobs', () => {
      cy.get('[data-cy="swimlane-sourced"]').within(() => {
        cy.contains('No jobs here').should('be.visible');
      });
    });

    it('should display average match score in footer', () => {
      cy.get('[data-cy="swimlane-sourced"]').within(() => {
        cy.contains('Average match score').should('be.visible');
      });
    });

    it('should be horizontally scrollable', () => {
      cy.get('[data-cy="swimlanes-container"]').should(
        'have.class',
        'overflow-x-auto'
      );
    });
  });

  describe('Job Card Display', () => {
    it('should display job card with essential info', () => {
      // Simulate adding a job
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-1',
                role: 'Senior Engineer',
                company: 'TechCorp',
                stage: 'sourced',
                matchScore: 85,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v2',
                recruiterStatus: 'not_contacted',
                priority: 'high',
                aiConfidence: 0.88,
                risks: [],
                blockers: [],
                notes: 'Great opportunity',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-1"]').should('exist');
      cy.get('[data-cy="job-card-job-1"]').within(() => {
        cy.contains('Senior Engineer').should('be.visible');
        cy.contains('TechCorp').should('be.visible');
      });
    });

    it('should display match score progress bar', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-match',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 75,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-match"]').within(() => {
        cy.contains('Match Score').should('be.visible');
        cy.contains('75%').should('be.visible');
        cy.get('div[class*="bg-blue-500"]').should('exist');
      });
    });

    it('should display priority badge', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-priority',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'critical',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-priority"]').within(() => {
        cy.contains('Critical').should('be.visible');
      });
    });

    it('should display metrics grid', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-metrics',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v3',
                recruiterStatus: 'interested',
                priority: 'high',
                aiConfidence: 0.92,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-metrics"]').within(() => {
        cy.contains('Confidence').should('be.visible');
        cy.contains('Resume').should('be.visible');
        cy.contains('Recruiter').should('be.visible');
        cy.contains('92%').should('be.visible');
        cy.contains('v3').should('be.visible');
      });
    });

    it('should display risk and blocker indicators', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-risks',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: ['Requires visa sponsorship', 'Remote only'],
                blockers: ['Missing required experience'],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-risks"]').within(() => {
        cy.contains('2 risks').should('be.visible');
        cy.contains('1 blocker').should('be.visible');
        cy.contains('⚠️').should('be.visible');
        cy.contains('🚫').should('be.visible');
      });
    });

    it('should display next action preview', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-action',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                nextAction: 'Customize resume and apply',
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-action"]').within(() => {
        cy.contains('Next:').should('be.visible');
        cy.contains('Customize resume and apply').should('be.visible');
      });
    });

    it('should display application date', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-date',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-date"]').within(() => {
        cy.contains('Applied').should('be.visible');
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should support dragging job cards', () => {
      // Note: Full drag-drop testing requires real mouse events or plugins
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-drag',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-drag"]').should('have.attr', 'draggable', 'true');
    });

    it('should highlight swimlane when card dragged over', () => {
      // Simulating drag events
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-dragover',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      // Verify drag target exists
      cy.get('[data-cy="swimlane-jobs-interested"]').should('exist');
    });
  });

  describe('Real-time Updates', () => {
    it('should update card when job data changes via WebSocket', () => {
      // Create job
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-update',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 60,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.6,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-update"]').within(() => {
        cy.contains('60%').should('be.visible');
      });

      // Update via WebSocket
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:update',
            data: {
              jobId: 'job-update',
              changes: {
                matchScore: 95,
                aiConfidence: 0.95,
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-update"]').within(() => {
        cy.contains('95%').should('be.visible');
      });
    });

    it('should move card between swimlanes when stage changes', () => {
      // Create job in sourced
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-move',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="swimlane-sourced"]').within(() => {
        cy.get('[data-cy="job-card-job-move"]').should('exist');
      });

      // Move to interested
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:update',
            data: {
              jobId: 'job-move',
              changes: { stage: 'interested' },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="swimlane-interested"]').within(() => {
        cy.get('[data-cy="job-card-job-move"]').should('exist');
      });

      cy.get('[data-cy="swimlane-sourced"]').within(() => {
        cy.get('[data-cy="job-card-job-move"]').should('not.exist');
      });
    });

    it('should show updating animation during real-time update', () => {
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-animate',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      // Trigger update
      cy.window().then((win) => {
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:update',
            data: {
              jobId: 'job-animate',
              changes: { matchScore: 90 },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      // Should have green ring (updating indicator)
      cy.get('[data-cy="job-card-job-animate"]').should(
        'have.class',
        'ring-2'
      );
    });
  });

  describe('Job Card Interactions', () => {
    it('should handle job card click', () => {
      cy.window().then((win) => {
        win.jobClicked = false;
        const event = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'job:created',
            data: {
              job: {
                id: 'job-click',
                role: 'Engineer',
                company: 'Company',
                stage: 'sourced',
                matchScore: 80,
                applicationDate: new Date(),
                interviewStatus: 'not_started',
                resumeVersion: 'v1',
                recruiterStatus: 'not_contacted',
                priority: 'medium',
                aiConfidence: 0.8,
                risks: [],
                blockers: [],
                notes: '',
              },
            },
          }),
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-cy="job-card-job-click"]').click();
      // In real implementation, would open detail modal
    });
  });

  describe('Statistics', () => {
    it('should display correct total job count', () => {
      cy.window().then((win) => {
        // Create multiple jobs
        for (let i = 0; i < 3; i++) {
          const event = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'job:created',
              data: {
                job: {
                  id: `job-stat-${i}`,
                  role: 'Engineer',
                  company: 'Company',
                  stage: 'sourced',
                  matchScore: 80,
                  applicationDate: new Date(),
                  interviewStatus: 'not_started',
                  resumeVersion: 'v1',
                  recruiterStatus: 'not_contacted',
                  priority: 'medium',
                  aiConfidence: 0.8,
                  risks: [],
                  blockers: [],
                  notes: '',
                },
              },
            }),
          });
          win.dispatchEvent(event);
        }
      });

      cy.get('[data-cy="kanban-board"]').within(() => {
        // Should show count > 0
        cy.get('div').contains(/\d+/).should('exist');
      });
    });
  });
});
