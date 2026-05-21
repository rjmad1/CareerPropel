'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { JobDetailPanel } from '@/domains/jobs';
import Link from 'next/link';
import { Button, Card, Badge, Input, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Spinner } from '@/components/ui';
import {
  Mic,
  DollarSign,
  User,
  BarChart3,
  Briefcase,
  Plus,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  PartyPopper
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  stage: string;
  url?: string;
  createdAt: string;
}

const STAGE_COLOR_MAP: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'gray'> = {
  SOURCED: 'gray',
  INTERESTED: 'primary',
  RESUME_TAILORING: 'primary',
  APPLIED: 'primary',
  RECRUITER_SCREEN: 'primary',
  HIRING_MANAGER: 'warning',
  TECHNICAL_INTERVIEW: 'primary',
  SYSTEM_DESIGN: 'primary',
  BEHAVIORAL: 'warning',
  FINAL_ROUND: 'warning',
  OFFER: 'success',
  NEGOTIATION: 'success',
  REJECTED: 'error',
  ARCHIVED: 'gray',
};

const STAGE_LABELS: Record<string, string> = {
  SOURCED: 'Sourced',
  INTERESTED: 'Interested',
  RESUME_TAILORING: 'Tailoring',
  APPLIED: 'Applied',
  RECRUITER_SCREEN: 'Recruiter Screen',
  HIRING_MANAGER: 'Hiring Manager',
  TECHNICAL_INTERVIEW: 'Technical',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral',
  FINAL_ROUND: 'Final Round',
  OFFER: 'Offer',
  NEGOTIATION: 'Negotiation',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

const QUICK_LINKS = [
  { href: '/interview-prep', label: 'Interview Prep', description: 'AI-generated prep kits for every role', icon: Mic, bgClass: 'bg-blue-50 hover:bg-blue-100/80 border border-blue-100', iconColor: 'text-blue-600' },
  { href: '/offers', label: 'Offers', description: 'Compare and evaluate compensation packages', icon: DollarSign, bgClass: 'bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100', iconColor: 'text-emerald-600' },
  { href: '/profile', label: 'Profile', description: 'Manage skills, achievements, and ATS score', icon: User, bgClass: 'bg-amber-50 hover:bg-amber-100/80 border border-amber-100', iconColor: 'text-amber-600' },
  { href: '/analytics', label: 'Analytics', description: 'Pipeline conversion rates and salary insights', icon: BarChart3, bgClass: 'bg-purple-50 hover:bg-purple-100/80 border border-purple-100', iconColor: 'text-purple-600' },
];

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [onboardCheckLoading, setOnboardCheckLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs?limit=20');
      if (!response.ok) {
        const text = await response.text();
        let msg = `Failed to fetch jobs (${response.status})`;
        try { msg = JSON.parse(text)?.error?.message ?? msg; } catch { /* */ }
        throw new Error(msg);
      }
      const data = await response.json();
      const rawJobs: Job[] = Array.isArray(data) ? data : data.data ?? [];
      setJobs(rawJobs);
      setError('');
    } catch {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function checkOnboardingAndFetch() {
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/account');
          if (res.ok) {
            const result = await res.json();
            const prefs = result?.data?.preferences || {};
            
            // Redirect if not onboarded
            if (!prefs.onboarded) {
              router.push('/onboarding');
              return;
            }

            // Display welcome state if parameter active
            if (searchParams.get('welcome') === '1') {
              setShowWelcome(true);
            }
          }
        } catch (e) {
          console.error('Failed to verify onboarding status:', e);
        } finally {
          setOnboardCheckLoading(false);
          fetchJobs();
        }
      }
    }

    checkOnboardingAndFetch();
  }, [status, router, fetchJobs, searchParams]);

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, url: url || undefined, stage: 'interested' }),
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

  if (status === 'loading' || onboardCheckLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="w-10 h-10 text-indigo-600" />
        <span className="text-sm text-slate-500 font-medium">Booting Career Operating System...</span>
      </div>
    );
  }
  if (!session) return null;

  const userName = session.user?.email ? session.user.email.split('@')[0] : '';

  return (
    <NavLayout
      title="Dashboard"
      subtitle={`Welcome back${userName ? ', ' + userName : ''}! Here's your career pipeline.`}
    >
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {showWelcome && (
          <div className="bg-gradient-to-r from-blue-600/95 to-indigo-600/95 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md border border-indigo-400/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Onboarding Complete</span>
                </div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Your Career OS is Active & Custom-Configured!</span>
                </h3>
                <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                  We have successfully mapped your career goals, privacy presets, and budget limits to all 11+ outcome presets. You can manage encrypted API keys, fallback routes, or offline discovery anytime under settings.
                </p>
              </div>
              <button 
                onClick={() => setShowWelcome(false)}
                className="bg-white hover:bg-slate-100 text-indigo-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 p-1" aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <div>
          <span className="text-[11px] tracking-wider uppercase font-semibold text-slate-500 block mb-3">
            Quick Access
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-start p-5 rounded-xl shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${link.bgClass}`}
                >
                  <IconComponent className={`mb-3 h-7 w-7 ${link.iconColor}`} />
                  <span className="text-sm font-bold text-slate-900 mb-1">
                    {link.label}
                  </span>
                  <span className="text-xs text-slate-500 leading-snug">
                    {link.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Jobs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] tracking-wider uppercase font-semibold text-slate-500">
              Recent Jobs {jobs.length > 0 && `(${jobs.length})`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchJobs}
                disabled={loading}
                aria-label="Refresh jobs"
                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Job
              </Button>
            </div>
          </div>

          {/* Jobs List Card */}
          <Card className="overflow-hidden bg-white shadow-xs border border-slate-200 rounded-xl">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="md" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">No jobs tracked yet</h4>
                  <p className="text-xs text-slate-500">
                    Start tracking applications to manage your pipeline.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5 mx-auto">
                  <Plus className="h-4 w-4" /> Add Your First Job
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {jobs.map((job) => {
                  const sk = stageKey(job.stage);
                  return (
                    <div
                      key={job.id}
                      data-testid="job-card"
                      onClick={() => setSelectedJobId(job.id)}
                      className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors hover:bg-slate-50/70"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-950 truncate leading-snug">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5">
                          {job.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={STAGE_COLOR_MAP[sk] ?? 'gray'} size="sm">
                          {STAGE_LABELS[sk] ?? job.stage}
                        </Badge>
                        <Link
                          href="/interview-prep"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors p-1"
                        >
                          Prepare <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {jobs.length >= 20 && (
                  <div className="bg-slate-50/50 py-2.5 text-center border-t border-slate-100">
                    <span className="text-[10px] font-medium text-slate-500">
                      Showing most recent 20 jobs
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Auth Status Alert */}
        <div className="flex items-start gap-3 p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-slate-700">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-slate-900">Security Layer Active</p>
            <p className="text-slate-600 font-medium">
              Authenticated as <strong className="text-slate-900 font-bold">{session.user?.email}</strong> — all pipeline endpoints fully secured.
            </p>
          </div>
        </div>
      </div>

      {/* Add Job Modal */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setShowAddForm(false)}>
          <ModalTitle>Track New Job</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleAddJob}>
          <ModalBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Job Title"
                required
                placeholder="e.g. Frontend Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitLoading}
              />
              <Input
                label="Company"
                required
                placeholder="e.g. DeepMind"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={submitLoading}
              />
            </div>
            <Input
              label="Job URL (optional)"
              type="url"
              placeholder="https://jobs.google.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitLoading}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitLoading}>
              Add Job
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {selectedJobId && (
        <JobDetailPanel
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </NavLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
