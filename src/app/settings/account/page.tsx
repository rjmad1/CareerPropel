'use client';

export const dynamic = 'force-dynamic';

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Input, Textarea, Card, Avatar } from '@/components/ui';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Camera,
} from 'lucide-react';

interface AccountData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  location: string | null;
  summary: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  preferences: { emailNotifications?: boolean; theme?: 'light' | 'dark' | 'system' } | null;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
        {title}
      </h3>
      {children}
    </Card>
  );
}

export default function AccountSettingsPage() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  // Profile info form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarIsError, setAvatarIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefMsg, setPrefMsg] = useState('');

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetch('/api/account')
      .then((r) => r.json())
      .then((json) => {
        const data: AccountData = json.data;
        setAccount(data);
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setLocation(data.location ?? '');
        setSummary(data.summary ?? '');
        setAvatarPreview(data.avatarUrl ?? null);
        const prefs = data.preferences ?? {};
        setEmailNotifications(prefs.emailNotifications ?? true);
        setTheme(prefs.theme ?? 'system');
        setLoading(false);
      })
      .catch(() => {
        setGlobalError('Failed to load account data.');
        setLoading(false);
      });
  }, []);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    setProfileError('');
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone || null, location: location || null, summary: summary || null }),
    });
    const json = await res.json();
    setProfileSaving(false);
    if (res.ok) {
      setProfileMsg('Profile saved.');
      setAccount((prev) => (prev ? { ...prev, ...json.data } : prev));
    } else {
      setProfileError(json.error?.message || 'Save failed.');
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      setAvatarMsg('Image must be under 200 KB.');
      setAvatarIsError(true);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Please select an image file.');
      setAvatarIsError(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      setAvatarMsg('');
      setAvatarIsError(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleAvatarSave() {
    if (!avatarPreview) return;
    setAvatarSaving(true);
    setAvatarMsg('');
    setAvatarIsError(false);
    const res = await fetch('/api/account/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarDataUrl: avatarPreview }),
    });
    const json = await res.json();
    setAvatarSaving(false);
    if (res.ok) {
      setAvatarMsg('Profile picture updated.');
      setAvatarIsError(false);
    } else {
      setAvatarMsg(json.error?.message || 'Upload failed.');
      setAvatarIsError(true);
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg('');
    setPasswordError('');
    const res = await fetch('/api/account/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    });
    const json = await res.json();
    setPasswordSaving(false);
    if (res.ok) {
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordError(json.error?.message || 'Failed to change password.');
    }
  }

  async function handlePrefSave(e: FormEvent) {
    e.preventDefault();
    setPrefSaving(true);
    setPrefMsg('');
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: { emailNotifications, theme } }),
    });
    const json = await res.json();
    setPrefSaving(false);
    if (res.ok) {
      setPrefMsg('Preferences saved.');
    } else {
      setPrefMsg(json.error?.message || 'Save failed.');
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    const res = await fetch('/api/account/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword || undefined }),
    });
    const json = await res.json();
    setDeleting(false);
    if (res.ok) {
      await signOut({ callbackUrl: '/login' });
    } else {
      setDeleteError(json.error?.message || 'Deletion failed.');
    }
  }

  if (loading) {
    return (
      <NavLayout title="Account Settings">
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout title="Account Settings" subtitle="Manage your account, profile, and preferences">
      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
        {globalError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Profile Picture */}
        <SectionCard title="Profile Picture">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar
                src={avatarPreview ?? undefined}
                initials={account?.name?.charAt(0).toUpperCase() ?? '?'}
                size="lg"
                className="w-24 h-24 shadow-md ring-4 ring-slate-50 object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                aria-label="Change profile picture"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap gap-2.5 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                {avatarPreview && avatarPreview !== account?.avatarUrl && (
                  <Button
                    size="sm"
                    onClick={handleAvatarSave}
                    disabled={avatarSaving}
                    loading={avatarSaving}
                  >
                    Save Picture
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500">JPG, PNG, GIF — max 200 KB</p>
              {avatarMsg && (
                <p className={`text-xs mt-1 font-medium ${avatarIsError ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {avatarMsg}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Personal Info */}
        <SectionCard title="Personal Information">
          {account && !account.emailVerified && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-xl mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Your email is not verified. Check your inbox for a verification link.</span>
            </div>
          )}
          <form onSubmit={handleProfileSave}>
            <div className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                value={account?.email ?? ''}
                disabled
                hint="Email cannot be changed here"
              />
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
              />
              <Textarea
                label="Bio / Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-3 mt-2">
                <Button
                  type="submit"
                  disabled={profileSaving}
                  loading={profileSaving}
                  className="flex items-center gap-2"
                >
                  {!profileSaving && <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
                {profileMsg && (
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {profileMsg}
                  </p>
                )}
                {profileError && (
                  <p className="text-sm font-medium text-rose-600">
                    {profileError}
                  </p>
                )}
              </div>
            </div>
          </form>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password">
          <form onSubmit={handlePasswordSave}>
            <div className="flex flex-col gap-4">
              {passwordError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                hint="Min 8 chars, 1 uppercase, 1 number"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <div className="flex items-center gap-3 mt-2">
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  loading={passwordSaving}
                >
                  Change Password
                </Button>
                {passwordMsg && (
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {passwordMsg}
                  </p>
                )}
              </div>
            </div>
          </form>
        </SectionCard>

        {/* Preferences */}
        <SectionCard title="Preferences">
          <form onSubmit={handlePrefSave}>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Email Notifications</h4>
                  <p className="text-xs text-slate-500">Receive job alerts and interview reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Theme</label>
                <div className="flex flex-wrap gap-4">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="theme"
                        value={t}
                        checked={theme === t}
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={prefSaving}
                  loading={prefSaving}
                >
                  Save Preferences
                </Button>
                {prefMsg && (
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {prefMsg}
                  </p>
                )}
              </div>
            </div>
          </form>
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard title="Danger Zone">
          {!deleteConfirmOpen ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Delete Account</h4>
                <p className="text-xs text-slate-500">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>This will permanently delete your account and all associated data. This action cannot be undone.</span>
              </div>
              {deleteError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}
              <Input
                label="Enter your password to confirm"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your current password"
                className="border-rose-300 focus:ring-rose-500 focus:border-rose-500"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  loading={deleting}
                >
                  Yes, Delete My Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setDeleteError('');
                    setDeletePassword('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </NavLayout>
  );
}
