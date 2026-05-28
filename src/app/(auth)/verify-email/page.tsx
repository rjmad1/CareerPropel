'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    token ? 'loading' : 'error'
  )
  const [message, setMessage] = useState(() =>
    token ? '' : 'No verification token provided.'
  )

  useEffect(() => {
    if (!token) return

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
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
    <div className="max-w-md mx-auto w-full px-4 mt-20">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-10 flex flex-col items-center text-center">
        {status === 'loading' && (
          <div className="py-6 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Verifying your email...</h3>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-5 shadow-sm shadow-emerald-50/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Email Verified</h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
            <Link href="/login" className="w-full">
              <Button variant="primary" className="w-full py-2.5 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-shadow">
                Sign In
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mb-5 shadow-sm shadow-rose-50/50">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Verification Failed</h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full py-2.5 rounded-xl">
                Create New Account
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto w-full px-4 mt-20 flex justify-center py-10">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
