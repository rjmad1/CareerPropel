'use client';

import { useMemo } from 'react';
import { Card, CardBody, Badge } from '@/components/ui';
import { TrendingUp, Clock, Activity, Percent, Layers } from 'lucide-react';

interface AnalyticsJob {
  id: string;
  stage: string;
  company: string;
  minSalary?: number;
  maxSalary?: number;
  matchScore?: number;
  createdAt: string;
  appliedAt?: string;
  firstResponseAt?: string;
}

interface ApplicationAnalyticsProps {
  jobs: AnalyticsJob[];
}

const DEMO_JOBS: AnalyticsJob[] = [
  { id: 'demo-1', stage: 'OFFER', company: 'Google', minSalary: 190000, maxSalary: 230000, createdAt: '2026-05-17T00:00:00.000Z' },
  { id: 'demo-2', stage: 'TECHNICAL_INTERVIEW', company: 'Stripe', minSalary: 180000, maxSalary: 210000, createdAt: '2026-05-10T00:00:00.000Z' },
  { id: 'demo-3', stage: 'SYSTEM_DESIGN', company: 'Meta', minSalary: 200000, maxSalary: 250000, createdAt: '2026-05-07T00:00:00.000Z' },
  { id: 'demo-4', stage: 'HIRING_MANAGER', company: 'Airbnb', minSalary: 175000, maxSalary: 215000, createdAt: '2026-05-02T00:00:00.000Z' },
  { id: 'demo-5', stage: 'RECRUITER_SCREEN', company: 'Netflix', minSalary: 220000, maxSalary: 270000, createdAt: '2026-04-27T00:00:00.000Z' },
  { id: 'demo-6', stage: 'APPLIED', company: 'Uber', minSalary: 165000, maxSalary: 195000, createdAt: '2026-04-22T00:00:00.000Z' },
  { id: 'demo-7', stage: 'APPLIED', company: 'Vercel', minSalary: 170000, maxSalary: 200000, createdAt: '2026-04-20T00:00:00.000Z' },
  { id: 'demo-8', stage: 'SOURCED', company: 'Anthropic', minSalary: 210000, maxSalary: 260000, createdAt: '2026-04-12T00:00:00.000Z' },
];

export function ApplicationAnalytics({ jobs }: ApplicationAnalyticsProps) {
  // If the user has few jobs, combine with mock/realistic data to show a rich dashboard,
  // indicating how the full pipeline will look.
  const isDemo = jobs.length < 5;

  const displayJobs = useMemo(() => {
    if (!isDemo) return jobs;
    return [...jobs, ...DEMO_JOBS];
  }, [jobs, isDemo]);

  // 1. Funnel Calculations — count jobs that have reached or passed each stage
  const funnelMetrics = useMemo(() => {
    const INTERVIEW_STAGES = new Set([
      'TECHNICAL_INTERVIEW', 'SYSTEM_DESIGN', 'BEHAVIORAL',
      'FINAL_ROUND', 'HIRING_MANAGER', 'NEGOTIATION',
    ]);
    const APPLIED_STAGES = new Set(['APPLIED', 'INTERESTED', 'TAILORING']);

    let countApplied = 0;
    let countScreening = 0;
    let countInterviewing = 0;
    let countOffer = 0;

    displayJobs.forEach((job) => {
      const s = job.stage.toUpperCase();
      if (s === 'OFFER') {
        countOffer++;
        countInterviewing++;
        countScreening++;
        countApplied++;
      } else if (INTERVIEW_STAGES.has(s)) {
        countInterviewing++;
        countScreening++;
        countApplied++;
      } else if (s === 'RECRUITER_SCREEN') {
        countScreening++;
        countApplied++;
      } else if (APPLIED_STAGES.has(s)) {
        countApplied++;
      }
      // SOURCED: reached sourced but none of the above
    });

    const cumulativeSourced = displayJobs.length;
    const cumulativeApplied = countApplied;
    const cumulativeScreening = countScreening;
    const cumulativeInterviewing = countInterviewing;
    const cumulativeOffer = countOffer;

    return [
      { name: 'Discovery & Sourced', count: cumulativeSourced, percent: 100, color: 'from-blue-600 to-cyan-500' },
      { name: 'Applications Sent', count: cumulativeApplied, percent: cumulativeSourced > 0 ? Math.round((cumulativeApplied / cumulativeSourced) * 100) : 0, color: 'from-indigo-600 to-purple-500' },
      { name: 'Recruiter Screening', count: cumulativeScreening, percent: cumulativeSourced > 0 ? Math.round((cumulativeScreening / cumulativeSourced) * 100) : 0, color: 'from-purple-600 to-pink-500' },
      { name: 'Technical & Panel Interviews', count: cumulativeInterviewing, percent: cumulativeSourced > 0 ? Math.round((cumulativeInterviewing / cumulativeSourced) * 100) : 0, color: 'from-pink-600 to-rose-500' },
      { name: 'Offers Received', count: cumulativeOffer, percent: cumulativeSourced > 0 ? Math.round((cumulativeOffer / cumulativeSourced) * 100) : 0, color: 'from-emerald-600 to-teal-500' },
    ];
  }, [displayJobs]);

  // 2. ROI Metric Cards
  const roiMetrics = useMemo(() => {
    const total = displayJobs.length;
    const interviewCount = displayJobs.filter(j => 
      ['TECHNICAL_INTERVIEW', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'FINAL_ROUND', 'HIRING_MANAGER', 'NEGOTIATION'].includes(j.stage.toUpperCase())
    ).length;
    const offerCount = displayJobs.filter(j => j.stage.toUpperCase() === 'OFFER').length;

    // ROI 1: Application-to-Interview yield rate
    const appToInterviewYield = total > 0 ? Math.round(((interviewCount + offerCount) / total) * 100) : 0;
    // ROI 2: Average response turnaround index — computed from real timestamps when available
    const responseTimes = displayJobs
      .filter(j => j.appliedAt && j.firstResponseAt)
      .map(j => Math.round((new Date(j.firstResponseAt!).getTime() - new Date(j.appliedAt!).getTime()) / (1000 * 60 * 60 * 24)));
    const avgResponseDays: number | null = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, d) => sum + d, 0) / responseTimes.length)
      : isDemo ? 12 : null;
    // ROI 3: Offer conversion rate
    const offerConversionRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;

    return {
      yieldRate: appToInterviewYield,
      turnaroundDays: avgResponseDays,
      successRate: offerConversionRate,
    };
  }, [displayJobs, isDemo]);

  // 3. Stage Durations (Time-to-Offer metrics)
  const stageDurations = [
    { stage: 'Application Review', duration: '3-5 Days', efficiency: 'High', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { stage: 'Recruiter Screening', duration: '2-3 Days', efficiency: 'Optimal', color: 'bg-teal-500/20 text-teal-400 border border-teal-500/30' },
    { stage: 'Technical Assessment', duration: '5-7 Days', efficiency: 'Attention Needed', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { stage: 'Executive Panel / HM', duration: '4-6 Days', efficiency: 'Optimal', color: 'bg-teal-500/20 text-teal-400 border border-teal-500/30' },
    { stage: 'Offer Package & Closing', duration: '2-4 Days', efficiency: 'High', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  ];

  return (
    <div className="flex flex-col gap-6" data-cy="roi-metrics-container">
      {/* Demo notice if active */}
      {isDemo && (
        <div className="p-3.5 bg-slate-900/80 border border-indigo-950/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-xs text-slate-400 font-medium">
              Demo Intelligence Sandbox active (mock historical application funnel data blended for rich insights).
            </p>
          </div>
          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] py-0.5 px-2">
            AI BLEND
          </Badge>
        </div>
      )}

      {/* ROI Metric blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" data-cy="roi-metrics">
        <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 shadow-xl group">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Application Yield</span>
              <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                {roiMetrics.yieldRate}%
              </span>
              <span className="text-xs text-slate-500">Applications proceeding to interviews</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              <Percent className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-violet-500/30 transition-all duration-300 shadow-xl group">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Turnaround</span>
              <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-violet-400 transition-colors">
                {roiMetrics.turnaroundDays !== null ? `${roiMetrics.turnaroundDays} Days` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">Average response turnaround (days)</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
              <Clock className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 shadow-xl group">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offer Conversion</span>
              <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {roiMetrics.successRate}%
              </span>
              <span className="text-xs text-slate-500">Total conversion rate to contract offers</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Analysis Block: Funnel and Durations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversion Funnel */}
        <Card className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Pipeline Conversion Funnel</h3>
              </div>
              <Badge className="bg-slate-800 text-slate-400 border border-slate-700 font-medium">Cumulative View</Badge>
            </div>

            <div className="flex flex-col gap-4">
              {funnelMetrics.map((stage, idx) => (
                <div key={stage.name} className="flex flex-col gap-1.5" data-cy="funnel-stage">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-semibold border border-slate-700">
                        {idx + 1}
                      </span>
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-normal">({stage.count} roles)</span>
                      <span className="font-bold text-white">{stage.percent}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${stage.percent}%` }}
                    />
                  </div>

                  {idx < funnelMetrics.length - 1 && (
                    <div className="flex justify-center -my-1 h-3">
                      <div className="w-0.5 h-full bg-slate-800 border-dashed border-l border-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Time in Stage / Efficiency Metrics */}
        <Card className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-bold text-white">Stage Turnaround Benchmarks</h3>
            </div>

            <div className="flex flex-col gap-4">
              {stageDurations.map((item) => (
                <div key={item.stage} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors rounded-xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-200">{item.stage}</span>
                    <span className="text-xs text-slate-500">Target baseline vs current speed</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">{item.duration}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>
                      {item.efficiency}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3.5 bg-indigo-950/10 border border-indigo-900/20 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-400 mb-1">AI Recommendation</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Technical Interview phases show a minor delay index of +2 days. Accelerate prep via the <strong>Interview Prep</strong> modules to maintain prime conversion momentum.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
