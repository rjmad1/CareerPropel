'use client';

import { useState, useEffect } from 'react';
import { TelemetryApiClient } from '@/observability-platform/packages/api-client/client';
import { Trace, AgentMetric } from '@/observability-platform/packages/telemetry-sdk/types';
import { 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Clock, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

import Link from 'next/link';

export default function ObservabilityDashboard() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const client = new TelemetryApiClient();

  useEffect(() => {
    async function loadData() {
      try {
        const tr = await client.getTraces();
        const am = await client.getAgentMetrics();
        setTraces(tr);
        setAgentMetrics(am);
      } catch (err) {
        console.error('Failed to load telemetry overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Hook up real-time telemetry stream listener to automatically update local state
    const unsubscribe = client.subscribeToRealTimeEvents(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400 font-mono">Loading operations workspace...</span>
      </div>
    );
  }

  // Calculate high-level KPIs
  const totalCost = traces.reduce((acc, t) => acc + t.totalCost, 0);
  const totalTokens = traces.reduce((acc, t) => acc + t.totalTokens, 0);
  const avgLatency = traces.length > 0 ? Math.round(traces.reduce((acc, t) => acc + t.durationMs, 0) / traces.length) : 0;
  
  const completedTraces = traces.filter(t => t.status === 'SUCCESS' || t.status === 'FAILURE');
  const successRate = completedTraces.length > 0 
    ? Math.round((completedTraces.filter(t => t.status === 'SUCCESS').length / completedTraces.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Executive Operations Console</h2>
          <p className="text-slate-400 text-sm">Enterprise overview of multi-agent workflows, latency thresholds, and LLM expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400">Telemetry Feed Online</span>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Card */}
        <div className="bg-[#090e1c] border border-slate-900 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">Cumulative LLM Cost</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-white">${totalCost.toFixed(4)}</span>
            <span className="text-xs text-slate-400 font-mono">USD</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Scrubbed token allocations</p>
        </div>

        {/* Tokens Card */}
        <div className="bg-[#090e1c] border border-slate-900 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-16 h-16 text-blue-400" />
          </div>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">Total Tokens Billed</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-white">{(totalTokens / 1000).toFixed(1)}k</span>
            <span className="text-xs text-slate-400 font-mono">tokens</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Prompt & Completion context</p>
        </div>

        {/* Latency Card */}
        <div className="bg-[#090e1c] border border-slate-900 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Clock className="w-16 h-16 text-purple-400" />
          </div>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">Avg Execution Window</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-white">{(avgLatency / 1000).toFixed(2)}s</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Orchestration overhead window</p>
        </div>

        {/* Success Card */}
        <div className="bg-[#090e1c] border border-slate-900 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-16 h-16 text-pink-400" />
          </div>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">Workflow Success Rate</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-white">{successRate}%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Evaluation checkpoints passed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Performance Hotspots */}
        <div className="lg:col-span-2 bg-[#080d1a]/60 border border-slate-900 rounded-xl p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" />
            Agent Performance Board
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Agent ID</th>
                  <th className="pb-3">Executions</th>
                  <th className="pb-3">Success Rate</th>
                  <th className="pb-3">Avg Latency</th>
                  <th className="pb-3">Tokens Billed</th>
                  <th className="pb-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {agentMetrics.map((agent) => (
                  <tr key={agent.agentName} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-300">{agent.agentName}</td>
                    <td className="py-3.5 text-slate-400">{agent.executionCount}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        agent.successRate >= 90 ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
                      }`}>
                        {agent.successRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">{(agent.avgLatencyMs / 1000).toFixed(2)}s</td>
                    <td className="py-3.5 text-slate-400">{agent.totalTokens.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-bold text-emerald-400">${agent.totalCost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Health status summary panel */}
        <div className="bg-[#080d1a]/60 border border-slate-900 rounded-xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Health Indicators
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-900">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-300">Websocket Signal</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-900/60">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-900">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-300">Langfuse Pipeline</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-900/60">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-300">SLA Warnings (30s)</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded-full border border-amber-900/60">0 Alerting</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-900/60 pt-4 text-center">
            <p className="text-[10px] text-slate-500 font-mono mb-3">Enterprise Cloud telemetry stream</p>
            <Link 
              href="/observability/traces"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 font-mono transition-colors w-full"
            >
              Analyze Active Spans
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
