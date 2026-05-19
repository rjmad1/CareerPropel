'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Container, Paper, TextField, Button, Box,
  Typography, Alert, CircularProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
  boxShadow: theme.shadows[5],
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(2),
}))

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}))

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!token) {
    return (
      <Container component="main" maxWidth="sm">
        <StyledPaper elevation={6}>
          <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>Invalid Link</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This password reset link is invalid or has expired.
          </Typography>
          <Link href="/forgot-password" style={{ color: 'inherit' }}>
            <Button variant="contained" fullWidth>Request New Link</Button>
          </Link>
        </StyledPaper>
      </Container>
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Reset failed')
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Container component="main" maxWidth="sm">
        <StyledPaper elevation={6}>
          <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>Password Updated</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your password has been reset successfully.
          </Typography>
          <Link href="/login" style={{ color: 'inherit' }}>
            <Button variant="contained" fullWidth>Sign In Now</Button>
          </Link>
        </StyledPaper>
      </Container>
    )
  }

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={6}>
        <IconWrapper>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </IconWrapper>

        <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your new password below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
        )}

        <StyledForm onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth label="New Password" type="password" autoFocus
            helperText="Min 8 chars, 1 uppercase, 1 number"
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
          />
          <TextField
            margin="normal" required fullWidth label="Confirm New Password" type="password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading}
          />

          <Button
            type="submit" fullWidth variant="contained" size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" style={{ color: 'inherit', fontSize: 14 }}>
              Back to Sign In
            </Link>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  )
}
