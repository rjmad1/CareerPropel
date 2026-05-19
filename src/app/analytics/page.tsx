'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { AnalyticsExportButtons } from '@/components/analytics/AnalyticsExportButtons';
import { calculateAnalytics, AnalyticsMetrics } from '@/lib/analytics/export';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Refresh, BarChart } from '@mui/icons-material';

interface Job {
  id: string;
  stage: string;
  company: string;
  minSalary?: number;
  maxSalary?: number;
  matchScore?: number;
  createdAt: string;
}

const STAGE_LABELS: Record<string, string> = {
  SOURCED: 'Sourced', INTERESTED: 'Interested', TAILORING: 'Tailoring',
  APPLIED: 'Applied', RECRUITER_SCREEN: 'Recruiter Screen', HIRING_MANAGER: 'Hiring Manager',
  TECHNICAL_INTERVIEW: 'Technical Interview', SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral', FINAL_ROUND: 'Final Round', OFFER: 'Offer',
  NEGOTIATION: 'Negotiation', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
};

const KPI_COLORS: Record<string, string> = {
  blue: '#2563EB', green: '#10B981', purple: '#7C3AED', red: '#EF4444',
};

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?limit=500');
      const json = await res.json();
      setJobs(Array.isArray(json) ? json : json.data ?? []);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  const metrics: AnalyticsMetrics = useMemo(() => calculateAnalytics(jobs as any), [jobs]);
  const stageBreakdownEntries = Object.entries(metrics.stageBreakdown).filter(([, c]) => c > 0).sort(([, a], [, b]) => b - a);
  const maxStageCount = Math.max(...stageBreakdownEntries.map(([, c]) => c), 1);

  return (
    <NavLayout title="Analytics" subtitle="Pipeline performance, conversion rates, and salary insights">
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">{jobs.length} total applications analysed</Typography>
          <Button startIcon={<Refresh />} onClick={fetchJobs} disabled={loading} size="small">Refresh</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : jobs.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 10 }}>
            <CardContent>
              <BarChart sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No data yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Track job applications to see analytics and conversion rates.
              </Typography>
              <Button variant="contained" href="/dashboard">Add Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* KPI Cards */}
            <Grid container spacing={2}>
              {[
                { label: 'Total Applications', value: metrics.totalApplications, color: 'blue' },
                { label: 'Offer Rate', value: `${metrics.offerRate.toFixed(1)}%`, color: 'green' },
                { label: 'Interview Rate', value: `${metrics.interviewRate.toFixed(1)}%`, color: 'purple' },
                { label: 'Rejection Rate', value: `${metrics.rejectionRate.toFixed(1)}%`, color: 'red' },
              ].map((kpi) => (
                <Grid size={{ xs: 6, sm: 3 }} key={kpi.label}>
                  <Card>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} gutterBottom>{kpi.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: KPI_COLORS[kpi.color] }}>{kpi.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Salary + Outcomes */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Salary Range</Typography>
                    {metrics.salaryMetrics.average > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {[
                          { label: 'Average', value: metrics.salaryMetrics.average, bold: true, color: 'success.main' },
                          { label: 'Median', value: metrics.salaryMetrics.median },
                          { label: 'Highest', value: metrics.salaryMetrics.max },
                          { label: 'Lowest', value: metrics.salaryMetrics.min, muted: true },
                        ].map((row) => (
                          <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color={row.muted ? 'text.disabled' : 'text.secondary'}>{row.label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: row.bold ? 700 : 500, color: row.color ?? (row.muted ? 'text.disabled' : 'text.primary') }}>
                              ${Math.round(row.value).toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
                        No salary data — add salary ranges to jobs for insights.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Outcomes Summary</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {Object.entries(metrics.outcomesSummary).filter(([, v]) => v > 0).map(([key, count]) => (
                        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ width: 90, textTransform: 'capitalize' }}>{key}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(count / metrics.totalApplications) * 100}
                              sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100' }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, width: 24, textAlign: 'right' }}>{count}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Pipeline Breakdown */}
            {stageBreakdownEntries.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Pipeline Breakdown</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {stageBreakdownEntries.map(([stage, count]) => (
                      <Box key={stage} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 150, flexShrink: 0 }}>
                          {STAGE_LABELS[stage] ?? stage}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(count / maxStageCount) * 100}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, width: 28, textAlign: 'right' }}>{count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Top Companies */}
            {metrics.topCompanies.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Companies</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell align="right">Applications</TableCell>
                          <TableCell align="right">Offer Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.topCompanies.slice(0, 8).map((co) => (
                          <TableRow key={co.name} hover>
                            <TableCell>{co.name}</TableCell>
                            <TableCell align="right">{co.applications}</TableCell>
                            <TableCell align="right">
                              {co.successRate > 0 ? (
                                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                                  {co.successRate.toFixed(0)}%
                                </Typography>
                              ) : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Export */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Export Reports</Typography>
                <AnalyticsExportButtons metrics={metrics} />
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </NavLayout>
  );
}
