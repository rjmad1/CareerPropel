'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { logClientError, getClientCorrelationId } from '@/lib/logging/clientLogger'

/**
 * Route-level error component for observability and monitoring routes (/observability).
 * Isolates telemetry page crashes without breaking the primary application or navigation elements.
 */
export default function ObservabilityError({
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
        padding: '2.5rem',
        margin: '1.5rem auto',
        maxWidth: '600px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        color: '#374151',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div id="observability-error-container">
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          Observability Panel Error
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.5' }}>
          An error occurred in the monitoring or telemetry dashboard segment. You can try to reset this view or return to the main dashboard.
        </p>

        {correlationId && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#374151',
              backgroundColor: '#f3f4f6',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            <strong>ID/Digest:</strong> {correlationId}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s',
            }}
          >
            Reset Segment
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s',
            }}
          >
            Go Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
