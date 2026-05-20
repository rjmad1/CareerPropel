'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Rocket,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  const features = [
    {
      title: 'Intelligent Automation',
      description: 'Automate your job search and application process with AI-powered insights',
      icon: Sparkles,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100/50',
    },
    {
      title: 'Track Applications',
      description: 'Keep track of all your job applications in one centralized dashboard',
      icon: BarChart3,
      color: 'text-blue-600 bg-blue-50 border-blue-100/50',
    },
    {
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and encryption',
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
    },
    {
      title: 'Lightning Fast',
      description: 'Optimized performance for seamless user experience',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-100/50',
    },
  ]

  const statusItems = [
    { label: 'Configuration', status: 'Complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Database Setup', status: 'Complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Authentication', status: 'Complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Security Framework', status: 'Complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Frontend UI', status: 'Production Ready', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased">
      {/* Sticky Header with Backdrop Blur */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-115 duration-300">
              <Rocket className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              CareerPropel
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {status === 'authenticated' ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-all duration-200"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-100 transition-all duration-200 active:scale-95"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/50 mb-6 shadow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Native Career Orchestration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Propel Your Career with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Intelligent Automation
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            CareerPropel is the advanced career orchestration platform designed to automate and track applications with production-grade reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {status === 'authenticated' ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-0.5 transition-all duration-200 active:scale-98"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-0.5 transition-all duration-200 active:scale-98"
                >
                  Get Started
                </button>
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-98">
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Powerful Enterprise Features
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Everything you need to orchestrate your job search and maximize your application success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col p-6 bg-white border border-slate-200/60 rounded-3xl hover:border-indigo-500/20 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className={`p-3 rounded-2xl border w-fit ${feature.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500 flex-1">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Project Status Section */}
        <section className="mb-20 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              System Readiness Status
            </h2>
            <p className="text-slate-500 mt-2">
              Our continuous validation pipelines ensure all subsystems are verified.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
            {statusItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.color}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 sm:p-12 text-center text-white shadow-xl shadow-indigo-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              Start using CareerPropel today and take control of your application pipeline with the power of modern engineering.
            </p>

            {status === 'authenticated' ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98"
              >
                Sign In Now
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-white border-t border-slate-200/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © 2026 CareerPropel. All rights reserved. | AI-Native Career Management Platform
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Always improving</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
