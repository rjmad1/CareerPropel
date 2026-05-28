describe('Role Intelligence Workspace E2E Tests', () => {
  const mockJobId = 'job-12345';
  const mockRoleIntelligenceData = {
    intelligence: {
      inferredRoleTitle: 'Senior Full-Stack Builder & Architect',
      archetypes: [
        { id: 'arch-1', archetype: 'Builder', weight: 0.70 },
        { id: 'arch-2', archetype: 'Operator', weight: 0.30 }
      ],
      requirements: [
        {
          id: 'req-1',
          type: 'hard',
          normalizedText: 'Develop and scale Next.js web applications',
          originalText: 'Must have 5+ years of experience building scalable NextJS websites',
          deconstruction: {
            tools: ['Next.js', 'React', 'TypeScript'],
            riskLevel: 'MEDIUM',
            businessImpact: 'Improves customer onboarding and page load times'
          }
        },
        {
          id: 'req-2',
          type: 'soft',
          normalizedText: 'Mentor junior engineers and lead sprints',
          originalText: 'Ability to guide junior developers and drive agile sprint processes',
          deconstruction: {
            tools: [],
            riskLevel: 'LOW',
            businessImpact: 'Speeds up team velocity and ensures code quality standards'
          }
        }
      ],
      businessProblems: [
        {
          id: 'prob-1',
          problemArea: 'Database Scaling bottleneck',
          description: 'High query response latency due to poorly optimized database lookups.',
          inferredFriction: 'Impairs checkout process leading to user dropoff.'
        }
      ]
    },
    fitAnalysis: {
      overallFitScore: 82,
      conversionProb: 75,
      immediateContribution: 85,
      credibilityRisk: 10,
      adaptationRiskScore: 25,
      reasoning: 'Candidate possesses exceptional execution evidence with Next.js.',
      strengths: [
        {
          id: 'str-1',
          capabilityName: 'PostgreSQL Performance Optimization',
          problemArea: 'Database Scaling bottleneck',
          candidateProof: 'Redesigned sluggish database queries, cutting times from 4.5s to 120ms.',
          measurableOutcome: 'Cut query times from 4.5s to 120ms',
          employerInterpretation: 'Eliminates checkout page lag.',
          businessImpact: 'Improves checkout reliability.',
          priorityLevel: 'HIGH'
        }
      ],
      gaps: [
        {
          id: 'gap-1',
          type: 'trainable',
          penaltyLevel: 'LOW',
          description: 'No prior experience with Redis caching layer.',
          mitigationStrategy: 'Review existing Redis cache policies.'
        }
      ]
    },
    patterns: [
      {
        id: 'pat-1',
        roleArchetype: 'Builder',
        operationalKeywords: ['Next.js', 'TypeScript'],
        successMetrics: ['API latency decreased by 40%']
      }
    ],
    executions: [
      { agentType: 'role-intelligence', status: 'completed' },
      { agentType: 'fit-analysis', status: 'completed' },
      { agentType: 'gap-analyzer', status: 'completed' },
      { agentType: 'conversion-scorer', status: 'completed' }
    ]
  };

  beforeEach(() => {
    cy.visit('/');
    cy.login();

    // Intercept Role Intelligence fetch API
    cy.intercept('GET', `**/api/jobs/${mockJobId}/role-intelligence`, {
      statusCode: 200,
      body: mockRoleIntelligenceData
    }).as('getRoleIntelligence');

    // Intercept manual agent trigger endpoints
    cy.intercept('POST', `**/api/jobs/${mockJobId}/role-intelligence`, {
      statusCode: 200,
      body: { success: true, taskId: 'task-abc' }
    }).as('triggerAgent');

    // Visit the specific role-intelligence page
    cy.visit(`/role-intelligence/${mockJobId}`);
    cy.wait('@getRoleIntelligence');
  });

  it('should load the workspace page and display the header and core panels', () => {
    cy.contains('Role Decision Intelligence Engine').should('be.visible');
    cy.contains('Evaluate real operational fit, suppress risk, and optimize conversion').should('be.visible');

    // Confirm that the visual panels exist
    cy.contains('1. Operational Role Breakdown').should('be.visible');
    cy.contains('2. Employer Pain Points').should('be.visible');
    cy.contains('3. Strength Evidence Mapping').should('be.visible');
    cy.contains('4. Deterministic Gap Analysis').should('be.visible');
    cy.contains('5. Conversion Probability Scorer').should('be.visible');
    cy.contains('6. Reusable Success Correlation Patterns').should('be.visible');
  });

  it('should verify details under operational role breakdown panel', () => {
    cy.contains('Senior Full-Stack Builder & Architect').should('be.visible');
    cy.contains('Weighted Role Archetypes').should('be.visible');
    cy.contains('Builder').should('be.visible');
    cy.contains('70%').should('be.visible');

    // Requirements section and interaction
    cy.contains('Develop and scale Next.js web applications').should('be.visible');
    cy.contains('req-1').should('not.exist'); // original raw text or detailed cards collapsed by default
    cy.contains('Develop and scale Next.js web applications').click();
    cy.contains('Tools Used').should('be.visible');
    cy.contains('Next.js, React, TypeScript').should('be.visible');
    cy.contains('Business Impact').should('be.visible');
    cy.contains('Improves customer onboarding and page load times').should('be.visible');
  });

  it('should verify details under employer pain points panel', () => {
    cy.contains('Database Scaling bottleneck').should('be.visible');
    cy.contains('High query response latency due to poorly optimized database lookups.').should('be.visible');
    cy.contains('Impairs checkout process leading to user dropoff.').should('be.visible');
  });

  it('should verify strength evidence mapping matches candidate proof and employer pain', () => {
    cy.contains('PostgreSQL Performance Optimization').should('be.visible');
    cy.contains('Redesigned sluggish database queries, cutting times from 4.5s to 120ms.').should('be.visible');
    cy.contains('Eliminates checkout page lag.').should('be.visible');
    cy.contains('HIGH').should('be.visible');
  });

  it('should verify gap analysis mapping and learning curves', () => {
    cy.contains('Learning Curve Complexity').should('be.visible');
    cy.contains('25%').should('be.visible');
    cy.contains('Low Cost').should('be.visible');
    cy.contains('trainable Gap').should('be.visible');
    cy.contains('No prior experience with Redis caching layer.').should('be.visible');
    cy.contains('Review existing Redis cache policies.').should('be.visible');
  });

  it('should verify conversion probability and overall fit score gauges', () => {
    cy.contains('Operational Fit Score').should('be.visible');
    cy.contains('82%').should('be.visible');
    cy.contains('Interview Probability').should('be.visible');
    cy.contains('75%').should('be.visible');
    cy.contains('Immediate Contribution').should('be.visible');
    cy.contains('85%').should('be.visible');
    cy.contains('Credibility Risk').should('be.visible');
    cy.contains('10%').should('be.visible');
    cy.contains('Candidate possesses exceptional execution evidence with Next.js.').should('be.visible');
  });

  it('should verify mined success correlation pattern insights', () => {
    cy.contains('Builder Archetype Pattern').should('be.visible');
    cy.contains('Success Correlated').should('be.visible');
    cy.contains('Next.js').should('be.visible');
    cy.contains('TypeScript').should('be.visible');
    cy.contains('API latency decreased by 40%').should('be.visible');
  });

  it('should allow triggering manual deconstruction and audit runs', () => {
    cy.contains('Re-Deconstruct Job').click();
    cy.wait('@triggerAgent');
    cy.contains('Run Operational Audit').click();
    cy.wait('@triggerAgent');
  });
});
