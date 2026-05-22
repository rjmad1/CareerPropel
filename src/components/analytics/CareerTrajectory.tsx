'use client';

import { useState } from 'react';
import { Card, CardBody, Badge } from '@/components/ui';
import { CheckCircle2, ChevronRight, Award, Compass, ShieldAlert } from 'lucide-react';

interface CareerNode {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  cx: number;
  cy: number;
  status: 'completed' | 'active' | 'locked';
  salary: string;
  timeframe: string;
  gaps: string[];
  milestones: string[];
}

const TRAJECTORY_NODES: CareerNode[] = [
  {
    id: 'senior-eng',
    label: 'Senior Software Engineer',
    shortLabel: 'Senior Eng',
    description: 'Autonomous execution of major features, code quality stewardship, and team mentorship.',
    cx: 80,
    cy: 160,
    status: 'completed',
    salary: '$140k - $180k',
    timeframe: 'Achieved',
    gaps: [],
    milestones: [
      'Led core migrations with 99.9% uptime stability',
      'Mentored 3 associate developers into mid-level positions'
    ]
  },
  {
    id: 'staff-eng',
    label: 'Staff Software Engineer',
    shortLabel: 'Staff Eng',
    description: 'Technical architect leading system design, domain-level strategy, and cross-functional technical alignment.',
    cx: 240,
    cy: 100,
    status: 'active',
    salary: '$180k - $240k',
    timeframe: 'Current Goal (0-6 months)',
    gaps: [
      'Multi-region high-availability system architecture',
      'API Governance standards & corporate schema definition',
      'Advanced executive presentation and board alignment'
    ],
    milestones: [
      'Publish cross-department systems scaling RFC',
      'Optimize database cluster query efficiency by 30%',
      'Lead design review panels for core engineering teams'
    ]
  },
  {
    id: 'tech-lead-mgr',
    label: 'Engineering Manager',
    shortLabel: 'Eng Manager',
    description: 'Hybrid technical governance and people leadership. Team building, delivery operations, and resource allocation.',
    cx: 400,
    cy: 180,
    status: 'locked',
    salary: '$190k - $250k',
    timeframe: '1-2 Years',
    gaps: [
      'Scrum master certification / Agile delivery management',
      'Conflict resolution & career progression scaffolding',
      'Project capitalization & capacity planning models'
    ],
    milestones: [
      'Manage deliverables matrix for a team of 8 engineers',
      'Coordinate and execute 3 successful quarterly product cycles',
      'Implement structured peer-review cycles'
    ]
  },
  {
    id: 'director-eng',
    label: 'Director of Engineering',
    shortLabel: 'Director',
    description: 'Strategic leadership overseeing multiple managers and squads. Engineering-wide budget alignment and business integration.',
    cx: 560,
    cy: 80,
    status: 'locked',
    salary: '$250k - $320k',
    timeframe: '3-5 Years',
    gaps: [
      'Cross-organization OKR alignment & operational metrics',
      'Enterprise vendor contract negotiation',
      'Strategic hiring strategy & diversity initiative designs'
    ],
    milestones: [
      'Scale engineering department size from 20 to 60+ individuals',
      'Reduce infrastructure overhead expenditures by 20%',
      'Align engineering initiatives to core business revenues'
    ]
  },
  {
    id: 'cto-vp',
    label: 'VP of Engineering / CTO',
    shortLabel: 'CTO / VP',
    description: 'Executive technology governance. Company-wide technology strategy, innovation investments, and business representation.',
    cx: 720,
    cy: 140,
    status: 'locked',
    salary: '$320k - $450k+',
    timeframe: '5+ Years',
    gaps: [
      'Capital budget management & executive compensation schemes',
      'Global regulatory compliance & intellectual property strategy',
      'Board of Directors relationships & public relations'
    ],
    milestones: [
      'Define long-term 5-year technology research roadmap',
      'Champion successful patent portfolio additions',
      'Lead technology evaluations for acquisition opportunities'
    ]
  }
];

export function CareerTrajectory() {
  const [selectedNode, setSelectedNode] = useState<CareerNode>(
    TRAJECTORY_NODES.find(n => n.status === 'active') || TRAJECTORY_NODES[0]
  );

  return (
    <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl overflow-hidden" data-cy="trajectory-card">
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Interactive Career Trajectory Map</h3>
              <p className="text-xs text-slate-400">Visualize pathways, close skill gaps, and achieve long-term milestones.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Active Target
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-650" /> Locked
            </span>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="relative w-full overflow-x-auto bg-slate-950/80 rounded-2xl border border-slate-850 p-4 mb-6 scrollbar-thin">
          <div className="min-w-[800px] h-[250px] relative">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 250"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              data-cy="trajectory-svg"
              role="img"
              aria-label="Interactive career trajectory path from Senior Engineer to VP of Engineering"
            >
              {/* Connecting Background Lines */}
              {TRAJECTORY_NODES.map((node, idx) => {
                if (idx === TRAJECTORY_NODES.length - 1) return null;
                const nextNode = TRAJECTORY_NODES[idx + 1];
                const isPassed = node.status === 'completed' && nextNode.status !== 'locked';
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={node.cx}
                    y1={node.cy}
                    x2={nextNode.cx}
                    y2={nextNode.cy}
                    stroke={isPassed ? '#10b981' : node.status === 'active' ? '#6366f1' : '#334155'}
                    strokeWidth={isPassed || node.status === 'active' ? 3 : 2}
                    strokeDasharray={node.status === 'locked' ? '5,5' : '0'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Glowing effects for Active Node */}
              {TRAJECTORY_NODES.map((node) => {
                if (node.status !== 'active') return null;
                return (
                  <g key={`glow-${node.id}`}>
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="22"
                      fill="#6366f1"
                      fillOpacity="0.15"
                      className="animate-ping"
                      style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                    />
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="16"
                      fill="#6366f1"
                      fillOpacity="0.25"
                    />
                  </g>
                );
              })}

              {/* Interactive Circle Nodes */}
              {TRAJECTORY_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isActive = node.status === 'active';
                const isCompleted = node.status === 'completed';

                let strokeColor = '#475569'; // locked
                let fillColor = '#0f172a';
                if (isCompleted) {
                  strokeColor = '#10b981';
                  fillColor = '#064e3b';
                } else if (isActive) {
                  strokeColor = '#6366f1';
                  fillColor = '#1e1b4b';
                }

                if (isSelected) {
                  strokeColor = isActive ? '#818cf8' : isCompleted ? '#34d399' : '#94a3b8';
                }

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedNode(node)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedNode(node); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.label}. Status: ${node.status}. Salary: ${node.salary}. ${node.status === 'locked' ? node.timeframe : 'Click to view details'}`}
                    data-cy="trajectory-node"
                    data-node-id={node.id}
                  >
                    {/* Node circle */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSelected ? '14' : '10'}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '4' : '3'}
                      className="transition-all duration-300 group-hover:scale-110"
                      style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                    />

                    {/* Short text inside circle if selected */}
                    {isCompleted && (
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="4"
                        fill="#10b981"
                      />
                    )}

                    {/* Node labels */}
                    <text
                      x={node.cx}
                      y={node.cy + 32}
                      textAnchor="middle"
                      className={`text-xs font-semibold select-none transition-all duration-300 ${
                        isSelected
                          ? 'fill-white text-[13px] font-bold'
                          : isActive
                          ? 'fill-indigo-400'
                          : isCompleted
                          ? 'fill-emerald-400'
                          : 'fill-slate-500'
                      }`}
                    >
                      {node.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Details Block */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/50 border border-slate-850 p-6 rounded-2xl"
          data-cy="node-details"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Details for ${selectedNode.label}`}
        >
          {/* Overview columns */}
          <div className="lg:col-span-4 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-850 pb-6 lg:pb-0 lg:pr-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    selectedNode.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : selectedNode.status === 'active'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }
                >
                  {selectedNode.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">{selectedNode.timeframe}</span>
              </div>
              <h4 className="text-lg font-bold text-white leading-tight">{selectedNode.label}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedNode.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Salary Bench</span>
                <span className="text-sm font-extrabold text-white">{selectedNode.salary}</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Core Target</span>
                <span className="text-sm font-extrabold text-indigo-400 flex items-center gap-0.5">
                  Tailored <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Skill Gaps & Milestones columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 lg:pl-4">
            {/* Skill Gaps block */}
            <div className="flex flex-col gap-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" /> Skill Gaps to Close
              </h5>
              {selectedNode.gaps.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedNode.gaps.map((gap, i) => (
                    <div key={i} className="flex gap-2.5 items-start bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors">
                      <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-slate-300 leading-relaxed">{gap}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-emerald-950/10 border border-emerald-900/20 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-emerald-400">All Core Gaps Closed</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    You have demonstrated the complete expertise standard required for this level.
                  </p>
                </div>
              )}
            </div>

            {/* Next Milestones block */}
            <div className="flex flex-col gap-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Required Milestones
              </h5>
              <div className="flex flex-col gap-2">
                {selectedNode.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${selectedNode.status === 'completed' ? 'text-emerald-400' : 'text-slate-650'}`} />
                    <span className="text-xs text-slate-300 leading-relaxed">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
