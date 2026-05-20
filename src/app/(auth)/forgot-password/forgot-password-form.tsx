'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Input, Button } from '@/components/ui'
import { KeyRound, AlertCircle, Mail } from 'lucide-react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Something went wrong')
        setIsLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto w-full px-4 mt-20">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mb-5 shadow-md shadow-indigo-100">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            If that email is registered, you&apos;ll receive a reset link shortly.
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full py-2.5 rounded-xl">
              Back to Sign In
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
          <KeyRound className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          Forgot Password
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Enter your email and we&apos;ll send you a reset link.
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
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full mt-6 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-shadow rounded-xl"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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
