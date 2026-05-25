export type ConsistencyIssueLevel = 'error' | 'warning' | 'info';

export type ConsistencyIssueType =
  | 'title_mismatch'
  | 'chronology_gap'
  | 'chronology_overlap'
  | 'skill_missing_in_resume'
  | 'skill_missing_in_linkedin'
  | 'technology_contradiction'
  | 'date_mismatch'
  | 'employer_mismatch'
  | 'metric_contradiction'
  | 'keyword_terminology_drift';

export interface ConsistencyIssue {
  type:    ConsistencyIssueType;
  level:   ConsistencyIssueLevel;
  message: string;
  /** Which document surface the issue was detected on */
  source:  'resume' | 'linkedin' | 'cover_letter' | 'cross_document';
  /** Human-readable suggestion for resolution */
  fix:     string;
}

export interface ConsistencyAuditReport {
  candidateId:  string;
  auditedAt:    string;
  overallScore: number;  // 0–100 (100 = perfectly consistent)
  issues:       ConsistencyIssue[];
  errorCount:   number;
  warningCount: number;
  passed:       boolean;
}
