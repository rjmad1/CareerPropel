const prismaMock = {
  job: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },
  jobActivity: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  candidate: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  apiKey: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  loginAttempt: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  sessionActivity: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  permission: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  rolePermission: {
    upsert: jest.fn(),
  },
  userRole: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
}

export { prismaMock }

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}))
