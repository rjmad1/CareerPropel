'use client';

import { useState, useEffect } from 'react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Card, CardBody, Button } from '@/components/ui';
import {
  Calendar,
  Link as LinkIcon,
  Link2Off,
  RefreshCw,
  CheckCircle,
  Search,
  User,
  ExternalLink,
  Info,
} from 'lucide-react';

interface CalendarStatus {
  googleConnected: boolean;
  outlookConnected: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'calendar' | 'job-boards' | 'profile';
  icon: React.ReactNode;
  connected: boolean | null;
  connectHref?: string;
  disconnectAction?: () => Promise<void>;
  syncAction?: () => Promise<void>;
  actionLabel?: string;
  infoHref?: string;
  infoLabel?: string;
  loading: boolean;
  statusNote?: string;
}

export default function IntegrationsPage() {
  const [calStatus, setCalStatus] = useState<CalendarStatus>({ googleConnected: false, outlookConnected: false });
  const [loadingCal, setLoadingCal] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  async function fetchCalendarStatus() {
    try {
      const res = await fetch('/api/calendar/events');
      const json = await res.json();
      const data = json.data ?? json;
      setCalStatus({
        googleConnected: data.googleConnected ?? false,
        outlookConnected: data.outlookConnected ?? false,
      });
    } catch {
      // silently fail status check
    } finally {
      setLoadingCal(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/calendar/events');
        const json = await res.json();
        const data = json.data ?? json;
        if (mounted) {
          setCalStatus({
            googleConnected: data.googleConnected ?? false,
            outlookConnected: data.outlookConnected ?? false,
          });
        }
      } catch {
        // silently fail status check
      } finally {
        if (mounted) setLoadingCal(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleSync(provider: 'google' | 'outlook') {
    setSyncing(provider);
    try {
      const res = await fetch(`/api/calendar/sync?provider=${provider}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Sync failed');
      const count = json.data?.synced ?? json.synced ?? 0;
      const label = provider === 'google' ? 'Google' : 'Outlook';
      getNotificationManager().success('Sync Complete', `Synced ${count} event${count !== 1 ? 's' : ''} from ${label} Calendar`);
      await fetchCalendarStatus();
    } catch (err: unknown) {
      getNotificationManager().error('Sync Failed', err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  }

  async function handleDisconnect(provider: 'google' | 'outlook') {
    const label = provider === 'google' ? 'Google' : 'Outlook';
    if (!confirm(`Disconnect ${label} Calendar? Stored events will be removed.`)) return;
    setDisconnecting(provider);
    try {
      const res = await fetch(`/api/calendar/sync?provider=${provider}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
      }
      getNotificationManager().success('Disconnected', `${label} Calendar disconnected`);
      await fetchCalendarStatus();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      getNotificationManager().error('Disconnect Failed', `Failed to disconnect: ${msg}`);
    } finally {
      setDisconnecting(null);
    }
  }

  const integrations: Integration[] = [
    // ── Calendar ──────────────────────────────────────────────────────────────
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync upcoming events and auto-link interviews',
      category: 'calendar',
      icon: (
        <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 dark:bg-red-950/30 dark:border-red-900 flex items-center justify-center font-bold text-red-600 dark:text-red-400 text-lg">
          G
        </div>
      ),
      connected: calStatus.googleConnected,
      connectHref: '/api/calendar/authorize',
      disconnectAction: () => handleDisconnect('google'),
      syncAction: () => handleSync('google'),
      loading: loadingCal || syncing === 'google' || disconnecting === 'google',
      statusNote: 'Requires GOOGLE_CALENDAR_CLIENT_ID + CLIENT_SECRET env vars',
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      description: 'Sync Microsoft 365 / Outlook events',
      category: 'calendar',
      icon: (
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-lg">
          O
        </div>
      ),
      connected: calStatus.outlookConnected,
      connectHref: '/api/calendar/authorize/outlook',
      disconnectAction: () => handleDisconnect('outlook'),
      syncAction: () => handleSync('outlook'),
      loading: loadingCal || syncing === 'outlook' || disconnecting === 'outlook',
      statusNote: 'Requires OUTLOOK_CLIENT_ID + CLIENT_SECRET env vars',
    },
    // ── Job Boards ────────────────────────────────────────────────────────────
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      description: 'Search open jobs from any company\'s Greenhouse board by token',
      category: 'job-boards',
      icon: (
        <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 dark:bg-green-950/30 dark:border-green-900 flex items-center justify-center font-bold text-green-700 dark:text-green-400 text-sm">
          GH
        </div>
      ),
      connected: true,
      infoHref: '/job-search',
      infoLabel: 'Search Jobs',
      loading: false,
      statusNote: 'No auth required — public job boards only',
    },
    {
      id: 'lever',
      name: 'Lever',
      description: 'Search open jobs from any Lever-powered company board',
      category: 'job-boards',
      icon: (
        <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 dark:bg-purple-950/30 dark:border-purple-900 flex items-center justify-center font-bold text-purple-700 dark:text-purple-400 text-sm">
          LV
        </div>
      ),
      connected: true,
      infoHref: '/job-search',
      infoLabel: 'Search Jobs',
      loading: false,
      statusNote: 'No auth required — public job boards only',
    },
    {
      id: 'ashby',
      name: 'Ashby',
      description: 'Search open jobs from Ashby-hosted company boards',
      category: 'job-boards',
      icon: (
        <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 dark:bg-orange-950/30 dark:border-orange-900 flex items-center justify-center font-bold text-orange-700 dark:text-orange-400 text-sm">
          AB
        </div>
      ),
      connected: true,
      infoHref: '/job-search',
      infoLabel: 'Search Jobs',
      loading: false,
      statusNote: 'No auth required — public job boards only',
    },
    {
      id: 'linkedin-jobs',
      name: 'LinkedIn Job Search',
      description: 'Async Playwright scraping of public LinkedIn job listings',
      category: 'job-boards',
      icon: (
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400 text-sm">
          in
        </div>
      ),
      connected: null,
      infoHref: '/job-search',
      infoLabel: 'Search Jobs',
      loading: false,
      statusNote: 'Feature-flagged: set LINKEDIN_SCRAPING_ENABLED=true',
    },
    // ── Profile ───────────────────────────────────────────────────────────────
    {
      id: 'linkedin-profile',
      name: 'LinkedIn Profile Import',
      description: 'Import experience, education, and skills from your public LinkedIn profile',
      category: 'profile',
      icon: (
        <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100 dark:bg-sky-950/30 dark:border-sky-900 flex items-center justify-center font-bold text-sky-700 dark:text-sky-400 text-sm">
          in
        </div>
      ),
      connected: null,
      infoHref: '/profile',
      infoLabel: 'Go to Profile → Import',
      loading: false,
      statusNote: 'Uses Playwright browser automation on server. Requires public profile.',
    },
  ];

  const categories: { id: Integration['category']; label: string; icon: React.ReactNode }[] = [
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'job-boards', label: 'Job Boards', icon: <Search className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <NavLayout title="Integrations" subtitle="Connect external services to supercharge your job search">
      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-8">

        {categories.map(({ id: catId, label, icon }) => {
          const items = integrations.filter((i) => i.category === catId);
          return (
            <section key={catId} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {icon}
                <span>{label}</span>
              </div>

              {items.map((integration) => (
                <Card key={integration.id}>
                  <CardBody className="p-5 flex items-center gap-4 justify-between flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0">{integration.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {integration.name}
                          </span>
                          {integration.connected === true && (
                            <span className="flex items-center gap-1 text-2xs font-semibold text-green-700 dark:text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </span>
                          )}
                          {integration.connected === false && (
                            <span className="text-2xs font-medium text-slate-400">Not connected</span>
                          )}
                          {integration.connected === null && (
                            <span className="text-2xs font-medium text-amber-600 dark:text-amber-400">Feature-flagged</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {integration.description}
                        </p>
                        {integration.statusNote && (
                          <p className="flex items-center gap-1 text-2xs text-slate-400 mt-1">
                            <Info className="w-3 h-3 shrink-0" />
                            {integration.statusNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {/* External info link */}
                      {integration.infoHref && (
                        <a href={integration.infoHref}>
                          <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {integration.infoLabel ?? 'Open'}
                          </Button>
                        </a>
                      )}

                      {/* Sync button (calendar only when connected) */}
                      {integration.syncAction && integration.connected && (
                        <button
                          onClick={integration.syncAction}
                          disabled={integration.loading}
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                          title="Sync"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing === integration.id.replace('-calendar', '') ? 'animate-spin text-blue-500' : ''}`} />
                        </button>
                      )}

                      {/* Connect / Disconnect */}
                      {integration.connectHref !== undefined && (
                        integration.connected ? (
                          <button
                            onClick={integration.disconnectAction}
                            disabled={integration.loading}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Disconnect"
                          >
                            <Link2Off className="w-4 h-4" />
                          </button>
                        ) : (
                          <a href={integration.connectHref}>
                            <Button variant="primary" size="sm" className="flex items-center gap-1.5" disabled={integration.loading}>
                              <LinkIcon className="w-3.5 h-3.5" />
                              Connect
                            </Button>
                          </a>
                        )
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </section>
          );
        })}
      </div>
    </NavLayout>
  );
}
