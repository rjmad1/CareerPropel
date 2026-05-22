'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Card, CardBody, Input, Select } from '@/components/ui';
import { sanitizeText, sanitizeUrl } from '@/lib/security/sanitizeContent';
import {
  Search,
  Building2,
  MapPin,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Clock,
  X,
} from 'lucide-react';

type Source = 'greenhouse' | 'lever' | 'ashby' | 'linkedin' | 'indeed';

interface JobResult {
  source: Source;
  externalId: string | null;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt: string;
  salary: string | null;
  department: string | null;
}

const SOURCE_OPTIONS = [
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'lever', label: 'Lever' },
  { value: 'ashby', label: 'Ashby' },
  { value: 'linkedin', label: 'LinkedIn (async)' },
  { value: 'indeed', label: 'Indeed (async)' },
];

const SYNC_SOURCES: Source[] = ['greenhouse', 'lever', 'ashby'];
const ASYNC_SOURCES: Source[] = ['linkedin', 'indeed'];

const SOURCE_COLORS: Record<Source, string> = {
  greenhouse: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  lever: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  ashby: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  linkedin: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  indeed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
};

function truncate(text: string, max = 180) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

export default function JobSearchPage() {
  const [source, setSource] = useState<Source>('greenhouse');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [boardToken, setBoardToken] = useState('');
  const [limit, setLimit] = useState(20);

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [asyncJobId, setAsyncJobId] = useState<string | null>(null);
  const [asyncStatus, setAsyncStatus] = useState<'idle' | 'queued' | 'running' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState('');

  const [importing, setImporting] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState<Set<number>>(new Set());

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/search/status?jobId=${encodeURIComponent(jobId)}`);
      const json = await res.json();
      const data = json.data ?? json;

      setAsyncStatus(data.status);

      if (data.status === 'completed') {
        stopPolling();
        setResults(data.jobs ?? []);
        setSearching(false);
      } else if (data.status === 'failed') {
        stopPolling();
        setError(data.error ?? 'Search failed');
        setSearching(false);
      }
    } catch {
      // keep polling silently
    }
  }, [stopPolling]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setError('');
    setResults([]);
    setImported(new Set());
    setImporting(new Set());
    setAsyncJobId(null);
    setAsyncStatus('idle');
    stopPolling();

    const isSync = SYNC_SOURCES.includes(source);
    setSearching(true);

    try {
      const body: Record<string, unknown> = { source, query: query.trim(), limit };
      if (location.trim()) body.location = location.trim();
      if (boardToken.trim()) body.boardToken = boardToken.trim();

      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      const data = json.data ?? json;

      if (!res.ok) {
        throw new Error(data?.error?.message ?? data?.message ?? 'Search failed');
      }

      if (isSync) {
        setResults(data.jobs ?? []);
        setSearching(false);
      } else {
        // async — poll
        const jobId = data.executionId ?? data.jobId;
        setAsyncJobId(jobId);
        setAsyncStatus('queued');
        pollRef.current = setInterval(() => pollStatus(jobId), 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearching(false);
    }
  }

  async function handleImport(job: JobResult, idx: number) {
    if (importing.has(idx) || imported.has(idx)) return;
    setImporting((prev) => new Set(prev).add(idx));

    try {
      const res = await fetch('/api/jobs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: [job] }),
      });

      if (!res.ok) throw new Error('Import failed');
      setImported((prev) => new Set(prev).add(idx));
    } catch {
      setError(`Failed to import "${job.title}"`);
    } finally {
      setImporting((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  }

  async function handleImportAll() {
    const unimported = results.filter((_, i) => !imported.has(i));
    if (!unimported.length) return;

    await Promise.allSettled(
      results.flatMap((job, i) => (imported.has(i) ? [] : [handleImport(job, i)]))
    );
  }

  const needsBoardToken = ['greenhouse', 'lever', 'ashby'].includes(source);
  const isAsync = ASYNC_SOURCES.includes(source);

  return (
    <NavLayout title="Job Search" subtitle="Discover and import jobs from multiple boards into your pipeline">
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">

        {/* Search Form */}
        <Card>
          <CardBody className="p-5">
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Source</label>
                  <Select
                    value={source}
                    onChange={(e) => {
                      setSource(e.target.value as Source);
                      setBoardToken('');
                    }}
                    options={SOURCE_OPTIONS}
                    disabled={searching}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Keywords</label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. software engineer"
                    disabled={searching}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Location (optional)
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    disabled={searching}
                  />
                </div>

                {needsBoardToken ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Board Token <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={boardToken}
                      onChange={(e) => setBoardToken(e.target.value)}
                      placeholder="e.g. stripe, airbnb"
                      disabled={searching}
                      required
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Limit</label>
                    <Select
                      value={String(limit)}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      options={[
                        { value: '10', label: '10 results' },
                        { value: '20', label: '20 results' },
                        { value: '50', label: '50 results' },
                      ]}
                      disabled={searching}
                    />
                  </div>
                )}
              </div>

              {isAsync && (
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-lg px-3 py-2">
                  {source === 'linkedin'
                    ? 'LinkedIn search runs in the background via Playwright scraping. Results appear when complete (30–60s). Feature-flagged: requires LINKEDIN_SCRAPING_ENABLED=true.'
                    : 'Indeed search runs asynchronously. Results appear when the worker completes (30–60s).'}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={searching || !query.trim()}
                  className="flex items-center gap-2"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {searching ? 'Searching…' : 'Search'}
                </Button>

                {results.length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleImportAll}
                    className="flex items-center gap-2"
                    disabled={results.every((_, i) => imported.has(i))}
                  >
                    <Plus className="w-4 h-4" />
                    Import All ({results.filter((_, i) => !imported.has(i)).length})
                  </Button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Async Status */}
        {isAsync && asyncJobId && asyncStatus !== 'completed' && asyncStatus !== 'failed' && (
          <Card>
            <CardBody className="p-4 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {asyncStatus === 'queued' ? 'Search queued…' : 'Searching in the background…'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Job ID: <code className="font-mono">{asyncJobId}</code>
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-800 border border-red-100 bg-red-50 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {imported.size} added to pipeline
              </span>
            </div>

            {results.map((job, idx) => {
              const isImporting = importing.has(idx);
              const isImported = imported.has(idx);
              const safeUrl = sanitizeUrl(job.url);

              return (
                <Card key={idx} className={isImported ? 'border-green-200 dark:border-green-900' : ''}>
                  <CardBody className="p-5 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start flex-wrap gap-2 mb-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {sanitizeText(job.title)}
                        </h3>
                        <span className={`px-2 py-0.5 text-2xs font-semibold rounded-full border ${SOURCE_COLORS[job.source]} border-transparent`}>
                          {job.source}
                        </span>
                        {job.department && (
                          <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {sanitizeText(job.department)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          {sanitizeText(job.company)}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {sanitizeText(job.location)}
                          </span>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                            {sanitizeText(job.salary)}
                          </span>
                        )}
                        {job.postedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {sanitizeText(job.postedAt)}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {truncate(sanitizeText(job.description))}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      {safeUrl && (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View job posting"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <Button
                        variant={isImported ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleImport(job, idx)}
                        disabled={isImporting || isImported}
                        className="flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isImporting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isImported ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        {isImported ? 'Added' : 'Add to Pipeline'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state after sync search */}
        {!searching && results.length === 0 && !error && asyncStatus !== 'queued' && asyncStatus !== 'running' && (
          <Card className="text-center py-14 px-6">
            <CardBody className="flex flex-col items-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Search job boards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Search Greenhouse, Lever, and Ashby boards by company token, or use LinkedIn and Indeed for broader keyword searches.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </NavLayout>
  );
}
