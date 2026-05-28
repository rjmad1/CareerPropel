/**
 * Canonical permission registry — single source of truth for all platform capabilities.
 * Every capability in CareerPropel must be declared here before it can be enforced.
 *
 * Format: "domain.resource.action" or "domain.action" for flat capabilities.
 * All checks flow through authorizationService — never scattered inline.
 */

export interface PermissionDefinition {
  key: string
  resource: string
  action: string
  description: string
  systemProtected: boolean
}

// ─── System Governance ────────────────────────────────────────────────────────

const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { key: 'system.health.read',        resource: 'system',       action: 'health.read',        description: 'Read system health status',              systemProtected: true  },
  { key: 'system.runtime.read',       resource: 'system',       action: 'runtime.read',       description: 'Read runtime telemetry and diagnostics', systemProtected: true  },
  { key: 'system.metrics.read',       resource: 'system',       action: 'metrics.read',       description: 'Read platform metrics',                  systemProtected: false },
  { key: 'system.config.update',      resource: 'system',       action: 'config.update',      description: 'Modify platform configuration',          systemProtected: true  },
  { key: 'system.feature-flags.manage', resource: 'system',     action: 'feature-flags.manage', description: 'Manage feature flag rollouts',         systemProtected: true  },
  { key: 'system.admin.access',       resource: 'system',       action: 'admin.access',       description: 'Access the admin console',               systemProtected: true  },
]

// ─── RBAC Governance ──────────────────────────────────────────────────────────

const RBAC_PERMISSIONS: PermissionDefinition[] = [
  { key: 'rbac.roles.read',          resource: 'rbac', action: 'roles.read',          description: 'Read role definitions',             systemProtected: false },
  { key: 'rbac.roles.write',         resource: 'rbac', action: 'roles.write',         description: 'Create or modify roles',            systemProtected: true  },
  { key: 'rbac.permissions.assign',  resource: 'rbac', action: 'permissions.assign',  description: 'Assign permissions to roles',       systemProtected: true  },
  { key: 'rbac.users.assign',        resource: 'rbac', action: 'users.assign',        description: 'Assign roles to users',             systemProtected: true  },
  { key: 'rbac.audit.read',          resource: 'rbac', action: 'audit.read',          description: 'Read RBAC audit trail',             systemProtected: false },
]

// ─── User Administration ──────────────────────────────────────────────────────

const USER_PERMISSIONS: PermissionDefinition[] = [
  { key: 'users.read',        resource: 'users', action: 'read',        description: 'Read user profiles',           systemProtected: false },
  { key: 'users.update',      resource: 'users', action: 'update',      description: 'Update user accounts',         systemProtected: false },
  { key: 'users.disable',     resource: 'users', action: 'disable',     description: 'Disable user accounts',        systemProtected: true  },
  { key: 'users.delete',      resource: 'users', action: 'delete',      description: 'Delete user accounts',         systemProtected: true  },
  { key: 'users.impersonate', resource: 'users', action: 'impersonate', description: 'Impersonate users (audited)',   systemProtected: true  },
  // Legacy compatibility keys still registered for existing checks
  { key: 'users.manage',      resource: 'users', action: 'manage',      description: 'Full user management access',  systemProtected: true  },
]

// ─── Queue & Runtime Operations ───────────────────────────────────────────────

const QUEUE_PERMISSIONS: PermissionDefinition[] = [
  { key: 'queue.read',       resource: 'queue', action: 'read',       description: 'Inspect queue state and depth',   systemProtected: false },
  { key: 'queue.replay',     resource: 'queue', action: 'replay',     description: 'Replay dead-letter queue jobs',   systemProtected: true  },
  { key: 'queue.cancel',     resource: 'queue', action: 'cancel',     description: 'Cancel queued jobs',              systemProtected: true  },
  { key: 'queue.pause',      resource: 'queue', action: 'pause',      description: 'Pause queue workers',             systemProtected: true  },
  { key: 'queue.dlq.manage', resource: 'queue', action: 'dlq.manage', description: 'Manage dead-letter queue',        systemProtected: true  },
]

// ─── Agent Operations ─────────────────────────────────────────────────────────

const AGENT_PERMISSIONS: PermissionDefinition[] = [
  { key: 'agents.execute',        resource: 'agents', action: 'execute',        description: 'Execute AI agents',                   systemProtected: false },
  { key: 'agents.override',       resource: 'agents', action: 'override',       description: 'Override agent execution parameters', systemProtected: true  },
  { key: 'agents.force-complete', resource: 'agents', action: 'force-complete', description: 'Force-complete stuck executions',      systemProtected: true  },
  { key: 'agents.logs.read',      resource: 'agents', action: 'logs.read',      description: 'Read agent execution logs',            systemProtected: false },
]

// ─── AI Provider Governance ───────────────────────────────────────────────────

const PROVIDER_PERMISSIONS: PermissionDefinition[] = [
  { key: 'providers.read',        resource: 'providers', action: 'read',        description: 'Read provider configurations', systemProtected: false },
  { key: 'providers.update',      resource: 'providers', action: 'update',      description: 'Update provider settings',     systemProtected: true  },
  { key: 'providers.rotate-keys', resource: 'providers', action: 'rotate-keys', description: 'Rotate provider API keys',     systemProtected: true  },
]

// ─── Audit & Security ─────────────────────────────────────────────────────────

const AUDIT_PERMISSIONS: PermissionDefinition[] = [
  { key: 'audit.read',      resource: 'audit',   action: 'read',    description: 'Read audit logs',             systemProtected: false },
  { key: 'audit.export',    resource: 'audit',   action: 'export',  description: 'Export audit logs',           systemProtected: true  },
  { key: 'threats.read',    resource: 'threats', action: 'read',    description: 'View threat events',          systemProtected: false },
  { key: 'threats.resolve', resource: 'threats', action: 'resolve', description: 'Resolve threat events',       systemProtected: true  },
  // Legacy compatibility
  { key: 'audit.manage',    resource: 'audit',   action: 'manage',  description: 'Full audit management',       systemProtected: true  },
  { key: 'security.manage', resource: 'security', action: 'manage', description: 'Manage security settings',    systemProtected: true  },
  { key: 'security.2fa',    resource: 'security', action: '2fa',    description: 'Manage own 2FA settings',     systemProtected: false },
]

// ─── Product Domains ──────────────────────────────────────────────────────────

const PRODUCT_PERMISSIONS: PermissionDefinition[] = [
  { key: 'jobs.read',          resource: 'jobs',       action: 'read',    description: 'Read job records',             systemProtected: false },
  { key: 'jobs.write',         resource: 'jobs',       action: 'write',   description: 'Create/update job records',    systemProtected: false },
  { key: 'jobs.create',        resource: 'jobs',       action: 'create',  description: 'Create job records',           systemProtected: false },
  { key: 'jobs.update',        resource: 'jobs',       action: 'update',  description: 'Update job records',           systemProtected: false },
  { key: 'jobs.delete',        resource: 'jobs',       action: 'delete',  description: 'Delete job records',           systemProtected: false },
  { key: 'jobs.manage',        resource: 'jobs',       action: 'manage',  description: 'Full job management',          systemProtected: false },
  { key: 'profile.read',       resource: 'profile',    action: 'read',    description: 'Read profile data',            systemProtected: false },
  { key: 'profile.write',      resource: 'profile',    action: 'write',   description: 'Update profile data',          systemProtected: false },
  { key: 'documents.read',     resource: 'documents',  action: 'read',    description: 'Read documents',               systemProtected: false },
  { key: 'documents.write',    resource: 'documents',  action: 'write',   description: 'Create/update documents',      systemProtected: false },
  { key: 'interviews.read',    resource: 'interviews', action: 'read',    description: 'Read interview data',          systemProtected: false },
  { key: 'interviews.write',   resource: 'interviews', action: 'write',   description: 'Create/update interviews',     systemProtected: false },
  { key: 'offers.read',        resource: 'offers',     action: 'read',    description: 'Read offer data',              systemProtected: false },
  { key: 'offers.write',       resource: 'offers',     action: 'write',   description: 'Create/update offers',         systemProtected: false },
  { key: 'networking.read',    resource: 'networking', action: 'read',    description: 'Read networking/contact data', systemProtected: false },
  { key: 'networking.write',   resource: 'networking', action: 'write',   description: 'Create/update networking data', systemProtected: false },
  // Legacy keys
  { key: 'api_keys.create',    resource: 'api_keys',   action: 'create',  description: 'Create API keys',              systemProtected: false },
  { key: 'api_keys.read',      resource: 'api_keys',   action: 'read',    description: 'Read API keys',                systemProtected: false },
  { key: 'api_keys.delete',    resource: 'api_keys',   action: 'delete',  description: 'Delete API keys',              systemProtected: false },
  { key: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Manage permission definitions', systemProtected: true  },
  { key: 'roles.manage',       resource: 'roles',       action: 'manage', description: 'Full role management',          systemProtected: true  },
]

// ─── Master Registry ──────────────────────────────────────────────────────────

export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  ...SYSTEM_PERMISSIONS,
  ...RBAC_PERMISSIONS,
  ...USER_PERMISSIONS,
  ...QUEUE_PERMISSIONS,
  ...AGENT_PERMISSIONS,
  ...PROVIDER_PERMISSIONS,
  ...AUDIT_PERMISSIONS,
  ...PRODUCT_PERMISSIONS,
]

export const PERMISSION_KEYS = PERMISSION_REGISTRY.map((p) => p.key)

/** Returns the definition for a given permission key, or undefined. */
export function getPermissionDefinition(key: string): PermissionDefinition | undefined {
  return PERMISSION_REGISTRY.find((p) => p.key === key)
}

/** Wildcard — grants every permission; used exclusively by SUPER_ADMIN. */
export const WILDCARD_PERMISSION = '*'

/** All permissions a standard job-seeker user may hold. */
export const JOB_SEEKER_PERMISSIONS: string[] = [
  'jobs.read', 'jobs.write', 'jobs.create', 'jobs.update', 'jobs.delete',
  'profile.read', 'profile.write',
  'documents.read', 'documents.write',
  'interviews.read', 'interviews.write',
  'offers.read', 'offers.write',
  'networking.read', 'networking.write',
  'agents.execute', 'agents.logs.read',
  'security.2fa',
  'api_keys.create', 'api_keys.read', 'api_keys.delete',
]
