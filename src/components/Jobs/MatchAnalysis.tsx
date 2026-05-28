'use client';

import { useState, useCallback } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardBody, Button } from '@/components/ui';

export interface MatchAnalysisData {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  scoredAt: string;
}

interface MatchAnalysisProps {
  jobId: string;
  initialScore?: number;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#3b82f6' :
    score >= 40 ? '#f59e0b' :
    '#ef4444';

  return (
    <svg viewBox="0 0 88 88" className="w-24 h-24" data-cy="match-score-ring">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        className="transition-all duration-700"
      />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="central" className="text-xl font-extrabold" fill={color} fontSize="18" fontWeight="800">
        {score}
      </text>
      <text x="44" y="60" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
        / 100
      </text>
    </svg>
  );
}

export function MatchAnalysis({ jobId, initialScore = 0 }: MatchAnalysisProps) {
  const [analysis, setAnalysis] = useState<MatchAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentScore, setCurrentScore] = useState(initialScore);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/jobs/${jobId}/match`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Analysis failed');
      const data: MatchAnalysisData = json.data ?? json;
      setAnalysis(data);
      setCurrentScore(data.score);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const scoreLabel =
    currentScore >= 80 ? 'Exceptional Fit' :
    currentScore >= 60 ? 'Strong Fit' :
    currentScore >= 40 ? 'Partial Fit' :
    currentScore > 0 ? 'Weak Fit' : 'Not Scored';

  const scoreLabelColor =
    currentScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    currentScore >= 60 ? 'text-blue-600 dark:text-blue-400' :
    currentScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
    currentScore > 0 ? 'text-red-600 dark:text-red-400' :
    'text-slate-400';

  return (
    <div className="flex flex-col gap-5" data-cy="match-analysis-panel">
      {/* Score Header */}
      <Card>
        <CardBody className="p-6 flex items-center gap-6">
          <ScoreRing score={currentScore} />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className={`text-lg font-extrabold ${scoreLabelColor}`}>{scoreLabel}</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {analysis?.summary || (currentScore > 0
                ? 'Score stored from previous analysis. Run analysis to get detailed breakdown.'
                : 'No analysis yet — click below to score this job against your profile.')}
            </p>
            {analysis?.scoredAt && (
              <span className="text-xs text-slate-400 mt-1">
                Scored {new Date(analysis.scoredAt).toLocaleString()}
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Run / Re-run Button */}
      <Button
        variant="primary"
        className="flex items-center justify-center gap-2 w-full"
        onClick={runAnalysis}
        disabled={loading}
        data-cy="run-match-analysis-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing against your profile…</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>{analysis ? 'Re-run Analysis' : 'Analyze Match with AI'}</span>
          </>
        )}
      </Button>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" role="alert">
          {error}
        </div>
      )}

      {/* Detailed Results */}
      {analysis && (
        <div className="flex flex-col gap-4">
          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <Card>
              <CardBody className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Strengths</h4>
                </div>
                <ul className="flex flex-col gap-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 dark:text-slate-300" data-cy="match-strength">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Gaps */}
          {analysis.gaps.length > 0 && (
            <Card>
              <CardBody className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Skill Gaps</h4>
                </div>
                <ul className="flex flex-col gap-2">
                  {analysis.gaps.map((g, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 dark:text-slate-300" data-cy="match-gap">
                      <span className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        !
                      </span>
                      {g}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Next Steps */}
          {analysis.nextSteps.length > 0 && (
            <Card>
              <CardBody className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Next Steps</h4>
                </div>
                <ul className="flex flex-col gap-2">
                  {analysis.nextSteps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 dark:text-slate-300" data-cy="match-next-step">
                      <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !analysis && (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  );
}
