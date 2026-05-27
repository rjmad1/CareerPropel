import React from 'react';
import { WorkflowDAG as DAGType, WorkflowNode } from '../telemetry-sdk/types';
import { Cpu, Activity, Clock, Wrench, ShieldAlert, Sparkles } from 'lucide-react';

interface WorkflowDAGProps {
  dag: DAGType;
  activeNodeId?: string;
  onNodeSelect?: (node: WorkflowNode) => void;
}

export const WorkflowDAG: React.FC<WorkflowDAGProps> = ({ dag, activeNodeId, onNodeSelect }) => {
  const { nodes, edges } = dag;

  // Let's arrange nodes automatically in columns using a basic grid layout for rendering simplicity and reliability
  // Nodes of type 'orchestrator' or parent-less nodes go to column 0, agent sub-tasks in column 1, tools in column 2.
  const getColIndex = (node: WorkflowNode) => {
    if (node.type === 'orchestrator') return 0;
    if (node.type === 'agent') return 1;
    return 2;
  };

  const colMap: Record<number, WorkflowNode[]> = { 0: [], 1: [], 2: [] };
  nodes.forEach(n => {
    const col = getColIndex(n);
    colMap[col].push(n);
  });

  // Calculate coordinates for nodes
  const nodeCoords: Record<string, { x: number; y: number }> = {};
  const colWidth = 260;
  const rowHeight = 120;
  const paddingX = 60;
  const paddingY = 40;

  Object.entries(colMap).forEach(([colStr, colNodes]) => {
    const col = parseInt(colStr);
    const x = paddingX + col * colWidth;
    colNodes.forEach((node, row) => {
      const y = paddingY + row * rowHeight;
      nodeCoords[node.id] = { x, y };
    });
  });

  const getStatusBorder = (status: string) => {
    if (status === 'SUCCESS') return 'border-emerald-700/60 shadow-emerald-950/20';
    if (status === 'FAILURE') return 'border-rose-700/60 shadow-rose-950/20';
    return 'border-purple-700/60 shadow-purple-950/20';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'orchestrator': return <Activity className="w-4 h-4 text-pink-400" />;
      case 'agent': return <Cpu className="w-4 h-4 text-purple-400" />;
      default: return <Wrench className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative border border-slate-800 bg-slate-950/60 rounded-xl overflow-hidden min-h-[420px] p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Agent Lineage Directed Acyclic Graph (DAG)
          </h4>
          <p className="text-xs text-slate-400">Flow trace reconstruction from Langfuse instrumentation</p>
        </div>
        <div className="flex gap-4 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Orchestrator
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Agents
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tools / LLMs
          </span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[300px] overflow-auto">
        {/* Draw SVGs for edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '800px', minHeight: '400px' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
          </defs>
          {edges.map(edge => {
            const start = nodeCoords[edge.source];
            const end = nodeCoords[edge.target];
            if (!start || !end) return null;

            // Draw clean cubic bezier links
            const cp1X = start.x + colWidth / 2;
            const cp1Y = start.y + 35;
            const cp2X = end.x - colWidth / 2;
            const cp2Y = end.y + 35;

            return (
              <g key={edge.id}>
                <path
                  d={`M ${start.x + 180} ${start.y + 35} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${end.x} ${end.y + 35}`}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Render interactive nodes */}
        <div className="absolute inset-0" style={{ minWidth: '800px', minHeight: '400px' }}>
          {nodes.map(node => {
            const coord = nodeCoords[node.id];
            if (!coord) return null;

            const isSelected = activeNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => onNodeSelect?.(node)}
                className={`absolute p-3 rounded-lg border bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer select-none transition-all w-[200px] shadow-lg ${getStatusBorder(node.status)} ${
                  isSelected ? 'ring-2 ring-purple-500 scale-105 border-purple-500 bg-slate-800' : ''
                }`}
                style={{ left: `${coord.x}px`, top: `${coord.y}px` }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getIcon(node.type)}
                    <span className="text-xs font-mono font-bold text-slate-100 truncate">{node.label}</span>
                  </div>
                  {node.status === 'FAILURE' && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-800/60 pt-1.5">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {node.durationMs}ms
                  </span>
                  {node.cost > 0 && (
                    <span className="text-emerald-400 font-semibold">${node.cost.toFixed(4)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
