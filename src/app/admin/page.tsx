'use client'

import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Alert, Divider,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SecurityIcon from '@mui/icons-material/Security'

interface RuntimeHealth {
  runtime: {
    activeExecutions: number
    failedExecutions: number
    queuedExecutions: number
    recentErrors: number
    activeWorkflows: number
  }
  authorization: {
    checks: number
    denials: number
    escalations: number
    impersonations: number
  }
  timestamp: string
}

function StatCard({
  label, value, icon, color = '#e6edf3', sub,
}: {
  label: string; value: string | number; icon: React.ReactNode; color?: string; sub?: string
}) {
  return (
    <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ color: '#8b949e', display: 'flex' }}>{icon}</Box>
          <Typography variant="caption" sx={{ color: '#8b949e', textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.8 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</Typography>
        {sub && <Typography variant="caption" sx={{ color: '#8b949e' }}>{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

export default function AdminOverviewPage() {
  const [health, setHealth] = useState<RuntimeHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/runtime/health')
      .then((r) => r.json())
      .then((d) => setHealth(d.data ?? d))
      .catch(() => setError('Failed to load runtime health'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress size={28} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  const rt = health?.runtime
  const az = health?.authorization

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3' }}>Platform Overview</Typography>
        <Typography variant="caption" sx={{ color: '#8b949e' }}>
          Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}
        </Typography>
      </Box>

      <Typography variant="overline" sx={{ color: '#58a6ff', fontSize: 10, letterSpacing: 1.2 }}>Runtime</Typography>
      <Grid container spacing={2} sx={{ mb: 3, mt: 0 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Active Executions" value={rt?.activeExecutions ?? '—'} icon={<CheckCircleIcon fontSize="small" />} color="#3fb950" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Queued" value={rt?.queuedExecutions ?? '—'} icon={<CheckCircleIcon fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Failed (all-time)" value={rt?.failedExecutions ?? '—'} icon={<ErrorIcon fontSize="small" />} color={rt && rt.failedExecutions > 0 ? '#f85149' : '#e6edf3'} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Errors (1h)" value={rt?.recentErrors ?? '—'} icon={<ErrorIcon fontSize="small" />} color={rt && rt.recentErrors > 5 ? '#f85149' : '#e6edf3'} />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: '#30363d', mb: 2 }} />

      <Typography variant="overline" sx={{ color: '#58a6ff', fontSize: 10, letterSpacing: 1.2 }}>Authorization</Typography>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Total Checks" value={az?.checks ?? 0} icon={<SecurityIcon fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Denials" value={az?.denials ?? 0} icon={<SecurityIcon fontSize="small" />} color={az && az.denials > 0 ? '#d29922' : '#e6edf3'} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Escalation Attempts" value={az?.escalations ?? 0} icon={<SecurityIcon fontSize="small" />} color={az && az.escalations > 0 ? '#f85149' : '#e6edf3'} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Impersonations" value={az?.impersonations ?? 0} icon={<PeopleIcon fontSize="small" />} color={az && az.impersonations > 0 ? '#d29922' : '#e6edf3'} />
        </Grid>
      </Grid>

      {rt && rt.failedExecutions > 10 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          High failure count detected — review the <strong>Runtime</strong> console for details.
        </Alert>
      )}
    </Box>
  )
}
