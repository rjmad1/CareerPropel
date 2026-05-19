'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import {
  Container, Paper, TextField, Button, Box,
  Typography, Alert, CircularProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'

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

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Something went wrong')
        setIsLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Container component="main" maxWidth="sm">
        <StyledPaper elevation={6}>
          <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>Check your email</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            {"If that email is registered, you'll receive a reset link shortly."}
          </Typography>
          <Link href="/login" style={{ color: 'inherit' }}>
            <Button variant="outlined" fullWidth>Back to Sign In</Button>
          </Link>
        </StyledPaper>
      </Container>
    )
  }

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={6}>
        <IconWrapper>
          <LockResetOutlinedIcon sx={{ fontSize: 32 }} />
        </IconWrapper>

        <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Enter your email and we&apos;ll send you a reset link.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
        )}

        <StyledForm onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth label="Email Address" type="email" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
          />

          <Button
            type="submit" fullWidth variant="contained" size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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
