'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import IntegratedDashboard from '@/components/CareerOS/IntegratedDashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  const candidateId = session.user?.id;
  if (!candidateId) {
    // User ID not available yet (session loading edge case) — render nothing rather than
    // pass an email or empty string to hooks that expect a DB ID.
    return null;
  }

  return <IntegratedDashboard candidateId={candidateId} />
}

