'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { useSession } from 'next-auth/react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Printer,
  FileText,
  ClipboardList,
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

export default function AppraisalsPage() {
  const { data: session } = useSession();
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection & Staging states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [appraisalTitle, setAppraisalTitle] = useState('H1 2026 Performance Self-Evaluation');
  const [appraisalType, setAppraisalType] = useState<'performance' | 'promotion'>('performance');

  // Compilation outcome states
  const [compiling, setCompiling] = useState(false);
  const [compiledNarrative, setCompiledNarrative] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAccomplishments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile/accomplishments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load accomplishments');
      
      const list = data.accomplishments || [];
      setAccomplishments(list);
      
      // Auto-select staged accomplishments by default
      const stagedIds = list
        .filter((a: Accomplishment) => a.visibility === 'staged_for_appraisal')
        .map((a: Accomplishment) => a.id);
      setSelectedIds(stagedIds);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAccomplishments();
    }
  }, [session, fetchAccomplishments]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === accomplishments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(accomplishments.map((a) => a.id));
    }
  };

  const handleCompile = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one accomplishment to stage for your appraisal review.');
      return;
    }
    setError('');
    setCompiling(true);
    setCompiledNarrative('');

    try {
      const res = await fetch('/api/profile/appraisal-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          title: appraisalTitle,
          type: appraisalType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compile appraisal narrative');

      if (data.success && data.content) {
        setCompiledNarrative(data.content);
        getNotificationManager().success('Appraisal Ready', `${appraisalTitle} narrative compiled`);
      }
    } catch (e: any) {
      setError(e.message);
      getNotificationManager().error('Compilation Failed', e.message ?? 'Could not compile appraisal');
    } finally {
      setCompiling(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <NavLayout
      title="Performance Appraisal Workspace"
      subtitle="Stage accomplishments, map them to competencies, and generate high-fidelity reviews ready to export."
    >
      <div className="p-8 max-w-7xl mx-auto space-y-8 print:p-0 print:max-w-full">
        
        {/* Printable section hidden from screen and styled strictly for media print */}
        {compiledNarrative && (
          <div className="hidden print:block text-slate-900 bg-white p-12 text-sm leading-relaxed max-w-4xl mx-auto space-y-6">
            <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
              <h1 className="text-3xl font-extrabold uppercase tracking-wider">{appraisalTitle}</h1>
              <p className="text-sm font-semibold text-slate-500 mt-2">
                Compiled by CareerPropel Autonomous Lifecycle Engine · {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="whitespace-pre-line prose prose-slate">
              {compiledNarrative}
            </div>
          </div>
        )}

        {/* Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
          
          {/* Left panel: Staging Workspace (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <a
                  href="/profile/accomplishments"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Journal Feed
                </a>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Appraisal Session Config
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Evaluation Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. H1 2026 Mid-Year Appraisal Review"
                    value={appraisalTitle}
                    onChange={(e) => setAppraisalTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Appraisal Cycle Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAppraisalType('performance')}
                      className={`px-4 py-3 rounded-xl text-xs font-bold uppercase transition ${
                        appraisalType === 'performance'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Self-Appraisal
                    </button>
                    <button
                      onClick={() => setAppraisalType('promotion')}
                      className={`px-4 py-3 rounded-xl text-xs font-bold uppercase transition ${
                        appraisalType === 'promotion'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Promotion Business Case
                    </button>
                  </div>
                </div>
              </div>

              {/* Accomplishment Staging list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Select Accomplishments ({selectedIds.length}/{accomplishments.length})</span>
                  <button
                    onClick={handleSelectAll}
                    className="text-indigo-400 hover:text-indigo-300 normal-case"
                  >
                    {selectedIds.length === accomplishments.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-900/60 rounded-xl text-xs text-red-200">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                  </div>
                ) : accomplishments.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-3">
                    <ClipboardList className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500">No logged milestones found.</p>
                    <a
                      href="/profile/accomplishments"
                      className="inline-block text-xs font-semibold text-indigo-400 hover:underline"
                    >
                      Log milestone in Journal feed →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    {accomplishments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleToggleSelect(a.id)}
                        className={`flex gap-3 items-start p-3 border rounded-xl cursor-pointer transition select-none ${
                          selectedIds.includes(a.id)
                            ? 'bg-slate-950 border-indigo-500/50'
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(a.id)}
                          onChange={() => {}} // Swallowed, parent onClick handles
                          className="mt-1 h-3.5 w-3.5 border-slate-700 bg-slate-900 rounded focus:ring-indigo-500"
                        />
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-200 line-clamp-1">
                            {a.title}
                          </h5>
                          {a.metrics && (
                            <span className="inline-block text-[10px] font-bold text-emerald-400">
                              {a.metrics}
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-500 font-medium">
                            {a.category} · {new Date(a.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleCompile}
                disabled={compiling || selectedIds.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition duration-200"
              >
                {compiling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    AI Compiling Review Narrative…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-200" />
                    Compile with AI Engine
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right panel: Live Generated Appraisal Workspace (7 cols) */}
          <div className="lg:col-span-7">
            {compiling ? (
              <div className="h-full min-h-[60vh] bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center">
                <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-slate-200">Generating Professional Self-Appraisal</h4>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Claude is synthesizing your staged metrics, aligning them by engineering core competencies, and drafting a high-impact narrative. This takes about 10-15 seconds.
                  </p>
                </div>
              </div>
            ) : compiledNarrative ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col min-h-[75vh]">
                
                {/* Workspace Header Actions */}
                <div className="flex items-center justify-between border-b border-slate-800 p-4">
                  <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    AI Compiled Draft
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Narrative
                        </>
                      )}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-md"
                    >
                      <Printer className="h-3.5 w-3.5 text-indigo-200" />
                      Export / Print PDF
                    </button>
                  </div>
                </div>

                {/* Workspace Content */}
                <div className="p-6 overflow-y-auto max-h-[65vh] whitespace-pre-line text-sm text-slate-300 leading-relaxed space-y-4 font-normal">
                  <div className="prose prose-invert max-w-none text-slate-300">
                    {compiledNarrative}
                  </div>
                </div>

                {/* Workspace Footer Info */}
                <div className="border-t border-slate-850 p-4 bg-slate-950/40 text-[10px] text-slate-500 text-right">
                  Preserved high-fidelity logged accomplishment metrics successfully. Staged in appraisal session database.
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[60vh] bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <ClipboardList className="h-16 w-16 text-slate-650" />
                <h4 className="text-lg font-semibold text-slate-300">Staging & Compilation workspace</h4>
                <p className="text-sm text-slate-500 max-w-sm">
                  Select your accomplished milestones from the left panel and click **Compile** to launch the AI generator. Your generated narrative will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
