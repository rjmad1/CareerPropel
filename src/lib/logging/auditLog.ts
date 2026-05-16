import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Audit Logging System
 * Tracks all user actions and security events
 */

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
  timestamp?: Date
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // Get candidate ID
    const candidate = await prisma.candidate.findUnique({
      where: { email: entry.email },
      select: { id: true }
    })

    if (!candidate) {
      console.warn(`Candidate not found for audit log: ${entry.email}`)
      return
    }

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        candidateId: candidate.id,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        changes: entry.changes,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        status: entry.status,
        errorMessage: entry.errorMessage,
        timestamp: entry.timestamp || new Date()
      }
    })

    console.log(`[AUDIT] ${entry.action} - ${entry.email}`, {
      resourceId: entry.resourceId,
      status: entry.status
    })

    // Alert on suspicious activity
    if (entry.action === AuditAction.UNAUTHORIZED_ACCESS) {
      await alertSecurityTeam(entry)
    }
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

/**
 * Log security-sensitive actions
 */
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

/**
 * Get audit logs for a user
 */
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

  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!candidate) return []

  const where: any = { candidateId: candidate.id }

  if (action) where.action = action
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Get all audit logs (admin view)
 */
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
  if (email) {
    where.candidate = {
      email: { contains: email, mode: 'insensitive' }
    }
  }
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }

  return prisma.auditLog.findMany({
    where,
    include: { candidate: { select: { email: true, name: true } } },
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Detect suspicious patterns
 */
export async function detectSuspiciousActivity(
  email: string
): Promise<Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>> {
  const findings: Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = []

  // Get recent logs
  const logs = await getUserAuditLogs(email, {
    limit: 100,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  })

  // Check for multiple failed logins
  const failedLogins = logs.filter(
    l => l.action === 'LOGIN' && l.status === 'FAILURE'
  )
  if (failedLogins.length > 5) {
    findings.push({
      type: 'MULTIPLE_FAILED_LOGINS',
      severity: 'HIGH'
    })
  }

  // Check for rapid actions (bot behavior)
  const lastHour = logs.filter(
    l => l.timestamp > new Date(Date.now() - 60 * 60 * 1000)
  )
  if (lastHour.length > 100) {
    findings.push({
      type: 'RAPID_ACTIONS',
      severity: 'MEDIUM'
    })
  }

  return findings
}

/**
 * Alert security team of suspicious activity
 */
async function alertSecurityTeam(entry: AuditLogEntry): Promise<void> {
  console.warn(`[SECURITY ALERT] ${entry.action} - ${entry.email}`, entry)
}
