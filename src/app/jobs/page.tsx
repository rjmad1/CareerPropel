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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <span className="text-base leading-none">+</span>
            Add Job
          </button>
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
    </NavLayout>
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
