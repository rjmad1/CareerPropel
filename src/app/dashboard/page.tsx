'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { JobDetailPanel } from '@/domains/jobs';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  stage: string;
  url?: string;
  createdAt: string;
}

const STAGE_COLORS: Record<string, string> = {
  SOURCED: 'bg-gray-100 text-gray-600',
  INTERESTED: 'bg-blue-100 text-blue-700',
  TAILORING: 'bg-teal-100 text-teal-700',
  APPLIED: 'bg-indigo-100 text-indigo-700',
  RECRUITER_SCREEN: 'bg-yellow-100 text-yellow-700',
  HIRING_MANAGER: 'bg-orange-100 text-orange-700',
  TECHNICAL_INTERVIEW: 'bg-purple-100 text-purple-700',
  SYSTEM_DESIGN: 'bg-violet-100 text-violet-700',
  BEHAVIORAL: 'bg-pink-100 text-pink-700',
  FINAL_ROUND: 'bg-rose-100 text-rose-700',
  OFFER: 'bg-green-100 text-green-700',
  NEGOTIATION: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

const STAGE_LABELS: Record<string, string> = {
  SOURCED: 'Sourced',
  INTERESTED: 'Interested',
  TAILORING: 'Tailoring',
  APPLIED: 'Applied',
  RECRUITER_SCREEN: 'Recruiter Screen',
  HIRING_MANAGER: 'Hiring Manager',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral',
  FINAL_ROUND: 'Final Round',
  OFFER: 'Offer',
  NEGOTIATION: 'Negotiation',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const QUICK_LINKS = [
  { href: '/interview-prep', label: 'Interview Prep', icon: '🎤', description: 'AI-generated prep kits for every role' },
  { href: '/offers', label: 'Offers', icon: '💰', description: 'Compare and evaluate compensation packages' },
  { href: '/profile', label: 'Profile', icon: '👤', description: 'Manage skills, achievements, and ATS score' },
  { href: '/analytics', label: 'Analytics', icon: '📊', description: 'Pipeline conversion rates and salary insights' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchJobs();
    }
  }, [status, router]);

  async function fetchJobs() {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs?limit=20');
      const data = await response.json();
      const rawJobs: Job[] = Array.isArray(data) ? data : data.data ?? [];
      setJobs(rawJobs);
      setError('');
    } catch {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, url: url || undefined, stage: 'INTERESTED' }),
      });
      if (!response.ok) throw new Error('Failed to create job');
      setTitle('');
      setCompany('');
      setUrl('');
      setShowAddForm(false);
      await fetchJobs();
    } catch {
      setError('Failed to add job');
    } finally {
      setSubmitLoading(false);
    }
  }

  const stageKey = (stage: string) => stage?.toUpperCase() ?? '';

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <NavLayout
      title="Dashboard"
      subtitle={`Welcome back${session.user?.email ? ', ' + session.user.email.split('@')[0] : ''}! Here's your career pipeline.`}
    >
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Quick Navigation Cards */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition group"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition">{link.label}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{link.description}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Jobs Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Recent Jobs {jobs.length > 0 && `(${jobs.length})`}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchJobs}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={14} />
                Add Job
              </button>
            </div>
          </div>

          {/* Add Job Form */}
          {showAddForm && (
            <div className="bg-white border border-blue-200 rounded-xl p-5 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Track New Job</h3>
              <form onSubmit={handleAddJob} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Software Engineer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={submitLoading}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={submitLoading}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Job URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitLoading}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {submitLoading ? 'Adding...' : 'Add Job'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center py-12 bg-white border border-gray-200 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-1">No jobs tracked yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start tracking applications to manage your pipeline.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Job
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {jobs.map((job) => {
                  const sk = stageKey(job.stage);
                  return (
                    <div
                      key={job.id}
                      data-testid="job-card"
                      onClick={() => setSelectedJobId(job.id)}
                      className="flex items-center px-5 py-3 hover:bg-gray-50 transition gap-4 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{job.title}</p>
                        <p className="text-sm text-gray-500 truncate">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STAGE_COLORS[sk] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STAGE_LABELS[sk] ?? job.stage}
                        </span>
                        <Link
                          href={`/interview-prep`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                        >
                          Prepare →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
              {jobs.length >= 20 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Showing most recent 20 jobs</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Auth Status */}
        <section className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-green-500 text-lg">✓</span>
          <div>
            <p className="text-sm font-medium text-green-900">Authenticated as {session.user?.email}</p>
            <p className="text-xs text-green-700 mt-0.5">All API endpoints are secured and returning your data.</p>
          </div>
        </section>
      </div>

      {selectedJobId && (
        <JobDetailPanel
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </NavLayout>
  );
}
