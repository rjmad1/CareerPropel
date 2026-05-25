'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { InterviewPrepWorkspace } from '@/components/InterviewPrep/InterviewPrepWorkspace';
import { STAGE_LABELS, STAGE_COLORS, JobStage } from '@/types/job';
import { Button, Input, Card } from '@/components/ui';
import { Search, Loader2, Mic, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { parseInterviewPrepState, buildUrl } from '@/lib/navigation/state';
import { interviewPrepBreadcrumbs } from '@/lib/navigation/breadcrumbs';
import { useRestorableScroll } from '@/hooks/useRestorableScroll';

const PREP_ELIGIBLE_STAGES = new Set<JobStage>([
  'interested', 'applied', 'recruiter_screen', 'hiring_manager',
  'technical_interview', 'system_design', 'behavioral', 'final_round',
]);

interface Job {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  createdAt: string;
}

// ─── Inner component (needs Suspense for useSearchParams) ─────────────────────

function InterviewPrepContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── URL state (canonical) ──
  const urlState = parseInterviewPrepState(searchParams);
  const selectedJobId = urlState.job || null;
  const activeTab = urlState.tab;

  function setSelectedJobId(id: string | null) {
    const next = buildUrl(pathname, { job: id }, searchParams);
    router.replace(next, { scroll: false });
  }

  // ── List data ──
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  // Scroll restoration for the jobs list
  useRestorableScroll({ key: '/interview-prep' });

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?limit=100');
      const json = await res.json();
      setJobs(Array.isArray(json) ? json : json.data ?? []);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchText.toLowerCase()) ||
      j.company.toLowerCase().includes(searchText.toLowerCase()),
  );
  const interviewJobs = filtered.filter((j) => PREP_ELIGIBLE_STAGES.has(j.stage));
  const otherJobs = filtered.filter((j) => !PREP_ELIGIBLE_STAGES.has(j.stage));

  // Find the selected job for breadcrumb label
  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const breadcrumbs = selectedJob
    ? interviewPrepBreadcrumbs(`${selectedJob.title} @ ${selectedJob.company}`, activeTab)
    : undefined;

  return (
    <NavLayout
      title="Interview Preparation"
      subtitle="AI-powered prep kit for every role — company intel, behavioral stories, technical practice"
      breadcrumbs={breadcrumbs}
    >
      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Input
            placeholder="Search by job title or company..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 h-10 w-full"
            aria-label="Search jobs for interview prep"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl" role="alert">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12" role="status" aria-label="Loading jobs">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="text-center py-12 p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
              <Mic className="w-6 h-6" aria-hidden="true" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No jobs tracked yet</h4>
            <p className="text-sm text-slate-500 mb-6">Add jobs from your dashboard to start preparing.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors h-9 px-4 py-2 mx-auto"
            >
              Go to Dashboard
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {interviewJobs.length > 0 && (
              <section aria-label="Active pipeline jobs">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Active Pipeline ({interviewJobs.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {interviewJobs.map((job) => (
                    <PrepJobCard
                      key={job.id}
                      job={job}
                      isSelected={job.id === selectedJobId}
                      onPrepare={setSelectedJobId}
                      highlight
                    />
                  ))}
                </div>
              </section>
            )}
            {otherJobs.length > 0 && (
              <section aria-label="All tracked jobs">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  All Jobs ({otherJobs.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherJobs.map((job) => (
                    <PrepJobCard
                      key={job.id}
                      job={job}
                      isSelected={job.id === selectedJobId}
                      onPrepare={setSelectedJobId}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Workspace overlay — job id from URL */}
      {selectedJobId && (
        <InterviewPrepWorkspace
          jobId={selectedJobId}
          initialTab={activeTab !== 'company' ? activeTab : undefined}
          onClose={() => setSelectedJobId(null)}
          onTabChange={(tab) => {
            const next = buildUrl(pathname, { tab }, searchParams);
            router.replace(next, { scroll: false });
          }}
        />
      )}
    </NavLayout>
  );
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={
      <NavLayout title="Interview Preparation" subtitle="Loading...">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" />
        </div>
      </NavLayout>
    }>
      <InterviewPrepContent />
    </Suspense>
  );
}

// ─── PrepJobCard ──────────────────────────────────────────────────────────────

interface PrepJobCardProps {
  job: Job;
  isSelected: boolean;
  onPrepare: (id: string) => void;
  highlight?: boolean;
}

function PrepJobCard({ job, isSelected, onPrepare, highlight }: PrepJobCardProps) {
  const colors = STAGE_COLORS[job.stage] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow duration-200 border ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/30'
          : highlight
            ? 'border-blue-200 bg-blue-50/20'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-900 truncate">{job.title}</h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">{job.company}</p>
          <div className="mt-3">
            <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border || ''}`}>
              {STAGE_LABELS[job.stage] ?? job.stage}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => onPrepare(job.id)}
          variant={isSelected ? 'outline' : 'primary'}
          className="flex-shrink-0"
          aria-label={`${isSelected ? 'Close prep for' : 'Open prep for'} ${job.title} at ${job.company}`}
        >
          {isSelected ? 'Close' : 'Prepare'}
        </Button>
      </div>
    </Card>
  );
}
