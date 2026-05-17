'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { AnalyticsExportButtons } from '@/components/analytics/AnalyticsExportButtons';
import { calculateAnalytics, AnalyticsMetrics } from '@/lib/analytics/export';
import { RefreshCw } from 'lucide-react';

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
  SOURCED: 'Sourced',
  INTERESTED: 'Interested',
  TAILORING: 'Tailoring',
  APPLIED: 'Applied',
  RECRUITER_SCREEN: 'Recruiter Screen',
  HIRING_MANAGER: 'Hiring Manager',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral',
  FINAL_ROUND: 'Final Round',
  OFFER: 'Offer',
  NEGOTIATION: 'Negotiation',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?limit=500');
      const json = await res.json();
      const rawJobs: Job[] = Array.isArray(json) ? json : json.data ?? [];
      setJobs(rawJobs);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  // Cast jobs to the shape calculateAnalytics needs (from Prisma)
  const metrics: AnalyticsMetrics = useMemo(
    () => calculateAnalytics(jobs as any),
    [jobs]
  );

  const stageBreakdownEntries = Object.entries(metrics.stageBreakdown)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const maxStageCount = Math.max(...stageBreakdownEntries.map(([, c]) => c), 1);

  return (
    <NavLayout
      title="Analytics"
      subtitle="Pipeline performance, conversion rates, and salary insights"
    >
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{jobs.length} total applications analysed</p>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard label="Total Applications" value={metrics.totalApplications} color="blue" />
              <KpiCard label="Offer Rate" value={`${metrics.offerRate.toFixed(1)}%`} color="green" />
              <KpiCard label="Interview Rate" value={`${metrics.interviewRate.toFixed(1)}%`} color="purple" />
              <KpiCard label="Rejection Rate" value={`${metrics.rejectionRate.toFixed(1)}%`} color="red" />
            </div>

            {/* Salary + Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Salary Metrics */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Salary Range</h3>
                {metrics.salaryMetrics.average > 0 ? (
                  <div className="space-y-3">
                    <SalaryRow label="Average" value={metrics.salaryMetrics.average} highlight />
                    <SalaryRow label="Median" value={metrics.salaryMetrics.median} />
                    <SalaryRow label="Highest" value={metrics.salaryMetrics.max} />
                    <SalaryRow label="Lowest" value={metrics.salaryMetrics.min} muted />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No salary data — add salary ranges to jobs for insights.
                  </p>
                )}
              </div>

              {/* Outcomes Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Outcomes Summary</h3>
                <div className="space-y-2">
                  {Object.entries(metrics.outcomesSummary)
                    .filter(([, v]) => v > 0)
                    .map(([key, count]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-600">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${(count / metrics.totalApplications) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            {stageBreakdownEntries.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Pipeline Breakdown</h3>
                <div className="space-y-2">
                  {stageBreakdownEntries.map(([stage, count]) => (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-36 flex-shrink-0">
                        {STAGE_LABELS[stage] ?? stage}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${(count / maxStageCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Companies */}
            {metrics.topCompanies.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Top Companies</h3>
                <div className="divide-y divide-gray-100">
                  {metrics.topCompanies.slice(0, 8).map((co) => (
                    <div key={co.name} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-900">{co.name}</span>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{co.applications} apps</span>
                        {co.successRate > 0 && (
                          <span className="text-green-600 font-medium">{co.successRate.toFixed(0)}% offer rate</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Export Reports</h3>
              <AnalyticsExportButtons metrics={metrics} />
            </div>
          </>
        )}
      </div>
    </NavLayout>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color] ?? 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function SalaryRow({ label, value, highlight, muted }: { label: string; value: number; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-sm ${muted ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-green-600 text-base' : muted ? 'text-gray-400' : 'text-gray-900'}`}>
        ${Math.round(value).toLocaleString()}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h3>
      <p className="text-gray-500 text-sm mb-4">
        Track job applications to see analytics and conversion rates.
      </p>
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
      >
        Add Jobs
      </a>
    </div>
  );
}
