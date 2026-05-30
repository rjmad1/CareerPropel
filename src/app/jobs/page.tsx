'use client';

import React, { useState, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';
import { Job, JobStage } from '@/types/job';
import { MoveResult } from '@/hooks/useJobBoard';
import { getNotificationManager } from '@/lib/notifications/manager';
import { sanitizeText, sanitizeUrl } from '@/lib/security/sanitizeContent';
import { Plus, Upload as LucideUpload } from 'lucide-react';
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Checkbox,
} from '@/components/ui';
import { parseJobsState, buildUrl } from '@/lib/navigation/state';
import { useRestorableScroll } from '@/hooks/useRestorableScroll';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchJobs(): Promise<Job[]> {
  const res = await fetch('/api/jobs?limit=200');
  if (!res.ok) throw new Error('Failed to load jobs');
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? [];
}

async function patchJob(jobId: string, updates: Partial<Job>): Promise<Job> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to update job');
  }
  const json = await res.json();
  return json.data ?? json;
}

async function moveJobStage(jobId: string, newStage: JobStage): Promise<MoveResult> {
  const res = await fetch(`/api/jobs/${jobId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage: newStage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to move job');
  }
  const json = await res.json();
  return { success: true, agentType: json.agentType ?? null, executionId: json.executionId ?? null };
}

const AGENT_LABELS: Record<string, string> = {
  'job-match':      'Job Match',
  'resume-tailor':  'Resume Tailor',
  'research':       'Company Research',
  'interview-prep': 'Interview Prep',
  'follow-up':      'Follow-Up',
  'networking':     'Networking',
};

async function createJob(input: { title: string; company: string; url?: string }): Promise<Job> {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, stage: 'sourced' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to add job');
  }
  const json = await res.json();
  return json.data ?? json;
}

// ─── Inner page (needs Suspense for useSearchParams) ─────────────────────────

function JobsContent() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // ── URL state (canonical for filters/selected job) ──
  const urlState = parseJobsState(searchParams);
  const selectedJobId = urlState.job || null;

  function setSelectedJobId(id: string | null) {
    const next = buildUrl(pathname, { job: id }, searchParams);
    router.replace(next, { scroll: false });
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Scroll restoration for the kanban board
  useRestorableScroll({ key: '/jobs' });

  const { data: jobs = [], error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    enabled: status === 'authenticated',
  });

  const updateMutation = useMutation({
    mutationFn: ({ jobId, updates }: { jobId: string; updates: Partial<Job> }) =>
      patchJob(jobId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleJobUpdate = async (jobId: string, updates: Partial<Job>) => {
    await updateMutation.mutateAsync({ jobId, updates });
  };

  const handleJobMove = async (jobId: string, newStage: string): Promise<MoveResult> => {
    const result = await moveJobStage(jobId, newStage as JobStage);
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    if (result.agentType) {
      const label = AGENT_LABELS[result.agentType] ?? result.agentType;
      const stageName = newStage.replaceAll('_', ' ');
      getNotificationManager().notify(
        'info',
        `${label} agent triggered`,
        `Moving to "${stageName}" — ${label} is running in the background.`,
        { duration: 5000 },
      );
    }
    return result;
  };

  const stats = {
    total:    jobs.length,
    active:   jobs.filter((j) => j.stage !== 'rejected' && j.stage !== 'archived' && j.stage !== 'offer').length,
    offers:   jobs.filter((j) => j.stage === 'offer').length,
    rejected: jobs.filter((j) => j.stage === 'rejected').length,
  };

  return (
    <NavLayout title="Job Pipeline" subtitle="Drag jobs between stages to move them forward">
      <div className="h-full flex flex-col min-h-0 bg-slate-50">
        {/* Unified Sub-Header Toolbar */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Stats indicators */}
          <div className="flex flex-wrap items-center gap-4">
            {[
              { label: 'Total',    value: stats.total,    color: 'text-slate-900 border-slate-200 bg-slate-50' },
              { label: 'Active',   value: stats.active,   color: 'text-blue-700 border-blue-100 bg-blue-50/50' },
              { label: 'Offers',   value: stats.offers,   color: 'text-emerald-700 border-emerald-100 bg-emerald-50/50' },
              { label: 'Rejected', value: stats.rejected, color: 'text-rose-700 border-rose-100 bg-rose-50/50' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${color}`}>
                <span>{label}:</span>
                <span className="font-bold text-sm">{value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-xs"
              type="button"
            >
              <LucideUpload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Import Jobs</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 bg-rose-50 border-b border-rose-100 px-6 py-3 flex items-center justify-between text-rose-800 text-xs font-semibold" role="alert">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">⚠️</span>
              <span>Failed to load jobs.</span>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}
              className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 active:bg-rose-300 font-bold transition-all text-[10px] uppercase tracking-wider text-rose-700"
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {/* Board fills remaining height */}
        <div className="flex-1 min-h-0">
          <KanbanBoard
            initialJobs={jobs}
            onJobUpdate={handleJobUpdate}
            onJobMove={handleJobMove}
            selectedJobId={selectedJobId}
            onJobSelect={setSelectedJobId}
          />
        </div>
      </div>

      <AddJobModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
          setShowAddModal(false);
        }}
      />

      <ImportJobsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
          setShowImportModal(false);
        }}
      />
    </NavLayout>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <NavLayout title="Job Pipeline" subtitle="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" />
        </div>
      </NavLayout>
    }>
      <JobsContent />
    </Suspense>
  );
}

// ─── Import Jobs Modal ───────────────────────────────────────────────────────

type ImportSource = 'greenhouse' | 'indeed' | 'linkedin';

interface ImportedJob {
  source: ImportSource;
  externalId: string | null;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt: string;
  salary?: string | null;
  department?: string | null;
}

function ImportJobsModal({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported: () => void }) {
  const [source, setSource] = useState<ImportSource>('greenhouse');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Remote');
  const [boardToken, setBoardToken] = useState('');
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportedJob[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResults([]);
    setSelected(new Set());
    setSearching(true);
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, query, location, boardToken: boardToken || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Search failed');
      setResults((json.data ?? json).jobs ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function handleImport() {
    const toImport = results.filter((_, i) => selected.has(i));
    if (!toImport.length) return;
    setImporting(true);
    setError('');
    try {
      const res = await fetch('/api/jobs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: toImport }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Import failed');
      onImported();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Import failed');
      setImporting(false);
    }
  }

  function toggleAll() {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((_, i) => i)));
  }

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-3xl w-11/12 overflow-hidden flex flex-col max-h-[85vh]">
      <ModalHeader onClose={onClose}>
        <div>
          <ModalTitle>Import Jobs</ModalTitle>
          <p className="text-xs text-slate-500 mt-1 font-medium">Search job boards and add matching roles to your pipeline.</p>
        </div>
      </ModalHeader>

      <ModalBody className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col gap-6">
          {/* Source Toggle */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-start" role="group" aria-label="Job source">
            {(['greenhouse', 'indeed', 'linkedin'] as ImportSource[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                aria-pressed={source === s}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  source === s
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {source === 'greenhouse' && (
              <Input placeholder="Company board token (e.g. stripe, airbnb)" value={boardToken} onChange={(e) => setBoardToken(e.target.value)} label="Company Board Token" required />
            )}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input required placeholder="Job title or keywords" value={query} onChange={(e) => setQuery(e.target.value)} label="Keywords" />
              </div>
              {source !== 'greenhouse' && (
                <div className="w-full sm:w-48">
                  <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} label="Location" />
                </div>
              )}
              <Button type="submit" disabled={searching} loading={searching} className="w-full sm:w-auto h-9 whitespace-nowrap">
                {searching ? 'Searching…' : 'Search'}
              </Button>
            </div>
            {(source === 'indeed' || source === 'linkedin') && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs font-medium" role="note">
                <span aria-hidden="true">⚠️</span>
                <span>{source === 'linkedin' ? 'LinkedIn' : 'Indeed'} search uses a headless browser and may take 20–40 seconds.</span>
              </div>
            )}
          </form>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">{results.length} result{results.length !== 1 ? 's' : ''}</p>
                <button type="button" onClick={toggleAll} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  {selected.size === results.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {results.map((job, i) => {
                  const safeUrl = sanitizeUrl(job.url);
                  const hrefUrl = safeUrl && (safeUrl.startsWith('http://') || safeUrl.startsWith('https://')) ? safeUrl : undefined;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                      className={`flex gap-3 p-4 rounded-xl border transition-all cursor-pointer items-start hover:border-blue-300 ${
                        selected.has(i) ? 'border-blue-500 bg-blue-50/40 shadow-xs' : 'border-slate-200 bg-white'
                      }`}
                      role="checkbox"
                      aria-checked={selected.has(i)}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; }); }}
                    >
                      <Checkbox checked={selected.has(i)} onClick={(e) => e.stopPropagation()} onChange={() => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{sanitizeText(job.title)}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{sanitizeText(job.company)} · {sanitizeText(job.location)}</p>
                        {job.description && <p className="text-xs text-slate-400 truncate mt-1">{sanitizeText(job.description)}</p>}
                      </div>
                      {hrefUrl && (
                        <a href={hrefUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors">
                          View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={importing} size="sm">Cancel</Button>
        <Button onClick={handleImport} disabled={importing || selected.size === 0} loading={importing} size="sm">
          {importing ? 'Importing…' : `Import ${selected.size > 0 ? selected.size : ''} Job${selected.size !== 1 ? 's' : ''}`}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ─── Add Job Modal ────────────────────────────────────────────────────────────

function AddJobModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createJob({ title: title.trim(), company: company.trim(), url: url.trim() || undefined });
      onCreated();
      setTitle(''); setCompany(''); setUrl('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-lg w-11/12">
      <ModalHeader onClose={onClose}>
        <ModalTitle>Track a New Job</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-5 p-6">
          <Input label="Job Title" required placeholder="e.g. Senior Software Engineer" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <Input label="Company" required placeholder="e.g. Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Job Posting URL" type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} size="sm">Cancel</Button>
          <Button type="submit" disabled={saving || !title.trim() || !company.trim()} loading={saving} size="sm">
            {saving ? 'Adding…' : 'Add Job'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
