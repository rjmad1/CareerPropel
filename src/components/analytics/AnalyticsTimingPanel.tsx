'use client';

import { Card, CardBody } from '@/components/ui';
import { Clock, TrendingUp, Target, Building2, Zap, AlertCircle } from 'lucide-react';

export interface ROIData {
  totalJobs: number;
  totalApplied: number;
  gotResponse: number;
  applicationVelocity: number | null;
  responseRate: number | null;
  avgDaysToApply: number | null;
  avgDaysToFirstInterview: number | null;
  avgDaysToOffer: number | null;
  companySuccessRates: {
    company: string;
    total: number;
    interviewRate: number;
    offerRate: number;
  }[];
  generatedAt: string;
}

export interface ForecastData {
  forecasts: {
    jobId: string;
    title: string;
    company: string;
    currentStage: string;
    daysInCurrentStage: number;
    remainingStages: number;
    estimatedDaysToOffer: number;
    estimatedOfferDate: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
  usedPersonalData: boolean;
  generatedAt: string;
}

interface Props {
  roi: ROIData | null;
  forecast: ForecastData | null;
  loading: boolean;
  error: string;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number | null;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className={`border ${accent}`}>
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value === null ? <span className="text-slate-300">—</span> : value}
        </div>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </CardBody>
    </Card>
  );
}

function formatDays(d: number | null): string {
  if (d === null) return '—';
  if (d === 0) return '< 1 day';
  if (d === 1) return '1 day';
  return `${d} days`;
}

export function AnalyticsTimingPanel({ roi, forecast, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-5 flex flex-col gap-3">
                <div className="h-3 bg-slate-100 rounded w-24" />
                <div className="h-7 bg-slate-100 rounded w-16" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!roi) return null;

  const noData = roi.totalJobs === 0;

  return (
    <div className="flex flex-col gap-8 mt-2">
      {/* ---- Timing KPIs ---- */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
          Timing Benchmarks
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Apps / Week"
            value={noData ? null : `${roi.applicationVelocity ?? 0}`}
            sub="last 90 days"
            icon={Zap}
            accent="border-blue-100"
          />
          <MetricCard
            label="Response Rate"
            value={noData ? null : roi.responseRate !== null ? `${roi.responseRate}%` : '—'}
            sub="apps that got a callback"
            icon={TrendingUp}
            accent="border-emerald-100"
          />
          <MetricCard
            label="Apply → Interview"
            value={noData ? null : formatDays(roi.avgDaysToFirstInterview)}
            sub="avg days to first screen"
            icon={Clock}
            accent="border-purple-100"
          />
          <MetricCard
            label="Interview → Offer"
            value={noData ? null : formatDays(roi.avgDaysToOffer)}
            sub="avg days through process"
            icon={Target}
            accent="border-orange-100"
          />
        </div>
      </div>

      {/* ---- Company success rates ---- */}
      {roi.companySuccessRates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Company Success Rates
            </h3>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Apps
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Interview Rate
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Offer Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {roi.companySuccessRates.map((co) => (
                    <tr key={co.company} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{co.company}</td>
                      <td className="px-5 py-3 text-right text-slate-500">{co.total}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={co.interviewRate > 0 ? 'font-semibold text-blue-600' : 'text-slate-300'}>
                          {co.interviewRate > 0 ? `${co.interviewRate}%` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={co.offerRate > 0 ? 'font-bold text-emerald-600' : 'text-slate-300'}>
                          {co.offerRate > 0 ? `${co.offerRate}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ---- Time-to-offer forecast ---- */}
      {forecast && forecast.forecasts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Pipeline Forecast
            </h3>
            {forecast.usedPersonalData && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                Personalised from your history
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {forecast.forecasts.map((f) => (
              <Card key={f.jobId} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 truncate">{f.title}</span>
                      <span className="text-xs text-slate-400">@ {f.company}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        Current stage:{' '}
                        <strong className="text-slate-700 capitalize">{f.currentStage.replace(/_/g, ' ')}</strong>
                      </span>
                      <span>
                        In stage: <strong className="text-slate-700">{f.daysInCurrentStage}d</strong>
                      </span>
                      <span>
                        {f.remainingStages} stage{f.remainingStages !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">
                        ~{f.estimatedDaysToOffer}d
                      </div>
                      <div className="text-[10px] text-slate-400">
                        est. {new Date(f.estimatedOfferDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLES[f.confidence]}`}>
                      {f.confidence}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 text-center">
            Estimates based on {forecast.usedPersonalData ? 'your historical stage durations + ' : ''}industry baselines. Actual timelines vary.
          </p>
        </div>
      )}

      {noData && (
        <Card className="text-center py-12 border-2 border-dashed border-slate-100 bg-transparent shadow-none">
          <p className="text-sm text-slate-400 font-medium">
            No applications tracked yet — add jobs to see ROI timing data.
          </p>
        </Card>
      )}
    </div>
  );
}
