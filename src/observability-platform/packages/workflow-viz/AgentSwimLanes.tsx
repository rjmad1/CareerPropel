import React from 'react';
import { Span } from '../telemetry-sdk/types';
import { Clock, Layers, Sparkles } from 'lucide-react';

interface AgentSwimLanesProps {
  spans: Span[];
}

export const AgentSwimLanes: React.FC<AgentSwimLanesProps> = ({ spans }) => {
  // Only display spans that represent agents or subtasks with defined start times
  const agentSpans = spans.filter(s => s.type === 'AGENT' || s.agentName);
  
  if (agentSpans.length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center">
        <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No parallel agent swim lanes detected for this trace.</p>
      </div>
    );
  }

  // Find overall start and end times to plot scales
  const timestamps = agentSpans.map(s => new Date(s.startTime).getTime());
  const minTime = Math.min(...timestamps);
  
  const endTimes = agentSpans.map(s => s.endTime ? new Date(s.endTime).getTime() : new Date(s.startTime).getTime() + s.durationMs);
  const maxTime = Math.max(...endTimes);
  const totalDuration = maxTime - minTime || 1;

  // Group spans by agentName
  const agentGroups: Record<string, Span[]> = {};
  agentSpans.forEach(s => {
    const name = s.agentName || 'Core Orchestrator';
    if (!agentGroups[name]) {
      agentGroups[name] = [];
    }
    agentGroups[name].push(s);
  });

  return (
    <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Parallel Agent Execution Swim Lanes
          </h4>
          <p className="text-xs text-slate-400">Chronological execution tracks outlining workflow blocking steps</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Total Span Window: {totalDuration}ms</span>
        </div>
      </div>

      {/* Swim lane Grid */}
      <div className="space-y-4">
        {Object.entries(agentGroups).map(([agentName, groupSpans]) => (
          <div key={agentName} className="relative flex items-center min-h-[50px] border-b border-slate-900/60 pb-3 last:border-b-0">
            {/* Agent Label */}
            <div className="w-[180px] pr-4 shrink-0 flex items-center">
              <span className="text-xs font-mono font-bold text-slate-300 truncate bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                {agentName}
              </span>
            </div>

            {/* Timeline Track */}
            <div className="relative flex-1 h-8 bg-slate-950/40 rounded border border-slate-900/40 overflow-hidden">
              {groupSpans.map(span => {
                const spanStart = new Date(span.startTime).getTime();
                const spanEnd = span.endTime ? new Date(span.endTime).getTime() : spanStart + span.durationMs;

                const leftPct = ((spanStart - minTime) / totalDuration) * 100;
                const widthPct = ((spanEnd - spanStart) / totalDuration) * 100;

                const isSuccess = span.status === 'SUCCESS';
                const colorClass = isSuccess 
                  ? 'bg-emerald-500/25 border-emerald-500/60 hover:bg-emerald-500/35 text-emerald-300' 
                  : 'bg-rose-500/25 border-rose-500/60 hover:bg-rose-500/35 text-rose-300';

                return (
                  <div
                    key={span.id}
                    className={`absolute top-1 bottom-1 rounded border px-2 flex items-center justify-between text-[10px] font-mono cursor-pointer transition-all select-none hover:shadow-lg ${colorClass}`}
                    style={{ 
                      left: `${Math.max(0, leftPct)}%`, 
                      width: `${Math.max(4, widthPct)}%`,
                      minWidth: '50px'
                    }}
                    title={`${span.name}: ${span.durationMs}ms (${span.status})`}
                  >
                    <span className="truncate pr-1 font-semibold">{span.name.replace('Execution Frame: ', '')}</span>
                    <span className="shrink-0">{span.durationMs}ms</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Timeline Scales */}
      <div className="flex justify-between pl-[180px] pt-3 text-[10px] font-mono text-slate-500 border-t border-slate-900 mt-2">
        <span>0ms</span>
        <span>{Math.round(totalDuration * 0.25)}ms</span>
        <span>{Math.round(totalDuration * 0.5)}ms</span>
        <span>{Math.round(totalDuration * 0.75)}ms</span>
        <span>{totalDuration}ms</span>
      </div>
    </div>
  );
};
