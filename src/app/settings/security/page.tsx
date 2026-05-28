'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Card } from '@/components/ui';
import {
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Setup failed');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Enable failed');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Disable failed');
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
      <div className="p-6 max-w-xl mx-auto flex flex-col gap-6">

        {/* Status card */}
        <Card className="p-6">
          {step === 'loading' ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${step === 'enabled' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {step === 'enabled' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Shield className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {step === 'enabled' ? '2FA is active on your account.' : 'Protect your account with an authenticator app.'}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${step === 'enabled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {step === 'enabled' ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {step === 'disabled' && (
                <Button
                  onClick={handleStartSetup}
                  disabled={loading}
                  loading={loading}
                  className="w-fit"
                >
                  Set up 2FA
                </Button>
              )}

              {step === 'enabled' && (
                <Button
                  variant="outline"
                  onClick={() => { setStep('disabling'); setError(''); }}
                  className="w-fit text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  Disable 2FA
                </Button>
              )}

              {error && (step === 'disabled' || step === 'enabled') && (
                <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Disable confirmation panel */}
        {step === 'disabling' && (
          <Card className="p-6 border-red-200/80 bg-red-50/10">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Enter the 6-digit code from your authenticator app to confirm. This will remove 2FA protection from your account.
            </p>
            <form onSubmit={handleDisable}>
              <div className="flex flex-col gap-4">
                <input
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center py-3 text-3xl font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none bg-white text-slate-900"
                  autoFocus
                />
                {error && (
                  <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setStep('enabled'); setError(''); setDisableCode(''); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    className="flex-1"
                    disabled={loading || disableCode.length !== 6}
                    loading={loading}
                  >
                    Confirm Disable
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Step 1 — Scan QR */}
        {step === 'setup' && setupData && (
          <Card className="p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-slate-900">Step 1 — Scan QR code</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Open Google Authenticator, Authy, or any TOTP app and scan this code.
            </p>
            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 w-fit mx-auto">
              <Image src={setupData.qrCode} alt="QR code for 2FA setup" width={192} height={192}
                className="rounded-xl border border-slate-200 bg-white" unoptimized />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Manual entry key
              </span>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <code className="flex-1 font-mono text-sm text-slate-800 break-all select-all">
                  {setupData.secret}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(setupData.secret, 'secret')}
                  className="flex-shrink-0 text-slate-600 hover:text-indigo-600"
                >
                  {copiedSecret ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Backup codes — save now
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(setupData.backupCodes.join('\n'), 'codes')}
                  className="text-slate-600 hover:text-indigo-600"
                >
                  {copiedCodes ? (
                    <span className="flex items-center gap-1 text-emerald-600"><Check className="w-3.5 h-3.5" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy all</span>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code) => (
                  <code
                    key={code}
                    className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-mono text-sm text-slate-800 select-all"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl mt-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Each backup code can only be used once. Store them somewhere safe.</span>
              </div>
            </div>

            <Button variant="primary" className="w-full mt-2" onClick={() => setStep('verify')}>
              I&apos;ve scanned the code →
            </Button>
          </Card>
        )}

        {/* Step 2 — Verify */}
        {step === 'verify' && setupData && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 2 — Verify</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Enter the 6-digit code shown in your authenticator app to confirm setup.
            </p>
            <form onSubmit={handleEnable}>
              <div className="flex flex-col gap-4">
                <input
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center py-3 text-3xl font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-slate-900"
                  autoFocus
                />
                {error && (
                  <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setStep('setup'); setError(''); }}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || totpCode.length !== 6}
                    loading={loading}
                  >
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}
      </div>
    </NavLayout>
  );
}
