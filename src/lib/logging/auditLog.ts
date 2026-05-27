import { prisma } from '@/lib/db'

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
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export interface AuditLogEntry {
  action: AuditAction
  email: string
  resourceType?: string
  resourceId?: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: 'SUCCESS' | 'FAILURE'
  errorMessage?: string
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        email: entry.email,
        action: entry.action,
        resource: entry.resourceType || 'unknown',
        resourceId: entry.resourceId,
        details: entry.changes as any,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        status: entry.status.toLowerCase(),
        severity: entry.status === 'FAILURE' ? 'warning' : 'info',
      }
    })

    console.log(`[AUDIT] ${entry.action} - ${entry.email}`, {
      resourceId: entry.resourceId,
      status: entry.status
    })

    if (entry.action === AuditAction.UNAUTHORIZED_ACCESS) {
      await alertSecurityTeam(entry)
    }
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export async function logSecurityEvent(
  action: AuditAction,
  email: string,
  options: {
    resourceType?: string
    resourceId?: string
    changes?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    status?: 'SUCCESS' | 'FAILURE'
    errorMessage?: string
  } = {}
): Promise<void> {
  await logAuditEvent({
    action,
    email,
    ...options,
    status: options.status || 'SUCCESS'
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
    skip: offset
  })
}

export async function getAllAuditLogs(options: {
  limit?: number
  offset?: number
  action?: AuditAction
  email?: string
  startDate?: Date
  endDate?: Date
} = {}): Promise<any[]> {
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
    skip: offset
  })
}

export async function detectSuspiciousActivity(
  email: string
): Promise<Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>> {
  const findings: Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = []

  const logs = await getUserAuditLogs(email, {
    limit: 100,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
  })

  const failedLogins = logs.filter(
    (l: any) => l.action === 'LOGIN' && l.status === 'failure'
  )
  if (failedLogins.length > 5) {
    findings.push({ type: 'MULTIPLE_FAILED_LOGINS', severity: 'HIGH' })
  }

  const lastHour = logs.filter(
    (l: any) => new Date(l.createdAt) > new Date(Date.now() - 60 * 60 * 1000)
  )
  if (lastHour.length > 100) {
    findings.push({ type: 'RAPID_ACTIONS', severity: 'MEDIUM' })
  }

  return findings
}

async function alertSecurityTeam(entry: AuditLogEntry): Promise<void> {
  console.warn(`[SECURITY ALERT] ${entry.action} - ${entry.email}`, entry)
}
