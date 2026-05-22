/**
 * Interview Preparation Types
 * 
 * Data structures for managing interview prep materials,
 * STAR stories, technical concepts, behavioral guidance,
 * and system design patterns.
 */

/**
 * Main interview prep container for a specific job
 */
export interface InterviewPrep {
  id: string;
  jobId: string;
  role: string;
  company: string;
  generatedAt: Date;
  expiresAt?: Date; // Stale prep marker
  contentVersion: number;

  // Generated content sections
  companyResearch: CompanyResearch;
  roleBreakdown: RoleBreakdown;
  behavioralStories: BehavioralStory[];
  technicalPrep: TechnicalPrep;
  systemDesignPrep: SystemDesignPrep;
  resumeAlignment: ResumeAlignment;
  compensationGuide: CompensationGuide;

  // AI-generated likely interview questions for this role
  likelyQuestions?: string[];

  // Metadata
  prepStatus: 'not_started' | 'generating' | 'ready' | 'stale';
  confidenceScore: number; // 0-1, how confident the prep is
  lastUpdated: Date;
  userModifications: boolean; // True if user customized prep
}

/**
 * Company research and context
 */
export interface CompanyResearch {
  company: string;
  industry: string;
  size: 'startup' | 'scale-up' | 'mid-market' | 'enterprise';
  founded: number;
  recentNews: NewsItem[];
  culture: string; // Summary of company culture
  technicalStack: string[]; // Tech they use
  recentLayoffs?: string; // If applicable
  fundingStatus: string; // Funded, profitable, etc.
  competitorsAndContext: string;
  linkedinCompanyUrl?: string;
  crunchbaseProfile?: string;
  salaryGlassodoor?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface NewsItem {
  date: Date;
  title: string;
  source: string;
  url: string;
  summary: string;
}

/**
 * Role breakdown and requirements
 */
export interface RoleBreakdown {
  roleTitle: string;
  seniority: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  reportingLine: string; // "Reports to Engineering Manager"
  responsibilities: Responsibility[];
  requiredSkills: Skill[];
  preferredSkills: Skill[];
  experienceRequired: string; // "5+ years"
  teamSize?: number;
  location: string;
  travelPercentage?: number;
}

export interface Responsibility {
  title: string;
  description: string;
  priority: 'must_have' | 'important' | 'nice_to_have';
  yourExpertise?: 'expert' | 'proficient' | 'learning' | 'none';
}

export interface Skill {
  name: string;
  proficiency: 'junior' | 'mid' | 'senior' | 'staff';
  yourLevel?: 'expert' | 'proficient' | 'intermediate' | 'beginner' | 'none';
  gapAnalysis?: {
    gapSeverity: 'critical' | 'important' | 'minor' | 'none';
    howToClose: string;
  };
}

/**
 * STAR story (Situation, Task, Action, Result)
 */
export interface BehavioralStory {
  id: string;
  competency: string; // 'leadership', 'problem-solving', etc.
  competencies?: string[]; // Array of related competencies
  title?: string; // Story title/name
  summary?: string; // Brief summary of the story
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics?: string | string[]; // Quantifiable outcomes
  sourceProject?: string; // Which project from resume
  relevanceScore: number; // 0-1, how relevant to this role
  timeToTell?: number; // seconds
  confidence?: number; // 1-5 or percentage confidence
  interviewQuestions?: string[]; // Which questions this answers
  variations?: BehavioralStory[]; // Alternative versions for different angles
}

/**
 * Technical preparation materials
 */
export interface TechnicalPrep {
  programmingLanguages: ProgrammingLanguagePrep[];
  dataStructures: Concept[];
  algorithms: Concept[];
  systemDesignConcepts: SystemDesignConcept[];
  toolsAndFrameworks: ToolPrep[];
  practiceProblems: PracticeProblem[];
  weakAreas: string[];
  studyPlan: StudyBlock[];
}

export interface ProgrammingLanguagePrep {
  language: string;
  relevance: 'primary' | 'secondary' | 'reference';
  keyFeatures: string[];
  commonPatterns: string[];
  gotchas: string[];
  practiceCode?: string;
}

export interface Concept {
  name: string;
  importance: 'critical' | 'important' | 'useful';
  timeComplexity?: string;
  spaceComplexity?: string;
  useCase: string;
  example?: string;
  relatedConcepts: string[];
  reviewDate?: Date;
}

export interface SystemDesignConcept {
  name: string;
  description: string;
  tradeoffs: string;
  whenToUse: string;
  examples: string[];
  commonPatterns: string[];
}

export interface ToolPrep {
  name: string;
  category: string; // 'framework', 'database', 'cloud', etc.
  relevance: 'primary' | 'secondary';
  keyFeatures: string[];
  gotchas: string[];
  alternativesToCompare: string[];
}

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  problemStatement: string;
  exampleSolution?: string;
  timeLimit: number; // minutes
  topicsToReview: string[];
  relatedInterviewQuestions: string[];
  completed: boolean;
  userSolution?: string;
  submittedAt?: Date;
}

export interface StudyBlock {
  day: number;
  topic: string;
  duration: number; // minutes
  materials: string[];
  practiceProblems: string[]; // Problem IDs
  reviewNotes?: string;
}

/**
 * System design interview prep
 */
export interface SystemDesignPrep {
  designPatterns: DesignPattern[];
  scalingTechniques: ScalingTechnique[];
  databases: DatabaseSelection[];
  architectures: ArchitecturePattern[];
  caseStudies: CaseStudy[];
  frameworkForDesign: DesignFramework;
}

export interface DesignPattern {
  name: string;
  description: string;
  useCases: string[];
  examples: string[];
  tradeoffs: string;
  diagram?: string; // ASCII or URL to diagram
}

export interface ScalingTechnique {
  name: string;
  description: string;
  whenToApply: string;
  examples: string[];
  tradeoffs: string;
}

export interface DatabaseSelection {
  type: 'SQL' | 'NoSQL' | 'Cache' | 'TimeSeries' | 'GraphDB';
  examples: string[];
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  tradeoffs: string;
}

export interface ArchitecturePattern {
  name: string;
  description: string;
  components: string[];
  dataFlow: string;
  scaleCharacteristics: string;
  examples: string[];
}

export interface CaseStudy {
  company: string;
  system: string;
  scale: string; // "1M+ users"
  architecture: string;
  keyDecisions: string[];
  lessons: string[];
}

export interface DesignFramework {
  steps: string[];
  clarifyingQuestions: string[];
  constraints: string[];
  suggestedApproach: string;
}

/**
 * Resume alignment with job description
 */
export interface ResumeAlignment {
  overallMatch: number; // 0-100
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  suggestedResumeUpdates: ResumeSuggestion[];
  highlightedExperience: HighlightedExperience[];
}

export interface KeywordMatch {
  keyword: string;
  foundInResume: boolean;
  frequency: number;
  importance: 'critical' | 'important' | 'useful';
}

export interface ResumeSuggestion {
  section: string; // "Skills", "Experience", "Projects"
  originalContent: string;
  suggestedContent: string;
  reason: string;
  impact: number; // 0-1, estimated impact on match
}

export interface HighlightedExperience {
  sourceProject: string;
  relevantResponsibility: string;
  jobRequirement: string;
  story?: BehavioralStory;
}

/**
 * Compensation discussion guide
 */
export interface CompensationGuide {
  marketRange: {
    min: number;
    max: number;
    currency: string;
    source: string;
    dataPoints: number;
  };
  yourEstimate: {
    min: number;
    max: number;
    justification: string;
  };
  negotiationTalkingPoints: NegotiationPoint[];
  redFlags: string[];
  benefitsToPrioritize: string[];
  equityConsiderations?: string;
}

export interface NegotiationPoint {
  topic: string;
  arguments: string[];
  dataSupport: string;
  counterArguments: string[];
}

/**
 * Mock interview
 */
export interface MockInterview {
  id: string;
  jobId: string;
  type: 'behavioral' | 'technical' | 'system_design' | 'mixed';
  duration: number; // minutes
  questions: InterviewQuestion[];
  startedAt?: Date;
  completedAt?: Date;
  overallScore?: number; // 0-100
  feedback?: InterviewFeedback;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  expectedDuration: number; // seconds
  keyPoints: string[]; // What to cover
  userAnswer?: string;
  score?: number; // 0-10
  feedback?: string;
}

export interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  nextSteps: string[];
}

/**
 * Prep material types
 */
export type PrepMaterialType =
  | 'cheat_sheet'
  | 'star_story'
  | 'talking_point'
  | 'concept_refresher'
  | 'company_research'
  | 'likely_question'
  | 'compensation_research'
  | 'objection_handler';

export interface PrepMaterial {
  id: string;
  type: PrepMaterialType;
  title: string;
  content: string;
  tags: string[];
  confidenceLevel: number; // 0-1
  createdAt: Date;
  lastReviewedAt?: Date;
  reviewCount: number;
}

/**
 * Prep generation request
 */
export interface PrepGenerationRequest {
  jobId: string;
  jobDescription: string;
  userResume: string;
  userProjects: string;
  companyName: string;
  focusAreas?: string[]; // e.g., ['behavioral', 'technical']
}

/**
 * Prep generation response
 */
export interface PrepGenerationResponse {
  interviewPrep: InterviewPrep;
  generationTime: number; // ms
  contentQuality: number; // 0-1
  missingInformation?: string[];
  warnings?: string[];
}
