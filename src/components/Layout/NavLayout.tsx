'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  KanbanSquare,
  Mic,
  CalendarCheck,
  CircleDollarSign,
  FileText,
  Mail,
  User,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  KeyRound,
  ShieldAlert,
  Settings,
  FlaskConical,
  LogOut,
  Menu,
  X,
  Globe,
  Plug,
  Users,
  Cpu,
} from 'lucide-react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { DemoDataIndicator } from '@/components/ui/DemoDataBadge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Pipeline', icon: KanbanSquare },
  { href: '/job-search', label: 'Job Search', icon: Globe },
  { href: '/networking', label: 'Networking', icon: Users },
  { href: '/interview-prep', label: 'Interview Prep', icon: Mic },
  { href: '/interviews', label: 'Interviews', icon: CalendarCheck },
  { href: '/offers', label: 'Offers', icon: CircleDollarSign },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/resume-lab', label: 'Resume Lab', icon: FlaskConical },
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/audit-logs', label: 'Audit Logs', icon: FileSpreadsheet },
  { href: '/api-keys', label: 'API Keys', icon: KeyRound },
  { href: '/settings/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings/ai-providers', label: 'AI Providers', icon: Cpu },
  { href: '/settings/security', label: 'Security', icon: ShieldAlert },
  { href: '/settings/account', label: 'Account', icon: Settings },
];

interface NavLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
}

export function NavLayout({ children, title, subtitle }: NavLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) return null;

  const initials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user?.email?.charAt(0).toUpperCase() ?? '?';

  const avatarUrl = (session.user as { avatarUrl?: string })?.avatarUrl;

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-slate-400">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800 shrink-0">
        <Link href="/dashboard" className="flex flex-col group">
          <span className="text-base font-bold text-white tracking-wide transition-colors group-hover:text-blue-400">
            CareerPropel
          </span>
          <span className="text-[10px] font-medium text-blue-400/80 uppercase tracking-wider -mt-0.5">
            AI Career Platform
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <IconComponent
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden shrink-0 border border-slate-700/50">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={session.user?.name || 'User'} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-snug">
              {session.user?.name || 'User Account'}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
              {session.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors duration-150 w-full text-left py-1 text-xs group"
        >
          <LogOut className="h-3.5 w-3.5 group-hover:text-red-400 transition-colors" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  // Detect demo session for DemoDataIndicator
  const isDemo = (session?.user?.email ?? '').startsWith('demo+');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Demo Environment Banner — only shown to demo accounts */}
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 border-r border-slate-800 bg-slate-900 shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Sidebar - Mobile Sliding Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop overlay */}
        <button
          type="button"
          aria-label="Close sidebar"
          className={`absolute inset-0 w-full bg-slate-950/60 backdrop-blur-xs transition-opacity duration-350 ease-in-out cursor-default ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sliding Panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl transition-transform duration-350 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md bg-slate-800/40 hover:bg-slate-800 transition-all z-50 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          {renderSidebarContent()}
        </aside>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64 min-h-screen relative">
        {/* Top Mobile Navbar */}
        <header className="lg:hidden h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sticky top-0 z-20 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-all"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-wide">
                CareerPropel
              </span>
              <span className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider -mt-1">
                AI Career Platform
              </span>
            </Link>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden shrink-0 border border-slate-200">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={session.user?.name || 'User'} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </header>

        {/* Page Header (Desktop & Mobile fluid) */}
        {(title || subtitle) && (
          <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-xs relative">
            <div className="flex flex-col gap-0.5">
              {title && (
                <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </header>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto relative bg-slate-50 focus:outline-none">
          {children}
        </main>
      </div>
      </div>
      {/* Subtle demo watermark — bottom-right, only for demo accounts */}
      {isDemo && <DemoDataIndicator />}
    </div>
  );
}
