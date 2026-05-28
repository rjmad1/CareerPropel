'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, Alert, IconButton, Tooltip, Divider,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReplayIcon from '@mui/icons-material/Replay'
import WarningIcon from '@mui/icons-material/Warning'

interface QueueData {
  depth: { agentType: string; status: string; count: number }[]
  recentFailed: { id: string; agentType: string; userId: string; errorMessage: string | null; failureClassification: string | null; createdAt: string }[]
  stalled: { id: string; agentType: string; userId: string; startedAt: string | null; updatedAt: string }[]
  timestamp: string
}

interface HealthData {
  runtime: { activeExecutions: number; failedExecutions: number; queuedExecutions: number; recentErrors: number; activeWorkflows: number }
  authorization: { checks: number; denials: number; escalations: number }
  timestamp: string
}

function StatPill({ label, value, color = '#e6edf3' }: { label: string; value: number; color?: string }) {
  return (
    <Box sx={{ textAlign: 'center', px: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: '#8b949e', fontSize: 10, textTransform: 'uppercase' }}>{label}</Typography>
    </Box>
  )
}

export default function AdminRuntimePage() {
  const [queue, setQueue] = useState<QueueData | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replaying, setReplaying] = useState<string | null>(null)
  const [replayMsg, setReplayMsg] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [qRes, hRes] = await Promise.all([
        fetch('/api/admin/runtime/queues'),
        fetch('/api/admin/runtime/health'),
      ])
      const qd = await qRes.json(); setQueue(qd.data ?? qd)
      const hd = await hRes.json(); setHealth(hd.data ?? hd)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleReplay = async (executionId: string) => {
    setReplaying(executionId)
    try {
      const res = await fetch('/api/admin/runtime/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error?.message ?? 'Failed')
      setReplayMsg(`Execution ${executionId.slice(0, 8)}… re-queued`)
      await loadData()
    } catch (err) {
      setError(String(err))
    } finally {
      setReplaying(null)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress size={28} /></Box>

  const rt = health?.runtime
  const depth = queue?.depth ?? []

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3', flex: 1 }}>Runtime Operations</Typography>
        <Tooltip title="Refresh"><IconButton onClick={loadData} size="small" sx={{ color: '#8b949e' }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {replayMsg && <Alert severity="success" onClose={() => setReplayMsg(null)} sx={{ mb: 2 }}>{replayMsg}</Alert>}

      {/* Health summary strip */}
      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 0, alignItems: 'center', pb: '12px !important' }}>
          <StatPill label="Active" value={rt?.activeExecutions ?? 0} color="#3fb950" />
          <Divider orientation="vertical" flexItem sx={{ borderColor: '#30363d', mx: 1 }} />
          <StatPill label="Queued" value={rt?.queuedExecutions ?? 0} />
          <Divider orientation="vertical" flexItem sx={{ borderColor: '#30363d', mx: 1 }} />
          <StatPill label="Failed" value={rt?.failedExecutions ?? 0} color={rt && rt.failedExecutions > 0 ? '#f85149' : '#e6edf3'} />
          <Divider orientation="vertical" flexItem sx={{ borderColor: '#30363d', mx: 1 }} />
          <StatPill label="Workflows" value={rt?.activeWorkflows ?? 0} />
          <Divider orientation="vertical" flexItem sx={{ borderColor: '#30363d', mx: 1 }} />
          <StatPill label="1h Errors" value={rt?.recentErrors ?? 0} color={rt && rt.recentErrors > 5 ? '#d29922' : '#e6edf3'} />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Queue depth by agent type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="overline" sx={{ color: '#58a6ff', fontSize: 10, letterSpacing: 1 }}>Queue Depth</Typography>
          <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, borderColor: '#30363d' } }}>
                  <TableCell>Agent Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depth.length === 0
                  ? <TableRow><TableCell colSpan={3} sx={{ color: '#8b949e', textAlign: 'center' }}>Queue empty</TableCell></TableRow>
                  : depth.map((d, i) => (
                      <TableRow key={i} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 } }}>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{d.agentType}</Typography></TableCell>
                        <TableCell><Chip label={d.status} size="small" sx={{ fontSize: 10, bgcolor: '#21262d', color: '#8b949e' }} /></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{d.count}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Stalled executions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="overline" sx={{ color: '#d29922', fontSize: 10, letterSpacing: 1 }}>Stalled Executions</Typography>
            {(queue?.stalled?.length ?? 0) > 0 && <WarningIcon fontSize="small" sx={{ color: '#d29922' }} />}
          </Box>
          <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, borderColor: '#30363d' } }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Last Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(queue?.stalled?.length ?? 0) === 0
                  ? <TableRow><TableCell colSpan={3} sx={{ color: '#8b949e', textAlign: 'center' }}>None</TableCell></TableRow>
                  : queue!.stalled.map((s) => (
                      <TableRow key={s.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 } }}>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#d29922' }}>{s.id.slice(0, 8)}…</Typography></TableCell>
                        <TableCell>{s.agentType}</TableCell>
                        <TableCell><Typography variant="caption" sx={{ color: '#8b949e' }}>{new Date(s.updatedAt).toLocaleTimeString()}</Typography></TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Recent failures + replay */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="overline" sx={{ color: '#f85149', fontSize: 10, letterSpacing: 1 }}>Recent Failures (24h)</Typography>
          <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, borderColor: '#30363d' } }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Replay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(queue?.recentFailed?.length ?? 0) === 0
                  ? <TableRow><TableCell colSpan={3} sx={{ color: '#8b949e', textAlign: 'center' }}>None</TableCell></TableRow>
                  : queue!.recentFailed.slice(0, 15).map((f) => (
                      <TableRow key={f.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 } }}>
                        <TableCell>
                          <Tooltip title={f.errorMessage ?? 'No error message'}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#f85149', cursor: 'help' }}>{f.id.slice(0, 8)}…</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{f.agentType}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Re-queue this execution">
                            <span>
                              <IconButton size="small" sx={{ color: '#58a6ff' }}
                                disabled={replaying === f.id}
                                onClick={() => handleReplay(f.id)}>
                                {replaying === f.id ? <CircularProgress size={14} /> : <ReplayIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  )
}
