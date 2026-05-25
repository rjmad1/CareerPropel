/**
 * Career Intelligence Analytics — Shared Types
 *
 * Governance principle: every metric carries confidence + source provenance.
 * DataSourceType distinguishes verified (from user's own DB data),
 * inferred (derived from user data via logic), and estimated (heuristic/baseline).
 */

// ── Governance ───────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type DataSourceType = 'verified' | 'inferred' | 'estimated';

export interface MetricMetadata {
  confidence: ConfidenceLevel;
  source: DataSourceType;
  sampleSize?: number;
  staleDays?: number;
  /** Human-readable note shown in UI, e.g. "estimated from industry baseline" */
  note?: string;
}

/** Every computed metric is wrapped with its governance metadata. */
export interface ScoredMetric<T> {
  value: T;
  meta: MetricMetadata;
}

// ── Pipeline ─────────────────────────────────────────────────────────────────

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number | null;
  avgDaysInStage: number;
  dropOffCount: number;
}

// ── Opportunity Intelligence ─────────────────────────────────────────────────

export interface OpportunityQualityScore {
  jobId: string;
  title: string;
  company: string;
  qualityScore: number; // 0–100 composite score
  successProbability: ScoredMetric<number>; // 0–100, may be inferred/estimated
  signals: OpportunitySignal[];
  alerts: OpportunityAlert[];
  recommendation: 'prioritize' | 'maintain' | 'deprioritize' | 'reconsider';
}

export interface OpportunitySignal {
  type: 'positive' | 'negative' | 'neutral';
  label: string;
  evidence: string;
}

export interface OpportunityAlert {
  severity: 'low' | 'medium' | 'high';
  type:
    | 'compensation_mismatch'
    | 'overqualification'
    | 'underqualification'
    | 'stale'
    | 'low_match';
  message: string;
}

// ── Compensation Intelligence ─────────────────────────────────────────────────

export interface CompensationAnalysis {
  offers: OfferSummary[];
  trajectory: ScoredMetric<CompensationPoint[]>;
  percentileEstimate: ScoredMetric<number | null>;
  negotiationOutcomes: NegotiationOutcome[];
  /** Always present — reminds users that benchmarks are estimates. */
  benchmarkNote: string;
}

export interface OfferSummary {
  jobId: string;
  company: string;
  title: string;
  salary: number | null;
  equity: string | null;
  bonus: number | null;
  status: string;
  negotiated: boolean;
  totalComp: number | null; // salary + bonus
}

export interface CompensationPoint {
  date: string; // YYYY-MM-DD
  salary: number;
  company: string;
}

export interface NegotiationOutcome {
  company: string;
  negotiated: boolean;
  status: string;
}

// ── Behavioral Analytics ──────────────────────────────────────────────────────

export interface BehavioralAnalytics {
  applicationCadence: CadenceMetric;
  followUpConsistency: ScoredMetric<number>; // 0–100 score
  recruiterResponsePatterns: ResponsePattern;
  burnoutRisk: ScoredMetric<'low' | 'medium' | 'high'>;
  workflowEffectiveness: ScoredMetric<number>; // 0–100 composite
  insights: BehavioralInsight[];
}

export interface CadenceMetric {
  appsPerWeek: number;
  trend: 'increasing' | 'stable' | 'declining';
  peakDayOfWeek: string | null;
  consistency: number; // 0–100 — % of weeks with ≥1 application
}

export interface ResponsePattern {
  avgResponseDays: number | null;
  responseRate: number | null;
  bestResponseDayOfWeek: string | null;
}

export interface BehavioralInsight {
  category: 'cadence' | 'follow_up' | 'burnout' | 'effectiveness' | 'timing';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

// ── Longitudinal Intelligence ─────────────────────────────────────────────────

export interface LongitudinalIntelligence {
  compensationGrowth: ScoredMetric<GrowthMetric>;
  skillEvolution: SkillSnapshot[];
  interviewPerformanceTrend: ScoredMetric<PerformanceTrend>;
  networkingExpansion: GrowthMetric;
  pipelineHealthTrend: PipelineHealthPoint[];
  marketAlignment: ScoredMetric<number>; // 0–100 proxy metric
}

export interface GrowthMetric {
  current: number | null;
  previous: number | null;
  changePercent: number | null;
  direction: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

export interface SkillSnapshot {
  name: string;
  proficiency: string;
  addedAt: string; // ISO date
}

export interface PerformanceTrend {
  recentAvgScore: number | null;
  historicalAvgScore: number | null;
  direction: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  dataPoints: number;
}

export interface PipelineHealthPoint {
  period: string; // YYYY-MM
  totalActive: number;
  newApplications: number;
  offerCount: number;
  rejectionCount: number;
}

// ── Strategic Recommendations ─────────────────────────────────────────────────

export interface StrategicRecommendation {
  id: string;
  category: RecommendationCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  evidence: string[];
  action: string;
  confidence: ConfidenceLevel;
  expectedImpact: string;
}

export type RecommendationCategory =
  | 'pipeline_health'
  | 'application_strategy'
  | 'interview_prep'
  | 'compensation_positioning'
  | 'networking'
  | 'profile_optimization'
  | 'market_positioning'
  | 'execution_cadence';

// ── Export Report ─────────────────────────────────────────────────────────────

export interface ExportReport {
  candidateName: string;
  generatedAt: string;
  reportType: 'full' | 'pipeline' | 'compensation' | 'behavioral' | 'coaching';
  opportunityQuality?: unknown;
  compensation?: unknown;
  behavioral?: unknown;
  longitudinal?: unknown;
  recommendations?: StrategicRecommendation[];
}
