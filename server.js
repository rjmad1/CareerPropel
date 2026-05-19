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

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { getToken } = require('next-auth/jwt')
const Redis = require('ioredis')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

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

    // Subscribe to job
    socket.on('subscribe:job', async (jobId, callback) => {
      try {
        // In production, verify user owns this job
        socket.join(`job:${jobId}`)
        callback({ success: true, jobId })
        console.log(`[Socket] User subscribed to job: ${jobId}`)
      } catch (error) {
        callback({ success: false, error: error.message })
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
  })

  redisSub.connect().then(() => {
    // Use pattern subscribe to catch all per-user channels
    redisSub.psubscribe('agent:*', 'queue:*', (err) => {
      if (err) console.error('[Redis] psubscribe error', err)
      else console.log('[Redis] Subscribed to agent:* and queue:* channels')
    })
  }).catch((err) => {
    console.warn('[Redis] Could not connect for pub/sub bridge:', err.message)
  })

  redisSub.on('pmessage', (_pattern, channel, message) => {
    try {
      const event = JSON.parse(message)
      // Channels follow the pattern: agent:status:<userEmail> etc.
      const parts = channel.split(':')
      // userEmail is always the third segment in our REDIS_CHANNELS convention
      const userEmail = parts.slice(2).join(':')
      if (userEmail) {
        io.to(`user:${userEmail}`).emit(event.type || 'agent:event', event)
      }
    } catch {
      // malformed message — ignore
    }
  })

  redisSub.on('error', (err) => {
    console.error('[Redis] pub/sub bridge error:', err.message)
  })

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`✅ Server running at http://${hostname}:${port}`)
    console.log(`📡 WebSocket (Socket.io) + Redis bridge running`)
    console.log(`🔐 Environment: ${dev ? 'development' : 'production'}`)
  })
})
