describe('E2E: Job Discovery → Interview Scheduled', () => {
  const testData = {
    company: 'Acme Corp',
    jobTitle: 'Senior Frontend Engineer',
    jobUrl: 'https://acme.corp/jobs/senior-frontend',
    resumeVersion: 'SFE_Acme_v2',
    interviewDate: '2026-06-15T10:00:00Z',
  };

  beforeEach(() => {
    cy.visit('/dashboard');
    cy.login();
  });

  it('should complete full job→interview flow with agent involvement', () => {
    // STAGE 1: Job Discovery
    cy.log('📍 Starting: Job Discovery');
    cy.contains('button', 'Add Job').click();

    cy.get('input[placeholder="Job Title"]').type(testData.jobTitle);
    cy.get('input[placeholder="Company"]').type(testData.company);
    cy.get('input[placeholder="Job URL"]').type(testData.jobUrl);
    cy.get('select[name="priority"]').select('high');

    // Match score should be calculated by agent
    cy.get('[data-testid="match-score"]').should('exist');
    cy.get('[data-testid="match-score"]').should('contain', '%');

    cy.contains('button', 'Save Job').click();
    cy.contains(testData.company).should('exist');

    // Job appears in "Sourced" stage
    cy.get('[data-swimlane="sourced"]')
      .should('exist')
      .contains(testData.company);

    // STAGE 2: Agent Processing
    cy.log('🤖 Stage: Agent Processing');
    cy.visit('/agents');

    // Resume Tailor Agent should be triggered
    cy.get('[data-agent="resume-tailor"]').should('exist');
    cy.get('[data-agent-status="resume-tailor"]').should('contain', 'running');

    // Wait for agent to complete
    cy.get('[data-agent-status="resume-tailor"]', { timeout: 30000 })
      .should('contain', 'completed');

    // Verify resume was created
    cy.get('[data-agent="resume-tailor"]')
      .contains('Resume tailored')
      .should('be.visible');

    // Job Matching Agent scores job
    cy.get('[data-agent="job-matcher"]').should('exist');
    cy.get('[data-agent-status="job-matcher"]', { timeout: 20000 }).should(
      'contain',
      'completed'
    );

    // STAGE 3: Automatic Application
    cy.log('📝 Stage: Automatic Application');
    cy.visit('/dashboard');

    // Filter to show "Interested" stage
    cy.get('[data-filter="stages"]').click();
    cy.contains('label', 'interested').click();

    // Wait for Application Agent to move job
    cy.get('[data-swimlane="applied"]', { timeout: 15000 })
      .should('exist')
      .contains(testData.company);

    // Verify application event logged
    cy.get('[data-job-card]')
      .contains(testData.company)
      .parent()
      .within(() => {
        cy.get('[data-activity-type="applied"]').should('be.visible');
      });

    // STAGE 4: Interview Prep Agent
    cy.log('🧠 Stage: Interview Prep Generation');
    cy.get('[data-job-card]').contains(testData.company).click();

    cy.get('[data-detail-panel]').should('exist');
    cy.get('[data-tab="prep"]').click();

    // Interview Prep Agent should generate content
    cy.get('[data-agent-generating-prep]', { timeout: 25000 }).should(
      'not.exist'
    );

    cy.get('[data-section="behavioral-stories"]').should('exist');
    cy.get('[data-section="technical-prep"]').should('exist');
    cy.get('[data-section="company-research"]').should('exist');

    // STAGE 5: Interview Scheduling
    cy.log('📅 Stage: Interview Scheduling');
    cy.get('[data-tab="interviews"]').click();

    cy.contains('button', 'Schedule Interview').click();
    cy.get('select[name="interviewType"]').select('Technical Interview');
    cy.get('input[type="datetime-local"]').type(
      testData.interviewDate.split('T')[0]
    );

    cy.contains('button', 'Schedule').click();

    // Verify interview appears
    cy.get('[data-interview-scheduled]')
      .should('exist')
      .contains('Technical Interview');

    // Job should move to "Technical Interview" stage
    cy.visit('/dashboard');
    cy.get('[data-swimlane="technical_interview"]')
      .should('exist')
      .contains(testData.company);

    // STAGE 6: Agent Visibility
    cy.log('📊 Stage: Verify Agent Execution Chain');
    cy.visit('/agents');

    cy.get('[data-agent-execution-timeline]').should('exist');

    // Verify execution order
    const executionOrder = [
      'resume-tailor',
      'job-matcher',
      'application',
      'interview-prep',
    ];

    executionOrder.forEach((agent, index) => {
      cy.get(`[data-execution-order="${index}"]`).should(
        'contain',
        agent
      );
    });

    // STAGE 7: Confidence Scoring
    cy.log('✅ Stage: Confidence & Success Metrics');
    cy.visit('/dashboard');

    cy.get('[data-job-card]')
      .contains(testData.company)
      .parent()
      .within(() => {
        cy.get('[data-confidence-score]').should('have.text', /\d+%/);
      });

    // Final assertions
    cy.get('[data-stats-bar]').within(() => {
      cy.contains('1 job in interview stage').should('exist');
    });

    cy.log('✨ E2E Test Complete: Job→Interview Flow');
  });

  it('should handle agent failure gracefully', () => {
    cy.visit('/dashboard');

    // Simulate agent failure by blocking API call
    cy.intercept('POST', '/api/agents/resume-tailor*', {
      statusCode: 500,
      body: { error: 'Agent processing failed' },
    });

    cy.contains('button', 'Add Job').click();
    cy.get('input[placeholder="Job Title"]').type(testData.jobTitle);
    cy.get('input[placeholder="Company"]').type(testData.company);
    cy.contains('button', 'Save Job').click();

    // Wait for agent error
    cy.visit('/agents');
    cy.get('[data-agent="resume-tailor"]')
      .contains('error', { timeout: 15000 })
      .should('be.visible');

    // Verify error notification
    cy.get('[data-toast]').contains('Resume tailor failed').should('exist');

    // Verify human intervention UI appears
    cy.get('[data-agent-action="retry"]').should('exist');
    cy.get('[data-agent-action="manual-review"]').should('exist');
  });

  it('should track full agent execution timeline', () => {
    cy.visit('/dashboard');

    // Create job
    cy.contains('button', 'Add Job').click();
    cy.get('input[placeholder="Job Title"]').type(testData.jobTitle);
    cy.get('input[placeholder="Company"]').type(testData.company);
    cy.get('input[placeholder="Job URL"]').type(testData.jobUrl);
    cy.contains('button', 'Save Job').click();

    // Open detail panel
    cy.get('[data-job-card]').contains(testData.company).click();
    cy.get('[data-tab="timeline"]').click();

    // Verify timeline shows agent events
    cy.get('[data-timeline-event="job-created"]').should('exist');
    cy.get('[data-timeline-event="agent:resume-tailor:started"]').should(
      'exist'
    );
    cy.get('[data-timeline-event="agent:resume-tailor:completed"]', {
      timeout: 30000,
    }).should('exist');
    cy.get('[data-timeline-event="agent:job-matcher:completed"]', {
      timeout: 20000,
    }).should('exist');
    cy.get('[data-timeline-event="stage-changed"]').should('exist');

    // Verify timestamps are correct
    cy.get('[data-timeline]').within(() => {
      cy.get('[data-event-timestamp]').each(($el) => {
        cy.wrap($el).invoke('attr', 'data-timestamp').should('match', /\d+/);
      });
    });
  });
});
