'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import theme from '@/lib/theme'

export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session — stable reference via useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,   // 5 min
            gcTime: 10 * 60 * 1000,      // 10 min
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
