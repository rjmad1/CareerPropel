import { Server as SocketServer, Socket } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Authenticate WebSocket connections
 * Extracts and validates the auth token from socket handshake
 */
export async function authenticateSocket(socket: Socket): Promise<{
  userId: string
  userEmail: string
  candidateId: string
} | null> {
  try {
    // Get token from socket handshake query or headers
    const token =
      (socket.handshake.query.token as string) ||
      socket.handshake.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    // Decode JWT token (in production, verify with your secret)
    // For now, expect token format: base64(email:id)
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userEmail, userId] = decoded.split(':')

    if (!userEmail || !userId) {
      return null
    }

    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail }
    })

    if (!candidate) {
      return null
    }

    return {
      userId,
      userEmail,
      candidateId: candidate.id
    }
  } catch (error) {
    console.error('Socket auth error:', error)
    return null
  }
}

/**
 * Middleware to enforce authentication on socket connections
 */
export function createAuthMiddleware() {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const auth = await authenticateSocket(socket)

      if (!auth) {
        return next(new Error('Unauthorized'))
      }

      // Attach auth info to socket
      socket.data.userId = auth.userId
      socket.data.userEmail = auth.userEmail
      socket.data.candidateId = auth.candidateId

      next()
    } catch (error) {
      next(error as Error)
    }
  }
}

/**
 * Check if user has access to a job via WebSocket
 */
export async function canAccessJob(userEmail: string, jobId: string): Promise<boolean> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { candidate: true }
    })

    if (!job) {
      return false
    }

    return job.candidate.email === userEmail
  } catch (error) {
    console.error('Job access check error:', error)
    return false
  }
}

/**
 * Verify socket has required permissions
 */
export function requireSocketAuth(
  socket: Socket,
  next: (err?: Error) => void
): boolean {
  if (!socket.data.userId || !socket.data.userEmail) {
    next(new Error('Authentication required'))
    return false
  }

  return true
}

/**
 * Join user to their personal room
 * Allows sending messages to specific users
 */
export function joinUserRoom(socket: Socket): void {
  if (socket.data.userEmail) {
    socket.join(`user:${socket.data.userEmail}`)
  }
}

/**
 * Join job room for real-time updates
 * Allows broadcasting updates to users watching a job
 */
export async function joinJobRoom(socket: Socket, jobId: string): Promise<boolean> {
  const hasAccess = await canAccessJob(socket.data.userEmail, jobId)

  if (!hasAccess) {
    return false
  }

  socket.join(`job:${jobId}`)
  return true
}

/**
 * Broadcast job update to all users watching it
 */
export function broadcastJobUpdate(
  io: SocketServer,
  jobId: string,
  eventType: string,
  data: any
): void {
  io.to(`job:${jobId}`).emit('job:update', {
    jobId,
    eventType,
    data,
    timestamp: new Date().toISOString()
  })
}

/**
 * Send message to specific user
 */
export function sendUserMessage(
  io: SocketServer,
  userEmail: string,
  eventType: string,
  data: any
): void {
  io.to(`user:${userEmail}`).emit(eventType, {
    data,
    timestamp: new Date().toISOString()
  })
}
