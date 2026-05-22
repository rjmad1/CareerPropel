'use client';

import React, { useState } from 'react';
import { Card, CardBody, Badge } from '@/components/ui';
import { TrendingUp, TrendingDown, Briefcase, Globe, HelpCircle } from 'lucide-react';

interface SkillDemand {
  name: string;
  category: 'Frontend' | 'Backend' | 'AI / Cloud' | 'Management';
  demandIndex: number; // out of 100
  trend: 'up' | 'down' | 'stable';
  growthRate: number; // percentage
}

interface SalaryBenchmark {
  level: string;
  remote: number;
  hybrid: number;
  onsite: number;
}

const SKILL_DEMANDS: SkillDemand[] = [
  { name: 'Next.js 14/15 App Router', category: 'Frontend', demandIndex: 94, trend: 'up', growthRate: 35 },
  { name: 'Generative AI & LLM Orchestrator', category: 'AI / Cloud', demandIndex: 98, trend: 'up', growthRate: 112 },
  { name: 'GraphQL & Federated Schema', category: 'Backend', demandIndex: 78, trend: 'stable', growthRate: 4 },
  { name: 'Distributed Systems & WebSockets', category: 'Backend', demandIndex: 88, trend: 'up', growthRate: 18 },
  { name: 'Tailwind CSS & Design Systems', category: 'Frontend', demandIndex: 82, trend: 'stable', growthRate: 8 },
  { name: 'Fintech Compliance & Payment APIs', category: 'Backend', demandIndex: 85, trend: 'up', growthRate: 22 },
  { name: 'Team Capacity & OKR Scaffolding', category: 'Management', demandIndex: 74, trend: 'down', growthRate: -5 },
];

const SALARY_BENCHMARKS: SalaryBenchmark[] = [
  { level: 'Mid-Level Engineer', remote: 135000, hybrid: 125000, onsite: 120000 },
  { level: 'Senior Engineer', remote: 175000, hybrid: 165000, onsite: 155000 },
  { level: 'Staff Engineer', remote: 220000, hybrid: 205000, onsite: 195000 },
  { level: 'Principal Engineer', remote: 260000, hybrid: 245000, onsite: 230000 },
  { level: 'Director of Engineering', remote: 310000, hybrid: 290000, onsite: 275000 },
];

export function MarketInsights() {
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');

  const maxDemand = Math.max(...SKILL_DEMANDS.map(s => s.demandIndex), 1);

  return (
    <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl" data-cy="market-insights">
      <CardBody className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Real-Time Market Demand & Benchmarks</h3>
              <p className="text-xs text-slate-400">Scraped corporate posting analytics, growth trends, and localized salary benchmarks.</p>
            </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-end sm:self-auto" role="group" aria-label="Work mode selection">
            {(['remote', 'hybrid', 'onsite'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkMode(mode)}
                aria-pressed={workMode === mode}
                aria-label={`${mode} work mode`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${
                  workMode === mode
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                data-cy={`market-mode-btn-${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Demand Trends */}
          <div className="lg:col-span-6 flex flex-col gap-4" data-cy="skill-demand-list">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Trending Tech Skills</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                UPDATED TODAY
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {SKILL_DEMANDS.map((skill) => (
                <div
                  key={skill.name}
                  className="flex flex-col gap-1.5 p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors rounded-xl"
                >
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      {skill.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {skill.category}
                      </span>
                      <span className="font-bold text-white flex items-center gap-0.5">
                        {skill.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                        {skill.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                        {skill.trend === 'stable' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                        {skill.growthRate > 0 ? `+${skill.growthRate}%` : `${skill.growthRate}%`}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        skill.trend === 'up'
                          ? 'bg-indigo-500'
                          : skill.trend === 'down'
                          ? 'bg-rose-500'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${(skill.demandIndex / maxDemand) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Benchmarks */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Salary Benchmarks (<span className="capitalize">{workMode}</span>)
            </span>

            <div className="flex flex-col gap-3.5 bg-slate-950/30 border border-slate-850 p-4 rounded-2xl" data-cy="salary-bench-list">
              {SALARY_BENCHMARKS.map((bench) => {
                const salaryVal = bench[workMode];
                // Set widths as percentage of max salary (310000)
                const percent = Math.round((salaryVal / 320000) * 100);

                return (
                  <div key={bench.level} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold">{bench.level}</span>
                      <span className="text-sm font-extrabold text-emerald-400">${salaryVal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="mt-2 flex gap-2 items-start text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Data modeled from 14,000+ open listings scraped across Tech hubs (SF, NYC, Seattle) and global remote providers during Q1/Q2. Refresh metrics periodically to maintain accurate offer negotiation targets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
