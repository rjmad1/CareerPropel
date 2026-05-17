'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { FileText, Download, Copy, Check, Loader2, RefreshCw, Sparkles } from 'lucide-react';

type DocType = 'resume' | 'cover_letter';
type Tone = 'professional' | 'enthusiastic' | 'concise';

interface Job {
  id: string;
  title: string;
  company: string;
}

interface GeneratedDoc {
  title: string;
  content: string;
  wordCount: number;
  generatedAt: string;
}

interface HistoryEntry {
  doc: GeneratedDoc;
  type: DocType;
  jobTitle?: string;
}

export default function DocumentsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedDoc | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Form state
  const [docType, setDocType] = useState<DocType>('resume');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [focusAreas, setFocusAreas] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [activeHistory, setActiveHistory] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    fetch('/api/jobs?limit=50')
      .then((r) => r.json())
      .then((j) => setJobs(Array.isArray(j) ? j : j.data ?? []))
      .catch(() => {});
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError('');
    setResult(null);
    setActiveHistory(null);

    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: docType,
          jobId: selectedJobId || undefined,
          tone,
          focusAreas: focusAreas
            ? focusAreas.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined,
          additionalContext: additionalContext || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Generation failed');
      }

      const json = await res.json();
      const doc: GeneratedDoc = json.data ?? json;
      setResult(doc);

      const job = jobs.find((j) => j.id === selectedJobId);
      const entry: HistoryEntry = {
        doc,
        type: docType,
        jobTitle: job ? `${job.title} @ ${job.company}` : undefined,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }, [docType, selectedJobId, tone, focusAreas, additionalContext, jobs]);

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload(doc: GeneratedDoc) {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayedDoc = activeHistory?.doc ?? result;

  return (
    <NavLayout
      title="Document Generator"
      subtitle="AI-powered resume and cover letter tailored to each job"
    >
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-5">
            {/* Type selector */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Generate Document</h2>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['resume', 'cover_letter'] as DocType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setDocType(t)}
                      className={`py-2 px-3 text-sm font-medium rounded-lg border transition ${
                        docType === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {t === 'resume' ? '📄 Resume' : '✉️ Cover Letter'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tailor for Job (optional)
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General / No specific job</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company}
                    </option>
                  ))}
                </select>
              </div>

              {docType === 'cover_letter' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Tone</label>
                  <div className="space-y-1.5">
                    {([
                      ['professional', 'Professional', 'Confident and formal'],
                      ['enthusiastic', 'Enthusiastic', 'Warm and energetic'],
                      ['concise', 'Concise', 'Under 250 words, direct'],
                    ] as [Tone, string, string][]).map(([val, label, desc]) => (
                      <label key={val} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tone"
                          value={val}
                          checked={tone === val}
                          onChange={() => setTone(val)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="text-sm font-medium text-gray-800">{label}</span>
                          <span className="block text-xs text-gray-500">{desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Focus Areas (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. leadership, system design, ML"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Additional Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific points to highlight..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate with AI
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Session History
                </h3>
                <div className="space-y-2">
                  {history.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveHistory(entry)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                        activeHistory === entry
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <p className="font-medium text-gray-800 truncate">{entry.doc.title}</p>
                      {entry.jobTitle && (
                        <p className="text-gray-500 truncate">{entry.jobTitle}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-2">
            {displayedDoc ? (
              <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
                {/* Doc Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{displayedDoc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {displayedDoc.wordCount} words ·{' '}
                      {new Date(displayedDoc.generatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(displayedDoc.content)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDownload(displayedDoc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Download size={13} />
                      Download .md
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                    >
                      <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 leading-relaxed">
                    {displayedDoc.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-96 text-center p-8">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">No document generated yet</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Configure your options on the left and click{' '}
                  <strong>Generate with AI</strong> to create a tailored document.
                </p>
                {jobs.length === 0 && (
                  <p className="text-xs text-amber-600 mt-4 bg-amber-50 border border-amber-200 rounded px-3 py-2 max-w-xs">
                    Add jobs to your pipeline for better tailoring — the AI will use the job description
                    to optimise keywords.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
