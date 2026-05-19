'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Calendar, RefreshCw, Link2, Link2Off, MapPin, Video, Clock, Loader2 } from 'lucide-react';

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
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
  const justConnected = searchParams.get('connected');
  const connectError = searchParams.get('error');

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
    } catch (e: any) {
      setError(e.message);
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
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Provider cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Google */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-lg">G</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">Google Calendar</p>
              <p className="text-xs text-gray-500">{googleConnected ? 'Connected' : 'Not connected'}</p>
            </div>
            {googleConnected ? (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => handleSync('google')} disabled={syncing === 'google'}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-50" title="Sync">
                  <RefreshCw className={`w-4 h-4 ${syncing === 'google' ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => handleDisconnect('google')} disabled={disconnecting === 'google'}
                  className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-50" title="Disconnect">
                  <Link2Off className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a href="/api/calendar/authorize"
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                <Link2 className="w-3.5 h-3.5" /> Connect
              </a>
            )}
          </div>

          {/* Outlook */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-lg">O</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">Outlook Calendar</p>
              <p className="text-xs text-gray-500">{outlookConnected ? 'Connected' : 'Not connected'}</p>
            </div>
            {outlookConnected ? (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => handleSync('outlook')} disabled={syncing === 'outlook'}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-50" title="Sync">
                  <RefreshCw className={`w-4 h-4 ${syncing === 'outlook' ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => handleDisconnect('outlook')} disabled={disconnecting === 'outlook'}
                  className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-50" title="Disconnect">
                  <Link2Off className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a href="/api/calendar/authorize/outlook"
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                <Link2 className="w-3.5 h-3.5" /> Connect
              </a>
            )}
          </div>
        </div>

        {justConnected && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            {justConnected === 'outlook' ? 'Outlook' : 'Google'} Calendar connected — your upcoming events have been synced.
          </div>
        )}

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Event list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : !anyConnected && events.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm">Connect Google or Outlook Calendar to see your interview schedule here.</p>
            <p className="text-xs">Interviews you schedule in this app will appear automatically.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm">No upcoming events found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([day, dayEvents]) => (
              <div key={day}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {formatDate(dayEvents[0].startAt)}
                </h3>
                <div className="space-y-2">
                  {dayEvents.map((ev) => (
                    <div key={ev.id}
                      className={`bg-white rounded-xl border p-4 flex gap-4 transition-colors ${ev.interviewId ? 'border-blue-200 bg-blue-50/30 hover:border-blue-300' : 'border-gray-200 hover:border-blue-200'}`}>
                      <div className="text-right shrink-0 w-16">
                        <p className="text-sm font-medium text-gray-900">{formatTime(ev.startAt)}</p>
                        <p className="text-xs text-gray-400">{formatTime(ev.endAt)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{ev.title}</p>
                          {ev.interviewId && (
                            <span className="shrink-0 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Interview</span>
                          )}
                          <span className="shrink-0 text-xs text-gray-400 capitalize">{ev.provider}</span>
                        </div>
                        {ev.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {ev.location && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" /> {ev.location}
                            </span>
                          )}
                          {ev.meetingUrl && (
                            <a href={ev.meetingUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <Video className="w-3 h-3" /> Join meeting
                            </a>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {Math.round((new Date(ev.endAt).getTime() - new Date(ev.startAt).getTime()) / 60000)} min
                          </span>
                        </div>
                      </div>
                    </div>
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
    <Suspense>
      <CalendarContent />
    </Suspense>
  );
}
