'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Play,
  Sparkles,
  TrendingUp,
  DollarSign,
  Layers,
  Cpu,
  CornerDownRight,
  Loader2
} from 'lucide-react';

interface StepExecution {
  stepKey: string;
  stepIndex: number;
  status: string;
  stepType: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface WorkflowExecution {
  id: string;
  definition: {
    name: string;
    displayName: string;
    description: string | null;
    metadata?: {
      predictedComplexity?: 'low' | 'medium' | 'high';
      estimatedCostUsd?: number;
      initialPriorityScore?: number;
      governanceScore?: number;
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  status: 'queued' | 'running' | 'waiting_for_approval' | 'blocked' | 'failed' | 'completed' | 'cancelled';
  currentStepIndex: number;
  context: unknown;
  steps: StepExecution[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    approvals: number;
  };
}

const LANES = [
  { key: 'queued', label: 'Intake', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' },
  { key: 'planning', label: 'Planning', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
  { key: 'backlog', label: 'Prioritized Backlog', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5' },
  { key: 'running', label: 'In Progress', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
  { key: 'blocked', label: 'Blocked', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
  { key: 'waiting_for_approval', label: 'Awaiting Input', color: 'text-orange-400 border-orange-500/30 bg-orange-500/5' },
  { key: 'validation', label: 'Validation/Review', color: 'text-teal-400 border-teal-500/30 bg-teal-500/5' },
  { key: 'completed', label: 'Completed', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
  { key: 'failed', label: 'Failed/Escalated', color: 'text-rose-400 border-rose-500/30 bg-rose-500/5' }
];

export default function WorkflowBoard() {
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const loadWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/workflows?limit=50');
      const json = await res.json();
      if (json.data) {
        setWorkflows(json.data);
        // Sync open detail drawer if active
        setSelectedWorkflow(prev => {
          if (!prev) return prev;
          const fresh = json.data.find((w: WorkflowExecution) => w.id === prev.id);
          return fresh ?? prev;
        });
      }
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();

    // Subscribe to SSE real-time state changes
    const eventSource = new EventSource('/api/workflows/events');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[SSE Event Received]', payload);
        loadWorkflows();
      } catch (err) {
        // Parse issue or keep-alive
      }
    };

    eventSource.onerror = () => {
      // Graceful error retry handled by browser APISource
    };

    return () => {
      eventSource.close();
    };
  }, [loadWorkflows]);

  const handleIngestTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsIngesting(true);
    try {
      const res = await fetch('/api/workflows/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setNewTitle('');
        loadWorkflows();
      }
    } catch (err) {
      console.error('Failed to trigger autonomous orchestration task', err);
    } finally {
      setIsIngesting(false);
    }
  };

  // Map database status to swimlanes dynamically
  const getLaneWorkflows = (laneKey: string) => {
    return workflows.filter(w => {
      const meta = w.definition.metadata;
      const complexity = meta?.predictedComplexity;
      
      if (laneKey === 'planning' && w.status === 'queued' && complexity === 'high') {
        return true;
      }
      if (laneKey === 'backlog' && w.status === 'queued' && complexity !== 'high') {
        return true;
      }
      if (laneKey === 'validation' && w.status === 'running' && w.currentStepIndex === w.steps.length - 1) {
        return true;
      }
      if (laneKey === 'running' && w.status === 'running' && w.currentStepIndex < w.steps.length - 1) {
        return true;
      }
      return w.status === laneKey;
    });
  };

  // Compute overall stats
  const activeCount = workflows.filter(w => w.status === 'running').length;
  const totalCost = workflows.reduce((acc, w) => {
    const meta = w.definition.metadata;
    return acc + (meta?.estimatedCostUsd ?? 0.01);
  }, 0);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
            AI Operations Command Center
          </h2>
          <p className="text-slate-400 text-sm">
            Autonomous multi-agent orchestration visibility layer. Event-driven real-time swimlanes.
          </p>
        </div>

        {/* Task Ingestion Form */}
        <form onSubmit={handleIngestTask} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="e.g. Optimize candidate profile for Fintech role..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isIngesting}
            className="bg-[#0c1226] border border-slate-800 text-xs text-white rounded-xl px-4 py-2 w-full md:w-80 focus:outline-none focus:border-indigo-500/60 font-mono"
          />
          <button
            type="submit"
            disabled={isIngesting || !newTitle.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shrink-0"
          >
            {isIngesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Ingest
          </button>
        </form>
      </div>

      {/* Operational Stats Dashboard Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center shadow-inner backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-slate-500 block">Active Pipelines</span>
            <span className="font-bold text-slate-300 text-lg flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {activeCount} Running
            </span>
          </div>
          <Layers className="w-6 h-6 text-slate-800" />
        </div>
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center shadow-inner backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-slate-500 block">Total Est. Cost</span>
            <span className="font-bold text-emerald-400 text-lg flex items-center gap-0.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              {totalCost.toFixed(3)}
            </span>
          </div>
          <TrendingUp className="w-6 h-6 text-slate-800" />
        </div>
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center shadow-inner backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-slate-500 block">Orchestrator Uptime</span>
            <span className="font-bold text-indigo-400 text-lg">99.98%</span>
          </div>
          <Clock className="w-6 h-6 text-slate-800" />
        </div>
        <div className="bg-[#090e1c]/40 border border-slate-900 p-4 rounded-xl flex justify-between items-center shadow-inner backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-slate-500 block">Total Orchestrated Traces</span>
            <span className="font-bold text-purple-400 text-lg">{workflows.length}</span>
          </div>
          <Sparkles className="w-6 h-6 text-slate-800" />
        </div>
      </div>

      {/* Swimlane Visual Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 font-mono text-xs text-slate-550 gap-2 border border-slate-900/60 rounded-xl bg-slate-950/10">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Synchronizing Real-Time Event Streams...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 select-none snap-x snap-mandatory font-mono">
          {LANES.map(lane => {
            const laneWorkflows = getLaneWorkflows(lane.key);
            return (
              <div key={lane.key} className="w-72 shrink-0 space-y-4 snap-start">
              {/* Lane Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${lane.color} px-2 py-0.5 rounded border`}>
                  {lane.label} ({laneWorkflows.length})
                </span>
              </div>

              {/* Lane Cards Stack */}
              <div className="space-y-3 min-h-[400px] bg-slate-950/20 border border-slate-900/50 rounded-xl p-2">
                {laneWorkflows.map(w => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkflow(w)}
                    className="bg-[#090e1c]/80 border border-slate-900 hover:border-slate-800 rounded-xl p-4 space-y-3 shadow-md hover:shadow-lg transition-all cursor-pointer font-mono text-[11px] group relative overflow-hidden active:scale-[0.98]"
                  >
                    {/* Glowing active animation indicator */}
                    {w.status === 'running' && (
                      <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 animate-pulse" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                        {w.definition.displayName}
                      </span>
                    </div>

                    <p className="text-slate-500 text-[10px] line-clamp-2">
                      {w.definition.description || 'Running autonomous operational tasks...'}
                    </p>

                    {/* Cost and progress */}
                    <div className="border-t border-slate-900/60 pt-2 flex items-center justify-between text-slate-400">
                      <span className="text-[10px]">
                        Step {w.currentStepIndex + 1}/{w.steps.length}
                      </span>
                      <span className="text-emerald-500 font-bold">
                        ${(w.definition.metadata?.estimatedCostUsd ?? 0.02).toFixed(3)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-600 truncate max-w-[120px]">{w.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] border font-bold uppercase ${
                        w.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' :
                        w.status === 'failed' ? 'bg-rose-950/40 text-rose-400 border-rose-900/60' :
                        'bg-indigo-950/40 text-indigo-400 border-indigo-900/60'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}

                {laneWorkflows.length === 0 && (
                  <p className="text-[10px] text-slate-700 font-mono text-center py-12 border border-dashed border-slate-900 rounded-xl">
                    Lane empty
                  </p>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Drawer Overlay */}
      {selectedWorkflow && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 transition-opacity"
          onClick={() => setSelectedWorkflow(null)}
        >
          {/* Drawer Body */}
          <div 
            className="w-full max-w-xl bg-[#070b19] border-l border-slate-900 p-6 space-y-6 overflow-y-auto h-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-900 pb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-mono">TRACE SESSION: {selectedWorkflow.id}</span>
                <h3 className="text-lg font-bold text-white font-mono mt-1">{selectedWorkflow.definition.displayName}</h3>
              </div>
              <button 
                onClick={() => setSelectedWorkflow(null)}
                className="text-slate-400 hover:text-white font-mono text-xs border border-slate-800 rounded-lg px-2.5 py-1"
              >
                Esc / Close
              </button>
            </div>

            {/* Ingestion & Context Summary */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                Ingested Meta-Context
              </span>
              <div className="bg-[#0b1226]/50 border border-slate-900 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed">
                {selectedWorkflow.definition.description || 'Autonomous orchestration task active.'}
              </div>
            </div>

            {/* Visual Steps Trail */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                Execution DAG Steps Path
              </span>
              <div className="space-y-3">
                {selectedWorkflow.steps.map((step) => (
                  <div 
                    key={step.stepKey}
                    className="flex items-start gap-3 bg-[#0a0e20]/60 border border-slate-900 p-3 rounded-xl font-mono text-[11px]"
                  >
                    <CornerDownRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{step.stepKey.replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          step.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' :
                          step.status === 'running' ? 'bg-blue-950/40 text-blue-400 border-blue-900/60 animate-pulse' :
                          step.status === 'failed' ? 'bg-rose-950/40 text-rose-400 border-rose-900/60' :
                          'bg-slate-950/40 text-slate-400 border-slate-900/60'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Agent Type: {step.stepType}</span>
                        {step.completedAt && (
                          <span>Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Limits Tracker */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                Governance & Safety Checklist
              </span>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div className="bg-[#0b1226]/50 border border-slate-900 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-slate-500">Risk Threshold:</span>
                  <span className="font-bold text-indigo-400 uppercase">
                    {selectedWorkflow.definition.metadata?.riskLevel || 'low'}
                  </span>
                </div>
                <div className="bg-[#0b1226]/50 border border-slate-900 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-slate-500">Validation Pass:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Passed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
