'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { JobDetailPanel } from '@/domains/jobs';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  Add,
  Refresh,
  RecordVoiceOver,
  MonetizationOn,
  Person,
  BarChart,
  Work,
  ArrowForward,
} from '@mui/icons-material';

interface Job {
  id: string;
  title: string;
  company: string;
  stage: string;
  url?: string;
  createdAt: string;
}

const STAGE_COLOR_MAP: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
  SOURCED: 'default',
  INTERESTED: 'primary',
  RESUME_TAILORING: 'secondary',
  APPLIED: 'primary',
  RECRUITER_SCREEN: 'info',
  HIRING_MANAGER: 'warning',
  TECHNICAL_INTERVIEW: 'secondary',
  SYSTEM_DESIGN: 'secondary',
  BEHAVIORAL: 'warning',
  FINAL_ROUND: 'warning',
  OFFER: 'success',
  NEGOTIATION: 'success',
  REJECTED: 'error',
  ARCHIVED: 'default',
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
  { href: '/interview-prep', label: 'Interview Prep', description: 'AI-generated prep kits for every role', icon: RecordVoiceOver, color: '#EFF6FF' },
  { href: '/offers', label: 'Offers', description: 'Compare and evaluate compensation packages', icon: MonetizationOn, color: '#F0FDF4' },
  { href: '/profile', label: 'Profile', description: 'Manage skills, achievements, and ATS score', icon: Person, color: '#FEF3C7' },
  { href: '/analytics', label: 'Analytics', description: 'Pipeline conversion rates and salary insights', icon: BarChart, color: '#F5F3FF' },
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
  }

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

  if (status === 'loading') return null;
  if (!session) return null;

  const userName = session.user?.email ? session.user.email.split('@')[0] : '';

  return (
    <NavLayout
      title="Dashboard"
      subtitle={`Welcome back${userName ? ', ' + userName : ''}! Here's your career pipeline.`}
    >
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Navigation Cards */}
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
          Quick Access
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {QUICK_LINKS.map((link) => {
            const IconComponent = link.icon;
            return (
              <Grid size={{ xs: 6, sm: 3 }} key={link.href}>
                <Card sx={{ height: '100%', bgcolor: link.color, border: '1px solid', borderColor: 'divider' }}>
                  <CardActionArea component={Link} href={link.href} sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <IconComponent sx={{ color: 'primary.main', mb: 1, fontSize: 28 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                      {link.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                      {link.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Jobs Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Recent Jobs {jobs.length > 0 && `(${jobs.length})`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={fetchJobs} disabled={loading} title="Refresh">
              <Refresh fontSize="small" className={loading ? 'animate-spin' : ''} />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => setShowAddForm(true)}
            >
              Add Job
            </Button>
          </Box>
        </Box>

        {/* Add Job Dialog */}
        <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Track New Job</DialogTitle>
          <form onSubmit={handleAddJob}>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Job Title"
                    required
                    fullWidth
                    placeholder="e.g. Senior Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Company"
                    required
                    fullWidth
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={submitLoading}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Job URL (optional)"
                    fullWidth
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitLoading}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setShowAddForm(false)} disabled={submitLoading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitLoading}>
                {submitLoading ? 'Adding...' : 'Add Job'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Jobs List */}
        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Work sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No jobs tracked yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start tracking applications to manage your pipeline.
              </Typography>
              <Button variant="contained" onClick={() => setShowAddForm(true)} startIcon={<Add />}>
                Add Your First Job
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {jobs.map((job, idx) => {
                const sk = stageKey(job.stage);
                return (
                  <ListItem
                    key={job.id}
                    data-testid="job-card"
                    divider={idx < jobs.length - 1}
                    onClick={() => setSelectedJobId(job.id)}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      gap: 2,
                    }}
                  >
                    <ListItemText
                      primary={job.title}
                      secondary={job.company}
                      slotProps={{ primary: { sx: { fontWeight: 500 } }, secondary: { sx: { fontSize: '0.8125rem' } } }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                      <Chip
                        label={STAGE_LABELS[sk] ?? job.stage}
                        size="small"
                        color={STAGE_COLOR_MAP[sk] ?? 'default'}
                        variant="outlined"
                      />
                      <Button
                        component={Link}
                        href="/interview-prep"
                        size="small"
                        endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        Prepare
                      </Button>
                    </Box>
                  </ListItem>
                );
              })}
              {jobs.length >= 20 && (
                <ListItem sx={{ bgcolor: 'grey.50', justifyContent: 'center', py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing most recent 20 jobs
                  </Typography>
                </ListItem>
              )}
            </List>
          )}
        </Card>

        {/* Auth Status */}
        <Alert severity="success" sx={{ mt: 3 }}>
          Authenticated as <strong>{session.user?.email}</strong> — all API endpoints secured.
        </Alert>
      </Box>

      {selectedJobId && (
        <JobDetailPanel
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </NavLayout>
  );
}
