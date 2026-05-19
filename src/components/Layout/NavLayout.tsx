'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/jobs', label: 'Pipeline', icon: '🗂️' },
  { href: '/interview-prep', label: 'Interview Prep', icon: '🎤' },
  { href: '/interviews', label: 'Interviews', icon: '📅' },
  { href: '/offers', label: 'Offers', icon: '💰' },
  { href: '/documents', label: 'Documents', icon: '📄' },
  { href: '/emails', label: 'Emails', icon: '✉️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/audit-logs', label: 'Audit Logs', icon: '📋' },
  { href: '/api-keys', label: 'API Keys', icon: '🔑' },
  { href: '/settings/security', label: 'Security', icon: '🛡️' },
];

interface NavLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function NavLayout({ children, title, subtitle }: NavLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-700">
          <Link href="/dashboard" className="block">
            <span className="text-white font-bold text-lg">CareerPropel</span>
            <span className="block text-xs text-blue-400 mt-0.5">AI Career Platform</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-gray-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {session.user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-400 truncate">{session.user?.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-xs text-gray-500 hover:text-gray-300 text-left transition-colors py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        {(title || subtitle) && (
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </header>
        )}

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
