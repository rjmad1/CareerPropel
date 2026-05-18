'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
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
  marginTop: theme.spacing(3),
}))

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate input
      if (!email.trim()) {
        setError('Email is required')
        setIsLoading(false)
        return
      }
      if (!password) {
        setError('Password is required')
        setIsLoading(false)
        return
      }

      console.log('[LoginForm] Attempting authentication...')

      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      console.log('[LoginForm] SignIn response:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
      })

      // Handle response
      if (!result) {
        console.error('[LoginForm] No response from signIn()')
        setError('Authentication service error. Please try again.')
        setIsLoading(false)
        return
      }

      if (result.error) {
        console.warn('[LoginForm] Authentication error:', result.error)
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      if (result.ok) {
        console.log('[LoginForm] ✅ Authentication successful, redirecting...')
        router.push(callbackUrl)
        return
      }

      // If we get here, something unexpected happened
      console.error('[LoginForm] Unexpected response state:', result)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)

    } catch (err) {
      console.error('[LoginForm] Exception during authentication:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Authentication failed: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={6}>
        <IconWrapper>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </IconWrapper>

        <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          CareerPropel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          AI-Native Career Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <StyledForm
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            slotProps={{ htmlInput: { 'data-testid': 'login-email-input' } }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            slotProps={{ htmlInput: { 'data-testid': 'login-password-input' } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
            data-testid="login-submit-btn"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              For development: Use any email and password to create an account
            </Typography>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  )
}
