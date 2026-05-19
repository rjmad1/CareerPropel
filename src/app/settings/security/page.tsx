'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { ContentCopy, Check } from '@mui/icons-material';

type Step = 'loading' | 'disabled' | 'setup' | 'verify' | 'enabled' | 'disabling';

interface SetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export default function SecuritySettingsPage() {
  const [step, setStep] = useState<Step>('loading');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    fetch('/api/auth/2fa/status')
      .then((r) => r.json())
      .then((json) => {
        const enabled = json.data?.enabled ?? json.enabled ?? false;
        setStep(enabled ? 'enabled' : 'disabled');
      })
      .catch(() => setStep('disabled'));
  }, []);

  async function handleStartSetup() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Setup failed');
      setSetupData(json.data ?? json);
      setStep('setup');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!setupData) return;
    if (!/^\d{6}$/.test(totpCode)) { setError('Code must be exactly 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: setupData.secret, totpCode, backupCodes: setupData.backupCodes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Enable failed');
      setTotpCode('');
      setStep('enabled');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(disableCode)) { setError('Code must be exactly 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode: disableCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Disable failed');
      setDisableCode('');
      setStep('disabled');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, which: 'secret' | 'codes') {
    navigator.clipboard.writeText(text).then(() => {
      if (which === 'secret') { setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 2000); }
      else { setCopiedCodes(true); setTimeout(() => setCopiedCodes(false), 2000); }
    });
  }

  return (
    <NavLayout title="Security" subtitle="Two-factor authentication and account protection">
      <Box sx={{ p: 3, maxWidth: 560, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Status card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            {step === 'loading' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {step === 'enabled' ? (
                    <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                  ) : (
                    <Security sx={{ color: 'text.disabled', fontSize: 28 }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ lineHeight: 1.3 }}>Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step === 'enabled' ? '2FA is active on your account.' : 'Protect your account with an authenticator app.'}
                    </Typography>
                  </Box>
                  <Chip
                    label={step === 'enabled' ? 'Enabled' : 'Disabled'}
                    color={step === 'enabled' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                {step === 'disabled' && (
                  <Button
                    variant="contained"
                    onClick={handleStartSetup}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                  >
                    Set up 2FA
                  </Button>
                )}

                {step === 'enabled' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => { setStep('disabling'); setError(''); }}
                  >
                    Disable 2FA
                  </Button>
                )}

                {error && (step === 'disabled' || step === 'enabled') && (
                  <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Disable confirmation panel */}
        {step === 'disabling' && (
          <Card sx={{ border: '1px solid', borderColor: 'error.light' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Disable Two-Factor Authentication</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit code from your authenticator app to confirm. This will remove 2FA protection from your account.
              </Typography>
              <form onSubmit={handleDisable}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '\\d{6}', maxLength: 6 } }}
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    sx={{ '& input': { textAlign: 'center', fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '0.25em' } }}
                    fullWidth
                    autoFocus
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => { setStep('enabled'); setError(''); setDisableCode(''); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="error"
                      disabled={loading || disableCode.length !== 6}
                    >
                      {loading ? 'Disabling…' : 'Confirm Disable'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 1 — Scan QR */}
        {step === 'setup' && setupData && (
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="h6">Step 1 — Scan QR code</Typography>
              <Typography variant="body2" color="text.secondary">
                Open Google Authenticator, Authy, or any TOTP app and scan this code.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Image src={setupData.qrCode} alt="QR code for 2FA setup" width={192} height={192}
                  style={{ borderRadius: 8, border: '1px solid #E5E7EB' }} unoptimized />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', mb: 0.75 }}>
                  Manual entry key
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1 }}>
                  <Typography component="code" sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                    {setupData.secret}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => copy(setupData.secret, 'secret')}
                    startIcon={copiedSecret ? <Check sx={{ color: 'success.main' }} /> : <ContentCopy />}
                    sx={{ flexShrink: 0 }}
                  >
                    {copiedSecret ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Backup codes — save now
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => copy(setupData.backupCodes.join('\n'), 'codes')}
                    startIcon={copiedCodes ? <Check sx={{ color: 'success.main' }} /> : <ContentCopy />}
                  >
                    {copiedCodes ? 'Copied' : 'Copy all'}
                  </Button>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {setupData.backupCodes.map((code) => (
                    <Box
                      key={code}
                      component="code"
                      sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1, textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8125rem' }}
                    >
                      {code}
                    </Box>
                  ))}
                </Box>
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  Each backup code can only be used once. Store them somewhere safe.
                </Alert>
              </Box>

              <Button variant="contained" fullWidth onClick={() => setStep('verify')}>
                I&apos;ve scanned the code →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Verify */}
        {step === 'verify' && setupData && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Step 2 — Verify</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit code shown in your authenticator app to confirm setup.
              </Typography>
              <form onSubmit={handleEnable}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '\\d{6}', maxLength: 6 } }}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    sx={{ '& input': { textAlign: 'center', fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '0.25em' } }}
                    fullWidth
                    autoFocus
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button fullWidth variant="outlined" onClick={() => { setStep('setup'); setError(''); }}>
                      Back
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading || totpCode.length !== 6}
                    >
                      {loading ? 'Verifying…' : 'Enable 2FA'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
    </NavLayout>
  );
}
