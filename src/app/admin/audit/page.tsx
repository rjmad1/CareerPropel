'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, TablePagination, Tabs, Tab, Grid, Card, CardContent,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

interface AuditLog {
  id: string
  actorEmail: string
  targetEmail: string | null
  permission: string
  decision: 'allow' | 'deny'
  reason: string | null
  resource: string | null
  ipAddress: string | null
  createdAt: string
}

interface SecurityEvent {
  actorEmail?: string
  count?: number
  permission?: string
  decision?: string
  createdAt?: string
  email?: string
  action?: string
  severity?: string
}

interface SecurityData {
  period: { hours: number; since: string }
  denials: { actorEmail: string; count: number }[]
  escalationAttempts: AuditLog[]
  impersonations: AuditLog[]
  criticalAuditEvents: SecurityEvent[]
}

export default function AdminAuditPage() {
  const [tab, setTab] = useState(0)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [security, setSecurity] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [actorFilter, setActorFilter] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('')

  const loadAudit = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: '50',
        ...(actorFilter ? { actor: actorFilter } : {}),
        ...(decisionFilter ? { decision: decisionFilter } : {}),
      })
      const res = await fetch(`/api/admin/audit?${params}`)
      const d = await res.json()
      setLogs(d.data?.logs ?? d.logs ?? [])
      setTotal(d.data?.total ?? d.total ?? 0)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [page, actorFilter, decisionFilter])

  const loadSecurity = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/security/events?hours=24')
      const d = await res.json()
      setSecurity(d.data ?? d)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { tab === 0 ? loadAudit() : loadSecurity() }, [tab, loadAudit, loadSecurity])

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3', flex: 1 }}>Audit & Security</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => tab === 0 ? loadAudit() : loadSecurity()} size="small" sx={{ color: '#8b949e' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: '1px solid #30363d', '& .MuiTabs-indicator': { backgroundColor: '#58a6ff' } }}>
        <Tab label="Authorization Log" sx={{ color: '#8b949e', '&.Mui-selected': { color: '#58a6ff' }, fontSize: 13 }} />
        <Tab label="Security Events" sx={{ color: '#8b949e', '&.Mui-selected': { color: '#58a6ff' }, fontSize: 13 }} />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField size="small" placeholder="Filter by actor…" value={actorFilter}
              onChange={(e) => { setActorFilter(e.target.value); setPage(0) }}
              sx={{ width: 260, '& .MuiOutlinedInput-root': { bgcolor: '#161b22', color: '#e6edf3', borderColor: '#30363d' } }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: '#8b949e' }}>Decision</InputLabel>
              <Select value={decisionFilter} label="Decision"
                onChange={(e) => { setDecisionFilter(e.target.value); setPage(0) }}
                sx={{ color: '#e6edf3', bgcolor: '#161b22', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' } }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="allow">Allow</MenuItem>
                <MenuItem value="deny">Deny</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress size={24} /></Box> : (
            <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderColor: '#30363d' } }}>
                    <TableCell>Actor</TableCell>
                    <TableCell>Permission</TableCell>
                    <TableCell>Decision</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 }, '&:hover': { bgcolor: '#1c2128' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{log.actorEmail}</TableCell>
                      <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#a5d6ff' }}>{log.permission}</Typography></TableCell>
                      <TableCell>
                        <Chip label={log.decision} size="small"
                          color={log.decision === 'allow' ? 'success' : 'error'}
                          sx={{ fontSize: 10, height: 18 }} />
                      </TableCell>
                      <TableCell sx={{ color: '#8b949e', fontSize: 11 }}>{log.reason ?? '—'}</TableCell>
                      <TableCell sx={{ color: '#8b949e', fontSize: 11 }}>{log.resource ?? '—'}</TableCell>
                      <TableCell sx={{ color: '#8b949e', fontSize: 11 }}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div" count={total} page={page}
                onPageChange={(_, p) => setPage(p)} rowsPerPage={50}
                rowsPerPageOptions={[50]} sx={{ color: '#8b949e', borderTop: '1px solid #30363d' }} />
            </TableContainer>
          )}
        </>
      )}

      {tab === 1 && security && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: '#f85149', fontSize: 10 }}>Top Denial Actors (24h)</Typography>
                  {security.denials.slice(0, 8).map((d) => (
                    <Box key={d.actorEmail} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#e6edf3' }}>{d.actorEmail}</Typography>
                      <Chip label={d.count} size="small" color="error" sx={{ fontSize: 10, height: 18 }} />
                    </Box>
                  ))}
                  {security.denials.length === 0 && <Typography variant="caption" sx={{ color: '#8b949e' }}>No denials</Typography>}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: '#d29922', fontSize: 10 }}>Escalation Attempts (24h)</Typography>
                  {security.escalationAttempts.slice(0, 8).map((e) => (
                    <Box key={e.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#e6edf3' }}>{e.actorEmail}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#d29922' }}>{e.permission}</Typography>
                    </Box>
                  ))}
                  {security.escalationAttempts.length === 0 && <Typography variant="caption" sx={{ color: '#8b949e' }}>None</Typography>}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: '#58a6ff', fontSize: 10 }}>Impersonation Events (24h)</Typography>
                  {security.impersonations.slice(0, 8).map((e) => (
                    <Box key={e.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#e6edf3' }}>{e.actorEmail}</Typography>
                      <Typography variant="caption" sx={{ color: '#58a6ff' }}>→ {e.targetEmail ?? '?'}</Typography>
                    </Box>
                  ))}
                  {security.impersonations.length === 0 && <Typography variant="caption" sx={{ color: '#8b949e' }}>None</Typography>}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
