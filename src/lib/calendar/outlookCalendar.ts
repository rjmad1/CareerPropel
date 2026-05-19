/**
 * Outlook / Microsoft 365 Calendar integration via Microsoft Graph API
 *
 * Uses OAuth2 Authorization Code flow (PKCE not required for server-side).
 * Tokens are stored in CalendarToken with provider = 'outlook'.
 *
 * Required env vars:
 *   OUTLOOK_CLIENT_ID        — Azure AD App client ID
 *   OUTLOOK_CLIENT_SECRET    — Azure AD App client secret
 *   OUTLOOK_REDIRECT_URI     — e.g. http://localhost:3000/api/calendar/callback/outlook
 *   OUTLOOK_TENANT_ID        — 'common' for multi-tenant (default)
 */

import axios from 'axios';
import { prisma } from '@/lib/db';

function clientId() {
  const v = process.env.OUTLOOK_CLIENT_ID;
  if (!v) throw new Error('OUTLOOK_CLIENT_ID is not set');
  return v;
}
function clientSecret() {
  const v = process.env.OUTLOOK_CLIENT_SECRET;
  if (!v) throw new Error('OUTLOOK_CLIENT_SECRET is not set');
  return v;
}
function redirectUri() {
  return (
    process.env.OUTLOOK_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/calendar/callback/outlook`
  );
}
function tenant() {
  return process.env.OUTLOOK_TENANT_ID || 'common';
}

const SCOPES = 'offline_access Calendars.Read Calendars.ReadWrite';

export function buildOutlookAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    response_type: 'code',
    redirect_uri: redirectUri(),
    response_mode: 'query',
    scope: SCOPES,
    state,
  });
  return `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize?${params}`;
}

interface MSTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function exchangeOutlookCode(code: string): Promise<MSTokenResponse> {
  const { data } = await axios.post<MSTokenResponse>(
    `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      code,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
}

async function refreshOutlookToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const { data } = await axios.post(
    `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
}

export async function saveOutlookTokens(candidateId: string, tokens: MSTokenResponse): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await prisma.calendarToken.upsert({
    where: { candidateId_provider: { candidateId, provider: 'outlook' } },
    create: {
      candidateId,
      provider: 'outlook',
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

async function getValidOutlookToken(candidateId: string): Promise<string> {
  const record = await prisma.calendarToken.findUnique({
    where: { candidateId_provider: { candidateId, provider: 'outlook' } },
  });
  if (!record) throw new Error('Outlook Calendar not connected');

  const needsRefresh = record.expiresAt
    ? record.expiresAt.getTime() - Date.now() < 60_000
    : true;

  if (!needsRefresh) return record.accessToken;
  if (!record.refreshToken) throw new Error('No refresh token — reconnect Outlook Calendar');

  const fresh = await refreshOutlookToken(record.refreshToken);
  await prisma.calendarToken.update({
    where: { candidateId_provider: { candidateId, provider: 'outlook' } },
    data: { accessToken: fresh.access_token, expiresAt: new Date(Date.now() + fresh.expires_in * 1000) },
  });
  return fresh.access_token;
}

export interface OutlookEventRaw {
  id: string;
  subject?: string;
  body?: { content: string };
  start?: { dateTime: string; timeZone: string };
  end?: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  onlineMeeting?: { joinUrl: string };
  webLink?: string;
}

export async function fetchOutlookEvents(candidateId: string, maxResults = 50): Promise<OutlookEventRaw[]> {
  const token = await getValidOutlookToken(candidateId);
  const now = new Date().toISOString();
  const { data } = await axios.get('https://graph.microsoft.com/v1.0/me/calendarview', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      startDateTime: now,
      endDateTime: new Date(Date.now() + 90 * 24 * 3600_000).toISOString(), // 90 days ahead
      $top: maxResults,
      $orderby: 'start/dateTime',
      $select: 'id,subject,body,start,end,location,onlineMeeting,webLink',
    },
  });
  return (data.value ?? []) as OutlookEventRaw[];
}

export async function syncOutlookEvents(candidateId: string): Promise<number> {
  const events = await fetchOutlookEvents(candidateId, 100);
  let count = 0;

  for (const ev of events) {
    const startAt = new Date(ev.start?.dateTime ?? Date.now());
    const endAt = new Date(ev.end?.dateTime ?? Date.now());

    await prisma.calendarEvent.upsert({
      where: { candidateId_externalId_provider: { candidateId, externalId: ev.id, provider: 'outlook' } },
      create: {
        candidateId,
        externalId: ev.id,
        provider: 'outlook',
        title: ev.subject ?? '(no title)',
        description: ev.body?.content?.replace(/<[^>]+>/g, '').trim() ?? null,
        startAt,
        endAt,
        location: ev.location?.displayName ?? null,
        meetingUrl: ev.onlineMeeting?.joinUrl ?? null,
      },
      update: {
        title: ev.subject ?? '(no title)',
        startAt,
        endAt,
        location: ev.location?.displayName ?? null,
        meetingUrl: ev.onlineMeeting?.joinUrl ?? null,
        syncedAt: new Date(),
      },
    });
    count++;
  }
  return count;
}

export async function isOutlookConnected(candidateId: string): Promise<boolean> {
  const r = await prisma.calendarToken.findUnique({
    where: { candidateId_provider: { candidateId, provider: 'outlook' } },
    select: { id: true },
  });
  return !!r;
}

export async function disconnectOutlook(candidateId: string): Promise<void> {
  await prisma.calendarToken.deleteMany({ where: { candidateId, provider: 'outlook' } });
}
