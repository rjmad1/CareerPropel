'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ContentCopy,
  Delete,
  Key,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  revokedAt?: string;
  usageCount: number;
}

interface NewlyCreatedKey {
  id: string;
  key: string;
  name: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expiresIn, setExpiresIn] = useState('365');
  const [creating, setCreating] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState<NewlyCreatedKey | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      setLoading(true);
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      const data = json.data ?? json;
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      setCreating(true);
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresIn: parseInt(expiresIn || '365'),
        }),
      });
      if (!res.ok) throw new Error('Failed to create API key');
      const json = await res.json();
      const data = json.data ?? json;
      setNewlyCreated({ id: data.id, key: data.key, name: data.name });
      setNewKeyName('');
      setExpiresIn('365');
      setShowCreateDialog(false);
      setKeyVisible(false);
      await fetchKeys();
    } catch {
      setError('Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string, name: string) {
    if (!window.confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/api-keys?keyId=${keyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke');
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      if (newlyCreated?.id === keyId) setNewlyCreated(null);
    } catch {
      setError('Failed to revoke API key');
    }
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <NavLayout
      title="API Keys"
      subtitle="Manage programmatic access to your CareerPropel data"
    >
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Security Warning */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Security notice:</strong> API keys grant full access to your account data. Store them securely and never share them. Rotate keys regularly and revoke any that are no longer needed.
        </Alert>

        {/* Newly Created Key — one-time display */}
        {newlyCreated && (
          <Alert
            severity="success"
            onClose={() => setNewlyCreated(null)}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              New API Key Created: {newlyCreated.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Copy this key now. You will not be able to see it again.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'success.light', borderRadius: 1, px: 1.5, py: 1 }}>
              <Typography
                component="code"
                sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8125rem', wordBreak: 'break-all' }}
              >
                {keyVisible ? newlyCreated.key : newlyCreated.key.replace(/./g, '•').slice(0, 40)}
              </Typography>
              <IconButton size="small" onClick={() => setKeyVisible(!keyVisible)} title={keyVisible ? 'Hide key' : 'Show key'}>
                {keyVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => copyToClipboard(newlyCreated.key, 'new')} title="Copy key">
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
            {copiedId === 'new' && (
              <Typography variant="caption" sx={{ color: 'success.dark', display: 'block', mt: 0.5 }}>
                Copied to clipboard!
              </Typography>
            )}
          </Alert>
        )}

        {/* Actions Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Active Keys <Typography component="span" variant="body2" color="text.secondary">({activeKeys.length})</Typography>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={fetchKeys} disabled={loading} title="Refresh">
              <Refresh fontSize="small" />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              New API Key
            </Button>
          </Box>
        </Box>

        {/* Create Key Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New API Key</DialogTitle>
          <form onSubmit={handleCreate}>
            <DialogContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Key Name"
                  required
                  fullWidth
                  placeholder="e.g. My App, CI/CD Pipeline"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                  disabled={creating}
                />
                <FormControl size="small" fullWidth>
                  <InputLabel>Expires In</InputLabel>
                  <Select
                    value={expiresIn}
                    label="Expires In"
                    onChange={(e) => setExpiresIn(e.target.value)}
                    disabled={creating}
                  >
                    <MenuItem value="30">30 days</MenuItem>
                    <MenuItem value="90">90 days</MenuItem>
                    <MenuItem value="180">180 days</MenuItem>
                    <MenuItem value="365">1 year</MenuItem>
                    <MenuItem value="730">2 years</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setShowCreateDialog(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={creating}>
                {creating ? 'Creating...' : 'Create Key'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Keys List */}
        <Card sx={{ mb: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : activeKeys.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Key sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No API keys</Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first key to enable programmatic access.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Prefix</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Last Used</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeKeys.map((key) => {
                    const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                    const expiresInDays = key.expiresAt
                      ? Math.ceil((new Date(key.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <TableRow key={key.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{key.name}</Typography>
                            {isExpired && <Chip label="Expired" size="small" color="error" />}
                            {!isExpired && expiresInDays !== null && expiresInDays <= 30 && (
                              <Chip label={`${expiresInDays}d left`} size="small" color="warning" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography component="code" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'grey.100', px: 1, py: 0.25, borderRadius: 1 }}>
                              {key.prefix}••••
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(key.prefix, key.id)} title="Copy prefix">
                              <ContentCopy sx={{ fontSize: 14 }} />
                            </IconButton>
                            {copiedId === key.id && (
                              <Typography variant="caption" color="success.main">Copied!</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {new Date(key.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: isExpired ? 'error.main' : 'text.secondary', fontSize: '0.8125rem' }}>
                          {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Delete sx={{ fontSize: '14px !important' }} />}
                            onClick={() => handleRevoke(key.id, key.name)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Revoked Keys */}
        {revokedKeys.length > 0 && (
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}>
              Revoked Keys ({revokedKeys.length})
            </Typography>
            <Card sx={{ opacity: 0.65 }}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {revokedKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{key.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {key.prefix}••••
                        </TableCell>
                        <TableCell>
                          <Chip label="Revoked" size="small" color="default" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}
      </Box>
    </NavLayout>
  );
}
