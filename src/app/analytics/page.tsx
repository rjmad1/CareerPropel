'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { AnalyticsExportButtons } from '@/components/analytics/AnalyticsExportButtons';
import { calculateAnalytics, AnalyticsMetrics } from '@/lib/analytics/export';
import { Button, Card, CardBody, Skeleton } from '@/components/ui';
import { RefreshCw, BarChart3, AlertCircle, Compass, Globe, Layers, Activity } from 'lucide-react';
import { ApplicationAnalytics } from '@/components/analytics/ApplicationAnalytics';
import { CareerTrajectory } from '@/components/analytics/CareerTrajectory';
import { MarketInsights } from '@/components/analytics/MarketInsights';
import { AnalyticsTimingPanel, ROIData, ForecastData } from '@/components/analytics/AnalyticsTimingPanel';
import { parseAnalyticsState, buildUrl } from '@/lib/navigation/state';

interface Job {
  id: string;
  stage: string;
  company: string;
  minSalary?: number;
  maxSalary?: number;
  matchScore?: number;
  createdAt: string;
}

const STAGE_LABELS: Record<string, string> = {
  SOURCED: 'Sourced', INTERESTED: 'Interested', TAILORING: 'Tailoring',
  APPLIED: 'Applied', RECRUITER_SCREEN: 'Recruiter Screen', HIRING_MANAGER: 'Hiring Manager',
  TECHNICAL_INTERVIEW: 'Technical Interview', SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral', FINAL_ROUND: 'Final Round', OFFER: 'Offer',
  NEGOTIATION: 'Negotiation', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
};

const KPI_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  blue:   { text: 'text-blue-650 dark:text-blue-400',   bg: 'bg-blue-50/30 dark:bg-blue-950/10',   border: 'border-blue-100 dark:border-blue-900/50' },
  green:  { text: 'text-green-650 dark:text-green-450', bg: 'bg-green-50/30 dark:bg-green-950/10', border: 'border-green-100 dark:border-green-900/50' },
  purple: { text: 'text-purple-650 dark:text-purple-400', bg: 'bg-purple-50/30 dark:bg-purple-950/10', border: 'border-purple-100 dark:border-purple-900/50' },
  red:    { text: 'text-red-650 dark:text-red-400',     bg: 'bg-red-50/30 dark:bg-red-950/10',     border: 'border-red-100 dark:border-red-900/50' },
};

// Inner component — needs Suspense because it uses useSearchParams
function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── URL state (canonical) ──
  const urlState = parseAnalyticsState(searchParams);
  const activeTab = urlState.tab as 'pipeline' | 'roi' | 'trajectory' | 'market';

  function setTab(tab: string) {
    const next = buildUrl(pathname, { tab }, searchParams);
    router.replace(next, { scroll: false });
  }

  // ── Data state ──
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [roiLoading, setRoiLoading] = useState(false);
  const [roiError, setRoiError] = useState('');

  useEffect(() => { fetchJobs(); }, []);

  // Lazy-load ROI + forecast when the ROI tab first opens
  useEffect(() => {
    if (activeTab !== 'roi' || roiData || roiLoading) return;
    setRoiLoading(true);
    setRoiError('');
    async function fetchJson(url: string) {
      const r = await fetch(url);
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        throw new Error(`${url} returned ${r.status}: ${text}`);
      }
      return r.json();
    }
    Promise.all([fetchJson('/api/analytics/roi'), fetchJson('/api/analytics/forecast')])
      .then(([roi, forecast]) => {
        if (roi.error) throw new Error(roi.error);
        setRoiData(roi as ROIData);
        setForecastData(forecast as ForecastData);
      })
      .catch((e) => setRoiError(e.message ?? 'Failed to load ROI data'))
      .finally(() => setRoiLoading(false));
  }, [activeTab, roiData, roiLoading]);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?limit=500');
      const json = await res.json();
      setJobs(Array.isArray(json) ? json : json.data ?? []);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  const metrics: AnalyticsMetrics = useMemo(() => calculateAnalytics(jobs as any), [jobs]);
  const stageBreakdownEntries = Object.entries(metrics.stageBreakdown).filter(([, c]) => c > 0).sort(([, a], [, b]) => b - a);
  const maxStageCount = Math.max(...stageBreakdownEntries.map(([, c]) => c), 1);

  const matchBuckets = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    jobs.forEach(j => {
      const s = j.matchScore ?? 0;
      if (s < 25) buckets[0]++;
      else if (s < 50) buckets[1]++;
      else if (s < 75) buckets[2]++;
      else buckets[3]++;
    });
    return buckets;
  }, [jobs]);

  const maxMatchBucket = Math.max(...matchBuckets, 1);

  const tabs = [
    { id: 'pipeline',    label: 'Pipeline Performance',   icon: Layers },
    { id: 'roi',         label: 'Advanced ROI & Funnel',  icon: Activity,  cy: 'tab-roi' },
    { id: 'trajectory',  label: 'Career Trajectory Map',  icon: Compass,   cy: 'tab-trajectory' },
    { id: 'market',      label: 'Market Timing & Demand', icon: Globe,     cy: 'tab-market' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-2.5 p-4 text-sm text-red-800 border border-red-100 bg-red-50/50 rounded-xl" role="alert">
          <AlertCircle className="w-4 h-4 text-red-650 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Row — selection persisted to URL */}
      <nav
        aria-label="Analytics tabs"
        className="flex border-b border-slate-100 dark:border-slate-800 pb-px overflow-x-auto gap-2 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`analytics-panel-${tab.id}`}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-800'
              }`}
              data-cy={tab.cy}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Header toolbar */}
      {activeTab === 'pipeline' && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 -mt-2">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {jobs.length} total applications analyzed
          </span>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-6" role="status" aria-label="Loading analytics data">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardBody className="p-5 flex flex-col gap-3"><Skeleton height="h-3" width="w-24" className="dark:bg-slate-800" /><Skeleton height="h-8" width="w-16" className="dark:bg-slate-800" /></CardBody></Card>
            ))}
          </div>
          <Card><CardBody className="p-6 flex flex-col gap-4"><Skeleton height="h-4" width="w-48" className="dark:bg-slate-800" /><div className="flex flex-col gap-3">{[1,2,3,4,5].map((i)=>(<div key={i} className="flex items-center gap-4"><Skeleton height="h-3" width="w-36" className="dark:bg-slate-800" /><Skeleton height="h-2.5" className="flex-1 dark:bg-slate-800" /><Skeleton height="h-3" width="w-6" className="dark:bg-slate-800" /></div>))}</div></CardBody></Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2].map((i)=>(<Card key={i}><CardBody className="p-6 flex flex-col gap-4"><Skeleton height="h-4" width="w-32" className="dark:bg-slate-800" /><div className="flex flex-col gap-3">{[1,2,3,4].map((j)=>(<Skeleton key={j} height="h-3" className="dark:bg-slate-800" />))}</div></CardBody></Card>))}</div>
        </div>
      ) : (
        <div className="w-full" role="tabpanel" id={`analytics-panel-${activeTab}`}>
          {/* ── Pipeline tab ── */}
          {activeTab === 'pipeline' && (
            jobs.length === 0 ? (
              <Card className="text-center py-16 px-6" data-cy="empty-analytics-state">
                <CardBody className="flex flex-col items-center max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
                    <BarChart3 className="w-8 h-8 text-slate-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Track job applications to see analytics and conversion rates.</p>
                  <a href="/dashboard"><Button variant="primary">Add Jobs</Button></a>
                </CardBody>
              </Card>
            ) : (
              <div className="flex flex-col gap-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Applications', value: metrics.totalApplications,           color: 'blue',   cy: 'metric-total-applications' },
                    { label: 'Offer Rate',          value: `${metrics.offerRate.toFixed(1)}%`,     color: 'green',  cy: 'metric-success-rate' },
                    { label: 'Interview Rate',      value: `${metrics.interviewRate.toFixed(1)}%`,  color: 'purple', cy: 'metric-interview-rate' },
                    { label: 'Rejection Rate',      value: `${metrics.rejectionRate.toFixed(1)}%`,  color: 'red',    cy: 'metric-rejection-rate' },
                  ].map((kpi) => {
                    const style = KPI_STYLES[kpi.color] ?? KPI_STYLES.blue;
                    return (
                      <Card key={kpi.label} className={`border ${style.border}`} data-cy={kpi.cy}>
                        <CardBody className="p-5 flex flex-col justify-between">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">{kpi.label}</span>
                          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.text}`}>{kpi.value}</span>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>

                {/* Stage Chart */}
                <Card data-cy="chart-pipeline-stages">
                  <CardBody className="p-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Pipeline Stage Distribution</h3>
                    <div className="flex flex-col gap-3" data-cy="stage-table">
                      <table className="min-w-full text-sm hidden"><tbody>{stageBreakdownEntries.map(([stage, count]) => (<tr key={stage} data-cy={`stage-${stage}`}><td>{STAGE_LABELS[stage] ?? stage}</td><td>{count}</td></tr>))}</tbody></table>
                      {stageBreakdownEntries.map(([stage, count]) => (
                        <div key={stage} className="flex items-center gap-4 text-sm" data-cy={`stage-${stage}`}>
                          <span className="w-40 text-slate-650 dark:text-slate-405 font-medium truncate">{STAGE_LABELS[stage] ?? stage}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-805 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${(count / maxStageCount) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right font-bold text-slate-800 dark:text-slate-200">{count}</span>
                        </div>
                      ))}
                      {stageBreakdownEntries.length === 0 && (<p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No stage data yet.</p>)}
                    </div>
                  </CardBody>
                </Card>

                {/* Match Score */}
                <Card data-cy="chart-match-score">
                  <CardBody className="p-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Match Score Distribution</h3>
                    <div className="flex items-end gap-3 h-24">
                      {['0–24%', '25–49%', '50–74%', '75–100%'].map((label, i) => (
                        <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{matchBuckets[i]}</span>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden" style={{ height: '60px' }}>
                            <div className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500" style={{ height: `${matchBuckets[i] > 0 ? Math.max(8, (matchBuckets[i] / maxMatchBucket) * 60) : 0}px`, marginTop: `${60 - (matchBuckets[i] > 0 ? Math.max(8, (matchBuckets[i] / maxMatchBucket) * 60) : 0)}px` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Salary + Outcomes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="h-full" data-cy="chart-salary">
                    <CardBody className="p-6">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Salary Range</h3>
                      {metrics.salaryMetrics.average > 0 ? (
                        <div className="flex flex-col gap-3.5">
                          {[
                            { label: 'Average', value: metrics.salaryMetrics.average, bold: true, color: 'text-green-600 dark:text-green-400 font-bold', cy: undefined },
                            { label: 'Median',  value: metrics.salaryMetrics.median,  bold: false, color: '', cy: 'salary-median' },
                            { label: 'Highest', value: metrics.salaryMetrics.max,     bold: false, color: '', cy: undefined },
                            { label: 'Lowest',  value: metrics.salaryMetrics.min,     bold: false, color: '', cy: undefined },
                          ].map((row) => (
                            <div key={row.label} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2 last:border-b-0 last:pb-0" data-cy={row.cy}>
                              <span className="text-slate-650 dark:text-slate-400">{row.label}</span>
                              <span className={row.bold ? row.color : 'text-slate-905 dark:text-white font-semibold'}>${Math.round(row.value).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">No salary data — add salary ranges to jobs for insights.</div>
                      )}
                    </CardBody>
                  </Card>

                  <Card className="h-full" data-cy="chart-outcomes">
                    <CardBody className="p-6">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Outcomes Summary</h3>
                      <div className="flex flex-col gap-4">
                        {Object.entries(metrics.outcomesSummary).filter(([, v]) => v > 0).map(([key, count]) => (
                          <div key={key} className="flex items-center gap-4 text-sm">
                            <span className="w-24 text-slate-650 dark:text-slate-405 font-medium capitalize truncate">{key}</span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${(count / metrics.totalApplications) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-bold text-slate-800 dark:text-slate-205">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Top Companies */}
                {metrics.topCompanies.length > 0 && (
                  <Card data-cy="top-companies">
                    <CardBody className="p-6 flex flex-col gap-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Companies</h3>
                      <div className="overflow-x-auto w-full border border-slate-100 dark:border-slate-800 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Offer Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {metrics.topCompanies.slice(0, 10).map((co) => (
                              <tr key={co.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors">
                                <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-202" data-cy={`company-${co.name}`}>{co.name}</td>
                                <td className="px-6 py-3.5 whitespace-nowrap text-right text-slate-650 dark:text-slate-400">{co.applications}</td>
                                <td className="px-6 py-3.5 whitespace-nowrap text-right font-semibold" data-cy={`company-${co.name}-success-rate`}>
                                  {co.successRate > 0 ? <span className="text-green-600 dark:text-green-455 font-bold">{co.successRate.toFixed(0)}%</span> : <span className="text-slate-400 dark:text-slate-500">—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Export */}
                <Card>
                  <CardBody className="p-6 flex flex-col gap-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Reports</h3>
                    <AnalyticsExportButtons metrics={metrics} />
                  </CardBody>
                </Card>
              </div>
            )
          )}

          {activeTab === 'roi' && (
            <div className="flex flex-col gap-8">
              <ApplicationAnalytics jobs={jobs} />
              <AnalyticsTimingPanel roi={roiData} forecast={forecastData} loading={roiLoading} error={roiError} />
            </div>
          )}

          {activeTab === 'trajectory' && <CareerTrajectory />}
          {activeTab === 'market' && <MarketInsights />}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <NavLayout title="Analytics" subtitle="Pipeline performance, conversion rates, and salary insights">
      <Suspense fallback={
        <div className="p-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading" />
        </div>
      }>
        <AnalyticsContent />
      </Suspense>
    </NavLayout>
  );
}
