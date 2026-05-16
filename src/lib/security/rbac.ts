import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define built-in roles and their permissions
export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  CANDIDATE: 'candidate',
}

export const PERMISSION_MATRIX = {
  // Job permissions
  'jobs.create': { resource: 'jobs', action: 'create' },
  'jobs.read': { resource: 'jobs', action: 'read' },
  'jobs.update': { resource: 'jobs', action: 'update' },
  'jobs.delete': { resource: 'jobs', action: 'delete' },
  'jobs.manage': { resource: 'jobs', action: 'manage' },

  // User permissions
  'users.read': { resource: 'users', action: 'read' },
  'users.update': { resource: 'users', action: 'update' },
  'users.delete': { resource: 'users', action: 'delete' },
  'users.manage': { resource: 'users', action: 'manage' },

  // Audit permissions
  'audit.read': { resource: 'audit', action: 'read' },
  'audit.manage': { resource: 'audit', action: 'manage' },

  // Role permissions
  'roles.manage': { resource: 'roles', action: 'manage' },
  'permissions.manage': { resource: 'permissions', action: 'manage' },

  // 2FA permissions
  'security.2fa': { resource: 'security', action: '2fa' },
  'security.manage': { resource: 'security', action: 'manage' },

  // API Key permissions
  'api_keys.create': { resource: 'api_keys', action: 'create' },
  'api_keys.read': { resource: 'api_keys', action: 'read' },
  'api_keys.delete': { resource: 'api_keys', action: 'delete' },
}

// Define role permission mappings
export const ROLE_PERMISSIONS = {
  admin: [
    // Admin has all permissions
    ...Object.keys(PERMISSION_MATRIX),
  ],
  recruiter: [
    'jobs.create',
    'jobs.read',
    'jobs.update',
    'jobs.delete',
    'users.read',
    'audit.read',
    'security.2fa',
    'api_keys.create',
    'api_keys.read',
    'api_keys.delete',
  ],
  candidate: [
    'jobs.create',
    'jobs.read',
    'jobs.update',
    'jobs.delete',
    'security.2fa',
    'api_keys.create',
    'api_keys.read',
    'api_keys.delete',
  ],
}

/**
 * Initialize default roles and permissions in the database
 */
export async function initializeDefaultRoles(): Promise<void> {
  try {
    // Create permissions
    for (const [name, { resource, action }] of Object.entries(PERMISSION_MATRIX)) {
      await prisma.permission.upsert({
        where: { name },
        update: {},
        create: {
          name,
          resource,
          action,
          description: `${action.toUpperCase()} ${resource}`,
        },
      })
    }

    // Create roles with their permissions
    for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
      // Create or get role
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
        },
      })

      // Get all permissions for this role
      const permissions = await prisma.permission.findMany({
        where: { name: { in: permissionNames } },
      })

      // Create role-permission relationships
      for (const permission of permissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        })
      }
    }

    console.log('✅ Default roles and permissions initialized')
  } catch (error) {
    console.error('❌ Error initializing default roles:', error)
    throw error
  }
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
  email: string,
  roleName: string,
  grantedBy?: string
): Promise<boolean> {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      throw new Error(`Role "${roleName}" not found`)
    }

    await prisma.userRole.upsert({
      where: { email_roleId: { email, roleId: role.id } },
      update: { grantedAt: new Date(), grantedBy },
      create: {
        email,
        roleId: role.id,
        grantedBy,
      },
    })

    return true
  } catch (error) {
    console.error('❌ Error assigning role:', error)
    throw error
  }
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(
  email: string,
  roleName: string
): Promise<boolean> {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      throw new Error(`Role "${roleName}" not found`)
    }

    await prisma.userRole.delete({
      where: { email_roleId: { email, roleId: role.id } },
    })

    return true
  } catch (error) {
    console.error('❌ Error removing role:', error)
    throw error
  }
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(email: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { email },
      include: { role: true },
    })

    return userRoles.map((ur) => ur.role.name)
  } catch (error) {
    console.error('❌ Error getting user roles:', error)
    return []
  }
}

/**
 * Get all permissions for a user (via their roles)
 */
export async function getUserPermissions(email: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    })

    const permissionSet = new Set<string>()
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        permissionSet.add(rolePermission.permission.name)
      }
    }

    return Array.from(permissionSet)
  } catch (error) {
    console.error('❌ Error getting user permissions:', error)
    return []
  }
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  email: string,
  permission: string
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(email)
    return permissions.includes(permission)
  } catch (error) {
    console.error('❌ Error checking permission:', error)
    return false
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  email: string,
  permissions: string[]
): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(email)
    return permissions.some((p) => userPermissions.includes(p))
  } catch (error) {
    console.error('❌ Error checking permissions:', error)
    return false
  }
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  email: string,
  permissions: string[]
): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(email)
    return permissions.every((p) => userPermissions.includes(p))
  } catch (error) {
    console.error('❌ Error checking permissions:', error)
    return false
  }
}

/**
 * Get all users with a specific role
 */
export async function getUsersWithRole(roleName: string): Promise<string[]> {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      return []
    }

    const userRoles = await prisma.userRole.findMany({
      where: { roleId: role.id },
    })

    return userRoles.map((ur) => ur.email)
  } catch (error) {
    console.error('❌ Error getting users with role:', error)
    return []
  }
}

/**
 * Get role details with permissions
 */
export async function getRoleDetails(roleName: string) {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    })

    if (!role) {
      return null
    }

    return {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission.name),
    }
  } catch (error) {
    console.error('❌ Error getting role details:', error)
    return null
  }
}
