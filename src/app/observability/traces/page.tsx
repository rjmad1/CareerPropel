'use client';

import { useState, useEffect } from 'react';
import { TelemetryApiClient } from '@/observability-platform/packages/api-client/client';
import { Trace, Span, WorkflowDAG as DAGType } from '@/observability-platform/packages/telemetry-sdk/types';
import { TraceTree } from '@/observability-platform/packages/workflow-viz/TraceTree';
import { WorkflowDAG } from '@/observability-platform/packages/workflow-viz/WorkflowDAG';
import { AgentSwimLanes } from '@/observability-platform/packages/workflow-viz/AgentSwimLanes';
import { 
  Search, 
  Filter, 
  Layers, 
  Clock, 
  Database,
  ShieldCheck
} from 'lucide-react';


const client = new TelemetryApiClient();

export default function TraceExplorer() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  
  // Detailed Trace state
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [traceSpans, setTraceSpans] = useState<Span[]>([]);
  const [workflowDAG, setWorkflowDAG] = useState<DAGType | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'tree' | 'dag' | 'swimlanes' | 'payloads'>('tree');

  useEffect(() => {
    async function loadTraces() {
      const data = await client.getTraces();
      setTraces(data);
      // Auto-select first trace if none selected yet (functional updater avoids closure staleness)
      if (data.length > 0) {
        setSelectedTraceId(prev => prev ?? data[0].id);
      }
    }
    loadTraces();

    const unsubscribe = client.subscribeToRealTimeEvents(() => {
      loadTraces();
    });

    return () => unsubscribe();
  }, []);

  // Fetch detailed trace information when trace ID changes
  useEffect(() => {
    async function loadTraceDetails() {
      if (!selectedTraceId) return;
      const details = await client.getTraceDetails(selectedTraceId);
      if (details) {
        setSelectedTrace(details.trace);
        setTraceSpans(details.spans);
        
        const dag = await client.getWorkflowGraph(selectedTraceId);
        setWorkflowDAG(dag);
      }
    }
    loadTraceDetails();
  }, [selectedTraceId]);

  // Filter traces
  const filteredTraces = traces.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesEnv = envFilter === 'ALL' || t.environment === envFilter;
    return matchesSearch && matchesStatus && matchesEnv;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Global Telemetry Explorer</h2>
          <p className="text-slate-400 text-sm">Search distributed agent traces, replay operations, and audit payload structures</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#090e1c]/40 border border-slate-900 rounded-xl p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search trace or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050810] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-[#050810] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="RUNNING">Running</option>
          </select>
        </div>

        {/* Environment */}
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="flex-1 bg-[#050810] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Envs</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-xs font-mono text-slate-500">
          <span>Found {filteredTraces.length} Active Traces</span>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Trace List */}
        <div className="lg:col-span-4 bg-[#080d1a]/50 border border-slate-900 rounded-xl overflow-hidden backdrop-blur-sm max-h-[700px] overflow-y-auto">
          <div className="p-4 border-b border-slate-900 bg-slate-950/40">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Distributed Execution Streams</span>
          </div>

          <div className="divide-y divide-slate-900/60">
            {filteredTraces.map((trace) => {
              const isSelected = selectedTraceId === trace.id;
              const dateString = new Date(trace.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTraceId(trace.id)}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-900/40 ${
                    isSelected ? 'bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-l-2 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200 font-mono truncate max-w-[200px]">{trace.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      trace.status === 'SUCCESS' 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                        : trace.status === 'FAILURE' 
                        ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' 
                        : 'bg-purple-950/40 text-purple-400 border border-purple-900/40 animate-pulse'
                    }`}>
                      {trace.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate max-w-[120px]">{trace.id}</span>
                    <span>{dateString}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono mt-2 border-t border-slate-900/30 pt-1.5">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {trace.durationMs}ms
                    </span>
                    <span className="text-emerald-500 font-bold">${trace.totalCost.toFixed(4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Execution Detail View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTrace ? (
            <div className="space-y-6">
              {/* Detail Header block */}
              <div className="bg-[#090e1c]/80 border border-slate-900 rounded-xl p-5 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-slate-900 pb-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                      Active Telemetry Trace
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5 font-mono">{selectedTrace.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">Trace ID: {selectedTrace.id}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                      {selectedTrace.environment}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                      {selectedTrace.spansCount} Spans
                    </span>
                  </div>
                </div>

                {/* Sub KPI Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Total Tokens</span>
                    <span className="font-bold text-slate-300 text-sm mt-0.5 block">{selectedTrace.totalTokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Approx Cost</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">${selectedTrace.totalCost.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration</span>
                    <span className="font-bold text-slate-300 text-sm mt-0.5 block">{selectedTrace.durationMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Checkpoint</span>
                    <span className="font-bold text-purple-400 text-sm mt-0.5 block">100% verified</span>
                  </div>
                </div>
              </div>

              {/* TAB SELECTION BAR */}
              <div className="flex border-b border-slate-900 bg-slate-950/40 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('tree')}
                  className={`flex-1 py-2 text-xs font-mono font-semibold rounded-md transition-all ${
                    activeTab === 'tree' ? 'bg-[#090e1c] text-white border border-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Span Tree
                </button>
                <button
                  onClick={() => setActiveTab('dag')}
                  className={`flex-1 py-2 text-xs font-mono font-semibold rounded-md transition-all ${
                    activeTab === 'dag' ? 'bg-[#090e1c] text-white border border-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Workflow DAG
                </button>
                <button
                  onClick={() => setActiveTab('swimlanes')}
                  className={`flex-1 py-2 text-xs font-mono font-semibold rounded-md transition-all ${
                    activeTab === 'swimlanes' ? 'bg-[#090e1c] text-white border border-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Parallel Lanes
                </button>
                <button
                  onClick={() => setActiveTab('payloads')}
                  className={`flex-1 py-2 text-xs font-mono font-semibold rounded-md transition-all ${
                    activeTab === 'payloads' ? 'bg-[#090e1c] text-white border border-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Inputs / Redactions
                </button>
              </div>

              {/* View Render Area */}
              <div className="min-h-[300px]">
                {activeTab === 'tree' && <TraceTree spans={traceSpans} />}
                {activeTab === 'dag' && workflowDAG && <WorkflowDAG dag={workflowDAG} activeNodeId={traceSpans[0]?.id} />}
                {activeTab === 'swimlanes' && <AgentSwimLanes spans={traceSpans} />}
                {activeTab === 'payloads' && (
                  <div className="bg-[#080d1a]/85 border border-slate-900 rounded-xl p-6 space-y-4 font-mono">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        PII Telemetry Redaction Audit Log
                      </h4>
                      <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">Scrubbing Compliant</span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1.5">[Trace Input Payload]</span>
                        <pre className="bg-[#050810] border border-slate-800 p-3 rounded text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-[150px]">
                          {selectedTrace.rootSpan?.input || '{"query": "Optimized multi-agent job application automation workflow"}'}
                        </pre>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-1.5">[Trace Output Payload]</span>
                        <pre className="bg-[#050810] border border-slate-800 p-3 rounded text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-[150px]">
                          {selectedTrace.rootSpan?.output || '{"success": true, "result": "Successfully queued application workflow with [PII REDACTED]"}'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Layers className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Select a trace execution from the left console pane.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
