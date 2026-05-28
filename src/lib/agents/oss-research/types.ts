/**
 * OSS Research Agent — shared type definitions.
 *
 * The agent pipeline:
 *   1. ComplexityEstimator   → buy-vs-build decision
 *   2. GitHubSearch          → candidate repos
 *   3. RepoEvaluator         → scored + filtered repos
 *   4. ExtractionAgent       → specific modules worth borrowing
 *   5. RefactorAgent         → adaptation to local conventions
 *   6. ProvenanceAgent       → attribution + lineage record
 *   7. Orchestrator          → ties all phases together
 */

// ─── Stack Context ─────────────────────────────────────────────────────────────

export interface StackContext {
  framework: string;             // e.g. "Next.js 14 App Router"
  language: string;              // "TypeScript strict"
  packageManager: string;        // "npm"
  existingDeps: string[];        // names from package.json dependencies
  codingConventions: string;     // free-text summary
  testStrategy: string;          // "Jest + ts-jest"
  runtimeConstraints: string;    // "Node 18+, edge-compatible where possible"
  architecturePatterns: string[]; // ["functional modules", "dependency injection via import", ...]
}

// ─── Research Request ──────────────────────────────────────────────────────────

export interface OssResearchRequest {
  /** What feature/capability needs to be built */
  featureDescription: string;
  /** Concrete deliverable: module, service, API, adapter, etc. */
  deliverable: string;
  /** Ticket ID, spec reference, or PRD link — for provenance */
  specReference?: string;
  /** Optional caller-supplied stack overrides */
  stackContext?: Partial<StackContext>;
  /** Override estimated LOC if already known */
  estimatedLoc?: number;
  /** Override estimated tokens if already known */
  estimatedTokens?: number;
}

// ─── Complexity Assessment ─────────────────────────────────────────────────────

/**
 * Trigger config: thresholds that decide whether OSS research is warranted.
 * All four conditions must be met simultaneously to trigger research.
 */
export interface ResearchTriggerConfig {
  /** LOC threshold: > this triggers research */
  locThreshold: number;
  /** Token threshold: > this triggers research */
  tokenThreshold: number;
  /** Novelty below this triggers research (0 = entirely novel, 1 = pure commodity) */
  noveltyThreshold: number;
  /** OSS probability above this triggers research */
  ossProbabilityThreshold: number;
}

export const DEFAULT_TRIGGER_CONFIG: ResearchTriggerConfig = {
  locThreshold: 600,
  tokenThreshold: 25_000,
  noveltyThreshold: 0.4,
  ossProbabilityThreshold: 0.7,
};

export type FeatureCategory =
  | 'auth'
  | 'vector-db'
  | 'crdt'
  | 'workflow-engine'
  | 'rag-pipeline'
  | 'browser-automation'
  | 'audio-video'
  | 'webrtc'
  | 'agent-orchestration'
  | 'k8s-integration'
  | 'ast-tooling'
  | 'parser-compiler'
  | 'payment-abstraction'
  | 'ocr-pipeline'
  | 'ai-model-adapter'
  | 'business-logic'
  | 'domain-specific'
  | 'core-proprietary'
  | 'internal-orchestration'
  | 'product-differentiation'
  | 'compliance-logic'
  | 'general-utility';

/** Feature categories where OSS research SHOULD be triggered. */
export const OSS_RESEARCH_CATEGORIES: ReadonlySet<FeatureCategory> = new Set<FeatureCategory>([
  'auth',
  'vector-db',
  'crdt',
  'workflow-engine',
  'rag-pipeline',
  'browser-automation',
  'audio-video',
  'webrtc',
  'agent-orchestration',
  'k8s-integration',
  'ast-tooling',
  'parser-compiler',
  'payment-abstraction',
  'ocr-pipeline',
  'ai-model-adapter',
  'general-utility',
]);

/** Feature categories where OSS research SHOULD NOT be triggered. */
export const NO_RESEARCH_CATEGORIES: ReadonlySet<FeatureCategory> = new Set<FeatureCategory>([
  'business-logic',
  'domain-specific',
  'core-proprietary',
  'internal-orchestration',
  'product-differentiation',
  'compliance-logic',
]);

export interface ComplexityAssessment {
  estimatedLoc: number;
  estimatedTokens: number;
  /** 0 = entirely novel/greenfield; 1 = pure commodity infrastructure */
  noveltyScore: number;
  infrastructureRepetition: boolean;
  /** Probability (0–1) that a mature OSS implementation already exists */
  existingOssProbability: number;
  researchTriggered: boolean;
  /** Why the decision was made */
  rationale: string;
  /** Keywords to seed GitHub search */
  searchKeywords: string[];
  featureCategory: FeatureCategory;
  riskLevel: 'low' | 'medium' | 'high';
  /** Human-readable complexity tier */
  effortEstimate: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
}

// ─── GitHub Repo Candidate ─────────────────────────────────────────────────────

export interface RepoCandidate {
  fullName: string;          // "org/repo"
  url: string;               // https://github.com/org/repo
  description: string;
  stars: number;
  forks: number;
  language: string;
  license: string | null;    // SPDX identifier or null
  spdxLicenseId: string | null;
  pushedAt: string;          // ISO-8601 date of last push
  topics: string[];
  openIssues: number;
  defaultBranch: string;
  archived: boolean;
  size: number;              // KB
}

/** Licenses known to be compatible with MIT-licensed projects. */
export const COMPATIBLE_LICENSES = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'Unlicense',
  'CC0-1.0',
  'WTFPL',
  'Zlib',
]);

/** Licenses that are incompatible with closed/proprietary use. */
export const INCOMPATIBLE_LICENSES = new Set([
  'GPL-2.0',
  'GPL-2.0-only',
  'GPL-3.0',
  'GPL-3.0-only',
  'AGPL-3.0',
  'AGPL-3.0-only',
  'SSPL-1.0',
  'Commons-Clause',
  'BUSL-1.1',
]);

// ─── Repo Scoring ──────────────────────────────────────────────────────────────

export interface RepoScores {
  /** Fit with local architecture (25%) */
  architecturalFit: number;
  /** Recent activity, release cadence, issue response (20%) */
  maintenanceHealth: number;
  /** License clear for the use case (20%) */
  licenseCompatibility: number;
  /** Can logic be extracted cleanly without the whole framework (15%) */
  modularity: number;
  /** Known CVEs, dependency hygiene (10%) */
  securityPosture: number;
  /** Stars, downloads, community presence (10%) */
  communityAdoption: number;
  /** Weighted composite 0–100 */
  overall: number;
}

export interface ScoredRepo extends RepoCandidate {
  scores: RepoScores;
  recommendation: 'adopt' | 'extract' | 'reject';
  rejectionReason?: string;
  /** Relative paths inside the repo that are worth extracting */
  extractionCandidates: string[];
  scoreRationale: string;
}

// ─── Extraction ────────────────────────────────────────────────────────────────

export interface ExtractedModule {
  repoFullName: string;
  repoUrl: string;
  /** Commit SHA or branch reference */
  commitRef: string;
  license: string;
  spdxLicenseId: string;
  /** Relative path inside the source repo */
  modulePath: string;
  /** What the module does */
  purpose: string;
  /** Description of the core algorithm/pattern */
  algorithmDescription: string;
  /** Illustrative code snippet (not the full file) */
  codeSnippet: string;
  /** External packages this module depends on */
  dependencies: string[];
  estimatedLoc: number;
  extractionRationale: string;
}

// ─── Refactored / Adapted Module ──────────────────────────────────────────────

export interface AdaptedModule extends ExtractedModule {
  /** Code after adapting to local conventions */
  adaptedCode: string;
  /** Human-readable list of changes made */
  modifications: string[];
  /** Suggested path in this codebase */
  suggestedLocalPath: string;
  /** How to wire this into the existing architecture */
  integrationNotes: string;
  /** New local packages needed after adaptation */
  requiredLocalDeps: string[];
  /** Recommended test approach for the adapted code */
  testStrategy: string;
}

// ─── Provenance ────────────────────────────────────────────────────────────────

export interface ProvenanceSource {
  repoUrl: string;
  repoFullName: string;
  commitRef: string;
  license: string;
  spdxLicenseId: string;
  extractedModules: string[];   // module paths that were extracted
  modifications: string[];
  evaluatedAt: string;          // ISO-8601
}

export interface ProvenanceRecord {
  id: string;                   // cuid
  createdAt: string;            // ISO-8601
  executionId: string;
  featureDescription: string;
  specReference?: string;
  sources: ProvenanceSource[];
  tiersUsed: string[];          // which buy-vs-build tiers were consulted
  finalDecision: 'native' | 'oss-extract' | 'dep-adoption' | 'greenfield';
  /** Short human-readable credit line for changelogs/headers */
  attribution: string;
  /** Notes for legal/compliance review */
  complianceNote: string;
}

// ─── Final Result ──────────────────────────────────────────────────────────────

export type ImplementationTier =
  | 'native-existing'   // reuse internal modules already in codebase
  | 'existing-deps'     // installed packages already solve it
  | 'oss-extract'       // pull focused logic from external OSS
  | 'dep-adoption'      // fully adopt a new package dependency
  | 'greenfield';       // write from scratch

export interface OssResearchResult {
  requestId: string;
  featureDescription: string;
  complexityAssessment: ComplexityAssessment;
  researchTriggered: boolean;
  implementationTier: ImplementationTier;
  // Populated when researchTriggered = true
  evaluatedRepos?: ScoredRepo[];
  extractedModules?: ExtractedModule[];
  adaptedModules?: AdaptedModule[];
  provenance?: ProvenanceRecord;
  // Always present
  recommendation: string;
  implementationGuide: string;
  // Populated when researchTriggered = false
  nativeImplementationSuggestion?: string;
  estimatedEffort: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
  safetyWarnings: string[];
}
