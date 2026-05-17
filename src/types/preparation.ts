/**
 * Interview Preparation and Readiness Types
 * 
 * Data structures for tracking prep progress, readiness,
 * study plans, and performance metrics.
 */

/**
 * Overall preparation status for a job
 */
export interface PrepReadiness {
  jobId: string;
  overallReadiness: number; // 0-100
  components: {
    behavioral: ReadinessComponent;
    technical: ReadinessComponent;
    systemDesign: ReadinessComponent;
    companyResearch: ReadinessComponent;
    resumeAlignment: ReadinessComponent;
    compensation: ReadinessComponent;
  };
  nextInterviewDate?: Date;
  prepDeadline?: Date;
  status: 'not_started' | 'in_progress' | 'ready' | 'interview_today';
}

export interface ReadinessComponent {
  name: string;
  completionPercentage: number; // 0-100
  lastReviewedAt?: Date;
  reviewCount: number;
  confidence: number; // 0-1
  readyForInterview: boolean;
  recommendation: string; // What to focus on next
}

/**
 * Study plan
 */
export interface StudyPlan {
  id: string;
  jobId: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date; // Interview date
  totalDays: number;
  hoursPerDay: number;
  totalHours: number;

  // Daily breakdown
  dailyPlan: DailyStudyBlock[];

  // Tracking
  completedDays: number;
  totalPlannedDays: number;
  adherenceRate: number; // % of planned days completed
  adjustments: StudyAdjustment[];
}

export interface DailyStudyBlock {
  date: Date;
  dayNumber: number;
  morning: StudySession[];
  afternoon: StudySession[];
  evening: StudySession[];
  totalMinutes: number;
  focusAreas: string[];
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface StudySession {
  type: 'behavioral' | 'technical' | 'system_design' | 'review';
  topic: string;
  durationMinutes: number;
  materials: string[]; // Resource links or references
  objectives: string[];
  completed: boolean;
  completedAt?: Date;
  sessionNotes?: string;
}

export interface StudyAdjustment {
  date: Date;
  reason: 'falling_behind' | 'interview_postponed' | 'weak_area' | 'strong_area';
  changes: string;
  newCompletionDate?: Date;
}

/**
 * Behavioral prep tracker
 */
export interface BehavioralPrepTracker {
  jobId: string;
  targetCompetencies: Competency[];
  stories: BehavioralStoryProgress[];
  overallProgress: number; // 0-100
  readyForRound: boolean;
}

export interface Competency {
  name: string; // 'leadership', 'teamwork', 'problem-solving', etc.
  importance: 'critical' | 'important' | 'useful';
  storiesPrepared: number;
  storiesNeeded: number;
}

export interface BehavioralStoryProgress {
  storyId: string;
  competency: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  timesToPracticed: number;
  lastPracticedAt?: Date;
  averageDeliveryTime: number; // seconds
  targetDeliveryTime: number; // seconds
  audioRecordings?: AudioRecording[];
  feedback?: StoryFeedback;
}

export interface AudioRecording {
  id: string;
  recordedAt: Date;
  durationSeconds: number;
  url: string;
  transcription?: string;
  feedback?: string;
}

export interface StoryFeedback {
  clarity: number; // 0-10
  conciseness: number; // 0-10
  impact: number; // 0-10
  relevance: number; // 0-10
  delivery: number; // 0-10
  overallScore: number; // 0-10
  strengths: string[];
  improvements: string[];
  timestamp: Date;
}

export interface LanguageProficiency {
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastUsed?: Date;
}

/**
 * Technical prep tracker
 */
export interface TechnicalPrepTracker {
  jobId: string;
  requiredTopics: TechnicalTopic[];
  practiceProblems: PracticeProblemProgress[];
  codingLanguages: LanguageProficiency[];
  overallProgress: number; // 0-100
  weakAreas: string[];
  readyForRound: boolean;
}

export interface TechnicalTopic {
  name: string;
  importance: 'critical' | 'important' | 'useful';
  mastered: boolean;
  lastStudiedAt?: Date;
  studyCount: number;
  practiceProblems: number;
  assessmentScore?: number; // 0-100
}

export interface PracticeProblemProgress {
  problemId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  completed: boolean;
  attempts: number;
  bestTime?: number; // seconds
  targetTime: number; // seconds
  userSolutions: CodeSolution[];
  feedback?: ProblemFeedback;
}

export interface CodeSolution {
  id: string;
  submittedAt: Date;
  language: string;
  code: string;
  testsPassed: number;
  totalTests: number;
  executionTime?: number; // ms
  memoryUsed?: number; // MB
  feedback?: string;
  score?: number; // 0-10
}

export interface ProblemFeedback {
  timeComplexity: string; // "O(n log n)"
  spaceComplexity: string; // "O(n)"
  approach: string;
  optimalApproach?: string;
  commonMistakes: string[];
  topicsToReview: string[];
  similarProblems: string[]; // Problem IDs
  overallScore: number; // 0-10
}

/**
 * System design prep tracker
 */
export interface SystemDesignPrepTracker {
  jobId: string;
  completedDesigns: SystemDesignAttempt[];
  conceptsMastered: string[];
  architectureFamiliar: string[];
  overallProgress: number; // 0-100
  readyForRound: boolean;
}

export interface SystemDesignAttempt {
  id: string;
  problemStatement: string;
  attemptedAt: Date;
  durationMinutes: number;
  userDesign: string; // Description or diagram
  assumptions: string[];
  tradeoffs: string[];
  feedback?: SystemDesignFeedback;
  score?: number; // 0-10
}

export interface SystemDesignFeedback {
  scalability: number; // 0-10
  reliability: number; // 0-10
  maintainability: number; // 0-10
  costOptimization: number; // 0-10
  communication: number; // 0-10
  overallScore: number; // 0-10
  strengths: string[];
  improvements: string[];
  alternativeApproaches: string[];
  referenceSolution?: string;
}

/**
 * Mock interview attempt
 */
export interface MockInterviewAttempt {
  id: string;
  jobId: string;
  type: 'behavioral' | 'technical' | 'system_design' | 'full_loop';
  attemptNumber: number;
  attemptedAt: Date;
  durationMinutes: number;
  questions: MockInterviewQuestion[];
  overallScore: number; // 0-100
  feedback?: MockInterviewFeedback;
  recording?: {
    url: string;
    duration: number;
  };
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  category: string;
  userAnswer: string;
  expectedAnswerPoints: string[];
  coveredPoints: string[];
  score: number; // 0-10
  feedback: string;
  followUpSuggested?: string;
}

export interface MockInterviewFeedback {
  technicalContent: number; // 0-10
  communication: number; // 0-10
  problemSolving: number; // 0-10
  clarifyingQuestions: number; // 0-10
  timeManagement: number; // 0-10
  overallPerformance: number; // 0-10
  strengths: string[];
  areasForImprovement: string[];
  readyForInterview: boolean;
  recommendations: string[];
  timestamp: Date;
}

/**
 * Resume alignment progress
 */
export interface ResumeAlignmentProgress {
  jobId: string;
  targetRole: string;
  matchScore: number; // 0-100
  keywordMatches: KeywordProgress[];
  suggestedEdits: EditProgress[];
  currentVersion: string;
  updatedAt: Date;
}

export interface KeywordProgress {
  keyword: string;
  importance: 'critical' | 'important' | 'useful';
  foundInResume: boolean;
  addedAt?: Date;
  frequency: number;
}

export interface EditProgress {
  id: string;
  originalContent: string;
  suggestedContent: string;
  reason: string;
  appliedAt?: Date;
  applied: boolean;
  impactScore: number;
}

/**
 * Weakness detection and remediation
 */
export interface WeaknessAssessment {
  jobId: string;
  detectedAt: Date;
  weaknesses: Weakness[];
  overallWeaknessSeverity: number; // 0-10
  recommendedFocusAreas: string[];
  improvementPlan?: ImprovementPlan;
}

export interface Weakness {
  id: string;
  category: 'behavioral' | 'technical' | 'system_design' | 'communication' | 'domain_knowledge';
  description: string;
  severity: number; // 0-10
  evidence: string[]; // How it was detected
  impact: string; // Why it matters for this role
  remediation: RemediationStep[];
  targetDate: Date;
}

export interface RemediationStep {
  order: number;
  action: string;
  resource?: string;
  estimatedTime: number; // minutes
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface ImprovementPlan {
  startDate: Date;
  endDate: Date;
  weeklyGoals: WeeklyGoal[];
  estimatedTimePerWeek: number; // hours
}

export interface WeeklyGoal {
  weekNumber: number;
  focus: string;
  specificTasks: string[];
  targetCompletion: Date;
  completed: boolean;
  notes?: string;
}

/**
 * Confidence scoring
 */
export interface ConfidenceScore {
  jobId: string;
  overallConfidence: number; // 0-100
  dimensions: {
    technical: number;
    behavioral: number;
    cultural_fit: number;
    compensation_negotiation: number;
    company_knowledge: number;
  };
  confidence_factors: {
    positive: string[];
    concerns: string[];
  };
  lastCalculatedAt: Date;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Readiness checklist
 */
export interface ReadinessChecklist {
  jobId: string;
  items: ChecklistItem[];
  completionPercentage: number; // 0-100
  overallReady: boolean;
  lastUpdatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  category: string; // 'behavioral', 'technical', 'logistical', etc.
  description: string;
  completed: boolean;
  completedAt?: Date;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
  dueDate?: Date;
  notes?: string;
}
