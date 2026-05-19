'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';
import { Job } from '@/types/job';

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    enabled: status === 'authenticated',
  });

  const updateMutation = useMutation({
    mutationFn: ({ jobId, updates }: { jobId: string; updates: Partial<Job> }) =>
      patchJob(jobId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const handleJobUpdate = async (jobId: string, updates: Partial<Job>) => {
    await updateMutation.mutateAsync({ jobId, updates });
  };

  return (
    // title/subtitle intentionally omitted — the KanbanBoard has its own header
    <NavLayout>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading…' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} tracked`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Import Jobs
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <span className="text-base leading-none">+</span>
              Add Job
            </button>
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 px-6 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
            Failed to load jobs. <button className="underline" onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}>Retry</button>
          </div>
        )}

        {/* Board fills remaining height */}
        <div className="flex-1 min-h-0">
          <KanbanBoard
            initialJobs={jobs}
            onJobUpdate={handleJobUpdate}
          />
        </div>
      </div>

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setShowAddModal(false);
          }}
        />
      )}

      {showImportModal && (
        <ImportJobsModal
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setShowImportModal(false);
          }}
        />
      )}
    </NavLayout>
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

function ImportJobsModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
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
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
      setImporting(false);
    }
  }

  function toggleAll() {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((_, i) => i)));
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Import Jobs</h2>
            <p className="text-sm text-gray-500 mt-0.5">Search job boards and add matching roles to your pipeline.</p>
          </div>

          <div className="p-6 space-y-4 border-b border-gray-100">
            {/* Source tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
              {(['greenhouse', 'indeed', 'linkedin'] as ImportSource[]).map((s) => (
                <button key={s} onClick={() => setSource(s)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition ${source === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="space-y-3">
              {source === 'greenhouse' && (
                <input type="text" placeholder="Company board token (e.g. stripe, airbnb)"
                  value={boardToken} onChange={(e) => setBoardToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
              <div className="flex gap-2">
                <input type="text" placeholder="Job title or keywords" required value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {source !== 'greenhouse' && (
                  <input type="text" placeholder="Location" value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                )}
                <button type="submit" disabled={searching}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>
              {source === 'indeed' || source === 'linkedin' ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  {source === 'linkedin' ? 'LinkedIn' : 'Indeed'} search uses a headless browser and may take 20–40 seconds.
                </p>
              ) : null}
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {results.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''}</p>
                <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline">
                  {selected.size === results.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            )}
            {results.map((job, i) => (
              <label key={i} className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition ${selected.has(i) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" checked={selected.has(i)}
                  onChange={() => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                  className="mt-0.5 accent-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                  {job.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{job.description}</p>
                  )}
                </div>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-xs text-blue-600 hover:underline self-start">View</a>
                )}
              </label>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleImport} disabled={importing || selected.size === 0}
              className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {importing ? 'Importing…' : `Import ${selected.size > 0 ? selected.size : ''} Job${selected.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Add Job Modal ────────────────────────────────────────────────────────────

function AddJobModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
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
    } catch (err: any) {
      setError(err.message || 'Failed to add job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Track a New Job</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Posting URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim() || !company.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                {saving ? 'Adding…' : 'Add Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
