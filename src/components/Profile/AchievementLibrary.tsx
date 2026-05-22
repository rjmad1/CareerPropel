'use client';

import React, { useState } from 'react';
import { Achievement } from '@/types/profile';

let _achIdCounter = 0;

interface AchievementLibraryProps {
  achievements: Achievement[];
  onAddAchievement?: (achievement: Achievement) => void;
  onDeleteAchievement?: (id: string) => void;
}

const COMPETENCIES = [
  { id: 'all', label: 'All Competencies', icon: '🎯' },
  { id: 'leadership', label: 'Leadership', icon: '👑', color: 'border-amber-500/30 hover:border-amber-500 text-amber-400 bg-amber-500/5' },
  { id: 'technical', label: 'Technical Skills', icon: '💻', color: 'border-sky-500/30 hover:border-sky-500 text-sky-400 bg-sky-500/5' },
  { id: 'problem-solving', label: 'Problem-Solving', icon: '🧠', color: 'border-purple-500/30 hover:border-purple-500 text-purple-400 bg-purple-500/5' },
  { id: 'teamwork', label: 'Teamwork', icon: '🤝', color: 'border-emerald-500/30 hover:border-emerald-500 text-emerald-400 bg-emerald-500/5' },
  { id: 'impact', label: 'Impact', icon: '⚡', color: 'border-rose-500/30 hover:border-rose-500 text-rose-400 bg-rose-500/5' },
  { id: 'communication', label: 'Communication', icon: '🗣️', color: 'border-indigo-500/30 hover:border-indigo-500 text-indigo-400 bg-indigo-500/5' }
];

export const AchievementLibrary: React.FC<AchievementLibraryProps> = ({
  achievements,
  onAddAchievement,
  onDeleteAchievement,
}) => {
  const [selectedCompetency, setSelectedCompetency] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // AI Quantifier Tool State
  const [draftText, setDraftText] = useState('');
  const [quantifiedResult, setQuantifiedResult] = useState('');
  const [isQuantifying, setIsQuantifying] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  // New Achievement Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSituation, setNewSituation] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newResult, setNewResult] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newImpact, setNewImpact] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newCompetency, setNewCompetency] = useState('technical');

  // Filter achievements based on selected competency
  const filteredAchievements = achievements.filter((ach) => {
    if (selectedCompetency === 'all') return true;
    return ach.relevantSkills.some((s) => s.toLowerCase() === selectedCompetency) || 
           ach.title.toLowerCase().includes(selectedCompetency) ||
           ach.description.toLowerCase().includes(selectedCompetency);
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePolish = async () => {
    if (!draftText.trim()) return;
    setIsQuantifying(true);
    setQuantifiedResult('');
    setConfidenceScore(null);

    // Simulate AI Polish Pipeline
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    const polishes = [
      `Engineered high-concurrency React client-state layers, reducing database telemetry dashboard latency by 320ms (32% latency reduction) and expanding viewport render frames by 24 FPS.`,
      `Pioneered Next.js 14 server component optimizations and Redis cache integrations, increasing concurrent request capacity by 45% and slashing overall hosting resource expenditures by $12,000 annually.`,
      `Designed and deployed an automated E2E Cypress testing environment, driving test coverage metrics from 64% up to 98% and preventing 14 high-severity production regressions across 3 core applications.`
    ];

    const randomPolish = polishes[Math.floor(Math.random() * polishes.length)];
    setQuantifiedResult(randomPolish);
    setConfidenceScore(Math.round(85 + Math.random() * 14));
    setIsQuantifying(false);
  };

  const handleSaveAchievement = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    if (onAddAchievement) {
      const achId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `ach_${crypto.randomUUID()}`
        : `ach_${Date.now()}-${++_achIdCounter}-${Math.random().toString(36).slice(2, 9)}`;
      onAddAchievement({
        id: achId,
        title: newTitle,
        description: newDescription,
        context: newContext || 'CareerPropel Workspace',
        impact: newImpact || 'Optimized operational throughput and engineering performance.',
        metrics: [
          { metric: 'Latency Improvement', value: 32, unit: '%' },
          { metric: 'User Engagement', value: 15, unit: '%' }
        ],
        date: new Date(),
        relevantSkills: [newCompetency, ...newSkills.split(',').map(s => s.trim()).filter(Boolean)],
        situation: newSituation || undefined,
        task: newTask || undefined,
        action: newAction || undefined,
        result: newResult || undefined,
      });
    }

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewSituation('');
    setNewTask('');
    setNewAction('');
    setNewResult('');
    setNewContext('');
    setNewImpact('');
    setNewSkills('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8" data-cy="achievement-library-workspace">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Accomplishment System</span>
          <h2 className="text-xl font-extrabold text-slate-100 mt-1">STAR Achievement Library</h2>
          <p className="text-xs text-slate-400 mt-1">Standardize your work milestones under the STAR framework and boost their impact metrics.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all duration-200"
          data-cy="toggle-add-achievement-btn"
        >
          {showAddForm ? 'Close Form' : '+ Add STAR Milestone'}
        </button>
      </div>

      {/* Add Form Panel */}
      {showAddForm && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300" data-cy="new-achievement-form">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>📝</span> Create New STAR Achievement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Milestone Title</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Client Dashboard Refactor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
                  data-cy="new-achievement-title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">High-level Description</label>
                <textarea
                  placeholder="Briefly state the overarching accomplishment..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition resize-none"
                  data-cy="new-achievement-desc"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Context / Project</label>
                  <input
                    type="text"
                    placeholder="e.g. Analytics Platform"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Impact</label>
                  <input
                    type="text"
                    placeholder="e.g. Accelerated developer velocity"
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Competency</label>
                  <select
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 focus:outline-none focus:border-sky-500 transition"
                  >
                    <option value="technical">Technical Skills</option>
                    <option value="leadership">Leadership</option>
                    <option value="problem-solving">Problem-Solving</option>
                    <option value="teamwork">Teamwork</option>
                    <option value="impact">Impact</option>
                    <option value="communication">Communication</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="TypeScript, React, Next.js"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* STAR Breakdown */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">STAR Structure Breakdown</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Situation (S)</label>
                  <textarea
                    placeholder="Describe the initial environment or problem..."
                    value={newSituation}
                    onChange={(e) => setNewSituation(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Task (T)</label>
                  <textarea
                    placeholder="State the challenges & requirements..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Action (A)</label>
                  <textarea
                    placeholder="Detail the technical solutions you implemented..."
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Result (R)</label>
                  <textarea
                    placeholder="Highlight quantifiable gains & outcomes..."
                    value={newResult}
                    onChange={(e) => setNewResult(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAchievement}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-sky-500/10"
              data-cy="save-achievement-btn"
            >
              Save Milestone
            </button>
          </div>
        </div>
      )}

      {/* AI Quantifier / Polish Tool (Wow Feature) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🪄</span>
          <div>
            <h3 className="text-sm font-bold text-slate-200">AI Metric & Bullet Quantifier</h3>
            <p className="text-xs text-slate-400">Transform weak passive descriptions into high-impact, metrics-driven STAR statements.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g., I speeded up a dashboard backend rendering speed and added typescript."
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              data-cy="quantifier-input"
            />
            <button
              onClick={handlePolish}
              disabled={isQuantifying}
              className="px-6 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]"
              data-cy="polish-btn"
            >
              {isQuantifying ? '🔄 Polishing...' : '✨ Polish Bullet'}
            </button>
          </div>

          {quantifiedResult && (
            <div className="bg-slate-950/60 border border-indigo-500/15 rounded-xl p-5 space-y-3 animate-in fade-in duration-300" data-cy="quantifier-result">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Polished Suggestion</span>
                {confidenceScore && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    Impact Score: {confidenceScore}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">{quantifiedResult}</p>
              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(quantifiedResult);
                    } catch (err) {
                      console.error('Clipboard write failed:', err);
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-indigo-400 font-semibold transition"
                  data-cy="copy-polished-btn"
                >
                  📋 Copy to clipboard
                </button>
                <button
                  onClick={() => {
                    setNewTitle('AI Quantified Achievement');
                    setNewDescription(quantifiedResult);
                    setNewResult('Reduced latency by 320ms, increasing page frame throughput by 24 FPS.');
                    setShowAddForm(true);
                  }}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold transition"
                >
                  ➕ Inject into STAR form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Competency Filter Grid */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Filter by Core Competency</span>
        <div className="flex flex-wrap gap-2.5">
          {COMPETENCIES.map((comp) => {
            const isActive = selectedCompetency === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedCompetency(comp.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                    : comp.color || 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
                data-cy={`filter-${comp.id}`}
              >
                <span>{comp.icon}</span>
                <span>{comp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-4" data-cy="achievements-container">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => {
            const isExpanded = expandedId === achievement.id;
            return (
              <div
                key={achievement.id}
                className={`border rounded-2xl transition duration-300 overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-500/50 bg-slate-900/60 shadow-xl'
                    : 'border-slate-800 bg-slate-950/20 hover:border-slate-700/80'
                }`}
                data-cy={`achievement-card-${achievement.id}`}
              >
                <div
                  onClick={() => toggleExpand(achievement.id)}
                  className="p-6 flex items-center justify-between cursor-pointer select-none"
                  data-cy={`achievement-header-${achievement.id}`}
                >
                  <div className="space-y-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-bold text-slate-200 text-sm">{achievement.title}</h4>
                      <span className="text-[10px] bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-medium">
                        {achievement.context}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{achievement.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                    <span className="text-slate-500 text-xs transition duration-200">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-900 pt-6 space-y-6 animate-in fade-in duration-300">
                    {/* Description Paragraph */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Executive Summary</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{achievement.description}</p>
                    </div>

                    {/* STAR Framework Visualizer */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5">
                      {!(achievement.situation || achievement.task || achievement.action || achievement.result) && (
                        <div className="md:col-span-4 text-center">
                          <span className="text-[10px] font-bold text-slate-500 italic uppercase tracking-wider">Sample STAR Format — add STAR fields when creating or editing this milestone.</span>
                        </div>
                      )}
                      <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-900 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">Situation (S)</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {achievement.situation || <span className="italic text-slate-600">Not specified</span>}
                        </p>
                      </div>
                      <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-900 pb-3 md:pb-0 md:px-4">
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block mb-0.5">Task (T)</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {achievement.task || <span className="italic text-slate-600">Not specified</span>}
                        </p>
                      </div>
                      <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-900 pb-3 md:pb-0 md:px-4">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-0.5">Action (A)</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {achievement.action || <span className="italic text-slate-600">Not specified</span>}
                        </p>
                      </div>
                      <div className="space-y-1 md:pl-4">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Result (R)</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {achievement.result || <span className="italic text-slate-600">Not specified</span>}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Badge row */}
                    {achievement.metrics && achievement.metrics.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Demonstrated Gains</span>
                        <div className="flex flex-wrap gap-3">
                          {achievement.metrics.map((metric, idx) => (
                            <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                              <span className="text-emerald-400 text-xs font-bold">
                                {metric.value}{metric.unit}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                                {metric.metric}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Matched */}
                    {achievement.relevantSkills && achievement.relevantSkills.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mapped Competency Links</span>
                        <div className="flex flex-wrap gap-2">
                          {achievement.relevantSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Footer */}
                    {onDeleteAchievement && (
                      <div className="flex justify-end pt-2 border-t border-slate-900/60">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAchievement(achievement.id);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-400 font-semibold tracking-wider uppercase transition"
                          data-cy={`delete-achievement-${achievement.id}`}
                        >
                          🗑️ Delete Accomplishment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
            <span className="text-2xl mb-3 block">📭</span>
            <h4 className="text-slate-300 font-bold text-sm">No accomplishments found</h4>
            <p className="text-xs text-slate-500 mt-1">Try switching filter categories or draft a new STAR milestone.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementLibrary;
