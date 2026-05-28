'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
  Tooltip, IconButton, Collapse,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import LockIcon from '@mui/icons-material/Lock'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

interface PermissionEntry {
  id: string
  name: string
  action: string
  description: string
  systemProtected: boolean
  roles: string[]
}

interface PermissionGroup { resource: string; permissions: PermissionEntry[] }
interface Role { name: string; roleType: string }

const ROLE_TYPE_COLOR: Record<string, string> = {
  SUPER_ADMIN: '#f85149',
  PLATFORM_ADMIN: '#d29922',
  SECURITY_ADMIN: '#d29922',
  SUPPORT_ADMIN: '#58a6ff',
  JOB_SEEKER: '#3fb950',
  CUSTOM: '#8b949e',
}

export default function AdminPermissionsPage() {
  const [groups, setGroups] = useState<PermissionGroup[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, rRes] = await Promise.all([
        fetch('/api/admin/rbac/permissions'),
        fetch('/api/admin/rbac/roles'),
      ])
      const pd = await pRes.json()
      const rd = await rRes.json()
      const byResource = pd.data?.byResource ?? pd.byResource ?? []
      setGroups(byResource)
      setRoles(rd.data?.roles ?? rd.roles ?? [])
      const init: Record<string, boolean> = {}
      for (const g of byResource) init[g.resource] = true
      setExpanded(init)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const toggleGroup = (resource: string) =>
    setExpanded((prev) => ({ ...prev, [resource]: !prev[resource] }))

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress size={28} /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3', flex: 1 }}>Permission Matrix</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {roles.slice(0, 6).map((r) => (
            <Chip key={r.name} label={r.name} size="small" sx={{ bgcolor: '#21262d', color: ROLE_TYPE_COLOR[r.roleType] ?? '#8b949e', fontSize: 10 }} />
          ))}
        </Box>
        <Tooltip title="Refresh"><IconButton onClick={loadData} size="small" sx={{ color: '#8b949e' }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {groups.map((group) => (
        <Box key={group.resource} sx={{ mb: 2 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 1 }}
            onClick={() => toggleGroup(group.resource)}
          >
            <Chip label={group.resource} size="small" sx={{ bgcolor: '#1f2d3d', color: '#58a6ff', fontWeight: 600, fontSize: 11 }} />
            <Typography variant="caption" sx={{ color: '#8b949e' }}>{group.permissions.length} permissions</Typography>
            <IconButton size="small" sx={{ color: '#8b949e', ml: 'auto' }}>
              {expanded[group.resource] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Collapse in={expanded[group.resource]}>
            <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, fontWeight: 600, borderColor: '#30363d' } }}>
                    <TableCell>Permission Key</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Assigned To Roles</TableCell>
                    <TableCell align="center">Protected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.permissions.map((perm) => (
                    <TableRow key={perm.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3', fontSize: 12 }, '&:hover': { bgcolor: '#1c2128' } }}>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#a5d6ff', fontWeight: 600 }}>{perm.name}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#8b949e', fontSize: 12 }}>{perm.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {perm.roles.length === 0
                            ? <Typography variant="caption" sx={{ color: '#8b949e' }}>none</Typography>
                            : perm.roles.map((r) => (
                                <Chip key={r} label={r} size="small" sx={{ bgcolor: '#21262d', color: ROLE_TYPE_COLOR[r] ?? '#8b949e', fontSize: 9, height: 18 }} />
                              ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {perm.systemProtected && <LockIcon fontSize="small" sx={{ color: '#f85149' }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      ))}
    </Box>
  )
}
