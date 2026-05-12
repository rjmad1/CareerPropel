/**
 * Test Data Setup & Fixtures
 * Provides test data and setup utilities for Cypress tests
 */

/**
 * Base test user credentials
 */
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  id: 'user-test-123'
};

/**
 * Sample job data for testing
 */
export const SAMPLE_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc',
    description: 'We are looking for a senior software engineer with 5+ years of experience...',
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    salary: 200000,
    salaryMax: 250000,
    matchScore: 92,
    priority: 'high',
    stage: 'interviewing',
    recruiter: {
      name: 'Sarah Chen',
      email: 'sarah@techcorp.com',
      phone: '415-555-0123',
      linkedin: 'https://linkedin.com/in/sarahchen'
    },
    postedAt: new Date('2026-05-01').toISOString(),
    appliedAt: new Date('2026-05-05').toISOString(),
    jobUrl: 'https://techcorp.com/jobs/123',
    companyWebsite: 'https://techcorp.com'
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    description: 'Join our fast-growing startup building the future of web applications...',
    location: 'Remote',
    jobType: 'Full-time',
    salary: 150000,
    salaryMax: 180000,
    matchScore: 85,
    priority: 'medium',
    stage: 'sourced',
    recruiter: {
      name: 'Michael Rodriguez',
      email: 'michael@startupxyz.com',
      phone: '650-555-0456',
      linkedin: 'https://linkedin.com/in/mrodriguez'
    },
    postedAt: new Date('2026-04-20').toISOString(),
    jobUrl: 'https://startupxyz.com/jobs/456',
    companyWebsite: 'https://startupxyz.com'
  },
  {
    id: 'job-3',
    title: 'DevOps Engineer',
    company: 'CloudSystems Ltd',
    description: 'Help us scale our infrastructure for millions of users...',
    location: 'New York, NY',
    jobType: 'Full-time',
    salary: 180000,
    salaryMax: 220000,
    matchScore: 78,
    priority: 'low',
    stage: 'rejected',
    recruiter: {
      name: 'Emily Watson',
      email: 'emily@cloudsystems.com',
      phone: '212-555-0789',
      linkedin: 'https://linkedin.com/in/ewatson'
    },
    postedAt: new Date('2026-04-10').toISOString(),
    appliedAt: new Date('2026-04-15').toISOString(),
    jobUrl: 'https://cloudsystems.com/jobs/789',
    companyWebsite: 'https://cloudsystems.com'
  }
];

/**
 * Sample interview data for testing
 */
export const SAMPLE_INTERVIEWS = [
  {
    id: 'interview-1',
    jobId: 'job-1',
    type: 'phone_screen',
    date: new Date('2026-05-20').toISOString(),
    time: '14:00',
    interviewer: 'John Smith',
    location: 'Phone',
    status: 'scheduled',
    notes: 'Initial screening with engineering manager'
  },
  {
    id: 'interview-2',
    jobId: 'job-1',
    type: 'technical',
    date: new Date('2026-05-27').toISOString(),
    time: '10:00',
    interviewer: 'Alice Johnson',
    location: 'Zoom',
    status: 'completed',
    notes: 'System design interview - went well',
    rating: 4.5
  },
  {
    id: 'interview-3',
    jobId: 'job-1',
    type: 'behavioral',
    date: new Date('2026-06-03').toISOString(),
    time: '13:00',
    interviewer: 'Bob Williams',
    location: 'In-person - 123 Main St',
    status: 'completed',
    notes: 'Great conversation about team fit',
    rating: 4.0
  }
];

/**
 * Sample offer data for testing
 */
export const SAMPLE_OFFERS = [
  {
    id: 'offer-1',
    jobId: 'job-1',
    baseSalary: 220000,
    bonusPercent: 15,
    equity: 0.05,
    equityVestYears: 4,
    startDate: new Date('2026-07-15').toISOString(),
    status: 'pending',
    notes: 'Great offer, waiting to hear from other companies',
    createdAt: new Date('2026-06-05').toISOString()
  },
  {
    id: 'offer-2',
    jobId: 'job-2',
    baseSalary: 170000,
    bonusPercent: 20,
    equity: 0.10,
    equityVestYears: 4,
    startDate: new Date('2026-08-01').toISOString(),
    status: 'accepted',
    notes: 'Accepted offer - favorite company culture',
    createdAt: new Date('2026-05-28').toISOString()
  }
];

/**
 * Sample interview prep data
 */
export const SAMPLE_INTERVIEW_PREP = {
  jobId: 'job-1',
  starStories: [
    {
      id: 'story-1',
      situation: 'Led redesign of critical payment system',
      task: 'System was causing 5% transaction failures',
      action: 'Rebuilt with microservices architecture, added monitoring',
      result: '99.9% uptime, 40% faster transactions',
      tags: ['leadership', 'architecture', 'performance']
    },
    {
      id: 'story-2',
      situation: 'Team disagreement on technical approach',
      task: 'Needed consensus on database migration strategy',
      action: 'Organized design review with stakeholders, presented trade-offs',
      result: 'Team aligned on PostgreSQL migration, completed 2 months early',
      tags: ['collaboration', 'communication', 'decision-making']
    }
  ],
  technicalConcepts: [
    {
      id: 'concept-1',
      title: 'System Design',
      keyPoints: [
        'Horizontal scaling with load balancing',
        'Database sharding strategies',
        'Cache invalidation patterns',
        'Event-driven architecture'
      ]
    },
    {
      id: 'concept-2',
      title: 'Algorithms',
      keyPoints: [
        'Binary search trees and balancing',
        'Graph traversal (BFS, DFS)',
        'Dynamic programming patterns',
        'Sorting algorithm trade-offs'
      ]
    }
  ],
  companyIntelligence: {
    mission: 'Democratize enterprise software',
    recentNews: [
      'Series C funding announcement - $100M',
      'Expanded to European market',
      'New AI-powered analytics feature'
    ],
    culture: 'Fast-paced, collaborative, innovation-focused',
    teamInfo: {
      engineeringSize: 50,
      reportingTo: 'VP Engineering',
      teamSize: 8
    }
  },
  likelyQuestions: [
    'Tell us about a time you led a technical project',
    'How do you approach system design problems?',
    'Describe your experience with scalability challenges',
    'How do you handle disagreements with team members?',
    'What excites you about this role?'
  ]
};

/**
 * Sample activity timeline data
 */
export const SAMPLE_ACTIVITIES = [
  {
    id: 'activity-1',
    jobId: 'job-1',
    type: 'applied',
    timestamp: new Date('2026-05-05T10:30:00').toISOString(),
    description: 'Applied to position',
    metadata: {
      url: 'https://techcorp.com/jobs/123'
    }
  },
  {
    id: 'activity-2',
    jobId: 'job-1',
    type: 'stage_changed',
    timestamp: new Date('2026-05-10T14:00:00').toISOString(),
    description: 'Moved to Recruiter Screen',
    metadata: {
      oldStage: 'sourced',
      newStage: 'recruiter_screen'
    }
  },
  {
    id: 'activity-3',
    jobId: 'job-1',
    type: 'interview_scheduled',
    timestamp: new Date('2026-05-15T09:00:00').toISOString(),
    description: 'Phone screen scheduled',
    metadata: {
      interviewType: 'phone_screen',
      date: '2026-05-20',
      time: '14:00'
    }
  },
  {
    id: 'activity-4',
    jobId: 'job-1',
    type: 'note_added',
    timestamp: new Date('2026-05-18T16:45:00').toISOString(),
    description: 'Added interview preparation notes',
    metadata: {
      preview: 'Study system design patterns...'
    }
  },
  {
    id: 'activity-5',
    jobId: 'job-1',
    type: 'interview_completed',
    timestamp: new Date('2026-05-27T11:30:00').toISOString(),
    description: 'Technical interview completed',
    metadata: {
      interviewType: 'technical',
      rating: 4.5
    }
  }
];

/**
 * Mock API responses for different scenarios
 */
export const API_MOCKS = {
  // Success responses
  successGetJob: (jobId: string = 'job-1') => ({
    statusCode: 200,
    body: SAMPLE_JOBS.find(j => j.id === jobId) || SAMPLE_JOBS[0]
  }),

  successCreateInterview: () => ({
    statusCode: 201,
    body: {
      id: 'interview-new',
      ...SAMPLE_INTERVIEWS[0],
      status: 'scheduled'
    }
  }),

  successCreateOffer: () => ({
    statusCode: 201,
    body: {
      id: 'offer-new',
      ...SAMPLE_OFFERS[0]
    }
  }),

  successUpdateJob: () => ({
    statusCode: 200,
    body: SAMPLE_JOBS[0]
  }),

  // Error responses
  errorNotFound: () => ({
    statusCode: 404,
    body: { error: 'Not found' }
  }),

  errorValidation: (message: string = 'Validation failed') => ({
    statusCode: 400,
    body: { error: message }
  }),

  errorUnauthorized: () => ({
    statusCode: 401,
    body: { error: 'Unauthorized' }
  }),

  errorServerError: () => ({
    statusCode: 500,
    body: { error: 'Internal server error' }
  })
};

/**
 * Test data for error scenarios
 */
export const ERROR_SCENARIOS = {
  networkError: { errorType: 'Network error', statusCode: 0 },
  timeout: { errorType: 'Request timeout', statusCode: 408 },
  validationError: { errorType: 'Invalid form data', statusCode: 400 },
  serverError: { errorType: 'Server error', statusCode: 500 },
  rateLimited: { errorType: 'Too many requests', statusCode: 429 }
};

/**
 * Test accessibility data
 */
export const ACCESSIBILITY_TESTS = {
  ariaLabels: [
    '[data-testid="panel-close-btn"]',
    '[data-testid="notes-edit-btn"]',
    '[data-testid="schedule-interview-btn"]',
    '[data-testid="log-offer-btn"]'
  ],
  keyboardNavigable: [
    '[data-testid="tab-overview"]',
    '[data-testid="tab-timeline"]',
    '[data-testid="tab-interviews"]',
    '[data-testid="tab-prep"]',
    '[data-testid="tab-offers"]'
  ],
  colorContrastRequired: [
    '[data-testid="panel-match-score"]',
    '[data-testid="panel-stage-badge"]',
    '[data-testid="offer-status-badge"]'
  ]
};

/**
 * Performance test data
 */
export const PERFORMANCE_TARGETS = {
  panelOpenTime: 300, // ms
  tabSwitchTime: 100, // ms
  formSubmitTime: 500, // ms
  dataLoadTime: 1000, // ms
  lightouseScore: 90
};

/**
 * Creates test job payload
 */
export function createJobPayload(overrides = {}) {
  return {
    ...SAMPLE_JOBS[0],
    ...overrides
  };
}

/**
 * Creates test interview payload
 */
export function createInterviewPayload(overrides = {}) {
  return {
    ...SAMPLE_INTERVIEWS[0],
    ...overrides
  };
}

/**
 * Creates test offer payload
 */
export function createOfferPayload(overrides = {}) {
  return {
    ...SAMPLE_OFFERS[0],
    ...overrides
  };
}

/**
 * Generates test data with multiple jobs, interviews, offers
 */
export function generateFullTestDataset() {
  return {
    jobs: SAMPLE_JOBS,
    interviews: SAMPLE_INTERVIEWS,
    offers: SAMPLE_OFFERS,
    activities: SAMPLE_ACTIVITIES,
    prep: SAMPLE_INTERVIEW_PREP
  };
}

/**
 * Test form data for various scenarios
 */
export const TEST_FORM_DATA = {
  validInterview: {
    type: 'technical',
    date: '2026-06-15',
    time: '14:00',
    interviewer: 'Jane Smith',
    location: 'Zoom',
    notes: 'System design interview'
  },

  validOffer: {
    salary: '200000',
    bonus: '20',
    equity: '0.05',
    startDate: '2026-07-15',
    notes: 'Great offer'
  },

  invalidInterview: {
    type: '', // missing required field
    date: '2026-06-15',
    time: ''  // missing required field
  },

  invalidOffer: {
    salary: 'not-a-number', // invalid format
    bonus: '20',
    equity: '0.05',
    startDate: ''  // missing required field
  }
};

/**
 * Default wait times for tests
 */
export const WAIT_TIMES = {
  short: 500,
  medium: 1000,
  long: 3000,
  veryLong: 5000
};

/**
 * Breakpoints for responsive testing
 */
export const BREAKPOINTS = {
  mobile: { width: 375, height: 812, device: 'iphone-x' },
  tablet: { width: 768, height: 1024, device: 'ipad-2' },
  desktop: { width: 1280, height: 1024, device: 'macbook-15' }
};
