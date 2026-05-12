/**
 * Company Research Types
 * 
 * Data structures for company intelligence, research notes,
 * hiring patterns, and organizational context.
 */

/**
 * Company profile with research data
 */
export interface CompanyProfile {
  id: string;
  name: string;
  website?: string;
  industry: string;
  subIndustry?: string;
  size: CompanySize;
  founded: number;
  headquarters: {
    city: string;
    state?: string;
    country: string;
  };
  description: string;
  mission?: string;
  vision?: string;

  // Business metrics
  funding: FundingInfo;
  revenue?: {
    annualRevenue?: number;
    currency: string;
    fiscalYear: number;
    isPublic: boolean;
  };
  growthRate?: number; // YoY percentage

  // People
  employees: {
    total: number;
    engineering: number;
    lastUpdated: Date;
  };

  // Technology
  technicalStack: TechStackItem[];
  infrastructure: string[];

  // Culture & Benefits
  culture: {
    description: string;
    values: string[];
    workStyle: string; // "remote-first", "in-office", "hybrid"
    reportedCulture?: {
      glassdoorScore?: number;
      timeWarnerScore?: number;
      descriptions: string[];
    };
  };
  benefits: {
    healthInsurance: boolean;
    dental: boolean;
    vision: boolean;
    retirement401k: boolean;
    stockOptions: boolean;
    bonusStructure?: string;
    flexibleHours: boolean;
    remoteWork: boolean;
    parental_leave_weeks?: number;
    other: string[];
  };

  // Hiring insights
  hiringPatterns: HiringPattern;
  interviewProcess: InterviewProcessInfo;

  // News & Updates
  recentNews: NewsArticle[];
  recentLayoffs?: Layoff[];

  // Relationships
  competitors: string[];
  partners: string[];
  investors: string[];

  // Metadata
  createdAt: Date;
  lastUpdated: Date;
  dataQuality: 'verified' | 'high' | 'medium' | 'low';
  sources: string[]; // Where info came from
}

export type CompanySize =
  | 'micro' // 1-10
  | 'small' // 11-50
  | 'medium' // 51-200
  | 'mid-market' // 201-1000
  | 'large' // 1001-10000
  | 'enterprise'; // 10000+

export interface FundingInfo {
  stage: 'bootstrap' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'later' | 'public' | 'acquired';
  lastRound?: {
    amount: number;
    currency: string;
    date: Date;
    investors: string[];
  };
  totalFunded?: number;
  currency?: string;
}

export interface TechStackItem {
  category: string; // 'language', 'framework', 'database', 'cloud'
  name: string;
  maturity: 'experimental' | 'production' | 'legacy';
  sourceUrl?: string;
}

/**
 * Hiring patterns and statistics
 */
export interface HiringPattern {
  averageTimeToHire?: number; // days
  hiringFrequency: 'constant' | 'seasonal' | 'sporadic';
  rolesFrequently Hired: string[];
  growingDepartments: string[];
  turnoverRate?: number; // annual percentage
  internshipProgram: boolean;
  newGradProgram: boolean;
  recentHiringSpree?: {
    startDate: Date;
    count: number;
    endDate?: Date;
    reason?: string;
  };
  recentLayoffs?: LayoffHistory;
}

export interface InterviewProcessInfo {
  rounds: InterviewRound[];
  totalTime: number; // days from application to offer
  typicalDuration: {
    min: number;
    max: number; // days
  };
  assessment: {
    codingTest: boolean;
    caseStudy: boolean;
    behavioral: boolean;
    cultureFit: boolean;
  };
  humanInterviews: number; // How many interviewers
  feedbackGiven: boolean;
}

export interface InterviewRound {
  order: number;
  type: 'phone_screen' | 'technical' | 'system_design' | 'behavioral' | 'culture_fit' | 'final';
  duration: number; // minutes
  description: string;
  commonQuestions?: string[];
  passingCriteria?: string;
}

/**
 * News articles about company
 */
export interface NewsArticle {
  id: string;
  date: Date;
  title: string;
  source: string;
  url: string;
  summary: string;
  category: 'funding' | 'layoff' | 'product' | 'partnership' | 'general' | 'leadership';
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceToRole?: boolean;
}

/**
 * Layoff information
 */
export interface Layoff {
  date: Date;
  count: number;
  percentage: number;
  departments: string[];
  reason?: string;
  source: string;
  url?: string;
}

export interface LayoffHistory {
  hasHadLayoffs: boolean;
  recentLayoffs: Layoff[];
  pattern?: string; // "cyclical", "reactive", "structural"
}

/**
 * Team and manager information
 */
export interface TeamInfo {
  id: string;
  companyId: string;
  department: string;
  name: string;
  size: number;
  manager: Manager;
  sibling Teams: string[]; // Related teams
  organizationLevel: number; // depth in org chart
}

export interface Manager {
  name: string;
  linkedinUrl?: string;
  tenure?: number; // years at company
  background: string;
  managementStyle?: string;
  promotionRate?: number; // percentage of reports promoted
  averageTeamSize?: number;
  careerPath: string;
}

/**
 * Role-specific information
 */
export interface RoleInfo {
  id: string;
  companyId: string;
  title: string;
  level: string;
  team: string;
  reportingLine: string;
  jobDescriptionUrl?: string;
  jobDescription?: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  compensation?: {
    salaryMin?: number;
    salaryMax?: number;
    equity?: string;
    bonus?: string;
    currency: string;
  };
  workEnvironment: {
    location: string;
    remote: 'fully_remote' | 'hybrid' | 'in_office';
    travel?: number; // percentage
  };
  timeline: {
    postedDate?: Date;
    closingDate?: Date;
    urgency: 'low' | 'medium' | 'high';
  };
}

/**
 * Company comparison
 */
export interface CompanyComparison {
  company1: string;
  company2: string;
  dimension: string; // 'growth', 'culture', 'compensation', etc.
  company1Score: number;
  company2Score: number;
  reasoning: string;
}

/**
 * Company research request
 */
export interface CompanyResearchRequest {
  companyName: string;
  roleTitle?: string;
  jobDescriptionUrl?: string;
  includeNews?: boolean;
  includeHiringPatterns?: boolean;
  includeBenefits?: boolean;
}

/**
 * Company research response
 */
export interface CompanyResearchResponse {
  profile: CompanyProfile;
  research: ResearchSummary;
  highlights: string[];
  redFlags: string[];
  questions ToAsk: string[];
}

export interface ResearchSummary {
  overviewFromWeb: string;
  hiringInsights: string;
  reputationSummary: string;
  trendingTopics: string[];
}

/**
 * Hiring signals
 */
export interface HiringSignal {
  company: string;
  signal: string; // 'heavy_hiring', 'strategic_pivot', 'funding_round', etc.
  strength: 'weak' | 'medium' | 'strong';
  date: Date;
  source: string;
  explanation: string;
}

/**
 * Company research notes (user-created)
 */
export interface CompanyResearchNote {
  id: string;
  companyId: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  tags: string[];
  type: 'question_to_ask' | 'red_flag' | 'opportunity' | 'general';
  linkedPeople?: string[]; // Names of people at company
}
