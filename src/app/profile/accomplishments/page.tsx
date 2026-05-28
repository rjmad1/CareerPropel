'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Plus,
  Trash2,
  Edit3,
  Zap,
  Sparkles,
  Loader2,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface Accomplishment {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  metrics: string | null;
  starContext: string | null;
  visibility: string;
}

export default function AccomplishmentsPage() {
  const { data: session } = useSession();
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Project');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formMetrics, setFormMetrics] = useState('');
  const [formStarContext, setFormStarContext] = useState('');
  const [formVisibility, setFormVisibility] = useState('private');

  // AI states
  const [aiQuantifying, setAiQuantifying] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAccomplishments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile/accomplishments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load accomplishments');
      setAccomplishments(data.accomplishments || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAccomplishments();
    }
  }, [session, fetchAccomplishments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      id: editingId,
      title: formTitle,
      category: formCategory,
      date: new Date(formDate).toISOString(),
      description: formDescription,
      metrics: formMetrics || null,
      starContext: formStarContext || null,
      visibility: formVisibility,
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/profile/accomplishments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save accomplishment');
      
      setIsFormOpen(false);
      resetForm();
      fetchAccomplishments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    }
  };

  const handleEdit = (a: Accomplishment) => {
    setEditingId(a.id);
    setFormTitle(a.title);
    setFormCategory(a.category);
    setFormDate(new Date(a.date).toISOString().split('T')[0]);
    setFormDescription(a.description);
    setFormMetrics(a.metrics || '');
    setFormStarContext(a.starContext || '');
    setFormVisibility(a.visibility);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    setError('');
    try {
      const res = await fetch(`/api/profile/accomplishments?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete accomplishment');
      fetchAccomplishments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    }
  };

  const handleAIQuantify = async () => {
    if (!formTitle || !formDescription) {
      setError('Please provide a title and draft description first for AI refinement.');
      return;
    }
    setError('');
    setAiQuantifying(true);
    setAiSuccess(false);

    try {
      const res = await fetch('/api/profile/quantify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: formCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI refinement failed');

      if (data.success && data.data) {
        setFormTitle(data.data.title);
        setFormDescription(data.data.refinedDescription);
        setFormMetrics(data.data.metrics);
        setFormStarContext(data.data.starContext);
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 3000);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setAiQuantifying(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Project');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setFormMetrics('');
    setFormStarContext('');
    setFormVisibility('private');
    setError('');
  };

  const filteredAccomplishments = accomplishments.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.metrics && a.metrics.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <NavLayout
      title="Accomplishment Journal"
      subtitle="Stash, quantify, and stage your career highlights to build annual reviews and perfect resumes."
    >
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Callouts */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              Continuous Performance Appraisal Engine
            </h3>
            <p className="text-sm text-slate-400">
              Land your target role, keep logging, and generate seamless annual reviews.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/profile/appraisals"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition duration-200"
            >
              Appraisal Workspace
              <ChevronRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition duration-200"
            >
              <Plus className="h-4 w-4" />
              Log Achievement
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-sm text-red-200 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Quick Add / Edit Form Drawer overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-xl font-semibold text-slate-100">
                  {editingId ? 'Edit Achievement Highlight' : 'New Achievement Highlight'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Launched latency optimizer for server architecture"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="Project">Project Delivery</option>
                      <option value="Leadership">Team Leadership & Mentoring</option>
                      <option value="Process Improvement">Process Optimization</option>
                      <option value="Mentorship">Technical Mentorship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Visibility Stage
                    </label>
                    <select
                      value={formVisibility}
                      onChange={(e) => setFormVisibility(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="private">Private (Only Me)</option>
                      <option value="staged_for_appraisal">Staged for Performance Review</option>
                      <option value="public">Public Portfolio Showcase</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Draft Description (Markdown supported)
                    </label>
                    <button
                      type="button"
                      onClick={handleAIQuantify}
                      disabled={aiQuantifying}
                      className="px-3 py-1 bg-indigo-950 border border-indigo-700/60 text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-900 disabled:opacity-50 flex items-center gap-1.5 transition"
                    >
                      {aiQuantifying ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                          Quantifying…
                        </>
                      ) : aiSuccess ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 animate-bounce" />
                          Quantified!
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 text-indigo-400" />
                          AI Quantify (STAR)
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what you built/optimized. E.g. Configured compression middlewares on our express API. Reduced server loading and page loading speeds. Led two backend junior devs on deployment."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Key Metric Outcome
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +40% page load speed or Saved $3k/month"
                      value={formMetrics}
                      onChange={(e) => setFormMetrics(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      STAR Narrative Context (AI Generated)
                    </label>
                    <input
                      type="text"
                      placeholder="Situation, Task, Action, and Result synthesis"
                      value={formStarContext}
                      onChange={(e) => setFormStarContext(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition"
                  >
                    Save Highlight
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['all', 'Project', 'Leadership', 'Process Improvement', 'Mentorship'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Milestones' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search accomplishments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Core Accomplishment List / Timeline */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Synchronizing professional database milestones…</p>
          </div>
        ) : filteredAccomplishments.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <Layers className="h-16 w-16 text-slate-600 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No milestones logged yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
              Start building your post-hire career capital! Log weekly code commits, key project deployments, and process optimizations.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition"
            >
              Add Your First Milestone
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAccomplishments.map((a) => (
              <div
                key={a.id}
                className="group relative bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-6 transition duration-300 shadow-xl flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-4 flex-1">
                  
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
                      {a.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(a.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        a.visibility === 'staged_for_appraisal'
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : a.visibility === 'public'
                          ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {a.visibility === 'staged_for_appraisal'
                        ? 'Staged for Review'
                        : a.visibility === 'public'
                        ? 'Showcase Portfolio'
                        : 'Private Log'}
                    </span>
                  </div>

                  {/* Title & Narrative */}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition">
                      {a.title}
                    </h4>
                    {a.metrics && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 rounded-xl text-xs font-bold shadow-sm">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Outcome: {a.metrics}
                      </div>
                    )}
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line pt-2">
                      {a.description}
                    </p>
                    {a.starContext && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mt-3 text-xs text-slate-400 italic">
                        <span className="font-semibold text-indigo-400 not-italic block mb-1">
                          STAR Context Summary:
                        </span>
                        {a.starContext}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-end items-start md:items-end gap-3 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition shadow-sm"
                    title="Edit Milestones"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-900/50 rounded-xl transition shadow-sm"
                    title="Delete Milestone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NavLayout>
  );
}
