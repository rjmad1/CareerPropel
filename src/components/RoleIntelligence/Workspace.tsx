'use client';

import React, { useState } from 'react';
import {
  Brain,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Target,
  Trophy,
  Activity,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, Button, Spinner } from '@/components/ui';

interface WorkspaceProps {
  jobId: string;
  data: any;
  onTriggerAgent: (agentType: string) => Promise<void>;
  isTriggering: Record<string, boolean>;
}

export function Workspace({ jobId: _jobId, data, onTriggerAgent, isTriggering }: WorkspaceProps) {
  const { intelligence, fitAnalysis, patterns, executions = [] } = data || {};
  const [expandedReq, setExpandedReq] = useState<Record<string, boolean>>({});

  // Helper to check if a specific agent is running
  const isRunning = (agentType: string) => {
    if (isTriggering[agentType]) return true;
    const latest = executions.find((e: any) => e.agentType === agentType);
    return latest?.status === 'running' || latest?.status === 'queued';
  };

  const getStatusBadge = (agentType: string) => {
    const latest = executions.find((e: any) => e.agentType === agentType);
    if (!latest) return <Badge variant="gray">Not Started</Badge>;
    if (latest.status === 'running') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-pulse">
          <Spinner size="sm" /> Running
        </span>
      );
    }
    if (latest.status === 'queued') {
      return <Badge variant="warning">Queued</Badge>;
    }
    if (latest.status === 'completed') {
      return <Badge variant="success">Analyzed</Badge>;
    }
    return <Badge variant="error">Failed</Badge>;
  };

  const toggleReq = (id: string) => {
    setExpandedReq(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // SVG Gauge helper for Fit Score & Conversion Probability
  const renderGauge = (value: number, title: string, colorClass: string, icon: React.ReactNode) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all duration-300">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={`transition-all duration-1000 ease-out ${colorClass}`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            {icon}
            <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1">{Math.round(value)}%</span>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3">{title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl px-6 py-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 shadow-xs">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Role Decision Intelligence Engine</h2>
            <p className="text-xs text-slate-500 font-medium">Evaluate real operational fit, suppress risk, and optimize conversion probability.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await onTriggerAgent('role-intelligence');
            }}
            disabled={isRunning('role-intelligence')}
            className="flex items-center gap-1.5 font-bold shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning('role-intelligence') ? 'animate-spin' : ''}`} />
            <span>Re-Deconstruct Job</span>
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              // Complete Pipeline Trigger
              await onTriggerAgent('role-intelligence');
              await onTriggerAgent('fit-analysis');
              await onTriggerAgent('gap-analyzer');
              await onTriggerAgent('conversion-scorer');
            }}
            disabled={
              isRunning('role-intelligence') ||
              isRunning('fit-analysis') ||
              isRunning('gap-analyzer') ||
              isRunning('conversion-scorer')
            }
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Run Operational Audit</span>
          </Button>
        </div>
      </div>

      {/* 6 Panel Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: Operational Role Breakdown */}
        <Card className="border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Operational Role Breakdown</span>
            </div>
            {getStatusBadge('role-intelligence')}
          </CardHeader>
          <CardBody className="p-6 flex-1 space-y-6">
            {isRunning('role-intelligence') ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-6 bg-slate-100 rounded-md w-3/4 mx-auto" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2 mx-auto" />
                <div className="space-y-2 mt-8">
                  <div className="h-3 bg-slate-100 rounded-md w-full" />
                  <div className="h-3 bg-slate-100 rounded-md w-5/6" />
                  <div className="h-3 bg-slate-100 rounded-md w-4/5" />
                </div>
              </div>
            ) : intelligence ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Inferred Operational Role</span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {intelligence.inferredRoleTitle || 'Operational Role Not Inferred Yet'}
                  </h3>
                </div>

                {/* Archetype Sliders */}
                <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Weighted Role Archetypes</h4>
                  {intelligence.archetypes?.map((a: any) => (
                    <div key={a.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{a.archetype}</span>
                        <span>{Math.round(a.weight * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                          style={{ width: `${a.weight * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deconstructed Requirements</h4>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {intelligence.requirements?.map((r: any) => (
                      <div key={r.id} className="border border-slate-100 rounded-xl bg-white hover:border-slate-200 transition-all">
                        <div
                          onClick={() => toggleReq(r.id)}
                          className="flex items-start justify-between p-3 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-2.5">
                            <Badge variant={r.type === 'hard' ? 'success' : 'gray'} className="mt-0.5 capitalize">
                              {r.type}
                            </Badge>
                            <p className="text-xs font-semibold text-slate-800 leading-normal">{r.normalizedText}</p>
                          </div>
                          <span className="text-slate-400 mt-0.5">
                            {expandedReq[r.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </div>
                        {expandedReq[r.id] && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-50 text-[11px] text-slate-600 bg-slate-50/30 space-y-2 rounded-b-xl">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-bold text-slate-400 uppercase text-[9px] block">Tools Used</span>
                                <span className="font-semibold text-slate-700">{(r.deconstruction?.tools || []).join(', ') || 'None'}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-400 uppercase text-[9px] block">Risk Level</span>
                                <span className={`font-bold uppercase ${r.deconstruction?.riskLevel === 'HIGH' ? 'text-rose-600' : r.deconstruction?.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {r.deconstruction?.riskLevel || 'LOW'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[9px] block">Business Impact</span>
                              <span className="font-medium text-slate-600">{r.deconstruction?.businessImpact || 'Not defined'}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[9px] block">Original Job Listing Text</span>
                              <span className="italic text-slate-500">"{r.originalText}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Layers className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Operational Role data has not been deconstructed yet.</p>
                <Button size="xs" onClick={() => onTriggerAgent('role-intelligence')}>Deconstruct Role</Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* PANEL 2: Employer Pain Points */}
        <Card className="border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4.5 w-4.5 text-rose-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Employer Pain Points</span>
            </div>
            {getStatusBadge('role-intelligence')}
          </CardHeader>
          <CardBody className="p-6 flex-1 space-y-4">
            {isRunning('role-intelligence') ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-md w-full" />
                <div className="h-8 bg-slate-100 rounded-md w-full" />
                <div className="h-8 bg-slate-100 rounded-md w-full" />
              </div>
            ) : intelligence?.businessProblems?.length > 0 ? (
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Inferred Scaling Problems & Friction</span>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {intelligence.businessProblems.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          {p.problemArea}
                        </h4>
                        <Badge variant="warning" className="text-[9px]">Urgent</Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-normal">{p.description}</p>
                      {p.inferredFriction && (
                        <div className="pt-2 border-t border-slate-50 flex items-start gap-1.5 text-[10px] text-slate-500">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Operational Friction:</strong> {p.inferredFriction}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Target className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Employer pain point mapping has not been completed.</p>
                <Button size="xs" onClick={() => onTriggerAgent('role-intelligence')}>Infer Pain Points</Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* PANEL 3: Strength Evidence Mapping */}
        <Card className="border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all lg:col-span-2">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">3. Strength Evidence Mapping (Candidate Proof → Employer Pain)</span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge('fit-analysis')}
              <Button
                variant="outline"
                size="xs"
                onClick={() => onTriggerAgent('fit-analysis')}
                disabled={isRunning('fit-analysis')}
                className="font-bold border-slate-200 shadow-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRunning('fit-analysis') ? 'animate-spin' : ''}`} />
                Analyze Strengths
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-6 flex-1 space-y-4">
            {isRunning('fit-analysis') ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-md w-full" />
                <div className="h-10 bg-slate-100 rounded-md w-full" />
              </div>
            ) : fitAnalysis?.strengths?.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead className="bg-slate-50/70 font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Employer Pain / Bottleneck</th>
                        <th className="px-4 py-3">Your Demonstrated Proof</th>
                        <th className="px-4 py-3">Employer Value Translation</th>
                        <th className="px-4 py-3 text-center">Leverage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white font-medium text-slate-700">
                      {fitAnalysis.strengths.map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 max-w-[200px]">
                            <span className="font-bold text-slate-900 block mb-0.5">{s.capabilityName}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">{s.businessProblem?.problemArea || s.problemArea}</span>
                          </td>
                          <td className="px-4 py-3.5 max-w-[300px] text-slate-600 leading-normal">
                            "{s.candidateProof}"
                            {s.measurableOutcome && (
                              <span className="block text-[10px] font-bold text-emerald-600 mt-1">
                                outcome: {s.measurableOutcome}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 max-w-[250px] leading-normal text-slate-800">
                            <strong>{s.employerInterpretation}</strong>
                            {s.businessImpact && (
                              <span className="block text-[10px] text-slate-400 mt-0.5">
                                impact: {s.businessImpact}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant={s.priorityLevel === 'HIGH' ? 'success' : s.priorityLevel === 'MEDIUM' ? 'warning' : 'gray'} className="text-[9px] font-bold">
                              {s.priorityLevel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Strength mapping has not been performed for this candidate/job combination.</p>
                <Button size="xs" onClick={() => onTriggerAgent('fit-analysis')}>Map Strengths Now</Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* PANEL 4: Gap Analysis */}
        <Card className="border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">4. Deterministic Gap Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge('gap-analyzer')}
              <Button
                variant="outline"
                size="xs"
                onClick={() => onTriggerAgent('gap-analyzer')}
                disabled={isRunning('gap-analyzer')}
                className="font-bold border-slate-200 shadow-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRunning('gap-analyzer') ? 'animate-spin' : ''}`} />
                Analyze Gaps
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-6 flex-1 space-y-6">
            {isRunning('gap-analyzer') ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-md w-full" />
                <div className="h-8 bg-slate-100 rounded-md w-full" />
              </div>
            ) : fitAnalysis?.gaps?.length > 0 ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adaptation Burden</span>
                    <span className="text-sm font-extrabold text-slate-800">Learning Curve Complexity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-700">{fitAnalysis.adaptationRiskScore}%</span>
                    <Badge variant={fitAnalysis.adaptationRiskScore > 60 ? 'error' : fitAnalysis.adaptationRiskScore > 30 ? 'warning' : 'success'}>
                      {fitAnalysis.adaptationRiskScore > 60 ? 'High Cost' : fitAnalysis.adaptationRiskScore > 30 ? 'Moderate' : 'Low Cost'}
                    </Badge>
                  </div>
                </div>

                {/* Gap List */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {fitAnalysis.gaps.map((g: any) => (
                    <div key={g.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${g.type === 'trainable' ? 'bg-emerald-500' : g.type === 'domain-depth' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          <h4 className="text-xs font-bold text-slate-800 capitalize">{g.type} Gap</h4>
                        </div>
                        <Badge variant={g.penaltyLevel === 'CRITICAL' ? 'error' : g.penaltyLevel === 'SEVERE' ? 'warning' : 'gray'} className="text-[9px] font-bold">
                          {g.penaltyLevel} penalty
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-normal">{g.description}</p>
                      {g.mitigationStrategy && (
                        <div className="mt-2 bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/40 text-[10px] text-slate-600">
                          <strong className="text-emerald-700 block mb-0.5">Mitigation Strategy:</strong>
                          "{g.mitigationStrategy}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Deterministic gap analysis has not been performed yet.</p>
                <Button size="xs" onClick={() => onTriggerAgent('gap-analyzer')}>Analyze Gaps Now</Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* PANEL 5: Conversion Probability */}
        <Card className="border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">5. Conversion Probability Scorer</span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge('conversion-scorer')}
              <Button
                variant="outline"
                size="xs"
                onClick={() => onTriggerAgent('conversion-scorer')}
                disabled={isRunning('conversion-scorer')}
                className="font-bold border-slate-200 shadow-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRunning('conversion-scorer') ? 'animate-spin' : ''}`} />
                Score Fit
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-6 flex-1 space-y-6">
            {isRunning('conversion-scorer') ? (
              <div className="space-y-4 py-8 animate-pulse flex flex-col items-center justify-center">
                <div className="h-28 w-28 bg-slate-100 rounded-full" />
                <div className="h-6 bg-slate-100 rounded-md w-1/2 mt-4" />
              </div>
            ) : fitAnalysis && fitAnalysis.overallFitScore > 0 ? (
              <div className="space-y-6">
                {/* Visual SVG Gauges */}
                <div className="grid grid-cols-2 gap-4">
                  {renderGauge(
                    fitAnalysis.overallFitScore,
                    'Operational Fit Score',
                    'stroke-blue-600',
                    <Target className="h-6 w-6 text-blue-500" />
                  )}
                  {renderGauge(
                    fitAnalysis.conversionProb,
                    'Interview Probability',
                    fitAnalysis.conversionProb > 70 ? 'stroke-emerald-500' : fitAnalysis.conversionProb > 40 ? 'stroke-amber-500' : 'stroke-rose-500',
                    <TrendingUp className={`h-6 w-6 ${fitAnalysis.conversionProb > 70 ? 'text-emerald-500' : fitAnalysis.conversionProb > 40 ? 'text-amber-500' : 'text-rose-500'}`} />
                  )}
                </div>

                {/* Metric Summary */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Immediate Contribution</span>
                    <span className="text-lg font-extrabold text-slate-800">{fitAnalysis.immediateContribution}%</span>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credibility Risk</span>
                    <span className="text-lg font-extrabold text-slate-800">{fitAnalysis.credibilityRisk}%</span>
                  </div>
                </div>

                {/* Scoring Rationale Explanation */}
                {fitAnalysis.reasoning && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mathematical Scoring Rationale</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{fitAnalysis.reasoning}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Activity className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Mathematical fit scoring has not been calculated yet.</p>
                <Button size="xs" onClick={() => onTriggerAgent('conversion-scorer')}>Calculate Scores Now</Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* PANEL 6: Pattern Insights */}
        <Card className="border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">6. Reusable Success Correlation Patterns</span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge('pattern-miner')}
              <Button
                variant="outline"
                size="xs"
                onClick={() => onTriggerAgent('pattern-miner')}
                disabled={isRunning('pattern-miner')}
                className="font-bold border-slate-200 shadow-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRunning('pattern-miner') ? 'animate-spin' : ''}`} />
                Mine Patterns
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-6 flex-1 space-y-4">
            {isRunning('pattern-miner') ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-md w-full" />
                <div className="h-8 bg-slate-100 rounded-md w-full" />
              </div>
            ) : patterns?.length > 0 ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mined Correlation Patterns & Achievement Mappings</span>
                <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                  {patterns.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">{p.roleArchetype} Archetype Pattern</span>
                        <Badge variant="success" className="text-[9px] font-bold">Success Correlated</Badge>
                      </div>
                      
                      {p.operationalKeywords?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">Operational Keywords Mapped</span>
                          <div className="flex flex-wrap gap-1">
                            {p.operationalKeywords.map((k: string, i: number) => (
                              <Badge key={i} variant="gray" className="text-[10px]">{k}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {p.successMetrics?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Mined High-Performing Metrics</span>
                          <ul className="list-disc list-inside text-xs text-slate-600 font-medium pl-1">
                            {p.successMetrics.slice(0, 3).map((m: string, i: number) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Sparkles className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Success correlation pattern miner has not run yet.</p>
                <Button size="xs" onClick={() => onTriggerAgent('pattern-miner')}>Mine Success Patterns</Button>
              </div>
            )}
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
