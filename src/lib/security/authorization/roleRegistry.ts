/**
 * Canonical role registry — defines the five system roles and their permission sets.
 * System roles are immutable by design; only SUPER_ADMIN can modify custom roles.
 */

import { JOB_SEEKER_PERMISSIONS, WILDCARD_PERMISSION } from './permissionRegistry'

export interface RoleDefinition {
  name: string
  displayName: string
  description: string
  roleType: 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'SECURITY_ADMIN' | 'SUPPORT_ADMIN' | 'JOB_SEEKER' | 'CUSTOM'
  immutableSystemRole: boolean
  priority: number
  permissions: string[] // permission keys; ['*'] = all
}

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Platform owner with unrestricted access. Bypasses all role assignment restrictions.',
    roleType: 'SUPER_ADMIN',
    immutableSystemRole: true,
    priority: 0,
    permissions: [WILDCARD_PERMISSION],
  },
  {
    name: 'PLATFORM_ADMIN',
    displayName: 'Platform Administrator',
    description: 'Operational platform administrator. Manages users, queues, logs, and providers.',
    roleType: 'PLATFORM_ADMIN',
    immutableSystemRole: true,
    priority: 10,
    permissions: [
      'system.health.read',
      'system.runtime.read',
      'system.metrics.read',
      'system.admin.access',
      'rbac.roles.read',
      'rbac.users.assign',
      'rbac.audit.read',
      'users.read',
      'users.update',
      'users.disable',
      'users.manage',
      'queue.read',
      'queue.replay',
      'queue.cancel',
      'queue.pause',
      'queue.dlq.manage',
      'agents.execute',
      'agents.override',
      'agents.force-complete',
      'agents.logs.read',
      'providers.read',
      'providers.update',
      'audit.read',
      'audit.export',
      'threats.read',
      'threats.resolve',
      'audit.manage',
      'security.manage',
      ...JOB_SEEKER_PERMISSIONS,
    ],
  },
  {
    name: 'SECURITY_ADMIN',
    displayName: 'Security Administrator',
    description: 'Focused on security governance: audit logs, threats, and access revocation.',
    roleType: 'SECURITY_ADMIN',
    immutableSystemRole: true,
    priority: 20,
    permissions: [
      'system.admin.access',
      'rbac.roles.read',
      'rbac.audit.read',
      'users.read',
      'users.disable',
      'audit.read',
      'audit.export',
      'threats.read',
      'threats.resolve',
      'security.manage',
      'audit.manage',
    ],
  },
  {
    name: 'SUPPORT_ADMIN',
    displayName: 'Support Administrator',
    description: 'Operational support role for debugging user issues and reviewing executions.',
    roleType: 'SUPPORT_ADMIN',
    immutableSystemRole: true,
    priority: 30,
    permissions: [
      'system.admin.access',
      'system.health.read',
      'users.read',
      'queue.read',
      'agents.logs.read',
      'audit.read',
      'threats.read',
      'rbac.roles.read',
      'rbac.audit.read',
    ],
  },
  {
    name: 'JOB_SEEKER',
    displayName: 'Job Seeker',
    description: 'Default platform user. Scoped to own resources only.',
    roleType: 'JOB_SEEKER',
    immutableSystemRole: true,
    priority: 100,
    permissions: JOB_SEEKER_PERMISSIONS,
  },
  // Legacy compatibility roles (map to new system)
  {
    name: 'admin',
    displayName: 'Admin (Legacy)',
    description: 'Legacy admin role. Maps to PLATFORM_ADMIN capabilities.',
    roleType: 'CUSTOM',
    immutableSystemRole: false,
    priority: 10,
    permissions: [
      'system.health.read', 'system.runtime.read', 'system.metrics.read', 'system.admin.access',
      'rbac.roles.read', 'rbac.roles.write', 'rbac.permissions.assign', 'rbac.users.assign', 'rbac.audit.read',
      'users.read', 'users.update', 'users.disable', 'users.delete', 'users.manage',
      'queue.read', 'queue.replay', 'queue.cancel', 'queue.pause', 'queue.dlq.manage',
      'agents.execute', 'agents.override', 'agents.force-complete', 'agents.logs.read',
      'providers.read', 'providers.update',
      'audit.read', 'audit.export', 'audit.manage', 'security.manage',
      'threats.read', 'threats.resolve',
      'jobs.read', 'jobs.write', 'jobs.create', 'jobs.update', 'jobs.delete', 'jobs.manage',
      'roles.manage', 'permissions.manage',
      'api_keys.create', 'api_keys.read', 'api_keys.delete',
      'security.2fa',
    ],
  },
  {
    name: 'recruiter',
    displayName: 'Recruiter (Legacy)',
    description: 'Legacy recruiter role.',
    roleType: 'CUSTOM',
    immutableSystemRole: false,
    priority: 50,
    permissions: [
      'jobs.create', 'jobs.read', 'jobs.update', 'jobs.delete',
      'users.read', 'audit.read', 'security.2fa',
      'api_keys.create', 'api_keys.read', 'api_keys.delete',
    ],
  },
  {
    name: 'candidate',
    displayName: 'Candidate (Legacy)',
    description: 'Legacy candidate role. Prefer JOB_SEEKER.',
    roleType: 'CUSTOM',
    immutableSystemRole: false,
    priority: 100,
    permissions: JOB_SEEKER_PERMISSIONS,
  },
]

export function getRoleDefinition(name: string): RoleDefinition | undefined {
  return SYSTEM_ROLES.find((r) => r.name === name)
}

export const SUPER_ADMIN_ROLE = SYSTEM_ROLES[0]
