'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Button,
  Input,
  Textarea,
  Card,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Select,
} from '@/components/ui';
import {
  Plus,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  MapPin,
  Link as LinkIcon,
  User,
  Clock,
  Video,
  Star,
  Loader2,
  AlertTriangle,
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

const STATUS_CLASSES: Record<InterviewStatus, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-50 text-slate-600 border-slate-200',
  no_show: 'bg-rose-50 text-rose-700 border-rose-200',
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
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
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

interface ScheduleDialogProps {
  open: boolean;
  jobs: Job[];
  onSuccess: () => void;
  onClose: () => void;
}

function ScheduleDialog({ open, jobs, onSuccess, onClose }: ScheduleDialogProps) {
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

  const jobOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a job...' },
      ...jobs.map((j) => ({
        value: j.id,
        label: `${j.title} — ${j.company}`,
      })),
    ];
  }, [jobs]);

  const typeOptions = useMemo(() => {
    return Object.entries(TYPE_LABELS).map(([val, label]) => ({
      value: val,
      label,
    }));
  }, []);

  const durationOptions = useMemo(() => {
    return [15, 30, 45, 60, 90, 120].map((d) => ({
      value: String(d),
      label: `${d} min`,
    }));
  }, []);

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-lg">
      <ModalHeader onClose={onClose}>
        <ModalTitle>Schedule Interview</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="flex flex-col gap-4">
          <Select
            label="Job"
            required
            options={jobOptions}
            value={form.jobId}
            onChange={(e) => setField('jobId', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Interview Type"
              options={typeOptions}
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
            />
            <Select
              label="Duration"
              options={durationOptions}
              value={form.duration}
              onChange={(e) => setField('duration', e.target.value)}
            />
          </div>

          <Input
            label="Date & Time"
            type="datetime-local"
            required
            value={form.scheduledAt}
            onChange={(e) => setField('scheduledAt', e.target.value)}
          />

          <div className="border-t border-slate-100 pt-3">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Interviewer (optional)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name"
                value={form.interviewerName}
                onChange={(e) => setField('interviewerName', e.target.value)}
                placeholder="Jane Smith"
              />
              <Input
                label="Title"
                value={form.interviewerTitle}
                onChange={(e) => setField('interviewerTitle', e.target.value)}
                placeholder="Engineering Manager"
              />
            </div>
          </div>

          <Input
            label="Meeting Link"
            type="url"
            value={form.meetingLink}
            onChange={(e) => setField('meetingLink', e.target.value)}
            placeholder="https://zoom.us/j/…"
          />

          <Input
            label="Location / Address"
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="123 Main St or Remote"
          />

          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Preparation notes, what to bring, etc."
            rows={2}
          />

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            Schedule
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

interface FeedbackDialogProps {
  open: boolean;
  interview: Interview;
  onSuccess: () => void;
  onClose: () => void;
}

function FeedbackDialog({ open, interview, onClose, onSuccess }: FeedbackDialogProps) {
  const [rating, setRating] = useState<number | null>(interview.feedback?.rating ?? 3);
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
          feedback: { rating: rating ?? undefined, notes: notes || undefined, nextSteps: nextSteps || undefined },
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

  const outcomeOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
  ];

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-md">
      <ModalHeader onClose={onClose}>
        <ModalTitle>Log Feedback</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="flex flex-col gap-4">
          <Select
            label="Outcome"
            options={outcomeOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as InterviewStatus)}
          />

          <div>
            <span className="block text-sm font-semibold text-slate-700 mb-2">How did it go?</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (rating ?? 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the interview feel? Any tough questions?"
          />

          <Input
            label="Next Steps"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="e.g. Second round next week, waiting for decision"
          />

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            Save
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function InterviewCard({ interview, onFeedback }: { interview: Interview; onFeedback: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const scheduled = new Date(interview.scheduledAt);
  const isPast = scheduled < new Date();

  return (
    <Card className="p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="text-sm font-bold text-slate-900">
              {interview.job ? `${interview.job.title} — ${interview.job.company}` : 'Unknown Job'}
            </h4>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
                STATUS_CLASSES[interview.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {STATUS_LABELS[interview.status]}
            </span>
          </div>

          <span className="text-xs font-bold text-blue-600 tracking-wide block mb-3">
            {TYPE_LABELS[interview.type]}
          </span>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {scheduled.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {scheduled.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {interview.duration ?? 60} min
              </span>
            </div>
            {interview.interviewer?.name && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{interview.interviewer.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
          {interview.meetingLink && (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Join meeting"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors p-2 h-9 w-9"
            >
              <Video className="w-4 h-4" />
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadICS(interview)}
            title="Download .ics"
            className="p-2"
          >
            <Download className="w-4 h-4" />
          </Button>
          {isPast && interview.status === 'scheduled' && (
            <Button size="sm" onClick={onFeedback} className="text-xs">
              Log Feedback
            </Button>
          )}
          {interview.status === 'completed' && interview.feedback && (
            <Button size="sm" variant="ghost" onClick={onFeedback} className="text-xs text-blue-600 hover:bg-blue-50">
              Edit Feedback
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="p-2"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
          {interview.location && (
            <div className="flex items-start gap-2 text-xs font-semibold text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <span>{interview.location}</span>
            </div>
          )}
          {interview.meetingLink && (
            <div className="flex items-start gap-2 text-xs">
              <LinkIcon className="w-4 h-4 text-slate-400 mt-0.5" />
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold break-all"
              >
                {interview.meetingLink}
              </a>
            </div>
          )}
          {interview.notes && (
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Notes
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {interview.notes}
              </p>
            </div>
          )}
          {interview.feedback && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Feedback
              </span>
              {interview.feedback.rating && (
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        (interview.feedback?.rating ?? 0) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              )}
              {interview.feedback.notes && (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                  {interview.feedback.notes}
                </p>
              )}
              {interview.feedback.nextSteps && (
                <p className="text-xs font-semibold text-slate-500 italic mt-0.5">
                  Next: {interview.feedback.nextSteps}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<Interview | null>(null);
  const [tabValue, setTabValue] = useState(0);

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
  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) >= now && i.status === 'scheduled');
  const past = interviews.filter((i) => new Date(i.scheduledAt) < now || i.status !== 'scheduled');
  const filtered = tabValue === 0 ? upcoming : tabValue === 1 ? past : interviews;

  return (
    <NavLayout title="Interviews" subtitle="Track scheduled interviews and log feedback">
      <ScheduleDialog
        open={showSchedule}
        jobs={jobs}
        onSuccess={() => {
          setShowSchedule(false);
          load();
        }}
        onClose={() => setShowSchedule(false)}
      />
      {feedbackTarget && (
        <FeedbackDialog
          open={!!feedbackTarget}
          interview={feedbackTarget}
          onSuccess={() => {
            setFeedbackTarget(null);
            load();
          }}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-6">
            {[
              { label: 'Upcoming', value: upcoming.length },
              { label: 'Past', value: past.length },
              {
                label: 'Strong',
                value: interviews.filter((i) => i.status === 'completed' && (i.feedback?.rating ?? 0) >= 4).length,
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</div>
                <div className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
          <Button onClick={() => setShowSchedule(true)} className="flex items-center gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Schedule Interview
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 self-start">
          {['Upcoming', 'Past', 'All'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setTabValue(idx)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tabValue === idx
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12 p-8 border-2 border-dashed border-slate-200 bg-transparent shadow-none hover:shadow-none">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              {tabValue === 0 ? 'No upcoming interviews' : 'No interviews found'}
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {tabValue === 0
                ? 'Schedule your next interview to track it here.'
                : 'No interviews match the selected filter.'}
            </p>
            {tabValue === 0 && (
              <Button onClick={() => setShowSchedule(true)} className="flex items-center gap-1.5 mx-auto">
                <Plus className="w-4 h-4" />
                Schedule Interview
              </Button>
            )}
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onFeedback={() => setFeedbackTarget(interview)}
              />
            ))}
          </div>
        )}
      </div>
    </NavLayout>
  );
}
