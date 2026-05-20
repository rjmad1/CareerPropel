'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input, Button } from '@/components/ui'
import { Lock, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate input
      if (!email.trim()) {
        setError('Email is required')
        setIsLoading(false)
        return
      }
      if (!password) {
        setError('Password is required')
        setIsLoading(false)
        return
      }

      console.log('[LoginForm] Attempting authentication...')

      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      console.log('[LoginForm] SignIn response:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
      })

      // Handle response
      if (!result) {
        console.error('[LoginForm] No response from signIn()')
        setError('Authentication service error. Please try again.')
        setIsLoading(false)
        return
      }

      if (result.error) {
        console.warn('[LoginForm] Authentication error:', result.error)
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      if (result.ok) {
        console.log('[LoginForm] ✅ Authentication successful, redirecting...')
        router.push(callbackUrl)
        return
      }

      // If we get here, something unexpected happened
      console.error('[LoginForm] Unexpected response state:', result)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)

    } catch (err) {
      console.error('[LoginForm] Exception during authentication:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Authentication failed: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 mt-20">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 flex flex-col items-center">
        {/* Lock Icon Wrapper with gradient */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mb-4 shadow-md shadow-indigo-100">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          CareerPropel
        </h1>
        <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>AI-Native Career Management</span>
        </p>

        {searchParams.get('verified') === '1' && (
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm rounded-2xl w-full mb-5 shadow-sm shadow-emerald-50/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Email verified! You can now sign in.</span>
          </div>
        )}

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
            data-testid="login-email-input"
          />

          <Input
            required
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            data-testid="login-password-input"
          />

          <Button
            type="submit"
            className="w-full mt-6 py-2.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-shadow rounded-xl"
            disabled={isLoading}
            loading={isLoading}
            data-testid="login-submit-btn"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="mt-6 text-center space-y-2.5 pt-2 border-t border-slate-100 w-full">
            <Link href="/forgot-password" className="block text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Forgot password?
            </Link>
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
