import { Suspense } from 'react'
import LoginForm from './login-form'

// Mark this page as dynamic to prevent prerendering issues with useSearchParams()
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
