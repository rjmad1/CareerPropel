import type { MasterAccomplishment } from '../master-profile/types';

export interface BankQuery {
  /** Target role keywords to rank against */
  targetRole?: string;
  /** Target industry */
  targetIndustry?: string;
  /** Specific skills the role requires */
  requiredSkills?: string[];
  /** Competencies to prioritize */
  competencies?: string[];
  /** Maximum number of accomplishments to return */
  limit?: number;
  /** Only include verified items */
  verifiedOnly?: boolean;
}

export interface RankedAccomplishment extends MasterAccomplishment {
  relevanceScore: number;
  matchedSkills: string[];
  matchedKeywords: string[];
}

export interface BankSelectionResult {
  selected: RankedAccomplishment[];
  totalInBank: number;
  scoreThreshold: number;
}
