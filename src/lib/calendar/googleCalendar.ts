/**
 * Google Calendar integration
 *
 * Uses OAuth2 Authorization Code flow with offline access so we can refresh
 * tokens server-side. All token storage goes through CalendarToken in Prisma.
 *
 * Required env vars:
 *   GOOGLE_CALENDAR_CLIENT_ID
 *   GOOGLE_CALENDAR_CLIENT_SECRET
 *   GOOGLE_CALENDAR_REDIRECT_URI  (e.g. http://localhost:3000/api/calendar/callback)
 */

import axios from 'axios';
import { prisma } from '@/lib/db';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

function clientId() {
  const v = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  if (!v) throw new Error('GOOGLE_CALENDAR_CLIENT_ID is not set');
  return v;
}
function clientSecret() {
  const v = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!v) throw new Error('GOOGLE_CALENDAR_CLIENT_SECRET is not set');
  return v;
}
function redirectUri() {
  return (
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/calendar/callback`
  );
}

/** Build the Google OAuth2 authorization URL to redirect the user to. */
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCode(code: string): Promise<TokenResponse> {
  const { data } = await axios.post<TokenResponse>(
    GOOGLE_TOKEN_URL,
    new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
}

/** Refresh an expired access token using the stored refresh token. */
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const { data } = await axios.post(
    GOOGLE_TOKEN_URL,
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: 'refresh_token',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
}

/** Persist tokens for a candidate. Updates if a record already exists. */
export async function saveTokens(
  candidateId: string,
  tokens: TokenResponse
): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await prisma.calendarToken.upsert({
    where: { candidateId_provider: { candidateId, provider: 'google' } },
    create: {
      candidateId,
      provider: 'google',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt,
      scope: tokens.scope,
    },
    update: {
      accessToken: tokens.access_token,
      ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
      expiresAt,
      scope: tokens.scope,
    },
  });
}

/** Retrieve a valid access token, refreshing if expired. */
async function getValidAccessToken(candidateId: string): Promise<string> {
  const record = await prisma.calendarToken.findUnique({
    where: { candidateId_provider: { candidateId, provider: 'google' } },
  });

  if (!record) throw new Error('Google Calendar not connected');

  const needsRefresh = record.expiresAt
    ? record.expiresAt.getTime() - Date.now() < 60_000
    : true;

  if (!needsRefresh) return record.accessToken;

  if (!record.refreshToken) throw new Error('No refresh token — reconnect Google Calendar');

  const fresh = await refreshAccessToken(record.refreshToken);
  const expiresAt = new Date(Date.now() + fresh.expires_in * 1000);
  await prisma.calendarToken.update({
    where: { candidateId_provider: { candidateId, provider: 'google' } },
    data: { accessToken: fresh.access_token, expiresAt },
  });
  return fresh.access_token;
}

export interface CalendarEventRaw {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  location?: string;
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ uri: string; entryPointType: string }> };
}

/** Fetch upcoming events from the user's primary Google Calendar. */
export async function fetchUpcomingEvents(
  candidateId: string,
  maxResults = 50
): Promise<CalendarEventRaw[]> {
  const token = await getValidAccessToken(candidateId);
  const { data } = await axios.get(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    },
  });
  return (data.items ?? []) as CalendarEventRaw[];
}

/** Sync Google Calendar events into CalendarEvent table. Returns upsert count. */
export async function syncCalendarEvents(candidateId: string): Promise<number> {
  const events = await fetchUpcomingEvents(candidateId, 100);
  let count = 0;

  for (const ev of events) {
    const startAt = new Date(ev.start?.dateTime ?? ev.start?.date ?? Date.now());
    const endAt = new Date(ev.end?.dateTime ?? ev.end?.date ?? Date.now());
    const meetingUrl =
      ev.hangoutLink ??
      ev.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ??
      null;

    await prisma.calendarEvent.upsert({
      where: {
        candidateId_externalId_provider: {
          candidateId,
          externalId: ev.id,
          provider: 'google',
        },
      },
      create: {
        candidateId,
        externalId: ev.id,
        provider: 'google',
        title: ev.summary ?? '(no title)',
        description: ev.description ?? null,
        startAt,
        endAt,
        location: ev.location ?? null,
        meetingUrl: meetingUrl ?? null,
      },
      update: {
        title: ev.summary ?? '(no title)',
        description: ev.description ?? null,
        startAt,
        endAt,
        location: ev.location ?? null,
        meetingUrl: meetingUrl ?? null,
        syncedAt: new Date(),
      },
    });
    count++;
  }

  return count;
}

/** Returns true if the candidate has connected Google Calendar. */
export async function isConnected(candidateId: string): Promise<boolean> {
  const record = await prisma.calendarToken.findUnique({
    where: { candidateId_provider: { candidateId, provider: 'google' } },
    select: { id: true },
  });
  return !!record;
}

/** Remove stored Google Calendar tokens (disconnect). */
export async function disconnect(candidateId: string): Promise<void> {
  await prisma.calendarToken.deleteMany({
    where: { candidateId, provider: 'google' },
  });
}
