'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, Alert, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BugReportIcon from '@mui/icons-material/BugReport'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

interface DLQItem {
  id: string
  agentType: string
  userId: string
  errorMessage: string | null
  correlationId: string | null
  createdAt: string
}

interface GovernanceReport {
  isReplayable: boolean
  classification: string
  governance: {
    isReplayable: boolean
    checks: {
      providerHealthy: boolean
      recencyGatePassed: boolean
      idempotencyVerified: boolean
      userQuotaPassed: boolean
    }
    providerReport: {
      providerId: string
      status: string
      degradationScore: number
      failureRate: number
      p95LatencyMs: number
    }
    reason: string[]
  }
}

export default function AdminDLQPage() {
  const [items, setItems] = useState<DLQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [report, setReport] = useState<GovernanceReport | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [justification, setJustification] = useState('Operator recovery action')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const loadDLQ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/runtime/queues')
      const d = await res.json()
      if (!res.ok) throw new Error(d.error?.message || 'Failed to load failed queue list')
      // Map recentFailed to items
      setItems(d.recentFailed || [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDLQ()
  }, [loadDLQ])

  const handleDryRun = async (executionId: string) => {
    setActioningId(executionId)
    setError(null)
    setReport(null)
    try {
      const res = await fetch('/api/ops/dlq/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId, dryRun: true }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Dry run failed')
      setReport(d)
      setSelectedId(executionId)
      setDialogOpen(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActioningId(null)
    }
  }

  const handleReplay = async (executionId: string, forceJustification?: string) => {
    setActioningId(executionId)
    setError(null)
    setStatusMsg(null)
    try {
      const res = await fetch('/api/ops/dlq/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionId,
          dryRun: false,
          justification: forceJustification || justification,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Replay failed')
      setStatusMsg(`Success: Requeued execution ${executionId.slice(0, 8)}… back to BullMQ worker pipeline.`)
      setDialogOpen(false)
      await loadDLQ()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActioningId(null)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3', flex: 1 }}>
          Dead-Letter Queue (DLQ) & Operator Recovery
        </Typography>
        <Tooltip title="Refresh DLQ list">
          <IconButton onClick={loadDLQ} size="small" sx={{ color: '#8b949e' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, bgcolor: '#2a1a1a', border: '1px solid #f85149', color: '#ff7b72' }}>
          {error}
        </Alert>
      )}

      {statusMsg && (
        <Alert severity="success" onClose={() => setStatusMsg(null)} sx={{ mb: 3, bgcolor: '#1a2a1a', border: '1px solid #3fb950', color: '#56d364' }}>
          {statusMsg}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, borderColor: '#30363d', fontWeight: 600 } }}>
              <TableCell>Execution ID</TableCell>
              <TableCell>Agent Type</TableCell>
              <TableCell>User (Candidate)</TableCell>
              <TableCell>Failed At</TableCell>
              <TableCell>Correlation ID</TableCell>
              <TableCell align="right">Recovery Tooling</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={24} sx={{ color: '#58a6ff' }} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ color: '#8b949e', textAlign: 'center', py: 4 }}>
                  No failed dead-letter runs found in the past 24 hours. Platform is healthy.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 } }}>
                  <TableCell>
                    <Tooltip title={item.errorMessage || 'No error recorded'}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#f85149', cursor: 'help', fontWeight: 600 }}>
                        {item.id.slice(0, 8)}…
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.agentType} size="small" sx={{ bgcolor: '#21262d', color: '#c9d1d9', fontSize: 10, fontFamily: 'monospace' }} />
                  </TableCell>
                  <TableCell>{item.userId}</TableCell>
                  <TableCell sx={{ color: '#8b949e' }}>{new Date(item.createdAt).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#8b949e' }}>
                      {item.correlationId ? item.correlationId.slice(0, 12) + '…' : 'None'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<BugReportIcon fontSize="small" />}
                      disabled={actioningId === item.id}
                      onClick={() => handleDryRun(item.id)}
                      sx={{ fontSize: 10, py: 0.2, textTransform: 'none', borderColor: '#d29922', color: '#d29922' }}
                    >
                      Dry-Run
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<PlayArrowIcon fontSize="small" />}
                      disabled={actioningId === item.id}
                      onClick={() => handleReplay(item.id)}
                      sx={{ fontSize: 10, py: 0.2, textTransform: 'none', bgcolor: '#238636', color: '#fff', '&:hover': { bgcolor: '#2ea44f' } }}
                    >
                      Replay
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Governance verification report dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#e6edf3', minWidth: 500 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16, borderBottom: '1px solid #30363d', pb: 1.5 }}>
          DLQ Replay Governance Report
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {report && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Failure Classification</Typography>
                  <Chip
                    label={report.classification}
                    color={report.classification === 'TRANSIENT' ? 'info' : 'error'}
                    size="small"
                    sx={{ fontWeight: 600, mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Replay Authorisation</Typography>
                  <Chip
                    label={report.isReplayable ? 'APPROVED' : 'REJECTED'}
                    color={report.isReplayable ? 'success' : 'error'}
                    icon={report.isReplayable ? <CheckCircleIcon /> : <WarningIcon />}
                    size="small"
                    sx={{ fontWeight: 700, mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#58a6ff' }}>
                Governance Gates Status
              </Typography>
              <Box sx={{ bgcolor: '#0f1117', p: 2, borderRadius: 1, border: '1px solid #30363d', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>1. LLM Provider Health Gate</Typography>
                  <Chip
                    label={report.governance.checks.providerHealthy ? 'PASS' : 'FAIL'}
                    size="small"
                    color={report.governance.checks.providerHealthy ? 'success' : 'error'}
                    sx={{ height: 18, fontSize: 10 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>2. 24h Recency Gate</Typography>
                  <Chip
                    label={report.governance.checks.recencyGatePassed ? 'PASS' : 'FAIL'}
                    size="small"
                    color={report.governance.checks.recencyGatePassed ? 'success' : 'error'}
                    sx={{ height: 18, fontSize: 10 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>3. Idempotency & Duplicate Gate</Typography>
                  <Chip
                    label={report.governance.checks.idempotencyVerified ? 'PASS' : 'FAIL'}
                    size="small"
                    color={report.governance.checks.idempotencyVerified ? 'success' : 'error'}
                    sx={{ height: 18, fontSize: 10 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>4. User Daily Execution Budget</Typography>
                  <Chip
                    label={report.governance.checks.userQuotaPassed ? 'PASS' : 'FAIL'}
                    size="small"
                    color={report.governance.checks.userQuotaPassed ? 'success' : 'error'}
                    sx={{ height: 18, fontSize: 10 }}
                  />
                </Box>
              </Box>

              {report.governance.reason.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f85149', mb: 1 }}>
                    Gate Fail Reasons
                  </Typography>
                  {report.governance.reason.map((r, i) => (
                    <Typography key={i} variant="caption" sx={{ color: '#ff7b72', display: 'block', pl: 1 }}>
                      • {r}
                    </Typography>
                  ))}
                </Box>
              )}

              <TextField
                fullWidth
                label="Replay Audit Justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                size="small"
                variant="outlined"
                slotProps={{
                  inputLabel: { style: { color: '#8b949e' } },
                  input: { style: { color: '#e6edf3' } },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: '#58a6ff' },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #30363d', px: 3, py: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#8b949e', textTransform: 'none' }}>
            Close
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!report?.isReplayable || actioningId !== null}
            onClick={() => selectedId && handleReplay(selectedId)}
            sx={{ textTransform: 'none', bgcolor: '#238636', '&:hover': { bgcolor: '#2ea44f' } }}
          >
            Authorize Replay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
