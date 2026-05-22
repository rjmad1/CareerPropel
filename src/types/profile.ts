/**
 * Profile Intelligence System Types
 *
 * Data structures for managing user profile entities,
 * semantic extraction, and profile completeness scoring.
 */

/**
 * Extracted entity from user documents (resume, cover letter, etc.)
 */
export interface ProfileEntity {
  id: string;
  candidateId: string;
  type: 'skill' | 'achievement' | 'experience' | 'education' | 'certification' | 'language';
  content: string;
  confidence: number; // 0-1, extraction confidence
  source: 'resume' | 'cover_letter' | 'linkedin' | 'manual';
  tags: string[]; // categorization tags
  relatedEntityIds: string[];
  extractedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extraction/parsing job log
 */
export interface ExtractionLog {
  id: string;
  candidateId: string;
  documentType: 'resume' | 'cover_letter' | 'linkedin';
  status: 'success' | 'partial' | 'failed';
  totalEntities: number;
  confidence: number; // average confidence
  errors?: string;
  duration?: number; // milliseconds
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Profile completeness score
 */
export interface ProfileScore {
  id: string;
  candidateId: string;
  totalScore: number; // 0-100
  personalInfoScore: number;
  resumeScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  goalsScore: number;
  portfolioScore: number;
  completeness: number; // percentage
  recommendations?: ProfileRecommendation[];
  lastUpdated: Date;
}

/**
 * Profile improvement recommendation
 */
export interface ProfileRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'skills' | 'experience' | 'resume' | 'portfolio' | 'goals' | 'education';
  suggestion: string;
  impact: string; // how it helps applications
  estimatedTime: number; // minutes to complete
  action?: string; // suggested action
}

/**
 * Semantic skill representation
 */
export interface SemanticSkill {
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'language';
  proficiency: 'beginner' | 'intermediate' | 'proficient' | 'expert';
  yearsOfExperience?: number;
  endorsements?: number;
  projects?: string[]; // project IDs where used
  lastUsed?: Date;
  marketDemand?: 'low' | 'medium' | 'high';
}

/**
 * Quantifiable achievement
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  metrics: {
    metric: string;
    value: number | string;
    unit: string;
  }[];
  context: string; // project/company context
  impact: string; // business impact
  sourceProject?: string;
  date: Date;
  relevantSkills: string[];
  // Optional STAR framework fields
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
}

/**
 * Resume fragment for reuse
 */
export interface ResumeFragment {
  id: string;
  candidateId: string;
  section: 'experience' | 'achievement' | 'skill' | 'project';
  content: string;
  sourceDocument: string;
  jobRelevance: string[]; // job IDs where this was tailored
  achievementId?: string; // links fragment to a source achievement for clean deletion
  createdAt: Date;
  lastUsed?: Date;
}

/**
 * Profile knowledge graph node
 */
export interface ProfileNode {
  id: string;
  type: 'skill' | 'achievement' | 'company' | 'project' | 'person';
  name: string;
  description?: string;
  connections: string[]; // node IDs this connects to
  confidence: number;
  metadata?: Record<string, unknown>;
}

/**
 * Complete profile summary
 */
export interface ProfileSummary {
  candidateId: string;
  completenessScore: ProfileScore;
  topSkills: SemanticSkill[];
  recentAchievements: Achievement[];
  recommendations: ProfileRecommendation[];
  extractionQuality: {
    totalEntities: number;
    averageConfidence: number;
    documentCount: number;
    lastExtraction: Date;
  };
  careerNarrative?: string; // AI-generated summary of career
}
