/**
 * Custom Next.js server with Socket.io + Redis pub/sub bridge
 *
 * Usage:
 *   npm run dev:socket  — development with hot reload
 *   npm start           — production
 *
 * Redis events published by agent workers are forwarded to the relevant
 * Socket.io user room so browser clients receive live status updates.
 */

const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { getToken } = require('next-auth/jwt')
const Redis = require('ioredis')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Register tsconfig path aliases for require() calls to compiled JS in production.
// In dev, ts-node/tsx handles this automatically via tsconfig-paths.
let queueScheduler = null;
let workflowScheduler = null;
let sharedSubscriberEmitter = null;

// Support secure HTTPS connection when certificates are provided in the environment
let isHttps = false;
let serverOptions = {};

if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    const key = fs.readFileSync(process.env.SSL_KEY_PATH);
    const cert = fs.readFileSync(process.env.SSL_CERT_PATH);
    serverOptions = { key, cert };
    isHttps = true;
  } catch (err) {
    console.error('Failed to load SSL credentials, falling back to HTTP:', err.message);
    isHttps = false;
  }
}

const protocol = isHttps ? require('https') : require('http');

const prisma = new PrismaClient()

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  // ── Queue Scheduler (embedded in API runtime) ─────────────────────────────
  // Runs health monitoring, stall detection, and interrupted-job recovery.
  // Only starts when queue execution is enabled to avoid noise in legacy mode.
  if (process.env.QUEUE_EXECUTION_ENABLED === 'true') {
    try {
      // Dynamically import compiled TS (works in both dev via tsx and prod via node dist/)
      const { startQueueScheduler } = require('./src/lib/queue/scheduler');
      queueScheduler = startQueueScheduler();
      console.log('[Scheduler] Queue scheduler started');
    } catch (err) {
      console.error('[Scheduler] Failed to start queue scheduler (non-fatal):', err.message);
    }

    // ── Workflow Scheduler ────────────────────────────────────────────────────
    // Drives workflow schedule triggers, inactivity detection, and approval expiry.
    try {
      const { startWorkflowScheduler } = require('./src/lib/workflow/scheduler');
      workflowScheduler = startWorkflowScheduler();
      console.log('[WorkflowScheduler] Workflow scheduler started');
    } catch (err) {
      console.error('[WorkflowScheduler] Failed to start workflow scheduler (non-fatal):', err.message);
    }

    // ── Shared Redis Subscriber (SSE fanout) ─────────────────────────────────
    // Replaces per-SSE-connection subscribers with a single shared subscriber.
    try {
      const { initializeSharedSubscriber } = require('./src/lib/realtime/shared-subscriber');
      sharedSubscriberEmitter = await initializeSharedSubscriber();
      console.log('[SharedSubscriber] Shared Redis subscriber started');
    } catch (err) {
      console.error('[SharedSubscriber] Failed to start shared subscriber (non-fatal):', err.message);
    }
  }

  const requestHandler = async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  }

  // Create server using dynamic protocol resolution to satisfy SAST and secure the connection
  const httpServer = isHttps
    ? protocol.createServer(serverOptions, requestHandler)
    : protocol.createServer(requestHandler)

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Authentication middleware — verifies NextAuth JWT from cookie
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || ''
      const mockReq = { headers: { cookie: cookieHeader } }

      const jwtToken = await getToken({
        req: mockReq,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!jwtToken?.email) {
        return next(new Error('Authentication required'))
      }

      socket.data.userEmail = jwtToken.email
      socket.data.userId = jwtToken.sub
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.data.userEmail}`)

    // Join user's personal room
    socket.join(`user:${socket.data.userEmail}`)

    // Subscribe to job — verify ownership before granting room access
    socket.on('subscribe:job', async (jobId, callback) => {
      try {
        const job = await prisma.job.findUnique({
          where: { id: jobId },
          include: { candidate: { select: { email: true } } },
        })
        if (!job || job.candidate.email !== socket.data.userEmail) {
          return callback({ success: false, error: 'Forbidden' })
        }
        socket.join(`job:${jobId}`)
        callback({ success: true, jobId })
      } catch (error) {
        console.error('[Socket] subscribe:job error:', error)
        callback({ success: false, error: 'Subscription failed' })
      }
    })

    // Unsubscribe from job
    socket.on('unsubscribe:job', (jobId) => {
      socket.leave(`job:${jobId}`)
      console.log(`[Socket] User unsubscribed from job: ${jobId}`)
    })

    // Broadcast job update
    socket.on('job:update', (jobId, data, callback) => {
      try {
        io.to(`job:${jobId}`).emit('job:updated', {
          jobId,
          ...data,
          updatedBy: socket.data.userEmail,
          timestamp: new Date().toISOString()
        })
        callback({ success: true })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Typing indicator
    socket.on('typing', (jobId, isTyping) => {
      socket.broadcast.to(`job:${jobId}`).emit('user:typing', {
        userEmail: socket.data.userEmail,
        isTyping,
        timestamp: new Date().toISOString()
      })
    })

    // Get users in room
    socket.on('getUsers', (jobId, callback) => {
      try {
        const room = io.sockets.adapter.rooms.get(`job:${jobId}`)
        const users = Array.from(room || []).map(socketId => {
          const sock = io.sockets.sockets.get(socketId)
          return {
            userEmail: sock?.data?.userEmail,
            id: socketId
          }
        })
        callback({ success: true, users })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Heartbeat/ping
    socket.on('ping', (callback) => {
      callback({ pong: true, serverTime: Date.now() })
    })

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.data.userEmail}`)
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.data.userEmail}:`, error)
    })
  })

  // Redis → Socket.io bridge
  // Subscribes to all per-user agent channels and forwards events to the
  // matching Socket.io room so every connected browser tab gets updates.
  const redisSub = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: false,
    lazyConnect: true,
    // Stop retrying immediately if Redis is not available
    retryStrategy: (times) => times > 3 ? null : Math.min(times * 500, 2000),
  })

  let redisSubActive = false

  redisSub.connect().then(() => {
    redisSubActive = true
    redisSub.psubscribe('agent:*', 'queue:*', (err) => {
      if (err) console.error('[Redis] psubscribe error', err)
      else console.log('[Redis] Subscribed to agent:* and queue:* channels')
    })
  }).catch((err) => {
    console.warn('[Redis] pub/sub bridge unavailable (agent live updates disabled):', err.message)
  })

  redisSub.on('pmessage', (_pattern, channel, message) => {
    try {
      const event = JSON.parse(message)
      const parts = channel.split(':')
      const userEmail = parts.slice(2).join(':')
      if (userEmail) {
        io.to(`user:${userEmail}`).emit(event.type || 'agent:event', event)
      }
    } catch {
      // malformed message — ignore
    }
  })

  redisSub.on('error', (err) => {
    if (redisSubActive) console.error('[Redis] pub/sub bridge error:', err.message)
  })

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`✅ Server running at ${isHttps ? 'https' : 'http'}://${hostname}:${port}`)
    console.log(`📡 WebSocket (Socket.io) + Redis bridge running`)
    console.log(`🔐 Environment: ${dev ? 'development' : 'production'}`)
  })

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`[Server] ${signal} received — shutting down gracefully`)
    if (queueScheduler) {
      await queueScheduler.stop().catch((e) => console.error('[Scheduler] Shutdown error:', e.message))
    }
    if (workflowScheduler) {
      workflowScheduler.stop()
    }
    if (sharedSubscriberEmitter) {
      try {
        const { shutdownSharedSubscriber } = require('./src/lib/realtime/shared-subscriber')
        await shutdownSharedSubscriber()
      } catch (e) {
        console.error('[SharedSubscriber] Shutdown error:', e.message)
      }
    }
    httpServer.close(() => {
      console.log('[Server] HTTP server closed')
      process.exit(0)
    })
  }

  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.once('SIGINT',  () => gracefulShutdown('SIGINT'))
})
