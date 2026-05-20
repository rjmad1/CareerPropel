'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input, Button } from '@/components/ui'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!token) {
    return (
      <div className="max-w-md mx-auto w-full px-4 mt-20">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mb-5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Invalid Link</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password" className="w-full">
            <Button variant="primary" className="w-full py-2.5 rounded-xl">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Reset failed')
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
      <div className="max-w-md mx-auto w-full px-4 mt-20">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mb-5 shadow-md shadow-indigo-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Password Updated</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your password has been reset successfully.
          </p>
          <Link href="/login" className="w-full">
            <Button variant="primary" className="w-full py-2.5 rounded-xl">
              Sign In Now
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 mt-20">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 flex flex-col items-center">
        {/* Icon wrapper with gradient */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mb-4 shadow-md shadow-indigo-100">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          Reset Password
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-sm rounded-2xl w-full mb-5 shadow-sm shadow-rose-50/50">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="w-full space-y-4">
          <Input
            required
            id="password"
            label="New Password"
            name="password"
            type="password"
            autoFocus
            hint="Min 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Input
            required
            id="confirmPassword"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full mt-6 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-shadow rounded-xl"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="mt-6 text-center pt-3 border-t border-slate-100 w-full">
            <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
