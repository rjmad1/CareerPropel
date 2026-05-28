'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { logClientError, getClientCorrelationId } from '@/lib/logging/clientLogger'

/**
 * Root error component handling rendering failures in child pages/components of the root layout.
 * Keeps the root layout wrapper (navigation/headers) alive and responsive.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const loggedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (!loggedRef.current) {
      loggedRef.current = true
      logClientError(error)
    }
  }, [error])

  const correlationId = error.digest || getClientCorrelationId()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#1f2937',
      }}
    >
      <div
        id="root-error-container"
        style={{
          maxWidth: '480px',
          padding: '2rem',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
          Application Error
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
          We encountered an unexpected issue while loading this page. This has been logged, and you can try resetting the page.
        </p>

        {correlationId && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '0.5rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
            }}
          >
            <strong>Diagnostic ID:</strong> {correlationId}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
