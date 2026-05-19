'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Container, Paper, Typography, Button, CircularProgress, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'

export const dynamic = 'force-dynamic'

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(5),
  marginTop: theme.spacing(10),
  boxShadow: theme.shadows[5],
  textAlign: 'center',
}))

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    // The server route handles the verification and redirects.
    // If we reach this page with a token, trigger the verification.
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        // The API redirects on success/failure; if we get a response here
        // it means the fetch followed the redirect and returned the login page HTML.
        // We mark success since the redirect destination confirms it.
        if (res.redirected && res.url.includes('verified=1')) {
          setStatus('success')
          setMessage('Your email has been verified! You can now sign in.')
        } else if (res.redirected && res.url.includes('error=')) {
          setStatus('error')
          setMessage('This verification link is invalid or has expired.')
        } else {
          setStatus('success')
          setMessage('Your email has been verified! You can now sign in.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Verification failed. Please try again.')
      })
  }, [token])

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={6}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6">Verifying your email...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Box sx={{ color: 'success.main', mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 56 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>Email Verified</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{message}</Typography>
            <Link href="/login" style={{ color: 'inherit' }}>
              <Button variant="contained" size="large">Sign In</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <Box sx={{ color: 'error.main', mb: 2 }}>
              <ErrorOutlineIcon sx={{ fontSize: 56 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>Verification Failed</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{message}</Typography>
            <Link href="/register" style={{ color: 'inherit' }}>
              <Button variant="outlined">Create New Account</Button>
            </Link>
          </>
        )}
      </StyledPaper>
    </Container>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
