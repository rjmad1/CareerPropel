'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Input, Button } from '@/components/ui'
import { UserPlus, Sparkles, AlertCircle, Mail } from 'lucide-react'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'Registration failed')
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
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            We sent a verification link to <strong className="text-slate-800">{email}</strong>. Click it to activate your account.
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
          <UserPlus className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          Create Account
        </h1>
        <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>AI-Native Career Management</span>
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
            id="name"
            label="Full Name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <Input
            required
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <Input
            required
            name="password"
            label="Password"
            type="password"
            id="password"
            hint="Min 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Input
            required
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="mt-6 text-center pt-3 border-t border-slate-100 w-full">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
