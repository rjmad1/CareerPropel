import type { IncomingMessage } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import { getToken } from 'next-auth/jwt'
import { prisma } from "@/lib/db"


/**
 * Authenticate WebSocket connections using verified NextAuth JWT from the
 * session cookie. The previous base64(email:id) scheme was unsigned and
 * trivially forgeable — any caller could impersonate any user.
 */
export async function authenticateSocket(socket: Socket): Promise<{
  userId: string
  userEmail: string
  candidateId: string
} | null> {
  try {
    const cookieHeader = socket.handshake.headers.cookie || ''
    // getToken reads req.headers.cookie at runtime; TS types demand full
    // IncomingMessage so we cast through unknown rather than using bare `as any`.
    const mockReq = { headers: { cookie: cookieHeader } } as unknown as IncomingMessage & { cookies: Record<string, string> }
    const jwtToken = await getToken({
      req: mockReq,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!jwtToken?.email || !jwtToken?.sub) {
      return null
    }

    const userEmail = jwtToken.email as string
    const userId = jwtToken.sub

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
  data: unknown
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
  data: unknown
): void {
  io.to(`user:${userEmail}`).emit(eventType, {
    data,
    timestamp: new Date().toISOString()
  })
}
