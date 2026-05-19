'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { InterviewPrepWorkspace } from '@/components/InterviewPrep/InterviewPrepWorkspace';
import { STAGE_LABELS, STAGE_COLORS, JobStage } from '@/types/job';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { RecordVoiceOver, Search } from '@mui/icons-material';
import Link from 'next/link';

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

export default function InterviewPrepPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchJobs(); }, []);

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
    (j) => j.title.toLowerCase().includes(searchText.toLowerCase()) ||
      j.company.toLowerCase().includes(searchText.toLowerCase())
  );
  const interviewJobs = filtered.filter((j) => PREP_ELIGIBLE_STAGES.has(j.stage));
  const otherJobs = filtered.filter((j) => !PREP_ELIGIBLE_STAGES.has(j.stage));

  return (
    <NavLayout
      title="Interview Preparation"
      subtitle="AI-powered prep kit for every role — company intel, behavioral stories, technical practice"
    >
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by job title or company..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ mb: 3, maxWidth: 440 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : jobs.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 10 }}>
            <CardContent>
              <RecordVoiceOver sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No jobs tracked yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add jobs from your dashboard to start preparing.
              </Typography>
              <Button variant="contained" component={Link} href="/dashboard">Go to Dashboard</Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {interviewJobs.length > 0 && (
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
                  Active Pipeline ({interviewJobs.length})
                </Typography>
                <Grid container spacing={2}>
                  {interviewJobs.map((job) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={job.id}>
                      <PrepJobCard job={job} onPrepare={setSelectedJobId} highlight />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {otherJobs.length > 0 && (
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
                  All Jobs ({otherJobs.length})
                </Typography>
                <Grid container spacing={2}>
                  {otherJobs.map((job) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={job.id}>
                      <PrepJobCard job={job} onPrepare={setSelectedJobId} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {selectedJobId && (
        <InterviewPrepWorkspace jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </NavLayout>
  );
}

interface PrepJobCardProps { job: Job; onPrepare: (id: string) => void; highlight?: boolean; }

function PrepJobCard({ job, onPrepare, highlight }: PrepJobCardProps) {
  const colors = STAGE_COLORS[job.stage] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: highlight ? 'primary.light' : 'divider',
        bgcolor: highlight ? 'primary.50' : 'background.paper',
        '&:hover': { boxShadow: 3 },
        transition: 'box-shadow 0.2s',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}>
            {job.company}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
              {STAGE_LABELS[job.stage] ?? job.stage}
            </span>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => onPrepare(job.id)}
          sx={{ flexShrink: 0 }}
        >
          Prepare
        </Button>
      </CardContent>
    </Card>
  );
}
