'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import {
  Container, Paper, TextField, Button, Box,
  Typography, Alert, CircularProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'

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

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Registration failed')
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
          <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>Check your email</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
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
          <PersonAddOutlinedIcon sx={{ fontSize: 32 }} />
        </IconWrapper>

        <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          CareerPropel — AI-Native Career Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <StyledForm onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth label="Full Name" autoFocus
            value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}
          />
          <TextField
            margin="normal" required fullWidth label="Email Address" type="email"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
          />
          <TextField
            margin="normal" required fullWidth label="Password" type="password"
            helperText="Min 8 chars, 1 uppercase, 1 number"
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
          />
          <TextField
            margin="normal" required fullWidth label="Confirm Password" type="password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading}
          />

          <Button
            type="submit" fullWidth variant="contained" size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  )
}
