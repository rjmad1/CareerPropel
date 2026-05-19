'use client'

export const dynamic = 'force-dynamic'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { NavLayout } from '@/components/Layout/NavLayout'

interface AccountData {
  id: string
  email: string
  name: string
  phone: string | null
  location: string | null
  summary: string | null
  avatarUrl: string | null
  emailVerified: boolean
  preferences: { emailNotifications?: boolean; theme?: 'light' | 'dark' | 'system' } | null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function SaveButton({ loading, label = 'Save Changes' }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Saving...' : label}
    </button>
  )
}

export default function AccountSettingsPage() {
  const [account, setAccount] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState('')

  // Profile info form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [summary, setSummary] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [prefSaving, setPrefSaving] = useState(false)
  const [prefMsg, setPrefMsg] = useState('')

  // Delete account
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetch('/api/account')
      .then((r) => r.json())
      .then((json) => {
        const data: AccountData = json.data
        setAccount(data)
        setName(data.name ?? '')
        setPhone(data.phone ?? '')
        setLocation(data.location ?? '')
        setSummary(data.summary ?? '')
        setAvatarPreview(data.avatarUrl ?? null)
        const prefs = data.preferences ?? {}
        setEmailNotifications(prefs.emailNotifications ?? true)
        setTheme(prefs.theme ?? 'system')
        setLoading(false)
      })
      .catch(() => {
        setGlobalError('Failed to load account data.')
        setLoading(false)
      })
  }, [])

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone || null, location: location || null, summary: summary || null }),
    })
    const json = await res.json()
    setProfileSaving(false)
    if (res.ok) {
      setProfileMsg('Profile saved.')
      setAccount((prev) => prev ? { ...prev, ...json.data } : prev)
    } else {
      setProfileMsg(json.error?.message || 'Save failed.')
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 200 * 1024) {
      setAvatarMsg('Image must be under 200 KB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Please select an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setAvatarPreview(dataUrl)
      setAvatarMsg('')
    }
    reader.readAsDataURL(file)
  }

  async function handleAvatarSave() {
    if (!avatarPreview) return
    setAvatarSaving(true)
    setAvatarMsg('')
    const res = await fetch('/api/account/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarDataUrl: avatarPreview }),
    })
    const json = await res.json()
    setAvatarSaving(false)
    if (res.ok) {
      setAvatarMsg('Profile picture updated.')
    } else {
      setAvatarMsg(json.error?.message || 'Upload failed.')
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMsg('')
    setPasswordError('')
    const res = await fetch('/api/account/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    })
    const json = await res.json()
    setPasswordSaving(false)
    if (res.ok) {
      setPasswordMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } else {
      setPasswordError(json.error?.message || 'Failed to change password.')
    }
  }

  async function handlePrefSave(e: FormEvent) {
    e.preventDefault()
    setPrefSaving(true)
    setPrefMsg('')
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: { emailNotifications, theme } }),
    })
    const json = await res.json()
    setPrefSaving(false)
    if (res.ok) {
      setPrefMsg('Preferences saved.')
    } else {
      setPrefMsg(json.error?.message || 'Save failed.')
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    const res = await fetch('/api/account/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword || undefined }),
    })
    const json = await res.json()
    setDeleting(false)
    if (res.ok) {
      await signOut({ callbackUrl: '/login' })
    } else {
      setDeleteError(json.error?.message || 'Deletion failed.')
    }
  }

  if (loading) {
    return (
      <NavLayout title="Account Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </NavLayout>
    )
  }

  return (
    <NavLayout title="Account Settings" subtitle="Manage your account, profile, and preferences">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {globalError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{globalError}</div>
        )}

        {/* Profile Picture */}
        <Section title="Profile Picture">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {account?.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Choose Image
              </button>
              {avatarPreview && avatarPreview !== account?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarSave}
                  disabled={avatarSaving}
                  className="ml-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {avatarSaving ? 'Saving...' : 'Save Picture'}
                </button>
              )}
              <p className="text-xs text-gray-500">JPG, PNG, GIF — max 200 KB</p>
              {avatarMsg && (
                <p className={`text-xs ${avatarMsg.includes('updated') ? 'text-green-600' : 'text-red-600'}`}>
                  {avatarMsg}
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* Personal Info */}
        <Section title="Personal Information">
          {account && !account.emailVerified && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Your email is not verified. Check your inbox for a verification link.
            </div>
          )}
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={account?.email ?? ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <SaveButton loading={profileSaving} />
              {profileMsg && (
                <span className={`text-sm ${profileMsg.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>
                  {profileMsg}
                </span>
              )}
            </div>
          </form>
        </Section>

        {/* Change Password */}
        <Section title="Change Password">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{passwordError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <SaveButton loading={passwordSaving} label="Change Password" />
              {passwordMsg && <span className="text-sm text-green-600">{passwordMsg}</span>}
            </div>
          </form>
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <form onSubmit={handlePrefSave} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive job alerts and interview reminders</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 text-sm rounded-lg border capitalize transition-colors ${
                      theme === t
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SaveButton loading={prefSaving} label="Save Preferences" />
              {prefMsg && <span className="text-sm text-green-600">{prefMsg}</span>}
            </div>
          </form>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone">
          {!deleteConfirmOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Delete Account</p>
                <p className="text-xs text-gray-500">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </div>
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{deleteError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter your password to confirm</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmOpen(false); setDeleteError(''); setDeletePassword('') }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </NavLayout>
  )
}
