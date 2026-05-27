'use client';

import { useState, useEffect } from 'react';
import { TelemetryApiClient } from '@/observability-platform/packages/api-client/client';
import { Trace } from '@/observability-platform/packages/telemetry-sdk/types';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle
} from 'lucide-react';

export default function WorkflowBoard() {
  const [traces, setTraces] = useState<Trace[]>([]);

  const client = new TelemetryApiClient();

  useEffect(() => {
    async function loadWorkflows() {
      const data = await client.getTraces();
      setTraces(data);
    }

    loadWorkflows();

    const unsubscribe = client.subscribeToRealTimeEvents(() => {
      loadWorkflows();
    });

    return () => unsubscribe();
  }, []);

  // Split workflows by status or speed thresholds
  const successWorkflows = traces.filter(t => t.status === 'SUCCESS' && t.durationMs < 6000);
  const slowWorkflows = traces.filter(t => t.durationMs >= 6000 && t.status === 'SUCCESS');
  const failureWorkflows = traces.filter(t => t.status === 'FAILURE');
  const runningWorkflows = traces.filter(t => t.status === 'RUNNING');

  const getSLAIndicator = (durationMs: number) => {
    if (durationMs >= 7000) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/60 font-bold">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          SLA Breached
        </span>
      );
    }
    if (durationMs >= 5000) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900/60 font-bold">
          <Clock className="w-3 h-3 text-amber-500" />
          SLA Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-bold">
        <CheckCircle className="w-3 h-3 text-emerald-500" />
        SLA Met
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Workflow Execution board</h2>
          <p className="text-slate-400 text-sm">Kanban-style PM view monitoring business tasks, SLA compliance, and execution bottlenecks</p>
        </div>
      </div>

      {/* Board Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center">
          <span className="text-slate-500">Active Pipelines</span>
          <span className="font-bold text-slate-300 text-lg">{runningWorkflows.length} Running</span>
        </div>
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center">
          <span className="text-slate-500">SLA Warning Ratio</span>
          <span className="font-bold text-amber-400 text-lg">
            {Math.round((traces.filter(t => t.durationMs >= 5000).length / (traces.length || 1)) * 100)}%
          </span>
        </div>
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center">
          <span className="text-slate-500">Average Token Usage</span>
          <span className="font-bold text-indigo-400 text-lg">
            {Math.round(traces.reduce((acc, t) => acc + t.totalTokens, 0) / (traces.length || 1)).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Column 1: Active Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              1. Running ({runningWorkflows.length})
            </span>
          </div>
          <div className="space-y-3">
            {runningWorkflows.map(t => (
              <WorkflowCard key={t.id} trace={t} indicator={getSLAIndicator(t.durationMs)} />
            ))}
            {runningWorkflows.length === 0 && (
              <p className="text-[10px] text-slate-650 font-mono text-center py-6 border border-dashed border-slate-900 rounded-lg">No active run streams</p>
            )}
          </div>
        </div>

        {/* Column 2: SLA Compliant */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              2. SLA Met ({successWorkflows.length})
            </span>
          </div>
          <div className="space-y-3">
            {successWorkflows.map(t => (
              <WorkflowCard key={t.id} trace={t} indicator={getSLAIndicator(t.durationMs)} />
            ))}
          </div>
        </div>

        {/* Column 3: Slow Runs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              3. SLA Warnings ({slowWorkflows.length})
            </span>
          </div>
          <div className="space-y-3">
            {slowWorkflows.map(t => (
              <WorkflowCard key={t.id} trace={t} indicator={getSLAIndicator(t.durationMs)} />
            ))}
          </div>
        </div>

        {/* Column 4: Failures */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              4. Failed ({failureWorkflows.length})
            </span>
          </div>
          <div className="space-y-3">
            {failureWorkflows.map(t => (
              <WorkflowCard key={t.id} trace={t} indicator={getSLAIndicator(t.durationMs)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const WorkflowCard: React.FC<{ trace: Trace; indicator: React.ReactNode }> = ({ trace, indicator }) => {
  return (
    <div className="bg-[#090e1c]/80 border border-slate-900 rounded-lg p-4 space-y-3 shadow-md hover:border-slate-800 transition-all font-mono text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-slate-200 truncate">{trace.name.replace(' Orchestration', '')}</span>
      </div>

      <div className="flex items-center justify-between text-slate-500">
        <span>{trace.id}</span>
        <span>{trace.spansCount} spans</span>
      </div>

      <div className="border-t border-slate-900/60 pt-2 flex items-center justify-between">
        <span className="text-slate-400">{trace.durationMs}ms</span>
        <span className="text-emerald-500 font-bold">${trace.totalCost.toFixed(4)}</span>
      </div>

      <div className="pt-1 flex items-center justify-between">
        {indicator}
      </div>
    </div>
  );
};
