/**
 * Mock API Utilities for Interview Prep Testing
 * Provides fixtures, intercepts, and mock data for Cypress E2E tests
 */

export interface MockCompanyData {
  name: string;
  funding: {
    latestRound: string;
    totalFunding: string;
    valuation: string;
  };
  headcount: number;
  technicalStack: string[];
  hiringPatterns: {
    growthRate: number;
    timeToHire: number;
    openRoles: number;
  };
}

export interface MockResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
}

export interface MockInterviewPrepData {
  jobId: string;
  companyName: string;
  roleTitle: string;
  readinessScore: number;
  completionStatus: {
    company: boolean;
    role: boolean;
    behavioral: boolean;
    technical: boolean;
    systemDesign: boolean;
    resume: boolean;
  };
}

/**
 * Mock Company Intelligence Data
 */
export const mockCompanyIntelligence: MockCompanyData = {
  name: 'TechCorp Inc',
  funding: {
    latestRound: 'Series C',
    totalFunding: '$150M',
    valuation: '$2.5B',
  },
  headcount: 450,
  technicalStack: [
    'React',
    'Node.js',
    'TypeScript',
    'AWS',
    'PostgreSQL',
    'Redis',
  ],
  hiringPatterns: {
    growthRate: 2.5,
    timeToHire: 32,
    openRoles: 28,
  },
};

/**
 * Mock Resume Data
 */
export const mockResumeData: MockResumeData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-0100',
  summary: 'Senior Software Engineer with 8+ years of experience in full-stack development',
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'AWS',
    'PostgreSQL',
  ],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Previous Corp',
      duration: '2019 - 2023',
      achievements: [
        'Led development of microservices architecture',
        'Improved API performance by 40%',
        'Mentored junior developers',
      ],
    },
  ],
};

/**
 * Mock Interview Prep Status
 */
export const mockInterviewPrepStatus: MockInterviewPrepData = {
  jobId: 'job-001',
  companyName: 'TechCorp Inc',
  roleTitle: 'Senior Software Engineer',
  readinessScore: 75,
  completionStatus: {
    company: true,
    role: true,
    behavioral: true,
    technical: false,
    systemDesign: false,
    resume: true,
  },
};

/**
 * Setup mock API intercepts for Interview Prep workspace
 */
export function setupMockInterviewPrepAPI() {
  cy.intercept('GET', '**/company-intelligence/**', {
    statusCode: 200,
    body: mockCompanyIntelligence,
  }).as('getCompanyIntelligence');

  cy.intercept('GET', '**/resume/**', {
    statusCode: 200,
    body: mockResumeData,
  }).as('getResume');

  cy.intercept('GET', '**/interview-prep/**', {
    statusCode: 200,
    body: mockInterviewPrepStatus,
  }).as('getInterviewPrep');

  cy.intercept('POST', '**/interview-prep/update', {
    statusCode: 200,
    body: { success: true },
  }).as('updateInterviewPrep');

  cy.intercept('GET', '**/technical-topics/**', {
    statusCode: 200,
    body: {
      languages: [
        { name: 'Python', proficiency: 'Expert', hours: 20 },
        { name: 'JavaScript', proficiency: 'Expert', hours: 25 },
        { name: 'Go', proficiency: 'Intermediate', hours: 15 },
      ],
      topics: [
        {
          category: 'Data Structures',
          items: ['Arrays', 'Lists', 'Trees', 'Graphs'],
        },
        {
          category: 'Algorithms',
          items: ['Sorting', 'Searching', 'Dynamic Programming'],
        },
      ],
    },
  }).as('getTechnicalTopics');

  cy.intercept('GET', '**/system-design/**', {
    statusCode: 200,
    body: {
      concepts: [
        {
          name: 'Horizontal Scaling',
          description: 'Adding more servers to handle load',
        },
        {
          name: 'Caching',
          description: 'Storing frequently accessed data in memory',
        },
      ],
      patterns: [
        { name: 'Microservices', description: 'Service-oriented architecture' },
      ],
      problems: [
        { name: 'Design Twitter', complexity: 'Hard' },
        { name: 'Design Uber', complexity: 'Hard' },
      ],
    },
  }).as('getSystemDesign');

  cy.intercept('GET', '**/resume-alignment/**', {
    statusCode: 200,
    body: {
      matchScore: 78,
      matchedKeywords: [
        { keyword: 'React', frequency: 5, category: 'Frontend' },
        { keyword: 'Node.js', frequency: 3, category: 'Backend' },
      ],
      missingKeywords: [
        { keyword: 'GraphQL', priority: 'High' },
        { keyword: 'Kubernetes', priority: 'Medium' },
      ],
      atsScores: {
        keywordDensity: 85,
        formatting: 92,
        actionVerbs: 78,
        quantification: 72,
      },
    },
  }).as('getResumeAlignment');

  cy.intercept('GET', '**/behavioral-stories/**', {
    statusCode: 200,
    body: {
      stories: [
        {
          title: 'Led Cross-functional Project',
          situation: 'Was assigned to lead a critical project',
          task: 'Build a new feature in 3 months',
          action: 'Created detailed roadmap and daily standups',
          result: 'Delivered on time with high quality',
          competency: 'Leadership',
        },
      ],
    },
  }).as('getBehavioralStories');

  cy.intercept('POST', '**/mock-interview/start', {
    statusCode: 200,
    body: {
      sessionId: 'session-001',
      questions: [
        'Tell me about yourself',
        'Describe a challenge you overcame',
      ],
    },
  }).as('startMockInterview');

  cy.intercept('POST', '**/mock-interview/submit', {
    statusCode: 200,
    body: {
      sessionId: 'session-001',
      overallScore: 82,
      competencyScores: {
        communication: 85,
        technicalKnowledge: 80,
        problemSolving: 78,
      },
      feedback: 'Good job overall',
    },
  }).as('submitMockInterview');
}

/**
 * Setup WebSocket mock for real-time updates
 */
export function setupMockWebSocket() {
  const mockSocket = {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    readyState: 1,
    send: cy.stub().as('wsSend'),
    close: cy.stub().as('wsClose'),
  };

  cy.window().then((win) => {
    const OrigWebSocket = win.WebSocket;
    cy.stub(win, 'WebSocket').callsFake(function (this: any, url: string) {
      if (url.includes('interview-prep')) {
        setTimeout(() => {
          if (mockSocket.onopen) mockSocket.onopen({ type: 'open' });
        }, 100);
        return mockSocket;
      }
      return new OrigWebSocket(url);
    });
  });

  return mockSocket;
}

/**
 * Send mock WebSocket message
 */
export function sendMockWebSocketMessage(socket: any, data: any) {
  setTimeout(() => {
    if (socket.onmessage) {
      socket.onmessage({
        type: 'message',
        data: JSON.stringify(data),
      });
    }
  }, 50);
}

/**
 * Mock real-time prep status update
 */
export function mockPrepStatusUpdate(socket: any, readinessScore: number) {
  sendMockWebSocketMessage(socket, {
    type: 'prep-status-update',
    readinessScore,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Mock agent status update
 */
export function mockAgentStatusUpdate(socket: any, agentStatus: any) {
  sendMockWebSocketMessage(socket, {
    type: 'agent-status',
    agent: agentStatus,
  });
}

/**
 * Create mock behavioral story for testing
 */
export function createMockStory(overrides: any = {}) {
  return {
    id: 'story-001',
    title: 'Led API Redesign Project',
    situation: 'Team was struggling with API performance',
    task: 'Redesign the API architecture',
    action: 'Analyzed bottlenecks and proposed microservices',
    result: 'Improved response time by 60%',
    competency: 'Technical Leadership',
    impact: 'Business',
    timeTaken: 120,
    ...overrides,
  };
}

/**
 * Create mock technical topic for testing
 */
export function createMockTopic(overrides: any = {}) {
  return {
    id: 'topic-001',
    category: 'Data Structures',
    name: 'Binary Trees',
    description: 'A tree data structure with at most two children per node',
    patterns: ['Traversal', 'Balancing', 'Search'],
    estimatedHours: 10,
    difficulty: 'Medium',
    status: 'Not Started',
    ...overrides,
  };
}

/**
 * Create mock design problem for testing
 */
export function createMockDesignProblem(overrides: any = {}) {
  return {
    id: 'problem-001',
    title: 'Design Twitter',
    description: 'Design a scalable social media platform',
    complexity: 'Hard',
    keyConsiderations: [
      'Scalability',
      'Real-time updates',
      'Data consistency',
    ],
    commonMistakes: [
      'Not thinking about scalability early',
      'Ignoring CAP theorem',
    ],
    followUpQuestions: [
      'How would you handle 1 million concurrent users?',
    ],
    ...overrides,
  };
}

/**
 * Setup all mock APIs
 */
export function setupAllMocks() {
  setupMockInterviewPrepAPI();
}

/**
 * Verify API call was made
 */
export function verifyApiCall(alias: string) {
  cy.get(`@${alias}`).should('have.been.called');
}

/**
 * Wait for mock API and verify response
 */
export function waitForApiAndVerify(alias: string, shouldExist: boolean = true) {
  cy.wait(`@${alias}`).then((interception) => {
    if (shouldExist) {
      expect(interception.response?.statusCode).to.equal(200);
    }
  });
}

/**
 * Mock loading state with delayed response
 */
export function mockApiWithDelay(endpoint: string, delay: number = 1000) {
  cy.intercept('GET', endpoint, (req) => {
    req.reply((res) => {
      res.delay(delay);
    });
  });
}

/**
 * Mock API error response
 */
export function mockApiError(endpoint: string, statusCode: number = 500, errorMessage: string = 'Internal Server Error') {
  cy.intercept('GET', endpoint, {
    statusCode,
    body: { error: errorMessage },
  });
}

/**
 * Mock network error
 */
export function mockNetworkError(endpoint: string) {
  cy.intercept('GET', endpoint, { forceNetworkError: true });
}

/**
 * Reset all API mocks
 */
export function resetApiMocks() {
  cy.intercept('GET', '**', (req) => {
    req.reply((res) => {
      res.statusCode = 404;
    });
  });
}

/**
 * Create mock achievement for resume
 */
export function createMockAchievement(overrides: any = {}) {
  return {
    id: 'achievement-001',
    title: 'Led Microservices Migration',
    metric: 'Reduced API latency by 60%',
    impact: 'performance',
    technologies: ['Node.js', 'Kubernetes', 'AWS'],
    ...overrides,
  };
}

/**
 * Create mock competency for behavioral interview
 */
export function createMockCompetency(overrides: any = {}) {
  return {
    id: 'competency-001',
    name: 'Communication',
    level: 'Advanced',
    stories: [1, 2, 3],
    score: 85,
    ...overrides,
  };
}

/**
 * Setup performance monitoring mock
 */
export function setupPerformanceMonitoring() {
  cy.window().then((win) => {
    cy.stub(win.performance, 'measure').returns({ duration: 100 });
  });
}

/**
 * Mock interview session data
 */
export function createMockInterviewSession(overrides: any = {}) {
  return {
    sessionId: 'session-001',
    startTime: new Date().toISOString(),
    type: 'behavioral',
    difficulty: 'medium',
    questions: [
      'Tell me about yourself',
      'Describe a challenge',
      'What are your strengths?',
      'How do you handle failure?',
      'Where do you see yourself in 5 years?',
    ],
    currentQuestion: 0,
    responses: [],
    scores: {
      communication: 0,
      technicalKnowledge: 0,
      problemSolving: 0,
    },
    ...overrides,
  };
}

/**
 * Mock interview response with feedback
 */
export function createMockInterviewFeedback(overrides: any = {}) {
  return {
    sessionId: 'session-001',
    overallScore: 78,
    strengths: [
      'Clear communication',
      'Good problem solving approach',
    ],
    improvements: [
      'Could provide more specific examples',
      'Need to think out loud more',
    ],
    questionFeedback: [
      {
        question: 'Tell me about yourself',
        score: 80,
        feedback: 'Well-structured response',
      },
    ],
    ...overrides,
  };
}
