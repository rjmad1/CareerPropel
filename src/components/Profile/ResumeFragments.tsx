'use client';

import React, { useState } from 'react';
import { ResumeFragment } from '@/types/profile';

interface ResumeFragmentsProps {
  fragments: ResumeFragment[];
  onAddFragment?: (fragment: Omit<ResumeFragment, 'id' | 'createdAt'>) => void;
  candidateId?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Fragments', icon: '📁' },
  { id: 'experience', label: 'Experience Bullets', icon: '💼' },
  { id: 'achievement', label: 'Achievements', icon: '🏆' },
  { id: 'project', label: 'Projects', icon: '🛠️' },
  { id: 'skill', label: 'Skill Snippets', icon: '🔑' },
];

export const ResumeFragments: React.FC<ResumeFragmentsProps> = ({
  fragments,
  onAddFragment,
  candidateId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Fragment form state
  const [showAddForm, setShowAddForm] = useState(false);
  type FragmentSection = 'experience' | 'achievement' | 'skill' | 'project';
  const SECTION_VALUES: FragmentSection[] = ['experience', 'achievement', 'skill', 'project'];
  const [newSection, setNewSection] = useState<FragmentSection>('experience');
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newJobTag, setNewJobTag] = useState('');

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  };

  const handleAddFragmentSubmit = () => {
    if (!newContent.trim()) return;
    if (onAddFragment) {
      onAddFragment({
        candidateId: candidateId ?? 'temp_candidate',
        section: newSection,
        content: newContent,
        sourceDocument: newSource || 'Imported Workspace Resume',
        jobRelevance: newJobTag ? [newJobTag] : ['Core Portfolio']
      });
    }

    setNewContent('');
    setNewSource('');
    setNewJobTag('');
    setShowAddForm(false);
  };

  const filteredFragments = fragments.filter((frag) => {
    const matchesCategory = selectedCategory === 'all' || frag.section === selectedCategory;
    const matchesSearch = 
      frag.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frag.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frag.jobRelevance.some(j => j.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8" data-cy="fragments-workspace">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Fragment Library</span>
          <h2 className="text-xl font-extrabold text-slate-100 mt-1">Tailored Resume Fragments</h2>
          <p className="text-xs text-slate-400 mt-1">Browse, search, and copy custom paragraphs optimized for specific target opportunities.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 transition-all duration-200 active:scale-95"
          data-cy="toggle-add-fragment-btn"
        >
          {showAddForm ? 'Close Form' : '+ Add Custom Fragment'}
        </button>
      </div>

      {/* Add Fragment Form */}
      {showAddForm && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-md" data-cy="new-fragment-form">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>💾</span> Store Tailored Snippet
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fragment Content</label>
                <textarea
                  placeholder="Paste the tailored paragraph or experience bullet..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none"
                  data-cy="new-fragment-content"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section Category</label>
                <select
                  value={newSection}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    if (SECTION_VALUES.includes(val as FragmentSection)) {
                      setNewSection(val as FragmentSection);
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="experience">Experience Bullet</option>
                  <option value="achievement">Achievement Highlight</option>
                  <option value="project">Project Description</option>
                  <option value="skill">Skill Snippet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Source / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Master Resume 2026"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Job / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix Staff UI"
                  value={newJobTag}
                  onChange={(e) => setNewJobTag(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
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
              onClick={handleAddFragmentSubmit}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/10"
              data-cy="save-fragment-btn"
            >
              Save Fragment
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search fragments by keyword, source, or job tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition duration-200"
            data-cy="fragments-search-input"
          />
          <span className="absolute left-3.5 top-3 text-slate-500 text-xs select-none">🔍</span>
        </div>

        {/* Categories Grid */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
                data-cy={`category-btn-${cat.id}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fragments Catalog Grid */}
      <div className="grid grid-cols-1 gap-6" data-cy="fragments-container">
        {filteredFragments.length > 0 ? (
          filteredFragments.map((frag) => {
            const isCopied = copiedId === frag.id;
            return (
              <div
                key={frag.id}
                className="bg-slate-950/20 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition duration-200 flex flex-col md:flex-row gap-6 justify-between items-start"
                data-cy={`fragment-card-${frag.id}`}
              >
                <div className="space-y-4 flex-1">
                  {/* Category & Tags Header */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold uppercase rounded-md tracking-wider">
                      {frag.section}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Source: {frag.sourceDocument}
                    </span>
                  </div>

                  {/* Snippet Block */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 border border-slate-900/60 rounded-xl p-4">
                    {frag.content}
                  </p>

                  {/* Tailored job chips */}
                  {frag.jobRelevance && frag.jobRelevance.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tailored for:</span>
                      {frag.jobRelevance.map((job, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 rounded-md text-[9px] font-bold tracking-wide"
                        >
                          💼 {job}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Drawer */}
                <div className="shrink-0 flex md:flex-col gap-3 justify-end items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-900">
                  <button
                    onClick={() => handleCopy(frag.id, frag.content)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center ${
                      isCopied
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/5'
                    }`}
                    data-cy={`copy-fragment-btn-${frag.id}`}
                  >
                    <span>{isCopied ? '✔️' : '📋'}</span>
                    <span>{isCopied ? 'Copied!' : 'Copy Snippet'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
            <span className="text-2xl mb-3 block">🗂️</span>
            <h4 className="text-slate-300 font-bold text-sm">No tailored fragments found</h4>
            <p className="text-xs text-slate-500 mt-1">Try switching categories or adjust your keywords search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeFragments;
