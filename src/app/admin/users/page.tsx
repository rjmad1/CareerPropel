'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
  TextField, IconButton, Tooltip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, TablePagination,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'

interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  roles: string[]
  createdAt: string
}

interface Role { id: string; name: string; roleType: string }

const ROLE_COLORS: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  SUPER_ADMIN: 'error',
  PLATFORM_ADMIN: 'warning',
  SECURITY_ADMIN: 'warning',
  SUPPORT_ADMIN: 'info',
  JOB_SEEKER: 'default',
  admin: 'warning',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(25)
  const [assignDialog, setAssignDialog] = useState<{ userId: string; email: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/rbac/roles'),
      ])
      if (!uRes.ok) throw new Error('Failed to load users')
      const ud = await uRes.json()
      const rd = await rRes.json()
      setUsers(ud.data?.users ?? ud.users ?? [])
      setRoles(rd.data?.roles ?? rd.roles ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredUsers = users.filter(
    (u) => u.email.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAssignRole = async () => {
    if (!assignDialog || !selectedRole) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${assignDialog.userId}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', roleName: selectedRole }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error?.message ?? 'Failed')
      }
      setAssignDialog(null)
      setSelectedRole('')
      await loadData()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async (userId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: active ? 'disable' : 'enable' }),
      })
      await loadData()
    } catch (err) {
      setError(String(err))
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress size={28} /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e6edf3', flex: 1 }}>User Access Matrix</Typography>
        <Tooltip title="Refresh"><IconButton onClick={loadData} size="small" sx={{ color: '#8b949e' }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: '#8b949e' }} /> } }}
          sx={{ width: 320, '& .MuiOutlinedInput-root': { bgcolor: '#161b22', color: '#e6edf3', borderColor: '#30363d' } }}
        />
        <Typography variant="caption" sx={{ color: '#8b949e', alignSelf: 'center' }}>
          {filteredUsers.length} users
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { color: '#8b949e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, borderColor: '#30363d' } }}>
              <TableCell>User</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id} sx={{ '& td': { borderColor: '#21262d', color: '#e6edf3' }, '&:hover': { bgcolor: '#1c2128' } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name || '—'}</Typography>
                  <Typography variant="caption" sx={{ color: '#8b949e', fontFamily: 'monospace' }}>{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {user.roles.length === 0
                      ? <Chip label="no roles" size="small" sx={{ bgcolor: '#21262d', color: '#8b949e', fontSize: 10 }} />
                      : user.roles.map((r) => (
                          <Chip key={r} label={r} size="small" color={ROLE_COLORS[r] ?? 'default'} sx={{ fontSize: 10 }} />
                        ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.emailVerified ? 'Active' : 'Disabled'}
                    size="small"
                    color={user.emailVerified ? 'success' : 'default'}
                    sx={{ fontSize: 10 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#8b949e' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Assign role">
                    <IconButton size="small" sx={{ color: '#58a6ff' }} onClick={() => setAssignDialog({ userId: user.id, email: user.email })}>
                      <PersonAddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.emailVerified ? 'Disable account' : 'Enable account'}>
                    <IconButton size="small" sx={{ color: user.emailVerified ? '#f85149' : '#3fb950' }}
                      onClick={() => handleStatusToggle(user.id, user.emailVerified)}>
                      {user.emailVerified ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[25]}
          sx={{ color: '#8b949e', borderTop: '1px solid #30363d' }}
        />
      </TableContainer>

      {/* Assign Role Dialog */}
      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)}
        slotProps={{ paper: { sx: { bgcolor: '#161b22', border: '1px solid #30363d' } } }}>
        <DialogTitle sx={{ color: '#e6edf3', fontSize: 15 }}>Assign Role</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mb: 2 }}>
            {assignDialog?.email}
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#8b949e' }}>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value)}
              sx={{ color: '#e6edf3', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' } }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.name}>{r.name} <Typography component="span" variant="caption" sx={{ ml: 1, color: '#8b949e' }}>({r.roleType})</Typography></MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(null)} sx={{ color: '#8b949e' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignRole} disabled={!selectedRole || saving}
            sx={{ bgcolor: '#238636', '&:hover': { bgcolor: '#2ea043' } }}>
            {saving ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
