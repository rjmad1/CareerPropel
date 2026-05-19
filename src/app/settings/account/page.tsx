'use client'

export const dynamic = 'force-dynamic'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { NavLayout } from '@/components/Layout/NavLayout'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Save } from '@mui/icons-material'

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Divider sx={{ mb: 2.5 }} />
        {children}
      </CardContent>
    </Card>
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
  const [profileError, setProfileError] = useState('')

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState('')
  const [avatarIsError, setAvatarIsError] = useState(false)
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
    setProfileError('')
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
      setProfileError(json.error?.message || 'Save failed.')
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 200 * 1024) {
      setAvatarMsg('Image must be under 200 KB.')
      setAvatarIsError(true)
      return
    }
    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Please select an image file.')
      setAvatarIsError(true)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setAvatarPreview(dataUrl)
      setAvatarMsg('')
      setAvatarIsError(false)
    }
    reader.readAsDataURL(file)
  }

  async function handleAvatarSave() {
    if (!avatarPreview) return
    setAvatarSaving(true)
    setAvatarMsg('')
    setAvatarIsError(false)
    const res = await fetch('/api/account/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarDataUrl: avatarPreview }),
    })
    const json = await res.json()
    setAvatarSaving(false)
    if (res.ok) {
      setAvatarMsg('Profile picture updated.')
      setAvatarIsError(false)
    } else {
      setAvatarMsg(json.error?.message || 'Upload failed.')
      setAvatarIsError(true)
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      </NavLayout>
    )
  }

  return (
    <NavLayout title="Account Settings" subtitle="Manage your account, profile, and preferences">
      <Box sx={{ p: 3, maxWidth: 680, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {globalError && <Alert severity="error">{globalError}</Alert>}

        {/* Profile Picture */}
        <SectionCard title="Profile Picture">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={avatarPreview ?? undefined}
              sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main', flexShrink: 0 }}
            >
              {account?.name?.charAt(0).toUpperCase() ?? '?'}
            </Avatar>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                {avatarPreview && avatarPreview !== account?.avatarUrl && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAvatarSave}
                    disabled={avatarSaving}
                  >
                    {avatarSaving ? 'Saving...' : 'Save Picture'}
                  </Button>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG, GIF — max 200 KB
              </Typography>
              {avatarMsg && (
                <Typography variant="caption" sx={{ display: 'block', color: avatarIsError ? 'error.main' : 'success.main' }}>
                  {avatarMsg}
                </Typography>
              )}
            </Box>
          </Box>
        </SectionCard>

        {/* Personal Info */}
        <SectionCard title="Personal Information">
          {account && !account.emailVerified && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your email is not verified. Check your inbox for a verification link.
            </Alert>
          )}
          <form onSubmit={handleProfileSave}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={account?.email ?? ''}
                disabled
                fullWidth
                helperText="Email cannot be changed here"
              />
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                fullWidth
              />
              <TextField
                label="Bio / Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={profileSaving} startIcon={<Save />}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                {profileMsg && <Typography variant="body2" color="success.main">{profileMsg}</Typography>}
                {profileError && <Typography variant="body2" color="error.main">{profileError}</Typography>}
              </Box>
            </Box>
          </form>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password">
          <form onSubmit={handlePasswordSave}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {passwordError && <Alert severity="error">{passwordError}</Alert>}
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
                helperText="Min 8 chars, 1 uppercase, 1 number"
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                fullWidth
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={passwordSaving}>
                  {passwordSaving ? 'Saving...' : 'Change Password'}
                </Button>
                {passwordMsg && <Typography variant="body2" color="success.main">{passwordMsg}</Typography>}
              </Box>
            </Box>
          </form>
        </SectionCard>

        {/* Preferences */}
        <SectionCard title="Preferences">
          <form onSubmit={handlePrefSave}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Email Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">Receive job alerts and interview reminders</Typography>
                </Box>
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  color="primary"
                />
              </Box>
              <FormControl>
                <FormLabel sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>Theme</FormLabel>
                <RadioGroup
                  row
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                >
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <FormControlLabel key={t} value={t} control={<Radio size="small" />} label={t.charAt(0).toUpperCase() + t.slice(1)} />
                  ))}
                </RadioGroup>
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={prefSaving}>
                  {prefSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
                {prefMsg && <Typography variant="body2" color="success.main">{prefMsg}</Typography>}
              </Box>
            </Box>
          </form>
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard title="Danger Zone">
          {!deleteConfirmOpen ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Delete Account</Typography>
                <Typography variant="caption" color="text.secondary">
                  Permanently delete your account and all data. This cannot be undone.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete Account
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="error">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </Alert>
              {deleteError && <Alert severity="error">{deleteError}</Alert>}
              <TextField
                label="Enter your password to confirm"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your current password"
                fullWidth
                color="error"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => { setDeleteConfirmOpen(false); setDeleteError(''); setDeletePassword('') }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </SectionCard>
      </Box>
    </NavLayout>
  )
}
