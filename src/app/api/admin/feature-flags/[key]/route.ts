import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { invalidateFeatureFlagCache } from '@/lib/security/authorization/authorizationCache'
import { prisma } from '@/lib/db'
import { logAuditEvent, AuditAction } from '@/lib/logging/auditLog'

export const dynamic = 'force-dynamic'

const FlagUpdateBody = z.object({
  enabled:         z.boolean().optional(),
  rolloutStrategy: z.enum(['all', 'percentage', 'allowlist', 'role_scoped', 'disabled']).optional(),
  rolloutPercent:  z.number().min(0).max(100).optional(),
  allowedUserIds:  z.array(z.string()).optional(),
  allowedRoles:    z.array(z.string()).optional(),
  environment:     z.string().nullable().optional(),
  description:     z.string().optional(),
})

/** PATCH /api/admin/feature-flags/[key] — update a feature flag */
export async function PATCH(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'system.feature-flags.manage', { actorId: userId })

    const body = await request.json()
    const parsed = FlagUpdateBody.safeParse(body)
    if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('Invalid flag update payload')

    const flag = await prisma.featureFlag.upsert({
      where: { key: params.key },
      update: { ...parsed.data, updatedBy: userEmail },
      create: {
        key: params.key,
        enabled: parsed.data.enabled ?? false,
        rolloutStrategy: parsed.data.rolloutStrategy ?? 'disabled',
        rolloutPercent: parsed.data.rolloutPercent,
        allowedUserIds: parsed.data.allowedUserIds ?? [],
        allowedRoles: parsed.data.allowedRoles ?? [],
        environment: parsed.data.environment ?? null,
        description: parsed.data.description,
        createdBy: userEmail,
        updatedBy: userEmail,
      },
    })

    await invalidateFeatureFlagCache(params.key)

    await logAuditEvent({
      email: userEmail,
      action: AuditAction.SETTINGS_UPDATED,
      resourceType: 'feature_flag',
      resourceId: params.key,
      changes: { op: 'update', updates: parsed.data },
      status: 'SUCCESS',
    })

    return successResponse({ flag })
  } catch (err) {
    return errorResponse(err)
  }
}
