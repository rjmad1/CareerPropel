import { prisma } from "@/lib/db"
import { log } from "@/lib/logging/logger"

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // 2FA
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_VERIFIED = 'TWO_FACTOR_VERIFIED',

  // Job Management
  JOB_CREATED = 'JOB_CREATED',
  JOB_UPDATED = 'JOB_UPDATED',
  JOB_DELETED = 'JOB_DELETED',
  JOB_STAGE_CHANGED = 'JOB_STAGE_CHANGED',

  // Account
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',

  // API Keys
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_USED = 'API_KEY_USED',

  // Role & Access
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',

  // Security
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export interface AuditLogEntry {
  action: AuditAction
  email: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  severity?: 'info' | 'warning' | 'error' | 'critical'
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        email: entry.email,
        action: entry.action,
        resource: entry.resource ?? 'system',
        resourceId: entry.resourceId,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        status: entry.status,
        severity: entry.severity ?? 'info',
      },
    })

    if (entry.action === AuditAction.UNAUTHORIZED_ACCESS) {
      await alertSecurityTeam(entry)
    }
  } catch (error) {
    log.error({ err: error }, 'Audit log persistence error')
  }
}

export async function logSecurityEvent(
  action: AuditAction,
  email: string,
  options: {
    resource?: string
    resourceId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    status?: 'success' | 'failure'
    severity?: 'info' | 'warning' | 'error' | 'critical'
  } = {}
): Promise<void> {
  await logAuditEvent({
    action,
    email,
    ...options,
    status: options.status ?? 'success',
  })
}

export async function getUserAuditLogs(
  email: string,
  options: {
    limit?: number
    offset?: number
    action?: AuditAction
    startDate?: Date
    endDate?: Date
  } = {}
): Promise<any[]> {
  const { limit = 50, offset = 0, action, startDate, endDate } = options

  const where: any = { email }
  if (action) where.action = action
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function getAllAuditLogs(
  options: {
    limit?: number
    offset?: number
    action?: AuditAction
    email?: string
    startDate?: Date
    endDate?: Date
  } = {}
): Promise<any[]> {
  const { limit = 100, offset = 0, action, email, startDate, endDate } = options

  const where: any = {}
  if (action) where.action = action
  if (email) where.email = { contains: email, mode: 'insensitive' }
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function detectSuspiciousActivity(
  email: string
): Promise<Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>> {
  const findings: Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = []

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const logs = await getUserAuditLogs(email, { limit: 100, startDate: since })

  const failedLogins = logs.filter(l => l.action === 'LOGIN' && l.status === 'failure')
  if (failedLogins.length > 5) {
    findings.push({ type: 'MULTIPLE_FAILED_LOGINS', severity: 'HIGH' })
  }

  const lastHour = logs.filter(l => l.createdAt > new Date(Date.now() - 60 * 60 * 1000))
  if (lastHour.length > 100) {
    findings.push({ type: 'RAPID_ACTIONS', severity: 'MEDIUM' })
  }

  return findings
}

/**
 * Security alert dispatcher.
 *
 * RASUI-006 remediation: replaced console.warn (which is invisible in
 * production log aggregators unless they parse stdout) with a structured
 * pino log at 'error' level, which aggregators (Datadog, Logtail, etc.)
 * can route to an alert channel.
 *
 * Additionally, if SECURITY_ALERT_WEBHOOK_URL is configured, POSTs the
 * alert payload to a Slack-compatible incoming webhook.
 * Set SECURITY_ALERT_WEBHOOK_URL to your Slack / PagerDuty webhook URL.
 */
async function alertSecurityTeam(entry: AuditLogEntry): Promise<void> {
  // Structured log — visible in all aggregators at ERROR severity
  log.error(
    {
      securityAlert: true,
      action: entry.action,
      // Deliberately omit entry.email from the top-level to avoid PII indexing;
      // it is present in the AuditLog DB record.
      resource: entry.resource,
      resourceId: entry.resourceId,
      ipAddress: entry.ipAddress,
      severity: entry.severity,
      status: entry.status,
    },
    '[SECURITY ALERT] Unauthorized access detected'
  );

  // Optional webhook delivery (Slack / PagerDuty / etc.)
  const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      text: `🚨 *Security Alert*: ${entry.action}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Action:* ${entry.action}\n*Resource:* ${entry.resource ?? 'system'}\n*IP:* ${entry.ipAddress ?? 'unknown'}\n*Severity:* ${entry.severity ?? 'unknown'}`,
          },
        },
      ],
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5s timeout on webhook delivery
    });
  } catch (err) {
    log.warn({ err }, 'Failed to deliver security alert to webhook');
  }
}
