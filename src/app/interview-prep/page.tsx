'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { InterviewPrepWorkspace } from '@/components/InterviewPrep/InterviewPrepWorkspace';
import { STAGE_LABELS, STAGE_COLORS, JobStage } from '@/types/job';

// Stages where active prep makes most sense
const PREP_ELIGIBLE_STAGES = new Set<JobStage>([
  'interested',
  'applied',
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
]);

interface Job {
  id: string;
  title: string;
  company: string;
  stage: JobStage;
  createdAt: string;
}

export default function InterviewPrepPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?limit=100');
      const json = await res.json();
      const rawJobs: Job[] = Array.isArray(json) ? json : json.data ?? [];
      setJobs(rawJobs);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchText.toLowerCase()) ||
      j.company.toLowerCase().includes(searchText.toLowerCase())
  );

  const interviewJobs = filtered.filter((j) => PREP_ELIGIBLE_STAGES.has(j.stage));
  const otherJobs = filtered.filter((j) => !PREP_ELIGIBLE_STAGES.has(j.stage));

  return (
    <NavLayout
      title="Interview Preparation"
      subtitle="AI-powered prep kit for every role — company intel, behavioral stories, technical practice"
    >
      <div className="p-6 max-w-5xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs tracked yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add jobs from your dashboard to start preparing.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active interview pipeline */}
            {interviewJobs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Active Pipeline ({interviewJobs.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interviewJobs.map((job) => (
                    <JobCard key={job.id} job={job} onPrepare={setSelectedJobId} highlight />
                  ))}
                </div>
              </section>
            )}

            {/* Other tracked jobs */}
            {otherJobs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  All Jobs ({otherJobs.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {otherJobs.map((job) => (
                    <JobCard key={job.id} job={job} onPrepare={setSelectedJobId} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {selectedJobId && (
        <InterviewPrepWorkspace jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </NavLayout>
  );
}

interface JobCardProps {
  job: Job;
  onPrepare: (id: string) => void;
  highlight?: boolean;
}

function JobCard({ job, onPrepare, highlight }: JobCardProps) {
  const colors = STAGE_COLORS[job.stage] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
  };

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex items-start justify-between gap-4 transition hover:shadow-sm ${
        highlight ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
      }`}
    >
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate">{job.title}</p>
        <p className="text-sm text-gray-500 truncate mt-0.5">{job.company}</p>
        <span
          className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}
        >
          {STAGE_LABELS[job.stage] ?? job.stage}
        </span>
      </div>
      <button
        onClick={() => onPrepare(job.id)}
        className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
      >
        Prepare
      </button>
    </div>
  );
}
