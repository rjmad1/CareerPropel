import React, { useState } from 'react';
import { Span, TelemetryStatus } from '../telemetry-sdk/types';
import { ChevronDown, ChevronRight, Activity, Cpu, Wrench, Terminal, AlertTriangle, CheckCircle2, Clock, DollarSign } from 'lucide-react';

interface TraceTreeProps {
  spans: Span[];
}

export const TraceTree: React.FC<TraceTreeProps> = ({ spans }) => {
  // Find all top-level root spans (spans without a parent, or whose parent is not in the active spans set)
  const rootSpans = spans.filter(s => !s.parentId || !spans.some(p => p.id === s.parentId));
  
  return (
    <div className="space-y-2 select-none">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Execution Span Tree</h3>
      <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80 backdrop-blur-md">
        {rootSpans.map(span => (
          <TreeNode key={span.id} span={span} allSpans={spans} depth={0} />
        ))}
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ span: Span; allSpans: Span[]; depth: number }> = ({ span, allSpans, depth }) => {
  const [expanded, setExpanded] = useState(true);
  const children = allSpans.filter(s => s.parentId === span.id);
  const hasChildren = children.length > 0;

  const getStatusColor = (status: TelemetryStatus) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60';
      case 'FAILURE': return 'text-rose-400 bg-rose-950/40 border-rose-900/60';
      case 'RUNNING': return 'text-purple-400 bg-purple-950/40 border-purple-900/60 animate-pulse';
      default: return 'text-slate-400 bg-slate-850/40 border-slate-800';
    }
  };

  const getSpanIcon = (type: string) => {
    switch (type) {
      case 'AGENT': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'TOOL': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'LLM': return <Terminal className="w-4 h-4 text-blue-400" />;
      case 'PIPELINE': return <Activity className="w-4 h-4 text-pink-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-slate-900/60 transition-colors border border-transparent hover:border-slate-800/80 cursor-pointer`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {hasChildren && (
            expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </div>

        <div className={`p-1 rounded border ${getStatusColor(span.status)}`}>
          {getSpanIcon(span.type)}
        </div>

        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm font-semibold text-slate-200 truncate">{span.name}</span>
            {span.agentName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-medium">
                {span.agentName}
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono hidden md:inline">{span.type}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {span.durationMs}ms
            </span>
            {span.cost > 0 && (
              <span className="flex items-center gap-0.5 text-emerald-500 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {span.cost.toFixed(4)}
              </span>
            )}
            {span.generation && (
              <span className="text-blue-400 font-medium hidden sm:inline">
                {span.generation.totalTokens} tokens
              </span>
            )}
            <div className="flex items-center">
              {span.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : span.status === 'FAILURE' ? (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500 animate-ping" />
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="relative">
          <div 
            className="absolute left-0 top-0 bottom-0 w-px bg-slate-800/80" 
            style={{ left: `${depth * 16 + 20}px` }}
          />
          <div className="space-y-1">
            {children.map(child => (
              <TreeNode key={child.id} span={child} allSpans={allSpans} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
