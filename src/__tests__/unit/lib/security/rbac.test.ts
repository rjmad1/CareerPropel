import '../../../__mocks__/prisma'
import { prismaMock } from '../../../__mocks__/prisma'
import {
  DEFAULT_ROLES,
  PERMISSION_MATRIX,
  ROLE_PERMISSIONS,
  getUserRoles,
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUsersWithRole,
  getRoleDetails,
  assignRoleToUser,
  removeRoleFromUser,
} from '@/lib/security/rbac'

describe('RBAC constants', () => {
  it('DEFAULT_ROLES contains admin, recruiter, candidate', () => {
    expect(DEFAULT_ROLES.ADMIN).toBe('admin')
    expect(DEFAULT_ROLES.RECRUITER).toBe('recruiter')
    expect(DEFAULT_ROLES.CANDIDATE).toBe('candidate')
  })

  it('PERMISSION_MATRIX contains expected permissions', () => {
    expect(PERMISSION_MATRIX['jobs.create']).toBeDefined()
    expect(PERMISSION_MATRIX['jobs.read']).toBeDefined()
    expect(PERMISSION_MATRIX['users.manage']).toBeDefined()
    expect(PERMISSION_MATRIX['audit.read']).toBeDefined()
    expect(PERMISSION_MATRIX['roles.manage']).toBeDefined()
  })

  it('admin role has all PERMISSION_MATRIX keys', () => {
    const allKeys = Object.keys(PERMISSION_MATRIX)
    for (const key of allKeys) {
      expect(ROLE_PERMISSIONS.admin).toContain(key)
    }
  })

  it('candidate role has expected permissions', () => {
    expect(ROLE_PERMISSIONS.candidate).toContain('jobs.create')
    expect(ROLE_PERMISSIONS.candidate).toContain('jobs.read')
    expect(ROLE_PERMISSIONS.candidate).not.toContain('users.manage')
    expect(ROLE_PERMISSIONS.candidate).not.toContain('audit.manage')
  })

  it('recruiter role has audit.read', () => {
    expect(ROLE_PERMISSIONS.recruiter).toContain('audit.read')
  })
})

describe('getUserRoles', () => {
  it('returns role names for the user', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      { role: { name: 'admin' } },
      { role: { name: 'candidate' } },
    ] as any)

    const roles = await getUserRoles('user@example.com')
    expect(roles).toEqual(['admin', 'candidate'])
  })

  it('returns empty array on db error', async () => {
    prismaMock.userRole.findMany.mockRejectedValue(new Error('DB error'))
    const roles = await getUserRoles('user@example.com')
    expect(roles).toEqual([])
  })
})

describe('getUserPermissions', () => {
  it('returns deduplicated permission names from all user roles', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      {
        role: {
          permissions: [
            { permission: { name: 'jobs.read' } },
            { permission: { name: 'jobs.create' } },
          ],
        },
      },
      {
        role: {
          permissions: [
            { permission: { name: 'jobs.read' } }, // duplicate
            { permission: { name: 'audit.read' } },
          ],
        },
      },
    ] as any)

    const perms = await getUserPermissions('user@example.com')
    expect(perms).toContain('jobs.read')
    expect(perms).toContain('jobs.create')
    expect(perms).toContain('audit.read')
    expect(perms.filter(p => p === 'jobs.read').length).toBe(1) // deduplicated
  })

  it('returns empty array on error', async () => {
    prismaMock.userRole.findMany.mockRejectedValue(new Error('DB error'))
    const perms = await getUserPermissions('user@example.com')
    expect(perms).toEqual([])
  })
})

describe('hasPermission', () => {
  it('returns true when user has the permission', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      {
        role: {
          permissions: [{ permission: { name: 'jobs.delete' } }],
        },
      },
    ] as any)

    const result = await hasPermission('user@example.com', 'jobs.delete')
    expect(result).toBe(true)
  })

  it('returns false when user does not have the permission', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      {
        role: {
          permissions: [{ permission: { name: 'jobs.read' } }],
        },
      },
    ] as any)

    const result = await hasPermission('user@example.com', 'roles.manage')
    expect(result).toBe(false)
  })

  it('returns false on error', async () => {
    prismaMock.userRole.findMany.mockRejectedValue(new Error('fail'))
    const result = await hasPermission('user@example.com', 'jobs.read')
    expect(result).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('returns true when user has at least one of the given permissions', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      { role: { permissions: [{ permission: { name: 'jobs.read' } }] } },
    ] as any)

    const result = await hasAnyPermission('user@example.com', ['jobs.read', 'users.manage'])
    expect(result).toBe(true)
  })

  it('returns false when user has none of the given permissions', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      { role: { permissions: [{ permission: { name: 'jobs.read' } }] } },
    ] as any)

    const result = await hasAnyPermission('user@example.com', ['users.manage', 'audit.manage'])
    expect(result).toBe(false)
  })
})

describe('hasAllPermissions', () => {
  it('returns true when user has all given permissions', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      {
        role: {
          permissions: [
            { permission: { name: 'jobs.read' } },
            { permission: { name: 'jobs.create' } },
          ],
        },
      },
    ] as any)

    const result = await hasAllPermissions('user@example.com', ['jobs.read', 'jobs.create'])
    expect(result).toBe(true)
  })

  it('returns false when user is missing any permission', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([
      { role: { permissions: [{ permission: { name: 'jobs.read' } }] } },
    ] as any)

    const result = await hasAllPermissions('user@example.com', ['jobs.read', 'users.manage'])
    expect(result).toBe(false)
  })
})

describe('getUsersWithRole', () => {
  it('returns emails of users with the given role', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'admin' } as any)
    prismaMock.userRole.findMany.mockResolvedValue([
      { email: 'admin@example.com' },
      { email: 'admin2@example.com' },
    ] as any)

    const users = await getUsersWithRole('admin')
    expect(users).toEqual(['admin@example.com', 'admin2@example.com'])
  })

  it('returns empty array when role not found', async () => {
    prismaMock.role.findUnique.mockResolvedValue(null)
    const users = await getUsersWithRole('nonexistent')
    expect(users).toEqual([])
  })
})

describe('getRoleDetails', () => {
  it('returns role with permission names', async () => {
    prismaMock.role.findUnique.mockResolvedValue({
      id: 'role-1',
      name: 'admin',
      description: 'Admin role',
      permissions: [
        { permission: { name: 'jobs.read' } },
        { permission: { name: 'jobs.create' } },
      ],
    } as any)

    const details = await getRoleDetails('admin')
    expect(details).not.toBeNull()
    expect(details?.permissions).toContain('jobs.read')
    expect(details?.permissions).toContain('jobs.create')
  })

  it('returns null when role not found', async () => {
    prismaMock.role.findUnique.mockResolvedValue(null)
    const details = await getRoleDetails('nonexistent')
    expect(details).toBeNull()
  })
})

describe('assignRoleToUser', () => {
  it('assigns role and returns true', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'admin' } as any)
    prismaMock.userRole.upsert.mockResolvedValue({} as any)

    const result = await assignRoleToUser('user@example.com', 'admin', 'granter@example.com')
    expect(result).toBe(true)
  })

  it('throws when role not found', async () => {
    prismaMock.role.findUnique.mockResolvedValue(null)
    await expect(assignRoleToUser('user@example.com', 'ghost')).rejects.toThrow('not found')
  })
})

describe('removeRoleFromUser', () => {
  it('removes role and returns true', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'candidate' } as any)
    prismaMock.userRole.delete.mockResolvedValue({} as any)

    const result = await removeRoleFromUser('user@example.com', 'candidate')
    expect(result).toBe(true)
  })

  it('throws when role not found', async () => {
    prismaMock.role.findUnique.mockResolvedValue(null)
    await expect(removeRoleFromUser('user@example.com', 'ghost')).rejects.toThrow('not found')
  })
})
