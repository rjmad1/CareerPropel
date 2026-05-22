'use client';

import React, { useState } from 'react';
import { FileText, Plus, Eye, Scale, Trash2, Copy, Sparkles } from 'lucide-react';

export interface ResumeVariant {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  matchScore: number;
  wordCount: number;
  lastUpdated: string;
  content: string;
}

interface VariantManagerProps {
  variants: ResumeVariant[];
  selectedVariantId: string;
  onSelectVariant: (id: string) => void;
  onCreateVariant: (name: string, description: string, targetRole: string) => void;
  onDeleteVariant: (id: string) => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
  onCreateVariant,
  onDeleteVariant,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRole, setNewRole] = useState('');
  const [compareId, setCompareId] = useState<string | null>(null);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const compareVariant = variants.find((v) => v.id === compareId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    onCreateVariant(trimmedName, newDesc.trim(), newRole.trim());
    setNewName('');
    setNewDesc('');
    setNewRole('');
    setIsCreating(false);
  };

  return (
    <div
      className="bg-[#0b0f19] border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6"
      data-cy="variant-manager-workspace"
      role="region"
      aria-label="Resume Variant Manager"
    >
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            Resume Variants
          </span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Version Controller & Compare
          </h3>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          aria-expanded={isCreating}
          aria-controls="create-variant-form"
          className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500/20 active:scale-95 transition-all duration-200"
          data-cy="toggle-create-variant-btn"
        >
          <Plus className="w-3.5 h-3.5" /> New Variant
        </button>
      </div>

      {isCreating && (
        <form
          id="create-variant-form"
          onSubmit={handleSubmit}
          className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top duration-200"
          data-cy="create-variant-form"
          aria-label="Create new resume variant"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Variant Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Staff Frontend Architect"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                data-cy="variant-name-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Role</label>
              <input
                type="text"
                required
                placeholder="e.g. Netflix Senior UI Architect"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                data-cy="variant-role-input"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Description</label>
            <textarea
              placeholder="e.g. Focused heavily on high-concurrency architectures, system telemetry, and E2E test suites."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-indigo-500 transition resize-none"
              data-cy="variant-desc-input"
            />
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 border border-slate-800 text-slate-400 rounded-xl hover:border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-500 text-slate-100 rounded-xl font-bold hover:bg-indigo-650 transition"
              data-cy="save-variant-btn"
            >
              Create Version
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List of variants */}
        <div
          className="lg:col-span-5 space-y-3.5 max-h-[380px] overflow-y-auto pr-1"
          role="list"
          aria-label="Resume variants"
        >
          {variants.map((v) => {
            const isSelected = v.id === selectedVariantId;
            const isComparing = v.id === compareId;
            return (
              <div
                key={v.id}
                role="listitem"
                tabIndex={0}
                aria-current={isSelected ? 'true' : undefined}
                aria-label={`${v.name} — ${v.targetRole}. Match score: ${v.matchScore}%. ${isSelected ? 'Currently selected.' : ''}`}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                    : isComparing
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-900 bg-slate-950/30 hover:border-slate-800'
                }`}
                onClick={() => onSelectVariant(v.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectVariant(v.id); } }}
                data-cy={`variant-card-${v.id}`}
                data-selected={isSelected ? 'true' : 'false'}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-extrabold tracking-wider uppercase">
                      {v.targetRole}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {v.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{v.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      v.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {v.matchScore}% Fit
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[9px] text-slate-550 border-t border-slate-900/60 pt-2">
                  <span aria-label={`${v.wordCount} words`}>{v.wordCount} words</span>
                  <div className="flex gap-2" role="group" aria-label="Variant actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareId(compareId === v.id ? null : v.id);
                      }}
                      aria-pressed={isComparing}
                      aria-label={`${isComparing ? 'Stop comparing' : 'Compare'} ${v.name}`}
                      className={`p-1 rounded hover:bg-slate-900 transition ${isComparing ? 'text-emerald-400' : 'text-slate-500'}`}
                      title="Toggle Side-by-Side Comparison"
                      data-cy={`compare-btn-${v.id}`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                    {variants.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteVariant(v.id);
                        }}
                        aria-label={`Delete variant: ${v.name}`}
                        className="p-1 rounded text-red-500/60 hover:text-red-400 hover:bg-slate-900 transition"
                        title="Delete Variant"
                        data-cy={`delete-btn-${v.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected variant details or side-by-side comparison */}
        <div className="lg:col-span-7 bg-[#080b12] border border-slate-900/80 rounded-2xl p-4 min-h-[300px] flex flex-col justify-between">
          {compareVariant ? (
            <div className="space-y-4 animate-in fade-in duration-200" data-cy="comparison-view">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase text-emerald-400">
                <Scale className="w-4 h-4" /> Side-by-Side Comparison Matrix
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 space-y-2">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Primary variant</span>
                  <h5 className="font-extrabold text-xs text-indigo-400">{activeVariant.name}</h5>
                  <div className="text-[10px] text-slate-400 leading-relaxed max-h-[220px] overflow-y-auto font-mono whitespace-pre-wrap">
                    {activeVariant.content}
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-emerald-500/10 rounded-xl p-3 space-y-2">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Compared variant</span>
                  <h5 className="font-extrabold text-xs text-emerald-400">{compareVariant.name}</h5>
                  <div className="text-[10px] text-slate-400 leading-relaxed max-h-[220px] overflow-y-auto font-mono whitespace-pre-wrap">
                    {compareVariant.content}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCompareId(null)}
                  className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 text-[10px] font-bold rounded-xl transition"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-1.5">
                      {activeVariant.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{activeVariant.description}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(activeVariant.content);
                        } catch (err) {
                          console.error('Clipboard write failed:', err);
                        }
                      }}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-450 hover:text-slate-200 transition"
                      title="Copy Entire Content"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 border border-slate-900 rounded-xl p-3 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Integrity Score</span>
                    <span className="font-bold text-indigo-400 mt-0.5 block">{activeVariant.matchScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Word Count</span>
                    <span className="font-bold text-slate-300 mt-0.5 block">{activeVariant.wordCount} words</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Last Tailored</span>
                    <span className="font-bold text-slate-400 mt-0.5 block">{activeVariant.lastUpdated}</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-550 block mb-1">Tailoring Suggestions</span>
                  <div className="flex gap-2 items-center bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2 text-[10px] text-indigo-300">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>This variant highlights your **Cypress E2E** capabilities beautifully. Ideal for staff-level applications.</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900/60 pt-4 mt-2 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 italic">Select variant on the left to edit or compare.</span>
                <button
                  onClick={() => onSelectVariant(activeVariant.id)}
                  className="px-3.5 py-1.5 bg-indigo-500 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-indigo-650 transition active:scale-95 duration-200"
                >
                  <Eye className="w-3.5 h-3.5" /> Open in Editor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
