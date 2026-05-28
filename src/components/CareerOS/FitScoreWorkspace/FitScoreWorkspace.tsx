/**
 * FitScoreWorkspace
 *
 * Primary workspace for the Fit Evaluation Engine UI.
 * Displays:
 *  - Overview dashboard: all scored jobs ranked by fit
 *  - Detail view: per-job 11-dimensional breakdown
 *  - Role intelligence card: deconstructed role reality
 *  - Strength & gap summary
 *  - Recommendations with suppression indicators
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { useFitScores, useFitScore, useFitDeconstruction, useRunFitAnalysis, useReanalyzeFit } from '@/lib/fit-engine/hooks/useFitAnalysis';
import type { FitScoringSnapshot } from '@prisma/client';

// ─── Brand Colors ────────────────────────────────────────────────────────────

const SCORE_COLORS = {
  high: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  medium: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
  low: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', bar: 'bg-red-500' },
} as const;

function getScoreColor(score: number) {
  if (score >= 0.7) return SCORE_COLORS.high;
  if (score >= 0.4) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

const RECOMMENDATION_COLORS: Record<string, { bg: string; text: string }> = {
  STRONG_PURSUE: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  PURSUE: { bg: 'bg-blue-100', text: 'text-blue-800' },
  CONSIDER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  DEPRIORITIZE: { bg: 'bg-orange-100', text: 'text-orange-800' },
  SUPPRESS: { bg: 'bg-gray-200', text: 'text-gray-600' },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function FitScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const color = getScoreColor(score);
  const contribution = score * weight;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs font-semibold ${color.text}`}>
          {(score * 100).toFixed(0)}% × {((weight || 0) * 100).toFixed(0)}% = {(contribution * 100).toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
          style={{ width: `${Math.max(score * 100, 2)}%` }}
        />
      </div>
    </div>
  );
}

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = getScoreColor(score);
  const sizeClasses = size === 'lg' ? 'text-3xl px-4 py-2' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xl px-3 py-1.5';
  return (
    <span className={`inline-flex items-center font-bold rounded-lg ${color.bg} ${color.text} ${sizeClasses}`}>
      {(score * 100).toFixed(0)}%
    </span>
  );
}

function ScoreOverviewCard({ score, job }: { score: FitScoringSnapshot; job: { title: string; company: string } }) {
  const [expanded, setExpanded] = useState(false);
  const recColor = RECOMMENDATION_COLORS[score.recommendation] || RECOMMENDATION_COLORS.CONSIDER;
  const totalScore = score.fitScore || 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${totalScore >= 0.7 ? 'border-l-4 border-l-emerald-400' : totalScore >= 0.4 ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-gray-300'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{job.title}</CardTitle>
            <CardDescription>{job.company}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBadge score={totalScore} size="md" />
            <Badge className={`${recColor.bg} ${recColor.text}`}>{score.recommendation.replace('_', ' ')}</Badge>
          </div>
        </div>
        {score.suppressed && (
          <Badge className="bg-gray-200 text-gray-600 mt-1">Suppressed: {score.suppressionReason}</Badge>
        )}
      </CardHeader>

      {expanded && score.dimensionScores && (
        <CardContent className="animate-slideDown">
          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">11-Dimension Breakdown</h4>

            {Object.entries(score.dimensionScores as Record<string, { score: number; weight: number; evidence: string }>)
              .filter(([key]) => key !== 'OVERALL')
              .sort(([, a], [, b]) => (b.weight || 0) - (a.weight || 0))
              .map(([dim, ds]) => (
                <FitScoreBar key={dim} label={formatDimension(dim)} score={ds.score ?? 0} weight={ds.weight ?? 0} />
              ))}

            {/* Leverage Points & Blockers */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="text-xs font-semibold text-emerald-700 mb-1">Leverage Points</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {(score.strongestLeveragePoints as string[] | undefined)?.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5">◆</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-red-700 mb-1">Blockers</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {(score.biggestBlockers as string[] | undefined)?.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-red-400 mt-0.5">▲</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {score.recommendationRationale && (
              <p className="text-xs text-gray-500 italic mt-3 border-t pt-2">{score.recommendationRationale}</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function RoleIntelligenceCard({ deconstruction }: { deconstruction: any }) {
  if (!deconstruction) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Role Intelligence</CardTitle>
        <CardDescription>Deconstructed operational reality</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Inferred Role:</span>
          <span className="font-semibold">{deconstruction.inferredRole?.title || 'Unknown'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Archetype:</span>
          <Badge className="bg-purple-100 text-purple-800">{deconstruction.roleArchetype}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Role Clarity:</span>
          <span>{(deconstruction.roleClarityScore * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Complexity:</span>
          <span>{'★'.repeat(Math.round(deconstruction.executionComplexity || deconstruction.executionComplexity || 0))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Domain:</span>
          <span className="capitalize">{deconstruction.operationalDomain}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Org Leverage:</span>
          <span>{(deconstruction.organizationalLeverage || 0)}/10</span>
        </div>
        {deconstruction.recurringResponsibilities && deconstruction.recurringResponsibilities.length > 0 && (
          <div>
            <p className="text-gray-500 mb-1">Recurring Responsibilities:</p>
            <ul className="list-disc list-inside text-xs text-gray-600">
              {deconstruction.recurringResponsibilities.map((r: any, i: number) => (
                <li key={i}>{r.responsibility} (freq: {(r.frequency * 100).toFixed(0)}%)</li>
              ))}
            </ul>
          </div>
        )}
        {deconstruction.businessProblems && deconstruction.businessProblems.length > 0 && (
          <div>
            <p className="text-gray-500 mb-1">Employer Pain Points:</p>
            {deconstruction.businessProblems.map((bp: any, i: number) => (
              <div key={i} className="text-xs bg-red-50 rounded p-2 mb-1">
                <span className="font-medium">{bp.problem}</span>
                {bp.evidence && <p className="text-gray-400 mt-0.5">Evidence: {bp.evidence}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GapSummaryCard({ gaps, jobId, onReanalyze }: { gaps: any[]; jobId: string; onReanalyze: (stages: string[]) => void }) {
  if (!gaps || gaps.length === 0) return null;

  const credibilityGaps = gaps.filter((g: any) => g.classification === 'CREDIBILITY_KILLING');
  const trainableGaps = gaps.filter((g: any) => g.classification === 'TRAINABLE');
  const domainGaps = gaps.filter((g: any) => g.classification === 'DOMAIN_DEPTH');
  const adaptationGaps = gaps.filter((g: any) => g.classification === 'ADAPTATION_SPEED');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm">Gap Analysis</CardTitle>
          <CardDescription>{gaps.length} identified gaps</CardDescription>
        </div>
        <button
          className="text-xs text-blue-600 hover:text-blue-800 underline"
          onClick={() => onReanalyze(['gap-analysis'])}
        >
          Re-analyze
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 text-xs">
          <Badge className="bg-red-100 text-red-800">{credibilityGaps.length} Credibility</Badge>
          <Badge className="bg-amber-100 text-amber-800">{trainableGaps.length} Trainable</Badge>
          <Badge className="bg-blue-100 text-blue-800">{domainGaps.length} Domain</Badge>
          <Badge className="bg-purple-100 text-purple-800">{adaptationGaps.length} Adaptation</Badge>
        </div>

        {gaps.slice(0, 5).map((g: any, i: number) => {
          const classificationColor: Record<string, string> = {
            CREDIBILITY_KILLING: 'border-red-300 bg-red-50',
            TRAINABLE: 'border-amber-300 bg-amber-50',
            DOMAIN_DEPTH: 'border-blue-300 bg-blue-50',
            ADAPTATION_SPEED: 'border-purple-300 bg-purple-50',
          };
          return (
            <div key={i} className={`text-xs p-2 rounded border ${classificationColor[g.classification] || 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className="font-medium">{g.gap}</span>
                <span className="text-gray-400">sev: {g.severity}/10</span>
              </div>
              {g.adjacentProof && <p className="text-gray-500 mt-0.5">Mitigation: {g.adjacentProof}</p>}
              {g.blockingReason && <p className="text-red-600 mt-0.5">⛔ {g.blockingReason}</p>}
              {g.alternativeRoute && <p className="text-blue-600 mt-0.5">Alternative: {g.alternativeRoute}</p>}
            </div>
          );
        })}
        {gaps.length > 5 && <p className="text-xs text-gray-400">+ {gaps.length - 5} more gaps</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Workspace ──────────────────────────────────────────────────────────

export function FitScoreWorkspace() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'detail'>('overview');

  // Queries
  const { data: scoresData, isLoading: scoresLoading, error: scoresError } = useFitScores({ page: 1, limit: 50 });
  const { data: scoreDetail, isLoading: detailLoading } = useFitScore(selectedJobId || undefined);
  const { data: deconstructionData } = useFitDeconstruction(selectedJobId || undefined);

  // Mutations
  const runAnalysis = useRunFitAnalysis();
  const reanalyze = useReanalyzeFit();

  const handleReanalyze = (stages: string[]) => {
    if (!selectedJobId) return;
    reanalyze.mutate({
      jobId: selectedJobId,
      stages: stages as Array<'deconstruction' | 'strength-mapping' | 'gap-analysis' | 'fit-scoring'>,
    });
  };

  const scores = scoresData?.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fit Score Workspace</h1>
        <p className="text-sm text-gray-500 mt-1">
          11-dimensional fit evaluation — measures what actually matters, not keyword density
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            analysisMode === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setAnalysisMode('overview')}
        >
          Overview
        </button>
        {selectedJobId && (
          <>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => setAnalysisMode('detail')}
            >
              Detail View
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={() => handleReanalyze(['fit-scoring'])}
              disabled={reanalyze.isPending}
            >
              {reanalyze.isPending ? 'Re-scoring...' : 'Re-score'}
            </button>
          </>
        )}
      </div>

      {/* Loading State */}
      {scoresLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {scoresError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <p className="text-red-700 text-sm">
              Failed to load fit scores: {scoresError instanceof Error ? scoresError.message : 'Unknown error'}
            </p>
            <button
              className="mt-2 text-sm text-red-600 underline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!scoresLoading && !scoresError && scores.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Fit Scores Yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Run a fit analysis on a job to see how your capabilities align with employer needs.
            </p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              onClick={() => {
                const rawJdText = prompt('Paste a job description URL or text:');
                if (rawJdText) {
                  runAnalysis.mutate({ rawJdText });
                }
              }}
            >
              Analyze a Job
            </button>
          </CardContent>
        </Card>
      )}

      {/* Overview: All Scores */}
      {analysisMode === 'overview' && scores.length > 0 && (
        <div className="grid gap-4">
          {/* Summary Header */}
          <div className="flex gap-4 mb-2 text-sm">
            <span className="text-gray-500">
              Strong Pursue: <strong className="text-emerald-700">{scores.filter((s) => s.recommendation === 'STRONG_PURSUE').length}</strong>
            </span>
            <span className="text-gray-500">
              Pursue: <strong className="text-blue-700">{scores.filter((s) => s.recommendation === 'PURSUE').length}</strong>
            </span>
            <span className="text-gray-500">
              Consider: <strong className="text-amber-700">{scores.filter((s) => s.recommendation === 'CONSIDER').length}</strong>
            </span>
            <span className="text-gray-500">
              Deprioritize: <strong className="text-orange-700">{scores.filter((s) => s.recommendation === 'DEPRIORITIZE').length}</strong>
            </span>
            <span className="text-gray-500">
              Suppressed: <strong className="text-gray-600">{scores.filter((s) => s.recommendation === 'SUPPRESS' || s.suppressed).length}</strong>
            </span>
          </div>

          {/* Score Cards */}
          {scores.map((s) => (
            <div
              key={s.id}
              className={`cursor-pointer ${selectedJobId === s.job.id ? 'ring-2 ring-blue-400 rounded-xl' : ''}`}
              onClick={() => {
                setSelectedJobId(s.job.id);
                setAnalysisMode('detail');
              }}
            >
              <ScoreOverviewCard score={s} job={s.job} />
            </div>
          ))}
        </div>
      )}

      {/* Detail View */}
      {analysisMode === 'detail' && selectedJobId && (
        <div className="grid grid-cols-3 gap-6">
          {/* Main Score Column */}
          <div className="col-span-2 space-y-4">
            {detailLoading ? (
              <Skeleton className="h-96 rounded-xl" />
            ) : scoreDetail?.data ? (
              <>
                {/* Score Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{scoreDetail.data.job.title}</CardTitle>
                        <CardDescription>{scoreDetail.data.job.company}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${RECOMMENDATION_COLORS[scoreDetail.data.recommendation]?.bg || 'bg-gray-100'} ${RECOMMENDATION_COLORS[scoreDetail.data.recommendation]?.text || 'text-gray-700'} text-sm px-3 py-1`}>
                          {scoreDetail.data.recommendation.replace('_', ' ')}
                        </Badge>
                        <ScoreBadge score={scoreDetail.data.fitScore} size="lg" />
                      </div>
                    </div>
                    {scoreDetail.data.suppressed && (
                      <Badge className="bg-gray-200 text-gray-600 mt-2">
                        Suppressed: {scoreDetail.data.suppressionReason}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Conversion Probability */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Interview Conversion Probability</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {(scoreDetail.data.interviewConversionProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Dimension Breakdown */}
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">11-Dimension Score Breakdown</h4>
                    {Object.entries(scoreDetail.data.dimensionScores as Record<string, { score: number; weight: number; evidence: string; confidence: number }>)
                      .sort(([, a], [, b]) => (b.weight || 0) - (a.weight || 0))
                      .map(([dim, ds]) => (
                        <div key={dim} className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">{formatDimension(dim)}</span>
                              {ds.evidence && (
                                <p className="text-xs text-gray-500 mt-1 italic">{ds.evidence}</p>
                              )}
                            </div>
                            <div className="text-right ml-3">
                              <span className={`text-lg font-bold ${getScoreColor(ds.score ?? 0).text}`}>
                                {(ds.score ?? 0) * 100}%
                              </span>
                              <span className="text-xs text-gray-400 block">
                                w: {((ds.weight || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getScoreColor(ds.score ?? 0).bar}`}
                              style={{ width: `${Math.max((ds.score ?? 0) * 100, 2)}%` }}
                            />
                          </div>
                          {ds.confidence && ds.confidence < 0.5 && (
                            <p className="text-xs text-amber-600 mt-1">Low confidence assessment ({((ds.confidence || 0) * 100).toFixed(0)}%)</p>
                          )}
                        </div>
                      ))}

                    {/* Recruiter Perception */}
                    {scoreDetail.data.expectedRecruiterPerception && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Expected Recruiter Perception</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{scoreDetail.data.expectedRecruiterPerception}</p>
                      </div>
                    )}

                    {scoreDetail.data.recommendationRationale && (
                      <div className="mt-3 text-xs text-gray-500 italic border-t pt-3">
                        {scoreDetail.data.recommendationRationale}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No score data available for this job.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {deconstructionData?.data && (
              <RoleIntelligenceCard deconstruction={deconstructionData.data} />
            )}

            {deconstructionData?.data && (
              <GapSummaryCard
                gaps={deconstructionData.data.businessProblems || []}
                jobId={selectedJobId}
                onReanalyze={handleReanalyze}
              />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full text-sm px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  onClick={() => handleReanalyze(['fit-scoring'])}
                  disabled={reanalyze.isPending}
                >
                  {reanalyze.isPending ? 'Re-scoring...' : '🔄 Re-score'}
                </button>
                <button
                  className="w-full text-sm px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                  onClick={() => handleReanalyze(['deconstruction', 'strength-mapping', 'gap-analysis', 'fit-scoring'])}
                  disabled={reanalyze.isPending}
                >
                  {reanalyze.isPending ? 'Running...' : '🔍 Full Re-analysis'}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Running Analysis Indicator */}
      {runAnalysis.isPending && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border p-4 flex items-center gap-3">
          <Spinner size="sm" />
          <div>
            <p className="text-sm font-medium">Analyzing Job Fit</p>
            <p className="text-xs text-gray-500">{runAnalysis.currentStage || 'Processing...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDimension(dim: string): string {
  return dim
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
