'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  Download,
  ExpandMore,
  ExpandLess,
  LocationOn,
  Link as LinkIcon,
  Person,
  Schedule,
  VideoCall,
} from '@mui/icons-material';

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

const STATUS_COLOR: Record<InterviewStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'default',
  no_show: 'error',
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
  ].filter(Boolean).join('\\n');

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//CareerPropel//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:interview-${interview.id}@careerpropel`,
    `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : '',
    interview.meetingLink ? `URL:${interview.meetingLink}` : '',
    interview.location ? `LOCATION:${interview.location}` : '',
    'END:VEVENT', 'END:VCALENDAR',
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
    jobId: '', type: 'technical' as InterviewType,
    scheduledAt: '', duration: '60',
    interviewerName: '', interviewerEmail: '', interviewerTitle: '',
    meetingLink: '', location: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jobId || !form.scheduledAt) { setError('Job and date/time are required.'); return; }
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Interview</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Job</InputLabel>
                <Select value={form.jobId} label="Job" onChange={(e) => setField('jobId', e.target.value)}>
                  <MenuItem value=""><em>Select a job…</em></MenuItem>
                  {jobs.map((j) => (
                    <MenuItem key={j.id} value={j.id}>{j.title} — {j.company}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Interview Type</InputLabel>
                <Select value={form.type} label="Interview Type" onChange={(e) => setField('type', e.target.value)}>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <MenuItem key={val} value={val}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Duration</InputLabel>
                <Select value={form.duration} label="Duration" onChange={(e) => setField('duration', e.target.value)}>
                  {[15, 30, 45, 60, 90, 120].map((d) => (
                    <MenuItem key={d} value={d}>{d} min</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Date & Time"
                type="datetime-local"
                required
                fullWidth
                value={form.scheduledAt}
                onChange={(e) => setField('scheduledAt', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Interviewer (optional)</Typography>
              </Divider>
            </Grid>
            <Grid size={6}>
              <TextField label="Name" fullWidth value={form.interviewerName} onChange={(e) => setField('interviewerName', e.target.value)} placeholder="Jane Smith" />
            </Grid>
            <Grid size={6}>
              <TextField label="Title" fullWidth value={form.interviewerTitle} onChange={(e) => setField('interviewerTitle', e.target.value)} placeholder="Engineering Manager" />
            </Grid>
            <Grid size={12}>
              <TextField label="Meeting Link" fullWidth type="url" value={form.meetingLink} onChange={(e) => setField('meetingLink', e.target.value)} placeholder="https://zoom.us/j/…" />
            </Grid>
            <Grid size={12}>
              <TextField label="Location / Address" fullWidth value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="123 Main St or Remote" />
            </Grid>
            <Grid size={12}>
              <TextField label="Notes" fullWidth multiline rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Preparation notes, what to bring, etc." />
            </Grid>
            {error && (
              <Grid size={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Schedule'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Feedback</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Outcome</InputLabel>
              <Select value={status} label="Outcome" onChange={(e) => setStatus(e.target.value as InterviewStatus)}>
                {(['completed', 'cancelled', 'no_show'] as InterviewStatus[]).map((s) => (
                  <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>How did it go?</Typography>
              <Rating
                value={rating}
                onChange={(_, v) => setRating(v)}
                size="large"
              />
            </Box>
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the interview feel? Any tough questions?"
            />
            <TextField
              label="Next Steps"
              fullWidth
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="e.g. Second round next week, waiting for decision"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function InterviewCard({ interview, onFeedback }: { interview: Interview; onFeedback: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const scheduled = new Date(interview.scheduledAt);
  const isPast = scheduled < new Date();

  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {interview.job ? `${interview.job.title} — ${interview.job.company}` : 'Unknown Job'}
              </Typography>
              <Chip label={STATUS_LABELS[interview.status]} size="small" color={STATUS_COLOR[interview.status]} />
            </Box>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500, display: 'block', mb: 1 }}>
              {TYPE_LABELS[interview.type]}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {scheduled.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {scheduled.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {interview.duration ?? 60} min
                </Typography>
              </Box>
              {interview.interviewer?.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{interview.interviewer.name}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {interview.meetingLink && (
              <IconButton size="small" component="a" href={interview.meetingLink} target="_blank" rel="noopener noreferrer" title="Join meeting" sx={{ color: 'primary.main' }}>
                <VideoCall fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={() => downloadICS(interview)} title="Download .ics" sx={{ color: 'text.secondary' }}>
              <Download fontSize="small" />
            </IconButton>
            {isPast && interview.status === 'scheduled' && (
              <Button size="small" variant="outlined" onClick={onFeedback} sx={{ fontSize: '0.75rem' }}>
                Log Feedback
              </Button>
            )}
            {interview.status === 'completed' && interview.feedback && (
              <Button size="small" variant="text" onClick={onFeedback} sx={{ fontSize: '0.75rem' }}>
                Edit Feedback
              </Button>
            )}
            <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={{ color: 'text.secondary' }}>
              {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        {expanded && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', mx: -2.5, mb: -2.5, px: 2.5, pb: 2, borderRadius: '0 0 12px 12px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {interview.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">{interview.location}</Typography>
                </Box>
              )}
              {interview.meetingLink && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography component="a" href={interview.meetingLink} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {interview.meetingLink}
                  </Typography>
                </Box>
              )}
              {interview.notes && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>Notes</Typography>
                  <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>{interview.notes}</Typography>
                </Box>
              )}
              {interview.feedback && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>Feedback</Typography>
                  {interview.feedback.rating && (
                    <Rating value={interview.feedback.rating} size="small" readOnly />
                  )}
                  {interview.feedback.notes && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, whiteSpace: 'pre-wrap' }}>{interview.feedback.notes}</Typography>
                  )}
                  {interview.feedback.nextSteps && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                      Next: {interview.feedback.nextSteps}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
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

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) >= now && i.status === 'scheduled');
  const past = interviews.filter((i) => new Date(i.scheduledAt) < now || i.status !== 'scheduled');
  const filtered = tabValue === 0 ? upcoming : tabValue === 1 ? past : interviews;

  return (
    <NavLayout title="Interviews" subtitle="Track scheduled interviews and log feedback">
      <ScheduleDialog
        open={showSchedule}
        jobs={jobs}
        onSuccess={() => { setShowSchedule(false); load(); }}
        onClose={() => setShowSchedule(false)}
      />
      {feedbackTarget && (
        <FeedbackDialog
          open={!!feedbackTarget}
          interview={feedbackTarget}
          onSuccess={() => { setFeedbackTarget(null); load(); }}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      <Box sx={{ p: 3, maxWidth: 860, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Upcoming', value: upcoming.length },
              { label: 'Past', value: past.length },
              { label: 'Strong', value: interviews.filter((i) => i.status === 'completed' && (i.feedback?.rating ?? 0) >= 4).length },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </Box>
            ))}
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowSchedule(true)}>
            Schedule Interview
          </Button>
        </Box>

        {/* Filter Tabs */}
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, bgcolor: 'grey.100', borderRadius: 1.5, p: 0.5, minHeight: 36 }}>
          <Tab label="Upcoming" sx={{ minHeight: 32, borderRadius: 1 }} />
          <Tab label="Past" sx={{ minHeight: 32, borderRadius: 1 }} />
          <Tab label="All" sx={{ minHeight: 32, borderRadius: 1 }} />
        </Tabs>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filtered.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8, border: '1px dashed', borderColor: 'divider' }}>
            <CardContent>
              <CalendarMonth sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {tabValue === 0 ? 'No upcoming interviews' : 'No interviews found'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {tabValue === 0
                  ? 'Schedule your next interview to track it here.'
                  : 'No interviews match the selected filter.'}
              </Typography>
              {tabValue === 0 && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setShowSchedule(true)}>
                  Schedule Interview
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onFeedback={() => setFeedbackTarget(interview)}
              />
            ))}
          </Box>
        )}
      </Box>
    </NavLayout>
  );
}
