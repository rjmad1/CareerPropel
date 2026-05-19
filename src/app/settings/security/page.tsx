'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Shield, ShieldCheck, ShieldOff, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';

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
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Status card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {step === 'loading' && <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />}
            {step === 'enabled' && <ShieldCheck className="w-6 h-6 text-green-600" />}
            {(step === 'disabled' || step === 'setup' || step === 'verify') && <Shield className="w-6 h-6 text-gray-400" />}
            {step === 'disabling' && <ShieldOff className="w-6 h-6 text-red-500" />}
            <div>
              <h2 className="font-semibold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500">
                {step === 'enabled' ? '2FA is active on your account.' : 'Protect your account with an authenticator app.'}
              </p>
            </div>
            {step === 'enabled' && (
              <span className="ml-auto text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Enabled</span>
            )}
            {step === 'disabled' && (
              <span className="ml-auto text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Disabled</span>
            )}
          </div>

          {step === 'disabled' && (
            <button onClick={handleStartSetup} disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Set up 2FA
            </button>
          )}

          {step === 'enabled' && (
            <button onClick={() => { setStep('disabling'); setError(''); }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50">
              <ShieldOff className="w-4 h-4" /> Disable 2FA
            </button>
          )}
        </div>

        {error && (step === 'disabled' || step === 'enabled') && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Disable confirmation panel */}
        {step === 'disabling' && (
          <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app to confirm. This will remove 2FA protection from your account.
            </p>
            <form onSubmit={handleDisable} className="space-y-4">
              <input type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                placeholder="000000" value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep('enabled'); setError(''); setDisableCode(''); }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading || disableCode.length !== 6}
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {loading ? 'Disabling…' : 'Confirm Disable'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 1 — Scan QR */}
        {step === 'setup' && setupData && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Step 1 — Scan QR code</h3>
            <p className="text-sm text-gray-600">Open Google Authenticator, Authy, or any TOTP app and scan this code.</p>
            <div className="flex justify-center">
              <Image src={setupData.qrCode} alt="QR code for 2FA setup" width={192} height={192}
                className="rounded-lg border border-gray-200" unoptimized />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Manual entry key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono break-all">{setupData.secret}</code>
                <button onClick={() => copy(setupData.secret, 'secret')} className="shrink-0 p-2 text-gray-500 hover:text-gray-800" title="Copy secret">
                  {copiedSecret ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Backup codes — save now</p>
                <button onClick={() => copy(setupData.backupCodes.join('\n'), 'codes')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {setupData.backupCodes.map((code) => (
                  <code key={code} className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono text-center">{code}</code>
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Each backup code can only be used once. Store them somewhere safe.
              </p>
            </div>
            <button onClick={() => setStep('verify')}
              className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              I&apos;ve scanned the code →
            </button>
          </div>
        )}

        {/* Step 2 — Verify */}
        {step === 'verify' && setupData && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Step 2 — Verify</h3>
            <p className="text-sm text-gray-600">Enter the 6-digit code shown in your authenticator app to confirm setup.</p>
            <form onSubmit={handleEnable} className="space-y-4">
              <input type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                placeholder="000000" value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep('setup'); setError(''); }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Back</button>
                <button type="submit" disabled={loading || totpCode.length !== 6}
                  className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Verifying…' : 'Enable 2FA'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
