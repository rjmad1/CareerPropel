'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Card, CardBody } from '@/components/ui';
import { sanitizeText, sanitizeUrl } from '@/lib/security/sanitizeContent';
import {
  Calendar,
  RefreshCw,
  Link as LinkIcon,
  Link2Off,
  MapPin,
  Video,
  Clock,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';

const AUTH_ENDPOINTS: Record<string, string> = {
  google: '/api/calendar/authorize',
  outlook: '/api/calendar/authorize/outlook',
};

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  meetingUrl?: string;
  jobId?: string | null;
  interviewId?: string | null;
  provider: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function durationMins(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

function groupByDay(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const day = new Date(ev.startAt).toDateString();
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(ev);
  }
  return map;
}

function CalendarContent() {
  const searchParams = useSearchParams();
  const justConnected = sanitizeText(searchParams.get('connected'));
  const connectError = sanitizeText(searchParams.get('error'));

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState(connectError ?? '');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/calendar/events');
      const json = await res.json();
      const data = json.data ?? json;
      setEvents(data.events ?? []);
      setGoogleConnected(data.googleConnected ?? false);
      setOutlookConnected(data.outlookConnected ?? false);
    } catch {
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function handleSync(provider: 'google' | 'outlook') {
    setSyncing(provider);
    setError('');
    try {
      const res = await fetch(`/api/calendar/sync?provider=${provider}`, { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      await fetchEvents();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  }

  async function handleDisconnect(provider: 'google' | 'outlook') {
    const label = provider === 'google' ? 'Google' : 'Outlook';
    if (!confirm(`Disconnect ${label} Calendar? Stored events will be removed.`)) return;
    setDisconnecting(provider);
    try {
      await fetch(`/api/calendar/sync?provider=${provider}`, { method: 'DELETE' });
      await fetchEvents();
    } catch {
      setError('Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  }

  const grouped = groupByDay(events);
  const anyConnected = googleConnected || outlookConnected;

  return (
    <NavLayout title="Calendar" subtitle="Interview schedule and upcoming events">
      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Provider Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              id: 'google' as const,
              label: 'Google Calendar',
              connected: googleConnected,
              initial: 'G',
              colorClass: 'bg-red-50 text-red-650 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900',
              accentColor: 'bg-red-500',
            },
            {
              id: 'outlook' as const,
              label: 'Outlook Calendar',
              connected: outlookConnected,
              initial: 'O',
              colorClass: 'bg-blue-50 text-blue-650 border-blue-105 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900',
              accentColor: 'bg-blue-500',
            },
          ].map((p) => (
            <Card key={p.id}>
              <CardBody className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${p.colorClass} border shrink-0`}>
                    {p.initial}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {p.label}
                    </span>
                    <span className={`text-xs block mt-0.5 ${p.connected ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-500'}`}>
                      {p.connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>

                {p.connected ? (
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Sync Button */}
                    <button
                      onClick={() => handleSync(p.id)}
                      disabled={syncing === p.id}
                      className="p-2 text-slate-550 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Sync"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing === p.id ? 'animate-spin text-blue-500' : ''}`} />
                    </button>
                    {/* Disconnect Button */}
                    <button
                      onClick={() => handleDisconnect(p.id)}
                      disabled={disconnecting === p.id}
                      className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Disconnect"
                    >
                      <Link2Off className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <a href={AUTH_ENDPOINTS[p.id] || '#'} className="shrink-0">
                    <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </Button>
                  </a>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {justConnected && (
          <div className="flex items-start gap-3 p-4 text-sm text-green-800 border border-green-100 bg-green-50/50 rounded-xl dark:bg-green-950/20 dark:text-green-400 dark:border-green-900">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>
              {justConnected === 'outlook' ? 'Outlook' : 'Google'} Calendar connected — your upcoming events have been synced.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between p-4 text-sm text-red-800 border border-red-100 bg-red-50/50 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" role="alert">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-550 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Event List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !anyConnected && events.length === 0 ? (
          <Card className="text-center py-12 px-6">
            <CardBody className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                No Calendar Connected
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Connect Google or Outlook Calendar to see your interview schedule here.
              </p>
              <p className="text-xs text-slate-400 leading-normal">
                Interviews you schedule in this app will appear automatically.
              </p>
            </CardBody>
          </Card>
        ) : events.length === 0 ? (
          <Card className="text-center py-12 px-6">
            <CardBody className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                <Calendar className="w-7 h-7 text-slate-400" />
              </div>
              <span className="text-sm font-semibold text-slate-650 dark:text-slate-400">
                No upcoming events found.
              </span>
            </CardBody>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {Array.from(grouped.entries()).map(([day, dayEvents]) => (
              <div key={day} className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block pl-1">
                  {formatDate(dayEvents[0].startAt)}
                </span>
                <div className="flex flex-col gap-3">
                  {dayEvents.map((ev) => (
                    <Card
                      key={ev.id}
                      className={ev.interviewId ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10' : ''}
                    >
                      <CardBody className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex gap-4 items-start">
                          {/* Time info */}
                          <div className="text-left shrink-0 w-20 pt-0.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">
                              {formatTime(ev.startAt)}
                            </span>
                            <span className="text-2xs text-slate-500 dark:text-slate-400 block mt-0.5">
                              {formatTime(ev.endAt)}
                            </span>
                          </div>

                          {/* Event main details */}
                          <div className="min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1.5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs block leading-tight">
                                {sanitizeText(ev.title)}
                              </span>
                              {ev.interviewId && (
                                <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                  Interview
                                </span>
                              )}
                              <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-350 border border-slate-200 dark:border-slate-700 capitalize">
                                {sanitizeText(ev.provider)}
                              </span>
                            </div>

                            {ev.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md mb-2">
                                {sanitizeText(ev.description)}
                              </p>
                            )}

                            {/* Extra metadata tags */}
                            <div className="flex flex-wrap gap-4 text-slate-550 dark:text-slate-400">
                              {ev.location && (
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{sanitizeText(ev.location)}</span>
                                </div>
                              )}
                              {sanitizeUrl(ev.meetingUrl) && (
                                <a
                                  href={sanitizeUrl(ev.meetingUrl) ?? undefined}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                  <Video className="w-3.5 h-3.5 shrink-0" />
                                  <span>Join meeting</span>
                                </a>
                              )}
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{durationMins(ev.startAt, ev.endAt)} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NavLayout>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}
