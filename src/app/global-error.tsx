'use client'

import { useEffect } from 'react'
import { logClientError, getClientCorrelationId } from '@/lib/logging/clientLogger'

/**
 * Root global-error page handling rendering failures in the root layout.
 * Replaces the root HTML layout, so it defines its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logClientError(error)
  }, [error])

  const correlationId = error.digest || getClientCorrelationId()

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          id="global-error-container"
          style={{
            maxWidth: '500px',
            width: '90%',
            padding: '2.5rem',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            border: '1px solid #f3f4f6',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 1rem 0',
            }}
          >
            Critical System Failure
          </h1>
          <p
            style={{
              color: '#4b5563',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              margin: '0 0 1.5rem 0',
            }}
          >
            A critical system-level rendering error occurred. The root layout has crashed, but we have successfully captured the diagnostics.
          </p>

          {correlationId && (
            <div
              style={{
                fontSize: '0.85rem',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                padding: '0.75rem',
                borderRadius: '8px',
                margin: '0 auto 2rem auto',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              <strong>Digest/ID:</strong> {correlationId}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'background-color 0.2s',
              }}
            >
              Reset Application
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'background-color 0.2s',
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
