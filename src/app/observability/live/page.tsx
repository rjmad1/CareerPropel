'use client';

import { useState, useEffect, useRef } from 'react';
import { TelemetryApiClient } from '@/observability-platform/packages/api-client/client';
import { 
  Terminal, 
  Cpu, 
  DollarSign, 
  Zap,
  Flame
} from 'lucide-react';


interface LiveEvent {
  traceId: string;
  spanId: string;
  agentName: string;
  modelName: string;
  tokens: number;
  cost: number;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILURE' | 'RUNNING';
  timestamp: string;
}

const client = new TelemetryApiClient();

export default function LiveStreamConsole() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeTokensCount, setActiveTokensCount] = useState(0);
  const [activeCost, setActiveCost] = useState(0);
  const [runningCount, setRunningCount] = useState(0);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hook up active WebSocket subscriber
    const unsubscribe = client.subscribeToRealTimeEvents((event) => {
      if (event.type === 'TELEMETRY_STREAM') {
        const payload = event.payload as LiveEvent;
        setEvents(prev => [...prev, payload].slice(-30)); // Cap console lines at 30 to avoid rendering freezes

        // Tally real-time statistics
        setActiveTokensCount(prev => prev + payload.tokens);
        setActiveCost(prev => prev + payload.cost);
        setRunningCount(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Live Monitoring Console</h2>
          <p className="text-slate-400 text-sm">Streaming high-frequency agent tokens, memory frames, and LLM calls in real-time</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-800/80 px-3 py-1.5 rounded-lg">
          <Zap className="w-4 h-4 text-purple-400 animate-bounce" />
          <span className="text-xs font-mono font-bold text-purple-300">Live Syncing Enabled</span>
        </div>
      </div>

      {/* Ticker Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Token Accumulator */}
        <div className="bg-[#090e1c]/40 border border-slate-900 rounded-xl p-5 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Session Token Throughput</span>
            <span className="text-2xl font-bold text-purple-400 font-mono">{activeTokensCount.toLocaleString()}</span>
          </div>
          <Flame className="w-8 h-8 text-purple-500/20" />
        </div>

        {/* Cost Accumulator */}
        <div className="bg-[#090e1c]/40 border border-slate-900 rounded-xl p-5 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Session Cost Billed</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">${activeCost.toFixed(5)}</span>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500/20" />
        </div>

        {/* Running Processes Counter */}
        <div className="bg-[#090e1c]/40 border border-slate-900 rounded-xl p-5 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Concurrent Runs</span>
            <span className="text-2xl font-bold text-indigo-400 font-mono">{runningCount}</span>
          </div>
          <Cpu className="w-8 h-8 text-indigo-500/20" />
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col h-[520px] shadow-2xl">
        {/* Header toolbar */}
        <div className="bg-[#080d1a] border-b border-slate-900 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold text-slate-300">Telemetry Log Output</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Streaming Logs */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] space-y-2 bg-[#050810]/95 select-text">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
              <Zap className="w-6 h-6 text-slate-700 animate-pulse" />
              <span>Awaiting telemetry broadcast from orchestrators...</span>
            </div>
          ) : (
            events.map((ev, index) => {
              const timeString = new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              
              const isSuccess = ev.status === 'SUCCESS';
              const statusColor = isSuccess ? 'text-emerald-400' : 'text-rose-400';

              return (
                <div key={index} className="py-1 border-b border-slate-900/40 last:border-0 hover:bg-slate-900/30 px-2 rounded transition-colors flex flex-wrap gap-x-3 items-center">
                  <span className="text-slate-600 font-bold">[{timeString}]</span>
                  <span className="text-indigo-400">INFO</span>
                  <span className="text-slate-400">trace=</span>
                  <span className="text-purple-300 font-bold">{ev.traceId}</span>
                  <span className="text-slate-450">agent=</span>
                  <span className="text-slate-200 font-semibold">{ev.agentName}</span>
                  <span className="text-slate-500">model=</span>
                  <span className="text-blue-400">{ev.modelName}</span>
                  <span className="text-slate-500">tokens=</span>
                  <span className="text-slate-300">{ev.tokens}</span>
                  <span className="text-slate-500">cost=</span>
                  <span className="text-emerald-400 font-semibold">${ev.cost.toFixed(5)}</span>
                  <span className="text-slate-500">dur=</span>
                  <span className="text-amber-400">{ev.latencyMs}ms</span>
                  <span className="text-slate-500">status=</span>
                  <span className={`font-bold ${statusColor}`}>{ev.status}</span>
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
