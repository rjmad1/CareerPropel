'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
  IconButton, Tooltip, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Select, MenuItem, FormControl,
  InputLabel,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

interface FeatureFlag {
  id: string
  key: string
  description: string | null
  enabled: boolean
  rolloutStrategy: string
  rolloutPercent: number | null
  allowedRoles: string[]
  environment: string | null
  updatedBy: string | null
  updatedAt: string
}

type FlagDraft = {
  key: string
  description: string
  enabled: boolean
  rolloutStrategy: string
  rolloutPercent: number | null
  allowedRoles: string
  environment: string
}

const STRATEGY_LABELS: Record<string, string> = {
  all: 'All users',
  percentage: 'Percentage',
  allowlist: 'Allowlist',
  role_scoped: 'Role-scoped',
  disabled: 'Disabled',
}

const emptyDraft = (): FlagDraft => ({
  key: '', description: '', enabled: false,
  rolloutStrategy: 'disabled', rolloutPercent: null,
  allowedRoles: '', environment: '',
})

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; flag?: FeatureFlag } | null>(null)
  const [draft, setDraft] = useState<FlagDraft>(emptyDraft())
  const [saving, setSaving] = useState(false)

  const loadFlags = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feature-flags')
      const d = await res.json()
      setFlags(d.data?.flags ?? d.flags ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFlags() }, [loadFlags])

  const openCreate = () => {
    setDraft(emptyDraft())
    setDialog({ mode: 'create' })
  }

  const openEdit = (flag: FeatureFlag) => {
    setDraft({
      key: flag.key,
      description: flag.description ?? '',
      enabled: flag.enabled,
      rolloutStrategy: flag.rolloutStrategy,
      rolloutPercent: flag.rolloutPercent,
      allowedRoles: flag.allowedRoles.join(', '),
      environment: flag.environment ?? '',
    })
    setDialog({ mode: 'edit', flag })
  }

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await fetch(`/api/admin/feature-flags/${flag.key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled }),
      })
      await loadFlags()
    } catch (err) {
      setError(String(err))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const key = dialog?.mode === 'edit' ? dialog.flag!.key : draft.key
      await fetch(`/api/admin/feature-flags/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: draft.description || undefined,
          enabled: draft.enabled,
          rolloutStrategy: draft.rolloutStrategy,
          rolloutPercent: draft.rolloutPercent,
          allowedRoles: draft.allowedRoles ? draft.allowedRoles.split(',').map((s) => s.trim()).filter(Boolean) : [],
          environment: draft.environment || null,
        }),
      })
      setDialog(null)
      await loadFlags()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress size={28} /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3', flex: 1 }}>Feature Flags</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ mr: 1, bgcolor: '#238636', color: '#fff', '&:hover': { bgcolor: '#2ea043' }, textTransform: 'none' }}>
          New Flag
        </Button>
        <Tooltip title="Refresh"><IconButton onClick={loadFlags} size="small" sx={{ color: '#8b949e' }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderColor: '#30363d' } }}>
              <TableCell>Key</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>Environment</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell align="center">Enabled</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flags.length === 0
              ? <TableRow><TableCell colSpan={7} sx={{ color: '#8b949e', textAlign: 'center', py: 4 }}>No feature flags defined. Create one to get started.</TableCell></TableRow>
              : flags.map((flag) => (
                  <TableRow key={flag.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 }, '&:hover': { bgcolor: '#1c2128' } }}>
                    <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#a5d6ff', fontWeight: 600 }}>{flag.key}</Typography></TableCell>
                    <TableCell sx={{ color: '#8b949e', maxWidth: 200 }}>{flag.description ?? '—'}</TableCell>
                    <TableCell>
                      <Chip label={STRATEGY_LABELS[flag.rolloutStrategy] ?? flag.rolloutStrategy} size="small"
                        sx={{ bgcolor: '#21262d', color: flag.rolloutStrategy === 'disabled' ? '#8b949e' : '#3fb950', fontSize: 10, height: 18 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#8b949e' }}>{flag.environment ?? 'all'}</TableCell>
                    <TableCell sx={{ color: '#8b949e', fontFamily: 'monospace', fontSize: 11 }}>{flag.updatedBy ?? '—'}</TableCell>
                    <TableCell align="center">
                      <Switch checked={flag.enabled} size="small" onChange={() => handleToggle(flag)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3fb950' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#238636' } }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" sx={{ color: '#58a6ff' }} onClick={() => openEdit(flag)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!dialog} onClose={() => setDialog(null)}
        slotProps={{ paper: { sx: { bgcolor: '#161b22', border: '1px solid #30363d', minWidth: 420 } } }}>
        <DialogTitle sx={{ color: '#e6edf3', fontSize: 15 }}>{dialog?.mode === 'create' ? 'Create Feature Flag' : `Edit: ${dialog?.flag?.key}`}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {dialog?.mode === 'create' && (
            <TextField size="small" label="Key" value={draft.key}
              onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value }))}
              helperText="e.g. ai_interview_coach"
              sx={{ '& .MuiOutlinedInput-root': { color: '#e6edf3', bgcolor: '#0d1117' }, '& label': { color: '#8b949e' } }} />
          )}
          <TextField size="small" label="Description" value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { color: '#e6edf3', bgcolor: '#0d1117' }, '& label': { color: '#8b949e' } }} />
          <FormControl size="small">
            <InputLabel sx={{ color: '#8b949e' }}>Rollout Strategy</InputLabel>
            <Select value={draft.rolloutStrategy} label="Rollout Strategy"
              onChange={(e) => setDraft((d) => ({ ...d, rolloutStrategy: e.target.value }))}
              sx={{ color: '#e6edf3', bgcolor: '#0d1117', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' } }}>
              {Object.entries(STRATEGY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          {draft.rolloutStrategy === 'percentage' && (
            <TextField size="small" label="Rollout %" type="number"
              value={draft.rolloutPercent ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, rolloutPercent: Number(e.target.value) }))}
              slotProps={{ htmlInput: { min: 0, max: 100 } }}
              sx={{ '& .MuiOutlinedInput-root': { color: '#e6edf3', bgcolor: '#0d1117' }, '& label': { color: '#8b949e' } }} />
          )}
          {draft.rolloutStrategy === 'role_scoped' && (
            <TextField size="small" label="Allowed Roles (comma-separated)" value={draft.allowedRoles}
              onChange={(e) => setDraft((d) => ({ ...d, allowedRoles: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { color: '#e6edf3', bgcolor: '#0d1117' }, '& label': { color: '#8b949e' } }} />
          )}
          <TextField size="small" label="Environment (blank = all)" value={draft.environment}
            onChange={(e) => setDraft((d) => ({ ...d, environment: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { color: '#e6edf3', bgcolor: '#0d1117' }, '& label': { color: '#8b949e' } }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch checked={draft.enabled} size="small" onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3fb950' } }} />
            <Typography variant="body2" sx={{ color: '#e6edf3' }}>Enabled</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)} sx={{ color: '#8b949e' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#238636', '&:hover': { bgcolor: '#2ea043' } }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
