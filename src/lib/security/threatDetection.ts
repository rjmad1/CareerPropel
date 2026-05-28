import { prisma } from '@/lib/db'

export interface ThreatAlert {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  details: Record<string, unknown>
}

/**
 * Log a login attempt for threat analysis
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        email,
        success,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('❌ Error logging login attempt:', error)
  }
}

/**
 * Log session activity for threat analysis
 */
export async function logSessionActivity(
  email: string,
  sessionId: string,
  action: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const riskScore = calculateActivityRiskScore(action, ipAddress)

    await prisma.sessionActivity.create({
      data: {
        email,
        sessionId,
        action,
        ipAddress,
        userAgent,
        riskScore,
      },
    })
  } catch (error) {
    console.error('❌ Error logging session activity:', error)
  }
}

/**
 * Detect suspicious login patterns
 */
export async function detectSuspiciousLoginPatterns(
  email: string
): Promise<ThreatAlert[]> {
  const alerts: ThreatAlert[] = []

  try {
    // Get login attempts in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentLogins = await prisma.loginAttempt.findMany({
      where: {
        email,
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'desc' },
    })

    if (recentLogins.length === 0) {
      return alerts
    }

    // Check for excessive failed login attempts
    const failedAttempts = recentLogins.filter((l) => !l.success)
    if (failedAttempts.length >= 5) {
      alerts.push({
        type: 'EXCESSIVE_FAILED_LOGINS',
        severity: 'HIGH',
        message: `${failedAttempts.length} failed login attempts in last 24 hours`,
        details: {
          failedAttempts: failedAttempts.length,
          timeWindow: '24 hours',
        },
      })
    }

    // Check for login from multiple IPs in short time
    const successfulLogins = recentLogins.filter((l) => l.success)
    if (successfulLogins.length >= 2) {
      const ips = new Set(successfulLogins.map((l) => l.ipAddress))
      const timeWindow = 30 * 60 * 1000 // 30 minutes

      for (const ip of ips) {
        const loginsFromIp = successfulLogins.filter((l) => l.ipAddress === ip)
        if (loginsFromIp.length >= 1) {
          // Check if another IP was used within 30 minutes
          for (const otherIp of ips) {
            if (otherIp !== ip) {
              const timeDiff = Math.abs(
                new Date(loginsFromIp[0].timestamp).getTime() -
                  new Date(
                    successfulLogins.find((l) => l.ipAddress === otherIp)
                      ?.timestamp || 0
                  ).getTime()
              )

              if (timeDiff < timeWindow) {
                alerts.push({
                  type: 'LOGIN_FROM_MULTIPLE_IPS',
                  severity: 'MEDIUM',
                  message: `Successful logins from multiple IP addresses within 30 minutes`,
                  details: {
                    ips: Array.from(ips),
                    count: ips.size,
                  },
                })
                break
              }
            }
          }
        }
      }
    }

    // Check for unusual login time
    if (successfulLogins.length > 0) {
      const lastLogin = successfulLogins[0]
      const loginHour = new Date(lastLogin.timestamp).getHours()

      // Flag login between 2 AM - 5 AM as unusual
      if (loginHour >= 2 && loginHour <= 5) {
        // Count successful logins at this unusual hour in the past 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const unusualHourLogins = await prisma.loginAttempt.findMany({
          where: {
            email,
            success: true,
            timestamp: { gte: thirtyDaysAgo },
          },
        })

        const unusualCount = unusualHourLogins.filter((l) => {
          const hour = new Date(l.timestamp).getHours()
          return hour >= 2 && hour <= 5
        }).length

        if (unusualCount > 0) {
          alerts.push({
            type: 'UNUSUAL_LOGIN_TIME',
            severity: 'LOW',
            message: `Login at unusual hour (${loginHour}:00)`,
            details: {
              hour: loginHour,
              frequency: unusualCount,
            },
          })
        }
      }
    }
  } catch (error) {
    console.error('❌ Error detecting login patterns:', error)
  }

  return alerts
}

/**
 * Detect anomalous user activity
 */
export async function detectAnomalousActivity(
  email: string
): Promise<ThreatAlert[]> {
  const alerts: ThreatAlert[] = []

  try {
    // Get user's activity in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentActivity = await prisma.sessionActivity.findMany({
      where: {
        email,
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'desc' },
    })

    if (recentActivity.length === 0) {
      return alerts
    }

    // Check for high-risk activities
    const highRiskCount = recentActivity.filter((a) => a.riskScore >= 70).length
    if (highRiskCount >= 5) {
      alerts.push({
        type: 'HIGH_RISK_ACTIVITY_SPIKE',
        severity: 'HIGH',
        message: `Multiple high-risk activities detected (${highRiskCount} in 24 hours)`,
        details: {
          count: highRiskCount,
          timeWindow: '24 hours',
          averageRiskScore: Math.round(
            recentActivity.reduce((sum, a) => sum + a.riskScore, 0) /
              recentActivity.length
          ),
        },
      })
    }

    // Check for rapid API calls (potential automated attack)
    const apiCalls = recentActivity.filter((a) => a.action === 'api_call')
    if (apiCalls.length >= 100) {
      const timeRange = Math.max(
        ...apiCalls.map((a) => new Date(a.timestamp).getTime())
      ) - Math.min(...apiCalls.map((a) => new Date(a.timestamp).getTime()))

      const minutesRange = timeRange / (60 * 1000)
      if (minutesRange < 10) {
        alerts.push({
          type: 'RAPID_API_CALLS',
          severity: 'HIGH',
          message: `${apiCalls.length} API calls in ${minutesRange.toFixed(1)} minutes (potential bot/scan)`,
          details: {
            callCount: apiCalls.length,
            timeWindow: `${minutesRange.toFixed(1)} minutes`,
          },
        })
      }
    }

    // Check for bulk data access
    const dataAccessCount = recentActivity.filter(
      (a) => a.action === 'data_access'
    ).length
    if (dataAccessCount >= 50) {
      alerts.push({
        type: 'BULK_DATA_ACCESS',
        severity: 'MEDIUM',
        message: `${dataAccessCount} data access operations in 24 hours`,
        details: {
          count: dataAccessCount,
        },
      })
    }

    // Check for activity from unusual IP
    const ips = new Set(recentActivity.map((a) => a.ipAddress))
    if (ips.size > 3) {
      alerts.push({
        type: 'ACTIVITY_FROM_MULTIPLE_IPS',
        severity: 'LOW',
        message: `Activity detected from ${ips.size} different IP addresses`,
        details: {
          ipCount: ips.size,
          ips: Array.from(ips).filter(Boolean),
        },
      })
    }
  } catch (error) {
    console.error('❌ Error detecting anomalous activity:', error)
  }

  return alerts
}

/**
 * Get suspicious activity summary for a user
 */
export async function getSuspiciousActivitySummary(
  email: string
): Promise<{ alerts: ThreatAlert[]; riskScore: number }> {
  try {
    const loginAlerts = await detectSuspiciousLoginPatterns(email)
    const activityAlerts = await detectAnomalousActivity(email)

    const allAlerts = [...loginAlerts, ...activityAlerts]

    // Calculate overall risk score (0-100)
    let riskScore = 0
    for (const alert of allAlerts) {
      switch (alert.severity) {
        case 'CRITICAL':
          riskScore += 25
          break
        case 'HIGH':
          riskScore += 15
          break
        case 'MEDIUM':
          riskScore += 8
          break
        case 'LOW':
          riskScore += 2
          break
      }
    }

    return {
      alerts: allAlerts,
      riskScore: Math.min(riskScore, 100),
    }
  } catch (error) {
    console.error('❌ Error getting suspicious activity summary:', error)
    return {
      alerts: [],
      riskScore: 0,
    }
  }
}

/**
 * Calculate activity risk score
 */
function calculateActivityRiskScore(action: string, ipAddress?: string): number {
  let score = 0

  // Action-based scoring
  switch (action) {
    case 'delete':
      score += 30
      break
    case 'bulk_operation':
      score += 25
      break
    case 'permission_change':
      score += 20
      break
    case 'login':
      score += 10
      break
    case 'api_call':
      score += 5
      break
    default:
      score += 2
  }

  // IP-based scoring (no IP = potential cloud/proxy use)
  if (!ipAddress) {
    score += 10
  }

  return Math.min(score, 100)
}

/**
 * Clear old activity records (cleanup)
 */
export async function cleanupOldActivityRecords(
  daysToKeep: number = 90
): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

    const [deletedLoginAttempts, deletedSessionActivity] = await Promise.all([
      prisma.loginAttempt.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
      prisma.sessionActivity.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
    ])

    const totalDeleted =
      deletedLoginAttempts.count + deletedSessionActivity.count

    console.log(`🧹 Cleaned up ${totalDeleted} old activity records`)

    return { deleted: totalDeleted }
  } catch (error) {
    console.error('❌ Error cleaning up activity records:', error)
    return { deleted: 0 }
  }
}
