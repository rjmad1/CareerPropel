'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { KanbanBoard } from '@/components/Kanban/KanbanBoard';
import { Job } from '@/types/job';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { Plus, Upload as LucideUpload } from 'lucide-react';

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

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.stage !== 'rejected' && j.stage !== 'archived' && j.stage !== 'offer').length,
    offers: jobs.filter((j) => j.stage === 'offer').length,
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
              { label: 'Total', value: stats.total, color: 'text-slate-900 border-slate-200 bg-slate-50' },
              { label: 'Active', value: stats.active, color: 'text-blue-700 border-blue-100 bg-blue-50/50' },
              { label: 'Offers', value: stats.offers, color: 'text-emerald-700 border-emerald-100 bg-emerald-50/50' },
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
            >
              <LucideUpload className="h-3.5 w-3.5" />
              <span>Import Jobs</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}>
                Retry
              </Button>
            }
            sx={{ flexShrink: 0, borderRadius: 0 }}
          >
            Failed to load jobs.
          </Alert>
        )}

        {/* Board fills remaining height */}
        <div className="flex-1 min-h-0">
          <KanbanBoard
            initialJobs={jobs}
            onJobUpdate={handleJobUpdate}
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Import Jobs
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Search job boards and add matching roles to your pipeline.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Source Toggle */}
          <ToggleButtonGroup
            value={source}
            exclusive
            onChange={(_, v) => v && setSource(v)}
            size="small"
          >
            {(['greenhouse', 'indeed', 'linkedin'] as ImportSource[]).map((s) => (
              <ToggleButton key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Search Form */}
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {source === 'greenhouse' && (
              <TextField
                size="small"
                fullWidth
                placeholder="Company board token (e.g. stripe, airbnb)"
                value={boardToken}
                onChange={(e) => setBoardToken(e.target.value)}
              />
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                required
                placeholder="Job title or keywords"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {source !== 'greenhouse' && (
                <TextField
                  size="small"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  sx={{ width: 150 }}
                />
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={searching}
                startIcon={searching ? <CircularProgress size={14} color="inherit" /> : undefined}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {searching ? 'Searching…' : 'Search'}
              </Button>
            </Box>
            {(source === 'indeed' || source === 'linkedin') && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                {source === 'linkedin' ? 'LinkedIn' : 'Indeed'} search uses a headless browser and may take 20–40 seconds.
              </Alert>
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Results */}
          {results.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </Typography>
                <Button size="small" onClick={toggleAll}>
                  {selected.size === results.length ? 'Deselect all' : 'Select all'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
                {results.map((job, i) => (
                  <Box
                    key={i}
                    onClick={() => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                    sx={{
                      display: 'flex', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid',
                      borderColor: selected.has(i) ? 'primary.light' : 'divider',
                      bgcolor: selected.has(i) ? 'primary.50' : 'background.paper',
                      cursor: 'pointer', alignItems: 'flex-start',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <Checkbox
                      checked={selected.has(i)}
                      size="small"
                      sx={{ p: 0, mt: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => setSelected((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{job.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{job.company} · {job.location}</Typography>
                      {job.description && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.description}
                        </Typography>
                      )}
                    </Box>
                    {job.url && (
                      <Button
                        size="small"
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ flexShrink: 0, fontSize: '0.75rem' }}
                      >
                        View
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={importing}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={importing || selected.size === 0}
          startIcon={importing ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {importing ? 'Importing…' : `Import ${selected.size > 0 ? selected.size : ''} Job${selected.size !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
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
    } catch (err: any) {
      setError(err.message || 'Failed to add job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Track a New Job</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Job Title"
              required
              fullWidth
              placeholder="e.g. Senior Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <TextField
              label="Company"
              required
              fullWidth
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <TextField
              label="Job Posting URL"
              fullWidth
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !title.trim() || !company.trim()}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {saving ? 'Adding…' : 'Add Job'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
