'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Cpu, 
  Layers, 
  Terminal, 
  ShieldAlert, 
  Settings, 
  TrendingUp, 
  Layers2, 
  Server
} from 'lucide-react';


export default function ObservabilityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tenant, setTenant] = useState('tenant-enterprise-ops');
  const [environment, setEnvironment] = useState('production');

  const navItems = [
    { name: 'Executive Overview', href: '/observability', icon: TrendingUp },
    { name: 'Trace Explorer', href: '/observability/traces', icon: Layers },
    { name: 'Workflow Boards', href: '/observability/workflows', icon: Layers2 },
    { name: 'Live Stream', href: '/observability/live', icon: Terminal },
    { name: 'Governance & Audits', href: '/observability/governance', icon: ShieldAlert },
    { name: 'Settings & Plugins', href: '/observability/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-900 selection:text-purple-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-[#080d1a]/85 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-900/25 animate-pulse">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white flex items-center gap-1.5">
              CareerPropel
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                AI Observability Console
              </span>
            </span>
            <p className="text-[10px] text-slate-500 font-mono">Langfuse instrumentation engine</p>
          </div>
        </div>

        {/* Console Filters */}
        <div className="flex items-center gap-4">
          {/* Tenant Isolation Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Tenant:</span>
            <select 
              value={tenant} 
              onChange={(e) => setTenant(e.target.value)}
              className="bg-transparent border-0 text-xs font-mono font-bold text-purple-400 focus:ring-0 cursor-pointer"
            >
              <option value="tenant-enterprise-ops" className="bg-slate-950 text-slate-300">Enterprise Ops</option>
              <option value="tenant-developer-sandbox" className="bg-slate-950 text-slate-300">Dev Sandbox</option>
            </select>
          </div>

          {/* Environment Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Env:</span>
            <select 
              value={environment} 
              onChange={(e) => setEnvironment(e.target.value)}
              className="bg-transparent border-0 text-xs font-mono font-bold text-indigo-400 focus:ring-0 cursor-pointer"
            >
              <option value="production" className="bg-slate-950 text-slate-300">Production</option>
              <option value="staging" className="bg-slate-950 text-slate-300">Staging</option>
              <option value="development" className="bg-slate-950 text-slate-300">Development</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] border-r border-slate-900 bg-[#080c18] shrink-0 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 block mb-3">Navigation</span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/observability' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-950/50 to-indigo-950/40 text-purple-200 border-l-2 border-purple-500 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-900/60 pt-5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 block mb-3">Orchestrators</span>
              <div className="space-y-1.5 px-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Server className="w-3.5 h-3.5 text-slate-600" />
                  <span>Langfuse-Backend SDK</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-slate-600" />
                  <span>Agent Worker System</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Account Info */}
          <div className="border-t border-slate-900/80 pt-4 flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
              A
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Principal Architect</p>
              <p className="text-[10px] text-slate-500 font-mono">Role: Super Admin</p>
            </div>
          </div>
        </aside>

        {/* Page Content viewport */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#06080e]/40">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
