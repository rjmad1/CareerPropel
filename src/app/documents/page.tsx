'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Input, Textarea, Card, CardBody, Select } from '@/components/ui';
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';

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
          focusAreas: focusAreas ? focusAreas.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
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
      setHistory((prev) => [{ doc, type: docType, jobTitle: job ? `${job.title} @ ${job.company}` : undefined }, ...prev].slice(0, 10));
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

  const jobOptions = [
    { value: '', label: 'General / No specific job' },
    ...jobs.map((j) => ({
      value: j.id,
      label: `${j.title} — ${j.company}`,
    })),
  ];

  return (
    <NavLayout
      title="Document Generator"
      subtitle="AI-powered resume and cover letter tailored to each job"
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card>
              <CardBody className="p-6 flex flex-col gap-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Generate Document
                </h2>

                {/* Type Selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Document Type
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDocType('resume')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        docType === 'resume'
                          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocType('cover_letter')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        docType === 'cover_letter'
                          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Cover Letter
                    </button>
                  </div>
                </div>

                {/* Job selection */}
                <Select
                  label="Tailor for Job (optional)"
                  value={selectedJobId}
                  options={jobOptions}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                />

                {/* Tone (cover letter only) */}
                {docType === 'cover_letter' && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Tone
                    </span>
                    <div className="flex flex-col gap-2">
                      {([
                        ['professional', 'Professional', 'Confident and formal'],
                        ['enthusiastic', 'Enthusiastic', 'Warm and energetic'],
                        ['concise', 'Concise', 'Under 250 words, direct'],
                      ] as [Tone, string, string][]).map(([val, label, desc]) => {
                        const isSelected = tone === val;
                        return (
                          <label
                            key={val}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                                : 'border-slate-100 hover:border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name="tone"
                              value={val}
                              checked={isSelected}
                              onChange={(e) => setTone(e.target.value as Tone)}
                              className="mt-1 h-4 w-4 text-blue-600 border-slate-350 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <div className="flex flex-col">
                              <span className={`text-sm font-semibold leading-none ${
                                isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {label}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                                {desc}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Input
                  label="Focus Areas (comma-separated)"
                  placeholder="leadership, system design, ML"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                />

                <Textarea
                  label="Additional Context"
                  placeholder="Any specific points to highlight..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={3}
                />

                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 mt-2"
                  onClick={handleGenerate}
                  loading={generating}
                >
                  {!generating && <Sparkles className="w-4 h-4" />}
                  {generating ? 'Generating…' : 'Generate with AI'}
                </Button>

                {error && (
                  <div className="flex items-start justify-between p-3.5 text-sm text-red-800 border border-red-100 bg-red-50/50 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" role="alert">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button onClick={() => setError('')} className="p-1 hover:bg-red-150 dark:hover:bg-red-900/50 rounded text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* History Panel */}
            {history.length > 0 && (
              <Card>
                <CardBody className="p-5 flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Session History
                  </h3>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {history.map((entry, i) => {
                      const isSelected = activeHistory === entry;
                      return (
                        <div
                          key={i}
                          onClick={() => setActiveHistory(entry)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-155 ${
                            isSelected
                              ? 'border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10'
                              : 'border-slate-105 hover:bg-slate-50 bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                            {entry.doc.title}
                          </span>
                          {entry.jobTitle && (
                            <span className="text-2xs text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                              {entry.jobTitle}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Side: Output */}
          <div className="lg:col-span-8">
            {displayedDoc ? (
              <Card className="h-full flex flex-col">
                {/* Header Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-lg">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {displayedDoc.title}
                    </h3>
                    <span className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 block">
                      {displayedDoc.wordCount} words · {new Date(displayedDoc.generatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={copied ? 'text-green-600 border-green-200 bg-green-50' : ''}
                      onClick={() => handleCopy(displayedDoc.content)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      onClick={() => handleDownload(displayedDoc)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      onClick={handleGenerate}
                      disabled={generating}
                      loading={generating}
                    >
                      {!generating && <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Regenerate</span>
                    </Button>
                  </div>
                </div>

                {/* Main Content Pane */}
                <CardBody className="p-6 flex-1 flex flex-col min-h-[450px]">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/40 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[350px] max-h-[60vh] overflow-y-auto">
                      {displayedDoc.content}
                    </pre>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-205 dark:border-slate-800 rounded-2xl p-12 text-center bg-white dark:bg-slate-900 min-h-[480px]">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No document generated yet
                </h3>
                <p className="text-sm text-slate-550 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
                  Configure your options on the left and click <strong>Generate with AI</strong> to create a tailored document instantly.
                </p>
                {jobs.length === 0 && (
                  <div className="flex items-start gap-3 p-4 text-sm text-amber-800 border border-amber-100 bg-amber-50/50 rounded-xl dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 max-w-md text-left">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Add jobs to your pipeline for better tailoring — the AI will use the job description to optimize keywords.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
