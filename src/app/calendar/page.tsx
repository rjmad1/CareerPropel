'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarMonth,
  Refresh,
  Link as LinkIcon,
  LinkOff,
  LocationOn,
  VideoCall,
  AccessTime,
} from '@mui/icons-material';

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
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        {/* Provider Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            {
              id: 'google' as const,
              label: 'Google Calendar',
              connected: googleConnected,
              authHref: '/api/calendar/authorize',
              initial: 'G',
              color: '#EA4335',
            },
            {
              id: 'outlook' as const,
              label: 'Outlook Calendar',
              connected: outlookConnected,
              authHref: '/api/calendar/authorize/outlook',
              initial: 'O',
              color: '#0078D4',
            },
          ].map((p) => (
            <Grid size={{ xs: 12, sm: 6 }} key={p.id}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: '50%',
                      bgcolor: `${p.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: p.color, fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                    }}
                  >
                    {p.initial}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.label}</Typography>
                    <Typography variant="caption" color={p.connected ? 'success.main' : 'text.secondary'}>
                      {p.connected ? 'Connected' : 'Not connected'}
                    </Typography>
                  </Box>
                  {p.connected ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="Sync">
                        <IconButton
                          size="small"
                          onClick={() => handleSync(p.id)}
                          disabled={syncing === p.id}
                        >
                          {syncing === p.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Refresh fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Disconnect">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDisconnect(p.id)}
                          disabled={disconnecting === p.id}
                        >
                          <LinkOff fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      href={p.authHref}
                      startIcon={<LinkIcon fontSize="small" />}
                      sx={{ flexShrink: 0 }}
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {justConnected && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {justConnected === 'outlook' ? 'Outlook' : 'Google'} Calendar connected — your upcoming events have been synced.
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Event List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : !anyConnected && events.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <CalendarMonth sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Connect Google or Outlook Calendar to see your interview schedule here.
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Interviews you schedule in this app will appear automatically.
              </Typography>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <CalendarMonth sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">No upcoming events found.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from(grouped.entries()).map(([day, dayEvents]) => (
              <Box key={day}>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}
                >
                  {formatDate(dayEvents[0].startAt)}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dayEvents.map((ev) => (
                    <Card
                      key={ev.id}
                      sx={{
                        border: '1px solid',
                        borderColor: ev.interviewId ? 'primary.light' : 'divider',
                        bgcolor: ev.interviewId ? 'primary.50' : 'background.paper',
                      }}
                    >
                      <CardContent sx={{ display: 'flex', gap: 2.5, py: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ textAlign: 'right', flexShrink: 0, width: 68 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatTime(ev.startAt)}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatTime(ev.endAt)}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{ev.title}</Typography>
                            {ev.interviewId && (
                              <Chip label="Interview" size="small" color="primary" variant="outlined" />
                            )}
                            <Chip label={ev.provider} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                          </Box>
                          {ev.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ev.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {ev.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn sx={{ fontSize: 14, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">{ev.location}</Typography>
                              </Box>
                            )}
                            {ev.meetingUrl && (
                              <Box
                                component="a"
                                href={ev.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                              >
                                <VideoCall sx={{ fontSize: 14 }} />
                                <Typography variant="caption">Join meeting</Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary">{durationMins(ev.startAt, ev.endAt)} min</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
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
