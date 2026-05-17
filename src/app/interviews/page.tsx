'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Video,
  User,
} from 'lucide-react';

type InterviewType = 'recruiter_screen' | 'technical' | 'system_design' | 'behavioral' | 'final_round' | 'other';
type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

interface Interview {
  id: string;
  type: InterviewType;
  scheduledAt: string;
  duration: number;
  status: InterviewStatus;
  meetingLink?: string;
  location?: string;
  notes?: string;
  interviewer?: { name?: string; email?: string; title?: string };
  feedback?: { rating?: number; notes?: string; nextSteps?: string };
  job?: { id: string; title: string; company: string };
}

interface Job {
  id: string;
  title: string;
  company: string;
}

const TYPE_LABELS: Record<InterviewType, string> = {
  recruiter_screen: 'Recruiter Screen',
  technical: 'Technical',
  system_design: 'System Design',
  behavioral: 'Behavioral',
  final_round: 'Final Round',
  other: 'Other',
};

const STATUS_COLORS: Record<InterviewStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  no_show: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<InterviewStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

function generateICS(interview: Interview): string {
  const start = new Date(interview.scheduledAt);
  const end = new Date(start.getTime() + (interview.duration ?? 60) * 60000);

  function fmt(d: Date) {
    return d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  const jobTitle = interview.job?.title ?? 'Interview';
  const company = interview.job?.company ?? '';
  const summary = `${TYPE_LABELS[interview.type]} Interview${company ? ` — ${company}` : ''}`;
  const description = [
    jobTitle && company ? `Position: ${jobTitle} at ${company}` : jobTitle,
    interview.interviewer?.name ? `Interviewer: ${interview.interviewer.name}` : '',
    interview.meetingLink ? `Meeting: ${interview.meetingLink}` : '',
    interview.notes ? `Notes: ${interview.notes}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareerPropel//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:interview-${interview.id}@careerpropel`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : '',
    interview.meetingLink ? `URL:${interview.meetingLink}` : '',
    interview.location ? `LOCATION:${interview.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

function downloadICS(interview: Interview) {
  const content = generateICS(interview);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = [interview.job?.company, interview.type].filter(Boolean).join('_').replace(/\s+/g, '_');
  a.download = `interview_${slug || interview.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

interface ScheduleFormProps {
  jobs: Job[];
  onSuccess: () => void;
  onClose: () => void;
}

function ScheduleForm({ jobs, onSuccess, onClose }: ScheduleFormProps) {
  const [form, setForm] = useState({
    jobId: '',
    type: 'technical' as InterviewType,
    scheduledAt: '',
    duration: '60',
    interviewerName: '',
    interviewerEmail: '',
    interviewerTitle: '',
    meetingLink: '',
    location: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jobId || !form.scheduledAt) {
      setError('Job and date/time are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        jobId: form.jobId,
        type: form.type,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: parseInt(form.duration, 10) || 60,
      };

      if (form.interviewerName || form.interviewerEmail || form.interviewerTitle) {
        payload.interviewer = {
          name: form.interviewerName || undefined,
          email: form.interviewerEmail || undefined,
          title: form.interviewerTitle || undefined,
        };
      }
      if (form.meetingLink) payload.meetingLink = form.meetingLink;
      if (form.location) payload.location = form.location;
      if (form.notes) payload.notes = form.notes;

      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Failed to schedule interview');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Interview</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Job *</label>
              <select
                value={form.jobId}
                onChange={(e) => setField('jobId', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a job…</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interview Type</label>
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
              <select
                value={form.duration}
                onChange={(e) => setField('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[15, 30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setField('scheduledAt', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Interviewer (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={form.interviewerName}
                  onChange={(e) => setField('interviewerName', e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={form.interviewerTitle}
                  onChange={(e) => setField('interviewerTitle', e.target.value)}
                  placeholder="Engineering Manager"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Link</label>
            <input
              type="url"
              value={form.meetingLink}
              onChange={(e) => setField('meetingLink', e.target.value)}
              placeholder="https://zoom.us/j/…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location / Address</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="123 Main St or Remote"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Preparation notes, what to bring, etc."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Saving…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FeedbackFormProps {
  interview: Interview;
  onSuccess: () => void;
  onClose: () => void;
}

function FeedbackForm({ interview, onClose, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState(interview.feedback?.rating ?? 3);
  const [notes, setNotes] = useState(interview.feedback?.notes ?? '');
  const [nextSteps, setNextSteps] = useState(interview.feedback?.nextSteps ?? '');
  const [status, setStatus] = useState<InterviewStatus>(interview.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/interviews/${interview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedback: { rating, notes: notes || undefined, nextSteps: nextSteps || undefined },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Update failed');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Log Feedback</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Outcome</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InterviewStatus)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(['completed', 'cancelled', 'no_show'] as InterviewStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              How did it go? ({rating}/5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    rating === n
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the interview feel? Any tough questions?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Next Steps</label>
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="e.g. Second round next week, waiting for decision"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InterviewCard({ interview, onFeedback, onRefresh: _onRefresh }: { interview: Interview; onFeedback: () => void; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const scheduled = new Date(interview.scheduledAt);
  const isPast = scheduled < new Date();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">
                {interview.job ? `${interview.job.title} — ${interview.job.company}` : 'Unknown Job'}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[interview.status]}`}>
                {STATUS_LABELS[interview.status]}
              </span>
            </div>
            <p className="text-xs text-blue-600 font-medium mt-0.5">{TYPE_LABELS[interview.type]}</p>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar size={12} />
                {scheduled.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={12} />
                {scheduled.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {interview.duration ?? 60} min
              </span>
              {interview.interviewer?.name && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User size={12} />
                  {interview.interviewer.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Join meeting"
              >
                <Video size={15} />
              </a>
            )}
            <button
              onClick={() => downloadICS(interview)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Download .ics calendar file"
            >
              <Download size={15} />
            </button>
            {isPast && interview.status === 'scheduled' && (
              <button
                onClick={onFeedback}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
              >
                Log Feedback
              </button>
            )}
            {interview.status === 'completed' && interview.feedback && (
              <button
                onClick={onFeedback}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
              >
                Edit Feedback
              </button>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3 text-xs">
          {interview.location && (
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{interview.location}</span>
            </div>
          )}
          {interview.meetingLink && (
            <div className="flex items-start gap-2">
              <LinkIcon size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                {interview.meetingLink}
              </a>
            </div>
          )}
          {interview.notes && (
            <div>
              <p className="font-medium text-gray-600 mb-1">Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{interview.notes}</p>
            </div>
          )}
          {interview.feedback && (
            <div>
              <p className="font-medium text-gray-600 mb-1">Feedback</p>
              {interview.feedback.rating && (
                <p className="text-gray-700">Rating: {interview.feedback.rating}/5</p>
              )}
              {interview.feedback.notes && (
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{interview.feedback.notes}</p>
              )}
              {interview.feedback.nextSteps && (
                <p className="text-gray-500 italic mt-1">Next: {interview.feedback.nextSteps}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<Interview | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [intRes, jobRes] = await Promise.all([
        fetch('/api/interviews?limit=100&sortBy=scheduledAt&sortOrder=asc'),
        fetch('/api/jobs?limit=100'),
      ]);

      const intJson = await intRes.json();
      const jobJson = await jobRes.json();

      setInterviews(Array.isArray(intJson?.data) ? intJson.data : Array.isArray(intJson) ? intJson : []);
      setJobs(Array.isArray(jobJson) ? jobJson : jobJson?.data ?? []);
    } catch {
      setError('Failed to load interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const filtered = interviews.filter((i) => {
    const d = new Date(i.scheduledAt);
    if (filter === 'upcoming') return d >= now && i.status === 'scheduled';
    if (filter === 'past') return d < now || i.status !== 'scheduled';
    return true;
  });

  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) >= now && i.status === 'scheduled');
  const past = interviews.filter((i) => new Date(i.scheduledAt) < now || i.status !== 'scheduled');

  return (
    <NavLayout
      title="Interviews"
      subtitle="Track scheduled interviews and log feedback"
    >
      {showSchedule && (
        <ScheduleForm
          jobs={jobs}
          onSuccess={() => { setShowSchedule(false); load(); }}
          onClose={() => setShowSchedule(false)}
        />
      )}

      {feedbackTarget && (
        <FeedbackForm
          interview={feedbackTarget}
          onSuccess={() => { setFeedbackTarget(null); load(); }}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{past.length}</p>
              <p className="text-xs text-gray-500">Past</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter((i) => i.status === 'completed' && (i.feedback?.rating ?? 0) >= 4).length}
              </p>
              <p className="text-xs text-gray-500">Strong</p>
            </div>
          </div>

          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            Schedule Interview
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
          {(['upcoming', 'past', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-64 text-center p-8">
            <Calendar size={48} className="text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">
              {filter === 'upcoming' ? 'No upcoming interviews' : 'No interviews found'}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mb-4">
              {filter === 'upcoming'
                ? 'Schedule your next interview to track it here.'
                : 'No interviews match the selected filter.'}
            </p>
            {filter === 'upcoming' && (
              <button
                onClick={() => setShowSchedule(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={14} />
                Schedule Interview
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onFeedback={() => setFeedbackTarget(interview)}
                onRefresh={load}
              />
            ))}
          </div>
        )}
      </div>
    </NavLayout>
  );
}
