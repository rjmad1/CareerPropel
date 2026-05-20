'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { AnalyticsExportButtons } from '@/components/analytics/AnalyticsExportButtons';
import { calculateAnalytics, AnalyticsMetrics } from '@/lib/analytics/export';
import { Button, Card, CardBody } from '@/components/ui';
import { RefreshCw, BarChart3, AlertCircle } from 'lucide-react';

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
  blue: {
    text: 'text-blue-650 dark:text-blue-400',
    bg: 'bg-blue-50/30 dark:bg-blue-950/10',
    border: 'border-blue-100 dark:border-blue-900/50',
  },
  green: {
    text: 'text-green-650 dark:text-green-450',
    bg: 'bg-green-50/30 dark:bg-green-950/10',
    border: 'border-green-100 dark:border-green-900/50',
  },
  purple: {
    text: 'text-purple-650 dark:text-purple-400',
    bg: 'bg-purple-50/30 dark:bg-purple-950/10',
    border: 'border-purple-100 dark:border-purple-900/50',
  },
  red: {
    text: 'text-red-650 dark:text-red-400',
    bg: 'bg-red-50/30 dark:bg-red-950/10',
    border: 'border-red-100 dark:border-red-900/50',
  },
};

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchJobs(); }, []);

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

  return (
    <NavLayout title="Analytics" subtitle="Pipeline performance, conversion rates, and salary insights">
      <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2.5 p-4 text-sm text-red-800 border border-red-100 bg-red-50/50 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" role="alert">
            <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {jobs.length} total applications analyzed
          </span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={fetchJobs}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="text-center py-16 px-6">
            <CardBody className="flex flex-col items-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
                <BarChart3 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No data yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Track job applications to see analytics and conversion rates.
              </p>
              <a href="/dashboard">
                <Button variant="primary">Add Jobs</Button>
              </a>
            </CardBody>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Applications', value: metrics.totalApplications, color: 'blue' },
                { label: 'Offer Rate', value: `${metrics.offerRate.toFixed(1)}%`, color: 'green' },
                { label: 'Interview Rate', value: `${metrics.interviewRate.toFixed(1)}%`, color: 'purple' },
                { label: 'Rejection Rate', value: `${metrics.rejectionRate.toFixed(1)}%`, color: 'red' },
              ].map((kpi) => {
                const style = KPI_STYLES[kpi.color] ?? KPI_STYLES.blue;
                return (
                  <Card key={kpi.label} className={`border ${style.border}`}>
                    <CardBody className="p-5 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        {kpi.label}
                      </span>
                      <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.text}`}>
                        {kpi.value}
                      </span>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Salary + Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Salary range card */}
              <Card className="h-full">
                <CardBody className="p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Salary Range
                  </h3>
                  {metrics.salaryMetrics.average > 0 ? (
                    <div className="flex flex-col gap-3.5">
                      {[
                        { label: 'Average', value: metrics.salaryMetrics.average, bold: true, color: 'text-green-600 dark:text-green-400 font-bold' },
                        { label: 'Median', value: metrics.salaryMetrics.median },
                        { label: 'Highest', value: metrics.salaryMetrics.max },
                        { label: 'Lowest', value: metrics.salaryMetrics.min, muted: true },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2 last:border-b-0 last:pb-0">
                          <span className={row.muted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}>
                            {row.label}
                          </span>
                          <span className={row.bold ? row.color : 'text-slate-900 dark:text-white font-semibold'}>
                            ${Math.round(row.value).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
                      No salary data — add salary ranges to jobs for insights.
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Outcomes card */}
              <Card className="h-full">
                <CardBody className="p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Outcomes Summary
                  </h3>
                  <div className="flex flex-col gap-4">
                    {Object.entries(metrics.outcomesSummary).filter(([, v]) => v > 0).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-4 text-sm">
                        <span className="w-24 text-slate-600 dark:text-slate-400 font-medium capitalize truncate">
                          {key}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(count / metrics.totalApplications) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-bold text-slate-800 dark:text-slate-200">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Pipeline Breakdown Progress */}
            {stageBreakdownEntries.length > 0 && (
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    Pipeline Breakdown
                  </h3>
                  <div className="flex flex-col gap-4">
                    {stageBreakdownEntries.map(([stage, count]) => (
                      <div key={stage} className="flex items-center gap-4 text-sm">
                        <span className="w-40 text-slate-600 dark:text-slate-400 font-medium truncate">
                          {STAGE_LABELS[stage] ?? stage}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(count / maxStageCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-bold text-slate-800 dark:text-slate-200">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Top Companies Table */}
            {metrics.topCompanies.length > 0 && (
              <Card>
                <CardBody className="p-6 flex flex-col gap-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Top Companies
                  </h3>
                  <div className="overflow-x-auto w-full border border-slate-100 dark:border-slate-800 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Applications
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Offer Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {metrics.topCompanies.slice(0, 8).map((co) => (
                          <tr key={co.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors">
                            <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                              {co.name}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right text-slate-650 dark:text-slate-400">
                              {co.applications}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right font-semibold">
                              {co.successRate > 0 ? (
                                <span className="text-green-600 dark:text-green-450 font-bold">
                                  {co.successRate.toFixed(0)}%
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Export options */}
            <Card>
              <CardBody className="p-6 flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Export Reports
                </h3>
                <AnalyticsExportButtons metrics={metrics} />
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
