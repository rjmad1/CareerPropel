'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { InterviewPrepWorkspace } from '@/components/InterviewPrep/InterviewPrepWorkspace';

interface Job {
  id: string;
  title: string;
  company: string;
  stage: string;
  createdAt: string;
}

const PREP_ELIGIBLE_STAGES = [
  'RECRUITER_SCREEN',
  'HIRING_MANAGER',
  'TECHNICAL_INTERVIEW',
  'SYSTEM_DESIGN',
  'BEHAVIORAL',
  'FINAL_ROUND',
  'APPLIED',
  'INTERESTED',
];

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

  const stageLabel: Record<string, string> = {
    INTERESTED: 'Interested',
    APPLIED: 'Applied',
    RECRUITER_SCREEN: 'Recruiter Screen',
    HIRING_MANAGER: 'Hiring Manager',
    TECHNICAL_INTERVIEW: 'Technical Interview',
    SYSTEM_DESIGN: 'System Design',
    BEHAVIORAL: 'Behavioral',
    FINAL_ROUND: 'Final Round',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    SOURCED: 'Sourced',
    TAILORING: 'Tailoring',
  };

  const stageColor: Record<string, string> = {
    INTERESTED: 'bg-blue-100 text-blue-700',
    APPLIED: 'bg-indigo-100 text-indigo-700',
    RECRUITER_SCREEN: 'bg-yellow-100 text-yellow-700',
    HIRING_MANAGER: 'bg-orange-100 text-orange-700',
    TECHNICAL_INTERVIEW: 'bg-purple-100 text-purple-700',
    SYSTEM_DESIGN: 'bg-violet-100 text-violet-700',
    BEHAVIORAL: 'bg-pink-100 text-pink-700',
    FINAL_ROUND: 'bg-rose-100 text-rose-700',
    OFFER: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    SOURCED: 'bg-gray-100 text-gray-600',
    TAILORING: 'bg-teal-100 text-teal-700',
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchText.toLowerCase()) ||
      j.company.toLowerCase().includes(searchText.toLowerCase())
  );

  const interviewJobs = filtered.filter((j) =>
    PREP_ELIGIBLE_STAGES.includes(j.stage?.toUpperCase())
  );
  const otherJobs = filtered.filter(
    (j) => !PREP_ELIGIBLE_STAGES.includes(j.stage?.toUpperCase())
  );

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
            {/* Active Interview Roles */}
            {interviewJobs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Active Pipeline ({interviewJobs.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interviewJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      stageLabel={stageLabel}
                      stageColor={stageColor}
                      onPrepare={setSelectedJobId}
                      highlight
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other Jobs */}
            {otherJobs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  All Jobs ({otherJobs.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {otherJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      stageLabel={stageLabel}
                      stageColor={stageColor}
                      onPrepare={setSelectedJobId}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Interview Prep Workspace Modal */}
      {selectedJobId && (
        <InterviewPrepWorkspace
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </NavLayout>
  );
}

interface JobCardProps {
  job: Job;
  stageLabel: Record<string, string>;
  stageColor: Record<string, string>;
  onPrepare: (id: string) => void;
  highlight?: boolean;
}

function JobCard({ job, stageLabel, stageColor, onPrepare, highlight }: JobCardProps) {
  const stageKey = job.stage?.toUpperCase() ?? '';
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
          className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
            stageColor[stageKey] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {stageLabel[stageKey] ?? job.stage}
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
