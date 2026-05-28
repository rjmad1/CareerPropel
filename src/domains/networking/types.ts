export interface ContactIntelligence {
  influenceScore: number;
  hiringAuthorityScore: number;
  responseProbability: number;
  outreachPriority: number;
  recruiterType?: string;
  warmPaths: WarmPath[];
  linkedinSignals: LinkedInSignals;
}

export type WarmPathType =
  | 'MUTUAL_CONNECTION'
  | 'ALUMNI'
  | 'SHARED_COMPANY'
  | 'TECH_OVERLAP'
  | 'COMMUNITY';

export interface WarmPath {
  type: WarmPathType;
  description: string;
  confidence: number;
  verified: boolean;
}

export type SeniorityLevel =
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'DIRECTOR'
  | 'VP'
  | 'C_LEVEL';

export interface LinkedInSignals {
  jobTitle: string;
  seniority: SeniorityLevel;
  hiringSignals: string[];
  sharedBackground: string[];
  skillOverlap: string[];
  connectionDegree?: 1 | 2 | 3;
}

export interface RelationshipScore {
  total: number;
  hiringAuthority: number;
  roleAlignment: number;
  mutualConnections: number;
  recruiterSpecialization: number;
  responseProbability: number;
  companyInfluence: number;
  activityRecency: number;
  breakdown: Record<string, number>;
}

export interface OutreachRequest {
  contactId: string;
  campaignId: string;
  channel: 'LINKEDIN' | 'EMAIL' | 'PHONE';
  sequenceStep: number;
  context: {
    jobTitle?: string;
    company?: string;
    warmPath?: WarmPath;
    candidateStrengths?: string[];
    mutualConnections?: string[];
    contactName?: string;
    contactRole?: string;
  };
}

export interface GeneratedOutreach {
  subject?: string;
  message: string;
  personalizedMessage: string;
  tone: 'PROFESSIONAL' | 'WARM' | 'CASUAL';
  safetyChecks: SafetyCheck[];
  approved: boolean;
}

export interface SafetyCheck {
  rule: string;
  passed: boolean;
  reason?: string;
}

export interface RecruiterDiscoveryRequest {
  jobId: string;
  company: string;
  jobTitle: string;
  location?: string;
  description?: string;
}

export interface DiscoveredRecruiter {
  name: string;
  title: string;
  company: string;
  linkedinUrl?: string;
  email?: string;
  recruiterType: string;
  confidenceScore: number;
  discoverySource: string;
}

export interface ContactFilters {
  contactType?: string;
  recruiterType?: string;
  minScore?: number;
  company?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ContactScores {
  influenceScore?: number;
  hiringAuthorityScore?: number;
  outreachPriority?: number;
  responseProbability?: number;
  recruiterType?: string;
  contactType?: string;
  linkedinConnectionDegree?: number;
  mutualConnections?: number;
  discoveryMetadata?: Record<string, unknown>;
  lastInteractionAt?: Date;
  lastReplyAt?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface CampaignFilters {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CampaignStats {
  totalOutreaches: number;
  sent: number;
  replied: number;
  replyRate: number;
  pending: number;
}

export interface CreateCampaignInput {
  candidateId: string;
  jobId?: string;
  company: string;
  objective: string;
}

export interface CreateOutreachInput {
  campaignId: string;
  contactId: string;
  channel: 'LINKEDIN' | 'EMAIL' | 'PHONE';
  message: string;
  personalizedMessage?: string;
  sequenceStep?: number;
  scheduledAt?: Date;
}

export interface TemplateMetrics {
  template: string;
  sent: number;
  replied: number;
  replyRate: number;
}

export interface NetworkingDashboardStats {
  totalContacts: number;
  activeOutreaches: number;
  replyRate: number;
  warmPaths: number;
  campaignsActive: number;
  avgResponseTime: number;
}

export interface ScoreRelationshipParams {
  hiringAuthorityLevel: string;
  roleAlignmentPercent: number;
  mutualConnectionCount: number;
  isSpecializedRecruiter: boolean;
  historicalResponseRate: number;
  companySize: 'STARTUP' | 'MID' | 'ENTERPRISE';
  lastActivityDaysAgo: number;
}
